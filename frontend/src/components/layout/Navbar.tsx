'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Activity, Kanban, ImageIcon, Keyboard, User, Sun, Moon } from 'lucide-react';
import ProfileModal from './ProfileModal';
import { useTheme } from 'next-themes';

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  // Don't render the navbar on the login page
  if (!isAuthenticated) return null;

  return (
    <>
      <nav className="sticky top-0 z-40 w-full backdrop-blur-lg bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 px-8 py-3 flex items-center justify-between transition-colors duration-300">
        <Link href="/tasks" className="flex items-center gap-2">
          <Activity className="text-indigo-600 dark:text-indigo-500" />
          <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">VAI Radiology</span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link href="/tasks" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">Board</Link>
          <Link href="/annotate" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">Annotate</Link>
          
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition"
          >
            {theme === 'dark' ? <Sun size={16} className="text-slate-300" /> : <Moon size={16} className="text-slate-600" />}
          </button>

          <button 
            onClick={() => setIsProfileOpen(true)} 
            className="group relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] transition-all hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/25"
          >
            <div className="flex h-full w-full items-center justify-center rounded-full bg-white dark:bg-slate-950 transition-colors">
              <User size={16} className="text-slate-600 dark:text-slate-300 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
            </div>
            {/* Status dot */}
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full"></div>
          </button>
        </div>
      </nav>

      {/* Modals */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
}
