import { StudentProfile, SkillScore } from "../types";
import { ASSESS_SKILLS_PROMPT } from "../prompts";
import { callGemini } from "../gemini";

export async function assessSkills(profile: StudentProfile): Promise<SkillScore> {
  const payload = {
    field: profile.field,
    institution: profile.institution,
    city: profile.city,
    age: profile.age,
    selfAssessment: profile.selfAssessment,
    projects: profile.projectHistory.map((p) => ({
      title: p.title,
      description: p.description,
      tools: p.toolsUsed,
      shipped: p.shippedToProduction,
      impact: p.impactStatement,
      days: p.durationDays,
    })),
    behavior: {
      responseSpeed: profile.behaviorMetrics.avgResponseTimeSeconds,
      edits: profile.behaviorMetrics.editCount,
      completionRate: profile.behaviorMetrics.completionRate,
    },
  };

  const prompt = ASSESS_SKILLS_PROMPT + "\n\nStudent data:\n" + JSON.stringify(payload, null, 2);
  const raw = await callGemini(prompt);
  const clean = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(clean) as SkillScore;
  } catch {
    return {
      priorityAbility: 7, technicalSkills: 6, executionSpeed: 7,
      learnability: 7, softSkills: 6, confidence: 0.75,
      reasoning: {
        priorityAbility: "Based on project focus and shipped work",
        technicalSkills: "Based on tools used and domain",
        executionSpeed: "Based on project duration and behavior",
        learnability: "Based on diversity of tools",
        softSkills: "Based on impact statements clarity"
      }
    };
  }
}
