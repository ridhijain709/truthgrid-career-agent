// ─────────────────────────────────────────────
//  TruthGrid CareerAgent — Main Agentic Loop
//  This is NOT a single API call.
//  It loops: plan → pick tool → execute → reflect → repeat.
// ─────────────────────────────────────────────

import Anthropic from "@anthropic-ai/sdk";
import { randomUUID } from "crypto";
import { SYSTEM_PROMPT, TOOL_DEFINITIONS } from "./prompts.js";
import { assessSkills, researchJobMarket, generateTruthID, generateReport, benchmarkVsDefault } from "./tools/index.js";
import type { AgentState, AgentConfig, StudentProfile, TruthID, SkillScore, JobInsights } from "./types.js";
import { DEFAULT_CONFIG } from "./types.js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function log(config: AgentConfig, tag: string, msg: string, data?: unknown) {
  if (!config.debug && tag === "debug") return;
  const prefix: Record<string,string> = { info: "→", tool: "⚙", score: "★", warn: "!", debug: "·" };
  console.log(`[TruthGrid] ${prefix[tag] ?? "·"} ${msg}`);
  if (data && config.debug) console.dir(data, { depth: 3 });
}

async function dispatchTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  state: AgentState & { activeProfile?: StudentProfile; skillScores?: SkillScore; jobInsights?: JobInsights; finalReport?: string; clarificationQuestion?: string },
  config: AgentConfig
): Promise<string> {
  log(config, "tool", `calling ${toolName}`);

  switch (toolName) {
    case "assess_skills": {
      const scores = await assessSkills(state.activeProfile!);
      state.skillScores = scores;
      if (scores.confidence < config.confidenceThreshold) {
        state.status = "clarifying";
        log(config, "warn", `low confidence (${scores.confidence}) — clarification queued`);
      }
      return JSON.stringify(scores);
    }

    case "research_market": {
      const field = (toolInput.field as string) ?? state.activeProfile?.field ?? "general";
      const insights = await researchJobMarket(field, (toolInput.location as string) ?? "India", (toolInput.experienceLevel as string) ?? "fresher");
      state.jobInsights = insights;
      return JSON.stringify(insights);
    }

    case "generate_truth_id": {
      if (!state.skillScores || !state.jobInsights) {
        return JSON.stringify({ error: "Cannot generate TruthID — run assess_skills and research_market first." });
      }
      const truthId = generateTruthID(state.activeProfile!.studentId, state.activeProfile!.name, state.skillScores, state.jobInsights);
      state.output = truthId;
      log(config, "score", `TruthID generated: ${truthId.overallScore}/10,000`);
      return JSON.stringify(truthId);
    }

    case "generate_report": {
      if (!state.output) return JSON.stringify({ error: "No TruthID found — run generate_truth_id first." });
      const report = generateReport(state.output, state.activeProfile!.name, (toolInput.targetRole as string) ?? undefined);
      state.finalReport = report;
      return report;
    }

    case "clarify": {
      const question = toolInput.question as string;
      log(config, "warn", `clarification needed: ${question}`);
      state.clarificationQuestion = question;
      state.status = "clarifying";
      return JSON.stringify({ status: "clarification_requested", question });
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }
}

// ── Core Agentic Loop ─────────────────────────
// 1. Send student data to Claude
// 2. Claude decides: respond OR call a tool
// 3. If tool → execute → append result → loop
// 4. If text → we're done

async function runAgentLoop(
  state: AgentState & { activeProfile?: StudentProfile; skillScores?: SkillScore; jobInsights?: JobInsights; finalReport?: string; clarificationQuestion?: string },
  config: AgentConfig
): Promise<typeof state> {
  state.status = "planning";
  log(config, "info", `session ${state.sessionId} started`);
  log(config, "info", `student: ${state.activeProfile?.name} — ${state.activeProfile?.field}`);

  while (state.status !== "done" && state.status !== "failed" && state.iterationCount < config.maxIterations) {
    state.iterationCount++;
    log(config, "debug", `iteration ${state.iterationCount}/${config.maxIterations}`);

    const messages: Anthropic.MessageParam[] = state.memory.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const response = await anthropic.messages.create({
      model: config.model,
      max_tokens: config.maxTokens,
      system: SYSTEM_PROMPT,
      tools: TOOL_DEFINITIONS,
      messages,
    });

    log(config, "debug", `Claude stop_reason: ${response.stop_reason}`);
    state.status = "executing";

    if (response.stop_reason === "tool_use") {
      state.memory.push({ role: "assistant", content: JSON.stringify(response.content) });

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type !== "tool_use") continue;
        const result = await dispatchTool(block.name, block.input as Record<string, unknown>, state, config);
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
        log(config, "tool", `${block.name} completed`);
      }

      state.memory.push({ role: "user", content: JSON.stringify(toolResults) });
      continue;
    }

    if (response.stop_reason === "end_turn" || response.stop_reason === "max_tokens") {
      const textBlock = response.content.find((b) => b.type === "text");
      const finalText = textBlock?.type === "text" ? textBlock.text : "";
      state.memory.push({ role: "assistant", content: finalText });

      if (state.output) {
        state.status = "done";
        log(config, "score", `session complete — final score: ${state.output.overallScore}/10,000`);
      } else if (state.status === "clarifying") {
        log(config, "warn", "agent paused for clarification");
      } else {
        state.status = "failed";
        log(config, "warn", "agent ended without generating TruthID");
      }
      break;
    }

    log(config, "warn", `unexpected stop_reason: ${response.stop_reason}`);
    state.status = "failed";
    break;
  }

  if (state.iterationCount >= config.maxIterations && state.status === "executing") {
    log(config, "warn", `max iterations (${config.maxIterations}) reached`);
    state.status = "failed";
  }

  return state;
}

// ── Public API ────────────────────────────────

export async function runCareerAgent(
  studentProfile: StudentProfile,
  config: AgentConfig = DEFAULT_CONFIG
): Promise<{ state: AgentState; truthId: TruthID | undefined; report: string | undefined; durationMs: number }> {
  const t0 = Date.now();

  const state = {
    sessionId: randomUUID(),
    studentId: studentProfile.studentId,
    currentTask: null,
    taskQueue: [],
    memory: [{
      role: "user" as const,
      content: `Please assess this student and generate their TruthID score.

Student profile:
${JSON.stringify(studentProfile, null, 2)}

Run the full pipeline:
1. assess_skills — analyze projects and behavior
2. research_market — find job demand for their field  
3. generate_truth_id — produce the 0–10,000 TruthID score
4. generate_report — create employer-ready summary

If confidence drops below ${config.confidenceThreshold}, use clarify tool first.`,
    }],
    status: "idle" as const,
    iterationCount: 0,
    maxIterations: config.maxIterations,
    confidence: 1.0,
    startedAt: new Date(),
    activeProfile: studentProfile,
    skillScores: undefined as SkillScore | undefined,
    jobInsights: undefined as JobInsights | undefined,
    finalReport: undefined as string | undefined,
    clarificationQuestion: undefined as string | undefined,
  };

  const finalState = await runAgentLoop(state, config);
  const durationMs = Date.now() - t0;
  log(config, "info", `total time: ${durationMs}ms, iterations: ${finalState.iterationCount}`);

  return { state: finalState, truthId: finalState.output, report: finalState.finalReport, durationMs };
}

// ── CLI Demo ──────────────────────────────────

if (process.argv[1]?.endsWith("agent.ts") || process.argv[1]?.endsWith("agent.js")) {
  const sampleStudent: StudentProfile = {
    studentId: "demo-001",
    name: "Priya Sharma",
    age: 22,
    field: "digital marketing",
    institution: "CCS University, Meerut",
    city: "Muzaffarnagar",
    selfAssessment: { "social media marketing": 8, "content writing": 7, "SEO": 6, "AI tools": 9, "data analytics": 5 },
    projectHistory: [
      {
        title: "AI-Powered LinkedIn Content Strategy",
        description: "Built a Claude API-based content automation tool that generated 20 LinkedIn posts/month for a local MSME. Grew their follower count by 340% in 3 months.",
        toolsUsed: ["Claude API", "Google Sheets", "Canva", "Buffer"],
        impactStatement: "Client got 3 inbound leads from LinkedIn within 30 days of launch.",
        durationWeeks: 4,
      },
      {
        title: "Mamaearth Competitor Analysis Dashboard",
        description: "Scraped and analyzed 10,000+ Amazon reviews for Mamaearth and 5 competitors. Identified sentiment trends and unmet customer needs.",
        toolsUsed: ["Python", "BeautifulSoup", "Google Sheets", "Claude API"],
        impactStatement: "Identified 2 product gaps worth ₹2Cr+ market. Presented to D2C founder.",
        durationWeeks: 3,
      },
    ],
    behaviorMetrics: { avgResponseTimeSeconds: 45, editCount: 3, completionRate: 0.98 },
    rawFormData: {},
    createdAt: new Date(),
  };

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  TruthGrid CareerAgent — Demo Run");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  runCareerAgent(sampleStudent, { ...DEFAULT_CONFIG, debug: true })
    .then(({ truthId, report, durationMs, state }) => {
      console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      if (truthId) {
        console.log(`TruthID Score:  ${truthId.overallScore.toLocaleString()} / 10,000`);
        console.log(`Confidence:     ${(truthId.confidence * 100).toFixed(0)}%`);
        console.log(`Duration:       ${durationMs}ms`);
        console.log(`Iterations:     ${state.iterationCount}`);
        console.log("\nBreakdown:");
        Object.entries(truthId.breakdown).forEach(([k, v]) => console.log(`  ${k.padEnd(26)} ${v}`));
        if (report) { console.log("\n─── Employer Report ───\n"); console.log(report); }
      } else {
        console.log("Status:", state.status);
      }
    })
    .catch(console.error);
}
