import React, { useRef, useEffect, useState } from 'react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare,
  Forward,
  FileText,
  Star,
  Smile,
  MoreHorizontal,
  CheckCheck,
  Trash,
  Send
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DateSeparator } from './DateSeparator';
import axios from 'axios';

interface MessageListProps {
  messages: Array<{
    id: number;
    conversationId: number;
    content: string;
    type: string;
    sender: 'user' | 'contact' | 'system' | 'ai';
    status: string;
    metadata?: any;
    timestamp: Date;
  }>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  loadMoreMessages: () => void;
  hasMoreMessages: boolean;
  loadingMessages: boolean;
  senderName: string;
  senderAvatar?: string;
  extractMessageContent: (message: any) => string;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  messagesEndRef,
  loadMoreMessages,
  hasMoreMessages,
  loadingMessages,
  senderName,
  senderAvatar,
  extractMessageContent
}) => {
  const [showForwardDialog, setShowForwardDialog] = useState(false);
  const [messageToForward, setMessageToForward] = useState<any>(null);
  const [forwardPhone, setForwardPhone] = useState('');
  const [isForwarding, setIsForwarding] = useState(false);
  const { toast } = useToast();
  
  // Função para encaminhar mensagem
  const handleForwardMessage = async () => {
    // Validar número de telefone
    if (!forwardPhone || forwardPhone.length < 10) {
      toast({
        title: "Número inválido",
        description: "Por favor, insira um número de telefone válido (com DDD)",
        variant: "destructive"
      });
      return;
    }
    
    setIsForwarding(true);
    
    try {
      // Remover caracteres não numéricos
      const normalizedPhone = forwardPhone.replace(/\D/g, '');
      
      // Adicionar código do país se não houver
      const phoneWithCountryCode = normalizedPhone.startsWith('55') 
        ? normalizedPhone 
        : `55${normalizedPhone}`;
      
      const response = await axios.post('/api/zapi/forward-message', {
        instanceId: '3DF871A7ADFB20FB49998E66062CE0C1', // Normalmente obtido da configuração
        token: '5CD6CAB4A8DBCC35E1C4BB66', // Normalmente obtido da configuração
        phone: phoneWithCountryCode,
        messageId: messageToForward?.metadata?.zapiMessageId || ''
      });
      
      if (response.data.success) {
        toast({
          title: "Mensagem encaminhada",
          description: "A mensagem foi encaminhada com sucesso",
          variant: "default"
        });
        setShowForwardDialog(false);
        setForwardPhone('');
      } else {
        throw new Error(response.data.message || "Erro ao encaminhar mensagem");
      }
    } catch (error) {
      console.error('Erro ao encaminhar mensagem:', error);
      toast({
        title: "Erro ao encaminhar",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao encaminhar a mensagem",
        variant: "destructive"
      });
    } finally {
      setIsForwarding(false);
    }
  };
  // Função para renderizar o status de entrega/leitura
  const renderDeliveryStatus = (status: string) => {
    switch(status) {
      case 'sending':
        return (
          <div className="flex items-center">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1 animate-pulse"></span>
            <span className="text-[10px] text-muted-foreground">Enviando</span>
          </div>
        );
      case 'sent':
        return <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="h-3.5 w-3.5 text-blue-500" />;
      case 'read':
        return <CheckCheck className="h-3.5 w-3.5 text-green-500" />;
      case 'error':
        return <span className="text-[10px] text-destructive">Erro</span>;
      default:
        return null;
    }
  };

  // Formata o conteúdo da mensagem com base no tipo
  const renderMessageContent = (message: any) => {
    switch(message.type) {
      case 'image':
        return (
          <div className="media-message-container">
            <div className="relative group">
              <img 
                src={message.metadata?.url || ''}
                alt="Imagem enviada" 
                className="rounded-lg max-w-full max-h-[250px] object-cover mb-2 cursor-pointer transition-transform transform hover:scale-[1.02]"
                onClick={() => window.open(message.metadata?.url, '_blank')}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-lg">
                <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                  <path d="M11 8v6"></path>
                  <path d="M8 11h6"></path>
                </svg>
              </div>
            </div>
            {message.content && (
              <p className="text-sm">{extractMessageContent(message)}</p>
            )}
          </div>
        );
      case 'video':
        return (
          <div className="media-message-container">
            <div className="relative rounded-lg overflow-hidden mb-2 border border-muted">
              <div className="aspect-video bg-black/10 flex items-center justify-center">
                <video 
                  src={message.metadata?.url || ''} 
                  className="max-w-full max-h-[250px]" 
                  controls
                  poster={message.metadata?.thumbnail || ''}
                  preload="metadata"
                />
              </div>
            </div>
            {message.content && (
              <p className="text-sm">{extractMessageContent(message)}</p>
            )}
            <div className="flex items-center mt-1 text-xs text-muted-foreground">
              <svg className="h-3.5 w-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
              <span>{message.metadata?.duration || 'Vídeo'}</span>
            </div>
          </div>
        );
      case 'audio':
        return (
          <div className="media-message-container">
            <div className="bg-background/80 p-2 rounded-md border border-muted/50">
              <div className="flex items-center mb-2">
                <svg className="h-5 w-5 mr-2 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" x2="12" y1="19" y2="22"></line>
                </svg>
                <span className="text-sm font-medium">Mensagem de áudio</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {message.metadata?.duration || ''}
                </span>
              </div>
              <audio 
                src={message.metadata?.url || ''} 
                controls 
                className="max-w-full w-full h-10" 
                preload="metadata"
              />
            </div>
            {message.content && (
              <p className="text-sm mt-2">{extractMessageContent(message)}</p>
            )}
          </div>
        );
      case 'document':
        return (
          <div className="media-message-container">
            <div className="bg-background/80 p-3 rounded-md border border-muted/50 hover:bg-muted/30 transition-colors">
              <a 
                href={message.metadata?.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center rounded-md"
              >
                <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center mr-3 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{message.metadata?.fileName || "Arquivo"}</div>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <span className="truncate">{message.metadata?.fileSize || ""}</span>
                    <span className="mx-1">•</span>
                    <span className="whitespace-nowrap">Clique para baixar</span>
                  </div>
                </div>
                <svg className="h-5 w-5 text-muted-foreground ml-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" x2="12" y1="15" y2="3"></line>
                </svg>
              </a>
            </div>
          </div>
        );
      case 'location':
        return (
          <div className="media-message-container">
            <div className="bg-background/80 p-3 rounded-md border border-muted/50 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-medium">Localização compartilhada</span>
                  <div className="text-xs text-muted-foreground">
                    {message.metadata?.address || `${message.metadata?.latitude}, ${message.metadata?.longitude}`}
                  </div>
                </div>
              </div>
              <div className="relative rounded-md overflow-hidden h-[100px] bg-muted/30 mb-2">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">Pré-visualização do mapa</span>
                </div>
              </div>
              <a 
                href={`https://maps.google.com/?q=${message.metadata?.latitude},${message.metadata?.longitude}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs text-primary hover:underline flex items-center"
              >
                <svg className="h-3.5 w-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" x2="21" y1="14" y2="3"></line>
                </svg>
                Abrir no Google Maps
              </a>
            </div>
          </div>
        );
      case 'sticker':
        return (
          <div className="media-message-container">
            <img 
              src={message.metadata?.url || ''} 
              alt="Sticker" 
              className="max-w-[120px] max-h-[120px]"
            />
          </div>
        );
      case 'contact':
        return (
          <div className="media-message-container">
            <div className="bg-background/80 p-3 rounded-md border border-muted/50">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium">{message.metadata?.name || "Contato"}</div>
                  <div className="text-xs text-muted-foreground">{message.metadata?.phoneNumber || ""}</div>
                </div>
              </div>
              <button className="mt-2 w-full text-xs flex items-center justify-center bg-muted/50 hover:bg-muted p-1.5 rounded-md text-muted-foreground">
                <svg className="h-3.5 w-3.5 mr-1.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <line x1="19" x2="19" y1="8" y2="14"></line>
                  <line x1="22" x2="16" y1="11" y2="11"></line>
                </svg>
                Adicionar contato
              </button>
            </div>
          </div>
        );
      default:
        return <p className="text-sm whitespace-pre-wrap">{extractMessageContent(message)}</p>;
    }
  };

  return (
    <>
      {/* Botão para carregar mensagens anteriores */}
      {hasMoreMessages && (
        <div className="text-center py-2">
          <button 
            onClick={loadMoreMessages}
            disabled={loadingMessages}
            className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-full"
          >
            {loadingMessages ? 'Carregando...' : 'Carregar mensagens anteriores'}
          </button>
        </div>
      )}
      
      {/* Lista de mensagens com divisores de data */}
      {messages.map((message, index) => {
        const isFromContact = message.sender === 'contact';
        const isFromUser = message.sender === 'user';
        const isFromSystem = message.sender === 'system';
        const isFromAI = message.sender === 'ai';
        const messageDate = new Date(message.timestamp);
        
        // Verifica se precisamos exibir um separador de data
        const showDateSeparator = index === 0 || 
          !isSameDay(messageDate, new Date(messages[index - 1].timestamp));
        
        // Verifica se a mensagem é consecutiva (mesmo remetente e dentro de 5 minutos)
        const isConsecutive = index > 0 && 
          !showDateSeparator &&
          messages[index - 1].sender === message.sender && 
          (messageDate.getTime() - new Date(messages[index - 1].timestamp).getTime() < 5 * 60 * 1000);
        
        // Determina se é a última mensagem para adicionar a referência
        const isLastMessage = index === messages.length - 1;

        return (
          <React.Fragment key={message.id}>
            {/* Mostra o separador de data quando necessário */}
            {showDateSeparator && (
              <DateSeparator date={messageDate} />
            )}
            
            {/* Container da mensagem */}
            <div 
              className={`flex ${isFromContact || isFromSystem || isFromAI ? 'justify-start' : 'justify-end'} 
                ${isConsecutive ? 'mt-1' : 'mt-4'} group`}
              ref={isLastMessage ? messagesEndRef : undefined}
            >
              {/* Avatar para mensagens não consecutivas de contato/sistema/AI */}
              {(isFromContact || isFromSystem || isFromAI) && !isConsecutive && (
                <div className="flex-shrink-0 mr-2">
                  <Avatar className="h-8 w-8">
                    {isFromAI ? (
                      <AvatarFallback className="bg-blue-100 text-blue-600">IA</AvatarFallback>
                    ) : isFromSystem ? (
                      <AvatarFallback className="bg-yellow-100 text-yellow-600">SYS</AvatarFallback>
                    ) : (
                      <>
                        <AvatarImage src={senderAvatar} alt={senderName} />
                        <AvatarFallback>{senderName?.charAt(0) || 'C'}</AvatarFallback>
                      </>
                    )}
                  </Avatar>
                </div>
              )}
              
              {/* Container do conteúdo da mensagem */}
              <div className={`max-w-[75%] ${isConsecutive && (isFromContact || isFromSystem || isFromAI) ? 'ml-10' : ''}`}>
                {/* Nome do remetente para primeira mensagem de uma sequência */}
                {(isFromContact || isFromSystem || isFromAI) && !isConsecutive && (
                  <div className="text-xs font-medium ml-1 mb-1">
                    {isFromAI ? 'Assistente IA' : isFromSystem ? 'Sistema' : senderName || 'Contato'}
                  </div>
                )}
                
                <div className="flex items-end">
                  {/* Bolha da mensagem */}
                  <div className={`p-3 rounded-lg ${
                    isFromContact ? 'bg-muted text-foreground' : 
                    isFromSystem ? 'bg-yellow-100 dark:bg-yellow-950 text-foreground italic' :
                    isFromAI ? 'bg-blue-100 dark:bg-blue-950 text-foreground' :
                    'bg-primary text-primary-foreground'
                  }`}>
                    {renderMessageContent(message)}
                    
                    {/* Horário e status */}
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[10px] opacity-70">
                        {format(messageDate, 'HH:mm', { locale: ptBR })}
                      </span>
                      {isFromUser && renderDeliveryStatus(message.status)}
                    </div>
                  </div>
                  
                  {/* Menu de ações contextual */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded-full hover:bg-muted">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align={isFromUser ? "start" : "end"} className="w-40">
                        <DropdownMenuItem onClick={() => alert('Responder à mensagem')}>
                          <MessageSquare className="h-4 w-4 mr-2" /> Responder
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => alert('Mensagem encaminhada')}>
                          <Forward className="h-4 w-4 mr-2" /> Encaminhar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          navigator.clipboard.writeText(extractMessageContent(message));
                          alert('Texto copiado para a área de transferência');
                        }}>
                          <FileText className="h-4 w-4 mr-2" /> Copiar texto
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => alert('Reagir à mensagem')}>
                          <Smile className="h-4 w-4 mr-2" /> Reagir
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => alert('Mensagem destacada')}>
                          <Star className="h-4 w-4 mr-2" /> Destacar
                        </DropdownMenuItem>
                        {isFromUser && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => alert('Mensagem excluída')} className="text-destructive">
                              <Trash className="h-4 w-4 mr-2" /> Excluir
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
};

export default MessageList;