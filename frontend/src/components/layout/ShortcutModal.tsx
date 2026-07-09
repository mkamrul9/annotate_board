import { motion, AnimatePresence } from 'framer-motion';
import { X, Command, MousePointerClick, Undo2 } from 'lucide-react';

export default function ShortcutModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-slate-900 border border-slate-700 rounded-xl w-full max-w-sm shadow-2xl p-6"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
              <Command className="text-indigo-400" />
              <h2 className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <Undo2 size={16} className="text-slate-500" /> Undo last point
                </div>
                <div className="flex gap-1">
                  <kbd className="bg-slate-800 px-2 py-1 rounded text-slate-300 font-mono text-xs border border-slate-700">Ctrl</kbd>
                  <span className="text-slate-500">+</span>
                  <kbd className="bg-slate-800 px-2 py-1 rounded text-slate-300 font-mono text-xs border border-slate-700">Z</kbd>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <MousePointerClick size={16} className="text-slate-500" /> Toggle Draw Mode
                </div>
                <kbd className="bg-slate-800 px-2 py-1 rounded text-slate-300 font-mono text-xs border border-slate-700">M</kbd>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <X size={16} className="text-slate-500" /> Cancel drawing
                </div>
                <kbd className="bg-slate-800 px-2 py-1 rounded text-slate-300 font-mono text-xs border border-slate-700">Esc</kbd>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <Command size={16} className="text-slate-500" /> Open cheat sheet
                </div>
                <div className="flex gap-1">
                  <kbd className="bg-slate-800 px-2 py-1 rounded text-slate-300 font-mono text-xs border border-slate-700">Shift</kbd>
                  <span className="text-slate-500">+</span>
                  <kbd className="bg-slate-800 px-2 py-1 rounded text-slate-300 font-mono text-xs border border-slate-700">?</kbd>
                </div>
              </div>
            </div>
            
            <button onClick={onClose} className="w-full mt-8 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition font-medium text-sm">
              Got it
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
