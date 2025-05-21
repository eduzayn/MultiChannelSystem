import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";

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
  onClick?: () => void;
}

export const ConversationItem = ({
  name,
  avatar,
  lastMessage,
  timestamp,
  unreadCount,
  channel,
  isActive,
  onClick
}: ConversationItemProps) => {
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

  return (
    <div
      className={cn(
        "p-3 border-b cursor-pointer transition-colors",
        isActive
          ? "bg-accent border-l-4 border-l-primary"
          : "hover:bg-muted/50"
      )}
      onClick={onClick}
    >
      <div className="flex gap-3">
        {/* Avatar com indicador de canal */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-lg font-medium">{name.charAt(0)}</span>
            )}
          </div>
          <div className={cn("absolute -right-1 -bottom-1 w-4 h-4 rounded-full border-2 border-background", getChannelColor())} title={getChannelName()} />
        </div>
        
        {/* Conteúdo da conversa */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1">
            <h4 className="font-medium text-sm truncate">{name}</h4>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(timestamp, { addSuffix: true, locale: ptBR })}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground truncate">{lastMessage}</p>
            {unreadCount > 0 && (
              <Badge variant="default" className="bg-primary text-white ml-2 px-1.5 min-w-[20px] h-5 flex items-center justify-center">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};