import { SkillScore, SignalStatus } from '@/types';
import { SKILL_WEIGHTS, SIGNAL_STATUS } from './constants';

export function calculateTruthIDScore(skillBreakdown: SkillScore): number {
  const {
    priorityAbility,
    technicalSkills,
    executionSpeed,
    learnability,
    softSkills,
  } = skillBreakdown;

  const weightedScore = 
    (priorityAbility * SKILL_WEIGHTS.priorityAbility) +
    (technicalSkills * SKILL_WEIGHTS.technicalSkills) +
    (executionSpeed * SKILL_WEIGHTS.executionSpeed) +
    (learnability * SKILL_WEIGHTS.learnability) +
    (softSkills * SKILL_WEIGHTS.softSkills);

  // Convert to 0-10000 scale
  return Math.round(weightedScore * 100);
}

export function calculateLGS(skillBreakdown: SkillScore): number {
  // Learning Growth Score is an average of all skills
  const { priorityAbility, technicalSkills, executionSpeed, learnability, softSkills } = skillBreakdown;
  return Math.round((priorityAbility + technicalSkills + executionSpeed + learnability + softSkills) / 5);
}

export function determineSignalStatus(lgs: number, trend: 'up' | 'down' | 'stable', previousLgs?: number): SignalStatus {
  // COLLAPSE: LGS < 50 or major downtrend
  if (lgs < 50 || (trend === 'down' && previousLgs && (previousLgs - lgs) > 15)) {
    return SIGNAL_STATUS.COLLAPSE;
  }

  // RECOVERY: Was in COLLAPSE, now improving
  if (previousLgs && previousLgs < 50 && lgs >= 50 && trend === 'up') {
    return SIGNAL_STATUS.RECOVERY;
  }

  // WATCH: LGS 50-70 or slight downtrend
  if ((lgs >= 50 && lgs <= 70) || (trend === 'down' && previousLgs && (previousLgs - lgs) <= 15)) {
    return SIGNAL_STATUS.WATCH;
  }

  // HEALTHY: LGS > 70, no downtrend
  if (lgs > 70 && trend !== 'down') {
    return SIGNAL_STATUS.HEALTHY;
  }

  // Default to WATCH for edge cases
  return SIGNAL_STATUS.WATCH;
}

export function getScoreColor(score: number): string {
  if (score >= 8000) return '#22c55e'; // Excellent
  if (score >= 6000) return '#38bdf8'; // Good
  if (score >= 4000) return '#f59e0b'; // Average
  return '#ef4444'; // Needs Improvement
}

export function getScoreLabel(score: number): string {
  if (score >= 8000) return 'Excellent';
  if (score >= 6000) return 'Good';
  if (score >= 4000) return 'Average';
  return 'Needs Improvement';
}

export function formatScore(score: number): string {
  return score.toLocaleString();
}

export function calculatePercentile(score: number, allScores: number[]): number {
  const sortedScores = [...allScores].sort((a, b) => a - b);
  const rank = sortedScores.findIndex(s => s >= score) + 1;
  return Math.round((rank / sortedScores.length) * 100);
}

export function getSkillWeightPercentage(skill: keyof SkillScore): number {
  return SKILL_WEIGHTS[skill] * 100;
}

export function normalizeSkillScore(rawScore: number, maxPossible: number = 100): number {
  return Math.min(Math.max(rawScore, 0), maxPossible);
}

export function calculateSkillGrowthRate(currentSkill: SkillScore, previousSkill: SkillScore): Record<keyof SkillScore, number> {
  const growthRates: Record<keyof SkillScore, number> = {} as Record<keyof SkillScore, number>;
  
  (Object.keys(currentSkill) as (keyof SkillScore)[]).forEach(skill => {
    const current = currentSkill[skill];
    const previous = previousSkill[skill];
    growthRates[skill] = previous > 0 ? ((current - previous) / previous) * 100 : 0;
  });

  return growthRates;
}

export function getRecommendations(skillBreakdown: SkillScore): string[] {
  const recommendations: string[] = [];
  
  if (skillBreakdown.technicalSkills < 60) {
    recommendations.push('Focus on technical skill development through online courses and hands-on projects');
  }
  
  if (skillBreakdown.softSkills < 60) {
    recommendations.push('Enhance communication and leadership skills through team projects and presentations');
  }
  
  if (skillBreakdown.executionSpeed < 60) {
    recommendations.push('Improve time management and project delivery through structured planning methods');
  }
  
  if (skillBreakdown.learnability < 60) {
    recommendations.push('Develop continuous learning habits and adaptability to new technologies');
  }
  
  if (skillBreakdown.priorityAbility < 60) {
    recommendations.push('Work on decision-making skills and strategic thinking through case studies');
  }

  return recommendations.length > 0 ? recommendations : ['Continue maintaining excellent performance across all skill areas'];
}