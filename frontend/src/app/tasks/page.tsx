'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DropResult } from '@hello-pangea/dnd';
import { useTaskStore, TaskStatus, Task } from '@/store/useTaskStore';
import { useAuthStore } from '@/store/useAuthStore';
import DateSelector from '@/components/tasks/DateSelector';
import Board from '@/components/tasks/Board';
import TaskModal from '@/components/tasks/TaskModal';
import { Plus, Cloud, CloudOff, RefreshCw, Search, CheckCircle2, Clock, ListTodo } from 'lucide-react';
import VoiceInput from '@/components/tasks/VoiceInput';

// ── Sync indicator ───────────────────────────────────────────────────────────

function SyncIndicator({ status }: { status: 'idle' | 'syncing' | 'error' }) {
  if (status === 'syncing') {
    return (
      <span className="flex items-center gap-1 text-xs text-indigo-500 dark:text-indigo-400">
        <RefreshCw size={13} className="animate-spin" /> Saving…
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
        <CloudOff size={13} /> Offline
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
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
        { label: 'To Do', count: todo, icon: ListTodo, color: 'text-slate-500 dark:text-slate-400' },
        { label: 'In Progress', count: inProgress, icon: Clock, color: 'text-amber-500 dark:text-yellow-400' },
        { label: 'Completed', count: done, icon: CheckCircle2, color: 'text-emerald-500 dark:text-green-400' },
        { label: 'Progress', count: `${progress}%`, icon: RefreshCw, color: 'text-indigo-500 dark:text-indigo-400' },
      ].map(({ label, count, icon: Icon, color }) => (
        <div
          key={label}
          className="bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3 backdrop-blur-sm shadow-sm"
        >
          <Icon size={18} className={color} />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
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
  const { tasks, fetchTasks, moveTask, loading, syncStatus, searchQuery, setSearchQuery } = useTaskStore();

  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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

  return (
    <div className="min-h-full p-6 md:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Daily Tasks</h1>
              <SyncIndicator status={syncStatus} />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Manage your radiology workflow.</p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks or tags..."
                className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none w-64 transition shadow-sm"
              />
            </div>
            
            <VoiceInput />
            <button
              id="new-task-btn"
              onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-indigo-500/20 dark:shadow-indigo-900/30"
            >
              <Plus size={16} /> New Task
            </button>
            <DateSelector />
          </div>
        </header>

        {/* Stats */}
        {tasks.length > 0 && <StatsBar tasks={tasks} />}

        {/* Kanban Board */}
        <Board
          filteredTasks={filteredTasks}
          loading={loading}
          onEditTask={handleEditTask}
          onDragEnd={onDragEnd}
        />
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        existingTask={editingTask}
      />
    </div>
  );
}
