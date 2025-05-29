import { useEffect, useState, useCallback } from 'react';
import { socketClient, ServerEventTypes } from '@/lib/socketClient';

/**
 * Hook para usar a conexão socket de forma reativa em componentes
 * @returns Métodos e estado do socket
 */
export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Inicializa a conexão quando o componente é montado
  useEffect(() => {

    // Configurar ouvintes para eventos de conexão
    const connectListener = () => {
      setIsConnected(true);
      setIsReconnecting(false);
    };
    
    const disconnectListener = () => {
      setIsConnected(false);
    };
    
    const reconnectAttemptListener = () => {
      setIsReconnecting(true);
    };
    
    const reconnectFailedListener = () => {
      setIsReconnecting(false);
    };

    // Registrar ouvintes
    const unsubConnect = socketClient.on('connect', connectListener);
    const unsubDisconnect = socketClient.on('disconnect', disconnectListener);
    const unsubReconnectAttempt = socketClient.on('reconnect_attempt', reconnectAttemptListener);
    const unsubReconnectFailed = socketClient.on('reconnect_failed', reconnectFailedListener);

    return () => {
      // Limpar ouvintes quando o componente é desmontado
      unsubConnect();
      unsubDisconnect();
      unsubReconnectAttempt();
      unsubReconnectFailed();
    };
  }, []);

  // Função para inscrever um componente para receber eventos
  const subscribe = useCallback((event: ServerEventTypes | string, callback: Function) => {
    return socketClient.on(event, callback);
  }, []);

  // Funções para gerenciar a participação em conversas
  const joinConversation = useCallback((conversationId: number) => {
    socketClient.joinConversation(conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId: number) => {
    socketClient.leaveConversation(conversationId);
  }, []);

  // Funções para eventos de digitação
  const sendTyping = useCallback((conversationId: number, userId: string, userName: string) => {
    socketClient.sendTyping(conversationId, userId, userName);
  }, []);

  const sendStopTyping = useCallback((conversationId: number, userId: string) => {
    socketClient.sendStopTyping(conversationId, userId);
  }, []);

  // Função para marcar mensagens como lidas
  const markMessagesAsRead = useCallback((conversationId: number, userId: string, messageIds: number[]) => {
    socketClient.markMessagesAsRead(conversationId, userId, messageIds);
  }, []);

  return {
    isConnected,
    isReconnecting,
    subscribe,
    joinConversation,
    leaveConversation,
    sendTyping,
    sendStopTyping,
    markMessagesAsRead
  };
}
