import { create } from 'zustand';
import { format } from 'date-fns';
import api from '@/lib/api';
import { toast } from 'sonner';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: number;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string;
  tags: string[];
  annotation_image?: number | null;
  image_url?: string | null;
}

interface TaskState {
  tasks: Task[];
  selectedDate: string;
  loading: boolean;
  syncStatus: 'idle' | 'syncing' | 'error';
  setSelectedDate: (date: string) => void;
  fetchTasks: () => Promise<void>;
  moveTask: (taskId: number, newStatus: TaskStatus) => Promise<void>;
  addTask: (taskData: Partial<Task>) => Promise<void>;
  updateTask: (taskId: number, taskData: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  selectedDate: format(new Date(), 'yyyy-MM-dd'),
  loading: false,
  syncStatus: 'idle',

  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
    get().fetchTasks(); // Auto-fetch when date changes
  },

  fetchTasks: async () => {
    set({ loading: true });
    try {
      const { selectedDate } = get();
      const response = await api.get(`tasks/?due_date=${selectedDate}`);
      set({ tasks: response.data, loading: false });
    } catch (error) {
      console.error('Failed to fetch tasks', error);
      toast.error('Failed to load tasks');
      set({ loading: false });
    }
  },

  moveTask: async (taskId: number, newStatus: TaskStatus) => {
    const originalTasks = get().tasks;
    
    // Optimistic Update: Update UI instantly
    set({
      syncStatus: 'syncing',
      tasks: originalTasks.map((t) => 
        t.id === taskId ? { ...t, status: newStatus } : t
      )
    });

    try {
      // Background API request
      await api.patch(`tasks/${taskId}/`, { status: newStatus });
      set({ syncStatus: 'idle' });
      toast.success('Task updated');
    } catch (error) {
      // Rollback if the API fails
      console.error('Failed to update task status', error);
      toast.error('Failed to update task status');
      set({ tasks: originalTasks, syncStatus: 'error' });
    }
  },

  addTask: async (taskData) => {
    const { selectedDate, fetchTasks } = get();
    try {
      set({ syncStatus: 'syncing' });
      // Merge the selected date automatically so tasks drop into the current view
      await api.post('tasks/', { ...taskData, due_date: selectedDate });
      await fetchTasks(); // Re-fetch to get the assigned ID from the backend
      set({ syncStatus: 'idle' });
      toast.success('Task created');
    } catch (error) {
      console.error('Failed to add task', error);
      toast.error('Failed to create task');
      set({ syncStatus: 'error' });
    }
  },

  updateTask: async (taskId, taskData) => {
    const originalTasks = get().tasks;
    // Optimistic UI update
    set({ syncStatus: 'syncing', tasks: originalTasks.map((t) => t.id === taskId ? { ...t, ...taskData } : t) as Task[] });
    try {
      await api.patch(`tasks/${taskId}/`, taskData);
      set({ syncStatus: 'idle' });
      toast.success('Task saved');
    } catch (error) {
      set({ tasks: originalTasks, syncStatus: 'error' });
      console.error('Failed to update task', error);
      toast.error('Failed to save task');
    }
  },

  deleteTask: async (taskId) => {
    const originalTasks = get().tasks;
    set({ syncStatus: 'syncing', tasks: originalTasks.filter((t) => t.id !== taskId) });
    try {
      await api.delete(`tasks/${taskId}/`);
      set({ syncStatus: 'idle' });
      toast.success('Task deleted');
    } catch (error) {
      set({ tasks: originalTasks, syncStatus: 'error' });
      console.error('Failed to delete task', error);
      toast.error('Failed to delete task');
    }
  },
}));
