import { Task, TaskStatus } from '@/store/useTaskStore';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import { Inbox, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onEditTask?: (task: Task) => void;
}

const COLUMN_ACCENTS: Record<TaskStatus, { dot: string; header: string; count: string }> = {
  TODO:        { dot: 'bg-slate-400 dark:bg-slate-500',  header: 'text-slate-700 dark:text-slate-300',  count: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' },
  IN_PROGRESS: { dot: 'bg-amber-400 dark:bg-yellow-400', header: 'text-amber-700 dark:text-yellow-300', count: 'bg-amber-50 dark:bg-yellow-500/10 text-amber-600 dark:text-yellow-400' },
  DONE:        { dot: 'bg-emerald-400 dark:bg-green-400',  header: 'text-emerald-700 dark:text-green-300',  count: 'bg-emerald-50 dark:bg-green-500/10 text-emerald-600 dark:text-green-400' },
};

export default function Column({ id, title, tasks, onEditTask }: ColumnProps) {
  const accent = COLUMN_ACCENTS[id];

  return (
    <div className="flex flex-col bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl w-full min-h-[560px] overflow-hidden transition-colors">
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200 dark:border-slate-800/60 bg-white/50 dark:bg-transparent">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${accent.dot}`} />
          <h3 className={`font-semibold text-sm ${accent.header}`}>{title}</h3>
        </div>
        <span className={`text-xs py-0.5 px-2.5 rounded-full font-semibold ${accent.count}`}>
          {tasks.length}
        </span>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-3 transition-colors rounded-b-2xl ${
              snapshot.isDraggingOver
                ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-2 border-dashed border-indigo-300 dark:border-indigo-500/30 border-t-0'
                : ''
            }`}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-36 text-slate-400 dark:text-slate-600"
              >
                <Inbox size={28} className="mb-2 opacity-50" />
                <p className="text-xs">No tasks here</p>
              </motion.div>
            )}

            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} onEdit={onEditTask} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
