'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useTaskStore, TaskStatus, Task } from '@/store/useTaskStore';
import DateSelector from '@/components/tasks/DateSelector';
import Column from '@/components/tasks/Column';
import TaskModal from '@/components/tasks/TaskModal';
import { Plus, Mic } from 'lucide-react';

const TaskSkeleton = () => (
  <div className="p-4 mb-3 rounded-lg border border-slate-800 bg-slate-900 shadow-md animate-pulse">
    <div className="h-5 bg-slate-800 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-slate-800 rounded w-1/4 mb-4"></div>
    <div className="flex gap-2">
      <div className="h-6 bg-slate-800 rounded w-16"></div>
      <div className="h-6 bg-slate-800 rounded w-16"></div>
    </div>
  </div>
);

export default function TasksPage() {
  const { tasks, fetchTasks, moveTask, addTask, loading } = useTaskStore();
  const [mounted, setMounted] = useState(false); // Prevents hydration errors with DnD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const startListening = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Web Speech API");
      return;
    }
    const recognition = new SpeechRecognition();

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      addTask({ title: transcript, priority: 'HIGH', status: 'TODO', tags: ['voice'] });
    };

    recognition.start();
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
          <div className="flex items-center gap-4">
            <button 
              onClick={startListening}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition border border-slate-700 shadow"
            >
              <Mic size={18} className="text-red-400" /> Speak
            </button>
            <button 
              onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              <Plus size={18} /> New Task
            </button>
            <DateSelector />
          </div>
        </header>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((col) => (
              <div key={col.id} className="flex flex-col">
                <Column 
                  id={col.id} 
                  title={col.title} 
                  tasks={tasks.filter((t) => t.status === col.id)} 
                  onEditTask={handleEditTask}
                />
                {loading && (
                  <div className="mt-4 space-y-3 px-2">
                    <TaskSkeleton />
                    <TaskSkeleton />
                  </div>
                )}
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        existingTask={editingTask} 
      />
    </div>
  );
}
