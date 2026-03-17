import { StudentProfile, JobInsights } from "../types";
import { RESEARCH_MARKET_PROMPT } from "../prompts";
import { callGemini } from "../gemini";

export async function researchJobMarket(profile: StudentProfile): Promise<JobInsights> {
  const prompt = RESEARCH_MARKET_PROMPT + `\n\nResearch the Indian job market for: ${profile.field} fresher from ${profile.city}.\nStudent skills: ${Object.keys(profile.selfAssessment).join(", ")}\nReturn only JSON as specified.`;

  const raw = await callGemini(prompt);
  const clean = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(clean) as JobInsights;
  } catch {
    return {
      field: profile.field,
      topSkillsInDemand: ["Communication", "MS Excel", "Digital Marketing", "Data Analysis", "AI Tools"],
      avgSalaryRange: "₹2.5–5 LPA (fresher)",
      topCompaniesHiring: ["Amazon", "Flipkart", "Swiggy", "Zomato", "Meesho"],
      marketGrowthSignal: "medium",
      studentSkillGap: ["AI tool fluency", "Data analytics", "Portfolio work"],
    };
  }
}
