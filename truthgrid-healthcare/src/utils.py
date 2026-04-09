"""
TruthGrid Healthcare Content Reliability Framework
utils.py — HTTP fetching, text extraction, and helper utilities
"""

from __future__ import annotations
import re
import time
import logging
from typing import Optional
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup

try:
    import trafilatura
    _TRAFILATURA_AVAILABLE = True
except ImportError:
    _TRAFILATURA_AVAILABLE = False

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

REQUEST_TIMEOUT = 15  # seconds
REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; TruthGridBot/1.0; "
        "+https://github.com/ridhijain709/truthgrid-career-agent)"
    )
}

# Known high-credibility domain patterns
HIGH_CREDIBILITY_DOMAINS = [
    r"\.nih\.gov",
    r"\.who\.int",
    r"\.cdc\.gov",
    r"\.fda\.gov",
    r"\.nccih\.nih\.gov",
    r"medlineplus\.gov",
    r"diabetes\.org",
    r"\.aad\.org",
    r"\.heart\.org",
    r"\.cancer\.org",
    r"\.mayoclinic\.org",
    r"\.hopkinsmedicine\.org",
    r"\.clevelandclinic\.org",
    r"\.webmd\.com",
    r"\.healthline\.com",
]

BRAND_BLOG_PATTERNS = [
    r"shop\.",
    r"store\.",
    r"buy\.",
    r"/blogs/",
    r"/blog/",
    r"supplements?",
    r"products?",
]


# ---------------------------------------------------------------------------
# URL helpers
# ---------------------------------------------------------------------------

def get_domain(url: str) -> str:
    """Extract the netloc portion of a URL."""
    try:
        return urlparse(url).netloc.lower()
    except Exception:
        return ""


def classify_domain(url: str) -> str:
    """
    Classify a URL's domain into one of:
      'government', 'professional_org', 'hospital', 'brand_blog', 'general'
    """
    domain = get_domain(url)
    full_url = url.lower()

    if re.search(r"\.(gov|nih\.gov|who\.int)$", domain):
        return "government"
    if re.search(r"\.(org)$", domain) and any(
        re.search(p, domain) for p in [r"diabetes", r"aad", r"heart", r"cancer"]
    ):
        return "professional_org"
    if any(
        kw in domain
        for kw in ["hospital", "clinic", "health", "medical", "medicine", "mayo", "cleveland", "johns"]
    ):
        return "hospital"
    if any(re.search(p, full_url) for p in BRAND_BLOG_PATTERNS):
        return "brand_blog"
    return "general"


# ---------------------------------------------------------------------------
# HTTP / text extraction
# ---------------------------------------------------------------------------

def fetch_url(url: str, retries: int = 2) -> Optional[str]:
    """
    Download the raw HTML of *url*.  Returns None on failure.
    """
    for attempt in range(retries + 1):
        try:
            resp = requests.get(url, headers=REQUEST_HEADERS, timeout=REQUEST_TIMEOUT)
            resp.raise_for_status()
            return resp.text
        except requests.RequestException as exc:
            logger.warning("Fetch attempt %d failed for %s: %s", attempt + 1, url, exc)
            if attempt < retries:
                time.sleep(2 ** attempt)
    return None


def extract_text_trafilatura(html: str) -> Optional[str]:
    """Use trafilatura (preferred) to extract main article text."""
    if not _TRAFILATURA_AVAILABLE:
        return None
    return trafilatura.extract(html, include_comments=False, include_tables=False)


def extract_text_bs4(html: str) -> str:
    """Fallback: strip tags with BeautifulSoup."""
    soup = BeautifulSoup(html, "lxml")
    # Remove boilerplate tags
    for tag in soup(["script", "style", "nav", "footer", "header", "aside", "form"]):
        tag.decompose()
    return " ".join(soup.get_text(separator=" ").split())


def extract_text(html: str) -> str:
    """Extract main text from HTML, preferring trafilatura over bs4."""
    text = extract_text_trafilatura(html)
    if text and len(text.strip()) > 100:
        return text
    return extract_text_bs4(html)


def fetch_and_extract(url: str) -> Optional[str]:
    """
    Convenience: fetch a URL and return its main text, or None on failure.
    """
    html = fetch_url(url)
    if html is None:
        return None
    return extract_text(html)


# ---------------------------------------------------------------------------
# Text analysis helpers
# ---------------------------------------------------------------------------

def word_count(text: str) -> int:
    return len(text.split())


def sentence_count(text: str) -> int:
    return max(1, len(re.split(r"[.!?]+", text)))


def avg_sentence_length(text: str) -> float:
    return word_count(text) / sentence_count(text)


def count_references(text: str) -> int:
    """
    Heuristic count of citation-like patterns in text.
    Looks for: (Author, Year), [1], doi:, study, research, according to.
    """
    patterns = [
        r"\(\w[\w\s,]+\d{4}\)",   # (Author, 2023)
        r"\[\d+\]",                # [1], [12]
        r"\bdoi:",
        r"\bpmid:",
        r"\bpubmed\b",
        r"\bstudy\b",
        r"\bresearch\b",
        r"\btrial\b",
        r"\baccording to\b",
        r"\bevidence\b",
        r"\bjournal\b",
    ]
    count = 0
    tl = text.lower()
    for p in patterns:
        count += len(re.findall(p, tl))
    return count


def truncate(text: str, max_chars: int = 2000) -> str:
    if len(text) <= max_chars:
        return text
    return text[:max_chars] + "…"
