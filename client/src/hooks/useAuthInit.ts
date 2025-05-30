import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { socketClient } from '@/lib/socketClient';

export const useAuthInit = () => {
  const { setUser, logout, isAuthenticated } = useAuthStore();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          if (location !== '/login') {
            logout();
            setLocation('/login');
          }
          return;
        }

        const response = await api.get('/auth/me');
        const user = response.data;
        setUser(user);
        
        if (location === '/login') {
          setLocation('/');
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        logout();
        if (location !== '/login') {
          setLocation('/login');
        }
      }
    };

    initializeAuth();
  }, [setUser, logout, setLocation, location]);

  useEffect(() => {
    if (isAuthenticated) {
      socketClient.init();
    } else {
      socketClient.disconnect();
    }
    
    return () => {
      socketClient.disconnect();
    };
  }, [isAuthenticated]);
};
