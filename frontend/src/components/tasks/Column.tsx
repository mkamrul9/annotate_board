import { Task } from '@/store/useTaskStore';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import { Inbox } from 'lucide-react';
import { motion } from 'framer-motion';

interface ColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onEditTask?: (task: Task) => void;
}

export default function Column({ id, title, tasks, onEditTask }: ColumnProps) {
  return (
    <div className="flex flex-col bg-slate-950/50 border border-slate-800 rounded-xl w-full min-h-[600px] p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-300">{title}</h3>
        <span className="bg-slate-800 text-slate-400 text-xs py-1 px-3 rounded-full font-semibold">
          {tasks.length}
        </span>
      </div>
      
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 transition-colors rounded-lg p-2 ${
              snapshot.isDraggingOver ? 'bg-slate-900/50 border-2 border-dashed border-indigo-500/50' : ''
            }`}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-40 text-slate-500 opacity-60"
              >
                <Inbox size={32} className="mb-2" />
                <p className="text-sm">No tasks here</p>
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
