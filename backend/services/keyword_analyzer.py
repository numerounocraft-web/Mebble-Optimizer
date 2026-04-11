import re

from data.keywords_patterns import ALL_PROFESSIONAL_KEYWORDS, DOMAIN_KEYWORDS
from utils.text_processing import clean_text

# Common words to exclude from secondary JD-specific term extraction
_EXTRACTION_NOISE = frozenset({
    'the', 'and', 'for', 'with', 'our', 'your', 'this', 'that', 'from',
    'are', 'will', 'have', 'been', 'has', 'was', 'were', 'not', 'but',
    'all', 'can', 'may', 'etc', 'per', 'via', 'its', 'you', 'who',
    'work', 'role', 'team', 'help', 'make', 'able', 'good', 'new',
    'inc', 'ltd', 'llc', 'corp', 'plc', 'job', 'company', 'based',
    'must', 'also', 'very', 'well', 'more', 'some', 'such', 'any',
    'own', 'top', 'use', 'way', 'day', 'end', 'set', 'got', 'get',
})


class KeywordAnalyzer:

    # ── Internal helpers ──────────────────────────────────────────────────────

    def _ngrams(self, words: list, n: int) -> list:
        """Return all n-word sequences from a token list."""
        return [' '.join(words[i:i + n]) for i in range(len(words) - n + 1)]

    def _extract_tech_terms(self, text: str) -> set:
        """
        Secondary extraction pass for technical terms not always covered by
        the taxonomy — e.g., compound names with dots/hashes (Node.js, C#),
        version-suffixed tools (Python3), and 3-6 char acronyms (API, REST).
        Applied to raw (un-cleaned) text to preserve casing signals.
        """
        terms = set()

        # Compound technical terms: alphanumeric + special connector (. # + -)
        # Captures: Node.js, Vue.js, .NET, C#, C++, Power BI (already in taxonomy),
        # GraphQL, TypeScript-style names, etc.
        for m in re.finditer(r'\b[A-Za-z][A-Za-z0-9]{0,20}(?:[\.#\+\-][A-Za-z0-9]+)+\b', text):
            terms.add(m.group().lower())

        # 3-6 char ALL-CAPS acronyms that appear in the text (REST, API, SQL, GCP …)
        # These are often important professional terms not spelled out in full.
        for m in re.finditer(r'\b([A-Z]{3,6})\b', text):
            acr = m.group().lower()
            if acr not in _EXTRACTION_NOISE:
                terms.add(acr)

        return terms

    def _extract(self, text: str) -> set:
        """
        Extract professional keywords from text.

        Strategy:
        1. Primary  — clean → tokenise → n-gram taxonomy matching (3→2→1).
           Longer phrases win so "machine learning" beats "machine" + "learning".
        2. Secondary — raw-text scan for technical compound terms and acronyms
           that are field-specific but may not be in the taxonomy verbatim.
        """
        # ── Primary: taxonomy n-gram matching ────────────────────────────────
        cleaned = clean_text(text)
        words = cleaned.split()
        found = set()

        for n in (3, 2, 1):
            for gram in self._ngrams(words, n):
                if gram in ALL_PROFESSIONAL_KEYWORDS:
                    found.add(gram)

        # ── Secondary: technical terms not covered by taxonomy ────────────────
        found.update(self._extract_tech_terms(text))

        return found

    # ── Public API ────────────────────────────────────────────────────────────

    def detect_domain(self, text: str) -> str:
        """
        Identify the primary professional domain of a text block.

        Counts taxonomy hits per domain and returns the winner.  Used to
        surface the most relevant field label in the API response.
        """
        cleaned = clean_text(text)
        scores = {
            domain: sum(1 for kw in kws if kw in cleaned)
            for domain, kws in DOMAIN_KEYWORDS.items()
        }
        best = max(scores, key=scores.get)
        return best if scores[best] > 0 else 'general'

    def analyze(self, resume_text: str, jd_text: str) -> dict:
        """
        Full keyword analysis pipeline.

        Returns matched keywords (present in both resume and JD),
        missing keywords (in JD but absent from resume), and the
        total number of professional keywords found in the JD.
        """
        resume_keywords = self._extract(resume_text)
        jd_keywords = self._extract(jd_text)

        matched = sorted(resume_keywords & jd_keywords)
        missing = sorted(jd_keywords - resume_keywords)

        return {
            'matched': matched,
            'missing': missing,
            'total_jd': len(jd_keywords),
            'domain': self.detect_domain(jd_text),
        }
