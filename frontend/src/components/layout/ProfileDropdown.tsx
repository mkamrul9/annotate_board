'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/store/useTaskStore';
import { useAnnotationStore } from '@/store/useAnnotationStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTheme } from 'next-themes';
import { CheckCircle, Image as ImageIcon, LogOut, Sun, Moon, LayoutGrid, Sparkles } from 'lucide-react';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

export default function ProfileDropdown({ isOpen, onClose, username }: ProfileDropdownProps) {
  const { tasks } = useTaskStore();
  const { images } = useAnnotationStore();
  const { logout, compactMode, toggleCompactMode, autoSave, toggleAutoSave } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  const completedTasks = tasks.filter(t => t.status === 'DONE').length;
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const totalAnnotations = images.reduce((acc, img) => acc + img.polygons.length, 0);

  const initial = username ? username[0].toUpperCase() : 'U';

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-xl dark:shadow-2xl shadow-slate-200/60 dark:shadow-black/40 overflow-hidden z-50"
        >
          {/* Top gradient bar */}
          <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          {/* User header */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-md shadow-indigo-500/20 flex-shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{username}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Online</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800">
            {[
              { label: 'Done', value: completedTasks, icon: CheckCircle, color: 'text-emerald-500' },
              { label: 'Active', value: inProgressTasks, icon: Sparkles, color: 'text-indigo-500' },
              { label: 'Shapes', value: totalAnnotations, icon: ImageIcon, color: 'text-purple-500' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex flex-col items-center py-3 gap-1">
                <Icon size={14} className={color} />
                <span className="text-base font-bold text-slate-900 dark:text-white leading-none">{value}</span>
                <span className="text-[10px] text-slate-400">{label}</span>
              </div>
            ))}
          </div>

          {/* Settings toggles */}
          <div className="p-2 space-y-0.5">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition group"
            >
              <div className="flex items-center gap-2.5">
                {theme === 'dark'
                  ? <Sun size={15} className="text-amber-400" />
                  : <Moon size={15} className="text-indigo-400" />}
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </div>
              <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                {theme === 'dark' ? '☀️' : '🌙'}
              </span>
            </button>

            {/* Compact mode */}
            <button
              onClick={toggleCompactMode}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <div className="flex items-center gap-2.5">
                <LayoutGrid size={15} className="text-slate-400 dark:text-slate-500" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Compact Cards</span>
              </div>
              <div className={`w-8 h-4.5 rounded-full transition-colors flex items-center px-0.5 ${compactMode ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`} style={{ height: '18px' }}>
                <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${compactMode ? 'translate-x-3' : 'translate-x-0'}`} />
              </div>
            </button>

            {/* Auto-save */}
            <button
              onClick={() => toggleAutoSave()}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles size={15} className="text-slate-400 dark:text-slate-500" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Auto-Save Shapes</span>
              </div>
              <div className={`w-8 rounded-full transition-colors flex items-center px-0.5 ${autoSave ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`} style={{ height: '18px' }}>
                <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${autoSave ? 'translate-x-3' : 'translate-x-0'}`} />
              </div>
            </button>
          </div>

          {/* Sign out */}
          <div className="p-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 dark:text-red-400 transition text-sm font-medium"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
