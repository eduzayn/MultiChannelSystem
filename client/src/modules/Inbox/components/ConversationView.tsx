import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCheck,
  Users,
  MoreHorizontal,
  Star,
  AtSign,
  Eye,
  RefreshCw,
  CalendarRange,
  Bot,
  Paperclip,
  Smile,
  Send,
  Clock,
  Ban,
  Trash,
  Link,
  FileText,
  ClipboardCopy,
} from "lucide-react";
import { useConversationStore } from '../stores/conversationStore';
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageBubble } from './MessageBubble';

// Tipos para as mensagens
interface Message {
  id: number;
  conversationId: number;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'interactive';
  sender: 'user' | 'contact' | 'system' | 'ai';
  status: 'sent' | 'delivered' | 'read' | 'error';
  metadata?: any;
  timestamp: Date;
}

const ConversationView = () => {
  const { selectedConversation } = useConversationStore();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Estado para controlar o carregamento de mensagens anteriores
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);

  // Consulta para buscar mensagens da conversa selecionada
  const { data: messages, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/conversations', selectedConversation?.id, '/messages', page],
    queryFn: async () => {
      if (!selectedConversation?.id) return [];
      
      try {
        const response = await axios.get(`/api/conversations/${selectedConversation.id}/messages`);
        return response.data.map((message: any) => ({
          ...message,
          timestamp: new Date(message.timestamp)
        }));
      } catch (err) {
        console.error("Erro ao buscar mensagens:", err);
        return [];
      }
    },
    enabled: !!selectedConversation?.id,
    staleTime: 3000, // 3 segundos
    refetchInterval: 5000 // Atualizar a cada 5 segundos
  });

  // Efeito para rolar para o final quando uma nova mensagem é recebida ou a conversa muda
  useEffect(() => {
    if (isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedConversation, isAtBottom]);

  // Handler para detectar posição de rolagem
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    // Consideramos "no final" se estiver a menos de 50px do final
    const isBottom = scrollHeight - scrollTop - clientHeight < 50;
    setIsAtBottom(isBottom);
    
    // Verificar se o usuário rolou até o topo para carregar mais mensagens
    if (scrollTop === 0 && !loadingMore && hasMore) {
      loadPreviousMessages();
    }
  };

  // Função para carregar mensagens anteriores
  const loadPreviousMessages = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    setPage(prev => prev + 1);
    // Aqui normalmente seria feita a chamada para buscar mensagens mais antigas
    // Para este exemplo, estamos apenas simulando
    setTimeout(() => {
      setLoadingMore(false);
      // Se não houver mais mensagens para carregar, desativar o carregamento infinito
      if (page > 5) {
        setHasMore(false);
      }
    }, 1000);
  };

  // Função para enviar uma nova mensagem
  const sendMessage = async () => {
    if (!messageText.trim() || !selectedConversation?.id) return;
    
    try {
      // Aqui seria feita uma chamada de API para enviar a mensagem
      console.log("Enviando mensagem:", messageText);
      
      // Limpar o campo de texto
      setMessageText('');
      
      // Recarregar mensagens para ver a nova
      refetch();
      
      // Rolar para o final
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  // Handler para tecla Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/10">
        <div className="text-center p-8">
          <h3 className="text-xl font-medium mb-2">Nenhuma conversa selecionada</h3>
          <p className="text-muted-foreground max-w-md">
            Selecione uma conversa da lista à esquerda para visualizar seu conteúdo e interagir com o contato.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden border-x">
      {/* Cabeçalho da conversa */}
      <div className="p-3 border-b flex items-center justify-between sticky top-0 bg-background z-10">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.name} />
            <AvatarFallback>{selectedConversation.name?.charAt(0) || "C"}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{selectedConversation.name}</h3>
              <Badge variant="outline" className="text-xs px-1.5">
                {selectedConversation.channel === 'whatsapp' ? 'WhatsApp' : 
                 selectedConversation.channel === 'instagram' ? 'Instagram' :
                 selectedConversation.channel === 'facebook' ? 'Facebook' : 'Email'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                {selectedConversation.identifier || "Cliente"}
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5">
                      <ClipboardCopy className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Copiar identificador</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        
        {/* Barra de ferramentas da conversa */}
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
            <CheckCheck className="h-4 w-4" /> Resolver
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                <Users className="h-4 w-4" /> Atribuir
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Atribuir para</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Mim</DropdownMenuItem>
              <DropdownMenuItem>Suporte</DropdownMenuItem>
              <DropdownMenuItem>Vendas</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
            <CalendarRange className="h-4 w-4" /> Agendar
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                <Bot className="h-4 w-4" /> IA
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Resumir Conversa</DropdownMenuItem>
              <DropdownMenuItem>Sugerir Resposta</DropdownMenuItem>
              <DropdownMenuItem>Analisar Sentimento</DropdownMenuItem>
              <DropdownMenuItem>Traduzir Última Mensagem</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Transferir para IA</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" /> Marcar como Não Lida
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Star className="h-4 w-4 mr-2" /> Adicionar aos Favoritos
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Ban className="h-4 w-4 mr-2" /> Bloquear Contato
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Trash className="h-4 w-4 mr-2" /> Marcar como Spam
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link className="h-4 w-4 mr-2" /> Mesclar Conversa
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" /> Exportar Conversa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Estrutura com layout fixo usando absolute positioning */}
      <div className="relative flex-1 overflow-hidden">
        {/* Área de mensagens com rolagem - agora com padding-bottom para dar espaço para a caixa de entrada fixa */}
        <div 
          className="absolute inset-0 overflow-y-auto pb-[140px]"
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          <div className="p-4">
            {/* Indicador de carregamento no topo para mensagens mais antigas */}
            {loadingMore && (
              <div className="text-center p-2">
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                <p className="text-xs text-muted-foreground mt-1">Carregando mensagens anteriores...</p>
              </div>
            )}
            
            {/* Mensagem quando não há mais mensagens para carregar */}
            {!hasMore && !loadingMore && messages && messages.length > 0 && (
              <div className="text-center p-2">
                <p className="text-xs text-muted-foreground">Início da conversa</p>
              </div>
            )}
            
            {/* Esqueleto de carregamento para mensagens */}
            {isLoading && !messages && (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                    <div className={`animate-pulse max-w-[80%] ${i % 2 === 0 ? 'bg-primary/10' : 'bg-muted'} rounded-lg p-4`}>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Mensagem de erro */}
            {error && (
              <div className="text-center text-red-500 p-4">
                Ocorreu um erro ao carregar as mensagens. Tente novamente.
                <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Recarregar
                </Button>
              </div>
            )}
            
            {/* Lista de mensagens - limitada a 2 mensagens caso não tenha rolado */}
            {messages && messages.length > 0 ? (
              <div className="space-y-4">
                {/* Mostrar um botão para carregar mais mensagens se houver mais que 2 */}
                {messages.length > 2 && (
                  <div className="text-center mb-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={loadPreviousMessages}
                      disabled={loadingMore || !hasMore}
                    >
                      {loadingMore ? (
                        <>
                          <span className="animate-spin mr-1">⭮</span> Carregando...
                        </>
                      ) : (
                        'Ver mensagens anteriores'
                      )}
                    </Button>
                  </div>
                )}
                
                {/* Exibir apenas as 2 mensagens mais recentes ou todas se usuário rolou */}
                {messages.slice(-2).map((message: Message, index: number, slicedArr: Message[]) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isConsecutive={
                      index > 0 && 
                      slicedArr[index - 1].sender === message.sender &&
                      (new Date(message.timestamp).getTime() - new Date(slicedArr[index - 1].timestamp).getTime()) < 5 * 60 * 1000
                    }
                  />
                ))}
              </div>
            ) : (
              !isLoading && (
                <div className="text-center text-muted-foreground p-4">
                  Nenhuma mensagem nesta conversa ainda.
                </div>
              )
            )}
            
            {/* Marcador para rolar até o final */}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Campo de entrada de mensagem - agora fixo absolutamente na parte inferior */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t bg-background">
          {/* Indicador de digitação ou status */}
          <div className="flex items-center text-xs text-muted-foreground mb-2 h-4">
            {selectedConversation.channel === 'whatsapp' && selectedConversation.active && (
              <span className="text-green-500 flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-1" />
                O cliente está digitando...
              </span>
            ) || (
              <>
                <Clock className="h-3 w-3 mr-1" />
                <span>Última mensagem enviada há {formatDistanceToNow(selectedConversation.timestamp, { locale: ptBR })}</span>
              </>
            )}
          </div>
          
          <div className="flex items-end gap-2">
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
              <Paperclip className="h-5 w-5" />
            </Button>
            
            <div className="flex-1 relative">
              <Textarea
                placeholder="Digite sua mensagem..."
                className="min-h-[80px] resize-none pr-10"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button variant="ghost" size="icon" className="absolute bottom-2 right-2 h-6 w-6">
                <Smile className="h-5 w-5" />
              </Button>
            </div>
            
            <Button 
              variant="default" 
              size="icon" 
              className="rounded-full h-10 w-10"
              disabled={!messageText.trim()}
              onClick={sendMessage}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationView;