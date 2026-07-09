import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

interface ProfileStats {
  total_tasks: number;
  completed_tasks: number;
  annotated_scans: number;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(false);
  const { compactMode, toggleCompactMode, logout } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.get('/api/tasks/stats/')
        .then(res => setStats(res.data))
        .catch(err => console.error("Failed to load stats", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', bounce: 0.3, duration: 0.45 }}
            className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <User size={20} className="text-indigo-400" /> My Profile
              </h2>
              <button
                onClick={onClose}
                className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-indigo-400 text-2xl font-bold">
                  RD
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Radiologist</h3>
                  <p className="text-sm text-slate-400">VAI Assessment User</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-inner">
                  <CheckCircle2 size={24} className="text-green-400 mb-2" />
                  <span className="text-2xl font-black text-white">
                    {loading ? '...' : stats?.completed_tasks ?? 0}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Tasks Done</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-inner">
                  <ImageIcon size={24} className="text-blue-400 mb-2" />
                  <span className="text-2xl font-black text-white">
                    {loading ? '...' : stats?.annotated_scans ?? 0}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Scans Annotated</span>
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-300">Preferences</h4>
                
                <label className="flex items-center justify-between bg-slate-950 border border-slate-800 p-3 rounded-xl cursor-pointer hover:border-slate-700 transition">
                  <div>
                    <span className="block text-sm font-medium text-white">Compact Mode</span>
                    <span className="block text-xs text-slate-500 mt-0.5">Reduce padding on Kanban cards</span>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${compactMode ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${compactMode ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                  <input type="checkbox" className="hidden" checked={compactMode} onChange={toggleCompactMode} />
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button 
                  onClick={logout}
                  className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 font-medium hover:bg-red-500/10 transition"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
