import pdfplumber
import io
import re
try:
    from pypdf import PdfReader as _PdfReader          # pypdf ≥ 3
except ImportError:
    from PyPDF2 import PdfReader as _PdfReader         # PyPDF2 fallback


# ── Section header registry ───────────────────────────────────────────────────
_KNOWN_SECTIONS = {
    'professional_summary': [
        'professional summary', 'summary', 'profile', 'objective',
        'career objective', 'professional profile', 'about me', 'about',
        'personal statement', 'professional statement',
    ],
    'experience': [
        'professional experience', 'work experience', 'experience',
        'employment history', 'work history', 'career history', 'employment',
        'professional background', 'relevant experience', 'work & experience',
        'career experience', 'internship experience', 'internships',
    ],
    'education': [
        'education', 'academic background', 'academic history',
        'qualifications', 'academic qualifications', 'educational background',
        'education & training', 'education and training',
    ],
    'skills': [
        'skills', 'core competencies', 'technical skills', 'key skills',
        'competencies', 'areas of expertise', 'core skills', 'skill set',
        'skills & competencies', 'skills and competencies', 'technical expertise',
        'tools & technologies', 'tools and technologies', 'technologies',
    ],
    'certifications': [
        'certifications', 'certificates', 'certification', 'licenses',
        'professional development', 'professional certifications',
        'certifications & licenses', 'certifications and licenses',
        'training & certifications', 'training and certifications',
    ],
    'projects': [
        'projects', 'key projects', 'project experience', 'notable projects',
        'personal projects', 'selected projects', 'portfolio',
    ],
    'awards': [
        'awards', 'honors', 'achievements', 'accomplishments', 'recognition',
        'awards & recognition', 'honors & awards',
    ],
    'languages': [
        'languages', 'language skills', 'languages spoken',
    ],
    'volunteer': [
        'volunteer', 'volunteering', 'community service', 'volunteer experience',
        'social impact', 'extracurricular',
    ],
    'interests': ['interests', 'hobbies', 'activities', 'hobbies & interests'],
    'references': ['references', 'referees'],
    'publications': ['publications', 'research', 'papers'],
}

# Build flat lookup: lowercase header text → section type
SECTION_HEADER_MAP: dict[str, str] = {}
for _stype, _variants in _KNOWN_SECTIONS.items():
    for _v in _variants:
        SECTION_HEADER_MAP[_v.lower()] = _stype


# ── Contact-line detector ─────────────────────────────────────────────────────
_CONTACT_RE = re.compile(
    r'(@|linkedin|github|portfolio|http|www\.|\.com|\.org|\.io'
    r'|\+?\d[\d\s\-\(\)]{6,}\d'   # phone
    r'|[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,})',  # email
    re.IGNORECASE,
)


def _looks_like_contact(line: str) -> bool:
    return bool(_CONTACT_RE.search(line))


# ── Section-header detector ───────────────────────────────────────────────────
def _detect_section_header(line: str):
    """Return (section_type, canonical_heading) or None."""
    stripped = line.strip()
    if not stripped or len(stripped) > 90:
        return None

    # Strip common decorators: dashes, underscores, pipes, bullets
    cleaned = re.sub(r'^[\-_=*•|/\\]+\s*|\s*[\-_=*•|/\\]+$', '', stripped).strip()
    if not cleaned:
        return None

    probe = cleaned.lower().rstrip(':').strip()

    # Direct lookup
    stype = SECTION_HEADER_MAP.get(probe)
    if stype:
        return stype, stripped

    # ALL-CAPS line that matches a known header
    if stripped.isupper() and 3 <= len(stripped) <= 60:
        stype = SECTION_HEADER_MAP.get(stripped.lower().rstrip(':').strip())
        if stype:
            return stype, stripped

    # Title-case short line (≤4 words) that matches
    words = probe.split()
    if 1 <= len(words) <= 4:
        stype = SECTION_HEADER_MAP.get(probe)
        if stype:
            return stype, stripped

    return None


# ── Main parser ───────────────────────────────────────────────────────────────
class ResumeParser:

    def parse_pdf(self, file) -> str:
        file_bytes = file.read()
        return self.extract_text(file_bytes)

    def extract_text(self, file_bytes: bytes) -> str:
        """Extract text from PDF using multiple strategies in order of preference."""

        # ── Strategy 1: pdfplumber with layout=True ───────────────────────────
        try:
            parts = []
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    try:
                        t = page.extract_text(layout=True)
                    except Exception:
                        t = page.extract_text()
                    if t:
                        parts.append(t)
            text = '\n'.join(parts).strip()
            if text:
                return text
        except Exception:
            pass

        # ── Strategy 2: pdfplumber word-level extraction ──────────────────────
        try:
            parts = []
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    words = page.extract_words(
                        x_tolerance=3, y_tolerance=3,
                        keep_blank_chars=False,
                    )
                    if words:
                        # Reconstruct lines by grouping words with similar top-y
                        lines: dict[int, list] = {}
                        for w in words:
                            key = round(w['top'] / 4) * 4   # bucket to ~4px
                            lines.setdefault(key, []).append(w)
                        for key in sorted(lines):
                            row = sorted(lines[key], key=lambda w: w['x0'])
                            parts.append(' '.join(w['text'] for w in row))
            text = '\n'.join(parts).strip()
            if text:
                return text
        except Exception:
            pass

        # ── Strategy 3: PyPDF2 / pypdf fallback ──────────────────────────────
        try:
            reader = _PdfReader(io.BytesIO(file_bytes))
            parts = []
            for page in reader.pages:
                t = page.extract_text()
                if t:
                    parts.append(t)
            text = '\n'.join(parts).strip()
            if text:
                return text
        except Exception:
            pass

        return ''

    def parse_sections(self, text: str) -> list:
        """
        Parse resume text into structured sections, faithfully preserving
        every piece of content found in the PDF.
        """
        # Normalise line endings
        text = text.replace('\r\n', '\n').replace('\r', '\n')
        # Collapse runs of 3+ blank lines to 2 (preserve paragraph gaps)
        text = re.sub(r'\n{3,}', '\n\n', text)
        lines = text.split('\n')

        sections: list[dict] = []

        # ── Step 1: find where body sections start ────────────────────────────
        first_header_idx = len(lines)
        for i, line in enumerate(lines):
            if _detect_section_header(line):
                first_header_idx = i
                break

        # ── Step 2: extract the header block (name + contact) ─────────────────
        header_raw_lines = [l for l in lines[:first_header_idx] if l.strip()]

        name = ''
        contact_lines = []

        for i, line in enumerate(header_raw_lines):
            stripped = line.strip()
            if i == 0:
                # First non-empty line is the candidate name
                # Accept if it's reasonably short and doesn't look like contact info
                if stripped and len(stripped) <= 60 and not _looks_like_contact(stripped):
                    name = stripped
                else:
                    contact_lines.append(stripped)
            else:
                contact_lines.append(stripped)

        # Preserve contact as its original lines joined by ' | '
        # (pdfplumber often puts all contact on one line already)
        contact_raw = ' | '.join(l for l in contact_lines if l)

        sections.append({
            'id': 'header',
            'type': 'header',
            'heading': '',
            'content': contact_raw,
            'name': name,
            'optimizable': False,
        })

        # ── Step 3: parse body sections ───────────────────────────────────────
        current_type: str | None = None
        current_heading = ''
        current_lines: list[str] = []
        section_counter: dict[str, int] = {}

        def flush():
            if current_type is None:
                return
            # Join lines, preserving blank-line paragraph breaks
            content = '\n'.join(current_lines).strip()
            # Collapse 3+ consecutive newlines to 2 (safety)
            content = re.sub(r'\n{3,}', '\n\n', content)
            if not content:
                return
            idx = section_counter.get(current_type, 0)
            section_counter[current_type] = idx + 1
            sections.append({
                'id': f'{current_type}_{idx}',
                'type': current_type,
                'heading': current_heading,
                'content': content,
                'optimizable': current_type in ('professional_summary', 'experience'),
            })

        for line in lines[first_header_idx:]:
            header_result = _detect_section_header(line)
            if header_result:
                flush()
                current_type, current_heading = header_result
                current_lines = []
            else:
                # Preserve the line as-is (blank lines become paragraph separators)
                stripped = line.strip()
                if stripped:
                    current_lines.append(stripped)
                elif current_lines and current_lines[-1] != '':
                    # Add a blank line to mark a paragraph break
                    current_lines.append('')

        flush()

        # Remove trailing empty sections
        sections = [s for s in sections if s.get('content') or s.get('name')]

        return sections
