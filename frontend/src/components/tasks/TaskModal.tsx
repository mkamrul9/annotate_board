import { useState, useEffect } from 'react';
import { Task, useTaskStore } from '@/store/useTaskStore';
import { useAnnotationStore } from '@/store/useAnnotationStore';
import { X, Trash } from 'lucide-react';

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

  // Fetch images when modal opens so the dropdown is populated
  useEffect(() => {
    if (isOpen && images.length === 0) fetchImages();
  }, [isOpen, fetchImages, images.length]);

  // Populate form if editing
  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setPriority(existingTask.priority);
      setTagsInput(existingTask.tags.join(', '));
      setSelectedImage(existingTask.annotation_image || '');
    } else {
      setTitle('');
      setPriority('MEDIUM');
      setTagsInput('');
      setSelectedImage('');
    }
  }, [existingTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    const annotation_image = selectedImage === '' ? null : selectedImage;
    
    if (existingTask) {
      await updateTask(existingTask.id, { title, priority, tags, annotation_image });
    } else {
      await addTask({ title, priority, status: 'TODO', tags, annotation_image });
    }
    onClose();
  };

  const handleDelete = async () => {
    if (existingTask) {
      await deleteTask(existingTask.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">{existingTask ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Title</label>
            <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:border-indigo-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value as Task['priority'])} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:border-indigo-500 outline-none">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Tags (comma separated)</label>
            <input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="urgent, frontend, bug" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:border-indigo-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Attach Scan (Optional)</label>
            <select 
              value={selectedImage} 
              onChange={(e) => setSelectedImage(Number(e.target.value) || '')} 
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:border-indigo-500 outline-none"
            >
              <option value="">-- No image attached --</option>
              {images.map((img) => (
                <option key={img.id} value={img.id}>Image #{img.id}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-between pt-4 mt-6 border-t border-slate-800">
            {existingTask ? (
              <button type="button" onClick={handleDelete} className="text-red-400 hover:text-red-300 flex items-center gap-1 text-sm"><Trash size={16}/> Delete</button>
            ) : <div />}
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-md font-medium transition-colors">
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
