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
| App | `App.jsx` | Main container, routing |
| LandingPage | `LandingPage.jsx` | Welcome, instructions |
| UploadView | `UploadView.jsx` | PDF upload interface |
| JobDescriptionInput | `JobDescriptionInput.jsx` | JD text input |
| AnalysisView | `AnalysisView.jsx` | Results display |
| ReportView | `ReportView.jsx` | Report download |
| UploadArea | `UploadArea.jsx` | Drag/drop zone |
| ATScoreDisplay | `ATScoreDisplay.jsx` | Score visualization |
| KeywordDisplay | `KeywordDisplay.jsx` | Keywords list |
| ActionWordsDisplay | `ActionWordsDisplay.jsx` | Action words |
| Button | `Button.jsx` | Reusable button |
| Loader | `Loader.jsx` | Loading spinner |

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
├── frontend/                  # React application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── common/       # Shared components
│   │   │   ├── upload/       # Upload related
│   │   │   ├── analysis/     # Results related
│   │   │   └── layout/       # Layout components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API calls
│   │   ├── utils/            # Helper functions
│   │   ├── styles/           # CSS/styles
│   │   ├── App.jsx           # Main component
│   │   └── main.jsx          # Entry point
│   ├── index.html            # HTML template
│   ├── package.json          # Dependencies
│   ├── vite.config.js        # Vite config
│   └── tailwind.config.js    # Tailwind config
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
├── components/
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Loader.jsx
│   │   ├── Card.jsx
│   │   └── Input.jsx
│   │
│   ├── upload/
│   │   ├── UploadArea.jsx
│   │   ├── FilePreview.jsx
│   │   └── JobDescriptionInput.jsx
│   │
│   ├── analysis/
│   │   ├── ATSScoreDisplay.jsx
│   │   ├── KeywordMatch.jsx
│   │   ├── ActionWordsDisplay.jsx
│   │   ├── ScoreProgressBar.jsx
│   │   └── SummaryCard.jsx
│   │
│   └── layout/
│       ├── Header.jsx
│       ├── Footer.jsx
│       └── Layout.jsx
│
├── hooks/
│   ├── useAnalysis.js
│   └── useFileUpload.js
│
├── services/
│   └── api.js
│
├── utils/
│   ├── formatters.js
│   └── validators.js
│
├── styles/
│   └── index.css
│
├── App.jsx
└── main.jsx
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
CORS_ORIGINS=http://localhost:5173
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
Allowed Origins: http://localhost:5173 (dev)
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