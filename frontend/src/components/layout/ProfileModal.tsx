import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/store/useTaskStore';
import { useAnnotationStore } from '@/store/useAnnotationStore';
import { useAuthStore } from '@/store/useAuthStore';
import { User, CheckCircle, Image as ImageIcon, LogOut, X } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { tasks } = useTaskStore();
  const { images } = useAnnotationStore();
  const { logout, compactMode, toggleCompactMode } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'stats' | 'settings'>('stats');
  const [autoSave, setAutoSave] = useState(true);

  // Quick stats derived from client state
  const completedTasks = tasks.filter(t => t.status === 'DONE').length;
  const totalAnnotations = images.reduce((acc, img) => acc + img.polygons.length, 0);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-slate-900 border border-slate-700 rounded-xl w-full max-w-sm shadow-2xl overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition z-10"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-4 p-6 pb-4 bg-slate-950/30">
              <div className="w-16 h-16 bg-indigo-600/20 text-indigo-400 rounded-full flex items-center justify-center border border-indigo-500/30">
                <User size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Demo User</h2>
                <p className="text-sm text-slate-400">Lead Radiologist</p>
              </div>
            </div>

            {/* Tabs Header */}
            <div className="flex border-b border-slate-800 bg-slate-950/50">
              <button 
                onClick={() => setActiveTab('stats')} 
                className={`flex-1 py-3 text-sm font-medium ${activeTab === 'stats' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Overview
              </button>
              <button 
                onClick={() => setActiveTab('settings')} 
                className={`flex-1 py-3 text-sm font-medium ${activeTab === 'settings' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Preferences
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'stats' ? (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-center">
                    <CheckCircle className="mx-auto mb-2 text-green-400" size={24} />
                    <div className="text-2xl font-bold text-white">{completedTasks}</div>
                    <div className="text-xs text-slate-500">Tasks Done</div>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-center">
                    <ImageIcon className="mx-auto mb-2 text-purple-400" size={24} />
                    <div className="text-2xl font-bold text-white">{totalAnnotations}</div>
                    <div className="text-xs text-slate-500">Shapes Drawn</div>
                  </div>
                </div>
              ) : (
                <div className="mb-6 space-y-3">
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

                  <label className="flex items-center justify-between bg-slate-950 border border-slate-800 p-3 rounded-xl cursor-pointer hover:border-slate-700 transition">
                    <div>
                      <span className="block text-sm font-medium text-white">Auto-Save Annotations</span>
                      <span className="block text-xs text-slate-500 mt-0.5">Save after every shape drawn</span>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${autoSave ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${autoSave ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                    <input type="checkbox" className="hidden" checked={autoSave} onChange={(e) => setAutoSave(e.target.checked)} />
                  </label>
                </div>
              )}

              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition font-medium">
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
