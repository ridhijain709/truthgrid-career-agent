'use client';

import { SignalStatus as SignalStatusType } from '@/types';
import clsx from 'clsx';

interface SignalBadgeProps {
  signal: SignalStatusType;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
}

export default function SignalBadge({ signal, size = 'md', showDescription = false }: SignalBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'WATCH':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'COLLAPSE':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'RECOVERY':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  return (
    <div className="flex flex-col items-start">
      <span
        className={clsx(
          'inline-flex items-center font-medium rounded-full border',
          sizeClasses[size],
          getStatusStyles(signal.status)
        )}
      >
        <span
          className="w-2 h-2 rounded-full mr-2"
          style={{ backgroundColor: signal.color }}
        />
        {signal.status}
      </span>
      {showDescription && (
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
          {signal.description}
        </p>
      )}
    </div>
  );
}