import { create } from 'zustand';

interface User {
  id: string;
  username: string;
  role: 'Admin' | 'Worker';
}

interface AuthState {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
