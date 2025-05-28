import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

export const useAuthInit = () => {
  const { setUser, logout } = useAuthStore();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        logout();
        setLocation('/login');
        return;
      }

      try {
        const response = await api.get('/auth/me');
        const user = response.data;
        setUser(user);
      } catch (error) {
        logout();
        setLocation('/login');
      }
    };

    initializeAuth();
  }, [setUser, logout, setLocation]);
};
