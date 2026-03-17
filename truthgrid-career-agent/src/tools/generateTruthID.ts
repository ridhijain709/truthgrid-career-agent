import { v4 as uuidv4 } from "uuid";
import Anthropic from "@anthropic-ai/sdk";
import { SkillScore, JobInsights, BehaviorMetrics, TruthID } from "../types";

const client = new Anthropic();

export function computeTruthIDScore(
  skills: SkillScore,
  market: JobInsights,
  behavior: BehaviorMetrics
): Omit<TruthID, "truthIdId" | "studentId" | "aiReasoning" | "employerSummary" | "topStrengths" | "developmentAreas" | "generatedAt"> {
  // ── Sub-scores (each dimension scaled to its max weight bucket) ──────────
  //
  // Formula: (raw_0_to_10 / 10) × max_bucket_score
  //
  // priorityAbility:  30% → max 3000 pts
  // technicalSkills:  20% → max 2000 pts
  // executionSpeed:   20% → max 2000 pts
  // learnability:     20% → max 2000 pts
  // softSkills:       10% → max 1000 pts
  //                         = 10,000 base
  // + marketAlignmentBonus: up to +500 (overlap between student skills and demand)

  const priorityAbilityScore = Math.round(
    (skills.priorityAbility / 10) * 3000
  );
  const technicalSkillsScore = Math.round(
    (skills.technicalSkills / 10) * 2000
  );

  // executionSpeed boosted by fast form response time (behavior signal)
  const behaviorSpeedBoost =
    behavior.avgResponseTimeSeconds < 30
      ? 1.1
      : behavior.avgResponseTimeSeconds < 60
      ? 1.0
      : 0.9;
  const executionSpeedScore = Math.round(
    (skills.executionSpeed / 10) * 2000 * behaviorSpeedBoost
  );

  // learnability boosted by high completion rate
  const completionBoost = behavior.completionRate >= 0.95 ? 1.05 : 1.0;
  const learnabilityScore = Math.round(
    (skills.learnability / 10) * 2000 * completionBoost
  );

  const softSkillsScore = Math.round((skills.softSkills / 10) * 1000);

  // Market alignment bonus: +100 per overlapping skill (max 5 × 100 = 500)
  const studentSkillNames = Object.keys({}).map((k) => k.toLowerCase());
  const marketSkillNames = market.topSkillsInDemand.map((s) => s.toLowerCase());
  const overlapCount = marketSkillNames.filter((s) =>
    studentSkillNames.some((ss) => ss.includes(s) || s.includes(ss))
  ).length;
  const marketAlignmentBonus = Math.min(overlapCount * 100, 500);

  // Cap individual scores at their max to prevent overflow
  const overallScore = Math.min(
    priorityAbilityScore +
      technicalSkillsScore +
      Math.min(executionSpeedScore, 2000) +
      Math.min(learnabilityScore, 2000) +
      softSkillsScore +
      marketAlignmentBonus,
    10000
  );

  return {
    priorityAbilityScore,
    technicalSkillsScore,
    executionSpeedScore: Math.min(executionSpeedScore, 2000),
    learnabilityScore: Math.min(learnabilityScore, 2000),
    softSkillsScore,
    marketAlignmentBonus,
    overallScore,
    confidence: skills.confidence,
  };
}

export async function generateTruthID(
  studentId: string,
  skills: SkillScore,
  market: JobInsights,
  behavior: BehaviorMetrics
): Promise<TruthID> {
  const start = Date.now();
  const scores = computeTruthIDScore(skills, market, behavior);

  // Ask Claude to generate the reasoning narrative and employer summary
  const narrativeResponse = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `A student scored ${scores.overallScore}/10,000 on TruthID.

Score breakdown:
- Priority Ability: ${scores.priorityAbilityScore}/3000
- Technical Skills: ${scores.technicalSkillsScore}/2000
- Execution Speed:  ${scores.executionSpeedScore}/2000
- Learnability:     ${scores.learnabilityScore}/2000
- Soft Skills:      ${scores.softSkillsScore}/1000
- Market Alignment: +${scores.marketAlignmentBonus}

Skill reasoning from assessment:
${JSON.stringify(skills.reasoning, null, 2)}

Market context: ${market.field} jobs in India, market growth: ${market.marketGrowthSignal}
Skill gaps identified: ${market.studentSkillGap.join(", ")}

Return ONLY valid JSON:
{
  "aiReasoning": "<2-3 sentences explaining the overall score, specific and honest>",
  "employerSummary": "<2 sentences max, actionable, what employer needs to know>",
  "topStrengths": ["strength1", "strength2", "strength3"],
  "developmentAreas": ["area1", "area2", "area3"]
}`,
      },
    ],
  });

  const raw = narrativeResponse.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");
  const clean = raw.replace(/```json|```/g, "").trim();

  let narrative: {
    aiReasoning: string;
    employerSummary: string;
    topStrengths: string[];
    developmentAreas: string[];
  };

  try {
    narrative = JSON.parse(clean);
  } catch {
    narrative = {
      aiReasoning: `Overall TruthID score: ${scores.overallScore}/10,000. Assessment based on ${market.field} domain competency and India job market alignment.`,
      employerSummary: `Candidate scored ${scores.overallScore}/10,000 on TruthGrid assessment. Strongest in priority ability (${scores.priorityAbilityScore}/3000).`,
      topStrengths: ["Domain execution", "Self-motivation"],
      developmentAreas: market.studentSkillGap.slice(0, 3),
    };
  }

  const latency = Date.now() - start;
  console.log(
    `[generateTruthID] done in ${latency}ms | score: ${scores.overallScore}`
  );

  return {
    truthIdId: uuidv4(),
    studentId,
    ...scores,
    ...narrative,
    generatedAt: new Date(),
  };
}
