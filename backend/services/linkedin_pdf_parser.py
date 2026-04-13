"""
Parse a LinkedIn profile PDF export into a structured resume dict.

LinkedIn PDF layout (all known variants):
  Page 1
  ──────
  <Name>
  <Headline>
  <Location>               (optional)

  Contact
  <url / email / phone lines>

  Summary                  (optional)
  <text>

  Experience
  <Title>
  <Company · Type>
  <Date range · Duration>
  <Location>               (optional)
  <Description>

  Education
  <Degree / Field>
  <Institution>
  <Date range>
  <Grade: …>               (optional)

  Skills
  <skill>, <skill>, …      (comma-separated block OR one-per-line)

  Licenses & certifications (ignored for now)
  Languages                (ignored for now)
"""

import io
import re
import uuid

import pdfplumber


# ── Section header variants LinkedIn uses ─────────────────────────────────────
_SECTION_HEADERS = {
    "contact":        re.compile(r"^contact$", re.I),
    "summary":        re.compile(r"^(summary|about)$", re.I),
    "experience":     re.compile(r"^experience$", re.I),
    "education":      re.compile(r"^education$", re.I),
    "skills":         re.compile(r"^(skills|top skills)$", re.I),
    "certifications": re.compile(r"^(licenses? & certifications?|certifications?)$", re.I),
    "languages":      re.compile(r"^languages?$", re.I),
    "publications":   re.compile(r"^publications?$", re.I),
    "volunteer":      re.compile(r"^volunteer experience$", re.I),
    "honors":         re.compile(r"^honors?[-– ]awards?$", re.I),
    "projects":       re.compile(r"^projects?$", re.I),
    "recommendations":re.compile(r"^recommendations?$", re.I),
    "courses":        re.compile(r"^courses?$", re.I),
    "organizations":  re.compile(r"^organizations?$", re.I),
}

_DATE_RANGE = re.compile(
    r"(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|"
    r"april|june|july|august|september|october|november|december|\d{4})",
    re.I,
)

_DURATION = re.compile(r"\d+\s*(yr|year|mo|month)", re.I)
_BULLET_PREFIX = re.compile(r"^[•·▪▸►\-–—]\s*")
_EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[a-z]{2,}", re.I)
_PHONE = re.compile(r"[\+]?[\d\s\-().]{7,20}")
_LI_URL = re.compile(r"linkedin\.com/in/[\w\-]+", re.I)


def parse(file_bytes: bytes) -> dict:
    lines = _extract_lines(file_bytes)
    sections = _split_sections(lines)
    return _build_resume(sections)


# ── Text extraction ────────────────────────────────────────────────────────────

def _extract_lines(file_bytes: bytes) -> list[str]:
    raw: list[str] = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text = page.extract_text(layout=True) or ""
            for line in text.splitlines():
                stripped = line.strip()
                if stripped:
                    raw.append(stripped)
    return raw


# ── Section splitting ──────────────────────────────────────────────────────────

def _classify(line: str) -> str | None:
    """Return section key if the line is a recognised section header."""
    clean = line.strip()
    for key, pat in _SECTION_HEADERS.items():
        if pat.match(clean):
            return key
    return None


def _split_sections(lines: list[str]) -> dict:
    """Return dict: section_key → list of lines belonging to that section.
    Lines before the first header go into 'header'.
    """
    sections: dict[str, list[str]] = {"header": []}
    current = "header"
    for line in lines:
        key = _classify(line)
        if key:
            current = key
            sections.setdefault(current, [])
        else:
            sections.setdefault(current, []).append(line)
    return sections


# ── Header (name / headline / location) ───────────────────────────────────────

def _parse_header(lines: list[str]) -> dict:
    """First non-blank line = name, second = headline, rest may contain location."""
    name = ""
    location = ""
    for i, line in enumerate(lines):
        if not name:
            name = line
            continue
        # LinkedIn sometimes puts the headline on line 2; skip it.
        # Location lines typically contain a comma or known geo words.
        if i >= 2 and ("," in line or re.search(r"\b(city|state|country|nigeria|uk|us|canada|ghana|london|lagos|abuja|accra|nairobi)\b", line, re.I)):
            location = line
            break
    return {"name": name, "location": location}


# ── Contact section ────────────────────────────────────────────────────────────

def _parse_contact(lines: list[str]) -> dict:
    email = phone = linkedin_url = ""
    for line in lines:
        if not email and _EMAIL.search(line):
            email = _EMAIL.search(line).group(0)
        if not phone and _PHONE.search(line) and not _EMAIL.search(line):
            phone = _PHONE.search(line).group(0).strip()
        if not linkedin_url and _LI_URL.search(line):
            linkedin_url = "https://www." + _LI_URL.search(line).group(0)
    return {"email": email, "phone": phone, "linkedin_url": linkedin_url}


# ── Experience section ─────────────────────────────────────────────────────────

def _is_date_range_line(line: str) -> bool:
    """True if the line looks like a date range (may include duration)."""
    return bool(_DATE_RANGE.search(line)) and (
        "–" in line or "-" in line or "present" in line.lower() or _DURATION.search(line)
    )


def _parse_experience(lines: list[str]) -> list[dict]:
    """
    Each job block looks like:
      Title
      Company · Type          (dot/bullet separator)
      Date range · Duration
      Location                (optional)
      Description lines…
    """
    entries: list[dict] = []
    current: dict | None = None
    state = "title"   # title → company → dates → body

    def _flush():
        if current and current.get("title") and current.get("company"):
            if not current["bullets"] or not any(b.strip() for b in current["bullets"]):
                current["bullets"] = [""]
            entries.append(current)

    for line in lines:
        # New job block starts when we see a line that is NOT a date range,
        # NOT a continuation of bullets, and the previous block had dates.
        if state == "body" and not _is_date_range_line(line) and current:
            # Heuristic: a short line without bullet prefix that follows body
            # *could* be a new title — but only if it looks like a job title
            # (no bullet prefix, not overly long description line).
            if (
                not _BULLET_PREFIX.match(line)
                and len(line) < 80
                and not line.lower().startswith(("·", "•", "-"))
                and _looks_like_title(line)
            ):
                _flush()
                current = _new_exp()
                current["title"] = line
                state = "company"
                continue

        if state == "title":
            if not current:
                current = _new_exp()
            current["title"] = line
            state = "company"

        elif state == "company":
            # Strip employment type suffix (e.g. "· Full-time")
            company_raw = re.split(r"\s*[·•]\s*", line)[0].strip()
            current["company"] = company_raw  # type: ignore[index]
            state = "dates"

        elif state == "dates":
            if _is_date_range_line(line):
                dates = _parse_date_range(line)
                current["startDate"] = dates[0]   # type: ignore[index]
                current["endDate"]   = dates[1]   # type: ignore[index]
                current["current"]   = "present" in line.lower()  # type: ignore[index]
                state = "location_or_body"
            else:
                # Some exports skip the date line — treat as body
                current["bullets"].append(_BULLET_PREFIX.sub("", line))  # type: ignore[index]
                state = "body"

        elif state == "location_or_body":
            # If short and no bullet → location, else body
            if len(line) < 50 and not _BULLET_PREFIX.match(line) and "," in line:
                current["location"] = line  # type: ignore[index]
            else:
                current["bullets"].append(_BULLET_PREFIX.sub("", line))  # type: ignore[index]
            state = "body"

        elif state == "body":
            current["bullets"].append(_BULLET_PREFIX.sub("", line))  # type: ignore[index]

    _flush()

    # Clean up bullets
    for e in entries:
        e["bullets"] = [b for b in e["bullets"] if b.strip()] or [""]

    return entries


def _looks_like_title(line: str) -> bool:
    """Very rough heuristic: a job title is title-cased or ALL-CAPS, short."""
    words = line.split()
    if not words:
        return False
    titled = sum(1 for w in words if w and w[0].isupper())
    return titled / len(words) >= 0.5


def _new_exp() -> dict:
    return {
        "id": str(uuid.uuid4()),
        "title": "",
        "company": "",
        "location": "",
        "startDate": "",
        "endDate": "",
        "current": False,
        "bullets": [],
    }


def _parse_date_range(line: str) -> tuple[str, str]:
    """Return (startDate, endDate) strings from a date-range line."""
    # Strip duration suffix like "· 2 yrs 3 mos"
    line = re.split(r"\s*[·•]\s*\d", line)[0]
    parts = re.split(r"\s*[-–—]\s*", line, maxsplit=1)
    start = parts[0].strip() if parts else ""
    end   = parts[1].strip() if len(parts) > 1 else ""
    end   = "" if end.lower() == "present" else end
    return start, end


# ── Education section ──────────────────────────────────────────────────────────

def _parse_education(lines: list[str]) -> list[dict]:
    """
    Typical blocks:
      School Name
      Degree, Field of Study
      Start – End
      Grade: X  (optional)
    OR:
      Degree · Field
      School Name
      Date range
    """
    entries: list[dict] = []
    current: dict | None = None

    def _flush():
        if current and (current.get("institution") or current.get("degree")):
            entries.append(current)

    def _new_edu() -> dict:
        return {
            "id": str(uuid.uuid4()),
            "institution": "",
            "degree": "",
            "field": "",
            "startDate": "",
            "endDate": "",
            "gpa": "",
        }

    state = "institution"

    for line in lines:
        if state == "institution":
            current = _new_edu()
            current["institution"] = line
            state = "degree"

        elif state == "degree":
            if _is_date_range_line(line):
                # Some exports put dates right after institution
                dates = _parse_date_range(line)
                current["startDate"] = dates[0]
                current["endDate"]   = dates[1]
                state = "extra"
            else:
                # Split "Bachelor of Science, Computer Science"
                parts = re.split(r"[,·]", line, maxsplit=1)
                current["degree"] = parts[0].strip()
                current["field"]  = parts[1].strip() if len(parts) > 1 else ""
                state = "dates"

        elif state == "dates":
            if _is_date_range_line(line):
                dates = _parse_date_range(line)
                current["startDate"] = dates[0]
                current["endDate"]   = dates[1]
            else:
                current["field"] = current["field"] or line
            state = "extra"

        elif state == "extra":
            if line.lower().startswith("grade"):
                gpa = re.search(r"[\d.]+", line)
                if gpa:
                    current["gpa"] = gpa.group(0)
            elif not _is_date_range_line(line) and len(line) < 60:
                # Looks like a new institution
                _flush()
                current = _new_edu()
                current["institution"] = line
                state = "degree"

    _flush()
    return entries


# ── Skills section ─────────────────────────────────────────────────────────────

def _parse_skills(lines: list[str]) -> list[dict]:
    items: list[str] = []
    for line in lines:
        # LinkedIn sometimes outputs "skill1 • skill2 • skill3"
        if "•" in line or "·" in line:
            items.extend(re.split(r"[•·]", line))
        elif "," in line:
            items.extend(line.split(","))
        else:
            items.append(line)
    items = [s.strip() for s in items if s.strip()]
    if not items:
        return []
    return [{"id": str(uuid.uuid4()), "category": "Skills", "items": items}]


# ── Assembler ──────────────────────────────────────────────────────────────────

def _build_resume(sections: dict) -> dict:
    header_info  = _parse_header(sections.get("header", []))
    contact_info = _parse_contact(sections.get("contact", []))

    links = []
    if contact_info["linkedin_url"]:
        links.append({"id": str(uuid.uuid4()), "label": "LinkedIn", "url": contact_info["linkedin_url"]})
    else:
        links.append({"id": str(uuid.uuid4()), "label": "LinkedIn", "url": ""})
    links.append({"id": str(uuid.uuid4()), "label": "Portfolio", "url": ""})

    return {
        "personalInfo": {
            "name":     header_info["name"],
            "email":    contact_info["email"],
            "phone":    contact_info["phone"],
            "location": header_info["location"],
            "links":    links,
        },
        "summary":    "\n".join(sections.get("summary", [])),
        "experience": _parse_experience(sections.get("experience", [])),
        "education":  _parse_education(sections.get("education", [])),
        "skills":     _parse_skills(sections.get("skills", [])),
    }
