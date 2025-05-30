import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { socketClient } from '@/lib/socketClient';

export const useAuthInit = () => {
  const { setUser, logout, isAuthenticated } = useAuthStore();
  const [location, setLocation] = useLocation();
  const isMountedRef = useRef(true);
  const initializingRef = useRef(false);

  // Limpeza quando o componente for desmontado
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      // Evitar inicialização duplicada
      if (initializingRef.current) return;
      initializingRef.current = true;

      try {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          if (location !== '/login' && isMountedRef.current) {
            logout();
            // Usar setTimeout para evitar conflito com o ciclo de renderização
            setTimeout(() => {
              if (isMountedRef.current) {
                setLocation('/login');
              }
            }, 0);
          }
          initializingRef.current = false;
          return;
        }

        const response = await api.get('/auth/me');
        if (!isMountedRef.current) {
          initializingRef.current = false;
          return;
        }
        
        const user = response.data;
        setUser(user);
        
        if (location === '/login' && isMountedRef.current) {
          // Usar setTimeout para evitar conflito com o ciclo de renderização
          setTimeout(() => {
            if (isMountedRef.current) {
              setLocation('/');
            }
          }, 0);
        }
      } catch (error) {
        if (!isMountedRef.current) {
          initializingRef.current = false;
          return;
        }

        console.error('Erro ao verificar autenticação:', error);
        logout();
        
        if (location !== '/login' && isMountedRef.current) {
          // Usar setTimeout para evitar conflito com o ciclo de renderização
          setTimeout(() => {
            if (isMountedRef.current) {
              setLocation('/login');
            }
          }, 0);
        }
      } finally {
        initializingRef.current = false;
      }
    };

    initializeAuth();
  }, [setUser, logout, setLocation, location]);

  useEffect(() => {
    if (isAuthenticated && isMountedRef.current) {
      socketClient.init();
    } else {
      socketClient.disconnect();
    }
    
    return () => {
      socketClient.disconnect();
    };
  }, [isAuthenticated]);
};
