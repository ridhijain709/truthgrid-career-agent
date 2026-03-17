// ─────────────────────────────────────────────
//  TruthGrid CareerAgent — Tool Implementations
// ─────────────────────────────────────────────

import Anthropic from "@anthropic-ai/sdk";
import { randomUUID } from "crypto";
import type { StudentProfile, SkillScore, JobInsights, TruthID, BenchmarkResult } from "../types.js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function assessSkills(profile: Partial<StudentProfile>): Promise<SkillScore> {
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
  const WEIGHTS = { priorityAbility: 0.30, technicalSkills: 0.20, executionSpeed: 0.20, learnability: 0.20, softSkills: 0.10 };
  const rawScore = skillScores.priorityAbility * WEIGHTS.priorityAbility + skillScores.technicalSkills * WEIGHTS.technicalSkills + skillScores.executionSpeed * WEIGHTS.executionSpeed + skillScores.learnability * WEIGHTS.learnability + skillScores.softSkills * WEIGHTS.softSkills;
  const baseScore = Math.round((rawScore / 10) * 9500);
  const matchingSkills = jobInsights.topSkills.filter(s => skillScores.reasoning.toLowerCase().includes(s.toLowerCase()));
  const marketBonus = Math.min(matchingSkills.length * 100, 500);
  const overallScore = Math.min(baseScore + marketBonus, 10000);
  const breakdown = {
    priorityAbility: Math.round(skillScores.priorityAbility * 300),
    technicalSkills: Math.round(skillScores.technicalSkills * 200),
    executionSpeed: Math.round(skillScores.executionSpeed * 200),
    learnability: Math.round(skillScores.learnability * 200),
    softSkills: Math.round(skillScores.softSkills * 100),
    marketAlignmentBonus: marketBonus,
  };
  console.log(`[generateTruthID] ${studentName}: ${overallScore}/10,000`);
  return { truthIdId: randomUUID(), studentId, overallScore, breakdown, aiReasoning: skillScores.reasoning, confidence: skillScores.confidence, jobInsights, generatedAt: new Date() };
}

export function generateReport(truthId: TruthID, studentName: string, targetRole?: string): string {
  const { overallScore, breakdown, aiReasoning, jobInsights } = truthId;
  const tier = overallScore >= 8000 ? "Elite" : overallScore >= 6000 ? "Strong" : overallScore >= 4000 ? "Developing" : "Early Stage";
  return `# TruthID Report — ${studentName}
Generated: ${new Date().toLocaleDateString("en-IN")}${targetRole ? `\nTarget Role: ${targetRole}` : ""}

---

## Overall Score: ${overallScore.toLocaleString()} / 10,000  |  Tier: ${tier}

## Score Breakdown
| Dimension              | Score | Max   |
|------------------------|-------|-------|
| Priority Ability (30%) | ${breakdown.priorityAbility}  | 3,000 |
| Technical Skills (20%) | ${breakdown.technicalSkills}  | 2,000 |
| Execution Speed (20%)  | ${breakdown.executionSpeed}   | 2,000 |
| Learnability (20%)     | ${breakdown.learnability}     | 2,000 |
| Soft Skills (10%)      | ${breakdown.softSkills}       | 1,000 |
| Market Alignment +     | +${breakdown.marketAlignmentBonus}   | +500  |

## AI Assessment
${aiReasoning}

## Market Alignment
In-demand skills: ${jobInsights.topSkills.join(", ")}
Market demand: ${jobInsights.demandLevel.toUpperCase()} | Avg salary: ${jobInsights.avgSalary}
Top companies: ${jobInsights.topCompanies.join(", ")}

## Recommended Next Steps
${overallScore >= 7000 ? "→ Ready for interviews. Strong priority definition — test with open-ended problem." : overallScore >= 5000 ? "→ Build 1 more real project. Upskill in: " + jobInsights.topSkills.slice(0,2).join(", ") : "→ 3–6 months structured skill building. Start with: " + jobInsights.topSkills[0]}

---
*Scored by TruthGrid CareerAgent | truthgrid.in*`;
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
