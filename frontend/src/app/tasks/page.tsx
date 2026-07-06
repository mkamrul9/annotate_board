'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useTaskStore, TaskStatus, Task } from '@/store/useTaskStore';
import { useAuthStore } from '@/store/useAuthStore';
import DateSelector from '@/components/tasks/DateSelector';
import Column from '@/components/tasks/Column';
import TaskModal from '@/components/tasks/TaskModal';
import { Plus, Cloud, CloudOff, RefreshCw, Search, CheckCircle2, Clock, ListTodo } from 'lucide-react';
import VoiceInput from '@/components/tasks/VoiceInput';
import { motion, Variants } from 'framer-motion';

// ── Skeleton ────────────────────────────────────────────────────────────────

const TaskSkeleton = () => (
  <div className="p-4 mb-3 rounded-lg border border-slate-800 bg-slate-900 shadow-md animate-pulse">
    <div className="h-5 bg-slate-800 rounded w-3/4 mb-4" />
    <div className="h-4 bg-slate-800 rounded w-1/4 mb-4" />
    <div className="flex gap-2">
      <div className="h-6 bg-slate-800 rounded w-16" />
      <div className="h-6 bg-slate-800 rounded w-16" />
    </div>
  </div>
);

// ── Sync indicator ───────────────────────────────────────────────────────────

function SyncIndicator({ status }: { status: 'idle' | 'syncing' | 'error' }) {
  if (status === 'syncing') {
    return (
      <span className="flex items-center gap-1 text-xs text-indigo-400">
        <RefreshCw size={13} className="animate-spin" /> Saving…
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="flex items-center gap-1 text-xs text-red-400">
        <CloudOff size={13} /> Offline
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs text-slate-500">
      <Cloud size={13} /> Synced
    </span>
  );
}

// ── Stats card ───────────────────────────────────────────────────────────────

function StatsBar({ tasks }: { tasks: Task[] }) {
  const done = tasks.filter((t) => t.status === 'DONE').length;
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const todo = tasks.filter((t) => t.status === 'TODO').length;
  const total = tasks.length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {[
        { label: 'To Do', count: todo, icon: ListTodo, color: 'text-slate-400' },
        { label: 'In Progress', count: inProgress, icon: Clock, color: 'text-yellow-400' },
        { label: 'Completed', count: done, icon: CheckCircle2, color: 'text-green-400' },
        { label: 'Progress', count: `${progress}%`, icon: RefreshCw, color: 'text-indigo-400' },
      ].map(({ label, count, icon: Icon, color }) => (
        <div
          key={label}
          className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3"
        >
          <Icon size={18} className={color} />
          <div>
            <p className="text-xs text-slate-500">{label}</p>
            <p className={`text-lg font-bold ${color}`}>{count}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TasksPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { tasks, fetchTasks, moveTask, loading, syncStatus } = useTaskStore();

  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    setMounted(true);
    fetchTasks();
  }, [fetchTasks]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    moveTask(parseInt(draggableId), destination.droppableId as TaskStatus);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Filter tasks by search query (title or tags)
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [tasks, searchQuery]);

  if (!mounted || !isAuthenticated) return null;

  const columns: { id: TaskStatus; title: string }[] = [
    { id: 'TODO', title: 'To Do' },
    { id: 'IN_PROGRESS', title: 'In Progress' },
    { id: 'DONE', title: 'Done' },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } },
  };

  return (
    <div className="min-h-full bg-slate-950 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">Daily Tasks</h1>
              <SyncIndicator status={syncStatus} />
            </div>
            <p className="text-slate-500 text-sm mt-0.5">Manage your radiology workflow.</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <VoiceInput />
            <button
              id="new-task-btn"
              onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-indigo-900/30"
            >
              <Plus size={16} /> New Task
            </button>
            <DateSelector />
          </div>
        </header>

        {/* Stats */}
        {tasks.length > 0 && <StatsBar tasks={tasks} />}

        {/* Search bar */}
        <div className="relative mb-5">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title or tag…"
            className="w-full sm:max-w-sm pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none"
          />
        </div>

        {/* Kanban Board */}
        <DragDropContext onDragEnd={onDragEnd}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {columns.map((col) => (
              <motion.div key={col.id} variants={itemVariants} className="flex flex-col">
                <Column
                  id={col.id}
                  title={col.title}
                  tasks={filteredTasks.filter((t) => t.status === col.id)}
                  onEditTask={handleEditTask}
                />
                {loading && (
                  <div className="mt-3 space-y-3 px-1">
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
