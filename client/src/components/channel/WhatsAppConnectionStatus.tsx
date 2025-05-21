import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSocketContext } from '@/contexts/SocketContext';
import { ServerEventTypes } from '@/lib/socketClient';

interface WhatsAppConnectionStatusProps {
  instanceId: string;
  token: string;
  clientToken?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
}

export function WhatsAppConnectionStatus({
  instanceId,
  token,
  clientToken,
  autoRefresh = true,
  refreshInterval = 30000,
  className
}: WhatsAppConnectionStatusProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { subscribe } = useSocketContext();

  const checkConnection = async () => {
    if (!instanceId || !token) return;
    
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/zapi/test-connection', {
        instanceId,
        token,
        clientToken
      });
      
      setIsConnected(response.data.success && response.data.details?.connected);
      setErrorMessage(response.data.success ? null : response.data.message);
      setLastChecked(new Date());
    } catch (error: any) {
      setIsConnected(false);
      setErrorMessage(error.response?.data?.message || error.message || 'Erro ao verificar status');
      setLastChecked(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar conexão quando o componente é montado ou as credenciais mudam
  useEffect(() => {
    if (instanceId && token) {
      checkConnection();
    } else {
      setIsConnected(null);
      setErrorMessage(null);
    }
  }, [instanceId, token]);

  // Configurar verificação periódica
  useEffect(() => {
    if (!autoRefresh || !instanceId || !token) return;
    
    const intervalId = setInterval(() => {
      checkConnection();
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [autoRefresh, instanceId, token, refreshInterval]);

  // Inscrever-se para atualizações de status via Socket.IO
  useEffect(() => {
    const handleStatusUpdate = (data: any) => {
      if (data.instanceId === instanceId) {
        setIsConnected(data.connected);
        setErrorMessage(data.error || null);
        setLastChecked(new Date());
      }
    };
    
    const unsubscribe = subscribe(ServerEventTypes.CHANNEL_STATUS_UPDATED, handleStatusUpdate);
    
    return () => {
      unsubscribe();
    };
  }, [instanceId, subscribe]);

  // Renderizar o componente com base no status
  const getVariant = () => {
    if (isConnected === true) return 'success';
    if (isConnected === false) return 'destructive';
    return 'secondary';
  };

  const getText = () => {
    if (isLoading) return 'Verificando...';
    if (isConnected === true) return 'WhatsApp Conectado';
    if (isConnected === false) return 'WhatsApp Desconectado';
    return 'Status Desconhecido';
  };

  const getIcon = () => {
    if (isLoading) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (isConnected === true) return <CheckCircle className="h-4 w-4" />;
    if (isConnected === false) return <XCircle className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  const getTooltipText = () => {
    if (isLoading) return 'Verificando status da conexão...';
    
    const timeText = lastChecked 
      ? `Última verificação: ${lastChecked.toLocaleString('pt-BR')}`
      : '';
    
    if (isConnected === true) {
      return `WhatsApp está conectado e pronto para uso. ${timeText}`;
    }
    
    if (isConnected === false) {
      return `WhatsApp está desconectado. ${errorMessage ? `Erro: ${errorMessage}. ` : ''}${timeText}`;
    }
    
    return 'Status desconhecido. Verifique suas credenciais e tente novamente.';
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant={getVariant() as any} className="px-2 py-1">
              <span className="flex items-center gap-1">
                {getIcon()}
                <span className="ml-1">{getText()}</span>
              </span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getTooltipText()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={checkConnection} 
        disabled={isLoading}
        className="h-7 w-7 p-0"
      >
        <RefreshCw size={14} className={cn('', { 'animate-spin': isLoading })} />
        <span className="sr-only">Atualizar status</span>
      </Button>
    </div>
  );
}