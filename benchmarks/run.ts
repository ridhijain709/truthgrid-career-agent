// ─────────────────────────────────────────────
//  TruthGrid CareerAgent — Benchmark Runner
//  Quest criterion #4 & #5: performance metrics
//  + comparison vs default Cursor Claude
// ─────────────────────────────────────────────

import { writeFileSync } from "fs";
import { runCareerAgent } from "../src/agent.js";
import { benchmarkVsDefault } from "../src/tools/index.js";
import type { StudentProfile } from "../src/types.js";
import { DEFAULT_CONFIG } from "../src/types.js";

// 5 real test cases — diverse profiles that prove domain specificity

const TEST_CASES: StudentProfile[] = [
  {
    studentId: "bench-001",
    name: "Priya Sharma",
    age: 22,
    field: "digital marketing",
    institution: "CCS University",
    city: "Muzaffarnagar",
    selfAssessment: { "AI tools": 9, "content writing": 7, SEO: 6 },
    projectHistory: [
      {
        title: "LinkedIn AI Content Tool for MSME",
        description: "Claude API automation that grew a client's LinkedIn 340% in 3 months",
        toolsUsed: ["Claude API", "Google Sheets", "Buffer"],
        impactStatement: "3 inbound leads in 30 days",
        durationDays: 28,
        shippedToProduction: true,
      },
    ],
    behaviorMetrics: { avgResponseTimeSeconds: 45, editCount: 3, completionRate: 0.98, revisitCount: 1 },
    rawFormData: {},
    createdAt: new Date(),
  },
  {
    studentId: "bench-002",
    name: "Rahul Gupta",
    age: 21,
    field: "computer science",
    institution: "Amity University Noida",
    city: "Noida",
    selfAssessment: { Python: 9, "machine learning": 8, "web dev": 7 },
    projectHistory: [],  // High GPA, no real projects
    behaviorMetrics: { avgResponseTimeSeconds: 120, editCount: 12, completionRate: 0.85, revisitCount: 4 },
    rawFormData: {},
    createdAt: new Date(),
  },
  {
    studentId: "bench-003",
    name: "Kavya Nair",
    age: 23,
    field: "software engineering",
    institution: "No degree — self-taught",
    city: "Kochi",
    selfAssessment: { "full-stack": 8, "AI tools": 9, DevOps: 7 },
    projectHistory: [
      {
        title: "Freelance SaaS tool",
        description: "Built and shipped a WhatsApp automation SaaS with 40 paying customers",
        toolsUsed: ["Node.js", "Twilio", "Supabase", "Stripe"],
        impactStatement: "₹18,000/month recurring revenue",
        durationDays: 42,
        shippedToProduction: true,
      },
      {
        title: "Open source CLI tool",
        description: "GitHub CLI tool for automated code review, 200+ stars",
        toolsUsed: ["TypeScript", "Claude API", "GitHub Actions"],
        impactStatement: "Used by 3 companies",
        durationDays: 21,
        shippedToProduction: true,
      },
    ],
    behaviorMetrics: { avgResponseTimeSeconds: 30, editCount: 1, completionRate: 1.0, revisitCount: 0 },
    rawFormData: {},
    createdAt: new Date(),
  },
  {
    studentId: "bench-004",
    name: "Arjun Mehta",
    age: 24,
    field: "MBA finance",
    institution: "NMIMS Mumbai",
    city: "Mumbai",
    selfAssessment: { Excel: 8, PowerPoint: 9, finance: 7, "AI tools": 3 },
    projectHistory: [
      {
        title: "Management consulting internship report",
        description: "Market entry analysis for a FMCG brand",
        toolsUsed: ["Excel", "PowerPoint"],
        impactStatement: "Presented to VP. No implementation.",
        durationDays: 56,
        shippedToProduction: false,
      },
    ],
    behaviorMetrics: { avgResponseTimeSeconds: 200, editCount: 25, completionRate: 0.7, revisitCount: 10 },
    rawFormData: {},
    createdAt: new Date(),
  },
  {
    studentId: "bench-005",
    name: "Sneha Patil",
    age: 21,
    field: "commerce + AI tools",
    institution: "Pune University",
    city: "Pune",
    selfAssessment: { "AI tools": 8, "data analysis": 7, "no-code": 9 },
    projectHistory: [
      {
        title: "Automated GST reconciliation bot",
        description: "No-code bot using Make.com that auto-reconciles GST returns for a CA firm, saving 40 hours/month",
        toolsUsed: ["Make.com", "Google Sheets", "Notion", "Claude API"],
        impactStatement: "CA firm reduced manual work by 70%",
        durationDays: 14,
        shippedToProduction: true,
      },
    ],
    behaviorMetrics: { avgResponseTimeSeconds: 60, editCount: 5, completionRate: 0.95, revisitCount: 2 },
    rawFormData: {},
    createdAt: new Date(),
  },
];

async function runBenchmarks() {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  TruthGrid CareerAgent — Benchmark Suite");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const results = [];
  let totalImprovement = 0;

  for (const [i, profile] of TEST_CASES.entries()) {
    console.log(`\nCase ${i + 1}/5: ${profile.name} (${profile.field})`);
    console.log("─".repeat(50));

    const { truthId, durationMs } = await runCareerAgent(profile, {
      ...DEFAULT_CONFIG,
      debug: false,
    });

    if (!truthId) {
      console.log("  FAILED — no TruthID generated");
      continue;
    }

    const benchmark = await benchmarkVsDefault(profile, truthId.overallScore, durationMs);
    results.push({ profile: profile.name, field: profile.field, ...benchmark });

    console.log(`  TruthGrid Agent:    ${truthId.overallScore.toLocaleString()} / 10,000`);
    console.log(`  Default Claude:     ${benchmark.defaultClaudeScore.toLocaleString()} / 10,000`);
    console.log(`  Improvement:        +${benchmark.improvementPercent}%`);
    console.log(`  Agent latency:      ${durationMs}ms`);
    console.log(`  Default latency:    ${benchmark.defaultLatencyMs}ms`);

    totalImprovement += benchmark.improvementPercent;
  }

  const avgImprovement = Math.round(totalImprovement / results.length);

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  SUMMARY");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log(`  Average improvement over default Claude: +${avgImprovement}%`);
  console.log(`  Cases run: ${results.length}/5`);

  // Save results for README
  const output = {
    runAt: new Date().toISOString(),
    agentVersion: "1.0.0",
    model: DEFAULT_CONFIG.model,
    avgImprovementPct: avgImprovement,
    scoreFormula:
      "(priorityAbility×0.30 + technicalSkills×0.20 + executionSpeed×0.20 + learnability×0.20 + softSkills×0.10) / 10 × 9500 + marketAlignmentBonus",
    maxAgentScore: 10000,
    cases: results,
  };

  writeFileSync("benchmarks/results.json", JSON.stringify(output, null, 2));

  console.log("\n  Results saved to benchmarks/results.json");
  console.log("  Include this file in your quest submission.");
}

runBenchmarks().catch(console.error);
