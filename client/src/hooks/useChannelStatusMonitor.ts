import { useState, useEffect } from 'react';
import { useSocketContext } from '@/contexts/SocketContext';
import { ServerEventTypes } from '@/lib/socketClient';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

type ChannelType = 'whatsapp' | 'instagram' | 'facebook' | 'email' | 'sms';

interface ChannelStatus {
  channelId: number;
  type: ChannelType;
  isConnected: boolean;
  lastChecked: Date;
  error?: string;
}

/**
 * Hook para monitorar o status dos canais de comunicação em tempo real
 */
export function useChannelStatusMonitor() {
  const [channelStatuses, setChannelStatuses] = useState<Map<number, ChannelStatus>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { subscribe } = useSocketContext();
  const { toast } = useToast();

  // Função para verificar o status de um canal WhatsApp manualmente
  const checkWhatsAppStatus = async (channelId: number, credentials: {
    instanceId: string;
    token: string;
    clientToken?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post('/api/zapi/test-connection', {
        instanceId: credentials.instanceId,
        token: credentials.token,
        clientToken: credentials.clientToken
      });
      
      const isConnected = response.data?.success && response.data?.connected;
      
      // Atualizar o estado local
      setChannelStatuses(prev => {
        const newMap = new Map(prev);
        newMap.set(channelId, {
          channelId,
          type: 'whatsapp',
          isConnected,
          lastChecked: new Date(),
          error: isConnected ? undefined : response.data?.message
        });
        return newMap;
      });
      
      return { success: true, isConnected, message: response.data?.message };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Erro ao verificar status do WhatsApp';
      setError(errorMsg);
      
      // Atualizar o estado local para mostrar desconectado
      setChannelStatuses(prev => {
        const newMap = new Map(prev);
        newMap.set(channelId, {
          channelId,
          type: 'whatsapp',
          isConnected: false,
          lastChecked: new Date(),
          error: errorMsg
        });
        return newMap;
      });
      
      return { success: false, isConnected: false, message: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Efeito para se inscrever em atualizações de status de canais via Socket.IO
  useEffect(() => {
    // Manipulador para eventos de atualização de status de canal
    const handleChannelStatusUpdate = (data: {
      channelId: number;
      type: ChannelType;
      connected: boolean;
      error?: string;
      timestamp: string | Date;
    }) => {
      const { channelId, type, connected, error, timestamp } = data;
      
      // Atualizar o estado local
      setChannelStatuses(prev => {
        const newMap = new Map(prev);
        const oldStatus = newMap.get(channelId);
        
        // Verificar se o status realmente mudou para evitar notificações duplicadas
        const statusChanged = !oldStatus || oldStatus.isConnected !== connected;
        
        if (statusChanged) {
          // Mostrar notificação de mudança de status
          toast({
            title: `Canal ${type} ${connected ? 'conectado' : 'desconectado'}`,
            description: connected 
              ? `O canal ${channelId} foi conectado com sucesso.` 
              : `O canal ${channelId} foi desconectado. ${error ? 'Erro: ' + error : ''}`,
            variant: connected ? 'default' : 'destructive',
            duration: 5000,
          });
        }
        
        // Atualizar status no mapa
        newMap.set(channelId, {
          channelId,
          type,
          isConnected: connected,
          lastChecked: new Date(timestamp),
          error
        });
        
        return newMap;
      });
    };
    
    // Inscrever-se no evento de atualização de status de canal
    const unsubscribe = subscribe(ServerEventTypes.CHANNEL_STATUS_UPDATED, handleChannelStatusUpdate);
    
    // Cleanup ao desmontar
    return () => {
      unsubscribe();
    };
  }, [subscribe, toast]);

  // Função para obter o status de um canal específico
  const getChannelStatus = (channelId: number): ChannelStatus | undefined => {
    return channelStatuses.get(channelId);
  };

  // Função para verificar se um canal está conectado
  const isChannelConnected = (channelId: number): boolean => {
    return channelStatuses.get(channelId)?.isConnected || false;
  };

  return {
    channelStatuses,
    isLoading,
    error,
    checkWhatsAppStatus,
    getChannelStatus,
    isChannelConnected
  };
}