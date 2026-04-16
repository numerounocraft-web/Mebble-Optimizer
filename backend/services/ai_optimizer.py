"""
AI-powered resume optimizer.

Uses Claude to intelligently weave missing keywords into resume sections
while preserving grammatical correctness, professional tone, and authentic voice.
"""

import os
import json
import anthropic

# Cached system prompt — sent once and reused via Anthropic's prompt caching
_SYSTEM_PROMPT = """\
You are an expert professional resume writer specialising in ATS optimisation. \
Your sole task is to naturally integrate specific keywords into existing resume \
sections so the result reads like polished, human-authored prose.

Non-negotiable rules:
1. Every bullet must start with a strong action verb (Led, Designed, Delivered, etc.).
2. Keywords must be woven into the flow of each sentence — never append \
", utilising X" or "leveraging X" as a suffix.
3. Preserve every specific achievement, metric, number, tool name, and company \
name exactly as written.
4. Distribute keywords across sections so each keyword appears at most once \
in the entire resume.
5. If a keyword does not fit naturally anywhere, omit it — forced insertions \
are worse than omissions.
6. Keep each bullet point to one concise, complete sentence.
7. Maintain the candidate's existing voice, tense, and register throughout.
8. Return ONLY valid JSON — no markdown fences, no explanation."""


class AIOptimizer:
    def __init__(self):
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise EnvironmentError(
                "ANTHROPIC_API_KEY is not set. "
                "Add it to backend/.env to enable AI optimisation."
            )
        self.client = anthropic.Anthropic(api_key=api_key)
        self.model = "claude-haiku-4-5-20251001"

    def optimize(
        self,
        summary: str,
        experience: list[dict],
        missing_keywords: list[str],
        domain: str = "general",
    ) -> dict:
        """
        Rewrite resume sections to incorporate missing keywords fluently.

        Args:
            summary:          Current professional summary text.
            experience:       List of { id, bullets } dicts.
            missing_keywords: Keywords to weave in.
            domain:           Detected job domain (used for tone guidance).

        Returns:
            { "summary": str, "experience": [{ "id": str, "bullets": [str] }] }
        """
        resume_block = self._format_resume(summary, experience)
        kw_list = ", ".join(missing_keywords) if missing_keywords else "(none)"

        user_msg = f"""\
CURRENT RESUME CONTENT:
{resume_block}

KEYWORDS TO INCORPORATE: {kw_list}

DOMAIN CONTEXT: {domain}

Rewrite the content so the keywords are integrated naturally. \
Return a JSON object with this exact shape — use the original experience entry IDs:

{{
  "summary": "<rewritten summary>",
  "experience": [
    {{"id": "<original id>", "bullets": ["<rewritten bullet>", ...]}}
  ]
}}

Include every experience entry (even those that did not change). \
Keep the same number of bullets per entry."""

        response = self.client.messages.create(
            model=self.model,
            max_tokens=3000,
            system=[
                {
                    "type": "text",
                    "text": _SYSTEM_PROMPT,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            messages=[{"role": "user", "content": user_msg}],
        )

        raw = response.content[0].text.strip()

        # Strip markdown code fences if the model wrapped the output
        if raw.startswith("```"):
            parts = raw.split("```")
            raw = parts[1].lstrip("json").strip() if len(parts) > 1 else raw

        return json.loads(raw)

    # ── helpers ───────────────────────────────────────────────────────────────

    def _format_resume(self, summary: str, experience: list[dict]) -> str:
        lines = []
        if summary:
            lines.append(f"[PROFESSIONAL SUMMARY]\n{summary}")
        for i, exp in enumerate(experience, 1):
            bullets = [b for b in exp.get("bullets", []) if b.strip()]
            if bullets:
                lines.append(
                    f"\n[EXPERIENCE ENTRY {i} — id: {exp['id']}]"
                )
                for b in bullets:
                    lines.append(f"  • {b}")
        return "\n".join(lines)
