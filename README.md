# TruthGrid CareerAgent

**AI-native skill assessment for India's 40M annual graduates.**

> A multi-step agentic pipeline — not a chatbot, not a spreadsheet wrapper, not a single API call.

---

## What is TruthGrid?

TruthGrid produces a **TruthID score** (0–10,000) that measures what actually predicts job performance: **priority definition ability**, execution speed, and real-world project evidence — not credentials, GPA, or institution name.

India graduates 40M+ students annually. Employers interview 50+ candidates per role because there's no verifiable signal to filter by. A student from CCS University, Meerut who shipped two real projects for paying clients is systematically undervalued by credential-based filters. TruthGrid fixes this.

---

## Architecture

```
User Input (StudentProfile JSON)
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│               AGENTIC LOOP  (src/agent.ts)               │
│                                                          │
│  Claude (claude-sonnet-4) with tool_use                  │
│  → decides WHICH tool to call next                       │
│  → decides ORDER (not hardcoded)                         │
│  → decides WHEN to stop                                  │
│                                                          │
│  Iteration 1: Claude → assess_skills                     │
│  Iteration 2: Claude → research_job_market (live web)    │
│  Iteration 3: Claude → generate_truth_id                 │
│  Iteration 4: Claude → generate_report                   │
│  Iteration 5: Claude → end_turn (done)                   │
│                                                          │
│  If confidence < 0.7 after Step 1:                       │
│  → Claude automatically calls clarify before Step 2      │
└─────────────────────────────────────────────────────────┘
        │
        ▼
TruthID Score (0–10,000) + Employer Report (markdown)
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│              NEXT.JS UI  (truthgrid-ui/)                 │
│                                                          │
│  /            — Landing page + demo CTA                  │
│  /demo        — Interactive 4-step pipeline demo          │
│  /dashboard   — Student overview + TruthID scores        │
│  /submit      — Multi-step assessment form               │
│  /api/assess  — REST endpoint for agent pipeline         │
└─────────────────────────────────────────────────────────┘
```

**This is not a chatbot.** Claude orchestrates the tool sequence. Each tool result feeds back into Claude's context; it reflects and decides the next step. The agent can self-correct (call `clarify` when uncertain) before proceeding.

---

## Score Formula

```
TruthID = (priorityAbility / 10  ×  3000)    // 30% — highest weight
        + (technicalSkills / 10  ×  2000)    // 20%
        + (executionSpeed  / 10  ×  2000)    // 20% (behavior-adjusted)
        + (learnability    / 10  ×  2000)    // 20% (completion-adjusted)
        + (softSkills      / 10  ×  1000)    // 10%
        + marketAlignmentBonus               // up to +500 (live market data)
        ─────────────────────────────
        = max 10,000
```

### Why priority ability at 30%?

It's the single most predictive signal of long-term value creation. A student who consistently worked on the highest-impact problem first — before the nice-to-have features — outperforms at every career stage. This is also the #1 quality named in MUST's hiring criteria.

### Dimension definitions

| Dimension | Weight | What it measures |
|---|---|---|
| Priority Ability | 30% | Did they ship the most important thing first? |
| Technical Skills | 20% | Can they actually execute their domain work? |
| Execution Speed | 20% | Time from idea to shipped output |
| Learnability | 20% | New tools picked up across projects |
| Soft Skills | 10% | Clarity of impact communication |
| Market Bonus | +500 | Skills overlap with live job market demand |

---

## Tool Pipeline

| Tool | Description | Why AI-native |
|---|---|---|
| `assess_skills` | Scores student on 5 dimensions | India-specific rubric in system prompt; Tier-2 city context; credential inflation discount |
| `research_job_market` | Live web search for field demand | `web_search_20250305` tool — real-time Naukri/LinkedIn data |
| `generate_truth_id` | Produces 0–10,000 weighted score | Cannot run without both prior tools (validated at runtime) |
| `generate_report` | Employer-ready markdown assessment | Tier labels, score bars, concrete next steps |
| `clarify` | Auto-triggered when confidence < 0.7 | Agent is self-aware — asks before it guesses |

### Pipeline validation

`src/tools/index.ts` enforces tool execution order at runtime:

```typescript
// Attempting to call generateTruthID without prior steps throws:
// "[TruthGrid] Pipeline violation: generateTruthID requires assessSkills to run first."
validatePipelineStep("generateTruthID", { skillsAssessed: false, ... });
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- An Anthropic API key OR a Google AI Studio (Gemini) API key
- For UI only: no API key required (uses heuristic scoring in demo mode)

### Backend (agent + benchmarks)

```bash
# From repo root
npm install
cp .env.example .env
# Edit .env and set ANTHROPIC_API_KEY=your_key

# Run agent against sample student profile
npm run dev

# Run benchmarks (agent vs default Claude)
npm run benchmark

# Build TypeScript
npm run build
```

The agent reads `data/sample_student.json` and writes results to `output_report.md`.

### Frontend (Next.js UI)

```bash
cd truthgrid-ui
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll see the landing page.

- `/demo` — Watch the 4-step pipeline run on a real student profile (no API key needed)
- `/submit` — Multi-step form to submit your own assessment
- `/dashboard` — Admin view of all student TruthID scores
- `POST /api/assess` — REST API for programmatic access

### Running both together

```bash
# Terminal 1 — backend
npm run dev

# Terminal 2 — frontend
cd truthgrid-ui && npm run dev
```

The UI's `/api/assess` endpoint runs heuristic scoring by default. To connect it to the full AI pipeline, set `ANTHROPIC_API_KEY` in `truthgrid-ui/.env.local`.

---

## API Reference

### `POST /api/assess`

Accepts a student profile and returns a TruthID assessment.

```json
{
  "studentProfile": {
    "name": "Ridhi Jain",
    "field": "digital marketing",
    "institution": "CCS University, Meerut",
    "city": "Muzaffarnagar",
    "selfAssessment": {
      "Social Media Marketing": 8,
      "AI Tools": 9,
      "SEO": 6
    },
    "projectHistory": [
      {
        "title": "AI-Powered LinkedIn Content Strategy",
        "description": "...",
        "toolsUsed": ["Claude API", "Google Sheets"],
        "impactStatement": "Client got 3 inbound leads within 30 days"
      }
    ]
  }
}
```

**Response:**

```json
{
  "truthId": {
    "overallScore": 7840,
    "tier": "Strong (top 20%)",
    "confidence": 0.88,
    "breakdown": {
      "priorityAbility": 2550,
      "technicalSkills": 1400,
      "executionSpeed": 1600,
      "learnability": 1700,
      "softSkills": 750,
      "marketAlignmentBonus": 300
    },
    "employerSummary": "...",
    "topStrengths": ["..."],
    "developmentAreas": ["..."]
  },
  "durationMs": 1240
}
```

### `GET /api/assess`

Returns the API schema and score formula documentation.

---

## Benchmark: Agent vs Default Claude

**Methodology:** Same student profile, run through (A) TruthGrid full pipeline and (B) vanilla Claude single call.

```
Test Case                                  Agent    Default   Gap
───────────────────────────────────────────────────────────────
BBA, tier-2, 3 shipped projects            ~8,200   ~4,300   +91%
CS, no shipped projects, high GPA          ~5,100   ~6,800   -25% ←
Self-taught, 8 shipped tools               ~9,100   ~5,200   +75%
MBA, zero technical skills                 ~3,800   ~5,500   -31% ←
Commerce, paid newsletter                  ~7,600   ~4,100   +85%
───────────────────────────────────────────────────────────────
```

*Rows marked ← are cases where the agent scores LOWER than default Claude. This is a feature: the agent correctly penalizes credential-heavy profiles with no shipped output. Default Claude is biased toward credentials.*

Run `npm run benchmark` to regenerate with live scores → `benchmarks/results.json`

---

## How This Differs from a Generic Claude Prompt

Default Claude (single API call, no tools, no domain context):
- No knowledge of CCS University, AKTU, or Tier-2 city talent signals
- Cannot do live job market research
- No structured weighting — treats all dimensions equally
- No confidence check — always produces an answer even with thin data
- No distinction between shipped work and planned work

TruthGrid CareerAgent:
- India-specific domain knowledge baked into system prompt
- Live web search for real-time market data
- Explicit 30/20/20/20/10 weighted scoring formula
- Confidence threshold with clarification loop
- Pipeline validation — each step must complete before the next can run
- Context-aware: Tier-2 city students are scored on their work, not their zip code

---

## Project Structure

```
truthgrid-career-agent/          ← root
├── src/
│   ├── agent.ts                 ← agentic loop (Claude tool_use)
│   ├── index.ts                 ← entry point (reads sample_student.json)
│   ├── prompts.ts               ← India-specific system prompt + tool prompts
│   ├── types.ts                 ← TypeScript interfaces
│   ├── gemini.ts                ← Gemini API client (alternative to Anthropic)
│   └── tools/
│       ├── index.ts             ← Tool implementations + pipeline validator
│       ├── assessSkills.ts      ← Gemini-based skill scoring
│       ├── researchMarket.ts    ← Gemini-based market research
│       └── generateTruthID.ts   ← Score computation
├── truthgrid-ui/                ← Next.js 14 frontend
│   └── src/app/
│       ├── page.tsx             ← Landing page
│       ├── demo/page.tsx        ← Interactive 4-step pipeline demo
│       ├── dashboard/page.tsx   ← Admin dashboard
│       ├── submit/page.tsx      ← Assessment submission form
│       └── api/assess/route.ts  ← REST API endpoint
├── data/
│   └── sample_student.json      ← Sample student profile (no real PII)
├── benchmarks/
│   └── run.ts                   ← Agent vs default Claude comparison
├── .env.example                 ← Required env vars
└── .cursorrules                 ← Cursor AI instructions for this repo
```

---

## Environment Variables

| Variable | Required by | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | `src/agent.ts`, `src/tools/index.ts` | Claude API (primary agent loop) |
| `GOOGLE_API_KEY` | `src/gemini.ts`, `src/tools/assessSkills.ts` | Gemini API (alternative free option) |
| `NEXT_PUBLIC_API_URL` | `truthgrid-ui/src/lib/api.ts` | Backend API URL (optional, defaults to heuristic mode) |

---

## Security

- All API keys in `.env` / `.env.local` (gitignored)
- `.env.example` shows required variable names with empty values
- No PII in sample data — `data/sample_student.json` uses fictional profiles
- `benchmarks/results.json` contains only scores, no personal data

---

*TruthGrid — India's first AI-native skill verification system.*  
*Built by a Muzaffarnagar founder who knows exactly what this signal gap costs.*
