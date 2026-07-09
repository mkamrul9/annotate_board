import { useState, useEffect } from 'react';
import { Task, useTaskStore } from '@/store/useTaskStore';
import { useAnnotationStore } from '@/store/useAnnotationStore';
import { X, Trash2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingTask?: Task | null;
}

export default function TaskModal({ isOpen, onClose, existingTask }: TaskModalProps) {
  const { addTask, updateTask, deleteTask } = useTaskStore();
  const { images, fetchImages } = useAnnotationStore();

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('MEDIUM');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<number | ''>('');
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; done: boolean }[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch images when modal opens so the dropdown is populated
  useEffect(() => {
    if (isOpen && images.length === 0) fetchImages();
  }, [isOpen, fetchImages, images.length]);

  // Populate form when editing an existing task
  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setPriority(existingTask.priority);
      setTagsInput(existingTask.tags.join(', '));
      setSelectedImage(existingTask.annotation_image ?? '');
      setSubtasks(existingTask.subtasks || []);
    } else {
      setTitle('');
      setPriority('MEDIUM');
      setTagsInput('');
      setSelectedImage('');
      setSubtasks([]);
    }
  }, [existingTask, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    const annotation_image = selectedImage === '' ? null : selectedImage;

    if (existingTask) {
      await updateTask(existingTask.id, { title, priority, tags, annotation_image, subtasks });
    } else {
      await addTask({ title, priority, status: 'TODO', tags, annotation_image, subtasks });
    }
    setSubmitting(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!existingTask) return;
    if (!window.confirm(`Delete "${existingTask.title}"? This cannot be undone.`)) return;
    await deleteTask(existingTask.id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', bounce: 0.3, duration: 0.45 }}
            className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {existingTask ? 'Edit Task' : 'New Task'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {existingTask ? 'Update task details below' : 'Add a new task to your board'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="task-title" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  id="task-title"
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Review CT scan for patient #4821"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none"
                />
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="task-priority" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['LOW', 'MEDIUM', 'HIGH'] as Task['priority'][]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        priority === p
                          ? p === 'LOW'
                            ? 'bg-green-500/20 border-green-500/50 text-green-400'
                            : p === 'MEDIUM'
                            ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                            : 'bg-red-500/20 border-red-500/50 text-red-400'
                          : 'bg-slate-800/60 border-slate-700 text-slate-500 hover:border-slate-600'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="task-tags" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Tags <span className="text-slate-500 font-normal">(comma separated)</span>
                </label>
                <input
                  id="task-tags"
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="urgent, ct-scan, follow-up"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none"
                />
              </div>

              {/* Subtasks */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Subtasks
                </label>
                <div className="space-y-2 mb-2">
                  {subtasks.map((st, i) => (
                    <div key={st.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={st.done}
                        onChange={(e) => {
                          const updated = [...subtasks];
                          updated[i].done = e.target.checked;
                          setSubtasks(updated);
                        }}
                        className="accent-indigo-500 w-4 h-4 rounded bg-slate-900 border-slate-700 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={st.title}
                        onChange={(e) => {
                          const updated = [...subtasks];
                          updated[i].title = e.target.value;
                          setSubtasks(updated);
                        }}
                        className="flex-1 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 text-sm text-slate-300 px-1 py-0.5 outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setSubtasks(subtasks.filter(s => s.id !== st.id))}
                        className="text-slate-500 hover:text-red-400 p-1 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newSubtask.trim()) {
                          setSubtasks([...subtasks, { id: Math.random().toString(36).substr(2, 9), title: newSubtask.trim(), done: false }]);
                          setNewSubtask('');
                        }
                      }
                    }}
                    placeholder="Add a subtask..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-sm placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSubtask.trim()) {
                        setSubtasks([...subtasks, { id: Math.random().toString(36).substr(2, 9), title: newSubtask.trim(), done: false }]);
                        setNewSubtask('');
                      }
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm transition"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Attach scan */}
              <div>
                <label htmlFor="task-image" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Attach Scan <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                <select
                  id="task-image"
                  value={selectedImage}
                  onChange={(e) => setSelectedImage(Number(e.target.value) || '')}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none"
                >
                  <option value="">— No image attached —</option>
                  {images.map((img) => (
                    <option key={img.id} value={img.id}>
                      Image #{img.id} ({img.polygons.length} annotation{img.polygons.length !== 1 ? 's' : ''})
                    </option>
                  ))}
                </select>
              </div>

              {/* Footer actions */}
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-800">
                {existingTask ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex items-center gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg text-sm transition"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                ) : (
                  <div />
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-900/30"
                >
                  {submitting ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <Save size={14} />
                  )}
                  {existingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
