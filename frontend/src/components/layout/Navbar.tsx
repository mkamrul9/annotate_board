'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Activity, Kanban, ImageIcon, Keyboard, User } from 'lucide-react';
import ProfileModal from './ProfileModal';

const NAV_LINKS = [
  { href: '/tasks', label: 'Tasks', icon: Kanban },
  { href: '/annotate', label: 'Annotate', icon: ImageIcon },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Don't render the navbar on the login page
  if (!isAuthenticated) return null;

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">

          {/* Logo */}
          <Link
            href="/tasks"
            className="flex items-center gap-2.5 font-bold text-white hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Activity size={16} className="text-white" />
            </div>
            <span className="text-sm tracking-tight">
              VAI <span className="text-indigo-400">Radiology</span>
            </span>
          </Link>

          {/* Navigation links */}
          <div className="flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 px-2">
              <Keyboard size={13} />
              <kbd className="font-mono text-slate-500">⌘K</kbd>
            </span>
            <div className="w-px h-4 bg-slate-800" />
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-400 border border-slate-700 hover:border-indigo-500/30 transition-all shadow-sm"
              aria-label="Profile"
            >
              <User size={15} />
            </button>
          </div>
        </div>
      </nav>
      
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
}
