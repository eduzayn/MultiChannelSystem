import { create } from 'zustand';
import { userRoles, type UserRole } from '@/lib/utils';

type User = {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  login: (user) => set({ user, isAuthenticated: true, isLoading: false }),
  logout: () => {
    localStorage.removeItem('auth_token');
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));
