from config import Config


class ATSCalculator:
    def calculate(self, keyword_results: dict) -> tuple[int, str]:
        """Calculate ATS score and return (score, category)."""
        total = keyword_results.get('total_jd', 0)
        matched = len(keyword_results.get('matched', []))

        if total == 0:
            return 0, 'Poor'

        score = round((matched / total) * 100)
        score = min(score, 100)
        return score, self.get_category(score)

    def get_category(self, score: int) -> str:
        thresholds = Config.SCORE_THRESHOLDS
        if score >= thresholds['great']:
            return 'Excellent'
        elif score >= thresholds['good']:
            return 'Great'
        elif score >= thresholds['poor']:
            return 'Good'
        else:
            return 'Poor'
