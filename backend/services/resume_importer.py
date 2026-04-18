"""
Maps the output of ResumeParser.parse_sections() into the builder's
Resume data structure (personalInfo, summary, experience, education, skills).
"""
import re
import uuid

# ── Regex helpers ─────────────────────────────────────────────────────────────

_EMAIL_RE  = re.compile(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}')
_PHONE_RE  = re.compile(r'\+?1?\s*[\(\-]?\d{3}[\)\-\s]?\s*\d{3}[\-\s]?\d{4}')
_URL_RE    = re.compile(
    r'(?:https?://|www\.)\S+|'
    r'(?:linkedin\.com|github\.com|gitlab\.com|behance\.net|dribbble\.com)\S*',
    re.IGNORECASE,
)
_DATE_RE = re.compile(
    r'(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|'
    r'Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|'
    r'Dec(?:ember)?)\s+\d{4}'
    r'|\d{4}',
    re.IGNORECASE,
)
_DATE_RANGE_RE = re.compile(
    r'((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|'
    r'Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|'
    r'Dec(?:ember)?)\s+\d{4}|\d{4})'
    r'\s*[-–—to]+\s*'
    r'((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|'
    r'Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|'
    r'Dec(?:ember)?)\s+\d{4}|\d{4}|Present|Current)',
    re.IGNORECASE,
)
_BULLET_RE   = re.compile(r'^[•·\-–—*▪▸►>\uf0b7]\s*')
_SEP_RE      = re.compile(r'\s*(?:\s–\s|\s—\s|\s\|\s|-{2,})\s*')
_LOC_RE      = re.compile(r'\b[A-Z][a-zA-Z\s]{1,20},\s*[A-Z][a-zA-Z]{1,20}\b')

# Words that strongly indicate a job title (not a company name)
_TITLE_WORDS = re.compile(
    r'\b(Engineer|Developer|Designer|Manager|Director|Analyst|Scientist|'
    r'Architect|Consultant|Specialist|Lead|Head|VP|President|Officer|'
    r'Coordinator|Associate|Intern|Fellow|Researcher|Writer|Editor|'
    r'Administrator|Executive|Advisor|Strategist|Producer|Agent)\b',
    re.IGNORECASE,
)


# ── Contact field extractors ──────────────────────────────────────────────────

def _email(text: str) -> str:
    m = _EMAIL_RE.search(text)
    return m.group(0) if m else ''


def _phone(text: str) -> str:
    m = _PHONE_RE.search(text)
    return m.group(0).strip() if m else ''


def _location(text: str) -> str:
    # Strip known non-location tokens first
    cleaned = _EMAIL_RE.sub('', text)
    cleaned = _PHONE_RE.sub('', cleaned)
    cleaned = _URL_RE.sub('', cleaned)
    m = _LOC_RE.search(cleaned)
    return m.group(0).strip() if m else ''


def _links(text: str) -> list:
    result = []
    for url in _URL_RE.findall(text):
        if _EMAIL_RE.search(url):
            continue
        low = url.lower()
        label = (
            'LinkedIn'  if 'linkedin'  in low else
            'GitHub'    if 'github'    in low else
            'GitLab'    if 'gitlab'    in low else
            'Behance'   if 'behance'   in low else
            'Dribbble'  if 'dribbble'  in low else
            'Portfolio'
        )
        result.append({'id': str(uuid.uuid4()), 'label': label, 'url': url})
    return result


# ── Section-specific parsers ──────────────────────────────────────────────────

def _parse_date_range(line: str):
    """Return (startDate, endDate, isCurrent) or ('', '', False)."""
    m = _DATE_RANGE_RE.search(line)
    if m:
        start = m.group(1).strip()
        end   = m.group(2).strip()
        current = end.lower() in ('present', 'current')
        return start, ('' if current else end), current
    # Single date — treat as start only
    m2 = _DATE_RE.search(line)
    if m2:
        return m2.group(0).strip(), '', False
    return '', '', False


def _is_date_line(line: str) -> bool:
    return bool(_DATE_RANGE_RE.search(line)) or bool(re.search(
        r'\b(?:20|19)\d{2}\b', line
    ))


def _split_title_company(line: str):
    """
    Split 'Title – Company' or 'Company – Title'.
    Returns (title, company) — uses title-word hints to order correctly.
    """
    m = _SEP_RE.search(line)
    if m:
        left  = line[:m.start()].strip()
        right = line[m.end():].strip()
        # If the right part looks more like a title, swap
        left_is_title  = bool(_TITLE_WORDS.search(left))
        right_is_title = bool(_TITLE_WORDS.search(right))
        if right_is_title and not left_is_title:
            return right, left   # (title, company)
        return left, right       # default: left=title, right=company

    # " at " pattern: "Title at Company"
    at_m = re.search(r'\s+at\s+', line, re.IGNORECASE)
    if at_m:
        return line[:at_m.start()].strip(), line[at_m.end():].strip()

    return line.strip(), ''


def parse_experience(sections: list) -> list:
    """
    Parse experience entries line-by-line.
    A new entry starts when a structural (non-date, non-bullet) line appears
    AFTER content (dates or bullets) has already been seen for the current entry.
    This handles resumes where entries are not blank-line separated.
    """
    raw = '\n'.join(s['content'] for s in sections if s['type'] == 'experience')
    if not raw.strip():
        return []

    all_lines = [l.strip() for l in raw.split('\n') if l.strip()]
    entries   = []

    def _blank_entry():
        return {
            'id': str(uuid.uuid4()),
            'company':   '',
            'title':     '',
            'location':  '',
            'startDate': '',
            'endDate':   '',
            'current':   False,
            'bullets':   [],
        }

    def _flush(e):
        if e['title'] or e['company'] or e['bullets']:
            entries.append(e)

    current         = _blank_entry()
    struct_count    = 0   # structural lines seen in this entry
    seen_content    = False  # True once a date or bullet has been seen

    for line in all_lines:
        is_bullet = bool(_BULLET_RE.match(line))
        is_date   = _is_date_line(line) and not is_bullet
        is_struct = not is_bullet and not is_date

        # A structural line AFTER content = new entry boundary
        if is_struct and seen_content:
            _flush(current)
            current      = _blank_entry()
            struct_count = 0
            seen_content = False

        if is_date:
            seen_content = True
            s, e, cur = _parse_date_range(line)
            if s:
                current['startDate'] = s
                current['endDate']   = e
                current['current']   = cur
            # Anything left on the date line might be location
            remainder = _DATE_RANGE_RE.sub('', line).strip(' -–|,·')
            if remainder and not current['location'] and len(remainder) < 40:
                current['location'] = remainder

        elif is_bullet:
            seen_content = True
            text = _BULLET_RE.sub('', line).strip()
            if text:
                current['bullets'].append(text)

        else:  # structural
            struct_count += 1
            if struct_count == 1:
                title, company = _split_title_company(line)
                current['title']   = title
                current['company'] = company
            elif struct_count == 2:
                if not current['company']:
                    current['company'] = line
                elif not current['location'] and _LOC_RE.search(line):
                    current['location'] = line
            elif struct_count == 3 and not current['location'] and _LOC_RE.search(line):
                current['location'] = line

    _flush(current)

    return entries


def parse_education(sections: list) -> list:
    blocks_raw = '\n'.join(
        s['content'] for s in sections if s['type'] == 'education'
    )
    if not blocks_raw.strip():
        return []

    blocks  = re.split(r'\n\s*\n', blocks_raw.strip())
    entries = []

    for block in blocks:
        lines = [l.strip() for l in block.split('\n') if l.strip()]
        if not lines:
            continue

        entry = {
            'id':          str(uuid.uuid4()),
            'institution': '',
            'degree':      '',
            'field':       '',
            'startDate':   '',
            'endDate':     '',
        }

        structural = 0  # count of non-date, non-bullet lines consumed
        for line in lines:
            if _is_date_line(line) and not _BULLET_RE.match(line):
                s, e, _ = _parse_date_range(line)
                entry['startDate'] = s
                entry['endDate']   = e
                continue

            if _BULLET_RE.match(line):
                continue  # skip bullets in education

            if structural == 0:
                entry['institution'] = line
            elif structural == 1:
                # "Bachelor of Science, Computer Science"
                # "Bachelor of Science in Computer Science"
                if ',' in line:
                    p = line.split(',', 1)
                    entry['degree'] = p[0].strip()
                    entry['field']  = p[1].strip()
                elif re.search(r'\bin\b', line, re.IGNORECASE):
                    p = re.split(r'\bin\b', line, maxsplit=1, flags=re.IGNORECASE)
                    entry['degree'] = p[0].strip()
                    entry['field']  = p[1].strip()
                else:
                    entry['degree'] = line
            structural += 1

        if entry['institution']:
            entries.append(entry)

    return entries


def parse_skills(sections: list) -> list:
    content = '\n'.join(
        s['content'] for s in sections if s['type'] == 'skills'
    )
    if not content.strip():
        return []

    groups = []
    loose  = []   # lines without a category prefix

    for line in content.split('\n'):
        line = line.strip().lstrip('•·-–—*▪▸►>').strip()
        if not line:
            continue

        if ':' in line:
            cat, rest = line.split(':', 1)
            cat  = cat.strip()
            items = [i.strip() for i in re.split(r'[,;|]', rest) if i.strip()]
            if items:
                groups.append({'id': str(uuid.uuid4()), 'category': cat, 'items': items})
        else:
            items = [i.strip() for i in re.split(r'[,;|]', line) if i.strip()]
            loose.extend(items)

    if loose:
        groups.append({'id': str(uuid.uuid4()), 'category': 'Skills', 'items': loose})

    return groups


# ── Main entry point ──────────────────────────────────────────────────────────

def sections_to_builder_data(sections: list) -> dict:
    """Convert ResumeParser sections into the builder Resume shape."""
    header  = next((s for s in sections if s['type'] == 'header'), {})
    contact = header.get('content', '')

    personal_info = {
        'name':     header.get('name', ''),
        'email':    _email(contact),
        'phone':    _phone(contact),
        'location': _location(contact),
        'links':    _links(contact),
    }

    summary_sec = next((s for s in sections if s['type'] == 'professional_summary'), None)
    summary = summary_sec['content'] if summary_sec else ''

    return {
        'personalInfo': personal_info,
        'summary':      summary,
        'experience':   parse_experience(sections),
        'education':    parse_education(sections),
        'skills':       parse_skills(sections),
    }
