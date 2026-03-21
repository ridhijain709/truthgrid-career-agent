'use client';

import { usePathname } from 'next/navigation';
import { ChevronRight, Bell } from 'lucide-react';
import ThemeToggle from '@/components/UI/ThemeToggle';
import { useApp } from '@/context/AppContext';

export default function Header() {
  const pathname = usePathname();
  const { notifications } = useApp();

  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Dashboard', href: '/dashboard' }];

    if (segments.length === 0 || segments[0] === 'dashboard') {
      return breadcrumbs;
    }

    // Map route segments to readable names
    const routeNames: Record<string, string> = {
      'student': 'Students',
      'weekly-report': 'Weekly Report',
      'ai-tutor': 'AI Tutor',
      'submit': 'Assessment Submission',
      'admin': 'Admin Analytics',
      'truthid': 'TruthID Profile',
    };

    segments.forEach((segment, index) => {
      const isLast = index === segments.length - 1;
      const name = routeNames[segment] || segment;
      const href = '/' + segments.slice(0, index + 1).join('/');

      // Skip IDs in breadcrumbs for cleaner look
      if (!isNaN(Number(segment))) {
        return;
      }

      breadcrumbs.push({ name, href });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const unreadCount = notifications.length;

  return (
    <header className="bg-card-dark border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center">
              {index > 0 && <ChevronRight className="w-4 h-4 text-gray-500 mx-2" />}
              <span 
                className={
                  index === breadcrumbs.length - 1
                    ? 'text-primary-500 font-medium'
                    : 'text-gray-400 hover:text-gray-300'
                }
              >
                {crumb.name}
              </span>
            </div>
          ))}
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* User profile */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-500/10 rounded-full flex items-center justify-center">
              <span className="text-primary-500 font-semibold text-sm">A</span>
            </div>
            <div className="hidden md:block">
              <div className="text-sm font-medium text-white">Admin User</div>
              <div className="text-xs text-gray-400">admin@truthgrid.com</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}