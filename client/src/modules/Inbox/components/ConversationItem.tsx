import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { 
  Star, 
  MessageCircle, 
  Clock, 
  Archive, 
  Check, 
  Bookmark, 
  AlertTriangle, 
  Bell, 
  BellOff,
  MoreHorizontal,
  Pencil,
  Tag,
  User
} from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ConversationItemProps {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  channel: 'whatsapp' | 'instagram' | 'facebook' | 'email';
  identifier?: string; // Número de telefone, nome de usuário, email, etc.
  isActive?: boolean;
  active?: boolean; // Status de conexão do contato (online/offline)
  status?: string; // open, resolved, closed, pending
  contactId?: number; // ID do contato associado
  phone?: string; // Número de telefone do contato
  email?: string; // Email do contato
  tags?: string[]; // Tags associadas à conversa
  priority?: 'high' | 'medium' | 'low'; // Prioridade da conversa
  agent?: string; // Agente responsável pela conversa
  sla?: number; // Tempo em minutos até o SLA expirar
  waitingTime?: number; // Tempo em minutos desde a última mensagem do cliente
  onClick?: () => void;
}

export const ConversationItem = ({
  id,
  name,
  avatar,
  lastMessage,
  timestamp,
  unreadCount,
  channel,
  isActive,
  status = 'open',
  priority = 'medium',
  sla,
  waitingTime,
  tags = [],
  active,
  onClick
}: ConversationItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Função para determinar a cor do canal
  const getChannelColor = () => {
    switch (channel) {
      case 'whatsapp':
        return 'bg-green-500';
      case 'instagram':
        return 'bg-pink-500';
      case 'facebook':
        return 'bg-blue-600';
      case 'email':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Função para obter o nome do canal
  const getChannelName = () => {
    switch (channel) {
      case 'whatsapp':
        return 'WhatsApp';
      case 'instagram':
        return 'Instagram';
      case 'facebook':
        return 'Facebook';
      case 'email':
        return 'Email';
      default:
        return 'Canal';
    }
  };

  // Função para obter a cor de status da conversa
  const getStatusColor = () => {
    switch (status) {
      case 'open':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-green-500';
      case 'closed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-300';
    }
  };

  // Função para obter a cor da prioridade
  const getPriorityColor = () => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  // Função para obter o indicador de prioridade
  const getPriorityIndicator = () => {
    switch (priority) {
      case 'high':
        return '!!!';
      case 'medium':
        return '!!';
      case 'low':
        return '!';
      default:
        return '';
    }
  };

  // Handler para favoritar/desfavoritar
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  // Handler para silenciar/ativar notificações
  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  // Handler para arquivar
  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert(`Conversa ${id} arquivada`);
  };

  // Handler para marcar como resolvida
  const handleResolve = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert(`Conversa ${id} marcada como resolvida`);
  };

  return (
    <div
      className={cn(
        "p-2 sm:p-3 border-b cursor-pointer transition-colors relative group",
        isActive
          ? "bg-accent border-l-4 border-l-primary pl-[calc(0.5rem-4px)] sm:pl-[calc(0.75rem-4px)]"
          : "hover:bg-muted/50 pl-2 sm:pl-3"
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Indicador de prioridade (barra lateral) */}
      {!isActive && priority !== 'medium' && (
        <div 
          className={cn(
            "absolute left-0 top-0 w-1 h-full",
            priority === 'high' ? "bg-red-500" : priority === 'low' ? "bg-green-500" : ""
          )}
        />
      )}

      <div className="flex gap-2 sm:gap-3">
        {/* Avatar com indicador de canal e status do contato */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-lg font-medium">{name.charAt(0)}</span>
            )}
          </div>
          {/* Indicador de canal */}
          <div 
            className={cn(
              "absolute -right-1 -bottom-1 w-4 h-4 rounded-full border-2 border-background", 
              getChannelColor()
            )} 
            title={getChannelName()} 
          />
          
          {/* Indicador de status de conexão (online/offline) */}
          {active && (
            <div 
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-background"
              title="Online" 
            />
          )}
        </div>
        
        {/* Conteúdo da conversa */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-1">
              <h4 className="font-medium text-sm truncate max-w-[120px] sm:max-w-[160px]">{name}</h4>
              
              {/* Indicador de favorito */}
              {isFavorite && (
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              )}
              
              {/* Indicador de status da conversa */}
              <div 
                className={cn(
                  "h-2 w-2 rounded-full ml-1", 
                  getStatusColor()
                )}
                title={status.charAt(0).toUpperCase() + status.slice(1)}
              />
            </div>
            
            <div className="flex items-center gap-1">
              {/* Indicador de prioridade textual */}
              <span className={cn("text-xs font-medium", getPriorityColor())}>
                {getPriorityIndicator()}
              </span>
              
              {/* Timestamp */}
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(timestamp, { addSuffix: true, locale: ptBR })}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex flex-1 items-center gap-1">
              {/* Última mensagem */}
              <p className="text-xs text-muted-foreground truncate max-w-[100px] sm:max-w-[160px]">
                {lastMessage}
              </p>
              
              {/* Indicador de SLA */}
              {sla !== undefined && sla <= 15 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Clock 
                        className={cn(
                          "h-3 w-3 ml-1",
                          sla <= 5 ? "text-red-500" : "text-yellow-500"
                        )} 
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>SLA: {sla} min restantes</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {/* Indicador de tempo de espera */}
              {waitingTime !== undefined && waitingTime > 30 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertTriangle 
                        className={cn(
                          "h-3 w-3 ml-1",
                          waitingTime > 60 ? "text-red-500" : "text-yellow-500"
                        )} 
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Tempo de espera: {waitingTime} min</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {/* Indicador de silenciado */}
              {isMuted && (
                <BellOff className="h-3 w-3 ml-1 text-muted-foreground" />
              )}
            </div>
            
            {/* Tags e contadores */}
            <div className="flex items-center gap-1">
              {/* Tags (mostra apenas se houver e não estiver no estado hover) */}
              {tags.length > 0 && !isHovered && (
                <Badge 
                  variant="outline" 
                  className="px-1 h-4 text-[10px]"
                >
                  {tags.length > 1 ? `${tags.length} tags` : tags[0]}
                </Badge>
              )}
              
              {/* Contador de mensagens não lidas */}
              {unreadCount > 0 && (
                <Badge 
                  variant="default" 
                  className="bg-primary text-white px-1.5 min-w-[20px] h-5 flex items-center justify-center"
                >
                  {unreadCount}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Ações rápidas (aparecem apenas ao passar o mouse) */}
      {isHovered && (
        <div className="absolute top-1/2 right-2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded p-0.5 flex items-center gap-1 shadow-sm">
          <TooltipProvider>
            {/* Favoritar/Desfavoritar */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handleToggleFavorite}
                  className="p-1 rounded-full hover:bg-accent"
                >
                  <Star 
                    className={cn(
                      "h-3.5 w-3.5",
                      isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                    )} 
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}</p>
              </TooltipContent>
            </Tooltip>
            
            {/* Silenciar/Ativar notificações */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handleToggleMute}
                  className="p-1 rounded-full hover:bg-accent"
                >
                  {isMuted ? (
                    <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <BellOff className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isMuted ? 'Ativar notificações' : 'Silenciar notificações'}</p>
              </TooltipContent>
            </Tooltip>
            
            {/* Arquivar */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handleArchive}
                  className="p-1 rounded-full hover:bg-accent"
                >
                  <Archive className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Arquivar conversa</p>
              </TooltipContent>
            </Tooltip>
            
            {/* Marcar como resolvida */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handleResolve}
                  className="p-1 rounded-full hover:bg-accent"
                >
                  <Check className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Marcar como resolvida</p>
              </TooltipContent>
            </Tooltip>
            
            {/* Menu de mais opções */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded-full hover:bg-accent">
                  <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem className="text-xs gap-2">
                  <Pencil className="h-3.5 w-3.5" /> Editar conversa
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs gap-2">
                  <Tag className="h-3.5 w-3.5" /> Gerenciar tags
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs gap-2">
                  <User className="h-3.5 w-3.5" /> Atribuir a agente
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs gap-2 text-red-500">
                  <Archive className="h-3.5 w-3.5" /> Arquivar conversa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
};