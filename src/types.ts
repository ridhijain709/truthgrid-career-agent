// ─── Core domain types ────────────────────────────────────────────────────────

export interface StudentProfile {
  studentId: string;
  name: string;
  age: number;
  field: string;               // "marketing" | "cs" | "bba" | "commerce" etc.
  institution: string;
  city: string;                // Tier-2 city context matters for scoring
  selfAssessment: SkillMap;    // key: skill name, value: 0–10
  projectHistory: Project[];
  behaviorMetrics: BehaviorMetrics;
  rawFormData?: Record<string, unknown>;
}

export interface SkillMap {
  [skillName: string]: number; // 0–10
}

export interface Project {
  title: string;
  description: string;
  toolsUsed: string[];
  shippedToProduction: boolean;
  impactStatement: string;
  durationDays: number;
}

export interface BehaviorMetrics {
  avgResponseTimeSeconds: number;
  editCount: number;
  completionRate: number;      // 0–1
  revisitCount: number;
}

// ─── Agent state ──────────────────────────────────────────────────────────────

export interface AgentState {
  sessionId: string;
  studentId: string | null;
  currentTask: Task | null;
  taskQueue: Task[];
  memory: ConversationMessage[];
  toolCallHistory: ToolCallRecord[];
  status: "idle" | "thinking" | "executing" | "done" | "failed";
  iterationCount: number;
  startedAt: Date;
  output: TruthID | null;
}

export interface Task {
  id: string;
  type: "assess" | "research" | "score" | "report" | "benchmark" | "clarify";
  priority: number;            // 1–100, LLM-assigned
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  status: "queued" | "running" | "done" | "failed";
  tokensUsed: number;
  latencyMs: number;
  createdAt: Date;
}

export interface ConversationMessage {
  role: "user" | "assistant" | "tool";
  content: string;
  toolCallId?: string;
}

export interface ToolCallRecord {
  toolName: string;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  latencyMs: number;
  success: boolean;
  timestamp: Date;
}

// ─── Tool output types ────────────────────────────────────────────────────────

export interface SkillScore {
  priorityAbility: number;    // 0–10
  technicalSkills: number;    // 0–10
  executionSpeed: number;     // 0–10
  learnability: number;       // 0–10
  softSkills: number;         // 0–10
  confidence: number;         // 0–1
  reasoning: Record<string, string>;
}

export interface JobInsights {
  field: string;
  topSkillsInDemand: string[];
  avgSalaryRange: string;
  topCompaniesHiring: string[];
  marketGrowthSignal: "high" | "medium" | "low";
  studentSkillGap: string[];
}

// ─── TruthID — the core product output ───────────────────────────────────────

export interface TruthID {
  truthIdId: string;
  studentId: string;
  priorityAbilityScore: number;   // 0–3000  (30%)
  technicalSkillsScore: number;   // 0–2000  (20%)
  executionSpeedScore: number;    // 0–2000  (20%)
  learnabilityScore: number;      // 0–2000  (20%)
  softSkillsScore: number;        // 0–1000  (10%)
  marketAlignmentBonus: number;   // 0–500   (bonus)
  overallScore: number;           // 0–10000
  confidence: number;             // 0–1
  aiReasoning: string;
  employerSummary: string;
  topStrengths: string[];
  developmentAreas: string[];
  generatedAt: Date;
}

// ─── Benchmark ────────────────────────────────────────────────────────────────

export interface BenchmarkResult {
  testCaseId: string;
  studentDescription: string;
  agentScore: number;
  defaultClaudeScore: number;
  improvementPercent: number;
  agentLatencyMs: number;
  defaultLatencyMs: number;
  dimensionBreakdown: {
    dimension: string;
    agentScore: number;
    defaultScore: number;
  }[];
}

export interface PerfMetrics {
  agentCompositeScore: number;
  scoreFormula: string;
  testCases: BenchmarkResult[];
  avgImprovementPercent: number;
  avgSpeedAdvantage: number;
  problemStatement: string;
  priorityReasoning: string;
}
