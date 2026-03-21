'use client';

import { getScoreColor, getSkillWeightPercentage } from '@/lib/calculations';
import { SkillScore } from '@/types';
import clsx from 'clsx';

interface ScoreBarProps {
  skill: keyof SkillScore;
  value: number;
  maxValue?: number;
  showPercentage?: boolean;
  showWeight?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ScoreBar({ 
  skill, 
  value, 
  maxValue = 100, 
  showPercentage = true,
  showWeight = false,
  size = 'md' 
}: ScoreBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const color = getScoreColor(value);
  const weight = getSkillWeightPercentage(skill);

  const skillLabels = {
    priorityAbility: 'Priority Ability',
    technicalSkills: 'Technical Skills',
    executionSpeed: 'Execution Speed',
    learnability: 'Learnability',
    softSkills: 'Soft Skills',
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={clsx('font-medium text-text-dark', textSizes[size])}>
            {skillLabels[skill]}
          </span>
          {showWeight && (
            <span className="text-xs text-gray-400 font-mono">
              ({weight}%)
            </span>
          )}
        </div>
        
        {showPercentage && (
          <span className={clsx('font-semibold', textSizes[size])} style={{ color }}>
            {value}%
          </span>
        )}
      </div>

      <div className="relative">
        <div className={clsx(
          'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
          sizeClasses[size]
        )}>
          <div
            className={clsx('h-full rounded-full transition-all duration-500 ease-out')}
            style={{
              width: `${percentage}%`,
              backgroundColor: color,
            }}
          />
        </div>

        {/* Optional score markers */}
        <div className="absolute top-0 w-full h-full flex justify-between items-center px-1 pointer-events-none">
          {[25, 50, 75].map((mark) => (
            <div
              key={mark}
              className="w-px h-full bg-gray-400 dark:bg-gray-600 opacity-30"
              style={{ marginLeft: `${(mark / 100) * 100}%` }}
            />
          ))}
        </div>
      </div>

      {size === 'lg' && (
        <div className="flex justify-between text-xs text-gray-400">
          <span>Needs Improvement</span>
          <span>Average</span>
          <span>Good</span>
          <span>Excellent</span>
        </div>
      )}
    </div>
  );
}

interface ScoreBarGroupProps {
  skillBreakdown: SkillScore;
  title?: string;
  showWeights?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreBarGroup({ 
  skillBreakdown, 
  title, 
  showWeights = false,
  size = 'md' 
}: ScoreBarGroupProps) {
  return (
    <div className="bg-card-dark rounded-lg p-6 card-shadow">
      {title && (
        <h3 className="text-lg font-semibold text-text-dark mb-6">{title}</h3>
      )}
      
      <div className="space-y-6">
        {(Object.entries(skillBreakdown) as [keyof SkillScore, number][]).map(([skill, value]) => (
          <ScoreBar
            key={skill}
            skill={skill}
            value={value}
            showWeight={showWeights}
            size={size}
          />
        ))}
      </div>
    </div>
  );
}