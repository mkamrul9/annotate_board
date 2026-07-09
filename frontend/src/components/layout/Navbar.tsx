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
      <nav className="sticky top-0 z-40 w-full backdrop-blur-lg bg-slate-950/80 border-b border-slate-800 px-8 py-3 flex items-center justify-between">
        <Link href="/tasks" className="flex items-center gap-2">
          <Activity className="text-indigo-500" />
          <span className="text-lg font-bold text-white tracking-tight">VAI Radiology</span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link href="/tasks" className="text-sm font-medium text-slate-400 hover:text-white transition">Board</Link>
          <Link href="/annotate" className="text-sm font-medium text-slate-400 hover:text-white transition">Annotate</Link>
          <button 
            onClick={() => setIsProfileOpen(true)} 
            className="p-2 bg-slate-900 rounded-full border border-slate-700 hover:border-indigo-500 transition"
          >
            <User size={16} className="text-slate-300" />
          </button>
        </div>
      </nav>
      
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
}
