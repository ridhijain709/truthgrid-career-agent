"""
TruthGrid Healthcare Content Reliability Framework
penalties.py — Red-flag phrase detection and penalty scoring logic

Penalty rules reduce a content's final score based on presence of
misleading, promotional, or medically unsound language patterns.
"""

from __future__ import annotations
import re
from dataclasses import dataclass, field
from typing import List, Tuple


# ---------------------------------------------------------------------------
# Red-flag phrase catalogue
# ---------------------------------------------------------------------------

MIRACLE_CURE_PHRASES: List[str] = [
    r"miracle cure",
    r"guaranteed (results?|cure|healing|recovery)",
    r"100% (effective|safe|natural|proven)",
    r"cures? (cancer|diabetes|alzheimer|disease)",
    r"instant(ly)? (relieves?|heals?|cures?)",
    r"no side effects",
    r"big pharma (doesn't|don't|won't) want",
    r"doctors (hate|won't tell you|are hiding)",
]

DISEASE_REVERSAL_PHRASES: List[str] = [
    r"reverse(s|d)? (diabetes|disease|cancer|dementia|ageing|aging)",
    r"cures? (type [12] diabetes|hypertension|arthritis)",
    r"eliminates? (cancer cells|tumou?rs?)",
    r"completely heals?",
    r"permanent(ly)? (fix|cure|reversal)",
]

EXAGGERATED_BENEFIT_PHRASES: List[str] = [
    r"superfoods?",
    r"detox(ifies|ify|ification)?",
    r"boosts? (your )?immune system",
    r"anti-?ageing (secret|miracle|formula)",
    r"melts? (away )?fat",
    r"skyrockets? (metabolism|energy|testosterone)",
    r"eliminates? toxins?",
]

URGENCY_SCARCITY_PHRASES: List[str] = [
    r"limited (time|offer|stock)",
    r"act now",
    r"buy (now|today)",
    r"order (now|today|immediately)",
    r"while (stocks?|supplies?) last",
    r"exclusive (deal|offer|discount)",
]

ANECDOTAL_ONLY_PHRASES: List[str] = [
    r"my (doctor|friend|family member) told me",
    r"i (personally|myself) (tried|used|found)",
    r"everyone (should|must|needs? to)",
]


# ---------------------------------------------------------------------------
# Penalty catalogue
# ---------------------------------------------------------------------------

@dataclass
class PenaltyRule:
    name: str
    patterns: List[str]
    penalty_per_match: float
    max_penalty: float
    description: str = ""


PENALTY_RULES: List[PenaltyRule] = [
    PenaltyRule(
        name="miracle_cure",
        patterns=MIRACLE_CURE_PHRASES,
        penalty_per_match=5.0,
        max_penalty=20.0,
        description="Unsubstantiated cure / guaranteed results language",
    ),
    PenaltyRule(
        name="disease_reversal",
        patterns=DISEASE_REVERSAL_PHRASES,
        penalty_per_match=4.0,
        max_penalty=16.0,
        description="Misleading disease reversal claims",
    ),
    PenaltyRule(
        name="exaggerated_benefits",
        patterns=EXAGGERATED_BENEFIT_PHRASES,
        penalty_per_match=2.0,
        max_penalty=10.0,
        description="Exaggerated or pseudoscientific benefit claims",
    ),
    PenaltyRule(
        name="urgency_scarcity",
        patterns=URGENCY_SCARCITY_PHRASES,
        penalty_per_match=3.0,
        max_penalty=12.0,
        description="Commercial urgency / scarcity pressure language",
    ),
    PenaltyRule(
        name="anecdotal_only",
        patterns=ANECDOTAL_ONLY_PHRASES,
        penalty_per_match=1.5,
        max_penalty=6.0,
        description="Relies solely on personal anecdotes as evidence",
    ),
]


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

@dataclass
class PenaltyResult:
    total_penalty: float
    matches: List[Tuple[str, str, int]]  # (rule_name, matched_phrase, count)
    breakdown: dict = field(default_factory=dict)


def compute_penalties(text: str) -> PenaltyResult:
    """
    Scan *text* for red-flag phrases and compute the total penalty deduction.

    Returns a PenaltyResult with:
      - total_penalty: points to subtract from the raw score
      - matches: list of (rule_name, matched_text, occurrences)
      - breakdown: per-rule penalty amounts
    """
    text_lower = text.lower()
    all_matches: List[Tuple[str, str, int]] = []
    breakdown: dict = {}
    total_penalty = 0.0

    for rule in PENALTY_RULES:
        rule_penalty = 0.0
        for pattern in rule.patterns:
            found = re.findall(pattern, text_lower)
            count = len(found)
            if count:
                match_penalty = min(count * rule.penalty_per_match, rule.max_penalty)
                rule_penalty += match_penalty
                all_matches.append((rule.name, pattern, count))

        # Cap rule contribution at its own max
        rule_penalty = min(rule_penalty, rule.max_penalty)
        breakdown[rule.name] = round(rule_penalty, 2)
        total_penalty += rule_penalty

    return PenaltyResult(
        total_penalty=round(total_penalty, 2),
        matches=all_matches,
        breakdown=breakdown,
    )


def get_penalty_flags(text: str) -> List[str]:
    """Return a human-readable list of triggered penalty categories."""
    result = compute_penalties(text)
    return [rule for rule, pts in result.breakdown.items() if pts > 0]
