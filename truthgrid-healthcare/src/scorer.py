"""
TruthGrid Healthcare Content Reliability Framework
scorer.py — 5-dimension article scoring engine

Scoring Formula:
  Final = (Source * 5) + (Accuracy * 6) + (Bias * 4) + (Citations * 3) + (Clarity * 2)
  Max possible = (5*5) + (5*6) + (5*4) + (5*3) + (5*2) = 25+30+20+15+10 = 100
"""

from __future__ import annotations
import re
from dataclasses import dataclass, field
from typing import Dict, Optional

from utils import (
    classify_domain,
    count_references,
    avg_sentence_length,
    word_count,
)
from penalties import compute_penalties, PenaltyResult


# ---------------------------------------------------------------------------
# Score data structure
# ---------------------------------------------------------------------------

@dataclass
class ArticleScore:
    url: str
    title: str = ""
    category: str = ""

    # Raw dimension scores (1–5 each)
    source_credibility: float = 0.0
    medical_accuracy: float = 0.0
    bias_level: float = 0.0
    citation_presence: float = 0.0
    clarity: float = 0.0

    # Derived
    raw_score: float = 0.0
    penalty: float = 0.0
    final_score: float = 0.0
    risk_level: str = ""
    penalty_flags: list = field(default_factory=list)

    def to_dict(self) -> Dict:
        return {
            "url": self.url,
            "title": self.title,
            "category": self.category,
            "source_credibility": round(self.source_credibility, 2),
            "medical_accuracy": round(self.medical_accuracy, 2),
            "bias_level": round(self.bias_level, 2),
            "citation_presence": round(self.citation_presence, 2),
            "clarity": round(self.clarity, 2),
            "raw_score": round(self.raw_score, 2),
            "penalty": round(self.penalty, 2),
            "final_score": round(self.final_score, 2),
            "risk_level": self.risk_level,
            "penalty_flags": ", ".join(self.penalty_flags),
        }


# ---------------------------------------------------------------------------
# Dimension scorers
# ---------------------------------------------------------------------------

# Government / top institutional domains → score 5
_GOV_PATTERNS = [
    r"\.nih\.gov", r"\.who\.int", r"\.cdc\.gov", r"\.fda\.gov",
    r"medlineplus\.gov", r"\.nccih\.nih\.gov",
]
# Professional orgs → 4
_ORG_PATTERNS = [
    r"diabetes\.org", r"\.aad\.org", r"\.heart\.org",
    r"\.cancer\.org", r"\.acog\.org", r"\.ama-assn\.org",
]
# Reputable hospitals / academic medical centres → 4
_HOSPITAL_PATTERNS = [
    r"mayoclinic\.org", r"clevelandclinic\.org", r"hopkinsmedicine\.org",
    r"mountsinai\.org", r"nyp\.org",
]
# Well-known health publishers (some editorial oversight) → 3
_HEALTH_PUBLISHER_PATTERNS = [
    r"webmd\.com", r"healthline\.com", r"medicalnewstoday\.com",
    r"verywellhealth\.com",
]


def score_source_credibility(url: str) -> float:
    """Return 1–5 based on domain authority."""
    domain = url.lower()
    if any(re.search(p, domain) for p in _GOV_PATTERNS):
        return 5.0
    if any(re.search(p, domain) for p in _ORG_PATTERNS):
        return 4.5
    if any(re.search(p, domain) for p in _HOSPITAL_PATTERNS):
        return 4.0
    if any(re.search(p, domain) for p in _HEALTH_PUBLISHER_PATTERNS):
        return 3.0
    # Classify via domain type
    domain_type = classify_domain(url)
    if domain_type == "brand_blog":
        return 1.5
    return 2.0


def score_medical_accuracy(text: str) -> float:
    """
    Heuristic: checks for evidence language, scientific hedging,
    and absence of absolutist claims.
    """
    tl = text.lower()

    positive_signals = [
        r"\bstudies? (show|suggest|indicate|found)\b",
        r"\bresearch (shows?|suggests?|indicates?)\b",
        r"\bevidence (suggests?|shows?|supports?)\b",
        r"\baccording to\b",
        r"\bclinical trial\b",
        r"\bpeer.?reviewed\b",
        r"\bmay (help|reduce|improve|lower)\b",
        r"\bsome evidence\b",
        r"\blimited evidence\b",
        r"\bconsult (a|your) (doctor|physician|healthcare)\b",
    ]
    negative_signals = [
        r"\bguaranteed\b",
        r"\b100% (effective|safe|natural|proven)\b",
        r"\bcures?\b",
        r"\bmiracl\b",
        r"\breverse(s|d)? diabetes\b",
        r"\bno side effects\b",
    ]

    pos_count = sum(1 for p in positive_signals if re.search(p, tl))
    neg_count = sum(1 for p in negative_signals if re.search(p, tl))

    # Base score: higher positive signals → higher score
    score = 2.0 + min(pos_count * 0.4, 2.5) - min(neg_count * 0.6, 2.0)
    return round(max(1.0, min(5.0, score)), 2)


def score_bias_level(text: str, url: str) -> float:
    """
    Lower bias → higher score.
    Checks for promotional language and commercial intent signals.
    """
    tl = text.lower()
    url_l = url.lower()

    commercial_signals = [
        r"\bbuy (now|today)\b",
        r"\bshop (now|today)\b",
        r"\border (now|today)\b",
        r"\bour product\b",
        r"\bour supplement\b",
        r"\bour formula\b",
        r"\blimited (time|offer)\b",
        r"\bdiscount\b",
        r"\bpromo code\b",
        r"\bfree (shipping|trial)\b",
    ]
    educational_signals = [
        r"\blearn more\b",
        r"\bsee your doctor\b",
        r"\bconsult a (physician|healthcare provider|doctor)\b",
        r"\bthis (information|article) is for\b",
        r"\bnot intended as medical advice\b",
        r"\breviewed by\b",
        r"\bmedically reviewed\b",
    ]

    commercial_count = sum(1 for p in commercial_signals if re.search(p, tl))
    educational_count = sum(1 for p in educational_signals if re.search(p, tl))

    # Brand blog URL also signals bias
    url_penalty = 1.0 if classify_domain(url) == "brand_blog" else 0.0

    score = 3.5 + min(educational_count * 0.3, 1.5) - min(commercial_count * 0.5 + url_penalty, 2.5)
    return round(max(1.0, min(5.0, score)), 2)


def score_citation_presence(text: str) -> float:
    """Score based on number and quality of citation signals."""
    ref_count = count_references(text)

    if ref_count >= 15:
        return 5.0
    if ref_count >= 8:
        return 4.0
    if ref_count >= 4:
        return 3.0
    if ref_count >= 1:
        return 2.0
    return 1.0


def score_clarity(text: str) -> float:
    """
    Approximate readability: penalise very short or very long average
    sentence length; reward moderate, accessible prose.
    """
    avg_len = avg_sentence_length(text)
    wc = word_count(text)

    # Ideal sentence length for health consumers: 15–25 words
    if 15 <= avg_len <= 25:
        length_score = 5.0
    elif 10 <= avg_len < 15 or 25 < avg_len <= 35:
        length_score = 4.0
    elif avg_len < 10:
        length_score = 3.0  # Very short may lack context
    else:
        length_score = 2.5  # Very long sentences = harder to read

    # Very short articles likely lack depth
    if wc < 200:
        length_score = max(1.0, length_score - 1.5)
    elif wc < 400:
        length_score = max(1.5, length_score - 0.5)

    return round(max(1.0, min(5.0, length_score)), 2)


# ---------------------------------------------------------------------------
# Main scoring function
# ---------------------------------------------------------------------------

RISK_LEVELS = [
    (80, "High Trust"),
    (60, "Moderate"),
    (40, "Low"),
    (0,  "High Risk"),
]


def classify_risk(final_score: float) -> str:
    for threshold, label in RISK_LEVELS:
        if final_score >= threshold:
            return label
    return "High Risk"


def score_article(url: str, text: str, title: str = "", category: str = "") -> ArticleScore:
    """
    Score an article and return an ArticleScore with all sub-scores,
    penalty deductions, final score, and risk classification.
    """
    result = ArticleScore(url=url, title=title, category=category)

    # Dimension scores
    result.source_credibility = score_source_credibility(url)
    result.medical_accuracy = score_medical_accuracy(text)
    result.bias_level = score_bias_level(text, url)
    result.citation_presence = score_citation_presence(text)
    result.clarity = score_clarity(text)

    # Raw weighted score
    result.raw_score = (
        result.source_credibility * 5
        + result.medical_accuracy * 6
        + result.bias_level * 4
        + result.citation_presence * 3
        + result.clarity * 2
    )

    # Penalty deductions
    penalty_result: PenaltyResult = compute_penalties(text)
    result.penalty = penalty_result.total_penalty
    result.penalty_flags = [k for k, v in penalty_result.breakdown.items() if v > 0]

    # Final score (floor at 0)
    result.final_score = max(0.0, result.raw_score - result.penalty)
    result.risk_level = classify_risk(result.final_score)

    return result
