'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Activity, Kanban, ImageIcon, LogOut, Keyboard } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

const NAV_LINKS = [
  { href: '/tasks', label: 'Tasks', icon: Kanban },
  { href: '/annotate', label: 'Annotate', icon: ImageIcon },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout } = useAuthStore();

  // Don't render the navbar on the login page
  if (!isAuthenticated) return null;

  const handleLogout = async () => {
    try {
      await api.post('auth/logout/');
    } catch {
      // Logout even if the server request fails (token may already be invalid)
    } finally {
      logout();
      router.push('/');
      toast.success('Logged out successfully');
    }
  };

  return (
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
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
            aria-label="Log out"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
