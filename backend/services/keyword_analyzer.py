from data.keywords_patterns import ALL_PROFESSIONAL_KEYWORDS, DOMAIN_KEYWORDS
from utils.text_processing import clean_text


class KeywordAnalyzer:

    # ── Internal helpers ──────────────────────────────────────────────────────

    def _ngrams(self, words: list, n: int) -> list:
        """Return all n-word sequences from a token list."""
        return [' '.join(words[i:i + n]) for i in range(len(words) - n + 1)]

    def _extract(self, text: str) -> set:
        """
        Extract professional keywords from text.

        Strategy: clean → tokenise → build 1-, 2-, and 3-word n-grams →
        match each gram against the taxonomy.  Longer phrases are matched
        first so "machine learning" is captured as a phrase rather than
        two separate tokens.
        """
        cleaned = clean_text(text)
        words = cleaned.split()
        found = set()

        for n in (3, 2, 1):
            for gram in self._ngrams(words, n):
                if gram in ALL_PROFESSIONAL_KEYWORDS:
                    found.add(gram)

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
