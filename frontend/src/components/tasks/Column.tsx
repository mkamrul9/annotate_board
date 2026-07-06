import { Task } from '@/store/useTaskStore';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

interface ColumnProps {
  id: string;
  title: string;
  tasks: Task[];
}

export default function Column({ id, title, tasks }: ColumnProps) {
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
            className={`flex-1 transition-colors rounded-lg ${
              snapshot.isDraggingOver ? 'bg-slate-900/50 border-2 border-dashed border-indigo-500/50' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
