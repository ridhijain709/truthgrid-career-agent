'use client';

import { Moon, Sun } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function ThemeToggle() {
  const { theme } = useApp();

  return (
    <button
      onClick={theme.toggle}
      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
    >
      {theme.isDark ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-gray-700" />
      )}
    </button>
  );
}