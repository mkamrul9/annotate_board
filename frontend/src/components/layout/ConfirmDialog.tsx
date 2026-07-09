'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning';
  loading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  const isDanger = variant === 'danger';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
          >
            {/* Top accent bar */}
            <div className={`h-1 w-full ${isDanger ? 'bg-gradient-to-r from-red-500 to-rose-500' : 'bg-gradient-to-r from-amber-400 to-yellow-500'}`} />

            <div className="p-6">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
              >
                <X size={18} />
              </button>

              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isDanger ? 'bg-red-100 dark:bg-red-500/15' : 'bg-amber-100 dark:bg-amber-500/15'}`}>
                <AlertTriangle size={22} className={isDanger ? 'text-red-500' : 'text-amber-500'} />
              </div>

              {/* Content */}
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5">
                {title}
              </h3>
              {description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {description}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition disabled:opacity-60 disabled:cursor-not-allowed ${
                    isDanger
                      ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25'
                      : 'bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/25'
                  }`}
                >
                  {loading ? 'Please wait...' : confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
