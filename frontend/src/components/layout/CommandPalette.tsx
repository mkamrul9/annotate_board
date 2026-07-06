'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center pt-32">
      <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-xl w-full max-w-xl overflow-hidden flex flex-col h-min">
        <Command label="Command Menu" className="flex flex-col h-full text-slate-200">
          <Command.Input 
            placeholder="Type a command or search..." 
            className="w-full bg-slate-950 px-4 py-4 border-b border-slate-800 outline-none text-white"
            autoFocus
          />
          <Command.List className="p-2 overflow-y-auto max-h-[300px]">
            <Command.Empty className="p-4 text-center text-slate-500">No results found.</Command.Empty>
            
            <Command.Group heading="Navigation" className="text-xs text-slate-400 font-semibold px-2 py-2">
              <Command.Item 
                onSelect={() => { setOpen(false); router.push('/tasks'); }}
                className="px-4 py-2 mt-1 rounded-md cursor-pointer hover:bg-slate-800 text-sm text-slate-200 transition"
              >
                Go to Tasks
              </Command.Item>
              <Command.Item 
                onSelect={() => { setOpen(false); router.push('/annotate'); }}
                className="px-4 py-2 mt-1 rounded-md cursor-pointer hover:bg-slate-800 text-sm text-slate-200 transition"
              >
                Go to Annotate
              </Command.Item>
            </Command.Group>
            
            <Command.Group heading="Actions" className="text-xs text-slate-400 font-semibold px-2 py-2">
              <Command.Item 
                onSelect={() => { 
                  setOpen(false); 
                  document.documentElement.classList.toggle('dark'); 
                }}
                className="px-4 py-2 mt-1 rounded-md cursor-pointer hover:bg-slate-800 text-sm text-slate-200 transition"
              >
                Toggle Dark Mode
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
