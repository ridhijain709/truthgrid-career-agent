'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { SkillScore } from '@/types';
import { useRadarChart, useResponsiveChart } from '@/hooks/useChart';

interface RadarChartComponentProps {
  skillBreakdown: SkillScore;
  title?: string;
}

export default function RadarChartComponent({ skillBreakdown, title }: RadarChartComponentProps) {
  const { radarConfig, formatRadarData } = useRadarChart();
  const { getResponsiveProps } = useResponsiveChart();
  
  const data = formatRadarData(skillBreakdown);
  const responsiveProps = getResponsiveProps(400, 400);

  return (
    <div className="bg-card-dark rounded-lg p-6 card-shadow">
      {title && (
        <h3 className="text-lg font-semibold text-text-dark mb-4">{title}</h3>
      )}
      
      <div className="w-full" style={{ height: responsiveProps.height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid
              stroke={radarConfig.colors.grid}
              strokeWidth={1}
            />
            <PolarAngleAxis
              dataKey="skill"
              tick={{ 
                fontSize: responsiveProps.fontSize,
                fill: '#94a3b8'
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ 
                fontSize: responsiveProps.fontSize - 1,
                fill: '#64748b'
              }}
              tickCount={6}
            />
            <Radar
              name="Skills"
              dataKey="value"
              stroke={radarConfig.colors.stroke}
              fill={radarConfig.colors.fill}
              fillOpacity={radarConfig.opacity}
              strokeWidth={radarConfig.strokeWidth}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-gray-400">{item.skill}:</span>
            <span className="font-semibold text-text-dark">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}