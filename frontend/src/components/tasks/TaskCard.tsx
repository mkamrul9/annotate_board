import React from 'react';
import { Task } from '@/store/useTaskStore';
import { Draggable } from '@hello-pangea/dnd';
import Link from 'next/link';
import Image from 'next/image';
import { Microscope } from 'lucide-react';

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
  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onEdit?.(task)}
          className={`p-4 mb-2.5 rounded-xl border bg-slate-900 cursor-pointer select-none transition-all ${
            snapshot.isDragging
              ? 'border-indigo-500 shadow-2xl shadow-indigo-900/30 scale-[1.02] opacity-95 rotate-1'
              : 'border-slate-800 hover:border-slate-700 shadow-sm hover:shadow-md'
          }`}
        >
          {/* Title row */}
          <div className="flex justify-between items-start gap-2 mb-2.5">
            <h4 className="font-semibold text-white text-sm leading-snug">{task.title}</h4>
            <span className={`text-[10px] px-2 py-0.5 rounded-md border flex-shrink-0 font-medium ${PRIORITY_STYLES[task.priority]}`}>
              {task.priority}
            </span>
          </div>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mb-2.5">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Attached scan */}
          {task.image_url && (
            <div
              className="mt-3 pt-3 border-t border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-lg">
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
