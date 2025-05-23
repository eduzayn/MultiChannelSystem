import React, { useRef, useEffect } from 'react';
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
  Trash
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DateSeparator } from './DateSeparator';

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
          <div>
            <img 
              src={message.metadata?.url || ''}
              alt="Imagem enviada" 
              className="rounded-lg max-w-full max-h-[200px] object-cover mb-2 cursor-pointer"
              onClick={() => window.open(message.metadata?.url, '_blank')}
            />
            {message.content && (
              <p className="text-sm">{extractMessageContent(message)}</p>
            )}
          </div>
        );
      case 'video':
        return (
          <div>
            <div className="relative rounded-lg overflow-hidden mb-2">
              <video 
                src={message.metadata?.url || ''} 
                className="max-w-full max-h-[200px]" 
                controls
              />
            </div>
            {message.content && (
              <p className="text-sm">{extractMessageContent(message)}</p>
            )}
          </div>
        );
      case 'audio':
        return (
          <div>
            <audio src={message.metadata?.url || ''} controls className="max-w-full" />
            {message.content && (
              <p className="text-sm mt-2">{extractMessageContent(message)}</p>
            )}
          </div>
        );
      case 'document':
        return (
          <div className="bg-background/80 p-2 rounded-md">
            <a 
              href={message.metadata?.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center hover:bg-muted p-1 rounded-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <div>
                <div className="text-sm font-medium">{message.metadata?.fileName || "Arquivo"}</div>
                <div className="text-xs text-muted-foreground">{message.metadata?.fileSize || ""}</div>
              </div>
            </a>
          </div>
        );
      case 'location':
        return (
          <div className="bg-background/80 p-2 rounded-md mb-1">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span className="text-sm font-medium">Localização compartilhada</span>
            </div>
            <div className="mt-1">
              <a 
                href={`https://maps.google.com/?q=${message.metadata?.latitude},${message.metadata?.longitude}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs text-primary hover:underline"
              >
                Abrir no Google Maps
              </a>
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