# Resume Optimizer - Product Requirements Document (MVP)

## 1. Overview

**Product Name:** Resume Optimizer  
**Type:** Web Application (MVP)  
**Core Functionality:** A tool that analyzes resumes against job descriptions, provides ATS scoring, identifies missing/added keywords, and suggests action word improvements in experience sections.  
**Target Users:** Job seekers who want to optimize their resumes for specific job applications. Initial focus: general market (all experience levels).  
**Launch Strategy:** Build for personal use first, validate, then launch publicly.

---

## 2. Problem Statement

Many job seekers struggle with:
- Understanding how well their resume fits a job description
- Identifying missing keywords that ATS systems look for
- Knowing which action words to use in experience descriptions
- Not knowing what to optimize in their resumes

---

## 3. User Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Upload        │     │   Enter Job     │     │   View Analysis │     │   Download      │
│   Resume (PDF)  │ ──> │   Description   │ ──> │   Results       │ ──> │   Report        │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
```

1. User uploads resume (PDF format)
2. User pastes job description text
3. System processes and displays:
   - ATS Score (percentage)
   - Matched keywords
   - Missing keywords
   - Action words analysis in experience section
4. User can download optimization report

---

## 4. MVP Features

### 4.1 Resume Upload
- Accept PDF files only (for MVP)
- Max file size: 5MB
- Display filename after upload
- Show error for invalid formats

### 4.2 Job Description Input
- Text area for pasting job description
- Character limit: 10,000 characters
- Placeholder text with guidance

### 4.3 ATS Scoring
- Calculate match percentage based on keyword overlap
- Score formula: (matched keywords / total JD keywords) × 100
- Display score as percentage with visual indicator (progress bar)
- Score categories: Poor (<50%), Good (50-74%), Great (75-89%), Excellent (90%+)

### 4.4 Keyword Analysis
- **Matched Keywords:** Display keywords found in both resume and JD
- **Missing Keywords:** Display keywords in JD but not in resume
- Highlight with color coding (green = matched, red = missing)

### 4.5 Action Words Analysis
- Analyze experience/achievement sections for action verbs
- Identify weak/overused words
- Suggest stronger action words from predefined list
- Show current vs. suggested replacements

### 4.6 Results Display
- Clean, organized dashboard layout
- Breakdown by category (ATS, Keywords, Action Words)
- Visual progress indicators
- Downloadable text-based optimization report

### 4.7 Download Report
- Generate text/PDF report with all findings
- Include recommendations
- Simple download button

---

## 5. Non-Functional Requirements

### 5.1 Performance
- Resume processing: < 10 seconds
- Page load time: < 3 seconds

### 5.2 Security
- Files processed in-memory (not stored permanently)
- No data sent to external servers for processing

### 5.3 Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design (mobile-friendly)

---

## 6. Out of Scope (MVP)

- Word document resume upload
- AI-generated rewrite suggestions
- Real-time keyword trends
- Before/after visual diff
- User accounts / history
- Bulk resume analysis

---

## 7. Success Metrics

- Resume processed successfully
- ATS score displayed accurately
- Keywords correctly identified
- Action words suggestions provided
- Download report functional
- No critical errors during flow

---

## 8. Future Enhancements (Post-MVP)

- Word document support
- Before/after visual diff
- Real-time keyword trend data
- Actionable education layer
- Industry-specific optimization
- User accounts with history
- LinkedIn/Indeed export
- Bulk analysis

---

## 9. Timeline

**MVP Target:** Launch in weeks  
**Phase 1:** Core features (ATS, keywords, action words)  
**Phase 2:** Visual improvements, report enhancement  
**Phase 3:** Additional formats, advanced features