"""
Keyword analyzer implementing the Multi-Layered Extraction Method:

  Layer 1 — Core Competencies (Hard Skills & Tools)
            Nouns/proper nouns found after trigger phrases such as
            "experience with", "proficiency in", "knowledge of".
            Highest priority; injected into the resume first.

  Layer 2 — Action-Oriented Responsibilities ("The How")
            Verb-noun pairs extracted from the Responsibilities section.
            Preserves the energy and seniority context of the role.

  Layer 3 — Cultural & Domain Context (Industry Jargon)
            Recurring themes and values from "About the Company" /
            "Preferred Qualifications" sections.

Combined with Frequency × Sectional-Priority × Title-Alignment weighting
as described in the extraction guide.
"""

import re

from data.keywords_patterns import ALL_PROFESSIONAL_KEYWORDS, DOMAIN_KEYWORDS
from utils.text_processing import clean_text


# ── Stop-word / noise filter ──────────────────────────────────────────────────

_EXTRACTION_NOISE = frozenset({
    'the', 'and', 'for', 'with', 'our', 'your', 'this', 'that', 'from',
    'are', 'will', 'have', 'been', 'has', 'was', 'were', 'not', 'but',
    'all', 'can', 'may', 'etc', 'per', 'via', 'its', 'you', 'who',
    'work', 'role', 'team', 'help', 'make', 'able', 'good', 'new',
    'inc', 'ltd', 'llc', 'corp', 'plc', 'job', 'company', 'based',
    'must', 'also', 'very', 'well', 'more', 'some', 'such', 'any',
    'own', 'top', 'use', 'way', 'day', 'end', 'set', 'got', 'get',
})

# ── Descriptor / adjective blocklist ─────────────────────────────────────────
# Terms that look like keywords but are plain English descriptors.

_DESCRIPTOR_BLOCKLIST = frozenset({
    'well-structured', 'well-defined', 'well-designed', 'well-written',
    'well-organized', 'well-established', 'well-documented',
    'open-ended', 'user-centered', 'user-centric', 'user-friendly',
    'user-facing', 'customer-facing', 'customer-centric', 'client-facing',
    'self-motivated', 'self-starter', 'self-directed', 'self-managed',
    'detail-oriented', 'results-driven', 'data-driven', 'deadline-driven',
    'fast-paced', 'high-quality', 'high-impact', 'high-performance',
    'high-level', 'low-level', 'large-scale', 'small-scale',
    'long-term', 'short-term', 'real-time', 'full-time', 'part-time',
    'best-in-class', 'state-of-the-art', 'cutting-edge', 'best-practice',
    'forward-thinking', 'solution-oriented', 'value-driven', 'goal-oriented',
    'action-oriented', 'cross-functional', 'multi-disciplinary',
    'mock-ups', 'mock-up', 'write-ups', 'write-up', 'start-up', 'start-ups',
    'collaborative', 'innovative', 'motivated', 'passionate', 'enthusiastic',
    'proactive', 'dynamic', 'driven', 'excellent', 'strong', 'solid',
    'proven', 'demonstrated', 'effective', 'efficient', 'reliable',
    'flexible', 'adaptable', 'organized', 'structured', 'analytical',
    'detail', 'documentation',
    'experience', 'background', 'knowledge', 'understanding',
    'ability', 'skills', 'proficiency', 'expertise',
    'environment', 'culture', 'team', 'role', 'position',
    'opportunity', 'company', 'organization', 'business',
})

# ── Sentence splitter ─────────────────────────────────────────────────────────

_SENTENCE_RE = re.compile(r'(?<=[.!?\n])\s+')

# ── Required / preferred context signals ─────────────────────────────────────

_REQUIRED_RE = re.compile(
    r'\b(required|must[- ]have|must have|essential|mandatory|minimum|'
    r'you must|you will need|you should have|we require|'
    r'key requirement|core requirement|critical skill)\b',
    re.IGNORECASE,
)
_PREFERRED_RE = re.compile(
    r'\b(preferred|nice[- ]to[- ]have|bonus|plus|desirable|optional|'
    r'ideally|advantageous|not required|a plus)\b',
    re.IGNORECASE,
)

# ── JD section header map ─────────────────────────────────────────────────────

_SECTION_HEADERS = {
    'requirements': [
        'requirements', 'required qualifications', 'qualifications',
        'minimum qualifications', 'required experience', 'required skills',
        'must have', 'what you need', 'what we need', 'prerequisites',
        'key requirements', 'basic qualifications', 'core requirements',
    ],
    'responsibilities': [
        'responsibilities', 'key responsibilities', 'what you will do',
        "what you'll do", 'your responsibilities', 'role overview',
        'about the role', 'duties', 'what the role involves',
        'day to day', 'day-to-day', 'in this role', 'your role',
        'what you do', 'the role',
    ],
    'preferred': [
        'preferred qualifications', 'preferred', 'nice to have',
        'nice-to-have', 'bonus', 'desired qualifications',
        'additional requirements', 'good to have', 'advantageous',
        'desirable', 'a plus', 'added advantage',
    ],
    'about': [
        'about us', 'about the company', 'who we are', 'our story',
        'company overview', 'the company', 'our mission', 'about',
    ],
    'benefits': [
        'benefits', 'what we offer', 'perks', 'compensation',
        'salary', 'why join', 'why work here', 'total rewards',
    ],
}

# ── Layer 1 trigger phrases ───────────────────────────────────────────────────
# Patterns that signal a hard-skill or tool requirement immediately follows.

_L1_TRIGGERS = re.compile(
    r'(?:experience\s+(?:with|in|using)|'
    r'proficien(?:t|cy)\s+(?:with|in)|'
    r'knowledge\s+(?:of|in|with)|'
    r'familiarity\s+(?:with|in)|'
    r'expertise\s+(?:with|in)|'
    r'skilled\s+(?:with|in)|'
    r'working\s+knowledge\s+(?:of|with)|'
    r'hands-on\s+(?:experience\s+)?(?:with|in)|'
    r'background\s+in|'
    r'solid\s+understanding\s+of|'
    r'deep\s+understanding\s+of|'
    r'strong\s+understanding\s+of|'
    r'understanding\s+of|'
    r'proficiency\s+in|'
    r'demonstrated\s+experience\s+(?:with|in))\s+'
    r'([A-Za-z0-9][^,.;:\n]{2,60})',
    re.IGNORECASE,
)

# ── Layer 2: action verbs for responsibility extraction ───────────────────────

_ACTION_VERBS = frozenset({
    'coordinate', 'optimise', 'optimize', 'manage', 'develop', 'design',
    'implement', 'build', 'create', 'lead', 'drive', 'deliver', 'oversee',
    'establish', 'define', 'maintain', 'improve', 'analyze', 'analyse',
    'evaluate', 'research', 'execute', 'conduct', 'support', 'ensure',
    'collaborate', 'communicate', 'present', 'report', 'monitor', 'track',
    'review', 'identify', 'assess', 'plan', 'integrate', 'deploy',
    'architect', 'engineer', 'scale', 'launch', 'ship', 'release',
    'mentor', 'coach', 'hire', 'recruit', 'train', 'onboard', 'partner',
    'align', 'facilitate', 'influence', 'own', 'spearhead', 'champion',
    'transform', 'streamline', 'automate', 'migrate', 'refactor',
    'validate', 'test', 'debug', 'document', 'write', 'author',
    'configure', 'administer', 'troubleshoot', 'resolve', 'diagnose',
    'synthesise', 'synthesize', 'gather', 'collect', 'model', 'forecast',
    'visualize', 'visualise', 'present', 'pitch', 'negotiate', 'secure',
    'grow', 'expand', 'acquire', 'retain', 'engage', 'activate',
})

# Verb-noun pair extraction from a single sentence
_VERB_NOUN_RE = re.compile(
    r'\b(' + '|'.join(sorted(_ACTION_VERBS, key=len, reverse=True)) + r')\b'
    r'\s+(?:and\s+)?(?:the\s+|a\s+|an\s+)?([a-zA-Z][a-zA-Z0-9\s\-]{2,40}?)(?=[,;.\n]|$)',
    re.IGNORECASE,
)

# ── Acronym ↔ full-term mapping ───────────────────────────────────────────────

_ACRONYM_FULL = {
    'seo': 'search engine optimization',
    'sem': 'search engine marketing',
    'crm': 'customer relationship management',
    'erp': 'enterprise resource planning',
    'api': 'application programming interface',
    'ui': 'user interface',
    'ux': 'user experience',
    'ci': 'continuous integration',
    'cd': 'continuous deployment',
    'kpi': 'key performance indicator',
    'roi': 'return on investment',
    'b2b': 'business to business',
    'b2c': 'business to consumer',
    'saas': 'software as a service',
    'paas': 'platform as a service',
    'iaas': 'infrastructure as a service',
    'ml':  'machine learning',
    'ai':  'artificial intelligence',
    'nlp': 'natural language processing',
    'sql': 'structured query language',
    'oop': 'object oriented programming',
    'mvp': 'minimum viable product',
    'gtm': 'go to market',
    'okr': 'objectives and key results',
    'sla': 'service level agreement',
    'qa':  'quality assurance',
    'uat': 'user acceptance testing',
    'aws': 'amazon web services',
    'gcp': 'google cloud platform',
    'hr':  'human resources',
    'pr':  'public relations',
    'pm':  'product management',
}
# Reverse mapping: full term → acronym
_FULL_ACRONYM = {v: k for k, v in _ACRONYM_FULL.items()}

# Title words whose presence makes certain keyword categories more important
_SENIOR_SIGNALS  = re.compile(r'\b(senior|lead|principal|staff|head|director|vp|vice president|chief)\b', re.IGNORECASE)
_DOMAIN_TITLE_SIGNALS = {
    'software_engineering': re.compile(r'\b(engineer|developer|programmer|architect|devops|sre|full.?stack)\b', re.IGNORECASE),
    'data_analytics':       re.compile(r'\b(data|analyst|scientist|analytics|bi|intelligence|ml|machine learning)\b', re.IGNORECASE),
    'product_design':       re.compile(r'\b(design|designer|ux|ui|product|creative|visual)\b', re.IGNORECASE),
    'marketing':            re.compile(r'\b(marketing|growth|brand|content|seo|social media|digital)\b', re.IGNORECASE),
    'finance_accounting':   re.compile(r'\b(finance|financial|accounting|accountant|analyst|controller|cfo)\b', re.IGNORECASE),
    'human_resources':      re.compile(r'\b(hr|human resources|talent|recruiting|recruiter|people ops)\b', re.IGNORECASE),
}


# ══════════════════════════════════════════════════════════════════════════════
# KeywordAnalyzer
# ══════════════════════════════════════════════════════════════════════════════

class KeywordAnalyzer:

    # ── Step 1: Section parsing ───────────────────────────────────────────────

    def _parse_jd_sections(self, text: str) -> dict:
        """
        Split JD text into named sections based on common header patterns.
        Returns a dict: { 'title', 'requirements', 'responsibilities',
                          'preferred', 'about', 'benefits', 'other' }
        """
        sections = {k: '' for k in ('title', 'requirements', 'responsibilities',
                                     'preferred', 'about', 'benefits', 'other')}

        # Best-effort: first non-empty short line is the job title
        for line in text.splitlines()[:8]:
            stripped = line.strip()
            if stripped and len(stripped) < 120 and not stripped.startswith('#'):
                sections['title'] = stripped
                break

        # Build a flat list of (priority, section_name, header_regex) sorted by
        # header length (longest → most specific) to reduce false matches.
        header_patterns = []
        for sec_name, headers in _SECTION_HEADERS.items():
            for h in headers:
                pat = re.compile(
                    r'(?:^|\n)\s*(?:#+\s*)?' + re.escape(h) + r'\s*[:\-]?\s*(?:\n|$)',
                    re.IGNORECASE | re.MULTILINE,
                )
                header_patterns.append((len(h), sec_name, pat))
        header_patterns.sort(key=lambda x: -x[0])

        # Find all header positions
        hits = []  # (position, section_name)
        for _, sec_name, pat in header_patterns:
            for m in pat.finditer(text):
                hits.append((m.end(), sec_name))
        hits.sort(key=lambda x: x[0])

        if not hits:
            # No structured headers found — treat everything as requirements
            sections['requirements'] = text
            return sections

        # Assign text between consecutive headers to the named section
        for i, (start, sec_name) in enumerate(hits):
            end = hits[i + 1][0] if i + 1 < len(hits) else len(text)
            chunk = text[start:end].strip()
            if chunk:
                sections[sec_name] = (sections[sec_name] + '\n' + chunk).strip()

        # Anything before the first header goes to 'other' (intro / title area)
        sections['other'] = text[:hits[0][0]].strip()

        return sections

    # ── Step 2: Core extraction helpers ──────────────────────────────────────

    def _ngrams(self, words: list, n: int) -> list:
        return [' '.join(words[i:i + n]) for i in range(len(words) - n + 1)]

    def _taxonomy_extract(self, text: str) -> set:
        """Primary: clean → tokenise → n-gram taxonomy matching (3→2→1)."""
        cleaned = clean_text(text)
        words   = cleaned.split()
        found   = set()
        for n in (3, 2, 1):
            for gram in self._ngrams(words, n):
                if gram in ALL_PROFESSIONAL_KEYWORDS and gram not in _DESCRIPTOR_BLOCKLIST:
                    found.add(gram)
        return found

    def _tech_terms_extract(self, text: str) -> set:
        """
        Secondary: technical compound names (Node.js, C#) and ALL-CAPS acronyms.
        Hyphens are intentionally excluded as connectors to avoid picking up
        plain-English adjectives like 'well-structured'.
        """
        terms = set()
        for m in re.finditer(r'\b[A-Za-z][A-Za-z0-9]{0,20}(?:[\.#\+][A-Za-z0-9]+)+\b', text):
            terms.add(m.group().lower())
        for m in re.finditer(r'\b([A-Z]{3,6})\b', text):
            acr = m.group().lower()
            if acr not in _EXTRACTION_NOISE and acr not in _DESCRIPTOR_BLOCKLIST:
                terms.add(acr)
        return terms

    # ── Step 3: Layer-specific extractors ────────────────────────────────────

    def _extract_layer1(self, sections: dict) -> set:
        """
        Layer 1 — Core Competencies.
        Scans requirements + responsibilities for nouns/phrases that follow
        Layer 1 trigger phrases ("experience with", "proficiency in", etc.).
        Also includes all taxonomy hits from the requirements section directly.
        """
        layer1 = set()
        target_text = (sections['requirements'] + '\n' + sections['responsibilities'])

        # Trigger-phrase extraction
        for m in _L1_TRIGGERS.finditer(target_text):
            candidate = m.group(1).strip().lower()
            # Keep only if it (or a sub-phrase of it) is in the taxonomy
            cleaned = clean_text(candidate)
            words = cleaned.split()
            for n in (3, 2, 1):
                for gram in self._ngrams(words, n):
                    if gram in ALL_PROFESSIONAL_KEYWORDS and gram not in _DESCRIPTOR_BLOCKLIST:
                        layer1.add(gram)

        # All taxonomy hits from requirements section (high confidence = Layer 1)
        layer1.update(self._taxonomy_extract(sections['requirements']))
        layer1.update(self._tech_terms_extract(sections['requirements']))

        return layer1

    def _extract_layer2(self, responsibilities_text: str) -> list:
        """
        Layer 2 — Action-Oriented Responsibilities.
        Extracts verb-noun pairs from the responsibilities section.
        Returns a list of (verb, object_phrase) tuples that exist in the taxonomy.
        """
        pairs = []
        seen = set()
        for sentence in _SENTENCE_RE.split(responsibilities_text):
            for m in _VERB_NOUN_RE.finditer(sentence):
                verb   = m.group(1).lower()
                obj    = m.group(2).strip().lower()
                # Only keep the object phrase if any part of it is in the taxonomy
                cleaned = clean_text(obj)
                words   = cleaned.split()
                for n in (3, 2, 1):
                    for gram in self._ngrams(words, n):
                        if (gram in ALL_PROFESSIONAL_KEYWORDS
                                and gram not in _DESCRIPTOR_BLOCKLIST
                                and gram not in seen):
                            pairs.append((verb, gram))
                            seen.add(gram)
        return pairs

    def _extract_layer3(self, sections: dict) -> set:
        """
        Layer 3 — Cultural & Domain Context.
        Extracts industry jargon from preferred qualifications and about sections.
        """
        layer3 = set()
        target = sections['preferred'] + '\n' + sections['about'] + '\n' + sections['other']
        layer3.update(self._taxonomy_extract(target))
        layer3.update(self._tech_terms_extract(target))
        return layer3

    # ── Step 4: Acronym expansion ─────────────────────────────────────────────

    def _expand_acronyms(self, terms: set) -> set:
        """
        For each term, add its acronym counterpart if one exists.
        Ensures both "SEO" and "search engine optimization" are in the set
        when either is found, so matching works regardless of which form the
        resume uses.
        """
        expanded = set(terms)
        for term in terms:
            if term in _ACRONYM_FULL:
                expanded.add(_ACRONYM_FULL[term])
            if term in _FULL_ACRONYM:
                expanded.add(_FULL_ACRONYM[term])
        return expanded

    # ── Step 5: Weighting & ranking ───────────────────────────────────────────

    def _necessity_score(
        self,
        keyword: str,
        layer: int,
        jd_lower: str,
        jd_text: str,
        sentences: list,
        domain: str,
        job_title: str,
    ) -> float:
        """
        Score a keyword by professional necessity using Frequency ×
        Sectional-Priority × Title-Alignment weighting from the guide.
        """
        kw_lower = keyword.lower()
        score    = 0.0

        # ── Layer base score ──────────────────────────────────────────────────
        # Layer 1 (Core Competencies) are non-negotiable → highest base
        layer_base = {1: 10.0, 2: 6.0, 3: 2.0}
        score += layer_base.get(layer, 0.0)

        # ── Frequency (High Frequency = 3+ → central to role) ─────────────────
        frequency = len(re.findall(r'\b' + re.escape(kw_lower) + r'\b', jd_lower))
        if frequency >= 3:
            score += 6.0      # "central to the role"
        elif frequency == 2:
            score += 3.0
        else:
            score += frequency * 1.5

        # ── Sectional priority ────────────────────────────────────────────────
        for sentence in sentences:
            s_lower = sentence.lower()
            if kw_lower in s_lower:
                if _REQUIRED_RE.search(sentence):
                    score += 6.0    # "Requirements" section carries more weight
                if _PREFERRED_RE.search(sentence):
                    score -= 3.0    # "Preferred" reduces but doesn't eliminate

        # ── Title alignment ───────────────────────────────────────────────────
        if job_title:
            title_lower = job_title.lower()
            # Senior / lead title → leadership & strategy keywords become critical
            if _SENIOR_SIGNALS.search(job_title):
                if any(w in kw_lower for w in ('leadership', 'strategy', 'management',
                                                'stakeholder', 'roadmap', 'vision')):
                    score += 5.0
            # Domain-specific title alignment
            domain_sig = _DOMAIN_TITLE_SIGNALS.get(domain)
            if domain_sig and domain_sig.search(job_title):
                domain_kws = set(DOMAIN_KEYWORDS.get(domain, []))
                if kw_lower in domain_kws:
                    score += 4.0

        # ── Domain relevance ──────────────────────────────────────────────────
        domain_kws = set(DOMAIN_KEYWORDS.get(domain, []))
        if kw_lower in domain_kws:
            score += 3.0

        # ── Phrase specificity (multi-word = more targeted) ───────────────────
        word_count = len(keyword.split())
        score += (word_count - 1) * 1.5

        # ── Noise penalty: rare single words ─────────────────────────────────
        if word_count == 1 and frequency <= 1:
            score -= 2.0

        return score

    def _rank_keywords(
        self,
        keywords: set,
        layer_map: dict,     # keyword → layer number
        jd_text: str,
        domain: str,
        job_title: str,
    ) -> list:
        """
        Rank keywords by necessity score, highest first.
        Drops keywords whose score is ≤ 0 (too generic / irrelevant).
        """
        jd_lower  = jd_text.lower()
        sentences = _SENTENCE_RE.split(jd_text)

        scored = []
        for kw in keywords:
            layer = layer_map.get(kw, 3)
            s = self._necessity_score(kw, layer, jd_lower, jd_text,
                                      sentences, domain, job_title)
            if s > 0:
                scored.append((kw, s, layer))

        # Primary sort: necessity score desc; secondary: layer asc (1 before 3)
        scored.sort(key=lambda x: (-x[1], x[2]))
        return [kw for kw, _, _ in scored]

    # ── Public API ────────────────────────────────────────────────────────────

    def detect_domain(self, text: str) -> str:
        """Identify the primary professional domain of a text block."""
        cleaned = clean_text(text)
        scores  = {
            domain: sum(1 for kw in kws if kw in cleaned)
            for domain, kws in DOMAIN_KEYWORDS.items()
        }
        best = max(scores, key=scores.get)
        return best if scores[best] > 0 else 'general'

    def analyze(self, resume_text: str, jd_text: str) -> dict:
        """
        Full keyword analysis pipeline implementing the three-layer method.

        Returns:
          matched  — keywords present in both resume and JD, ranked by necessity.
          missing  — keywords in JD but absent from resume, ranked:
                     Layer 1 (Core Competencies) first, then Layer 2
                     (Responsibilities), then Layer 3 (Context).
          total_jd — total distinct professional keywords found in the JD.
          domain   — detected professional domain.
        """
        # ── 1. Parse JD into sections ─────────────────────────────────────────
        sections  = self._parse_jd_sections(jd_text)
        job_title = sections.get('title', '')
        domain    = self.detect_domain(jd_text)

        # ── 2. Three-layer JD keyword extraction ──────────────────────────────

        # Layer 1: Core Competencies from requirements + trigger phrases
        l1_kws = self._extract_layer1(sections)

        # Layer 2: Verb-noun pairs from responsibilities
        l2_pairs = self._extract_layer2(sections['responsibilities'])
        l2_kws   = {kw for _, kw in l2_pairs}

        # Layer 3: Industry jargon from preferred / about sections
        l3_kws = self._extract_layer3(sections)

        # Also extract from the full JD as a safety net (catches terms in
        # unlabelled or merged sections)
        full_kws = self._taxonomy_extract(jd_text)
        full_kws.update(self._tech_terms_extract(jd_text))

        # Union of all JD keywords; assign lowest layer number (highest priority)
        all_jd_kws: set = set()
        layer_map: dict = {}

        def _add(kws: set, layer: int):
            for kw in kws:
                if kw not in _DESCRIPTOR_BLOCKLIST:
                    all_jd_kws.add(kw)
                    if layer < layer_map.get(kw, 99):
                        layer_map[kw] = layer

        _add(l1_kws,   1)
        _add(l2_kws,   2)
        _add(l3_kws,   3)
        _add(full_kws, 3)   # unlabelled hits default to Layer 3

        # ── 3. Acronym expansion ───────────────────────────────────────────────
        expanded_jd = self._expand_acronyms(all_jd_kws)
        for kw in expanded_jd - all_jd_kws:
            all_jd_kws.add(kw)
            layer_map[kw] = layer_map.get(kw, 3)

        # ── 4. Resume keyword extraction ───────────────────────────────────────
        resume_kws = self._taxonomy_extract(resume_text)
        resume_kws.update(self._tech_terms_extract(resume_text))
        resume_kws = self._expand_acronyms(resume_kws)

        # ── 5. Match / missing split ───────────────────────────────────────────
        matched_set = all_jd_kws & resume_kws
        missing_set = all_jd_kws - resume_kws

        # ── 6. Rank by necessity ───────────────────────────────────────────────
        missing_ranked = self._rank_keywords(missing_set, layer_map,
                                             jd_text, domain, job_title)
        matched_ranked = self._rank_keywords(matched_set, layer_map,
                                             jd_text, domain, job_title)
        # Append any matched keywords that scored ≤ 0 (still matched, just low signal)
        ranked_set = set(matched_ranked)
        matched_ranked += sorted(matched_set - ranked_set)

        return {
            'matched':  matched_ranked,
            'missing':  missing_ranked,
            'total_jd': len(all_jd_kws),
            'domain':   domain,
        }
