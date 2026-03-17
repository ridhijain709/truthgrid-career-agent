import Anthropic from "@anthropic-ai/sdk";
import { StudentProfile, SkillScore } from "../types";
import { ASSESS_SKILLS_PROMPT } from "../prompts";

const client = new Anthropic();

export async function assessSkills(
  profile: StudentProfile
): Promise<SkillScore> {
  const start = Date.now();

  // Prepare a clean, anonymized payload — no raw PII sent to API
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

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: ASSESS_SKILLS_PROMPT,
    messages: [
      {
        role: "user",
        content: `Assess this student:\n${JSON.stringify(payload, null, 2)}`,
      },
    ],
  });

  const raw = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  // Strip markdown fences if present
  const clean = raw.replace(/```json|```/g, "").trim();

  let parsed: SkillScore;
  try {
    parsed = JSON.parse(clean) as SkillScore;
  } catch {
    throw new Error(`assessSkills: failed to parse JSON response. Raw: ${raw}`);
  }

  const latency = Date.now() - start;
  console.log(
    `[assessSkills] done in ${latency}ms | confidence: ${parsed.confidence}`
  );

  return parsed;
}
