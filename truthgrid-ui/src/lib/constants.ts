import { SignalStatus, NavItem } from '@/types';

export const COLORS = {
  primary: '#38bdf8',
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  background: {
    dark: '#0f172a',
    light: '#ffffff',
  },
  card: {
    dark: '#1e293b',
    light: '#f8fafc',
  },
  text: {
    dark: '#f1f5f9',
    light: '#1e293b',
  },
};

export const SIGNAL_STATUS: Record<string, SignalStatus> = {
  HEALTHY: {
    status: 'HEALTHY',
    color: '#22c55e',
    description: 'Performing well with positive trends',
  },
  WATCH: {
    status: 'WATCH',
    color: '#f59e0b',
    description: 'Needs attention, some concerning trends',
  },
  COLLAPSE: {
    status: 'COLLAPSE',
    color: '#ef4444',
    description: 'Critical performance issues requiring intervention',
  },
  RECOVERY: {
    status: 'RECOVERY',
    color: '#38bdf8',
    description: 'Showing improvement after previous concerns',
  },
};

export const NAV_ITEMS: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    name: 'Students',
    href: '/students',
    icon: 'Users',
  },
  {
    name: 'Weekly Report',
    href: '/weekly-report',
    icon: 'FileBarChart',
  },
  {
    name: 'AI Tutor',
    href: '/ai-tutor',
    icon: 'Bot',
    badge: 3,
  },
  {
    name: 'Submit Assessment',
    href: '/submit',
    icon: 'FileText',
  },
  {
    name: 'Admin Analytics',
    href: '/admin',
    icon: 'Settings',
  },
];

export const SKILL_WEIGHTS = {
  priorityAbility: 0.3,
  technicalSkills: 0.2,
  executionSpeed: 0.2,
  learnability: 0.15,
  softSkills: 0.15,
};

export const SCORE_RANGES = {
  EXCELLENT: { min: 8000, max: 10000, label: 'Excellent', color: '#22c55e' },
  GOOD: { min: 6000, max: 7999, label: 'Good', color: '#38bdf8' },
  AVERAGE: { min: 4000, max: 5999, label: 'Average', color: '#f59e0b' },
  NEEDS_IMPROVEMENT: { min: 0, max: 3999, label: 'Needs Improvement', color: '#ef4444' },
};