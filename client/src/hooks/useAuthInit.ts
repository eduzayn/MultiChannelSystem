import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

export const useAuthInit = () => {
  const { setUser, logout } = useAuthStore();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (!token && location !== '/login') {
        logout();
        setLocation('/login');
        return;
      }

      if (token && location === '/login') {
        try {
          const response = await api.get('/auth/me');
          const user = response.data;
          setUser(user);
          setLocation('/');
        } catch (error) {
          logout();
        }
        return;
      }

      if (token) {
        try {
          const response = await api.get('/auth/me');
          const user = response.data;
          setUser(user);
        } catch (error) {
          logout();
          setLocation('/login');
        }
      }
    };

    initializeAuth();
  }, [setUser, logout, setLocation, location]);
};
