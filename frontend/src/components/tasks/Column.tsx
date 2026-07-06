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
  TODO:        { dot: 'bg-slate-500',  header: 'text-slate-300',  count: 'bg-slate-800 text-slate-400' },
  IN_PROGRESS: { dot: 'bg-yellow-400', header: 'text-yellow-300', count: 'bg-yellow-500/10 text-yellow-400' },
  DONE:        { dot: 'bg-green-400',  header: 'text-green-300',  count: 'bg-green-500/10 text-green-400' },
};

export default function Column({ id, title, tasks, onEditTask }: ColumnProps) {
  const accent = COLUMN_ACCENTS[id];

  return (
    <div className="flex flex-col bg-slate-950/40 border border-slate-800 rounded-2xl w-full min-h-[560px] overflow-hidden">
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800/60">
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
                ? 'bg-indigo-950/20 border-2 border-dashed border-indigo-500/30 border-t-0'
                : ''
            }`}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-36 text-slate-600"
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
