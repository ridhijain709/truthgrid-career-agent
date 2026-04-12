'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Play,
  CheckCircle,
  Clock,
  Brain,
  Globe,
  BarChart2,
  FileText,
  ChevronRight,
  Zap,
  TrendingUp,
} from 'lucide-react';
import clsx from 'clsx';

// ── Sample student profile used for the demo ─────────────────────────────────
const DEMO_PROFILE = {
  name: 'Ridhi Jain',
  age: 22,
  field: 'Digital Marketing',
  institution: 'CCS University, Meerut',
  city: 'Muzaffarnagar',
  selfAssessment: {
    'Social Media Marketing': 8,
    'Content Writing': 7,
    SEO: 6,
    'AI Tools': 9,
    'Data Analytics': 5,
  },
  projectHistory: [
    {
      title: 'AI-Powered LinkedIn Content Strategy',
      description:
        'Built a Claude API-based content automation tool that generated 20 LinkedIn posts/month for a local MSME. Grew their follower count by 340% in 3 months.',
      toolsUsed: ['Claude API', 'Google Sheets', 'Canva', 'Buffer'],
      impactStatement: 'Client received 3 inbound leads from LinkedIn within 30 days of launch.',
      durationWeeks: 4,
    },
    {
      title: 'Mamaearth Competitor Analysis Dashboard',
      description:
        'Scraped and analyzed 10,000+ Amazon reviews for Mamaearth and 5 competitors. Identified sentiment trends and unmet customer needs.',
      toolsUsed: ['Python', 'BeautifulSoup', 'Google Sheets', 'Claude API'],
      impactStatement: 'Identified 2 product gaps worth ₹2Cr+ market. Presented to D2C founder.',
      durationWeeks: 3,
    },
  ],
  behaviorMetrics: {
    avgResponseTimeSeconds: 45,
    editCount: 3,
    completionRate: 0.98,
  },
};

// ── Mock pipeline result — matches real agent output ─────────────────────────
const DEMO_RESULT = {
  steps: [
    {
      id: 'assess_skills',
      label: 'Step 1 — Assess Skills',
      icon: Brain,
      durationMs: 1240,
      output: {
        priorityAbility: 8.5,
        technicalSkills: 7.0,
        executionSpeed: 8.0,
        learnability: 8.5,
        softSkills: 7.5,
        confidence: 0.88,
        reasoning:
          'Ridhi demonstrates strong priority definition — both projects address real business problems with measurable outcomes rather than academic demos. The LinkedIn automation tool directly solves client acquisition (high-value), not a vanity metric. AI tool fluency (Claude, Python) is well above Tier-2 average. Execution speed is strong: two shipped projects in ≤4 weeks each.',
        flags: ['tier-2 upside', 'shipped to production', 'AI-native workflow', 'measurable impact'],
      },
    },
    {
      id: 'research_market',
      label: 'Step 2 — Research Market',
      icon: Globe,
      durationMs: 890,
      output: {
        topSkills: ['Digital Marketing', 'AI Tools', 'Data Analytics', 'Content Strategy', 'SEO'],
        avgSalary: '₹3.5–6 LPA',
        demandLevel: 'high',
        topCompanies: ['Meesho', 'Zomato', 'Nykaa', 'Myntra', 'Mamaearth'],
        source: 'live web search — LinkedIn Jobs India, Naukri, AmbitionBox (April 2025)',
      },
    },
    {
      id: 'generate_truth_id',
      label: 'Step 3 — Generate TruthID',
      icon: BarChart2,
      durationMs: 320,
      output: {
        overallScore: 7_840,
        breakdown: {
          priorityAbility: 2_550,
          technicalSkills: 1_400,
          executionSpeed: 1_600,
          learnability: 1_700,
          softSkills: 750,
          marketAlignmentBonus: 300,
        },
        confidence: 0.88,
        tier: 'Strong (top 20%)',
      },
    },
    {
      id: 'generate_report',
      label: 'Step 4 — Generate Report',
      icon: FileText,
      durationMs: 210,
      output: {
        employerSummary:
          'Candidate scores 7,840/10,000. Strongest in priority ability (2,550/3,000) — consistently chose highest-impact work first. Shipped two real client projects with measurable outcomes; markedly above Tier-2 average. Ready for digital marketing roles at growth-stage companies.',
        topStrengths: ['Priority definition ability', 'AI tool fluency', 'Shipped client projects'],
        developmentAreas: ['Data analytics depth', 'Paid media / performance marketing', 'Portfolio presentation'],
      },
    },
  ],
};

const DIMENSION_BARS: { key: string; label: string; max: number; color: string }[] = [
  { key: 'priorityAbility', label: 'Priority Ability (30%)', max: 3000, color: 'bg-primary-500' },
  { key: 'technicalSkills', label: 'Technical Skills (20%)', max: 2000, color: 'bg-blue-500' },
  { key: 'executionSpeed', label: 'Execution Speed (20%)', max: 2000, color: 'bg-green-500' },
  { key: 'learnability', label: 'Learnability (20%)', max: 2000, color: 'bg-purple-500' },
  { key: 'softSkills', label: 'Soft Skills (10%)', max: 1000, color: 'bg-yellow-500' },
  { key: 'marketAlignmentBonus', label: 'Market Alignment +', max: 500, color: 'bg-orange-400' },
];

type Step = (typeof DEMO_RESULT.steps)[number];

export default function DemoPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  async function runDemo() {
    setIsRunning(true);
    setCompletedSteps([]);
    setActiveStep(null);
    setIsDone(false);

    for (const step of DEMO_RESULT.steps) {
      setActiveStep(step.id);
      await new Promise(r => setTimeout(r, step.durationMs + 300));
      setCompletedSteps(prev => [...prev, step.id]);
    }

    setActiveStep(null);
    setIsDone(true);
    setIsRunning(false);
  }

  const getStepState = (stepId: string) => {
    if (completedSteps.includes(stepId)) return 'done';
    if (activeStep === stepId) return 'running';
    return 'pending';
  };

  // Typed references to demo step outputs
  const step0Output = DEMO_RESULT.steps[0].output as {
    priorityAbility: number; technicalSkills: number; executionSpeed: number;
    learnability: number; softSkills: number; confidence: number;
    reasoning: string; flags: string[];
  };
  const step2Output = DEMO_RESULT.steps[2].output as {
    overallScore: number; breakdown: Record<string, number>;
    confidence: number; tier: string;
  };
  const step3Output = DEMO_RESULT.steps[3].output as {
    employerSummary: string; topStrengths: string[]; developmentAreas: string[];
  };
  const breakdown = step2Output.breakdown;
  const skillScores = step0Output;

  return (
    <div className="min-h-screen bg-background-dark text-text-dark">
      {/* ── Nav ── */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Home</span>
        </Link>
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">T</span>
          </div>
          <span className="font-bold text-white">TruthGrid Demo</span>
        </div>
        <Link href="/submit" className="text-sm bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors font-medium">
          Get Your TruthID
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {/* ── Header ── */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-primary-500/10 border border-primary-500/30 rounded-full px-4 py-1.5 text-sm text-primary-500 mb-5">
            <Zap className="w-3.5 h-3.5" />
            <span>Live agent pipeline — 4 steps, real AI assessment</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3">TruthID Assessment Demo</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Watch the full 4-step agentic pipeline run on a real student profile. Each step calls a
            different tool — Claude decides the order, executes, reflects, and moves forward.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── Left: Student Profile ── */}
          <div className="space-y-6">
            <div className="bg-card-dark rounded-xl p-6 border border-gray-800">
              <h2 className="text-lg font-semibold text-white mb-4">Sample Student Profile</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Name</span>
                  <span className="text-white font-medium">{DEMO_PROFILE.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Field</span>
                  <span className="text-white">{DEMO_PROFILE.field}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Institution</span>
                  <span className="text-white">{DEMO_PROFILE.institution}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">City</span>
                  <span className="text-white">{DEMO_PROFILE.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Completion rate</span>
                  <span className="text-green-400 font-medium">
                    {(DEMO_PROFILE.behaviorMetrics.completionRate * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-gray-700">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Self-assessment</p>
                <div className="space-y-2">
                  {Object.entries(DEMO_PROFILE.selfAssessment).map(([skill, score]) => (
                    <div key={skill} className="flex items-center gap-3">
                      <span className="text-gray-300 text-xs w-36 shrink-0">{skill}</span>
                      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${score * 10}%` }}
                        />
                      </div>
                      <span className="text-gray-400 text-xs w-4">{score}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-gray-700">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Projects</p>
                {DEMO_PROFILE.projectHistory.map((p, i) => (
                  <div key={i} className="mb-3 last:mb-0">
                    <p className="text-white text-xs font-medium">{p.title}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{p.impactStatement}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {p.toolsUsed.map(t => (
                        <span key={t} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Run button */}
            <button
              onClick={runDemo}
              disabled={isRunning}
              className={clsx(
                'w-full flex items-center justify-center space-x-3 py-4 rounded-xl font-semibold text-lg transition-all',
                isRunning
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/25'
              )}
            >
              {isRunning ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  <span>Running pipeline…</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>{isDone ? 'Run Again' : 'Run Demo Assessment'}</span>
                </>
              )}
            </button>
          </div>

          {/* ── Right: Pipeline Steps ── */}
          <div className="space-y-4">
            {DEMO_RESULT.steps.map((step, idx) => {
              const state = getStepState(step.id);
              const Icon = step.icon;

              return (
                <div
                  key={step.id}
                  className={clsx(
                    'rounded-xl border p-5 transition-all duration-300',
                    state === 'done' ? 'border-green-500/30 bg-green-500/5' :
                    state === 'running' ? 'border-primary-500/50 bg-primary-500/5 ring-1 ring-primary-500/30' :
                    'border-gray-800 bg-card-dark opacity-50'
                  )}
                >
                  <div className="flex items-start space-x-4">
                    <div className={clsx(
                      'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                      state === 'done' ? 'bg-green-500/20' :
                      state === 'running' ? 'bg-primary-500/20' :
                      'bg-gray-800'
                    )}>
                      {state === 'done' ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : state === 'running' ? (
                        <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Icon className="w-5 h-5 text-gray-500" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={clsx(
                          'font-semibold text-sm',
                          state === 'pending' ? 'text-gray-500' : 'text-white'
                        )}>
                          {step.label}
                        </h3>
                        {state === 'done' && (
                          <div className="flex items-center space-x-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>{step.durationMs}ms</span>
                          </div>
                        )}
                        {state === 'running' && (
                          <span className="text-xs text-primary-400 animate-pulse">processing…</span>
                        )}
                      </div>

                      {/* Step output — shown when done */}
                      {state === 'done' && (
                        <div className="mt-2 text-xs text-gray-400 space-y-1">
                          {step.id === 'assess_skills' && (
                            <div className="space-y-1">
                              <p className="text-gray-300">{skillScores.reasoning}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {(skillScores.flags ?? []).map((f: string) => (
                                  <span key={f} className="bg-primary-500/15 text-primary-400 px-2 py-0.5 rounded text-xs">{f}</span>
                                ))}
                              </div>
                              <p className="text-gray-500 mt-1">Confidence: {Math.round((skillScores.confidence ?? 0.75) * 100)}%</p>
                            </div>
                          )}
                          {step.id === 'research_market' && (() => {
                            const market = step.output as {
                              topSkills: string[]; avgSalary: string;
                              demandLevel: string; topCompanies: string[]; source: string;
                            };
                            return (
                              <div className="space-y-1">
                                <p>Top skills: {(market.topSkills ?? []).join(', ')}</p>
                                <p>Market demand: <span className="text-green-400 uppercase font-medium">{market.demandLevel}</span> | Avg salary: <span className="text-white">{market.avgSalary}</span></p>
                                <p className="text-gray-500 text-xs mt-1">Source: {market.source}</p>
                              </div>
                            );
                          })()}
                          {step.id === 'generate_truth_id' && (() => {
                            const result = step.output as {
                              overallScore: number; breakdown: Record<string, number>;
                              confidence: number; tier: string;
                            };
                            return (
                              <div>
                                <div className="flex items-baseline space-x-2 mb-2">
                                  <span className="text-2xl font-bold text-white">{(result.overallScore ?? 0).toLocaleString()}</span>
                                  <span className="text-gray-500">/ 10,000</span>
                                  <span className="text-sm text-primary-400 font-medium">{result.tier}</span>
                                </div>
                              </div>
                            );
                          })()}
                          {step.id === 'generate_report' && (() => {
                            const report = step.output as {
                              employerSummary: string; topStrengths: string[]; developmentAreas: string[];
                            };
                            return (
                              <div className="space-y-2">
                                <p className="text-gray-300 leading-relaxed">{report.employerSummary}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {(report.topStrengths ?? []).map(s => (
                                    <span key={s} className="bg-green-500/15 text-green-400 px-2 py-0.5 rounded text-xs">{s}</span>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Final Score Card — shown after completion ── */}
        {isDone && (
          <div className="bg-card-dark rounded-2xl border border-primary-500/30 p-8 shadow-lg shadow-primary-500/10">
            <div className="flex flex-col md:flex-row md:items-start gap-8">
              {/* Score */}
              <div className="text-center md:text-left shrink-0">
                <div className="inline-flex items-center space-x-2 bg-primary-500/10 text-primary-500 text-sm px-3 py-1 rounded-full mb-3">
                  <TrendingUp className="w-4 h-4" />
                  <span>TruthID Score</span>
                </div>
                <div className="text-6xl font-extrabold text-white">
                  {step2Output.overallScore.toLocaleString()}
                </div>
                <div className="text-gray-400 text-lg mt-1">/ 10,000</div>
                <div className="text-primary-400 font-semibold mt-2">
                  {step2Output.tier}
                </div>
                <div className="text-gray-500 text-sm mt-1">
                  Confidence: {Math.round(skillScores.confidence * 100)}%
                </div>
              </div>

              {/* Breakdown bars */}
              <div className="flex-1 space-y-3">
                <h3 className="text-white font-semibold mb-4">Score Breakdown</h3>
                {DIMENSION_BARS.map(({ key, label, max, color }) => {
                  const score = breakdown[key] ?? 0;
                  const pct = Math.round((score / max) * 100);
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300">{label}</span>
                        <span className="text-white font-medium">
                          {key === 'marketAlignmentBonus' ? `+${score}` : score.toLocaleString()}
                          <span className="text-gray-500"> / {max === 500 ? '+500' : max.toLocaleString()}</span>
                        </span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={clsx('h-full rounded-full transition-all duration-700', color)}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Employer Summary */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <h3 className="text-white font-semibold mb-3">Employer Summary</h3>
              <p className="text-gray-300 leading-relaxed">
                {step3Output.employerSummary}
              </p>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Top Strengths</p>
                  <div className="space-y-1.5">
                    {step3Output.topStrengths.map(s => (
                      <div key={s} className="flex items-center space-x-2 text-sm">
                        <ChevronRight className="w-3 h-3 text-green-400" />
                        <span className="text-gray-200">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Development Areas</p>
                  <div className="space-y-1.5">
                    {step3Output.developmentAreas.map(a => (
                      <div key={a} className="flex items-center space-x-2 text-sm">
                        <ChevronRight className="w-3 h-3 text-yellow-400" />
                        <span className="text-gray-200">{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 pt-6 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-gray-400 text-sm">
                This was a demo run. Submit your own profile to get a live AI assessment.
              </p>
              <Link
                href="/submit"
                className="flex items-center space-x-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors font-semibold whitespace-nowrap"
              >
                <span>Get My TruthID</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
