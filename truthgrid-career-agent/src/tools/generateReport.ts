import { TruthID, StudentProfile, JobInsights } from "../types";

export function generateReport(
  truthId: TruthID,
  profile: StudentProfile,
  market: JobInsights
): string {
  const scoreBar = (score: number, max: number): string => {
    const filled = Math.round((score / max) * 10);
    return "█".repeat(filled) + "░".repeat(10 - filled);
  };

  const percentile = scorePercentile(truthId.overallScore);

  return `# TruthGrid Assessment Report
> Generated: ${new Date(truthId.generatedAt).toLocaleDateString("en-IN")}
> TruthID: \`${truthId.truthIdId.slice(0, 8).toUpperCase()}\`

---

## Candidate Overview
- **Field:** ${profile.field}
- **Institution:** ${profile.institution}, ${profile.city}
- **TruthID Score:** ${truthId.overallScore.toLocaleString()} / 10,000
- **Confidence:** ${Math.round(truthId.confidence * 100)}%
- **Market:** ${market.field} | Growth signal: ${market.marketGrowthSignal.toUpperCase()}

---

## Score Breakdown

| Dimension          | Score    | Max   | Bar                           | Weight |
|--------------------|----------|-------|-------------------------------|--------|
| Priority Ability   | ${String(truthId.priorityAbilityScore).padEnd(8)} | 3,000 | ${scoreBar(truthId.priorityAbilityScore, 3000)} | 30%    |
| Technical Skills   | ${String(truthId.technicalSkillsScore).padEnd(8)} | 2,000 | ${scoreBar(truthId.technicalSkillsScore, 2000)} | 20%    |
| Execution Speed    | ${String(truthId.executionSpeedScore).padEnd(8)} | 2,000 | ${scoreBar(truthId.executionSpeedScore, 2000)} | 20%    |
| Learnability       | ${String(truthId.learnabilityScore).padEnd(8)} | 2,000 | ${scoreBar(truthId.learnabilityScore, 2000)} | 20%    |
| Soft Skills        | ${String(truthId.softSkillsScore).padEnd(8)} | 1,000 | ${scoreBar(truthId.softSkillsScore, 1000)} | 10%    |
| Market Alignment   | +${String(truthId.marketAlignmentBonus).padEnd(7)} | 500   | ${scoreBar(truthId.marketAlignmentBonus, 500)} | bonus  |

**Total: ${truthId.overallScore.toLocaleString()} / 10,000**
**Estimated percentile: Top ${percentile}%**

---

## Employer Summary

${truthId.employerSummary}

${truthId.aiReasoning}

---

## Strengths
${truthId.topStrengths.map((s) => `- ${s}`).join("\n")}

## Development Areas
${truthId.developmentAreas.map((d) => `- ${d}`).join("\n")}

---

## Market Context: ${market.field} in India

**Top skills in demand:** ${market.topSkillsInDemand.join(", ")}
**Salary range (fresher):** ${market.avgSalaryRange}
**Top hiring companies:** ${market.topCompaniesHiring.join(", ")}
**Skill gaps to address:** ${market.studentSkillGap.join(", ")}

---

*Powered by TruthGrid — India's first AI-native skill verification system.*
*Score is based on execution evidence, not credentials.*
`;
}

function scorePercentile(score: number): number {
  // Approximate percentile based on score range
  if (score >= 9000) return 1;
  if (score >= 8000) return 5;
  if (score >= 7000) return 15;
  if (score >= 6000) return 30;
  if (score >= 5000) return 50;
  if (score >= 4000) return 65;
  if (score >= 3000) return 80;
  return 90;
}
