import re
from data.action_words import ACTION_WORDS, WEAK_WORDS
from utils.text_processing import tokenize, clean_text


EXPERIENCE_SECTION_PATTERNS = [
    r'experience', r'work history', r'employment', r'professional background',
    r'career history', r'positions held', r'work experience'
]


class ActionWordsAnalyzer:
    def _extract_experience_text(self, text: str) -> str:
        """Attempt to isolate the experience section from resume text."""
        text_lower = text.lower()
        start = -1
        for pattern in EXPERIENCE_SECTION_PATTERNS:
            idx = text_lower.find(pattern)
            if idx != -1:
                start = idx
                break

        if start == -1:
            return text  # Fall back to full text

        # Cut off at next major section heading
        section_endings = [
            'education', 'skills', 'projects', 'certifications',
            'awards', 'publications', 'references', 'summary', 'objective'
        ]
        end = len(text)
        for ending in section_endings:
            idx = text_lower.find(ending, start + 50)
            if idx != -1 and idx < end:
                end = idx

        return text[start:end]

    def extract_verbs(self, text: str) -> list:
        """Extract first words of bullet points (likely action verbs)."""
        lines = text.split('\n')
        verbs = []
        for line in lines:
            line = line.strip()
            # Lines starting with bullet markers or capital words
            line = re.sub(r'^[•\-\*\u2022\u2023\u25E6]\s*', '', line)
            if not line:
                continue
            first_word = line.split()[0].lower().rstrip('.,;:') if line.split() else ''
            if first_word and len(first_word) > 2 and first_word.isalpha():
                verbs.append(first_word)
        return verbs

    def suggest_alternatives(self, word: str) -> list:
        """Return stronger alternatives for a weak/overused word."""
        return ACTION_WORDS.get(word.lower(), [])

    def analyze(self, resume_text: str) -> dict:
        """Analyze action words in the experience section."""
        experience_text = self._extract_experience_text(resume_text)
        verbs = self.extract_verbs(experience_text)

        found_action_words = []
        suggestions = []

        for verb in verbs:
            if verb in ACTION_WORDS:
                found_action_words.append(verb)
            if verb in WEAK_WORDS:
                alts = self.suggest_alternatives(verb)
                if alts:
                    suggestions.append({'current': verb, 'suggested': alts[0]})

        return {
            'found': list(set(found_action_words)),
            'suggestions': suggestions,
        }
