# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mebble Resume Optimizer: Flask REST API + Next.js 16 (TypeScript) frontend. Users upload a PDF resume and job description to get ATS compatibility scoring, keyword gap analysis, and section-level optimization. A separate `/builder` route lets users construct a resume from scratch.

---

## Development Commands

### Backend
```bash
cd backend
source venv/Scripts/activate   # Windows
flask run --debug               # http://localhost:5000
```

### Frontend
```bash
cd frontend
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

Both servers must run simultaneously. Next.js rewrites `/api/*` → `http://localhost:5000/api/*` via `frontend/next.config.ts`.

No test suite exists yet.

---

## Architecture

### How a request flows

```
Next.js (3000) → POST /api/analyze (PDF + JD text)
  → Flask (5000)
      → ResumeParser     extract PDF text, detect sections
      → KeywordAnalyzer  two-pass: taxonomy n-grams + regex tech terms
      → ActionWordsAnalyzer  flag weak verbs, suggest replacements
      → ATSCalculator    score = matched / total_jd_keywords × 100
      → ReportGenerator  markdown blob
  ← JSON: { ats_score, matched_keywords, missing_keywords, action_words, ... }
```

### Backend (`backend/`)

All services are stateless classes instantiated once at startup in `app.py`.

**Endpoints in `app.py`:**
| Route | Purpose |
|---|---|
| `GET /api/health` | Liveness check |
| `POST /api/parse` | PDF → structured sections list |
| `POST /api/extract-jd` | PDF / DOCX / TXT file upload → plain text |
| `POST /api/analyze` | PDF + JD text → full ATS analysis |
| `POST /api/optimize-section` | Single section + missing keywords → optimized text |
| `POST /api/optimize-all` | All sections + missing keywords → bulk optimize (no cross-section keyword repetition) |
| `POST /api/report` | Analysis result → markdown download |

**Not yet implemented:** `POST /api/resume/export-pdf` — called by `exportResumePDF()` in `lib/api.ts` but has no backend handler.

**Key service internals:**

- `resume_parser.py` — pdfplumber with `layout=True`. Section detection uses `SECTION_HEADER_MAP` (50+ header variants → canonical type). Outputs section dicts: `{id, type, heading, content, optimizable}`. The `header` section is always first and contains `name` + `content` (contact line).

- `keyword_analyzer.py` — Pass 1: clean text → 3→2→1-gram candidates matched against `ALL_PROFESSIONAL_KEYWORDS` (flat `frozenset` in `data/keywords_patterns.py`). Pass 2: regex scan on raw text for compound terms (`Node.js`, `C#`) and 3–6-char ALL-CAPS acronyms (`REST`, `API`) missed by the taxonomy. Domain detection uses `DOMAIN_KEYWORDS` groupings.

- `section_optimizer.py` — `VERB_UPGRADES` dict for heuristic verb strengthening. `optimize_all()` distributes missing keywords across sections without repeating any keyword. `SUMMARY_CLOSERS` provides domain-specific closing sentences.

- `data/keywords_patterns.py` — ~3000+ keywords. `DOMAIN_KEYWORDS` groups by domain (including `general` for cross-domain soft skills/tools). `ALL_PROFESSIONAL_KEYWORDS` is the flat union used at match time.

### Frontend (`frontend/src/`)

Stack: Next.js 16 App Router, TypeScript, React 19, Tailwind v4, Zod, Axios, Lucide React, Geist font.

**Routes:**
- `/` — Landing page
- `/builder` — 3-panel resume builder (sidebar / section editors / live `ResumePreview`)
- `/optimize` — PDF upload + JD analysis → ArcGauge score, KeywordPills, action word suggestions

**Data layer:**
- `lib/schemas/resume.ts` — Single source of truth for all types. All types are `z.infer<typeof Schema>`. `EMPTY_RESUME` is the initial builder state. Schemas exist for `Certification` and `Project` but these sections have no editor components or preview rendering yet.
- `lib/api.ts` — All backend calls. File uploads use `FormData`. PDF downloads use `responseType: 'blob'`.

State is local `useState` per page — no global store.

### Builder page architecture (`app/builder/page.tsx`)

The builder has three columns: left sidebar (logo + JD paste), center (live `ResumePreview`), right panel (section cards, 340px wide).

**`SectionCard` component** — collapsible card with:
- CSS `grid-template-rows: 0fr ↔ 1fr` for smooth accordion animation (no conditional rendering)
- `GripVertical` handle → pointer-event drag-to-reorder sections
- `ChevronDown` chevron, optional "Add X" action button (visible only when open)
- `ghost` prop makes the card invisible while its floating clone is being dragged

**Drag-to-reorder** uses pointer events (not HTML5 drag API): `onPointerDown` on the grip sets `dragState`, then `window` listeners for `pointermove`/`pointerup` run in a `useEffect`. A `DropPlaceholder` (dashed border) fills the target slot; a fixed-position floating clone follows the cursor. `computeHoverIndex` uses a 12px Y-axis offset on each card's midpoint.

**Section components** accept a `hideAddButton` prop — when `true`, the "Add X" button is suppressed (the parent `SectionCard` header renders it instead). `ExperienceSection` has its own inner accordion (one entry open at a time) with sort buttons ("Newest first" / "Oldest first") powered by `parseJobDate()`.

### UI styling convention

All builder and section components use **inline `React.CSSProperties` styles only** — no Tailwind classes. Tailwind is used only in `app/layout.tsx` and the landing/optimize pages. Do not introduce Tailwind utility classes into builder components.

### Key constants

| Setting | Value | File |
|---|---|---|
| Backend port | 5000 | `flask run` default |
| Frontend port | 3000 | Next.js default |
| CORS origin | `http://localhost:3000` | `backend/config.py` |
| Max upload | 5 MB | `backend/config.py` |
| Max JD length | 10,000 chars | `backend/config.py` |
| TS path alias | `@/*` → `src/*` | `frontend/tsconfig.json` |

---

## Important: Next.js 16 Breaking Changes

This project uses Next.js 16, which has breaking changes from versions in most training data. **Before writing any Next.js code, read the relevant guide in `frontend/node_modules/next/dist/docs/`.** APIs, conventions, and file structure may differ from what you expect.

---

## Extending the Keyword Taxonomy

Add to `DOMAIN_KEYWORDS` in `backend/data/keywords_patterns.py`, then ensure entries also appear in `ALL_PROFESSIONAL_KEYWORDS` (the flat set used for O(1) lookup). The `general` domain covers cross-domain soft skills and productivity tools.

## Adding New API Endpoints

1. Route in `backend/app.py` → validate input → call service → `return jsonify(...)`.
2. Corresponding function in `frontend/src/lib/api.ts`.
3. New config constants go in `backend/config.py`.

## Adding New Frontend Pages / Sections

New page: `frontend/src/app/<route>/page.tsx` — automatically routed by Next.js.

New resume section type: add a Zod schema entry in `lib/schemas/resume.ts`, a section editor component under `components/builder/sections/`, wire it into `BuilderPage` (`renderCard` switch + `DEFAULT_ORDER`), and add rendering to `ResumePreview`. Follow the `hideAddButton` pattern — the "Add X" button lives in the `SectionCard` header, not inside the section component.
