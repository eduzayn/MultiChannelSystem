import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MessageSquare, 
  Copy, 
  ThumbsUp, 
  Forward, 
  Star, 
  Languages, 
  MoreHorizontal,
  CheckCheck 
} from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MessageProps {
  message: {
    id: number;
    conversationId: number;
    content: string;
    type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'interactive';
    sender: 'user' | 'contact' | 'system' | 'ai';
    status: 'sent' | 'delivered' | 'read' | 'error';
    metadata?: any;
    timestamp: Date;
  };
  isConsecutive: boolean;
}

export const MessageBubble: React.FC<MessageProps> = ({ message, isConsecutive }) => {
  const isFromContact = message.sender === 'contact';
  const isFromAI = message.sender === 'ai';
  const isFromSystem = message.sender === 'system';
  const isFromUser = message.sender === 'user';

  // Função para extrair e processar o conteúdo da mensagem
  const processMessageContent = () => {
    // Para mensagens Z-API, tenta extrair o conteúdo JSON
    let parsedContent = message.content;
    
    if (typeof message.content === 'string') {
      try {
        // Tenta parsear o conteúdo como JSON
        if (message.content.startsWith('{') && message.content.endsWith('}')) {
          const jsonContent = JSON.parse(message.content);
          
          // Verifica se é uma mensagem de texto do Z-API
          if (jsonContent.text && jsonContent.text.message) {
            return jsonContent.text.message;
          }
          
          // Verifica se é uma mensagem com campo 'message' direto
          if (jsonContent.message) {
            return jsonContent.message;
          }
          
          // Se for outro tipo de conteúdo estruturado, retorna uma representação formatada
          return JSON.stringify(jsonContent, null, 2);
        }
      } catch (error) {
        // Se ocorrer erro no parsing, retorna o conteúdo original
        console.log("Erro ao parsear mensagem:", error);
      }
    }
    
    return parsedContent;
  };

  // Função para renderizar o conteúdo baseado no tipo de mensagem
  const renderMessageContent = () => {
    // Processa o conteúdo primeiro
    const processedContent = processMessageContent();
    
    switch(message.type) {
      case 'image':
        return (
          <div className="max-w-[240px]">
            <img 
              src={message.metadata?.url || "https://via.placeholder.com/300"} 
              alt="Imagem" 
              className="rounded-lg max-w-full max-h-[300px] object-cover"
            />
            <p className="mt-1 text-sm">{processedContent}</p>
          </div>
        );
      case 'video':
        return (
          <div className="max-w-[240px]">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video 
                src={message.metadata?.url} 
                controls 
                className="max-w-full max-h-[240px]"
              />
            </div>
            <p className="mt-1 text-sm">{processedContent}</p>
          </div>
        );
      case 'audio':
        return (
          <div className="w-[240px]">
            <audio src={message.metadata?.url} controls className="w-full" />
            <p className="mt-1 text-sm">{processedContent}</p>
          </div>
        );
      case 'document':
        return (
          <div className="p-3 bg-muted/60 rounded-lg flex items-center max-w-[240px]">
            <div className="bg-muted p-2 rounded mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div className="truncate">
              <p className="text-sm font-medium truncate">{message.metadata?.fileName || "Documento"}</p>
              <p className="text-xs text-muted-foreground">{message.metadata?.fileSize || "Desconhecido"}</p>
            </div>
          </div>
        );
      case 'location':
        return (
          <div className="p-3 bg-muted/60 rounded-lg max-w-[240px]">
            <div className="bg-muted aspect-video rounded-md mb-2 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M12 22s-8-4.5-8-11.8a8 8 0 0 1 16 0c0 7.3-8 11.8-8 11.8z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <p className="text-sm">{processedContent || "Localização compartilhada"}</p>
          </div>
        );
      case 'interactive':
        return (
          <div className="p-3 bg-muted/60 rounded-lg max-w-[240px]">
            <p className="text-sm font-medium mb-2">{processedContent || "Mensagem interativa"}</p>
            {message.metadata?.options && (
              <div className="space-y-1">
                {message.metadata.options.map((option: string, index: number) => (
                  <div key={index} className="p-2 bg-background rounded text-sm hover:bg-accent cursor-pointer">
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'ReceivedCallback':
      case 'MessageStatusCallback':
      case 'PresenceChatCallback':
        // Tipos específicos do Z-API
        return <p className="text-sm whitespace-pre-wrap">{processedContent || "Status atualizado"}</p>;
      default:
        return <p className="text-sm whitespace-pre-wrap">{processedContent}</p>;
    }
  };

  // Função para determinar o estilo baseado no remetente
  const getMessageStyles = () => {
    if (isFromContact) {
      return "bg-muted text-foreground";
    } else if (isFromAI) {
      return "bg-blue-100 dark:bg-blue-950 text-foreground";
    } else if (isFromSystem) {
      return "bg-yellow-100 dark:bg-yellow-950 text-foreground italic";
    } else {
      return "bg-primary text-primary-foreground";
    }
  };

  // Renderizar status de entrega/leitura para mensagens enviadas pelo usuário
  const renderDeliveryStatus = () => {
    if (!isFromUser) return null;
    
    switch(message.status) {
      case 'sent':
        return <CheckCheck className="h-3.5 w-3.5 ml-1 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="h-3.5 w-3.5 ml-1 text-blue-500" />;
      case 'read':
        return <CheckCheck className="h-3.5 w-3.5 ml-1 text-green-500" />;
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 ml-1 text-red-500">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <path d="M12 9v4"/>
            <path d="M12 17h.01"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${isFromContact || isFromAI || isFromSystem ? "justify-start" : "justify-end"} ${isConsecutive ? "mt-1" : "mt-3"}`}>
      {/* Avatar (apenas para mensagens de contato, IA ou sistema, e apenas se não for consecutiva) */}
      {(isFromContact || isFromAI || isFromSystem) && !isConsecutive && (
        <div className="mr-2 flex-shrink-0">
          <Avatar className="h-8 w-8">
            {isFromAI ? (
              <AvatarFallback className="bg-blue-100 text-blue-600">IA</AvatarFallback>
            ) : isFromSystem ? (
              <AvatarFallback className="bg-yellow-100 text-yellow-600">SYS</AvatarFallback>
            ) : (
              <>
                <AvatarImage src={message.metadata?.senderAvatar} alt="Contato" />
                <AvatarFallback>
                  {message.metadata?.senderName?.charAt(0) || "C"}
                </AvatarFallback>
              </>
            )}
          </Avatar>
        </div>
      )}
      
      {/* Conteúdo da mensagem */}
      <div className={`group max-w-[70%] relative ${isConsecutive && (isFromContact || isFromAI || isFromSystem) ? "ml-10" : ""}`}>
        {/* Nome do remetente (apenas para mensagens não consecutivas) */}
        {!isConsecutive && (isFromContact || isFromAI || isFromSystem) && (
          <div className="text-xs font-medium mb-1 pl-1">
            {isFromAI 
              ? "Assistente IA" 
              : isFromSystem 
                ? "Sistema" 
                : message.metadata?.senderName || "Contato"}
          </div>
        )}
        
        <div className="flex items-end">
          {/* Bolha da mensagem */}
          <div 
            className={`p-2.5 rounded-lg break-words ${getMessageStyles()} relative`}
          >
            {renderMessageContent()}
            
            {/* Horário e status (pequenos, no canto) */}
            <div className="flex items-center justify-end mt-1 space-x-1">
              <span className="text-[10px] opacity-70">
                {format(new Date(message.timestamp), 'HH:mm', { locale: ptBR })}
              </span>
              {renderDeliveryStatus()}
            </div>
          </div>
          
          {/* Menu de ações (visível apenas ao passar o mouse) */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 ml-1 rounded-full hover:bg-muted">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isFromUser ? "start" : "end"} className="w-40">
                <DropdownMenuItem>
                  <MessageSquare className="h-4 w-4 mr-2" /> Responder
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Forward className="h-4 w-4 mr-2" /> Encaminhar
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" /> Copiar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <ThumbsUp className="h-4 w-4 mr-2" /> Reagir
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Star className="h-4 w-4 mr-2" /> Salvar
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Languages className="h-4 w-4 mr-2" /> Traduzir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};