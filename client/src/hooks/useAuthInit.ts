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
      const token = localStorage.getItem('auth_token');
      
      if (!token && location !== '/login') {
        logout();
        setLocation('/login');
        return;
      }

      if (token) {
        try {
          const response = await api.get('/auth/me');
          const user = response.data;
          setUser(user);
          
          if (location === '/login') {
            setTimeout(() => {
              setLocation('/');
            }, 100);
          }
        } catch (error) {
          console.error('Erro ao verificar usuário:', error);
          logout();
          setLocation('/login');
        }
      }
    };

    initializeAuth();
  }, [setUser, logout, setLocation, location]);

  useEffect(() => {
    let socketInitTimeout: NodeJS.Timeout;

    if (isAuthenticated) {
      console.log('Usuário autenticado, inicializando socket');
      socketInitTimeout = setTimeout(() => {
        socketClient.init();
      }, 500);
    } else {
      console.log('Usuário não autenticado, desconectando socket');
      socketClient.disconnect();
    }
    
    return () => {
      if (socketInitTimeout) {
        clearTimeout(socketInitTimeout);
      }
      socketClient.disconnect();
    };
  }, [isAuthenticated]);
};
