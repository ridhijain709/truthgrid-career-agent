'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useChart, useResponsiveChart } from '@/hooks/useChart';

interface LineChartComponentProps {
  title?: string;
  showControls?: boolean;
}

export default function LineChartComponent({ title, showControls = false }: LineChartComponentProps) {
  const { 
    trendData, 
    selectedTimeRange, 
    setSelectedTimeRange,
    chartColors, 
    formatXAxis, 
    formatYAxis,
    formatTooltip 
  } = useChart();
  
  const { getResponsiveProps } = useResponsiveChart();
  const responsiveProps = getResponsiveProps(600, 300);

  const timeRangeOptions = [
    { value: '1M' as const, label: '1M' },
    { value: '3M' as const, label: '3M' },
    { value: '6M' as const, label: '6M' },
    { value: '1Y' as const, label: '1Y' },
  ];

  return (
    <div className="bg-card-dark rounded-lg p-6 card-shadow">
      <div className="flex items-center justify-between mb-4">
        {title && (
          <h3 className="text-lg font-semibold text-text-dark">{title}</h3>
        )}
        
        {showControls && (
          <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
            {timeRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedTimeRange(option.value)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  selectedTimeRange === option.value
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-full" style={{ height: responsiveProps.height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#374151" 
              strokeWidth={1}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              tick={{ 
                fontSize: responsiveProps.fontSize,
                fill: '#9ca3af'
              }}
              axisLine={{ stroke: '#4b5563' }}
              tickLine={{ stroke: '#4b5563' }}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ 
                fontSize: responsiveProps.fontSize,
                fill: '#9ca3af'
              }}
              axisLine={{ stroke: '#4b5563' }}
              tickLine={{ stroke: '#4b5563' }}
            />
            <Tooltip
              formatter={formatTooltip}
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f3f4f6',
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke={chartColors.primary}
              strokeWidth={3}
              dot={{ fill: chartColors.primary, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: chartColors.primary, strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="lgs"
              stroke={chartColors.secondary}
              strokeWidth={2}
              dot={{ fill: chartColors.secondary, strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: chartColors.secondary, strokeWidth: 2 }}
              yAxisId="right"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-primary-500 rounded-full mr-2"></div>
          <span className="text-gray-400">TruthID Score</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-gray-400">Learning Growth Score</span>
        </div>
      </div>
    </div>
  );
}