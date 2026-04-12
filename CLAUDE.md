# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mebble Resume Optimizer is a full-stack web app: a **Flask** REST API backend + **Next.js 16 / TypeScript / React 19 / Tailwind v4** frontend. Users upload a PDF resume and a job description; the app parses, analyzes, scores the resume for ATS compatibility, and can also build a resume from scratch.

---

## Development Commands

### Backend (Flask)

```bash
cd backend
# First-time setup
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run dev server (http://localhost:5000)
flask run --debug
```

### Frontend (Next.js)

```bash
cd frontend-next
npm install          # first-time setup
npm run dev          # dev server at http://localhost:3000
npm run build        # production build
npm run lint         # ESLint check
```

Both servers must run simultaneously. Next.js rewrites all `/api/*` requests to `http://localhost:5000/api/*` via `next.config.ts`.

---

## Architecture

### Request Flow

```
User → Next.js UI (port 3000)
         → POST /api/analyze (PDF + JD text)
              → Flask (port 5000)
                   → ResumeParser (extract sections from PDF)
                   → KeywordAnalyzer (n-gram + tech-term matching)
                   → ActionWordsAnalyzer (verb strength check)
                   → ATSCalculator (score = matched/total_jd × 100)
                   → ReportGenerator (markdown output)
              ← JSON response with score, keywords, suggestions
         ← Optimizer page renders ATS gauge, keyword pills, action words
```

### Backend (`backend/`)

- **`app.py`** — Flask entry point. Seven endpoints:
  - `GET  /api/health`
  - `POST /api/parse` — PDF → structured sections list
  - `POST /api/extract-jd` — PDF / DOCX / TXT file → plain text
  - `POST /api/analyze` — PDF + JD text → ATS score, keywords, action words
  - `POST /api/optimize-section` — single section content + missing keywords → optimized text
  - `POST /api/optimize-all` — all sections + missing keywords → bulk optimized results (distributes keywords without repetition)
  - `POST /api/report` — analysis result → markdown blob download
- **`config.py`** — Central constants: `MAX_FILE_SIZE` (5MB), `MAX_JD_LENGTH` (10k chars), `ALLOWED_EXTENSIONS`, `SCORE_THRESHOLDS`, `CORS_ORIGINS`.
- **`services/`** — One class per concern; all stateless:
  - `resume_parser.py` — PDF extraction via pdfplumber (layout-aware). Full section detection via a 50+ header variant registry (`SECTION_HEADER_MAP`). Outputs section dicts with `id`, `type`, `heading`, `content`, `optimizable`. Also extracts name + contact block as a `header` section.
  - `keyword_analyzer.py` — Two-pass extraction: (1) 3→2→1-gram taxonomy matching against `data/keywords_patterns.py`; (2) secondary regex scan for compound tech terms (e.g. `Node.js`, `C#`) and ALL-CAPS acronyms (e.g. `REST`, `API`) not in the taxonomy. Detects domain (software_engineering, data_analytics, etc.).
  - `action_words_analyzer.py` — Pulls bullets from the experience section, checks first verbs against `data/action_words.py`, flags weak verbs, suggests alternatives.
  - `ats_calculator.py` — Pure math: `score = (matched / total_jd_keywords) × 100`. Thresholds: Excellent ≥90, Great ≥75, Good ≥50, Poor <50.
  - `report_generator.py` — Renders a markdown report from analysis results.
  - `section_optimizer.py` — Heuristic verb strengthening (`VERB_UPGRADES` map) + keyword injection. Supports single-section and bulk (`optimize_all`) optimization with cross-section keyword deduplication. Has domain-specific `SUMMARY_CLOSERS` templates.
- **`data/`** — Static Python modules (not databases): `stop_words.py`, `action_words.py`, `keywords_patterns.py` (~3000+ keywords organized by domain, including a `general` cross-domain bucket added in latest update).
- **`utils/text_processing.py`** — Text cleaning, tokenization, stopword removal.

### Frontend (`frontend/src/`)

- **Stack:** Next.js 16 (App Router), TypeScript, React 19, Tailwind CSS v4, Axios, Zod, Lucide React, Geist font.
- **`app/layout.tsx`** — Root layout with Geist font loading.
- **`app/page.tsx`** — Landing page: hero, feature cards, CTAs to `/builder` and `/optimize`.
- **`app/builder/page.tsx`** — Resume builder. 3-panel layout (sidebar / section editors / live preview). Exports resume to PDF via `POST /api/resume/export-pdf`.
- **`app/optimize/page.tsx`** — ATS optimizer. PDF upload + JD input → analysis results (ARC gauge, keyword pills, action words, download report).
- **`components/builder/`** — `ResumePreview.tsx` (live render), section editor components: `PersonalInfoSection`, `SummarySection`, `ExperienceSection`, `EducationSection`, `SkillsSection`.
- **`components/optimizer/`** — `ArcGauge.tsx` (score visualization), `KeywordPills.tsx` (matched/missing keywords).
- **`components/ui/`** — `Button`, `Card`, `Input`, `Loader`, `MebbleLogo`.
- **`lib/api.ts`** — Axios client. Base URL `/api` (rewritten to Flask by Next.js). All file uploads use `FormData`.
- **`lib/schemas/resume.ts`** — Zod schemas for the full `Resume` type. TypeScript types inferred via `z.infer`. Includes `EMPTY_RESUME` constant for initial state.

State management is plain React hooks (`useState`, `useCallback`) — no Redux, Zustand, or Context.

### Key Configuration

| Setting | Value | Location |
|---|---|---|
| Backend port | 5000 | `flask run` default |
| Frontend port | 3000 | Next.js default |
| API proxy | `/api/* → localhost:5000/api/*` | `frontend/next.config.ts` |
| CORS origin | `http://localhost:3000` | `backend/config.py` (update if needed) |
| Max file size | 5 MB | `backend/config.py` |
| Max JD length | 10,000 chars | `backend/config.py` |
| TS path alias | `@/*` → `src/*` | `frontend/tsconfig.json` |

---

## Extending the Keyword Taxonomy

All keyword matching is driven by `backend/data/keywords_patterns.py`. To add a new domain or keywords:
1. Add entries to `DOMAIN_KEYWORDS` under the relevant domain key (or create a new one).
2. Ensure new entries also appear in `ALL_PROFESSIONAL_KEYWORDS` (the flat set used for O(1) lookup).
3. The `general` domain covers cross-domain soft skills, productivity tools, and universal professional credentials.

## Adding New API Endpoints

1. Add a route in `backend/app.py` following the existing pattern (validate input, call a service, return `jsonify`).
2. Add a corresponding function in `frontend/src/lib/api.ts`.
3. Update `backend/config.py` for any new config constants.

## Adding New Frontend Pages

Next.js App Router: create `app/<route>/page.tsx`. The route is automatically available. Shared UI goes in `components/ui/`, feature-specific components go in `components/<feature>/`.
