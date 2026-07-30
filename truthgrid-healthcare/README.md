# TruthGrid Healthcare Content Reliability Framework

> An AI-assisted system for evaluating the trustworthiness of healthcare and wellness content across the web.

---

## Problem Statement

The internet is flooded with health advice — from NIH fact sheets to brand blogs selling supplements. Most consumers cannot distinguish between evidence-based guidance and promotional misinformation. This framework addresses that gap by providing a **structured, reproducible, 5-factor scoring methodology** grounded in public health epistemology.

---

## What This Project Does

- **Evaluates healthcare articles** across 5 reliability dimensions
- **Scores content** on a 0–100 scale with risk classification
- **Detects red-flag language** (miracle cures, disease reversal claims, guaranteed results)
- **Applies penalty adjustments** for misleading claim patterns
- **Exports results** to CSV, JSON, and Markdown formats
- **Supports batch processing** of URL lists

---

## Scoring Framework

| Dimension           | Max Points | Weight Description                              |
|---------------------|------------|--------------------------------------------------|
| Source Credibility  | 25         | WHO, NIH, CDC → 5; Hospital → 4; Blog/Brand → 1–2 |
| Medical Accuracy    | 30         | Scientific balance, realistic claims, evidence language |
| Bias Level          | 20         | Educational vs promotional tone                 |
| Citation Presence   | 15         | Peer-reviewed refs, research links, studies     |
| Clarity             | 10         | Readability and audience appropriateness        |

**Final Score = (Source × 5) + (Accuracy × 6) + (Bias × 4) + (Citations × 3) + (Clarity × 2)**

### Risk Classification

| Score Range | Trust Level   |
|-------------|---------------|
| 80–100      | 🟢 High Trust  |
| 60–79       | 🟡 Moderate    |
| 40–59       | 🟠 Low         |
| < 40        | 🔴 High Risk   |

---

## Test Dataset (7 Articles)

### Reliable / Evidence-Based
1. **NIH ODS: Vitamin C Fact Sheet** — https://ods.od.nih.gov/factsheets/VitaminC-HealthProfessional
2. **ADA: Diabetes Warning Signs** — https://diabetes.org/about-diabetes/warning-signs-symptoms
3. **AAD: Retinoid vs Retinol** — https://www.aad.org/public/everyday-care/skin-care-secrets/anti-aging/retinoid-retinol

### Slightly Misleading
4. **Oliva Clinic: Top 10 Foods to Boost Immune System** — https://www.olivaclinic.com/blog/top-10-foods-to-boost-your-immune-system
5. **Ingenious Life: Collagen Benefits** — https://ingeniouslife.com/blogs/blog/collagen-supplements-the-8-key-benefits
6. **Dr Patkar's: Supplements for Diabetes Reversal** — https://drpatkars.com/natures-pharmacy-supplements-and-herbs-on-the-road-to-diabetes-reversal

### Highly Promotional
7. **Proactive For Her: Collagen** — https://proactiveforher.com/blogs/nutrition/health-benefits-of-collagen

---

## Directory Structure

```
truthgrid-healthcare/
├── README.md
├── requirements.txt
├── LICENSE
├── .gitignore
├── data/
│   ├── raw_urls.csv
│   ├── truthgrid_healthcare_tracker.xlsx
│   ├── scored_results.csv
│   └── notes/
├── src/
│   ├── truthgrid_healthcare_v1.py
│   ├── scorer.py
│   ├── penalties.py
│   └── utils.py
├── docs/
│   ├── scoring_rubric.md
│   ├── methodology.md
│   ├── roadmap.md
│   ├── interview_notes.md
│   └── case_study.md
├── outputs/
│   ├── truthgrid_results.csv
│   ├── truthgrid_summary.md
│   └── charts/
└── assets/
    ├── portfolio_section.html
    └── case_study_brief.md
```

---

## Quick Start

### 1. Install dependencies

```bash
cd truthgrid-healthcare
pip install -r requirements.txt
```

### 2. Run the scoring pipeline

```bash
python src/truthgrid_healthcare_v1.py
```

### 3. View results

Results are exported to `outputs/`:
- `truthgrid_results.csv` — Full scored dataset
- `truthgrid_summary.md` — Markdown summary report

---

## Key Features

✅ Structured 5-factor evaluation framework with scientific basis (MedlinePlus, NCCIH, WHO, FDA)  
✅ Automated text extraction and scoring pipeline  
✅ Red-flag phrase detection (miracle cure, guaranteed results, reverse disease claims, etc.)  
✅ Penalty adjustment system for misleading claim language  
✅ Risk classification (High Trust → High Risk)  
✅ CSV/JSON/Markdown export capabilities  
✅ Consulting-style case study (15 sections)  
✅ Portfolio-ready presentation materials  
✅ Interview preparation guide with Q&As  
✅ 6-7 month development roadmap  
✅ Reusable scoring rubric and methodology documentation  

---

## References & Authoritative Sources

- [MedlinePlus — Health Information Quality Guidelines](https://medlineplus.gov/)
- [NIH Office of Dietary Supplements](https://ods.od.nih.gov/)
- [WHO — Health and Wellness Standards](https://www.who.int/)
- [FDA — Dietary Supplement Guidance](https://www.fda.gov/food/dietary-supplements)
- [NCCIH — Complementary Health Approaches](https://www.nccih.nih.gov/)
- [CDC — Health Communication Guidelines](https://www.cdc.gov/)

---

## Domain Review

This framework benefits from pharma and medical writing expertise for content validation. The scoring rubric and penalty logic were developed with reference to established health communication standards and peer-reviewed health literacy research.

---

## License

MIT License — see [LICENSE](LICENSE) for details.
