"""
TruthGrid Healthcare Content Reliability Framework
truthgrid_healthcare_v1.py — Main automation pipeline

Usage:
    python src/truthgrid_healthcare_v1.py
    python src/truthgrid_healthcare_v1.py --urls data/raw_urls.csv --output outputs/
    python src/truthgrid_healthcare_v1.py --url https://example.com/article
"""

from __future__ import annotations
import argparse
import csv
import json
import logging
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import List, Optional

# Ensure src/ is on the path when run from repo root
sys.path.insert(0, str(Path(__file__).parent))

import pandas as pd
from tqdm import tqdm

from scorer import score_article, ArticleScore
from utils import fetch_and_extract

# ---------------------------------------------------------------------------
# Logging setup
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Default test dataset
# ---------------------------------------------------------------------------

DEFAULT_ARTICLES = [
    {
        "url": "https://ods.od.nih.gov/factsheets/VitaminC-HealthProfessional",
        "category": "vitamins",
        "label": "reliable",
    },
    {
        "url": "https://diabetes.org/about-diabetes/warning-signs-symptoms",
        "category": "diabetes",
        "label": "reliable",
    },
    {
        "url": "https://www.aad.org/public/everyday-care/skin-care-secrets/anti-aging/retinoid-retinol",
        "category": "skincare",
        "label": "reliable",
    },
    {
        "url": "https://www.olivaclinic.com/blog/top-10-foods-to-boost-your-immune-system",
        "category": "immunity",
        "label": "slightly_misleading",
    },
    {
        "url": "https://ingeniouslife.com/blogs/blog/collagen-supplements-the-8-key-benefits",
        "category": "supplements",
        "label": "slightly_misleading",
    },
    {
        "url": "https://drpatkars.com/natures-pharmacy-supplements-and-herbs-on-the-road-to-diabetes-reversal",
        "category": "diabetes",
        "label": "slightly_misleading",
    },
    {
        "url": "https://proactiveforher.com/blogs/nutrition/health-benefits-of-collagen",
        "category": "supplements",
        "label": "highly_promotional",
    },
]

# ---------------------------------------------------------------------------
# I/O helpers
# ---------------------------------------------------------------------------


def load_urls_from_csv(path: str) -> List[dict]:
    """Load URL list from a CSV with columns: url, category, label, notes."""
    rows = []
    with open(path, newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            rows.append(row)
    return rows


def export_csv(scores: List[ArticleScore], path: str) -> None:
    df = pd.DataFrame([s.to_dict() for s in scores])
    df.to_csv(path, index=False)
    logger.info("CSV saved → %s", path)


def export_json(scores: List[ArticleScore], path: str) -> None:
    data = [s.to_dict() for s in scores]
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2, ensure_ascii=False)
    logger.info("JSON saved → %s", path)


def export_markdown(scores: List[ArticleScore], path: str) -> None:
    lines = [
        "# TruthGrid Healthcare — Scoring Results",
        f"\n_Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}_\n",
        "| # | URL | Category | Source | Accuracy | Bias | Citations | Clarity | Raw | Penalty | **Final** | Risk |",
        "|---|-----|----------|--------|----------|------|-----------|---------|-----|---------|-----------|------|",
    ]
    for i, s in enumerate(scores, 1):
        short_url = s.url[:55] + "…" if len(s.url) > 55 else s.url
        lines.append(
            f"| {i} | {short_url} | {s.category} "
            f"| {s.source_credibility} | {s.medical_accuracy} | {s.bias_level} "
            f"| {s.citation_presence} | {s.clarity} "
            f"| {s.raw_score:.1f} | -{s.penalty:.1f} | **{s.final_score:.1f}** | {s.risk_level} |"
        )

    lines += [
        "\n## Risk Level Summary\n",
        "| Risk Level | Count |",
        "|------------|-------|",
    ]
    from collections import Counter
    risk_counts = Counter(s.risk_level for s in scores)
    for level, count in sorted(risk_counts.items()):
        lines.append(f"| {level} | {count} |")

    with open(path, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines) + "\n")
    logger.info("Markdown saved → %s", path)


def export_xlsx(scores: List[ArticleScore], path: str) -> None:
    """Export scored results plus a summary sheet to an Excel workbook."""
    try:
        import openpyxl  # noqa: F401
    except ImportError:
        logger.warning("openpyxl not installed; skipping XLSX export.")
        return

    df = pd.DataFrame([s.to_dict() for s in scores])

    # Category summary
    summary = (
        df.groupby("category")["final_score"]
        .agg(["count", "mean", "min", "max"])
        .rename(columns={"count": "Articles", "mean": "Avg Score", "min": "Min", "max": "Max"})
        .reset_index()
    )

    with pd.ExcelWriter(path, engine="openpyxl") as writer:
        df.to_excel(writer, sheet_name="Scored Results", index=False)
        summary.to_excel(writer, sheet_name="Category Summary", index=False)

    logger.info("XLSX saved → %s", path)


# ---------------------------------------------------------------------------
# Pipeline
# ---------------------------------------------------------------------------


def run_pipeline(
    articles: List[dict],
    output_dir: str = "outputs",
    fetch: bool = True,
) -> List[ArticleScore]:
    """
    Main scoring pipeline.

    Args:
        articles: list of dicts with keys: url, category (optional), label (optional)
        output_dir: directory to write result files
        fetch: if True, download article text; if False, use dummy text for testing
    """
    os.makedirs(output_dir, exist_ok=True)
    scores: List[ArticleScore] = []

    logger.info("Starting TruthGrid Healthcare scoring pipeline (%d articles)", len(articles))

    for item in tqdm(articles, desc="Scoring articles"):
        url = item.get("url", "").strip()
        category = item.get("category", "unknown")
        if not url:
            continue

        logger.info("Processing: %s", url)

        if fetch:
            text = fetch_and_extract(url)
            if not text:
                logger.warning("Could not fetch text for %s — skipping.", url)
                continue
        else:
            # Minimal stub text for offline/test mode
            text = f"Sample article text for {url}. Studies suggest this may help."

        score = score_article(url=url, text=text, category=category)
        scores.append(score)

        logger.info(
            "  → Score: %.1f (%s) | Penalty: -%.1f | Risk: %s",
            score.final_score, score.raw_score, score.penalty, score.risk_level,
        )

    # Export results
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    csv_path = os.path.join(output_dir, "truthgrid_results.csv")
    json_path = os.path.join(output_dir, f"truthgrid_results_{ts}.json")
    md_path = os.path.join(output_dir, "truthgrid_summary.md")
    xlsx_path = os.path.join(output_dir, "truthgrid_results.xlsx")

    if scores:
        export_csv(scores, csv_path)
        export_json(scores, json_path)
        export_markdown(scores, md_path)
        export_xlsx(scores, xlsx_path)

    logger.info("Pipeline complete. %d articles scored.", len(scores))
    return scores


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="TruthGrid Healthcare — Content Reliability Scoring Pipeline"
    )
    parser.add_argument(
        "--urls",
        help="Path to CSV file containing URLs (columns: url, category, label, notes)",
        default=None,
    )
    parser.add_argument(
        "--url",
        help="Single URL to score",
        default=None,
    )
    parser.add_argument(
        "--output",
        help="Output directory for results (default: outputs/)",
        default="outputs",
    )
    parser.add_argument(
        "--no-fetch",
        action="store_true",
        help="Disable live URL fetching (offline/test mode)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    if args.url:
        articles = [{"url": args.url, "category": "unknown"}]
    elif args.urls:
        articles = load_urls_from_csv(args.urls)
    else:
        logger.info("No --url or --urls provided; using built-in test dataset.")
        articles = DEFAULT_ARTICLES

    run_pipeline(
        articles=articles,
        output_dir=args.output,
        fetch=not args.no_fetch,
    )


if __name__ == "__main__":
    main()
