// ─────────────────────────────────────────────
//  TruthGrid CareerAgent — Tool Implementations
// ─────────────────────────────────────────────

import Anthropic from "@anthropic-ai/sdk";
import { randomUUID } from "crypto";
import type { StudentProfile, SkillScore, JobInsights, TruthID, BenchmarkResult } from "../types.js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Pipeline step validator ───────────────────
// Enforces the tool execution order:
//   assessSkills → researchJobMarket → generateTruthID → generateReport
// Call validatePipelineStep before each tool to get a clear error if a
// prerequisite step was skipped rather than silently producing garbage output.

export interface PipelineState {
  skillsAssessed: boolean;
  marketResearched: boolean;
  truthIdGenerated: boolean;
}

export function validatePipelineStep(
  step: "researchMarket" | "generateTruthID" | "generateReport",
  state: PipelineState
): void {
  if (step === "researchMarket") return; // no prerequisite
  if (step === "generateTruthID" && !state.skillsAssessed) {
    throw new Error(
      "[TruthGrid] Pipeline violation: generateTruthID requires assessSkills to run first. " +
        "Run Step 1 (assessSkills) before Step 3 (generateTruthID)."
    );
  }
  if (step === "generateTruthID" && !state.marketResearched) {
    throw new Error(
      "[TruthGrid] Pipeline violation: generateTruthID requires researchJobMarket to run first. " +
        "Run Step 2 (researchJobMarket) before Step 3 (generateTruthID)."
    );
  }
  if (step === "generateReport" && !state.truthIdGenerated) {
    throw new Error(
      "[TruthGrid] Pipeline violation: generateReport requires generateTruthID to run first. " +
        "Run Step 3 (generateTruthID) before Step 4 (generateReport)."
    );
  }
}

// ── Input validators ──────────────────────────

function assertProfileFields(profile: Partial<StudentProfile>): void {
  const missing: string[] = [];
  if (!profile.field) missing.push("field");
  if (!profile.projectHistory || profile.projectHistory.length === 0) missing.push("projectHistory");
  if (!profile.selfAssessment || Object.keys(profile.selfAssessment).length === 0) missing.push("selfAssessment");
  if (missing.length > 0) {
    throw new Error(
      `[TruthGrid] assessSkills: missing required profile fields: ${missing.join(", ")}. ` +
        "Cannot produce a reliable score without project history and self-assessment data."
    );
  }
}

export async function assessSkills(profile: Partial<StudentProfile>): Promise<SkillScore> {
  assertProfileFields(profile);
  const t0 = Date.now();
  const res = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: `You are a senior talent evaluator for Indian university students.
Score on 5 dimensions. IMPORTANT:
- priorityAbility is the #1 signal. Did they work on the RIGHT problem?
- Low editCount = clear thinker. Fast completion = decisive.
- Tier-2 city students with real projects beat metro credential collectors.
- Self-ratings 7-10 across board = inflated. Discount 15%.
Return ONLY valid JSON — no markdown, no backticks:
{ "priorityAbility":<0-10>, "technicalSkills":<0-10>, "executionSpeed":<0-10>,
  "learnability":<0-10>, "softSkills":<0-10>, "reasoning":"<2-3 sentences>",
  "confidence":<0.0-1.0>, "flags":["<notable signals>"] }`,
    messages: [{ role: "user", content: JSON.stringify({
      field: profile.field, institution: profile.institution, city: profile.city,
      selfAssessment: profile.selfAssessment,
      projects: profile.projectHistory?.map(p => ({ title: p.title, description: p.description, toolsUsed: p.toolsUsed, impact: p.impactStatement, durationWeeks: p.durationWeeks })),
      behavior: profile.behaviorMetrics,
    })}],
  });
  const raw = res.content[0].type === "text" ? res.content[0].text : "{}";
  const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim()) as SkillScore;

  // Validate confidence is present and in range
  if (typeof parsed.confidence !== "number" || parsed.confidence < 0 || parsed.confidence > 1) {
    parsed.confidence = 0.75;
  }
  // Clamp all dimension scores to [0, 10]
  for (const key of ["priorityAbility", "technicalSkills", "executionSpeed", "learnability", "softSkills"] as const) {
    if (typeof parsed[key] !== "number") parsed[key] = 5;
    else parsed[key] = Math.max(0, Math.min(10, parsed[key]));
  }

  console.log(`[assessSkills] done in ${Date.now() - t0}ms — confidence: ${parsed.confidence}`);
  return parsed;
}

export async function researchJobMarket(field: string, location = "India", experienceLevel = "fresher"): Promise<JobInsights> {
  const t0 = Date.now();
  const res = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    tools: [{ type: "web_search_20250305" as never, name: "web_search" }],
    messages: [{ role: "user", content: `Top 5 in-demand skills for ${experienceLevel} ${field} jobs in ${location} 2025. Average salary, demand level, top hiring companies.
Return ONLY JSON (no markdown): { "topSkills":["..."], "avgSalary":"₹X LPA", "demandLevel":"low|medium|high|very_high", "topCompanies":["..."], "source":"..." }` }],
  });
  const textBlock = res.content.find(b => b.type === "text");
  const raw = textBlock?.type === "text" ? textBlock.text : "{}";
  let parsed: JobInsights;
  try {
    parsed = JSON.parse(raw.replace(/```json|```/g, "").trim()) as JobInsights;
  } catch {
    parsed = { topSkills: ["AI tools","digital marketing","data analysis","communication","Excel"], avgSalary: "₹3–5 LPA", demandLevel: "high", topCompanies: ["Meesho","Zomato","HDFC Bank","TCS"], source: "fallback" };
  }
  console.log(`[researchMarket] done in ${Date.now() - t0}ms`);
  return parsed;
}

export function generateTruthID(studentId: string, studentName: string, skillScores: SkillScore, jobInsights: JobInsights): TruthID {
  // Guard: all dimension scores must be present and numeric
  const dims = ["priorityAbility", "technicalSkills", "executionSpeed", "learnability", "softSkills"] as const;
  for (const d of dims) {
    if (typeof skillScores[d] !== "number") {
      throw new Error(
        `[TruthGrid] generateTruthID: skillScores.${d} is missing or non-numeric. ` +
          "Ensure assessSkills completed successfully before calling generateTruthID."
      );
    }
  }
  if (!jobInsights.topSkills || jobInsights.topSkills.length === 0) {
    throw new Error(
      "[TruthGrid] generateTruthID: jobInsights.topSkills is empty. " +
        "Ensure researchJobMarket completed successfully before calling generateTruthID."
    );
  }

  // Score formula (exact weights documented in README)
  const WEIGHTS = { priorityAbility: 0.30, technicalSkills: 0.20, executionSpeed: 0.20, learnability: 0.20, softSkills: 0.10 };
  const rawScore =
    skillScores.priorityAbility * WEIGHTS.priorityAbility +
    skillScores.technicalSkills * WEIGHTS.technicalSkills +
    skillScores.executionSpeed  * WEIGHTS.executionSpeed  +
    skillScores.learnability    * WEIGHTS.learnability    +
    skillScores.softSkills      * WEIGHTS.softSkills;
  const baseScore = Math.round((rawScore / 10) * 9500);

  // Market alignment bonus: count skills that appear in AI reasoning text
  // SkillScore.reasoning can be either:
  //   - string: returned by the Anthropic tool (agent loop in src/agent.ts)
  //   - Record<string,string>: returned by the Gemini tool (src/tools/assessSkills.ts)
  // Both formats are normalised to a plain string before matching.
  const reasoningText = (typeof skillScores.reasoning === "string"
    ? skillScores.reasoning
    : Object.values(skillScores.reasoning ?? {}).join(" ")
  ).toLowerCase();
  const matchingSkills = jobInsights.topSkills.filter(s => reasoningText.includes(s.toLowerCase()));
  const marketBonus = Math.min(matchingSkills.length * 100, 500);

  const overallScore = Math.min(baseScore + marketBonus, 10000);

  // Dimension breakdown (max values match README score formula)
  const breakdown = {
    priorityAbility:     Math.round(skillScores.priorityAbility * 300),  // max 3000
    technicalSkills:     Math.round(skillScores.technicalSkills * 200),  // max 2000
    executionSpeed:      Math.round(skillScores.executionSpeed  * 200),  // max 2000
    learnability:        Math.round(skillScores.learnability    * 200),  // max 2000
    softSkills:          Math.round(skillScores.softSkills      * 100),  // max 1000
    marketAlignmentBonus: marketBonus,                                    // max  500
  };

  console.log(`[generateTruthID] ${studentName}: ${overallScore}/10,000 (confidence: ${(skillScores.confidence * 100).toFixed(0)}%)`);
  return {
    truthIdId: randomUUID(),
    studentId,
    overallScore,
    breakdown,
    aiReasoning: typeof skillScores.reasoning === "string"
      ? skillScores.reasoning
      : Object.entries(skillScores.reasoning ?? {}).map(([k, v]) => `${k}: ${v}`).join(" | "),
    confidence: skillScores.confidence,
    jobInsights,
    generatedAt: new Date(),
  };
}

export function generateReport(truthId: TruthID, studentName: string, targetRole?: string): string {
  const { overallScore, breakdown, aiReasoning, jobInsights, confidence } = truthId;

  // Tier labels aligned with industry percentile ranges
  const tier =
    overallScore >= 8500 ? "Elite (top 5%)" :
    overallScore >= 7000 ? "Strong (top 20%)" :
    overallScore >= 5000 ? "Developing (top 50%)" :
    "Early Stage";

  const confidencePct = Math.round((confidence ?? 0.75) * 100);

  // Simple ASCII score bar for terminal readability
  const bar = (score: number, max: number) => {
    const filled = Math.round((score / max) * 10);
    return "█".repeat(filled) + "░".repeat(10 - filled);
  };

  return `# TruthGrid Assessment Report
Generated: ${new Date().toLocaleDateString("en-IN")} | Confidence: ${confidencePct}%${targetRole ? `\nTarget Role: ${targetRole}` : ""}

---

## Overall Score: ${overallScore.toLocaleString()} / 10,000  |  Tier: ${tier}

## Score Breakdown
| Dimension                  | Score  | Max    | Bar                |
|----------------------------|--------|--------|--------------------|
| Priority Ability  (30%)    | ${String(breakdown.priorityAbility).padStart(4)}   | 3,000  | ${bar(breakdown.priorityAbility, 3000)} |
| Technical Skills  (20%)    | ${String(breakdown.technicalSkills).padStart(4)}   | 2,000  | ${bar(breakdown.technicalSkills, 2000)} |
| Execution Speed   (20%)    | ${String(breakdown.executionSpeed).padStart(4)}    | 2,000  | ${bar(breakdown.executionSpeed, 2000)} |
| Learnability      (20%)    | ${String(breakdown.learnability).padStart(4)}      | 2,000  | ${bar(breakdown.learnability, 2000)} |
| Soft Skills       (10%)    | ${String(breakdown.softSkills).padStart(4)}        | 1,000  | ${bar(breakdown.softSkills, 1000)} |
| Market Alignment  (bonus)  | +${String(breakdown.marketAlignmentBonus).padStart(3)}    | +500   | ${bar(breakdown.marketAlignmentBonus, 500)} |

## AI Assessment
${aiReasoning}

## Market Alignment
In-demand skills: ${jobInsights.topSkills.join(", ")}
Market demand: ${jobInsights.demandLevel?.toUpperCase() ?? "MEDIUM"} | Avg salary: ${jobInsights.avgSalary}
Top companies: ${jobInsights.topCompanies.join(", ")}

## Recommended Next Steps
${
  overallScore >= 7000
    ? "→ Ready for interviews. Lead with your priority definition ability — frame your strongest project as a problem-selection story, not just a solution."
    : overallScore >= 5000
    ? `→ Build 1 more real project. Upskill in: ${jobInsights.topSkills.slice(0, 2).join(", ")}. Focus on shipping over perfection.`
    : `→ 3–6 months structured skill building. Start with: ${jobInsights.topSkills[0]}. Aim to ship one complete project with measurable impact.`
}

---
*Scored by TruthGrid CareerAgent — AI-native skill verification for India's job market*`;
}

export async function benchmarkVsDefault(profile: Partial<StudentProfile>, agentScore: number, agentLatencyMs: number): Promise<BenchmarkResult> {
  const t0 = Date.now();
  const defaultRes = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    messages: [{ role: "user", content: `Rate this student's career readiness 0-10000. Data: ${JSON.stringify({ field: profile.field, projects: profile.projectHistory?.length ?? 0, selfAssessment: profile.selfAssessment })}. Return only JSON: { "score": <number> }` }],
  });
  const defaultLatencyMs = Date.now() - t0;
  const raw = defaultRes.content[0].type === "text" ? defaultRes.content[0].text : '{"score":4000}';
  let defaultScore = 4000;
  try { defaultScore = (JSON.parse(raw.replace(/```json|```/g,"").trim()) as {score:number}).score; } catch {}
  return {
    testCaseId: randomUUID(),
    agentScore,
    defaultClaudeScore: defaultScore,
    improvementPct: Math.round(((agentScore - defaultScore) / defaultScore) * 100),
    agentLatencyMs,
    defaultLatencyMs,
    notes: "TruthGrid agent: India-specific domain, weighted priority_ability 30%, live web search. Default Claude: no domain context, no weighting, no tools.",
  };
}
