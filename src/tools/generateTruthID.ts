import { v4 as uuidv4 } from "uuid";
import { SkillScore, JobInsights, BehaviorMetrics, TruthID } from "../types";
import { callGemini } from "../gemini";

export function computeScores(skills: SkillScore, market: JobInsights, behavior: BehaviorMetrics) {
  const behaviorBoost = behavior.avgResponseTimeSeconds < 30 ? 1.1 : behavior.avgResponseTimeSeconds < 60 ? 1.0 : 0.9;
  const completionBoost = behavior.completionRate >= 0.95 ? 1.05 : 1.0;

  const priorityAbilityScore = Math.round((skills.priorityAbility / 10) * 3000);
  const technicalSkillsScore = Math.round((skills.technicalSkills / 10) * 2000);
  const executionSpeedScore  = Math.min(2000, Math.round((skills.executionSpeed / 10) * 2000 * behaviorBoost));
  const learnabilityScore    = Math.min(2000, Math.round((skills.learnability / 10) * 2000 * completionBoost));
  const softSkillsScore      = Math.round((skills.softSkills / 10) * 1000);

  const studentSkills = Object.keys({}).map(k => k.toLowerCase());
  const marketSkills  = market.topSkillsInDemand.map(s => s.toLowerCase());
  const overlap       = marketSkills.filter(s => studentSkills.some(ss => ss.includes(s) || s.includes(ss))).length;
  const marketAlignmentBonus = Math.min(overlap * 100, 500);

  const overallScore = Math.min(10000,
    priorityAbilityScore + technicalSkillsScore + executionSpeedScore +
    learnabilityScore + softSkillsScore + marketAlignmentBonus
  );

  return { priorityAbilityScore, technicalSkillsScore, executionSpeedScore, learnabilityScore, softSkillsScore, marketAlignmentBonus, overallScore, confidence: skills.confidence };
}

export async function generateTruthID(studentId: string, skills: SkillScore, market: JobInsights, behavior: BehaviorMetrics): Promise<TruthID> {
  const scores = computeScores(skills, market, behavior);

  const prompt = `A student scored ${scores.overallScore}/10,000 on TruthID assessment.
Breakdown: Priority Ability ${scores.priorityAbilityScore}/3000, Technical ${scores.technicalSkillsScore}/2000, Execution ${scores.executionSpeedScore}/2000, Learnability ${scores.learnabilityScore}/2000, Soft Skills ${scores.softSkillsScore}/1000, Market Bonus +${scores.marketAlignmentBonus}
Skill reasoning: ${JSON.stringify(skills.reasoning)}
Market: ${market.field}, growth: ${market.marketGrowthSignal}, gaps: ${market.studentSkillGap.join(", ")}

Return ONLY valid JSON:
{"aiReasoning":"<2-3 sentences>","employerSummary":"<2 sentences max>","topStrengths":["s1","s2","s3"],"developmentAreas":["a1","a2","a3"]}`;

  const raw = await callGemini(prompt);
  const clean = raw.replace(/```json|```/g, "").trim();

  let narrative = { aiReasoning: "", employerSummary: "", topStrengths: [] as string[], developmentAreas: [] as string[] };
  try { narrative = JSON.parse(clean); } catch {
    narrative = {
      aiReasoning: `TruthID score: ${scores.overallScore}/10,000. Assessment based on ${market.field} domain competency and India job market alignment.`,
      employerSummary: `Candidate scored ${scores.overallScore}/10,000. Strongest dimension: priority ability (${scores.priorityAbilityScore}/3000).`,
      topStrengths: ["Domain execution", "Self-motivation", "AI tool usage"],
      developmentAreas: market.studentSkillGap.slice(0, 3),
    };
  }

  return { truthIdId: uuidv4(), studentId, ...scores, ...narrative, generatedAt: new Date() };
}
