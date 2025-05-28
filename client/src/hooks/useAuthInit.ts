import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

export const useAuthInit = () => {
  const { setUser, logout } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        logout();
        return;
      }

      try {
        const response = await api.get('/auth/me');
        const user = response.data;
        setUser(user);
      } catch (error) {
        logout();
      }
    };

    initializeAuth();
  }, [setUser, logout]);
};
