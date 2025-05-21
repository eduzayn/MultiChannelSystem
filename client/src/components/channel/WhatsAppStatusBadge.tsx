import React, { useEffect } from 'react';
import { useChannelStatusMonitor } from '@/hooks/useChannelStatusMonitor';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhatsAppStatusBadgeProps {
  channelId: number;
  credentials: {
    instanceId: string;
    token: string;
    clientToken?: string;
  };
  autoCheckInterval?: number; // em milissegundos
  className?: string;
  showRefreshButton?: boolean;
}

export function WhatsAppStatusBadge({
  channelId,
  credentials,
  autoCheckInterval = 60000, // Verificar a cada 1 minuto por padrão
  className,
  showRefreshButton = true
}: WhatsAppStatusBadgeProps) {
  const { 
    getChannelStatus, 
    checkWhatsAppStatus, 
    isLoading 
  } = useChannelStatusMonitor();

  const status = getChannelStatus(channelId);
  const isConnected = status?.isConnected;
  
  // Verificar o status quando o componente é montado
  useEffect(() => {
    checkWhatsAppStatus(channelId, credentials);
    
    // Configurar verificação periódica se o intervalo for maior que 0
    if (autoCheckInterval > 0) {
      const intervalId = setInterval(() => {
        checkWhatsAppStatus(channelId, credentials);
      }, autoCheckInterval);
      
      return () => clearInterval(intervalId);
    }
  }, [channelId, credentials, autoCheckInterval, checkWhatsAppStatus]);
  
  // Obter textos e classes baseados no status
  const getBadgeVariant = () => {
    if (isLoading) return 'outline';
    if (isConnected === true) return 'success';
    if (isConnected === false) return 'destructive';
    return 'secondary';
  };
  
  const getBadgeText = () => {
    if (isLoading) return 'Verificando...';
    if (isConnected === true) return 'WhatsApp Conectado';
    if (isConnected === false) return 'WhatsApp Desconectado';
    return 'Status Desconhecido';
  };
  
  const getTooltipText = () => {
    if (isLoading) return 'Verificando status da conexão...';
    
    if (!status) {
      return 'Status desconhecido. Clique para verificar.';
    }
    
    const formattedTime = status.lastChecked 
      ? new Date(status.lastChecked).toLocaleString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      : '';
    
    if (isConnected) {
      return `WhatsApp conectado e pronto para uso. Última verificação: ${formattedTime}`;
    }
    
    return `WhatsApp desconectado. ${status.error ? `Erro: ${status.error}. ` : ''}Última verificação: ${formattedTime}`;
  };
  
  const handleRefresh = () => {
    checkWhatsAppStatus(channelId, credentials);
  };
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant={getBadgeVariant() as any} className="px-3 py-1">
              {getBadgeText()}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getTooltipText()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {showRefreshButton && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={isLoading}
          className="h-7 w-7 p-0"
        >
          <RefreshCw size={14} className={cn('', { 'animate-spin': isLoading })} />
          <span className="sr-only">Atualizar status</span>
        </Button>
      )}
    </div>
  );
}