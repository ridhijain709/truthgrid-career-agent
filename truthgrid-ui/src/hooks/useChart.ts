import { useState, useEffect, useMemo } from 'react';
import { MOCK_TREND_DATA } from '@/lib/mock-data';
import { SkillScore } from '@/types';

export function useChart() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1M' | '3M' | '6M' | '1Y'>('3M');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');

  const trendData = useMemo(() => {
    const now = new Date();
    const ranges = {
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365,
    };

    const daysCutoff = ranges[selectedTimeRange];
    const cutoffDate = new Date(now.getTime() - (daysCutoff * 24 * 60 * 60 * 1000));

    return MOCK_TREND_DATA.filter(item => new Date(item.date) >= cutoffDate);
  }, [selectedTimeRange]);

  const chartColors = {
    primary: '#38bdf8',
    secondary: '#22c55e',
    tertiary: '#f59e0b',
    quaternary: '#ef4444',
  };

  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  const formatTooltip = (value: number, name: string) => {
    if (name === 'score') {
      return [value.toLocaleString(), 'TruthID Score'];
    }
    if (name === 'lgs') {
      return [`${value}%`, 'LGS'];
    }
    return [value, name];
  };

  const getChartConfig = () => ({
    colors: chartColors,
    formatXAxis,
    formatYAxis,
    formatTooltip,
    selectedTimeRange,
    chartType,
  });

  return {
    trendData,
    selectedTimeRange,
    setSelectedTimeRange,
    chartType,
    setChartType,
    chartColors,
    getChartConfig,
    formatXAxis,
    formatYAxis,
    formatTooltip,
  };
}

export function useRadarChart() {
  const radarConfig = {
    colors: {
      fill: '#38bdf8',
      stroke: '#0284c7',
      grid: '#374151',
    },
    opacity: 0.3,
    strokeWidth: 2,
  };

  const formatRadarData = (skillBreakdown: SkillScore) => {
    return [
      {
        skill: 'Priority Ability',
        value: skillBreakdown.priorityAbility || 0,
        fullMark: 100,
      },
      {
        skill: 'Technical Skills',
        value: skillBreakdown.technicalSkills || 0,
        fullMark: 100,
      },
      {
        skill: 'Execution Speed',
        value: skillBreakdown.executionSpeed || 0,
        fullMark: 100,
      },
      {
        skill: 'Learnability',
        value: skillBreakdown.learnability || 0,
        fullMark: 100,
      },
      {
        skill: 'Soft Skills',
        value: skillBreakdown.softSkills || 0,
        fullMark: 100,
      },
    ];
  };

  return {
    radarConfig,
    formatRadarData,
  };
}

export function useResponsiveChart() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getResponsiveProps = (baseWidth = 600, baseHeight = 300) => {
    const isMobile = dimensions.width < 768;
    const isTablet = dimensions.width >= 768 && dimensions.width < 1024;

    if (isMobile) {
      return {
        width: Math.min(baseWidth, dimensions.width - 40),
        height: baseHeight * 0.8,
        fontSize: 10,
      };
    }

    if (isTablet) {
      return {
        width: baseWidth * 0.9,
        height: baseHeight * 0.9,
        fontSize: 11,
      };
    }

    return {
      width: baseWidth,
      height: baseHeight,
      fontSize: 12,
    };
  };

  return {
    dimensions,
    getResponsiveProps,
    isMobile: dimensions.width < 768,
    isTablet: dimensions.width >= 768 && dimensions.width < 1024,
    isDesktop: dimensions.width >= 1024,
  };
}