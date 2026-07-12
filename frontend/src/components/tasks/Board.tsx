'use client';

import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { motion, Variants } from 'framer-motion';
import Column from '@/components/tasks/Column';
import { Task, TaskStatus } from '@/store/useTaskStore';

interface BoardProps {
  filteredTasks: Task[];
  loading: boolean;
  onEditTask: (task: Task) => void;
  onDragEnd: (result: DropResult) => void;
}

const TaskSkeleton = () => (
  <div className="p-4 mb-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm dark:shadow-md animate-pulse">
    <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-3/4 mb-4" />
    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/4 mb-4" />
    <div className="flex gap-2">
      <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-16" />
      <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-16" />
    </div>
  </div>
);

export default function Board({ filteredTasks, loading, onEditTask, onDragEnd }: BoardProps) {
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
              onEditTask={onEditTask}
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
  );
}
