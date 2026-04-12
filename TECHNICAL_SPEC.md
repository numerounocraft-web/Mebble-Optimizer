# Resume Optimizer - Technical Specification (MVP)

## 1. Tech Stack

### 1.1 Frontend
| Component | Technology | Reason |
|-----------|------------|--------|
| Framework | Next.js 16 (App Router) | File-based routing, SSR ready |
| Language | TypeScript | Type safety across the codebase |
| UI Library | React 19 | Latest concurrent features |
| Styling | Tailwind CSS v4 | Rapid UI development, responsive |
| Validation | Zod | Runtime schema validation + inferred TS types |
| State Management | React useState/useCallback | Simple, sufficient for MVP |
| HTTP Client | Axios | Simple API calls |
| Icons | Lucide React | Consistent icon set |
| Font | Geist | Clean, modern typography |

### 1.2 Backend
| Component | Technology | Reason |
|-----------|------------|--------|
| Framework | Python Flask | Lightweight, easy to prototype |
| NLP Processing | NLTK / spaCy | Text analysis, keyword extraction |
| PDF Processing | PyPDF2 / pdfplumber | Extract text from PDFs |
| API Format | REST JSON | Simple, standard |

### 1.3 Development Tools
- Node.js (v18+)
- Python (v3.10+)
- VS Code recommended

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (React)                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │   Upload    │  │     JD      │  │   Results   │  │   Report    │  │
│  │   Component │  │   Input     │  │   Display   │  │   Download  │  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │
│         │                │                │                │          │
│         └────────────────┼────────────────┼────────────────┘          │
│                          │                │                            │
│                    ┌─────▼────────┐  ┌─────▼────────┐                │
│                    │  API Service  │  │ PDF Parser   │                │
│                    └─────┬────────┘  └──────────────┘                │
└──────────────────────────┼────────────────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   FLASK     │
                    │   BACKEND   │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────▼─────┐   ┌──────▼──────┐   ┌─────▼─────┐
    │  Resume   │   │  Keyword    │   │   Action  │
    │  Parser   │   │  Analyzer   │   │   Words   │
    └───────────┘   └─────────────┘   └───────────┘
```

---

## 3. Component Details

### 3.1 Frontend Components

```
src/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page (/)
│   ├── builder/page.tsx     # Resume builder (/builder)
│   └── optimize/page.tsx    # ATS optimizer (/optimize)
├── components/
│   ├── builder/
│   │   ├── ResumePreview.tsx         # Live resume render
│   │   └── sections/                # PersonalInfo, Summary, Experience, Education, Skills
│   ├── optimizer/
│   │   ├── ArcGauge.tsx             # ATS score arc
│   │   └── KeywordPills.tsx         # Keyword pills
│   └── ui/                          # Button, Card, Input, Loader, MebbleLogo
└── lib/
    ├── api.ts               # API calls to backend
    └── schemas/resume.ts    # Zod ResumeSchema + types
```

### 3.2 Backend Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze` | POST | Analyze resume against JD |
| `/api/health` | GET | Health check |

### 3.3 API Contract

**Request:**
```json
{
  "resume_text": "string",
  "job_description": "string"
}
```

**Response:**
```json
{
  "ats_score": 75,
  "matched_keywords": ["python", "react", "api"],
  "missing_keywords": ["docker", "aws", "sql"],
  "action_words_analysis": {
    "found": ["managed", "led"],
    "suggestions": [
      {"current": "managed", "suggested": "spearheaded"},
      {"current": "led", "suggested": "orchestrated"}
    ]
  }
}
```

---

## 4. Core Logic Modules

### 4.1 Resume Parser
- **Input:** PDF file
- **Output:** Extracted text string
- **Libraries:** PyPDF2, pdfplumber

### 4.2 Keyword Analyzer
- **Input:** Resume text, Job Description text
- **Process:**
  1. Tokenize JD text
  2. Filter stop words
  3. Extract keywords (noun phrases, technical terms)
  4. Compare with resume keywords
  5. Categorize as matched/missing
- **Output:** Lists of matched and missing keywords

### 4.3 Action Words Analyzer
- **Input:** Experience section text
- **Process:**
  1. Identify experience/achievement sections
  2. Extract verbs
  3. Compare against action words database
  4. Suggest stronger alternatives
- **Output:** Found action words + suggestions

### 4.4 ATS Calculator
- **Input:** Keyword analysis results
- **Process:** `score = (matched / total JD keywords) * 100`
- **Output:** Score percentage + category

---

## 5. Data Structures

### 5.1 Action Words Database (Sample)
```python
ACTION_WORDS = {
    "managed": ["spearheaded", "orchestrated", "championed"],
    "led": ["directed", "guided", "mentored"],
    "created": ["established", "pioneered", "originated"],
    "helped": ["facilitated", "enabled", "empowered"],
    "worked": ["collaborated", "partnered", "engaged"],
    "did": ["executed", "delivered", "accomplished"]
}
```

### 5.2 Stop Words List
Standard English stop words for filtering (NLTK default).

---

## 6. File Processing Flow

```
User Uploads PDF
       │
       ▼
┌──────────────┐
│ Frontend     │
│ - Validate   │
│ - Send to    │
│   backend    │
└──────────────┘
       │
       ▼
┌──────────────┐
│ Backend      │
│ - Parse PDF  │
│ - Extract    │
│   text       │
└──────────────┘
       │
       ▼
┌──────────────┐
│ Analysis     │
│ - Keyword    │
│ - Action     │
│ - ATS score  │
└──────────────┘
       │
       ▼
┌──────────────┐
│ Response     │
│ - JSON to    │
│   frontend   │
└──────────────┘
       │
       ▼
┌──────────────┐
│ Frontend     │
│ - Display    │
│ - Generate   │
│   report     │
└──────────────┘
```

---

## 7. Error Handling

| Scenario | Handling |
|----------|----------|
| Invalid file format | Show error message, don't submit |
| PDF extraction fails | Show error, suggest retry |
| Empty JD text | Require input before analysis |
| Very long text | Truncate to 10,000 chars |
| Network error | Show retry option |

---

## 8. Security Considerations

- Files processed in-memory, not stored
- No external API calls for processing
- CORS configured for local development
- Input sanitization on backend
- No sensitive data logging

---

## 9. Development Setup

### 9.1 Prerequisites
```bash
# Node.js
node --version  # v18+

# Python
python --version  # v3.10+

# Pip
pip --version
```

### 9.2 Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python app.py
```

### 9.3 Frontend Setup
```bash
cd frontend
npm install
npm run dev   # starts at http://localhost:3000
```

---

## 10. API Reference

### 10.1 Analyze Resume
**URL:** `POST /api/analyze`

**Request Body:**
```json
{
  "resume_text": "string",
  "job_description": "string"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "ats_score": 75,
    "score_category": "Good",
    "matched_keywords": ["python", "react", "api"],
    "missing_keywords": ["docker", "aws", "sql"],
    "action_words_analysis": {
      "found": ["managed", "led"],
      "suggestions": [
        {"current": "managed", "suggested": "spearheaded"},
        {"current": "led", "suggested": "orchestrated"}
      ]
    },
    "summary": "Your resume matches 75% of the job description keywords..."
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Resume text is required"
}
```

---

## 11. Testing Strategy

### 11.1 Unit Tests
- Keyword extraction logic
- ATS score calculation
- Action words matching

### 11.2 Integration Tests
- Full analysis flow
- Error handling

### 11.3 Manual Testing
- Multiple resume formats
- Edge cases (empty, very long)

---

## 12. Deployment Notes (Future)

- Frontend: Vercel / Netlify
- Backend: Render / Railway / Heroku
- Environment variables for configuration
- CORS setup for production