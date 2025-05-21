import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { socketClient, ServerEventTypes, NotificationEvent } from '@/lib/socketClient';
import { useToast } from '@/hooks/use-toast';

// Interface para o contexto do Socket
interface SocketContextType {
  isConnected: boolean;
  isReconnecting: boolean;
  subscribe: (event: ServerEventTypes | string, callback: Function) => () => void;
  joinConversation: (conversationId: number) => void;
  leaveConversation: (conversationId: number) => void;
  sendTyping: (conversationId: number, userId: string, userName: string) => void;
  sendStopTyping: (conversationId: number, userId: string) => void;
  markMessagesAsRead: (conversationId: number, userId: string, messageIds: number[]) => void;
}

// Criar o contexto com valor inicial padrão
const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Props para o provedor de contexto
interface SocketProviderProps {
  children: ReactNode;
}

// Provedor do contexto de Socket
export function SocketProvider({ children }: SocketProviderProps) {
  const socketHook = useSocket();
  const { toast } = useToast();

  useEffect(() => {
    // Configurar notificações para eventos de conexão
    const handleConnectionChange = (connected: boolean) => {
      if (connected) {
        toast({
          title: 'Conexão restabelecida',
          description: 'Você está conectado ao servidor em tempo real.',
          duration: 3000,
        });
      } else {
        toast({
          title: 'Conexão perdida',
          description: 'Tentando reconectar ao servidor...',
          duration: 5000,
          variant: 'destructive',
        });
      }
    };

    // Monitorar mudanças no estado de conexão
    let previousState = socketHook.isConnected;
    
    const unsubConnect = socketClient.on('connect', () => {
      if (!previousState) {
        handleConnectionChange(true);
      }
      previousState = true;
    });
    
    const unsubDisconnect = socketClient.on('disconnect', () => {
      if (previousState) {
        handleConnectionChange(false);
      }
      previousState = false;
    });

    // Subscrever para notificações do sistema
    const unsubNotification = socketClient.on(ServerEventTypes.NOTIFICATION, (data: NotificationEvent) => {
      toast({
        title: data.title,
        description: data.message,
        duration: data.duration || 5000,
        variant: data.type === 'error' ? 'destructive' : 'default',
      });
    });

    return () => {
      unsubConnect();
      unsubDisconnect();
      unsubNotification();
    };
  }, [toast, socketHook.isConnected]);

  return (
    <SocketContext.Provider value={socketHook}>
      {children}
    </SocketContext.Provider>
  );
}

// Hook personalizado para usar o contexto de Socket
export function useSocketContext() {
  const context = useContext(SocketContext);
  
  if (context === undefined) {
    throw new Error('useSocketContext deve ser usado dentro de um SocketProvider');
  }
  
  return context;
}