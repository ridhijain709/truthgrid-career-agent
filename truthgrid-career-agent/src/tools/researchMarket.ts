import Anthropic from "@anthropic-ai/sdk";
import { StudentProfile, JobInsights } from "../types";
import { RESEARCH_MARKET_PROMPT } from "../prompts";

const client = new Anthropic();

export async function researchJobMarket(
  profile: StudentProfile
): Promise<JobInsights> {
  const start = Date.now();

  const query = `entry level ${profile.field} jobs India ${new Date().getFullYear()} skills required salary`;

  // AI-native method: web_search tool — live data, not training cutoff
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: RESEARCH_MARKET_PROMPT,
    tools: [
      {
        type: "web_search_20250305" as const,
        name: "web_search",
      },
    ],
    messages: [
      {
        role: "user",
        content: `Research the job market for a ${profile.field} fresher from ${profile.city}, India.
Search query suggestion: "${query}"

Student's current skills: ${Object.keys(profile.selfAssessment).join(", ")}

Return the JSON structure specified in your instructions.`,
      },
    ],
  });

  // Extract the final text block (after tool use completes)
  const textBlock = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  const clean = textBlock.replace(/```json|```/g, "").trim();

  let parsed: JobInsights;
  try {
    parsed = JSON.parse(clean) as JobInsights;
  } catch {
    // Graceful degradation: return sensible defaults if web search fails
    console.warn(
      "[researchJobMarket] JSON parse failed, using fallback defaults"
    );
    parsed = {
      field: profile.field,
      topSkillsInDemand: [
        "Communication",
        "MS Excel",
        "Digital Marketing",
        "Data Analysis",
        "AI Tools",
      ],
      avgSalaryRange: "₹2.5–5 LPA (fresher)",
      topCompaniesHiring: ["Amazon", "Flipkart", "Swiggy", "Zomato", "Meesho"],
      marketGrowthSignal: "medium",
      studentSkillGap: ["AI tool fluency", "Data analytics", "Portfolio work"],
    };
  }

  const latency = Date.now() - start;
  console.log(
    `[researchJobMarket] done in ${latency}ms | field: ${parsed.field}`
  );

  return parsed;
}
