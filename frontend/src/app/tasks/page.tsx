'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useTaskStore, TaskStatus, Task } from '@/store/useTaskStore';
import DateSelector from '@/components/tasks/DateSelector';
import Column from '@/components/tasks/Column';
import TaskModal from '@/components/tasks/TaskModal';
import { Plus, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import VoiceInput from '@/components/tasks/VoiceInput';
import { motion } from 'framer-motion';

const TaskSkeleton = () => (
  <div className="p-4 mb-3 rounded-lg border border-slate-800 bg-slate-900 shadow-md animate-pulse">
    <div className="h-5 bg-slate-800 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-slate-800 rounded w-1/4 mb-4"></div>
    <div className="flex gap-2">
      <div className="h-6 bg-slate-800 rounded w-16"></div>
      <div className="h-6 bg-slate-800 rounded w-16"></div>
    </div>
  </div>
);

function SyncIndicator({ status }: { status: 'idle' | 'syncing' | 'error' }) {
  if (status === 'syncing') {
    return <span className="flex items-center gap-1 text-xs text-indigo-400"><RefreshCw size={14} className="animate-spin" /> Saving...</span>;
  }
  if (status === 'error') {
    return <span className="flex items-center gap-1 text-xs text-red-400"><CloudOff size={14} /> Offline</span>;
  }
  return <span className="flex items-center gap-1 text-xs text-slate-500"><Cloud size={14} /> Synced</span>;
}

export default function TasksPage() {
  const { tasks, fetchTasks, moveTask, loading, syncStatus } = useTaskStore();
  const [mounted, setMounted] = useState(false); // Prevents hydration errors with DnD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchTasks();
  }, [fetchTasks]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // The droppableId is our new status (TODO, IN_PROGRESS, DONE)
    moveTask(parseInt(draggableId), destination.droppableId as TaskStatus);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  if (!mounted) return null; 

  const columns: { id: TaskStatus; title: string }[] = [
    { id: 'TODO', title: 'To Do' },
    { id: 'IN_PROGRESS', title: 'In Progress' },
    { id: 'DONE', title: 'Done' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">Daily Tasks</h1>
              <SyncIndicator status={syncStatus} />
            </div>
            <p className="text-slate-400">Manage your workload efficiently.</p>
          </div>
          <div className="flex items-center gap-4">
            <VoiceInput />
            <button 
              onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              <Plus size={18} /> New Task
            </button>
            <DateSelector />
          </div>
        </header>

        <DragDropContext onDragEnd={onDragEnd}>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {columns.map((col) => (
              <motion.div key={col.id} variants={itemVariants} className="flex flex-col">
                <Column 
                  id={col.id} 
                  title={col.title} 
                  tasks={tasks.filter((t) => t.status === col.id)} 
                  onEditTask={handleEditTask}
                />
                {loading && (
                  <div className="mt-4 space-y-3 px-2">
                    <TaskSkeleton />
                    <TaskSkeleton />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </DragDropContext>
      </div>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        existingTask={editingTask} 
      />
    </div>
  );
}
