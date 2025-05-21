import React from 'react';
import { useChannelStatusMonitor } from '@/hooks/useChannelStatusMonitor';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

interface ChannelStatusIndicatorProps {
  channelId: number;
  type: 'whatsapp' | 'instagram' | 'facebook' | 'email' | 'sms';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ChannelStatusIndicator({
  channelId,
  type,
  showLabel = false,
  size = 'md',
  className
}: ChannelStatusIndicatorProps) {
  const { getChannelStatus } = useChannelStatusMonitor();
  
  const channelStatus = getChannelStatus(channelId);
  const isConnected = channelStatus?.isConnected;
  const isUnknown = !channelStatus;
  const lastChecked = channelStatus?.lastChecked;
  const error = channelStatus?.error;
  
  // Determinar os tamanhos baseados na prop size
  const iconSize = {
    sm: 14,
    md: 18,
    lg: 24
  }[size];
  
  const containerClasses = cn(
    'flex items-center gap-2',
    className
  );
  
  const statusClasses = cn(
    'flex items-center justify-center rounded-full',
    {
      'bg-green-100 text-green-600': isConnected,
      'bg-red-100 text-red-600': !isConnected && !isUnknown,
      'bg-gray-100 text-gray-500': isUnknown
    }
  );
  
  const labelClasses = cn(
    'text-sm font-medium',
    {
      'text-green-600': isConnected,
      'text-red-600': !isConnected && !isUnknown,
      'text-gray-500': isUnknown
    }
  );
  
  const getStatusIcon = () => {
    if (isUnknown) return <Clock size={iconSize} />;
    if (isConnected) return <CheckCircle size={iconSize} />;
    return <XCircle size={iconSize} />;
  };
  
  const getStatusText = () => {
    if (isUnknown) return 'Status desconhecido';
    if (isConnected) return 'Conectado';
    return 'Desconectado';
  };
  
  const getTooltipContent = () => {
    if (isUnknown) {
      return 'Status desconhecido. Clique para verificar.';
    }
    
    const formattedTime = lastChecked 
      ? new Date(lastChecked).toLocaleString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      : '';
    
    if (isConnected) {
      return `Conectado. Última verificação: ${formattedTime}`;
    }
    
    return `Desconectado. ${error ? `Erro: ${error}. ` : ''}Última verificação: ${formattedTime}`;
  };
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div className={containerClasses}>
            <div className={statusClasses}>
              {getStatusIcon()}
            </div>
            
            {showLabel && (
              <span className={labelClasses}>
                {getStatusText()}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipContent()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}