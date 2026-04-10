import pdfplumber
import io
import re


# Known section headers mapped to their normalized type
SECTION_HEADER_MAP = {}
_KNOWN_SECTIONS = {
    'professional_summary': [
        'professional summary', 'summary', 'profile', 'objective',
        'career objective', 'professional profile', 'about me', 'about',
    ],
    'experience': [
        'professional experience', 'work experience', 'experience',
        'employment history', 'work history', 'career history', 'employment',
        'professional background',
    ],
    'education': [
        'education', 'academic background', 'academic history',
        'qualifications', 'academic qualifications', 'educational background',
    ],
    'skills': [
        'skills', 'core competencies', 'technical skills', 'key skills',
        'competencies', 'areas of expertise', 'core skills', 'skill set',
    ],
    'certifications': [
        'certifications', 'certificates', 'certification', 'licenses',
        'professional development', 'professional certifications',
    ],
    'projects': [
        'projects', 'key projects', 'project experience', 'notable projects',
    ],
    'awards': [
        'awards', 'honors', 'achievements', 'accomplishments', 'recognition',
    ],
    'languages': ['languages'],
    'volunteer': ['volunteer', 'volunteering', 'community service'],
    'interests': ['interests', 'hobbies', 'activities'],
    'references': ['references'],
}
for _stype, _variants in _KNOWN_SECTIONS.items():
    for _v in _variants:
        SECTION_HEADER_MAP[_v.lower()] = _stype


def _is_section_header(line: str):
    """Return (section_type, heading) if line is a recognized section header, else None."""
    stripped = line.strip()
    if not stripped or len(stripped) > 80:
        return None
    lower = stripped.lower().rstrip(':')
    stype = SECTION_HEADER_MAP.get(lower)
    if stype:
        return stype, stripped
    # Also match ALL-CAPS lines that look like section headers
    if stripped.isupper() and 3 <= len(stripped) <= 50:
        stype = SECTION_HEADER_MAP.get(stripped.lower().rstrip(':'))
        if stype:
            return stype, stripped
    return None


class ResumeParser:
    def parse_pdf(self, file) -> str:
        """Extract text from a PDF file object."""
        file_bytes = file.read()
        return self.extract_text(file_bytes)

    def extract_text(self, file_bytes: bytes) -> str:
        """Extract all text from PDF bytes using pdfplumber."""
        text_parts = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
        return '\n'.join(text_parts)

    def parse_sections(self, text: str) -> list:
        """Parse resume text into structured sections for display."""
        lines = text.split('\n')
        sections = []

        # --- Extract header block (everything before the first section heading) ---
        header_lines = []
        body_start = 0
        for i, line in enumerate(lines):
            result = _is_section_header(line)
            if result:
                body_start = i
                break
            stripped = line.strip()
            if stripped:
                header_lines.append(stripped)
        else:
            # No section headers found — treat whole text as one section
            body_start = len(lines)

        # Parse name and contact from header block
        name = header_lines[0] if header_lines else ''
        contact_parts = header_lines[1:] if len(header_lines) > 1 else []
        # Join contact lines, splitting by common separators
        contact_raw = ' '.join(contact_parts)

        sections.append({
            'id': 'header',
            'type': 'header',
            'heading': '',
            'content': contact_raw,
            'name': name,
            'optimizable': False,
        })

        # --- Parse body sections ---
        current_type = None
        current_heading = ''
        current_lines = []
        section_counter = {}

        def flush_section():
            if current_type is None:
                return
            content = '\n'.join(current_lines).strip()
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

        for line in lines[body_start:]:
            result = _is_section_header(line)
            if result:
                flush_section()
                current_type, current_heading = result
                current_lines = []
            else:
                stripped = line.strip()
                if stripped:
                    current_lines.append(stripped)

        flush_section()

        return sections
