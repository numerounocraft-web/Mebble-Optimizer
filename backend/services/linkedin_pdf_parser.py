"""
LinkedIn profile PDF parser — written against real export data.

Observed LinkedIn PDF format
─────────────────────────────
Line 0  : "Contact   Firstname  Lastname"      ← name merged with section label
Line 1  : "phone (Mobile)"
Line 2  : "email  Headline text…"              ← email + headline on same line
Line 3+ : headline continuation
Line N  : "www.linkedin.com/in/slug-"          ← URL may be split across lines
Line N+1: "slug-continuation (LinkedIn)"
Line M  : "Country / City"                     ← location
Line S  : "Summary"                            ← section header
Line T  : "Top Skills"                         ← section header (same page, column 2)
Line T+1: "Skill Name   Sentence of summary."  ← skill LEFT, summary RIGHT (two-column)
…
Line E  : "Experience"
Line E+1: "Company Name"
Line E+2: "6 months"                           ← total tenure (optional, skip)
Line E+3: "Job Title"
Line E+4: "Month Year - Month Year (X months)" ← date range
Line E+5: bullet / description lines
…       (second role at same company has no company line, just Title → Date)
Line Ed : "Education"
Line Ed+1: "Institution Name"
Line Ed+2: "Degree - Type, Field  (Year)"
"""

import io
import re
import uuid

import pdfplumber

# ── Regex helpers ──────────────────────────────────────────────────────────────

_PAGE_MARKER  = re.compile(r"^page\s+\d+\s+of\s+\d+$", re.I)
_DATE_RANGE   = re.compile(
    r"(january|february|march|april|may|june|july|august|september|october|november|december"
    r"|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec"
    r"|\d{4})"
    r".{0,60}"
    r"(january|february|march|april|may|june|july|august|september|october|november|december"
    r"|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec"
    r"|present|\d{4})",
    re.I,
)
_DURATION_ONLY = re.compile(r"^\d+\s*(year|yr|month|mo)s?(\s+\d+\s*(year|yr|month|mo)s?)?$", re.I)
_EMAIL        = re.compile(r"[\w.+\-]+@[\w\-]+\.[a-z]{2,}", re.I)
_PHONE        = re.compile(r"^\+?[\d\s\-().]{7,20}(?:\s*\((?:mobile|phone|work|home)\))?$", re.I)
_LI_URL       = re.compile(r"((?:www\.)?linkedin\.com/in/[\w\-]+)", re.I)
_BULLET       = re.compile(r"^[•·▪▸►\-–—]\s*")

_SECTION_HEADERS = {
    "contact":        re.compile(r"^contact$", re.I),
    "summary":        re.compile(r"^(summary|about)$", re.I),
    "skills":         re.compile(r"^(top skills?|skills?)$", re.I),
    "experience":     re.compile(r"^experience$", re.I),
    "education":      re.compile(r"^education$", re.I),
    "certifications": re.compile(r"^(licenses?\s*&\s*certifications?|certifications?)$", re.I),
    "languages":      re.compile(r"^languages?$", re.I),
    "volunteer":      re.compile(r"^volunteer", re.I),
    "honors":         re.compile(r"^honors?", re.I),
    "projects":       re.compile(r"^projects?$", re.I),
    "publications":   re.compile(r"^publications?$", re.I),
    "courses":        re.compile(r"^courses?$", re.I),
    "organizations":  re.compile(r"^organizations?$", re.I),
}


# ── Public entry point ─────────────────────────────────────────────────────────

def parse(file_bytes: bytes) -> dict:
    lines = _extract_lines(file_bytes)
    return _build_resume(lines)


# ── Text extraction ────────────────────────────────────────────────────────────

def _extract_lines(file_bytes: bytes) -> list[str]:
    """Extract non-empty lines from all pages (no layout mode — avoids column merging)."""
    raw: list[str] = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            for line in text.splitlines():
                s = line.strip()
                if s:
                    raw.append(s)
    return raw


# ── Classify a single line ─────────────────────────────────────────────────────

def _section_key(line: str) -> str | None:
    for key, pat in _SECTION_HEADERS.items():
        if pat.match(line.strip()):
            return key
    return None


def _is_page_marker(line: str) -> bool:
    return bool(_PAGE_MARKER.match(line.strip()))


def _is_date_range(line: str) -> bool:
    return bool(_DATE_RANGE.search(line))


def _is_duration_only(line: str) -> bool:
    return bool(_DURATION_ONLY.match(line.strip()))


def _is_location_line(line: str) -> bool:
    """
    Short line that looks like a city/country, not a sentence or job duty.
    Must be ≤ 60 chars, no colon (colons indicate bullet duties), no period at end.
    """
    if len(line) > 60:
        return False
    if line.endswith("."):
        return False
    if ":" in line or ";" in line:
        return False
    # "City, State, Country" pattern — comma with Title Case words
    if re.search(r"[A-Z][a-z]+,\s*[A-Z]", line):
        return True
    # Single-word country / city
    if re.match(
        r"^(germany|nigeria|uk|usa|canada|ghana|kenya|france|netherlands|"
        r"sweden|norway|denmark|finland|australia|india|pakistan|"
        r"england|scotland|ireland|singapore|uae|dubai|london|lagos|abuja|"
        r"nairobi|accra|berlin|amsterdam|toronto|sydney)$",
        line, re.I
    ):
        return True
    return False


def _is_company_line(line: str) -> bool:
    """Heuristic: company names are short, don't end with a period, no bullet prefix."""
    if not line:
        return False
    if line.endswith("."):
        return False
    if len(line) > 70:
        return False
    if _BULLET.match(line):
        return False
    if _is_duration_only(line):
        return False
    if _is_date_range(line):
        return False
    if _is_page_marker(line):
        return False
    return True


# ── Split raw lines into named sections ───────────────────────────────────────

def _split_sections(lines: list[str]) -> dict[str, list[str]]:
    """
    Partition lines by section header. Lines before the first header → "header".
    The tricky part: "Summary" and "Top Skills" often appear on the same line or
    adjacent lines because of the two-column layout, so we keep both under a
    single "preamble" bucket and separate them later.
    """
    sections: dict[str, list[str]] = {"header": []}
    current = "header"

    for line in lines:
        key = _section_key(line)
        if key:
            # Keep Summary and Top Skills together as "preamble" — they sit
            # side-by-side on the page and their lines are interleaved.
            if key in ("summary", "skills") and current in ("header", "summary", "skills", "preamble"):
                current = "preamble"
                sections.setdefault("preamble", [])
                continue
            current = key
            sections.setdefault(current, [])
        else:
            sections.setdefault(current, []).append(line)

    return sections


# ── Header parsing ─────────────────────────────────────────────────────────────

def _parse_header(lines: list[str]) -> dict:
    """
    Extract name, phone, email, location, LinkedIn URL from the header block.
    The first line looks like: "Contact   Firstname   Lastname"
    """
    name = email = phone = location = ""
    linkedin_url_parts: list[str] = []

    for i, line in enumerate(lines):
        # ── Name (first line, strip "Contact" prefix) ──────────────────────
        if not name:
            candidate = re.sub(r"^contact\s+", "", line, flags=re.I).strip()
            candidate = re.sub(r"\s+", " ", candidate)
            if candidate:
                name = candidate
            continue

        # ── Phone ──────────────────────────────────────────────────────────
        if not phone:
            phone_m = re.match(r"^(\+?[\d\s\-().]{7,20})\s*(?:\(mobile\)|\(phone\))?$", line, re.I)
            if phone_m:
                phone = re.sub(r"\s*\(.*?\)", "", phone_m.group(0)).strip()
                continue

        # ── Email (may be on same line as headline text) ───────────────────
        if not email:
            email_m = _EMAIL.search(line)
            if email_m:
                email = email_m.group(0)
                continue

        # ── LinkedIn URL (may be split across two lines) ───────────────────
        li_m = _LI_URL.search(line)
        if li_m:
            url_part = li_m.group(1)
            # Check if it's a partial URL (line ends with "-")
            if line.rstrip().endswith("-"):
                linkedin_url_parts.append(url_part)
            elif linkedin_url_parts:
                # Join continuation
                base = linkedin_url_parts[-1]
                # Extract the continuation slug (before any "(LinkedIn)" suffix)
                cont = re.sub(r"\s*\(.*?\)\s*$", "", line).strip()
                linkedin_url_parts[-1] = base + cont
            else:
                linkedin_url_parts.append(url_part)
            continue

        # Handle continuation line of a split LinkedIn URL
        if linkedin_url_parts and re.search(r"^[\w\-]+\s*\(linkedin\)$", line, re.I):
            cont = re.sub(r"\s*\(.*?\)\s*$", "", line).strip()
            linkedin_url_parts[-1] = linkedin_url_parts[-1] + cont
            continue

        # ── Location ───────────────────────────────────────────────────────
        if not location and _is_location_line(line):
            location = line
            continue

    linkedin_url = ""
    if linkedin_url_parts:
        u = linkedin_url_parts[0]
        if not u.startswith("http"):
            u = "https://www." + u.lstrip("www.")
        linkedin_url = u

    return {"name": name, "email": email, "phone": phone,
            "location": location, "linkedin_url": linkedin_url}


# ── Preamble: split interleaved Skills + Summary columns ──────────────────────

def _parse_preamble(lines: list[str]) -> tuple[list[str], str]:
    """
    Returns (skill_names, summary_text).

    In the two-column section each line can look like:
      "Skill Name   Sentence of summary text."
    Pure skill lines: short, no sentence fragment after.
    Pure summary lines: no skill prefix, or line was below the skills list.
    """
    skill_names: list[str] = []
    summary_parts: list[str] = []
    skills_exhausted = False

    for line in (l for l in lines if not _is_page_marker(l)):
        if skills_exhausted:
            summary_parts.append(line)
            continue

        # Try to split skill (left) from summary fragment (right)
        skill, fragment = _split_skill_summary_line(line)
        if skill:
            skill_names.append(skill)
            if fragment:
                summary_parts.append(fragment)
        else:
            # Line is pure summary text
            skills_exhausted = True
            summary_parts.append(line)

    return skill_names, " ".join(summary_parts)


_SENTENCE_STARTERS = re.compile(
    r"(?<=\s)(Most|They|The|This|These|I |We |It |By |Our |Your |My |"
    r"A |An |In |As |For |At |With |If |When |While |Don|What|How|Why)",
)


def _split_skill_summary_line(line: str) -> tuple[str, str]:
    """
    LinkedIn two-column PDFs merge skill (left) and summary (right) onto one line
    with a single space separator, e.g.:
      "Artificial Intelligence (AI) Most products don't fail…"
      "Research Skills They fail because of…"
      "Design Research"  ← pure skill (no summary counterpart)

    Returns (skill, summary_fragment). One of the two may be empty.
    """
    # Clearly a long prose sentence → pure summary
    if len(line) > 80 and line.endswith("."):
        return "", line

    # Look for a sentence-starting word that follows a plausible skill name
    m = _SENTENCE_STARTERS.search(line)
    if m and m.start() > 0:
        skill_candidate = line[: m.start()].strip()
        summary_candidate = line[m.start() :].strip()
        if skill_candidate and len(skill_candidate.split()) <= 6 and not skill_candidate.endswith("."):
            return skill_candidate, summary_candidate

    # Short line (≤ 6 words, no period) → pure skill
    if len(line.split()) <= 6 and not line.endswith("."):
        return line, ""

    # Otherwise → pure summary
    return "", line


# ── Experience parsing ────────────────────────────────────────────────────────

def _parse_experience(lines: list[str]) -> list[dict]:
    """
    Strategy: use date-range lines as anchors.
    - Line immediately before anchor (skip page markers) = Job Title
    - One further back (skip duration-only lines) = Company name (if it passes
      the company heuristic); otherwise reuse the previous company.
    - Lines after anchor until the company/title of the next entry = bullets.
    """
    clean = [l for l in lines if not _is_page_marker(l)]
    if not clean:
        return []

    # Find all date range line indices
    date_indices = [i for i, l in enumerate(clean) if _is_date_range(l)]
    if not date_indices:
        return []

    # Pre-compute (title_idx, company_idx_or_None, company_name, title_name) per anchor
    current_company = ""
    entry_meta: list[tuple] = []

    for date_idx in date_indices:
        # Find title
        title_idx = date_idx - 1
        while title_idx >= 0 and _is_page_marker(clean[title_idx]):
            title_idx -= 1
        title = clean[title_idx] if title_idx >= 0 else ""

        # Find company (look back from title, skipping duration-only lines)
        company = ""
        company_idx: int | None = None
        look = title_idx - 1
        while look >= 0:
            l = clean[look]
            if _is_page_marker(l) or _is_date_range(l):
                break
            if _is_duration_only(l):
                look -= 1
                continue
            if _is_company_line(l):
                company = l
                company_idx = look
            break

        if not company:
            company = current_company
        else:
            current_company = company

        entry_meta.append((title_idx, company_idx, date_idx, company, title))

    # Collect bullets for each entry
    entries: list[dict] = []
    for pos, (title_idx, company_idx, date_idx, company, title) in enumerate(entry_meta):
        bullet_start = date_idx + 1

        # Stop before the company-or-title of the next entry
        if pos + 1 < len(entry_meta):
            next_company_idx = entry_meta[pos + 1][1]
            next_title_idx   = entry_meta[pos + 1][0]
            bullet_end = next_company_idx if next_company_idx is not None else next_title_idx
        else:
            bullet_end = len(clean)

        location = ""
        bullets: list[str] = []
        for j in range(bullet_start, bullet_end):
            l = clean[j]
            if _is_page_marker(l) or _is_date_range(l) or _is_duration_only(l):
                continue
            if not location and _is_location_line(l):
                location = l
            else:
                bullets.append(_BULLET.sub("", l).strip())

        start_date, end_date = _parse_date_range(clean[date_idx])

        entries.append({
            "id": str(uuid.uuid4()),
            "title": title,
            "company": company,
            "location": location,
            "startDate": start_date,
            "endDate": end_date,
            "current": "present" in clean[date_idx].lower(),
            "bullets": [b for b in bullets if b] or [""],
        })

    return entries


def _parse_date_range(line: str) -> tuple[str, str]:
    """Return (startDate, endDate). endDate is '' for 'Present'."""
    # Strip duration suffix like "· 2 yrs 3 mos" or "(4 months)"
    line = re.sub(r"\s*[\(\(].*?[\)\)]", "", line).strip()
    line = re.sub(r"\s*[·•–—]\s*\d+.*$", "", line).strip()
    parts = re.split(r"\s*[-–—]\s*", line, maxsplit=1)
    start = parts[0].strip() if parts else ""
    end   = parts[1].strip() if len(parts) > 1 else ""
    end   = "" if end.lower() == "present" else end
    return start, end


# ── Education parsing ─────────────────────────────────────────────────────────

def _parse_education(lines: list[str]) -> list[dict]:
    """
    Typical blocks:
      Institution Name
      Degree - Type, Field  (Year)     OR   Degree, Field
      (optional: Grade / Activities)
    """
    clean = [l for l in lines if not _is_page_marker(l)]
    entries: list[dict] = []
    i = 0

    while i < len(clean):
        line = clean[i]

        # Skip date-range-only lines at top level (shouldn't exist but guard)
        if _is_date_range(line):
            i += 1
            continue

        institution = line
        degree = field = start_date = end_date = gpa = ""
        i += 1

        if i < len(clean):
            next_line = clean[i]
            if not _is_date_range(next_line) and not _is_page_marker(next_line):
                # Parse "Bachelor of Science - BS, Biochemistry · (2019)"
                # Extract year first (before stripping)
                year_m = re.search(r"\b(19|20)\d{2}\b", next_line)
                if year_m:
                    end_date = year_m.group(0)
                # Strip trailing year, parens, dashes, bullets
                degree_raw = re.sub(r"\s*[·•–\-]\s*\(?\d{4}\)?$", "", next_line).strip()
                degree_raw = re.sub(r"\s*\(?\d{4}\)?$", "", degree_raw).strip()
                degree_raw = degree_raw.rstrip("·•–—").strip()
                # Split degree and field: "Bachelor of Science - BS, Biochemistry"
                parts = re.split(r"\s*,\s*|\s*-\s*(?:BS|BA|MS|MA|PhD|BSc|BEng|MEng),\s*", degree_raw, maxsplit=1)
                degree = parts[0].strip()
                field  = parts[1].strip().rstrip("·•–—").strip() if len(parts) > 1 else ""
                i += 1
            elif _is_date_range(next_line):
                start_date, end_date = _parse_date_range(next_line)
                i += 1

        # Optional third line: field or GPA
        if i < len(clean) and not _is_date_range(clean[i]) and not _is_page_marker(clean[i]):
            third = clean[i]
            if third.lower().startswith("grade") or third.lower().startswith("gpa"):
                gpa_m = re.search(r"[\d.]+", third)
                if gpa_m:
                    gpa = gpa_m.group(0)
                i += 1
            elif not field and len(third.split()) <= 6 and not third.endswith("."):
                field = third
                i += 1

        if institution:
            entries.append({
                "id":          str(uuid.uuid4()),
                "institution": institution,
                "degree":      degree,
                "field":       field,
                "startDate":   start_date,
                "endDate":     end_date,
                "gpa":         gpa,
            })

    return entries


# ── Assembler ──────────────────────────────────────────────────────────────────

def _build_resume(lines: list[str]) -> dict:
    sections = _split_sections(lines)

    header_info = _parse_header(sections.get("header", []))
    skills_list, summary_text = _parse_preamble(sections.get("preamble", []))

    links: list[dict] = []
    if header_info["linkedin_url"]:
        links.append({"id": str(uuid.uuid4()), "label": "LinkedIn", "url": header_info["linkedin_url"]})
    else:
        links.append({"id": str(uuid.uuid4()), "label": "LinkedIn", "url": ""})
    links.append({"id": str(uuid.uuid4()), "label": "Portfolio", "url": ""})

    skills_groups: list[dict] = []
    if skills_list:
        skills_groups.append({"id": str(uuid.uuid4()), "category": "Skills", "items": skills_list})

    return {
        "personalInfo": {
            "name":     header_info["name"],
            "email":    header_info["email"],
            "phone":    header_info["phone"],
            "location": header_info["location"],
            "links":    links,
        },
        "summary":    summary_text,
        "experience": _parse_experience(sections.get("experience", [])),
        "education":  _parse_education(sections.get("education", [])),
        "skills":     skills_groups,
    }
