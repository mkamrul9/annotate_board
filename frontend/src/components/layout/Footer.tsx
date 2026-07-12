import Link from 'next/link';
import { Activity, ShieldCheck, Mail, Code } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-950 mt-auto transition-colors duration-300 relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />
      
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand & Status */}
          <div className="col-span-1 md:col-span-2 flex flex-col gap-4 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                <Activity size={18} />
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Annotate Board</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Accelerating annotation workflows through AI-powered image labeling and high-precision task management.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">All systems operational</span>
            </div>
          </div>

          {/* Links */}
          <div className="relative z-10">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">Platform</h4>
            <ul className="space-y-2.5 text-sm text-slate-500 dark:text-slate-400">
              <li><Link href="/tasks" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Kanban Board</Link></li>
              <li><Link href="/annotate" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Annotation Studio</Link></li>
            </ul>
          </div>

          {/* Legal / Contact */}
          <div className="relative z-10">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">Legal & Connect</h4>
            <ul className="space-y-2.5 text-sm text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <ShieldCheck size={16} />
                <Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy Policy</Link>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} />
                <Link href="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Contact Support</Link>
              </li>
              <li className="flex items-center gap-2">
                <Code size={16} />
                <Link href="/opensource" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Open Source</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mt-12 pt-6 border-t border-slate-200 dark:border-slate-800/60 relative z-10">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Annotate Board. All rights reserved.
          </p>
          <div className="flex items-center gap-2 mt-4 sm:mt-0 text-slate-500 text-xs">
            <span>Pro Tip: Press</span>
            <kbd className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-700 dark:text-slate-300 font-mono text-[10px] font-semibold border border-slate-200 dark:border-slate-700 shadow-sm">Ctrl+K</kbd>
            <span>for command palette</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
