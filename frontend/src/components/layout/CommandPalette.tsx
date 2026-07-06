'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Kanban, ImageIcon, LogOut, Plus, Keyboard } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const handleLogout = async () => {
    setOpen(false);
    try {
      await api.post('auth/logout/');
    } catch { /* ignore */ }
    logout();
    router.push('/');
    toast.success('Logged out successfully');
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center pt-28 px-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden flex flex-col h-min"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Command Menu" className="flex flex-col text-slate-200">
          <div className="flex items-center gap-2 px-4 border-b border-slate-800">
            <Keyboard size={14} className="text-slate-500" />
            <Command.Input
              placeholder="Type a command or search…"
              className="flex-1 bg-transparent py-4 outline-none text-white text-sm placeholder:text-slate-600"
              autoFocus
            />
          </div>

          <Command.List className="p-2 overflow-y-auto max-h-[320px]">
            <Command.Empty className="py-8 text-center text-slate-500 text-sm">
              No results found.
            </Command.Empty>

            <Command.Group
              heading="Navigate"
              className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider px-2 pt-3 pb-1"
            >
              <Command.Item
                onSelect={() => go('/tasks')}
                className="flex items-center gap-3 px-3 py-2.5 mt-0.5 rounded-xl cursor-pointer hover:bg-slate-800 text-sm text-slate-200 transition"
              >
                <Kanban size={15} className="text-indigo-400" />
                Go to Tasks Board
              </Command.Item>
              <Command.Item
                onSelect={() => go('/annotate')}
                className="flex items-center gap-3 px-3 py-2.5 mt-0.5 rounded-xl cursor-pointer hover:bg-slate-800 text-sm text-slate-200 transition"
              >
                <ImageIcon size={15} className="text-purple-400" />
                Go to Image Annotation
              </Command.Item>
            </Command.Group>

            {isAuthenticated && (
              <>
                <Command.Group
                  heading="Actions"
                  className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider px-2 pt-3 pb-1"
                >
                  <Command.Item
                    onSelect={() => {
                      setOpen(false);
                      // Open new task modal by clicking the button
                      document.getElementById('new-task-btn')?.click();
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 mt-0.5 rounded-xl cursor-pointer hover:bg-slate-800 text-sm text-slate-200 transition"
                  >
                    <Plus size={15} className="text-green-400" />
                    Create New Task
                  </Command.Item>
                </Command.Group>

                <Command.Group
                  heading="Account"
                  className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider px-2 pt-3 pb-1"
                >
                  <Command.Item
                    onSelect={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 mt-0.5 rounded-xl cursor-pointer hover:bg-red-900/30 text-sm text-red-400 transition"
                  >
                    <LogOut size={15} />
                    Log Out
                  </Command.Item>
                </Command.Group>
              </>
            )}
          </Command.List>

          <div className="px-4 py-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-600">
            <span><kbd className="font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono">↵</kbd> select</span>
            <span><kbd className="font-mono">Esc</kbd> close</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
