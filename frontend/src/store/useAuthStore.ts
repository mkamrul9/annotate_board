import { create } from 'zustand';

interface AuthState {
  token: string | null;
  username: string;
  isAuthenticated: boolean;
  compactMode: boolean;
  autoSave: boolean;
  login: (token: string, username?: string) => void;
  logout: () => void;
  toggleCompactMode: () => void;
  toggleAutoSave: (value?: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initialize from localStorage if available (runs on client-side)
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  username: typeof window !== 'undefined' ? localStorage.getItem('username') || '' : '',
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,
  compactMode: typeof window !== 'undefined' ? localStorage.getItem('compactMode') === 'true' : false,
  autoSave: typeof window !== 'undefined' ? localStorage.getItem('autoSave') !== 'false' : true, // default true
  
  login: (token: string, username?: string) => {
    localStorage.setItem('token', token);
    if (username) localStorage.setItem('username', username);
    set({ token, username: username || '', isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    set({ token: null, username: '', isAuthenticated: false });
  },

  toggleCompactMode: () => {
    set((state) => {
      const newMode = !state.compactMode;
      if (typeof window !== 'undefined') {
        localStorage.setItem('compactMode', newMode.toString());
      }
      return { compactMode: newMode };
    });
  },

  toggleAutoSave: (value?: boolean) => {
    set((state) => {
      const newValue = value !== undefined ? value : !state.autoSave;
      if (typeof window !== 'undefined') {
        localStorage.setItem('autoSave', newValue.toString());
      }
      return { autoSave: newValue };
    });
  },
}));
