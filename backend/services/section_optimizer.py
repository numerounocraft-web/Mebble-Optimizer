"""
Resume section optimizer.

Implements the Grammatical Bucket System, Snap-Fit participial phrase connectors,
POS/length logic, and QA validation as described in the optimization strategy document.
"""

import re

# ── Verb upgrades ─────────────────────────────────────────────────────────────
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

# ── Domain-specific summary closers ──────────────────────────────────────────
SUMMARY_CLOSERS = {
    'software_engineering': (
        "Adept at delivering scalable, production-ready solutions through strong"
        " collaboration and a deep technical foundation."
    ),
    'data_analytics': (
        "Committed to transforming complex data into strategic insights that drive"
        " measurable business outcomes."
    ),
    'product_design': (
        "Passionate about crafting user-centred experiences that balance aesthetic"
        " refinement with functional clarity."
    ),
    'marketing': (
        "Skilled at blending data-driven strategy with creative execution to build"
        " brand presence and accelerate growth."
    ),
    'finance_accounting': (
        "Known for meticulous attention to detail and the ability to translate"
        " financial data into actionable recommendations."
    ),
    'human_resources': (
        "Focused on building high-performing cultures through strategic talent"
        " acquisition, development, and retention."
    ),
    'general': (
        "A results-oriented professional known for cross-functional collaboration"
        " and a consistent record of delivering impact."
    ),
}

# ═══════════════════════════════════════════════════════════════════════════════
# BUCKET 1 — Tools & Software
# Connector format: participial phrase beginning with an action gerund.
# "utilizing {kw} to ..."  /  "leveraging {kw} for ..."
# ═══════════════════════════════════════════════════════════════════════════════
_TOOL_CONNECTORS = [
    "utilizing {kw} to streamline execution",
    "leveraging {kw} to accelerate delivery",
    "applying {kw} to improve workflow efficiency",
    "using {kw} to drive consistency across deliverables",
    "working within {kw} to enhance output quality",
]

# ═══════════════════════════════════════════════════════════════════════════════
# BUCKET 2 — Technical Skills & Methodologies
# Connector format: method + purpose clause.
# "applying {kw} principles to ..."  /  "through {kw} methodologies"
# ═══════════════════════════════════════════════════════════════════════════════
_TECH_SKILL_CONNECTORS = [
    "applying {kw} principles to validate outcomes",
    "incorporating {kw} methodologies throughout",
    "grounding decisions in {kw} best practices",
    "executing rigorous {kw} processes to optimise results",
    "through disciplined {kw} practices",
]

# ═══════════════════════════════════════════════════════════════════════════════
# BUCKET 3 — Metrics & Outcomes
# Connector format: impact-focused phrase tied to the keyword.
# "focused on driving {kw} ..."  /  "contributing to improved {kw}"
# ═══════════════════════════════════════════════════════════════════════════════
_METRICS_CONNECTORS = [
    "focused on driving measurable {kw} improvements",
    "contributing directly to enhanced {kw}",
    "with a quantifiable impact on {kw}",
    "consistently improving {kw} benchmarks",
    "resulting in stronger {kw} across all workstreams",
]

# ═══════════════════════════════════════════════════════════════════════════════
# BUCKET 4 — Soft Skills & Leadership
# Connector format: demonstration phrase with evidence of action.
# "demonstrating {kw} by leading ..."  /  "through effective {kw}"
# ═══════════════════════════════════════════════════════════════════════════════
_SOFT_SKILL_CONNECTORS = [
    "demonstrating strong {kw} across every stage",
    "exercising {kw} to align stakeholders effectively",
    "through effective {kw} at every level",
    "leveraging {kw} to foster team cohesion",
    "anchoring the work in {kw} principles",
]

# ── Bucket classification data ────────────────────────────────────────────────

# Known tool / software names (lowercase)
_KNOWN_TOOLS = frozenset([
    'figma', 'sketch', 'docker', 'jira', 'confluence', 'notion', 'slack',
    'react', 'vue', 'angular', 'next', 'svelte', 'python', 'javascript',
    'typescript', 'java', 'swift', 'kotlin', 'rust', 'go', 'ruby', 'php',
    'aws', 'gcp', 'azure', 'firebase', 'mongodb', 'postgresql', 'mysql',
    'redis', 'elasticsearch', 'kubernetes', 'terraform', 'ansible', 'jenkins',
    'github', 'gitlab', 'bitbucket', 'linear', 'asana', 'trello', 'airtable',
    'photoshop', 'illustrator', 'invision', 'zeplin', 'miro', 'framer',
    'tableau', 'powerbi', 'excel', 'salesforce', 'hubspot', 'intercom',
    'html', 'css', 'sass', 'graphql', 'rest', 'sql', 'nosql', 'api', 'sdk',
    'git', 'webpack', 'vite', 'node', 'express', 'flask', 'django', 'rails',
    'xcode', 'android', 'flutter', 'unity', 'unreal', 'blender',
])

# Endings that signal a keyword is a tool / tech acronym
_TECH_SUFFIXES = ('js', 'ts', 'db', 'ml', 'ai', 'ql', 'ui', 'ux', 'os', 'sdk')

# Known metrics / outcome keywords (lowercase)
_KNOWN_METRICS = frozenset([
    'roi', 'kpi', 'kpis', 'retention', 'conversion', 'scalability',
    'performance', 'growth', 'revenue', 'efficiency', 'productivity',
    'quality', 'accuracy', 'engagement', 'satisfaction', 'adoption',
    'throughput', 'latency', 'uptime', 'availability', 'reliability',
    'velocity', 'churn', 'nps', 'csat', 'ltv', 'cac', 'mrr', 'arr',
])

# Known soft skills (lowercase, may be multi-word)
_KNOWN_SOFT_SKILLS = frozenset([
    'leadership', 'communication', 'collaboration', 'mentorship', 'coaching',
    'stakeholder management', 'project management', 'team building',
    'problem solving', 'critical thinking', 'creativity', 'adaptability',
    'empathy', 'negotiation', 'presentation', 'facilitation', 'influence',
    'decision making', 'strategic thinking', 'innovation', 'agility',
    'time management', 'conflict resolution', 'active listening', 'ownership',
    'accountability', 'resilience', 'emotional intelligence',
])

# Words at the END of a multi-word phrase that signal a Technical Skill
_TECH_SKILL_TAIL = frozenset([
    'testing', 'analysis', 'optimization', 'optimisation', 'engineering',
    'design', 'architecture', 'development', 'integration', 'management',
    'deployment', 'research', 'modeling', 'processing', 'learning',
    'intelligence', 'automation', 'strategy', 'planning', 'auditing',
])

# Common prepositions used in connectors — needed for double-preposition QA
_PREPOSITIONS = ['in', 'of', 'for', 'to', 'with', 'by', 'at', 'on',
                 'through', 'via', 'into', 'from', 'across']


# ── Classification ────────────────────────────────────────────────────────────

def _classify(keyword: str) -> str:
    """
    Classify a keyword into one of four grammatical buckets:
    'tool' | 'tech_skill' | 'metric' | 'soft_skill'

    Strategy (in priority order):
    1. Exact match against known sets.
    2. Single capitalised word → tool.
    3. Known tech suffix → tool.
    4. Ends in known metric signal → metric.
    5. Full phrase in soft-skill set → soft_skill.
    6. Ends in known tech-skill tail word → tech_skill.
    7. Gerund (ends in -ing) → tech_skill.
    8. 3+ word phrase → tech_skill (length logic from strategy doc).
    9. Default → tech_skill.
    """
    kw_lower = keyword.lower().strip()
    words = kw_lower.split()

    # --- exact known sets ---
    if kw_lower in _KNOWN_TOOLS:
        return 'tool'
    if kw_lower in _KNOWN_METRICS:
        return 'metric'
    if kw_lower in _KNOWN_SOFT_SKILLS:
        return 'soft_skill'

    # --- single-word heuristics ---
    if len(words) == 1:
        # Gerund check FIRST — e.g. "Debugging", "Prototyping" are skills, not tools
        if kw_lower.endswith('ing') and len(kw_lower) > 5 and kw_lower not in _KNOWN_TOOLS:
            return 'tech_skill'
        # Capitalised → treat as proper-noun tool
        if keyword[0].isupper():
            return 'tool'
        # Known tech suffix → tool
        if kw_lower.endswith(_TECH_SUFFIXES):
            return 'tool'

    # --- multi-word heuristics ---
    tail = words[-1] if words else ''
    if tail in _TECH_SKILL_TAIL:
        return 'tech_skill'

    # Length logic from strategy doc: 3+ word phrases → end placement (tech_skill pool)
    if len(words) >= 3:
        return 'tech_skill'

    return 'tech_skill'


# ── Connector selection ───────────────────────────────────────────────────────

def _pick_connector(keyword: str, index: int) -> str:
    """
    Select a bucket-appropriate participial phrase for the given keyword.
    `index` drives rotation so consecutive bullets use different phrasing.
    Pools are ordered most-natural → least-natural (weighted randomization
    is approximated by using the earlier entries more often via index wrap).
    """
    bucket = _classify(keyword)

    if bucket == 'tool':
        pool = _TOOL_CONNECTORS
    elif bucket == 'metric':
        pool = _METRICS_CONNECTORS
    elif bucket == 'soft_skill':
        pool = _SOFT_SKILL_CONNECTORS
    else:
        pool = _TECH_SKILL_CONNECTORS

    # Weight first two entries 2× by doubling them at the front of selection
    weighted = pool[:2] + pool          # indices 0-1 appear twice → higher weight
    template = weighted[index % len(weighted)]
    return template.format(kw=keyword)


# ── QA validation ─────────────────────────────────────────────────────────────

def _qa(text: str) -> str:
    """
    Apply quality-assurance fixes before returning a bullet or summary:
    - Collapse multiple spaces.
    - Remove double periods.
    - Ensure the text ends with a single period.
    - Resolve double prepositions (e.g. "in in Python" → "in Python").
    - Capitalise the first letter of every sentence.
    """
    # Collapse whitespace
    text = re.sub(r' {2,}', ' ', text).strip()

    # Double-period guard
    text = re.sub(r'\.{2,}', '.', text)

    # Ensure terminal period
    if text and text[-1] not in '.!?':
        text += '.'

    # Conflict resolution: double prepositions
    for prep in _PREPOSITIONS:
        text = re.sub(
            rf'\b{re.escape(prep)}\s+{re.escape(prep)}\b',
            prep,
            text,
            flags=re.IGNORECASE,
        )

    # Capitalise first letter of each sentence
    text = re.sub(
        r'([.!?]\s+)([a-z])',
        lambda m: m.group(1) + m.group(2).upper(),
        text,
    )
    # Capitalise the very first character
    if text:
        text = text[0].upper() + text[1:]

    return text


# ── Summary language refinements ─────────────────────────────────────────────
# Each entry is (regex_pattern, replacement).  Ordered from most specific to
# most general.  Applied before keyword injection so the base prose is clean.

_SUMMARY_UPGRADES = [
    # Remove weak intensifiers first (they leave a trailing space, fixed below)
    (r'\bvery\s+',         ''),
    (r'\bquite\s+',        ''),
    (r'\breally\s+',       ''),
    (r'\bjust\s+',         ''),
    # Cliché opener phrases
    (r'\bhard worker\b',                    'high-performing professional'),
    (r'\bteam player\b',                    'collaborative team contributor'),
    (r'\bgo-getter\b',                      'proactive achiever'),
    (r'\bself-starter\b',                   'self-directed professional'),
    (r'\bthinking outside the box\b',       'applying creative, innovative approaches'),
    (r'\bout-of-the-box\b',                 'innovative'),
    (r'\bgetting things done\b',            'delivering measurable outcomes'),
    (r'\bworks well under pressure\b',      'thrives in high-pressure environments'),
    (r'\bexcited to\b',                     'eager to'),
    (r'\bpassionate about\b',               'deeply committed to'),
    # Specific "good X" compounds — must appear BEFORE their general counterparts
    (r'\bgood knowledge of\b',              'deep expertise in'),
    (r'\bgood understanding of\b',          'strong understanding of'),
    (r'\bgood experience in\b',             'solid experience in'),
    (r'\bgood grasp of\b',                  'strong command of'),
    # Weak skill phrases (general — after specific compounds above)
    (r'\bgood at\b',                        'adept at'),
    (r'\bknowledge of\b',                   'expertise in'),
    (r'\bfamiliar with\b',                  'well-versed in'),
    (r'\bsome experience in\b',             'demonstrated experience in'),
    (r'\bstrong background\b',              'proven background'),
    (r'\bsolid background\b',               'proven background'),
    (r'\bworking knowledge\b',              'applied expertise'),
    (r'\bable to\b',                        'capable of'),
    (r'\bworks well\b',                     'excels'),
    (r'\bhelps\b',                          'drives'),
    # Vague quantifiers / fillers
    (r'\bvarious\b',                        'diverse'),
    (r'\bmultiple\b',                       'a breadth of'),
    (r'\bnumerous\b',                       'extensive'),
    # Intent language → active language (use "driven to" — works with infinitives)
    (r'\blooking to\b',                     'driven to'),
    (r'\bseeking to\b',                     'driven to'),
    (r'\baiming to\b',                      'driven to'),
    (r'\bhoping to\b',                      'driven to'),
    # Plain experience phrasing
    (r'\byears of experience\b',            'years of hands-on experience'),
    (r'\bprofessional with experience\b',   'experienced professional'),
    (r'\bdetail[-\s]oriented\b',            'meticulous'),
    (r'\bmotivated professional\b',         'results-driven professional'),
]


def _refine_summary_language(text: str) -> str:
    """Replace clichés and weak phrases with stronger professional alternatives."""
    result = text
    for pattern, replacement in _SUMMARY_UPGRADES:
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    # Clean up double spaces left by empty replacements
    result = re.sub(r' {2,}', ' ', result).strip()
    return result


# ── General helpers ───────────────────────────────────────────────────────────

def _strengthen_verbs(text: str) -> str:
    result = text
    for weak, strong in VERB_UPGRADES.items():
        pattern = re.compile(r'\b' + re.escape(weak) + r'\b', re.IGNORECASE)

        def replacer(m, s=strong):
            return s[0].upper() + s[1:] if m.group(0)[0].isupper() else s

        result = pattern.sub(replacer, result)
    return result


def _build_keyword_phrase(keywords: list) -> str:
    if not keywords:
        return ''
    if len(keywords) == 1:
        return keywords[0]
    if len(keywords) == 2:
        return f"{keywords[0]} and {keywords[1]}"
    return ', '.join(keywords[:-1]) + f', and {keywords[-1]}'


def _inject_into_summary(text: str, keywords: list) -> tuple:
    """
    Try to extend existing skill-listing phrases so keywords are woven in
    naturally (e.g. "skilled in Figma" → "skilled in Figma and Sketch").
    Returns (updated_text, remaining_keywords).
    """
    remaining = list(keywords)
    slot_patterns = [
        r'((?:skilled|experienced|proficient|versed)\s+in\s+)([^,.;]+)',
        r'((?:expertise|background|knowledge)\s+in\s+)([^,.;]+)',
        r'((?:specialising|specializing)\s+in\s+)([^,.;]+)',
        r'((?:focused|grounded)\s+in\s+)([^,.;]+)',
    ]
    for pattern in slot_patterns:
        if not remaining:
            break
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            batch = remaining[:2]
            remaining = remaining[2:]
            addition = ', ' + _build_keyword_phrase(batch)
            text = text[: m.end(2)] + addition + text[m.end(2):]
            break
    return text, remaining


# ═══════════════════════════════════════════════════════════════════════════════
# Main optimizer class
# ═══════════════════════════════════════════════════════════════════════════════

class SectionOptimizer:

    def optimize_all(
        self,
        sections: list,
        missing_keywords: list,
        domain: str = 'general',
    ) -> list:
        """
        Optimise every optimisable section, distributing keywords without
        repeating the same keyword twice across sections.
        """
        priority = [
            'experience', 'professional_summary', 'skills',
            'projects', 'certifications', 'awards',
        ]

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
            content_lower = section['content'].lower()
            optimized_lower = optimized.lower()
            remaining = [
                kw for kw in remaining
                if kw.lower() not in optimized_lower or kw.lower() in content_lower
            ]
            results_map[section['id']] = optimized

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
        if section_type == 'professional_summary':
            return self._optimize_summary(content, missing_keywords, domain)
        elif section_type == 'experience':
            return self._optimize_experience(content, missing_keywords)
        else:
            return _strengthen_verbs(content)

    # ── Summary optimisation ──────────────────────────────────────────────────

    def _optimize_summary(
        self,
        text: str,
        missing_keywords: list,
        domain: str,
        style: str = 'full',
    ) -> str:
        """
        Rewrite the professional summary.

        style='full'    — verb upgrade + language refinement + inline keyword slot
                          + bridge sentence + domain closer.
        style='concise' — verb upgrade + language refinement + inline slot only
                          (no bridge sentence) + domain closer.
        style='refined' — verb upgrade + language refinement + domain closer only
                          (no keyword injection — focuses purely on language quality).
        """
        enhanced = _strengthen_verbs(text)
        enhanced = _refine_summary_language(enhanced)

        if style != 'refined':
            relevant = [kw for kw in missing_keywords if kw.lower() not in enhanced.lower()][:5]

            if relevant:
                # Inline injection into existing "skilled in / proficient in" phrases
                enhanced, remaining = _inject_into_summary(enhanced, relevant)

                # Bridge sentence — 'full' style only
                if remaining and style == 'full':
                    kw_phrase = _build_keyword_phrase(remaining[:3])
                    bucket = _classify(remaining[0])
                    if bucket == 'tool':
                        bridge = (
                            f"Proficient in {kw_phrase}, applying these tools to deliver"
                            f" polished, high-quality work at every stage of the process."
                        )
                    elif bucket == 'metric':
                        bridge = (
                            f"Consistently delivers results that improve {kw_phrase},"
                            f" driven by a data-informed approach to every challenge."
                        )
                    elif bucket == 'soft_skill':
                        bridge = (
                            f"Recognised for strong {kw_phrase}, fostering collaboration"
                            f" and alignment across diverse teams and stakeholders."
                        )
                    else:
                        domain_bridges = {
                            'software_engineering': (
                                f"Experienced in {kw_phrase}, applying these competencies"
                                f" across the full engineering lifecycle."
                            ),
                            'product_design': (
                                f"Skilled in {kw_phrase}, using these practices to craft"
                                f" cohesive, user-centred design solutions."
                            ),
                            'data_analytics': (
                                f"Versed in {kw_phrase}, translating technical depth into"
                                f" clear, insight-driven outcomes."
                            ),
                            'marketing': (
                                f"Experienced in {kw_phrase}, integrating these competencies"
                                f" into campaign strategy and brand execution."
                            ),
                            'general': (
                                f"Proficient in {kw_phrase}, consistently applying these"
                                f" skills to deliver high-quality, impactful work."
                            ),
                        }
                        bridge = domain_bridges.get(domain, domain_bridges['general'])

                    sentences = re.split(r'(?<=[.!?])\s+', enhanced.strip())
                    if len(sentences) >= 2:
                        sentences.insert(1, bridge)
                        enhanced = ' '.join(sentences)
                    else:
                        enhanced = enhanced.rstrip('.') + f'. {bridge}'

        # Append domain-specific closing if summary is still short
        closer = SUMMARY_CLOSERS.get(domain, SUMMARY_CLOSERS['general'])
        if closer[:30].lower() not in enhanced.lower() and len(enhanced) < 600:
            enhanced = enhanced.rstrip('.') + f'. {closer}'

        return _qa(enhanced)

    # ── Experience optimisation ───────────────────────────────────────────────

    def _optimize_experience(self, text: str, missing_keywords: list) -> str:
        lines = text.split('\n')
        enhanced_lines = []

        # Only process keywords not already present in the text
        remaining_kws = [kw for kw in missing_keywords if kw.lower() not in text.lower()]
        connector_idx = 0

        for line in lines:
            enhanced = _strengthen_verbs(line)
            bullet_match = re.match(r'^([•\-\*\u2022]\s*)(.*)', enhanced)

            if bullet_match and remaining_kws:
                prefix = bullet_match.group(1)
                body = bullet_match.group(2)
                kw = remaining_kws.pop(0)

                if kw.lower() not in body.lower():
                    body_clean = body.rstrip('.')
                    connector = _pick_connector(kw, connector_idx)
                    connector_idx += 1
                    raw = f"{prefix}{body_clean}, {connector}."
                    enhanced = _qa(raw)
                else:
                    enhanced = _qa(enhanced)
            else:
                enhanced = _qa(enhanced)

            enhanced_lines.append(enhanced)

        # Any keywords still unplaced → one closing achievement bullet
        if remaining_kws:
            kw_phrase = _build_keyword_phrase(remaining_kws[:3])
            closing = _qa(
                f"\u2022 Demonstrated proficiency in {kw_phrase},"
                f" contributing to team goals and measurable project outcomes."
            )
            enhanced_lines.append(closing)

        return '\n'.join(enhanced_lines)
