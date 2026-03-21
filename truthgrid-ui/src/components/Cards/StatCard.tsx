'use client';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ReactNode;
  className?: string;
}

export default function StatCard({ title, value, change, icon, className }: StatCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'increase':
        return 'text-green-500';
      case 'decrease':
        return 'text-red-500';
      case 'neutral':
      default:
        return 'text-gray-500';
    }
  };

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'increase':
        return '↗';
      case 'decrease':
        return '↘';
      case 'neutral':
      default:
        return '→';
    }
  };

  return (
    <div className={`bg-card-dark rounded-lg p-6 card-shadow ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
          {title}
        </p>
        {icon && (
          <div className="p-2 bg-primary-500/10 rounded-lg">
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-baseline justify-between">
        <p className="text-3xl font-bold text-text-dark">
          {formatValue(value)}
        </p>
        
        {change && (
          <div className={`flex items-center text-sm ${getChangeColor(change.type)}`}>
            <span className="mr-1">{getChangeIcon(change.type)}</span>
            <span>
              {Math.abs(change.value)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}