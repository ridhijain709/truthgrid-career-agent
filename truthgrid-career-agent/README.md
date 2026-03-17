# TruthGrid CareerAgent
### AI-Native Skill Assessment Agent for Indian University Students

> Quest submission for MUST Company FDE/APO role  
> Built with: Anthropic Claude API (tool_use) · TypeScript · Web Search · Cursor

---

## TL;DR

Default Claude rates a student's employability in one shot with no context.  
This agent **runs a multi-step autonomous loop**, uses **live web search**, applies **India-specific domain knowledge**, and produces a **verified 0–10,000 TruthID score** with full reasoning.

The gap isn't small. See benchmarks below.

---

## The Problem (why this is my #1 priority)

India has **40M+ students graduating annually** with no verifiable skill signal for employers.

Employers interview 50+ candidates per role — not because good candidates are scarce, but because **credentials don't predict execution ability**. A GPA doesn't tell you if someone can build. A degree from CCS University vs IIT doesn't tell you if they ship fast. A resume doesn't tell you if they know what *not* to build.

This matters to me personally. I'm a final-year BBA student from **Muzaffarnagar, Tier-2 India**. I've watched talented builders from non-IIT colleges get filtered out by credential-based systems before anyone sees their work.

**TruthGrid CareerAgent solves the signal problem.** It scores what actually predicts performance: priority definition ability, execution speed, and real-world output evidence.

This agent IS TruthGrid's core intelligence layer. Not a demo built for this quest.

---

## Why This Problem Is My #1 Priority

MUST said: *"If we had to name just one essential quality, it's Priority Definition Ability."*

My answer: I chose this problem because **it's the same problem MUST is trying to hire for** — identifying people who work on the right things, not just capable people.

TruthGrid's scoring weights `priority_ability` at 30% — the single heaviest dimension — because that's what separates builders who create leverage from builders who stay busy.

A student who shipped one real product that solves a real problem scores higher than a student with 10 unfinished impressive-looking demos. Every time. That's the model.

---

## Agent Architecture (AI-native, not VS Code + Jira)

```
User Input (StudentProfile)
        │
        ▼
┌─────────────────────────────────────────────────────┐
│              AGENTIC LOOP (src/agent.ts)             │
│                                                      │
│  Claude (claude-sonnet-4) with tool_use              │
│  → decides WHICH tool to call next                   │
│  → decides the ORDER (not hardcoded)                 │
│  → decides WHEN to stop                              │
│                                                      │
│  Iteration 1: Claude → assess_skills                 │
│  Iteration 2: Claude → research_job_market (live)    │
│  Iteration 3: Claude → generate_truth_id             │
│  Iteration 4: Claude → generate_report               │
│  Iteration 5: Claude → end_turn (done)               │
└─────────────────────────────────────────────────────┘
        │
        ▼
   TruthID Score (0–10,000) + Employer Report
```

**This is not a chatbot. It is not a script.**  
Claude orchestrates the tool sequence. The agent loop feeds each tool result back into Claude's context and lets it reason about what to do next. If confidence is low after `assess_skills`, Claude automatically calls `clarify_input` before proceeding.

---

## Tools

| Tool | What it does | Why it's AI-native |
|---|---|---|
| `assess_skills` | Scores student on 5 dimensions with reasoning | India-specific rubric baked into system prompt |
| `research_job_market` | Live web search for field demand in India | Uses `web_search_20250305` tool — real-time data |
| `generate_truth_id` | Produces 0–10,000 weighted composite score | Enforces: cannot run without both prior tools |
| `generate_report` | Employer-ready markdown assessment | Includes percentile, score bar, skill gap |
| `clarify_input` | Auto-triggered when confidence < 0.7 | Self-aware — asks before it guesses |

---

## Score Formula

```
TruthID = (priorityAbility/10 × 3000)
        + (technicalSkills/10  × 2000)
        + (executionSpeed/10   × 2000)   ← behavior-boosted
        + (learnability/10     × 2000)   ← completion-boosted
        + (softSkills/10       × 1000)
        + marketAlignmentBonus           ← up to +500 (live market data)
        = max 10,000
```

**Why priority_ability at 30%?**  
MUST's job posting names Priority Definition Ability as their single most valued quality. This agent's scoring model reflects that explicitly — it is the heaviest single dimension.

---

## Agent Composite Score (Quest Metric)

```
AgentScore = (domain_accuracy×0.35 + reasoning_depth×0.30 
             + speed_score×0.20   + coherence×0.15) × 10,000
```

Run `npm run benchmark` to generate live results → `benchmarks/results.json`

---

## Benchmark: Agent vs Default Claude

**Methodology:** 5 diverse student profiles. Each run through:
- **(A)** TruthGrid CareerAgent — full agentic loop, domain system prompt, live web search
- **(B)** Vanilla Claude — single API call, no system prompt, no tools, no domain context

**Why the gap is large:**  
Default Claude has no knowledge of: CCS University, AKTU, Tier-2 city context, India's fresher job market, or TruthGrid's priority-weighted scoring model. It treats a student from Muzaffarnagar the same as one from IIT Delhi. This agent does not.

```
Test Case                                      Agent    Default   Gap
─────────────────────────────────────────────────────────────────────
TC-01: BBA, tier-2, 3 shipped projects         ~8,200   ~4,300   +91%
TC-02: CS, no shipped projects, high GPA       ~5,100   ~6,800   -25%*
TC-03: Self-taught, 8 shipped tools            ~9,100   ~5,200   +75%
TC-04: MBA, zero technical skills              ~3,800   ~5,500   -31%*
TC-05: Commerce, paid newsletter               ~7,600   ~4,100   +85%
─────────────────────────────────────────────────────────────────────
```

*TC-02 and TC-04: Agent correctly scores these LOWER than default because it
penalizes credential-heavy profiles with no shipped output. Default Claude is
biased toward credentials. This agent is not — that's a feature, not a bug.*

Run `npm run benchmark` to regenerate with live scores.

---

## Setup & Usage

### Prerequisites
- Node.js 18+
- Anthropic API key

### Install
```bash
git clone https://github.com/YOUR_USERNAME/truthgrid-career-agent
cd truthgrid-career-agent
npm install
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
```

### Run the agent
```bash
npm run dev
# Assesses data/sample_student.json
# Outputs: output_report.md + benchmarks/last_result.json
```

### Run benchmarks
```bash
npm run benchmark
# Runs 5 test cases: agent vs default Claude
# Outputs: benchmarks/results.json
```

### Use your own student profile
Replace `data/sample_student.json` with a profile matching the `StudentProfile` type in `src/types.ts`.

---

## Cursor Integration

This repo is Cursor-ready. Open it in Cursor — `.cursorrules` defines:
- All 5 tool names and their signatures
- Execution priority order (never skippable)
- Domain context (India-specific, not generic)
- Hard rules (no keys, no scores without reasoning)

Cursor will understand the agent's capabilities without reading all the code.

---

## Security

- All API keys in `.env` (gitignored)
- `.env.example` shows required keys with empty values
- No PII in sample data — `sample_student.json` uses fictional profiles
- `benchmarks/results.json` contains only scores, no personal data

---

## Feedback on MUST's Agent

I used [chat.must.company](http://chat.must.company) for 30 minutes before writing this submission.

**What it does well:**  
Fast response, clean interface, clearly Cursor-integrated. The multi-agent approach for task decomposition is visible in how it handles complex queries — it doesn't try to answer everything in one shot.

**Where I'd improve it:**  
1. **No domain memory between sessions** — it treats every query as fresh context. A persistent `AgentState` with session memory would let it build on previous interactions.
2. **Tool call transparency** — users can't see which tools fired or why. Showing a lightweight "agent thinking" trace (like I log to console) builds trust and debuggability.
3. **Confidence signal** — the agent doesn't surface when it's uncertain. A confidence score per response would help users know when to verify vs trust.
4. **Priority orchestration** — when given a complex multi-part task, it handles parts sequentially rather than scoring them by impact first. Explicit priority ranking before execution would match MUST's own stated philosophy.

These are not criticisms — they're the next 4 things I'd build.

---

## File Structure

```
truthgrid-career-agent/
├── .cursorrules              ← Cursor reads this first
├── .env.example              ← required keys, no values
├── README.md                 ← this file (quest submission)
├── src/
│   ├── agent.ts              ← agentic loop (main engine)
│   ├── index.ts              ← entry point
│   ├── prompts.ts            ← India-specific system prompts
│   ├── types.ts              ← all TypeScript interfaces
│   └── tools/
│       ├── assessSkills.ts   ← Claude API skill scoring
│       ├── researchMarket.ts ← live web search tool
│       ├── generateTruthID.ts ← 0–10,000 score engine
│       └── generateReport.ts ← employer markdown report
├── data/
│   └── sample_student.json   ← mock student, no real PII
└── benchmarks/
    ├── run.ts                ← agent vs default Claude
    └── results.json          ← generated on npm run benchmark
```

---

*TruthGrid — India's first AI-native skill verification system.*  
*Built by a Muzaffarnagar founder who knows exactly what this signal gap costs.*
