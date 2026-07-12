'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, MessageSquare, Clock } from 'lucide-react';

export default function ContactPage() {
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
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Mail size={24} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Contact Us</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">We&apos;re here to help</p>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <MessageSquare size={18} className="text-indigo-400" />
              <h2 className="font-semibold text-slate-900 dark:text-white">General Support</h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">For general questions, bugs, or feature requests:</p>
            <a href="mailto:support@annotateboard.dev" className="text-indigo-500 hover:underline text-sm font-medium">support@annotateboard.dev</a>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Clock size={18} className="text-emerald-400" />
              <h2 className="font-semibold text-slate-900 dark:text-white">Response Time</h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">We typically respond within <span className="text-slate-900 dark:text-white font-medium">24–48 hours</span> on business days.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Mail size={18} className="text-rose-400" />
              <h2 className="font-semibold text-slate-900 dark:text-white">Privacy Requests</h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">For account deletion or privacy-related requests:</p>
            <a href="mailto:privacy@annotateboard.dev" className="text-indigo-500 hover:underline text-sm font-medium">privacy@annotateboard.dev</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
