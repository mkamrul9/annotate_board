'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[App Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full opacity-10 pointer-events-none blur-3xl"
        style={{ background: 'radial-gradient(circle, #ef4444, transparent)' }} />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full opacity-10 pointer-events-none blur-3xl"
        style={{ background: 'radial-gradient(circle, #f97316, transparent)' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-md rounded-2xl p-10 text-center border border-red-500/20"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6 mx-auto">
          <AlertTriangle size={36} className="text-red-400" />
        </div>

        <p className="text-7xl font-black text-white/10 select-none mb-2">500</p>
        <h1 className="text-2xl font-bold text-white mb-3">Something Went Wrong</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-2">
          An unexpected error occurred. We&apos;ve been notified and are working on a fix.
        </p>
        {error?.digest && (
          <p className="text-[11px] text-slate-600 font-mono mb-6">Error ID: {error.digest}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium text-sm transition-all border border-red-500/20"
          >
            <RefreshCw size={16} /> Try Again
          </button>
          <Link
            href="/tasks"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-indigo-900/40"
          >
            <Home size={16} /> Go to Board
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
