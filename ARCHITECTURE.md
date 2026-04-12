# Resume Optimizer - Detailed Architecture Document

## 1. High-Level Architecture Overview

Resume Optimizer follows a client-server architecture with the following layers:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                               │
│                         (React Frontend)                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Landing   │  │   Upload    │  │  Analysis   │  │   Report    │       │
│  │   Page      │  │   View      │  │   Results   │  │   View      │       │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘       │
└────────────────────────────────┬──────────────────────────────────────────┘
                                 │ HTTP/JSON
┌────────────────────────────────▼──────────────────────────────────────────┐
│                           API LAYER                                        │
│                         (Flask REST API)                                   │
│  ┌──────────────────────────────────────────────────────────────────┐     │
│  │                     API Endpoints                                │     │
│  │   POST /api/analyze   │   GET /api/health   │   POST /api/parse  │     │
│  └──────────────────────────────────────────────────────────────────┘     │
└────────────────────────────────┬──────────────────────────────────────────┘
                                 │
┌────────────────────────────────▼──────────────────────────────────────────┐
│                           PROCESSING LAYER                                │
│                         (Analysis Engines)                                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│  │   Resume        │  │   Keyword       │  │   Action Words  │         │
│  │   Parser        │  │   Analyzer      │  │   Analyzer      │         │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘         │
│  ┌──────────────────┐  ┌──────────────────┐                               │
│  │   ATS           │  │   Report        │                               │
│  │   Calculator    │  │   Generator     │                               │
│  └──────────────────┘  └──────────────────┘                               │
└────────────────────────────────┬──────────────────────────────────────────┘
                                 │
┌────────────────────────────────▼──────────────────────────────────────────┐
│                           DATA LAYER                                       │
│                         (In-Memory Processing)                            │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│  │   Stop Words    │  │   Action Words  │  │   Keyword       │         │
│  │   Repository    │  │   Repository    │  │   Patterns      │         │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. System Components

### 2.1 Frontend Components

| Component | File | Responsibility |
|-----------|------|----------------|
| Root Layout | `app/layout.tsx` | Geist font, global styles |
| Landing Page | `app/page.tsx` | Hero, feature cards, CTAs |
| Builder Page | `app/builder/page.tsx` | Resume builder (3-panel) |
| Optimizer Page | `app/optimize/page.tsx` | ATS optimizer, PDF upload, results |
| ResumePreview | `components/builder/ResumePreview.tsx` | Live resume render |
| Section Editors | `components/builder/sections/` | PersonalInfo, Summary, Experience, Education, Skills |
| ArcGauge | `components/optimizer/ArcGauge.tsx` | ATS score visualization |
| KeywordPills | `components/optimizer/KeywordPills.tsx` | Matched/missing keywords |
| Button | `components/ui/Button.tsx` | Reusable button with variants |
| Loader | `components/ui/Loader.tsx` | Loading spinner |
| MebbleLogo | `components/ui/MebbleLogo.tsx` | SVG logo |

### 2.2 Backend Services

| Service | File | Responsibility |
|---------|------|----------------|
| Flask App | `app.py` | Main application, routing |
| Resume Parser | `services/resume_parser.py` | PDF text extraction |
| Keyword Analyzer | `services/keyword_analyzer.py` | Keyword extraction/matching |
| Action Words Analyzer | `services/action_words_analyzer.py` | Action words analysis |
| ATS Calculator | `services/ats_calculator.py` | Score computation |
| Report Generator | `services/report_generator.py` | Report text generation |

---

## 3. Data Flow Diagrams

### 3.1 Main Analysis Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │     │   Frontend  │     │   Backend   │     │   Analysis │
│   Uploads   │ ──> │   Validates │ ──> │   Receives  │ ──> │   Pipeline  │
│   PDF       │     │   & Sends   │     │   Request   │     │   Processes │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                    │
                                                                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │     │   Frontend  │     │   Backend   │     │   Analysis │
│   Downloads │ <─  │   Displays  │ <─  │   Returns   │ <─  │   Pipeline  │
│   Report    │     │   Results   │     │   JSON      │     │   Completes │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### 3.2 Keyword Analysis Detail

```
┌──────────────────┐
│   Job Description│
│   Text Input     │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│           PREPROCESSING                  │
│  1. Lowercase conversion                │
│  2. Remove special characters           │
│  3. Tokenize into words                 │
│  4. Remove stop words                   │
│  5. Extract noun phrases                │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│          KEYWORD EXTRACTION              │
│  - Technical terms (skills, tools)      │
│  - Job-specific vocabulary               │
│  - Qualification keywords                │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│          KEYWORD COMPARISON              │
│  ┌───────────────┐   ┌───────────────┐  │
│  │ Resume        │   │ JD            │  │
│  │ Keywords      │   │ Keywords      │  │
│  └───────┬───────┘   └───────┬───────┘  │
│          │                   │           │
│          └─────────┬─────────┘           │
│                    ▼                     │
│          ┌─────────────────────┐         │
│          │  Set Comparison     │         │
│          │  - Matched          │         │
│          │  - Missing          │         │
│          │  - Extra            │         │
│          └─────────────────────┘         │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│          OUTPUT                          │
│  - matched_keywords: []                  │
│  - missing_keywords: []                  │
│  - extra_keywords: []                     │
└─────────────────────────────────────────┘
```

### 3.3 Action Words Analysis Detail

```
┌──────────────────┐
│   Resume Text    │
│   (Experience    │
│    Section)      │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│          SECTION EXTRACTION              │
│  Identify experience/work history       │
│  sections by pattern matching            │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│          VERB EXTRACTION                 │
│  Use POS tagging to identify verbs      │
│  in past tense / imperative form         │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│          COMPARISON                      │
│  Compare against action words database  │
│  Flag weak/overused words                │
│  Suggest stronger alternatives           │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│          OUTPUT                          │
│  - found_action_words: []               │
│  - suggestions: [{current, suggested}]  │
└─────────────────────────────────────────┘
```

---

## 4. Component Interaction Sequence

### 4.1 Full Analysis Sequence

```
┌────────┐    ┌────────────┐    ┌─────────┐    ┌──────────┐    ┌────────┐
│ Client │    │  Flask     │    │ Resume  │    │ Keyword  │    │ Report │
│        │    │  API       │    │ Parser  │    │ Analyzer │    │ Gen    │
└───┬────┘    └─────┬──────┘    └────┬────┘    └────┬─────┘    └───┬────┘
    │               │                │              │              │
    │ POST /analyze│                │              │              │
    │─────────────>>│               │              │              │
    │               │              │              │              │
    │               │ parse_pdf()  │              │              │
    │               │──────────────>>              │              │
    │               │              │              │              │
    │               │              <<─────────────│              │
    │               │              │  resume_text │              │
    │               │              │              │              │
    │               │              │ analyze_keywords()
    │               │              │───────────────>>              │
    │               │              │              │              │
    │               │              <<─────────────│ keywords     │
    │               │              │              │              │
    │               │              │ analyze_action_words()
    │               │              │───────────────>>              │
    │               │              │              │              │
    │               │              <<─────────────│ action_words │
    │               │              │              │              │
    │               │              │ calculate_ats_score()
    │               │              │───────────────>>              │
    │               │              │              │              │
    │               │              <<─────────────│ ats_score    │
    │               │              │              │              │
    │               │              │ generate_report()
    │               │              │───────────────>>              │
    │               │              │              │              │
    │               │              <<─────────────│ report       │
    │               │              │              │              │
    │               │   Response JSON              │              │
    │<<─────────────│─────────────│───────────────│──────────────│
    │               │              │              │              │
```

---

## 5. Data Models

### 5.1 API Request Model

```typescript
interface AnalyzeRequest {
  resume_text: string;      // Extracted PDF text
  job_description: string;  // User-provided JD text
}
```

### 5.2 API Response Model

```typescript
interface AnalyzeResponse {
  success: boolean;
  data?: {
    ats_score: number;           // 0-100
    score_category: string;      // "Poor" | "Good" | "Great" | "Excellent"
    matched_keywords: string[]; // Keywords in both
    missing_keywords: string[];  // In JD, not resume
    action_words_analysis: {
      found: string[];           // Action words found
      suggestions: {
        current: string;
        suggested: string;
      }[];
    };
    summary: string;             // Human-readable summary
  };
  error?: string;                // Error message if failed
}
```

### 5.3 Report Model

```typescript
interface AnalysisReport {
  title: string;
  date: string;
  ats_score: number;
  score_category: string;
  matched_keywords: string[];
  missing_keywords: string[];
  action_words_suggestions: {
    section: string;
    current: string;
    suggested: string;
  }[];
  recommendations: string[];
}
```

---

## 6. File Structure

### 6.1 Project Root

```
ResumeOptimizer/
├── frontend/                  # Next.js application (TypeScript)
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── app/              # Next.js App Router
│   │   │   ├── layout.tsx    # Root layout (Geist font)
│   │   │   ├── page.tsx      # Landing page (/)
│   │   │   ├── builder/      # Resume builder (/builder)
│   │   │   └── optimize/     # ATS optimizer (/optimize)
│   │   ├── components/
│   │   │   ├── builder/      # Builder-specific components
│   │   │   ├── optimizer/    # Optimizer-specific components
│   │   │   └── ui/           # Shared UI components
│   │   └── lib/
│   │       ├── api.ts        # Axios API client
│   │       └── schemas/      # Zod validation schemas
│   ├── next.config.ts        # Next.js config (API proxy)
│   ├── package.json          # Dependencies
│   └── tsconfig.json         # TypeScript config
│
├── backend/                  # Flask application
│   ├── app.py                # Main Flask app
│   ├── requirements.txt      # Python dependencies
│   ├── services/             # Analysis services
│   │   ├── __init__.py
│   │   ├── resume_parser.py
│   │   ├── keyword_analyzer.py
│   │   ├── action_words_analyzer.py
│   │   ├── ats_calculator.py
│   │   └── report_generator.py
│   ├── data/                 # Static data
│   │   ├── stop_words.py
│   │   ├── action_words.py
│   │   └── keywords_patterns.py
│   └── utils/                # Utility functions
│       └── text_processing.py
│
├── PRD.md                    # Product Requirements
├── TECHNICAL_SPEC.md         # Technical Specification
└── ARCHITECTURE.md           # This file
```

### 6.2 Frontend Structure

```
frontend/src/
├── app/                        # Next.js App Router
│   ├── layout.tsx             # Root layout + Geist fonts
│   ├── globals.css            # Global styles + CSS variables
│   ├── page.tsx               # Landing page (/)
│   ├── builder/
│   │   └── page.tsx           # Resume builder (/builder)
│   └── optimize/
│       └── page.tsx           # ATS optimizer (/optimize)
│
├── components/
│   ├── builder/
│   │   ├── ResumePreview.tsx  # Live resume renderer
│   │   └── sections/
│   │       ├── PersonalInfoSection.tsx
│   │       ├── SummarySection.tsx
│   │       ├── ExperienceSection.tsx
│   │       ├── EducationSection.tsx
│   │       └── SkillsSection.tsx
│   ├── optimizer/
│   │   ├── ArcGauge.tsx       # ATS score arc visualization
│   │   └── KeywordPills.tsx   # Matched/missing keyword pills
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Loader.tsx
│       └── MebbleLogo.tsx
│
└── lib/
    ├── api.ts                 # Axios client → Flask backend
    └── schemas/
        └── resume.ts          # Zod ResumeSchema + EMPTY_RESUME
```

### 6.3 Backend Structure

```
backend/
├── app.py
├── requirements.txt
│
├── services/
│   ├── __init__.py
│   │
│   ├── resume_parser.py
│   │   └── class: ResumeParser
│   │       ├── parse_pdf(file) -> str
│   │       └── extract_text(file) -> str
│   │
│   ├── keyword_analyzer.py
│   │   └── class: KeywordAnalyzer
│   │       ├── extract_keywords(text) -> list
│   │       ├── compare(resume_kw, jd_kw) -> dict
│   │       └── analyze(resume, jd) -> dict
│   │
│   ├── action_words_analyzer.py
│   │   └── class: ActionWordsAnalyzer
│   │       ├── extract_verbs(text) -> list
│   │       ├── find_weak_words(verbs) -> list
│   │       └── suggest_alternatives(word) -> list
│   │
│   ├── ats_calculator.py
│   │   └── class: ATSCalculator
│   │       ├── calculate_score(keywords) -> int
│   │       └── get_category(score) -> str
│   │
│   └── report_generator.py
│       └── class: ReportGenerator
│           ├── generate_text(data) -> str
│           └── generate_markdown(data) -> str
│
├── data/
│   ├── __init__.py
│   ├── stop_words.py         # STOP_WORDS list
│   ├── action_words.py       # ACTION_WORDS dict
│   └── keywords_patterns.py # Industry patterns
│
└── utils/
    ├── __init__.py
    └── text_processing.py
        ├── clean_text(text) -> str
        ├── tokenize(text) -> list
        ├── remove_stopwords(tokens) -> list
        └── extract_noun_phrases(text) -> list
```

---

## 7. Configuration

### 7.1 Environment Variables

**Backend (.env)**
```
FLASK_APP=app.py
FLASK_ENV=development
PORT=5000
MAX_CONTENT_LENGTH=16777216  # 16MB
CORS_ORIGINS=http://localhost:3000
```

### 7.2 Constants

```python
# backend/config.py

class Config:
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    MAX_JD_LENGTH = 10000            # 10k chars
    ALLOWED_EXTENSIONS = {'pdf'}
    SCORE_THRESHOLDS = {
        'poor': 50,
        'good': 75,
        'great': 90
    }
```

---

## 8. Error Handling Strategy

### 8.1 Frontend Errors

| Error Type | User Message | Action |
|------------|--------------|--------|
| Invalid file | "Please upload a PDF file" | Show error, keep form |
| File too large | "File must be under 5MB" | Show error |
| Network error | "Something went wrong. Please try again." | Show retry button |
| Analysis failed | "Could not analyze. Please try again." | Show retry |

### 8.2 Backend Errors

| Error Type | HTTP Code | Response |
|------------|-----------|----------|
| No resume text | 400 | "Resume text is required" |
| No JD text | 400 | "Job description is required" |
| PDF parse error | 500 | "Could not read PDF" |
| Analysis error | 500 | "Analysis failed" |

---

## 9. Performance Considerations

### 9.1 Targets

| Metric | Target |
|--------|--------|
| PDF parsing | < 3 seconds |
| Keyword analysis | < 2 seconds |
| Action words analysis | < 2 seconds |
| Total API response | < 10 seconds |
| Frontend page load | < 3 seconds |

### 9.2 Optimizations

- Process in-memory (no disk I/O)
- Lazy load analysis components
- Debounce JD input changes
- Cache results for same input

---

## 10. Security Measures

### 10.1 Input Validation

- File type checking (MIME + extension)
- File size limits
- Text length limits
- Sanitize all inputs

### 10.2 Data Handling

- No persistent storage of files
- Process in memory
- Clear after response
- No logging of sensitive data

### 10.3 CORS Configuration

```
Allowed Origins: http://localhost:3000 (dev)
Allowed Methods: GET, POST
Allowed Headers: Content-Type
```

---

## 11. Testing Plan

### 11.1 Unit Tests (Backend)

| Module | Test Cases |
|--------|------------|
| ResumeParser | Parse valid PDF, Handle encrypted PDF, Handle empty PDF |
| KeywordAnalyzer | Extract keywords, Compare keywords, Handle empty text |
| ActionWordsAnalyzer | Find weak words, Get suggestions, Handle no verbs |
| ATSCalculator | Calculate score, Categorize score |

### 11.2 Integration Tests

- Full analysis pipeline
- API error handling
- File upload flow

### 11.3 E2E Tests

- Upload PDF + Enter JD → View results → Download report

---

## 12. Future Architecture Considerations

### 12.1 Scalability

- Move to cloud storage (AWS S3)
- Add message queue (Celery) for processing
- Implement caching (Redis)
- Database for user history

### 12.2 Features

- Add user authentication
- Add resume history
- Add AI rewriting (LLM integration)
- Add real-time keyword trends

### 12.3 Deployment

- Containerize with Docker
- CI/CD pipeline
- Load balancing
- Auto-scaling

---

## 13. Implementation Priority

| Priority | Component | Reason |
|----------|-----------|--------|
| 1 | Resume Parser | Core input |
| 2 | Keyword Analyzer | Core analysis |
| 3 | ATS Calculator | Core output |
| 4 | Action Words Analyzer | MVP feature |
| 5 | Report Generator | MVP feature |
| 6 | Frontend UI | User interface |

---

*Document Version: 1.0*  
*Last Updated: 2026-04-10*