# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mebble Resume Optimizer is a full-stack web app: a **Flask** REST API backend + **React/Vite/Tailwind** frontend. Users upload a PDF resume and a job description; the app parses, analyzes, and scores the resume for ATS compatibility.

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

### Frontend (React/Vite)

```bash
cd frontend
npm install          # first-time setup
npm run dev          # dev server at http://localhost:5173
npm run build        # production build → frontend/dist/
npm run lint         # ESLint check
npm run preview      # preview production build locally
```

Both servers must run simultaneously. The Vite dev server proxies all `/api/*` requests to `http://localhost:5000`.

---

## Architecture

### Request Flow

```
User → React UI (port 5173)
         → POST /api/analyze (PDF + JD text)
              → Flask (port 5000)
                   → ResumeParser (extract sections from PDF)
                   → KeywordAnalyzer (n-gram matching against taxonomy)
                   → ActionWordsAnalyzer (verb strength check)
                   → ATSCalculator (score = matched/total_jd × 100)
                   → ReportGenerator (markdown output)
              ← JSON response with score, keywords, suggestions
         ← ResultsTab renders ATS gauge, keyword pills, action words
```

### Backend (`backend/`)

- **`app.py`** — Flask entry point. Six endpoints: `GET /api/health`, `POST /api/parse`, `POST /api/extract-jd`, `POST /api/analyze`, `POST /api/report`, `POST /api/optimize-section`.
- **`config.py`** — Central constants: `MAX_FILE_SIZE` (5MB), `MAX_JD_LENGTH` (10k chars), `ALLOWED_EXTENSIONS`, `SCORE_THRESHOLDS`, `CORS_ORIGINS`.
- **`services/`** — One class per concern; all stateless:
  - `resume_parser.py` — PDF extraction (pdfplumber + PyPDF2 fallback) + section detection via a 50+ header variant registry. Outputs a list of section dicts with `id`, `type`, `heading`, `content`, `optimizable`.
  - `keyword_analyzer.py` — Builds 3-gram → 2-gram → 1-gram candidates, matches against the taxonomy in `data/keywords_patterns.py`. Also detects domain (software_engineering, data_analytics, etc.).
  - `action_words_analyzer.py` — Pulls bullets from the experience section, checks first verbs against `data/action_words.py`, flags weak verbs, suggests alternatives.
  - `ats_calculator.py` — Pure math: `score = (matched / total_jd_keywords) × 100`. Thresholds: Excellent ≥90, Great ≥75, Good ≥50, Poor <50.
  - `report_generator.py` — Renders a markdown report from analysis results.
  - `section_optimizer.py` — Heuristic verb strengthening + keyword injection for `professional_summary` and `experience` sections.
- **`data/`** — Static Python modules (not databases): `stop_words.py`, `action_words.py`, `keywords_patterns.py` (~3000+ keywords organized by domain).
- **`utils/text_processing.py`** — Text cleaning, tokenization, stopword removal.

### Frontend (`frontend/src/`)

- **`App.jsx`** — Root; owns `file`, `analysisResult`, and `parsedSections` state. Switches between `UploadScreen` and `WorkspaceLayout`.
- **`services/api.js`** — Axios wrapper for all backend calls. All file uploads use `FormData`.
- **`hooks/`** — `useFileUpload`, `useAnalysis`, `useResumeParser` isolate side effects from components.
- **`components/upload/`** — Drag-and-drop PDF uploader.
- **`components/workspace/`** — `WorkspaceLayout` (3-panel: ResumeEditor | JobDescriptionTab | ResultsTab).
- **`components/analysis/`** — `ATSScoreDisplay` (arc gauge), `KeywordMatch` (colored pills), `ActionWordsDisplay` (suggestions table).
- **`components/common/`** — `Button`, `Card`, `Loader`, `Input`.

State management is plain React hooks (`useState`, `useCallback`, `useEffect`) — no Redux or Context.

### Key Configuration

| Setting | Value | Location |
|---|---|---|
| Backend port | 5000 | `flask run` default |
| Frontend port | 5173 | `vite.config.js` |
| API proxy | `/api → localhost:5000` | `vite.config.js` |
| CORS origin | `http://localhost:5173` | `backend/config.py` |
| Max file size | 5 MB | `backend/config.py`, `frontend/src/utils/validators.js` |
| Max JD length | 10,000 chars | same as above |

---

## Extending the Keyword Taxonomy

All keyword matching is driven by `backend/data/keywords_patterns.py`. To add a new domain or keywords, add entries to `ALL_PROFESSIONAL_KEYWORDS` and create a domain entry in the domain-grouping dict used by `keyword_analyzer.py`.

## Adding New API Endpoints

1. Add a route in `backend/app.py` following the existing pattern (validate input, call a service, return `jsonify`).
2. Add a corresponding function in `frontend/src/services/api.js`.
3. Update `backend/config.py` for any new config constants.
