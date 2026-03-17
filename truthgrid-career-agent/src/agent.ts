/**
 * TruthGrid CareerAgent — Main Agentic Loop
 *
 * AI-native method: Anthropic tool_use lets Claude DECIDE which tool to call
 * next, in what order, and when to stop.
 *
 * This is NOT a linear script. It is an autonomous reasoning loop:
 *   think → decide tool → execute tool → feed result back → think again
 *
 * Default Cursor/Claude: single-shot, no domain context, no tool routing.
 * This agent: multi-step, India-specific, priority-ordered, self-correcting.
 */

import Anthropic from "@anthropic-ai/sdk";
import { v4 as uuidv4 } from "uuid";
import {
  StudentProfile,
  AgentState,
  TruthID,
  SkillScore,
  JobInsights,
} from "./types";
import { SYSTEM_PROMPT } from "./prompts";
import { assessSkills } from "./tools/assessSkills";
import { researchJobMarket } from "./tools/researchMarket";
import { generateTruthID } from "./tools/generateTruthID";
import { generateReport } from "./tools/generateReport";

const client = new Anthropic();

// ─── Tool definitions ─────────────────────────────────────────────────────────

const TOOL_DEFINITIONS: Anthropic.Tool[] = [
  {
    name: "assess_skills",
    description:
      "Assess student practical skills across 5 dimensions. Run this FIRST.",
    input_schema: {
      type: "object" as const,
      properties: {
        studentId: { type: "string", description: "The student ID" },
      },
      required: ["studentId"],
    },
  },
  {
    name: "research_job_market",
    description:
      "Research Indian job market for student field via live web data. Run AFTER assess_skills.",
    input_schema: {
      type: "object" as const,
      properties: {
        studentId: { type: "string", description: "The student ID" },
      },
      required: ["studentId"],
    },
  },
  {
    name: "generate_truth_id",
    description:
      "Generate TruthID score 0-10000. Requires BOTH assess_skills + research_job_market first.",
    input_schema: {
      type: "object" as const,
      properties: {
        studentId: { type: "string", description: "The student ID" },
      },
      required: ["studentId"],
    },
  },
  {
    name: "generate_report",
    description: "Generate employer-ready markdown report. Run LAST always.",
    input_schema: {
      type: "object" as const,
      properties: {
        studentId: { type: "string", description: "The student ID" },
      },
      required: ["studentId"],
    },
  },
  {
    name: "clarify_input",
    description:
      "Ask a clarifying question when confidence < 0.7. Insert between assess_skills and generate_truth_id.",
    input_schema: {
      type: "object" as const,
      properties: {
        question: { type: "string" },
        dimension: { type: "string", description: "Low-confidence dimension" },
      },
      required: ["question", "dimension"],
    },
  },
];

// ─── Context accumulated across tool calls ────────────────────────────────────

interface AgentContext {
  profile: StudentProfile;
  skillScore: SkillScore | null;
  jobInsights: JobInsights | null;
  truthId: TruthID | null;
  report: string | null;
  clarifications: string[];
}

// ─── Tool executor ────────────────────────────────────────────────────────────

async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  ctx: AgentContext
): Promise<string> {
  const start = Date.now();

  try {
    switch (toolName) {
      case "assess_skills": {
        console.log("  [tool] assess_skills...");
        const result = await assessSkills(ctx.profile);
        ctx.skillScore = result;
        return JSON.stringify({
          success: true,
          latencyMs: Date.now() - start,
          result: {
            scores: {
              priorityAbility: result.priorityAbility,
              technicalSkills: result.technicalSkills,
              executionSpeed: result.executionSpeed,
              learnability: result.learnability,
              softSkills: result.softSkills,
            },
            confidence: result.confidence,
            reasoning: result.reasoning,
            lowConfidence: result.confidence < 0.7,
          },
        });
      }

      case "research_job_market": {
        console.log("  [tool] research_job_market (live web search)...");
        const result = await researchJobMarket(ctx.profile);
        ctx.jobInsights = result;
        return JSON.stringify({
          success: true,
          latencyMs: Date.now() - start,
          result: {
            topSkillsInDemand: result.topSkillsInDemand,
            avgSalaryRange: result.avgSalaryRange,
            marketGrowthSignal: result.marketGrowthSignal,
            studentSkillGap: result.studentSkillGap,
          },
        });
      }

      case "generate_truth_id": {
        if (!ctx.skillScore || !ctx.jobInsights) {
          return JSON.stringify({
            success: false,
            error: "BLOCKED: assess_skills and research_job_market must run first.",
          });
        }
        console.log("  [tool] generate_truth_id...");
        const result = await generateTruthID(
          ctx.profile.studentId,
          ctx.skillScore,
          ctx.jobInsights,
          ctx.profile.behaviorMetrics
        );
        ctx.truthId = result;
        return JSON.stringify({
          success: true,
          latencyMs: Date.now() - start,
          result: {
            overallScore: result.overallScore,
            breakdown: {
              priorityAbility: result.priorityAbilityScore,
              technical: result.technicalSkillsScore,
              execution: result.executionSpeedScore,
              learnability: result.learnabilityScore,
              softSkills: result.softSkillsScore,
              marketBonus: result.marketAlignmentBonus,
            },
            confidence: result.confidence,
          },
        });
      }

      case "generate_report": {
        if (!ctx.truthId || !ctx.jobInsights) {
          return JSON.stringify({
            success: false,
            error: "BLOCKED: generate_truth_id must run first.",
          });
        }
        console.log("  [tool] generate_report...");
        const report = generateReport(ctx.truthId, ctx.profile, ctx.jobInsights);
        ctx.report = report;
        return JSON.stringify({
          success: true,
          latencyMs: Date.now() - start,
          result: {
            reportGenerated: true,
            scoreOnReport: ctx.truthId.overallScore,
            previewLines: report.split("\n").slice(0, 6).join("\n"),
          },
        });
      }

      case "clarify_input": {
        const input = toolInput as { question: string; dimension: string };
        console.log(`  [tool] clarify_input [${input.dimension}]: ${input.question}`);
        ctx.clarifications.push(`[${input.dimension}]: ${input.question}`);
        return JSON.stringify({
          success: true,
          result: {
            questionAsked: input.question,
            dimension: input.dimension,
            note: "In production, this pauses for student input. Proceeding with available data.",
          },
        });
      }

      default:
        return JSON.stringify({ success: false, error: `Unknown tool: ${toolName}` });
    }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error(`  [tool] ${toolName} ERROR:`, error);
    return JSON.stringify({ success: false, error });
  }
}

// ─── Main agent entry point ───────────────────────────────────────────────────

export interface AgentResult {
  sessionId: string;
  truthId: TruthID | null;
  report: string | null;
  clarifications: string[];
  iterationCount: number;
  totalLatencyMs: number;
  toolCallOrder: string[];
  state: AgentState;
}

export async function runAgent(profile: StudentProfile): Promise<AgentResult> {
  const sessionId = uuidv4();
  const sessionStart = Date.now();
  const MAX_ITERATIONS = 10;

  console.log(`\n${"═".repeat(60)}`);
  console.log(`TruthGrid CareerAgent | Session ${sessionId.slice(0, 8)}`);
  console.log(`Student: ${profile.name} | ${profile.field} | ${profile.city}`);
  console.log(`${"═".repeat(60)}\n`);

  const ctx: AgentContext = {
    profile,
    skillScore: null,
    jobInsights: null,
    truthId: null,
    report: null,
    clarifications: [],
  };

  const state: AgentState = {
    sessionId,
    studentId: profile.studentId,
    currentTask: null,
    taskQueue: [],
    memory: [],
    toolCallHistory: [],
    status: "thinking",
    iterationCount: 0,
    startedAt: new Date(),
    output: null,
  };

  const toolCallOrder: string[] = [];

  // Initial message: give Claude the student, let it plan the tool sequence
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Assess this student and produce their TruthID score.

${JSON.stringify(
  {
    studentId: profile.studentId,
    name: profile.name,
    field: profile.field,
    institution: profile.institution,
    city: profile.city,
    age: profile.age,
    selfAssessment: profile.selfAssessment,
    projects: profile.projectHistory,
    behaviorMetrics: profile.behaviorMetrics,
  },
  null,
  2
)}

Run tools in priority order. Weight priority_ability at 30% — it is the most predictive signal.`,
    },
  ];

  // ── THE AGENTIC LOOP ──────────────────────────────────────────────────────
  // Claude picks the next tool. We run it. Feed result back. Claude picks next.
  // Stops when Claude returns end_turn (no more tool calls needed).

  while (state.iterationCount < MAX_ITERATIONS) {
    state.iterationCount++;
    state.status = "thinking";

    console.log(`\n[iter ${state.iterationCount}] Claude deciding next step...`);

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: TOOL_DEFINITIONS,
      messages,
    });

    // Add Claude's full response to history
    messages.push({ role: "assistant", content: response.content });

    // If Claude stopped naturally (no tool call), we're done
    if (response.stop_reason === "end_turn") {
      console.log("[agent] Claude finished — assessment complete.");
      state.status = "done";
      break;
    }

    // Extract tool use blocks
    const toolCalls = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    );

    if (toolCalls.length === 0) {
      console.log("[agent] No tool calls — stopping.");
      state.status = "done";
      break;
    }

    // Execute tools and collect results
    state.status = "executing";
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const call of toolCalls) {
      console.log(`[iter ${state.iterationCount}] → ${call.name}`);
      toolCallOrder.push(call.name);

      const callStart = Date.now();
      const result = await executeTool(
        call.name,
        call.input as Record<string, unknown>,
        ctx
      );
      const callLatency = Date.now() - callStart;

      state.toolCallHistory.push({
        toolName: call.name,
        input: call.input as Record<string, unknown>,
        output: JSON.parse(result) as Record<string, unknown>,
        latencyMs: callLatency,
        success: !result.includes('"success":false'),
        timestamp: new Date(),
      });

      toolResults.push({
        type: "tool_result",
        tool_use_id: call.id,
        content: result,
      });
    }

    // Feed tool results back to Claude for next decision
    messages.push({ role: "user", content: toolResults });

    // Early exit if report is done
    if (ctx.report !== null) {
      console.log("[agent] Report generated — session complete.");
      state.status = "done";
      break;
    }
  }

  if (state.iterationCount >= MAX_ITERATIONS) {
    console.warn("[agent] Max iterations reached.");
    state.status = "failed";
  }

  state.output = ctx.truthId;
  const totalLatencyMs = Date.now() - sessionStart;

  console.log(`\n${"─".repeat(60)}`);
  console.log(`Done in ${totalLatencyMs}ms | ${state.iterationCount} iterations`);
  console.log(`Tool order: ${toolCallOrder.join(" → ")}`);
  if (ctx.truthId) {
    console.log(`TruthID Score: ${ctx.truthId.overallScore.toLocaleString()}/10,000`);
    console.log(`Confidence: ${Math.round(ctx.truthId.confidence * 100)}%`);
  }
  console.log(`${"─".repeat(60)}\n`);

  return {
    sessionId,
    truthId: ctx.truthId,
    report: ctx.report,
    clarifications: ctx.clarifications,
    iterationCount: state.iterationCount,
    totalLatencyMs,
    toolCallOrder,
    state,
  };
}
