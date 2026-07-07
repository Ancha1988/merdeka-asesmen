import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  isAllowed: boolean;
  isLoading: boolean;
  setUser: (user: User | null, isAdmin: boolean, isAllowed: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAdmin: false,
  isAllowed: false,
  isLoading: true,
  setUser: (user, isAdmin, isAllowed) => set({ user, isAdmin, isAllowed, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
