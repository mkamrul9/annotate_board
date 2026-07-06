'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useTaskStore, TaskStatus } from '@/store/useTaskStore';
import DateSelector from '@/components/tasks/DateSelector';
import Column from '@/components/tasks/Column';

export default function TasksPage() {
  const { tasks, fetchTasks, moveTask } = useTaskStore();
  const [mounted, setMounted] = useState(false); // Prevents hydration errors with DnD

  useEffect(() => {
    setMounted(true);
    fetchTasks();
  }, [fetchTasks]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // The droppableId is our new status (TODO, IN_PROGRESS, DONE)
    moveTask(parseInt(draggableId), destination.droppableId as TaskStatus);
  };

  if (!mounted) return null; 

  const columns: { id: TaskStatus; title: string }[] = [
    { id: 'TODO', title: 'To Do' },
    { id: 'IN_PROGRESS', title: 'In Progress' },
    { id: 'DONE', title: 'Done' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Daily Tasks</h1>
            <p className="text-slate-400">Manage your workload efficiently.</p>
          </div>
          <DateSelector />
        </header>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((col) => (
              <Column 
                key={col.id} 
                id={col.id} 
                title={col.title} 
                tasks={tasks.filter((t) => t.status === col.id)} 
              />
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
