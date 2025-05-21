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
  user: {
    id: '1',
    name: 'Ana Silva',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    role: userRoles.ADMIN,
  },
  isAuthenticated: true,
  isLoading: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
