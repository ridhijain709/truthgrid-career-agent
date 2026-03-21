'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  FileBarChart, 
  Bot, 
  FileText, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Students', href: '/students', icon: Users },
  { name: 'Weekly Report', href: '/weekly-report', icon: FileBarChart },
  { name: 'AI Tutor', href: '/ai-tutor', icon: Bot, badge: 3 },
  { name: 'Submit Assessment', href: '/submit', icon: FileText },
  { name: 'Admin Analytics', href: '/admin', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card-dark rounded-lg shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div className={clsx(
        'fixed inset-y-0 left-0 z-40 w-64 bg-card-dark border-r border-gray-700 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        {
          'translate-x-0': isOpen,
          '-translate-x-full': !isOpen,
        }
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-700">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-bold text-gradient">TruthGrid</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const active = isActive(item.href);

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={clsx(
                        'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors group',
                        {
                          'bg-primary-500/10 text-primary-500 border border-primary-500/20': active,
                          'text-gray-400 hover:text-white hover:bg-gray-700': !active,
                        }
                      )}
                    >
                      <IconComponent className="w-5 h-5 mr-3" />
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto bg-primary-500 text-white text-xs rounded-full px-2 py-1">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700">
            <div className="text-xs text-gray-400 text-center">
              © 2024 TruthGrid
              <br />
              v1.0.0
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}