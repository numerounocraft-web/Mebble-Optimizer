import re

# Weak verb → strong alternatives
VERB_UPGRADES = {
    'did': 'executed',
    'made': 'developed',
    'helped': 'supported',
    'was responsible for': 'oversaw',
    'worked on': 'contributed to',
    'worked with': 'collaborated with',
    'used': 'leveraged',
    'built': 'engineered',
    'wrote': 'authored',
    'tested': 'validated',
    'reviewed': 'evaluated',
    'assisted': 'facilitated',
    'handled': 'managed',
    'took part in': 'participated in',
    'had experience with': 'demonstrated expertise in',
    'utilized': 'leveraged',
    'responsible for': 'accountable for',
    'participated in': 'contributed to',
}

# Summary enhancement templates by domain
SUMMARY_CLOSERS = {
    'software_engineering': (
        "Adept at delivering scalable, production-ready solutions through strong collaboration"
        " and a deep technical foundation."
    ),
    'data_analytics': (
        "Committed to transforming complex data into strategic insights that drive measurable"
        " business outcomes."
    ),
    'product_design': (
        "Passionate about crafting user-centered experiences that balance aesthetic refinement"
        " with functional clarity."
    ),
    'marketing': (
        "Skilled at blending data-driven strategy with creative execution to build brand"
        " presence and accelerate growth."
    ),
    'finance_accounting': (
        "Known for meticulous attention to detail and the ability to translate financial"
        " data into actionable recommendations."
    ),
    'human_resources': (
        "Focused on building high-performing cultures through strategic talent acquisition,"
        " development, and retention."
    ),
    'general': (
        "A results-oriented professional known for cross-functional collaboration and a"
        " consistent record of delivering impact."
    ),
}


def _strengthen_verbs(text: str) -> str:
    """Replace weak verbs with stronger professional alternatives."""
    result = text
    for weak, strong in VERB_UPGRADES.items():
        pattern = re.compile(r'\b' + re.escape(weak) + r'\b', re.IGNORECASE)

        def replacer(m, s=strong):
            original = m.group(0)
            if original[0].isupper():
                return s[0].upper() + s[1:]
            return s

        result = pattern.sub(replacer, result)
    return result


def _build_keyword_phrase(keywords: list) -> str:
    """Turn a list of keywords into a natural-sounding phrase."""
    if not keywords:
        return ''
    if len(keywords) == 1:
        return keywords[0]
    if len(keywords) == 2:
        return f"{keywords[0]} and {keywords[1]}"
    return ', '.join(keywords[:-1]) + f', and {keywords[-1]}'


class SectionOptimizer:
    def optimize_all(
        self,
        sections: list,
        missing_keywords: list,
        domain: str = 'general',
    ) -> list:
        """
        Optimize every optimizable section, distributing missing keywords
        across sections without repeating the same keyword twice.

        sections: list of dicts with keys id, type, content, optimizable
        Returns: list of dicts with keys id, optimized
        """
        # Experience entries first (most capacity for keywords), then summary, then rest
        priority = ['experience', 'professional_summary', 'skills', 'projects',
                    'certifications', 'awards']

        def sort_key(s):
            try:
                return priority.index(s.get('type', ''))
            except ValueError:
                return len(priority)

        ordered = sorted(sections, key=sort_key)
        remaining = list(missing_keywords)
        results_map = {}

        for section in ordered:
            if not section.get('optimizable', False):
                results_map[section['id']] = section['content']
                continue

            optimized = self.optimize(
                section['type'], section['content'], remaining, domain
            )

            # Track which keywords were successfully woven in; only pass
            # the leftovers to the next section so keywords aren't duplicated.
            content_lower = section['content'].lower()
            optimized_lower = optimized.lower()
            remaining = [
                kw for kw in remaining
                if kw.lower() not in optimized_lower or kw.lower() in content_lower
            ]

            results_map[section['id']] = optimized

        # Preserve the original ordering in the output
        return [
            {'id': s['id'], 'optimized': results_map.get(s['id'], s['content'])}
            for s in sections
        ]

    def optimize(
        self,
        section_type: str,
        content: str,
        missing_keywords: list,
        domain: str = 'general',
    ) -> str:
        """Return optimized version of a resume section."""
        if section_type == 'professional_summary':
            return self._optimize_summary(content, missing_keywords, domain)
        elif section_type == 'experience':
            return self._optimize_experience(content, missing_keywords)
        else:
            return _strengthen_verbs(content)

    # ──────────────────────────────────────────────────────────────────────────
    def _optimize_summary(self, text: str, missing_keywords: list, domain: str) -> str:
        enhanced = _strengthen_verbs(text)

        # Pick top relevant missing keywords (max 4)
        relevant = [kw for kw in missing_keywords if kw.lower() not in enhanced.lower()][:4]

        # Weave keywords into the summary if any are absent
        if relevant:
            kw_phrase = _build_keyword_phrase(relevant)
            # Try to insert after the first sentence
            sentences = re.split(r'(?<=[.!?])\s+', enhanced.strip())
            if len(sentences) >= 2:
                insert_sentence = (
                    f"Brings hands-on expertise in {kw_phrase},"
                    f" applying these skills to drive measurable results."
                )
                sentences.insert(1, insert_sentence)
                enhanced = ' '.join(sentences)
            else:
                enhanced = enhanced.rstrip('.')
                enhanced += (
                    f". Brings hands-on expertise in {kw_phrase},"
                    f" applying these skills to deliver measurable results."
                )

        # Add a strong domain-specific closing if the text is short
        closer = SUMMARY_CLOSERS.get(domain, SUMMARY_CLOSERS['general'])
        if closer.lower() not in enhanced.lower() and len(enhanced) < 600:
            enhanced = enhanced.rstrip('.')
            enhanced += f" {closer}"

        return enhanced

    # ──────────────────────────────────────────────────────────────────────────
    def _optimize_experience(self, text: str, missing_keywords: list) -> str:
        lines = text.split('\n')
        enhanced_lines = []
        remaining_kws = [kw for kw in missing_keywords if kw.lower() not in text.lower()]

        for line in lines:
            enhanced = _strengthen_verbs(line)

            # For bullet-point lines, try weaving in one missing keyword
            bullet_match = re.match(r'^([•\-\*\u2022]\s*)(.*)', enhanced)
            if bullet_match and remaining_kws:
                bullet, body = bullet_match.group(1), bullet_match.group(2).rstrip('.')
                kw = remaining_kws.pop(0)
                if kw.lower() not in body.lower():
                    enhanced = f"{bullet}{body}, utilizing {kw}."

            enhanced_lines.append(enhanced)

        # If keywords still remain, append a closing achievement bullet
        if remaining_kws:
            kw_phrase = _build_keyword_phrase(remaining_kws[:3])
            enhanced_lines.append(
                f"• Applied {kw_phrase} to support team objectives and drive project success."
            )

        return '\n'.join(enhanced_lines)
