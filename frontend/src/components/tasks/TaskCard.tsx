import React from 'react';
import { Task } from '@/store/useTaskStore';
import { Draggable } from '@hello-pangea/dnd';
import Link from 'next/link';
import Image from 'next/image';
import { Microscope, AlertCircle } from 'lucide-react';
import { isBefore, parseISO, startOfToday } from 'date-fns';
import { useAuthStore } from '@/store/useAuthStore';

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit?: (task: Task) => void;
}

const PRIORITY_STYLES = {
  LOW:    'bg-green-500/15 text-green-400 border-green-500/25',
  MEDIUM: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  HIGH:   'bg-red-500/15 text-red-400 border-red-500/25',
} as const;

function TaskCard({ task, index, onEdit }: TaskCardProps) {
  const { compactMode } = useAuthStore();
  const isOverdue = task.status !== 'DONE' && isBefore(parseISO(task.due_date), startOfToday());
  
  const completedSubtasks = task.subtasks?.filter(s => s.done).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progressPercentage = totalSubtasks === 0 ? 0 : (completedSubtasks / totalSubtasks) * 100;

  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onEdit?.(task)}
          className={`mb-2.5 rounded-xl border bg-white dark:bg-slate-900 cursor-pointer select-none transition-all ${
            compactMode ? 'p-2.5' : 'p-4'
          } ${
            snapshot.isDragging
              ? 'border-indigo-500 shadow-2xl scale-[1.02] opacity-95 rotate-1'
              : isOverdue 
                ? 'border-red-400 dark:border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 shadow-sm hover:shadow-lg dark:hover:shadow-md'
          }`}
        >
          {/* Title row */}
          <div className="flex justify-between items-start gap-2 mb-2.5">
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug flex flex-col items-start gap-1">
              <div className="flex items-center gap-1.5">
                {task.title}
              </div>
              {isOverdue && <span className="text-[10px] uppercase font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded animate-pulse">Overdue</span>}
            </h4>
            <span className={`text-[10px] px-2 py-0.5 rounded-md border flex-shrink-0 font-medium ${PRIORITY_STYLES[task.priority]}`}>
              {task.priority}
            </span>
          </div>

          {/* Tags */}
          {!compactMode && task.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mb-2.5">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Subtasks Progress */}
          {totalSubtasks > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Checklist</span>
                <span>{completedSubtasks}/{totalSubtasks}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-500 rounded-full" 
                  style={{ width: `${progressPercentage}%` }} 
                />
              </div>
            </div>
          )}

          {/* Attached scan */}
          {task.image_url && (
            <div
              className={`pt-3 border-t border-slate-100 dark:border-slate-800 ${compactMode ? 'mt-2' : 'mt-3'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={task.image_url}
                      alt="Attached scan thumbnail"
                      fill
                      sizes="32px"
                      className="object-cover opacity-80"
                    />
                  </div>
                  <span className="text-xs text-slate-400 truncate">Scan attached</span>
                </div>

                <Link href={`/annotate?imageId=${task.annotation_image}`}>
                  <button className="flex items-center gap-1 bg-indigo-600/15 text-indigo-400 hover:bg-indigo-600/30 hover:text-indigo-300 px-2.5 py-1 rounded-lg text-xs transition font-medium">
                    <Microscope size={13} /> Annotate
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

export default React.memo(TaskCard);
