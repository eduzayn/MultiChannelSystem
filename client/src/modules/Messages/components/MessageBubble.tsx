import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, CheckCheck, FileText, Image, Download, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface MessageProps {
  id: string;
  content: string;
  timestamp: Date;
  sender: 'user' | 'contact' | 'system';
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  messageId?: string; // ID da mensagem no sistema externo (Z-API)
  avatar?: string;
  type?: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'interactive';
  caption?: string;
  fileSize?: string;
  interactiveData?: {
    type: 'button' | 'list';
    selected?: string;
    options?: string[];
  };
}

export const MessageBubble = ({
  content,
  timestamp,
  sender,
  status = 'sent',
  avatar,
  type = 'text',
  caption,
  fileSize,
  interactiveData
}: MessageProps) => {
  const isUser = sender === 'user';
  const isSystem = sender === 'system';
  
  // Status do envio da mensagem
  const renderStatus = () => {
    if (isUser) {
      switch (status) {
        case 'sending':
          return (
            <span className="flex items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1 animate-pulse"></span>
              <span className="text-xs text-muted-foreground">Enviando</span>
            </span>
          );
        case 'sent':
          return <Check className="h-3.5 w-3.5 text-muted-foreground" />;
        case 'delivered':
          return <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" />;
        case 'read':
          return <CheckCheck className="h-3.5 w-3.5 text-blue-500" />;
        case 'error':
          return <span className="text-xs text-destructive">Erro</span>;
        default:
          return null;
      }
    }
    return null;
  };

  // Função para extrair texto da mensagem no formato JSON
  const extractMessageText = (rawContent: string): string => {
    // Se parecer JSON, tenta parsear
    if (rawContent.startsWith('{') && rawContent.endsWith('}')) {
      try {
        const messageObj = JSON.parse(rawContent);
        
        // Campos comuns em objetos de mensagem Z-API/WhatsApp
        if (messageObj.text) return messageObj.text;
        if (messageObj.body) return messageObj.body;
        if (messageObj.message) return messageObj.message;
        if (messageObj.content) return messageObj.content;
        
        // Se for um objeto de callback de status
        if (messageObj.type === 'MessageStatusCallback' || 
            messageObj.type === 'PresenceChatCallback') {
          return '[Atualização de Status]';
        }
        
        // Se for uma mensagem do sistema
        if (messageObj.system) return messageObj.system;
        
        // Se não encontrou nenhum dos campos, retorna um valor genérico
        return 'Nova mensagem';
      } catch (e) {
        // Se falhar o parse JSON, retorna o conteúdo original
        return rawContent;
      }
    }
    
    // Se não for JSON, retorna o conteúdo original
    return rawContent;
  };

  // Processamento do conteúdo para renderização
  const processedContent = extractMessageText(content);

  // Renderiza conteúdo de mídia ou especial
  const renderContent = () => {
    switch (type) {
      case 'image':
        return (
          <div className="space-y-2">
            <div className="relative rounded-md overflow-hidden">
              <img 
                src={processedContent} 
                alt={caption || "Imagem"} 
                className="w-full max-h-60 object-contain bg-muted/20"
              />
              <div className="absolute bottom-2 right-2">
                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-background/80 hover:bg-background shadow-sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {caption && <p className="text-sm opacity-80">{caption}</p>}
          </div>
        );
        
      case 'video':
        return (
          <div className="space-y-2">
            <div className="relative rounded-md overflow-hidden bg-muted/20 aspect-video flex items-center justify-center">
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Button size="icon" variant="secondary" className="h-12 w-12 rounded-full bg-background/80 hover:bg-background shadow-sm">
                  <Play className="h-6 w-6" />
                </Button>
              </div>
              <img 
                src={processedContent} 
                alt="Thumbnail do vídeo" 
                className="w-full h-full object-cover opacity-80"
              />
            </div>
            {caption && <p className="text-sm opacity-80">{caption}</p>}
          </div>
        );
        
      case 'document':
        return (
          <div className="flex items-center space-x-3 bg-muted/20 p-3 rounded-md">
            <div className="bg-muted/50 h-10 w-10 rounded-md flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{processedContent}</div>
              <div className="text-xs text-muted-foreground">{fileSize || "Documento"}</div>
            </div>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        );
        
      case 'audio':
        return (
          <div className="flex items-center bg-muted/20 p-2 rounded-md">
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Play className="h-4 w-4" />
            </Button>
            <div className="flex-1 mx-2 h-1 bg-muted rounded-full">
              <div className="bg-primary h-full w-1/3 rounded-full"></div>
            </div>
            <span className="text-xs text-muted-foreground">0:30</span>
          </div>
        );
        
      case 'interactive':
        if (interactiveData?.type === 'button') {
          return (
            <div className="space-y-2">
              <p>{processedContent}</p>
              <div className="bg-muted/20 p-2 rounded-md">
                <div className="text-xs text-muted-foreground mb-1">Botão pressionado:</div>
                <div className="bg-accent/50 text-accent-foreground text-sm py-1 px-3 rounded-md">
                  {interactiveData.selected}
                </div>
              </div>
            </div>
          );
        } else if (interactiveData?.type === 'list') {
          return (
            <div className="space-y-2">
              <p>{processedContent}</p>
              <div className="bg-muted/20 p-2 rounded-md">
                <div className="text-xs text-muted-foreground mb-1">Item selecionado:</div>
                <div className="bg-accent/50 text-accent-foreground text-sm py-1 px-3 rounded-md">
                  {interactiveData.selected}
                </div>
              </div>
            </div>
          );
        }
        return processedContent;
        
      case 'location':
        return (
          <div className="space-y-2">
            <div className="bg-muted/20 aspect-video rounded-md flex items-center justify-center">
              <Image className="h-6 w-6 text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Localização compartilhada</span>
            </div>
            <p className="text-sm">{processedContent}</p>
          </div>
        );
        
      case 'MessageStatusCallback':
      case 'PresenceChatCallback':
        return (
          <div className="text-xs text-muted-foreground italic">
            Atualização de status
          </div>
        );
        
      default:
        return processedContent;
    }
  };

  // Se for uma mensagem do sistema, renderiza em estilo diferente
  if (isSystem) {
    return (
      <div className="px-4 py-2 flex justify-center my-2">
        <div className="bg-muted/50 rounded-full px-4 py-1 text-xs text-muted-foreground">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "px-4 py-2 flex",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar para mensagens do contato */}
      {!isUser && (
        <div className="mr-2 mt-1">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-sm font-medium">C</span>
            )}
          </div>
        </div>
      )}
      
      <div className={cn(
        "max-w-[70%]",
      )}>
        {/* Conteúdo da mensagem */}
        <div className={cn(
          "px-3 py-2 rounded-lg break-words",
          isUser 
            ? "bg-primary text-primary-foreground rounded-br-none"  
            : "bg-card border rounded-bl-none"
        )}>
          {renderContent()}
        </div>
        
        {/* Timestamp e status */}
        <div className={cn(
          "flex items-center mt-1 text-xs",
          isUser ? "justify-end" : "justify-start"
        )}>
          <span className="text-muted-foreground">
            {formatDistanceToNow(timestamp, { addSuffix: true, locale: ptBR })}
          </span>
          
          {isUser && (
            <span className="ml-1.5 flex items-center">
              {renderStatus()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};