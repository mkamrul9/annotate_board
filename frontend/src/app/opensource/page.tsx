'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Code2, ArrowLeft, Star, GitFork, Package } from 'lucide-react';

const STACK = [
  { name: 'Next.js 16', desc: 'React framework by Vercel', color: 'text-white' },
  { name: 'Django 6', desc: 'Python backend framework', color: 'text-green-400' },
  { name: 'Konva.js', desc: 'Canvas annotation engine', color: 'text-blue-400' },
  { name: 'Zustand', desc: 'Lightweight state management', color: 'text-orange-400' },
  { name: 'YOLOv8', desc: 'Real-time object detection by Ultralytics', color: 'text-purple-400' },
  { name: 'Tailwind CSS', desc: 'Utility-first CSS framework', color: 'text-cyan-400' },
  { name: 'Framer Motion', desc: 'Production-ready animations', color: 'text-pink-400' },
  { name: 'PostgreSQL', desc: 'Open-source relational database', color: 'text-indigo-400' },
];

export default function OpenSourcePage() {
  return (
    <div className="min-h-screen bg-[var(--surface-bg)] py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <Link href="/tasks" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition mb-8">
          <ArrowLeft size={16} /> Back to Board
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Code2 size={24} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Open Source</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Built on the shoulders of giants</p>
          </div>
        </div>

        {/* GitHub */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white mb-1">Source Code</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Annotate Board is publicly available on GitHub</p>
            </div>
            <a
              href="https://github.com/mkamrul9/annotate_board"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-600 transition"
            >
              <Star size={15} /> View on GitHub
            </a>
          </div>
        </div>

        {/* Stack */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package size={16} className="text-slate-400" />
            <h2 className="font-semibold text-slate-900 dark:text-white">Technology Stack</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {STACK.map(({ name, desc, color }) => (
              <div key={name} className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
                <p className={`text-sm font-semibold ${color}`}>{name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Annotate Board is not affiliated with any of the above open-source projects. All trademarks belong to their respective owners.
        </p>
      </motion.div>
    </div>
  );
}
