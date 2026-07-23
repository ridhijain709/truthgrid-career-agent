import { NextRequest, NextResponse } from 'next/server';

// ── TruthGrid Assessment API Route ────────────────────────────────────────────
// POST /api/assess
//
// Accepts a student profile and returns a TruthID assessment result.
// In production: delegates to the backend agent pipeline.
// In demo/development mode: returns a computed mock result.
//
// Request body: { studentProfile: StudentProfileInput }
// Response:     { truthId, report, pipeline, durationMs }

interface StudentProfileInput {
  studentId?: string;
  name: string;
  age?: number;
  field: string;
  institution: string;
  city: string;
  selfAssessment: Record<string, number>;
  projectHistory: Array<{
    title: string;
    description: string;
    toolsUsed: string[];
    impactStatement: string;
    durationWeeks?: number;
  }>;
  behaviorMetrics?: {
    avgResponseTimeSeconds?: number;
    editCount?: number;
    completionRate?: number;
  };
}

interface AssessmentRequest {
  studentProfile: StudentProfileInput;
}

// ── Score computation (mirrors src/tools/index.ts) ────────────────────────────
function computeTruthIDScore(
  skills: { priorityAbility: number; technicalSkills: number; executionSpeed: number; learnability: number; softSkills: number; confidence: number; reasoning: string },
  marketTopSkills: string[]
): {
  overallScore: number;
  breakdown: { priorityAbility: number; technicalSkills: number; executionSpeed: number; learnability: number; softSkills: number; marketAlignmentBonus: number };
} {
  const WEIGHTS = { priorityAbility: 0.30, technicalSkills: 0.20, executionSpeed: 0.20, learnability: 0.20, softSkills: 0.10 };
  const rawScore =
    skills.priorityAbility * WEIGHTS.priorityAbility +
    skills.technicalSkills * WEIGHTS.technicalSkills +
    skills.executionSpeed  * WEIGHTS.executionSpeed  +
    skills.learnability    * WEIGHTS.learnability    +
    skills.softSkills      * WEIGHTS.softSkills;
  const baseScore = Math.round((rawScore / 10) * 9500);
  const matchingSkills = marketTopSkills.filter(s => skills.reasoning.toLowerCase().includes(s.toLowerCase()));
  const marketBonus = Math.min(matchingSkills.length * 100, 500);
  const overallScore = Math.min(baseScore + marketBonus, 10000);
  return {
    overallScore,
    breakdown: {
      priorityAbility:      Math.round(skills.priorityAbility * 300),
      technicalSkills:      Math.round(skills.technicalSkills * 200),
      executionSpeed:       Math.round(skills.executionSpeed  * 200),
      learnability:         Math.round(skills.learnability    * 200),
      softSkills:           Math.round(skills.softSkills      * 100),
      marketAlignmentBonus: marketBonus,
    },
  };
}

// ── Heuristic scoring (no API key required) ───────────────────────────────────
// Produces a deterministic score based on the student profile.
// Used when ANTHROPIC_API_KEY is not configured.
function heuristicAssess(profile: StudentProfileInput) {
  const projects = profile.projectHistory ?? [];
  const selfScores = Object.values(profile.selfAssessment ?? {});
  const avgSelf = selfScores.length > 0 ? selfScores.reduce((a, b) => a + b, 0) / selfScores.length : 6;
  // Discount self-ratings above 7 by 15% — students systematically over-report
  // skills, and high self-ratings (7-10 across the board) correlate with inflated
  // scores vs actual project output. This mirrors the same correction applied in
  // the full AI pipeline's system prompt.
  const discountedSelf = avgSelf > 7 ? avgSelf * 0.85 : avgSelf;

  // Priority ability: are projects substantive and impactful?
  const hasImpactfulProjects = projects.some(p =>
    p.impactStatement && (p.impactStatement.includes('%') || p.impactStatement.includes('₹') || p.impactStatement.includes('leads'))
  );
  const priorityAbility = Math.min(10, discountedSelf * 0.5 + (hasImpactfulProjects ? 4 : 2));

  // Technical: tool diversity
  const allTools = new Set(projects.flatMap(p => p.toolsUsed));
  const technicalSkills = Math.min(10, (allTools.size / 2) + discountedSelf * 0.4);

  // Execution: projects completed with impact
  const shippedCount = projects.filter(p => p.impactStatement && p.impactStatement.length > 10).length;
  const executionSpeed = Math.min(10, 4 + shippedCount * 2);

  // Learnability: tool diversity + AI tools
  const usesAI = Array.from(allTools).some(t => /claude|gpt|gemini|ai|llm/i.test(t));
  const learnability = Math.min(10, (allTools.size / 1.5) + (usesAI ? 2 : 0));

  // Soft skills: quality of impact statements
  const avgImpactLen = projects.reduce((s, p) => s + (p.impactStatement?.length ?? 0), 0) / Math.max(1, projects.length);
  const softSkills = Math.min(10, Math.max(3, avgImpactLen / 15));

  // Confidence based on data quality
  const confidence = Math.min(0.95, 0.6 + (projects.length * 0.1) + (shippedCount * 0.05));

  return {
    priorityAbility: Math.round(priorityAbility * 10) / 10,
    technicalSkills:  Math.round(technicalSkills  * 10) / 10,
    executionSpeed:   Math.round(executionSpeed   * 10) / 10,
    learnability:     Math.round(learnability     * 10) / 10,
    softSkills:       Math.round(softSkills       * 10) / 10,
    confidence,
    reasoning: `Assessed ${projects.length} project(s) for ${profile.field}. ` +
      `${hasImpactfulProjects ? 'Measurable impact statements found — priority ability scored accordingly. ' : ''}` +
      `Tool diversity: ${allTools.size} tools across projects. ${usesAI ? 'AI tool usage detected — learnability bonus applied.' : ''}`,
  };
}

// ── Request handler ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const t0 = Date.now();

  let body: AssessmentRequest;
  try {
    body = await req.json() as AssessmentRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  const { studentProfile: profile } = body;

  // Validate required fields
  if (!profile?.name || !profile?.field) {
    return NextResponse.json(
      { error: 'Missing required fields: name, field' },
      { status: 422 }
    );
  }
  if (!profile.projectHistory || profile.projectHistory.length === 0) {
    return NextResponse.json(
      { error: 'At least one project in projectHistory is required for assessment' },
      { status: 422 }
    );
  }
  if (!profile.selfAssessment || Object.keys(profile.selfAssessment).length === 0) {
    return NextResponse.json(
      { error: 'selfAssessment is required and must include at least one skill rating' },
      { status: 422 }
    );
  }

  // Step 1 — Assess skills
  const skills = heuristicAssess(profile);

  // Step 2 — Market defaults (would call live API in production)
  const marketTopSkills = ['AI tools', 'digital marketing', 'data analysis', 'communication', 'Excel'];
  const marketInsights = {
    topSkills: marketTopSkills,
    avgSalary: '₹3–5 LPA',
    demandLevel: 'high',
    topCompanies: ['Meesho', 'Zomato', 'HDFC Bank', 'TCS', 'Flipkart'],
  };

  // Step 3 — Generate TruthID
  const { overallScore, breakdown } = computeTruthIDScore(skills, marketTopSkills);
  const tier =
    overallScore >= 8500 ? 'Elite (top 5%)' :
    overallScore >= 7000 ? 'Strong (top 20%)' :
    overallScore >= 5000 ? 'Developing (top 50%)' :
    'Early Stage';

  // Step 4 — Generate report
  const topStrengths = [
    skills.priorityAbility >= 7.5 ? 'Priority definition ability' : null,
    skills.technicalSkills  >= 7.0 ? 'Technical execution' : null,
    skills.learnability     >= 7.0 ? 'Fast learner / AI-tool fluent' : null,
    skills.softSkills       >= 7.0 ? 'Clear communicator' : null,
  ].filter(Boolean) as string[];

  const developmentAreas = [
    skills.technicalSkills  < 6 ? 'Technical skills depth' : null,
    skills.softSkills       < 6 ? 'Impact communication' : null,
    skills.executionSpeed   < 6 ? 'Project execution speed' : null,
    'Portfolio presentation',
  ].filter(Boolean).slice(0, 3) as string[];

  const employerSummary =
    `${profile.name} scored ${overallScore.toLocaleString()}/10,000 on TruthGrid (${tier}). ` +
    `Priority ability ${breakdown.priorityAbility}/3,000 — ` +
    (breakdown.priorityAbility >= 2000 ? 'strong evidence of working on high-impact problems.' : 'some prioritization signals present.') +
    ` ${profile.projectHistory.length} completed project(s) with real-world outcomes.`;

  const result = {
    truthId: {
      studentId: profile.studentId ?? `demo-${Date.now()}`,
      overallScore,
      breakdown,
      tier,
      confidence: skills.confidence,
      aiReasoning: skills.reasoning,
      employerSummary,
      topStrengths: topStrengths.length > 0 ? topStrengths : ['Domain knowledge', 'Project history'],
      developmentAreas,
      jobInsights: marketInsights,
      generatedAt: new Date().toISOString(),
    },
    pipeline: {
      steps: ['assess_skills', 'research_market', 'generate_truth_id', 'generate_report'],
      note: 'Full AI pipeline requires ANTHROPIC_API_KEY. This response used heuristic scoring.',
    },
    durationMs: Date.now() - t0,
  };

  return NextResponse.json(result);
}

// ── GET — health check / documentation ───────────────────────────────────────
export async function GET() {
  return NextResponse.json({
    endpoint: 'POST /api/assess',
    description: 'TruthGrid AI assessment pipeline',
    requiredFields: {
      name: 'string',
      field: 'string — e.g. "digital marketing", "computer science"',
      institution: 'string',
      city: 'string',
      selfAssessment: 'Record<skillName, 0-10>',
      projectHistory: 'Array<{ title, description, toolsUsed, impactStatement }>',
    },
    optionalFields: {
      studentId: 'string',
      age: 'number',
      behaviorMetrics: '{ avgResponseTimeSeconds, editCount, completionRate }',
    },
    scoreFormula: {
      priorityAbility:  '30% → max 3,000',
      technicalSkills:  '20% → max 2,000',
      executionSpeed:   '20% → max 2,000',
      learnability:     '20% → max 2,000',
      softSkills:       '10% → max 1,000',
      marketAlignment:  'bonus → max +500',
      total:            'max 10,000',
    },
  });
}
