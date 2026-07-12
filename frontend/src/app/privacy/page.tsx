'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <ShieldCheck size={24} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Privacy Policy</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Last updated: July 2026</p>
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Data We Collect</h2>
            <p>Annotate Board collects only the information you provide: your username (no email required), and the images and annotations you create within the app. We do not collect analytics, sell data to third parties, or use tracking cookies.</p>
          </section>

          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">How We Store It</h2>
            <p>All data is stored on a PostgreSQL database hosted on Render. Uploaded images are stored on the server filesystem. We use industry-standard encryption for data in transit (HTTPS/TLS).</p>
          </section>

          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Your Rights</h2>
            <p>You may delete your account and all associated data at any time by contacting us. We will process deletion requests within 7 days.</p>
          </section>

          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Contact</h2>
            <p>For privacy requests, contact us at <a href="mailto:privacy@annotateboard.dev" className="text-indigo-500 hover:underline">privacy@annotateboard.dev</a>.</p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
