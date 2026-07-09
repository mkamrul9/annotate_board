import { create } from 'zustand';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  compactMode: boolean;
  login: (token: string) => void;
  logout: () => void;
  toggleCompactMode: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initialize from localStorage if available (runs on client-side)
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,
  compactMode: typeof window !== 'undefined' ? localStorage.getItem('compactMode') === 'true' : false,
  
  login: (token: string) => {
    localStorage.setItem('token', token);
    set({ token, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, isAuthenticated: false });
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
}));
