'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useTaskStore } from '@/store/useTaskStore';
import { Activity, Sun, Moon } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import { useTheme } from 'next-themes';

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, username } = useAuthStore();
  const { tasks } = useTaskStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  if (!isAuthenticated) return null;

  const initial = username ? username[0].toUpperCase() : 'U';
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;

  const links = [
    { href: '/tasks', label: 'Board' },
    { href: '/annotate', label: 'Annotate' },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between transition-colors duration-300">
        {/* Brand */}
        <Link href="/tasks" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
            <Activity size={17} />
          </div>
          <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Annotate Board
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {links.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {label}
                {label === 'Board' && inProgressCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {inProgressCount > 9 ? '9+' : inProgressCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Profile avatar */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="group relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] transition-all hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/25"
              aria-label="Open profile"
            >
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white dark:bg-slate-950 transition-colors">
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{initial}</span>
              </div>
              {/* Online dot */}
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full" />
            </button>

            <ProfileDropdown
              isOpen={isProfileOpen}
              onClose={() => setIsProfileOpen(false)}
              username={username}
            />
          </div>
        </div>
      </nav>
    </>
  );
}
