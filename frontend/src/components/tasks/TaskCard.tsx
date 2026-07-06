import { Task } from '@/store/useTaskStore';
import { Draggable } from '@hello-pangea/dnd';

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit?: (task: Task) => void;
}

export default function TaskCard({ task, index, onEdit }: TaskCardProps) {
  const priorityColors = {
    LOW: 'bg-green-500/20 text-green-400 border-green-500/30',
    MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    HIGH: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onEdit && onEdit(task)}
          className={`p-4 mb-3 rounded-lg border bg-slate-900 transition-all cursor-pointer ${
            snapshot.isDragging ? 'border-indigo-500 shadow-2xl scale-105 opacity-90' : 'border-slate-800 hover:border-slate-700 shadow-md'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-white">{task.title}</h4>
          </div>
          <span className={`text-xs px-2 py-1 rounded-md border ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          {task.tags.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {task.tags.map((tag) => (
                <span key={tag} className="text-xs text-slate-400 bg-slate-950 px-2 py-1 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
