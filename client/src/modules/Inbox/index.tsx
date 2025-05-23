import React, { useState, useEffect } from 'react';
import { ConversationList } from './components/ConversationList';
import { ConversationItemProps } from './components/ConversationItem';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Filter, 
  Plus, 
  ChevronDown, 
  Users, 
  MessageSquare, 
  Search,
  Star,
  AtSign,
  Eye,
  CheckCheck,
  MoreHorizontal,
  Smile,
  Send,
  Paperclip,
  Clock,
  User,
  Badge as BadgeIcon,
  Loader2
} from "lucide-react";
import axios from 'axios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";

// Tipo para as mensagens
interface Message {
  id: number;
  conversationId: number;
  content: string;
  type: string;
  sender: 'user' | 'contact' | 'system';
  status: string;
  metadata?: any;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const Inbox = () => {
  // Estados para controle da interface
  const [activeTab, setActiveTab] = useState('all');
  const [selectedConversation, setSelectedConversation] = useState<ConversationItemProps | null>(null);
  const [agentStatus, setAgentStatus] = useState('online');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [contextPanelTab, setContextPanelTab] = useState('profile');
  const [messageText, setMessageText] = useState('');
  
  // Estados para mensagens
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  // Efeito para carregar mensagens quando a conversa é selecionada
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    } else {
      setMessages([]);
    }
  }, [selectedConversation]);

  // Função para buscar mensagens do servidor
  const fetchMessages = async (conversationId: string) => {
    try {
      setLoadingMessages(true);
      const response = await axios.get(`/api/conversations/${conversationId}/messages`);
      
      // Converter timestamps para objetos Date
      const formattedMessages = response.data.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        createdAt: new Date(msg.createdAt),
        updatedAt: new Date(msg.updatedAt)
      }));
      
      setMessages(formattedMessages);
      setHasMoreMessages(formattedMessages.length >= 30); // Assumindo que a API retorna no máximo 30 mensagens por vez
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Função para carregar mais mensagens (mensagens anteriores)
  const loadMoreMessages = async () => {
    if (!selectedConversation || loadingMessages || !hasMoreMessages) return;
    
    try {
      setLoadingMessages(true);
      // Aqui você poderia implementar lógica de paginação baseada no ID ou timestamp da mensagem mais antiga
      const oldestMessage = messages[messages.length - 1];
      const response = await axios.get(`/api/conversations/${selectedConversation.id}/messages`, {
        params: {
          before: oldestMessage.id
        }
      });
      
      // Converter timestamps para objetos Date
      const formattedMessages = response.data.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        createdAt: new Date(msg.createdAt),
        updatedAt: new Date(msg.updatedAt)
      }));
      
      setMessages([...messages, ...formattedMessages]);
      setHasMoreMessages(formattedMessages.length > 0);
    } catch (error) {
      console.error('Erro ao carregar mais mensagens:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Função para selecionar uma conversa
  const handleSelectConversation = (conversation: ConversationItemProps) => {
    setSelectedConversation(conversation);
  };

  // Função para enviar uma mensagem
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;
    
    try {
      // Preparar dados da mensagem
      const messageData = {
        conversationId: Number(selectedConversation.id),
        content: messageText,
        type: 'text',
        sender: 'user',
        status: 'sent'
      };
      
      // Enviar mensagem para o backend
      const response = await axios.post('/api/messages', messageData);
      
      // Adicionar a nova mensagem à lista de mensagens
      const newMessage = {
        ...response.data,
        timestamp: new Date(response.data.timestamp),
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt)
      };
      
      setMessages([newMessage, ...messages]);
      
      // Limpar o campo de texto
      setMessageText('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Painel Esquerdo: Lista de Conversas */}
      <div className="w-72 h-full border-r flex flex-col">
        {/* Cabeçalho do painel */}
        <div className="p-3 border-b">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold">Caixa de Entrada</h2>
            <div className="flex items-center space-x-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                    {agentStatus === "online" ? (
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                    ) : agentStatus === "busy" ? (
                      <span className="h-2 w-2 rounded-full bg-yellow-500" />
                    ) : agentStatus === "away" ? (
                      <span className="h-2 w-2 rounded-full bg-gray-400" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                    )}
                    {agentStatus === "online" ? "Disponível" : 
                     agentStatus === "busy" ? "Ocupado" : 
                     agentStatus === "away" ? "Ausente" : "Offline"}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Status do Agente</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setAgentStatus("online")}>
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                    Disponível
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAgentStatus("busy")}>
                    <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2" />
                    Ocupado
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAgentStatus("away")}>
                    <span className="h-2 w-2 rounded-full bg-gray-400 mr-2" />
                    Ausente
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAgentStatus("offline")}>
                    <span className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                    Offline
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Nova Conversa">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Indicadores de Volume de Trabalho */}
          <div className="flex flex-wrap gap-1 mb-2">
            <Badge variant="outline" className="gap-1 py-0 text-xs px-1.5">
              <MessageSquare className="h-3 w-3" />
              <span>12 ativas</span>
            </Badge>
            <Badge variant="outline" className="gap-1 py-0 text-xs px-1.5">
              <Users className="h-3 w-3" />
              <span>5 não atr.</span>
            </Badge>
          </div>

          {/* Barra de pesquisa universal e filtros */}
          <div className="flex gap-1">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                placeholder="Buscar..." 
                className="pl-7 h-7 text-sm" 
              />
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`h-7 w-7 ${showAdvancedFilters ? "bg-accent" : ""}`}
              title="Filtros Avançados"
            >
              <Filter className="h-3.5 w-3.5" />
            </Button>
          </div>
          
          {/* Abas de Filtros Rápidos */}
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="mt-1"
          >
            <TabsList className="w-full h-7 grid grid-cols-3 mb-1">
              <TabsTrigger value="all" className="text-xs h-6 px-1">
                Todas (12)
              </TabsTrigger>
              <TabsTrigger value="mine" className="text-xs h-6 px-1">
                Minhas (6)
              </TabsTrigger>
              <TabsTrigger value="unassigned" className="text-xs h-6 px-1">
                Não Atr. (5)
              </TabsTrigger>
            </TabsList>
            <TabsList className="w-full h-7 grid grid-cols-3 mb-1">
              <TabsTrigger value="mentioned" className="text-xs h-6 px-1">
                @Menções (3)
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs h-6 px-1">
                Não Lidas (8)
              </TabsTrigger>
              <TabsTrigger value="favorites" className="text-xs h-6 px-1">
                <Star className="h-3 w-3 mr-1" />
                Favoritas
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Filtros avançados (expandidos) */}
          {showAdvancedFilters && (
            <div className="py-2 space-y-2 border-b">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Canal de Origem</label>
                <Select defaultValue="all">
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Todos os canais" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">Todos os Canais</SelectItem>
                      <SelectItem value="whatsapp-api">WhatsApp API</SelectItem>
                      <SelectItem value="whatsapp-zapi">WhatsApp Z-API</SelectItem>
                      <SelectItem value="instagram">Instagram DM</SelectItem>
                      <SelectItem value="facebook">Facebook Messenger</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Status da Conversa</label>
                <Select defaultValue="all">
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="new">Nova</SelectItem>
                      <SelectItem value="open">Aberta</SelectItem>
                      <SelectItem value="pending-client">Pendente Cliente</SelectItem>
                      <SelectItem value="pending-agent">Pendente Agente</SelectItem>
                      <SelectItem value="ai-handling">Em Atendimento pela IA</SelectItem>
                      <SelectItem value="resolved">Resolvida</SelectItem>
                      <SelectItem value="closed">Fechada</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-between pt-1">
                <Button variant="outline" size="sm" className="text-xs h-7">
                  Limpar Filtros
                </Button>
                <Button size="sm" className="text-xs h-7">
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          )}
          
          {/* Seletor de ordenação */}
          <div className="flex items-center justify-between pt-2 pb-1 border-t mt-1">
            <span className="text-xs text-muted-foreground">Ordenar por:</span>
            <Select defaultValue="recent">
              <SelectTrigger className="h-6 text-xs w-32">
                <SelectValue placeholder="Mais Recente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais Recente</SelectItem>
                <SelectItem value="oldest">Mais Antiga</SelectItem>
                <SelectItem value="priority">Prioridade</SelectItem>
                <SelectItem value="waiting-time">Maior Tempo de Espera</SelectItem>
                <SelectItem value="sla">SLA mais próximo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista de Conversas */}
        <div className="flex-1 overflow-auto">
          <ConversationList onSelectConversation={handleSelectConversation} limit={20} />
        </div>
      </div>

      {/* Painel Central: Área da Conversa Ativa */}
      <div className="flex-1 h-full overflow-hidden flex flex-col border-x">
        {selectedConversation ? (
          <div className="h-full flex flex-col">
            {/* Cabeçalho da Conversa */}
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
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation.identifier || "Cliente"}
                  </p>
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
                      <AtSign className="h-4 w-4 mr-2" /> Mencionar Colega
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Área de mensagens (real do banco de dados) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Botão para carregar mensagens anteriores */}
              {hasMoreMessages && (
                <div className="text-center text-xs text-muted-foreground py-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs"
                    onClick={loadMoreMessages}
                    disabled={loadingMessages}
                  >
                    {loadingMessages ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" /> 
                        Carregando...
                      </>
                    ) : (
                      'Carregar mensagens anteriores...'
                    )}
                  </Button>
                </div>
              )}
              
              {/* Indicador de carregamento inicial */}
              {loadingMessages && messages.length === 0 && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
              
              {/* Mensagem se não houver mensagens */}
              {!loadingMessages && messages.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <p>Nenhuma mensagem encontrada nesta conversa.</p>
                  <p className="text-sm">Envie uma mensagem para iniciar.</p>
                </div>
              )}
              
              {/* Lista de mensagens reais */}
              {messages.map((message, index) => {
                const isFromContact = message.sender === 'contact';
                const isFromUser = message.sender === 'user';
                
                // Verificar se a mensagem atual é do mesmo remetente e dentro de 5 minutos da anterior
                const isConsecutive = index > 0 && 
                  messages[index - 1].sender === message.sender && 
                  (message.timestamp.getTime() - messages[index - 1].timestamp.getTime() < 5 * 60 * 1000);
                
                return (
                  <div 
                    key={message.id} 
                    className={`flex ${isFromContact ? 'justify-start' : 'justify-end'} ${isConsecutive ? 'mt-1' : 'mt-4'}`}
                  >
                    {/* Mostrar avatar apenas se for a primeira mensagem de uma sequência */}
                    {isFromContact && !isConsecutive && (
                      <div className="flex-shrink-0 mr-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {selectedConversation?.name?.charAt(0) || 'C'}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                    
                    <div className={`${isConsecutive && isFromContact ? 'ml-10' : ''}`}>
                      {/* Nome do contato (apenas para a primeira mensagem do contato) */}
                      {isFromContact && !isConsecutive && (
                        <div className="text-xs font-medium ml-1 mb-1">
                          {selectedConversation?.name || 'Contato'}
                        </div>
                      )}
                      
                      {/* Conteúdo da mensagem */}
                      <div 
                        className={`p-3 rounded-lg max-w-[80%] ${
                          isFromContact ? 'bg-muted text-foreground' : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        {/* Renderizar conteúdo baseado no tipo de mensagem */}
                        {message.type === 'image' && message.metadata?.url ? (
                          <div>
                            <img 
                              src={message.metadata.url} 
                              alt="Imagem" 
                              className="rounded-lg max-w-full max-h-[200px] object-cover mb-2"
                            />
                            <p className="text-sm">{message.content}</p>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        )}
                        
                        {/* Timestamp e status */}
                        <div className="flex items-center justify-end mt-1">
                          <span className={`text-[10px] ${
                            isFromContact ? 'text-muted-foreground' : 'text-primary-foreground/70'
                          }`}>
                            {format(message.timestamp, 'HH:mm', { locale: ptBR })}
                          </span>
                          
                          {/* Status da mensagem (apenas para mensagens enviadas pelo usuário) */}
                          {isFromUser && (
                            <CheckCheck 
                              className={`h-3.5 w-3.5 ml-1 ${
                                message.status === 'read' 
                                  ? 'text-blue-400' 
                                  : message.status === 'delivered' 
                                    ? 'text-green-400' 
                                    : 'text-primary-foreground/70'
                              }`} 
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Área de entrada de mensagem */}
            <div className="p-3 border-t">
              <div className="flex items-center text-xs text-muted-foreground mb-2 h-4">
                <Clock className="h-3 w-3 mr-1" />
                <span>Cliente está digitando...</span>
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
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
                  onClick={handleSendMessage}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-4">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">Nenhuma conversa selecionada</h3>
              <p className="text-muted-foreground max-w-md">
                Selecione uma conversa da lista à esquerda para visualizar seu conteúdo e interagir com o contato.
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Painel Direito: Painel de Contexto Dinâmico */}
      <div className="w-72 h-full border-l hidden lg:flex lg:flex-col">
        {selectedConversation ? (
          <>
            {/* Abas do painel de contexto */}
            <Tabs value={contextPanelTab} onValueChange={setContextPanelTab} className="h-full flex flex-col">
              <div className="p-2 border-b">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="profile">Perfil</TabsTrigger>
                  <TabsTrigger value="history">Histórico</TabsTrigger>
                  <TabsTrigger value="ai">IA</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="profile" className="flex-1 overflow-auto p-3">
                <div className="space-y-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-medium text-primary">
                        {selectedConversation.name?.charAt(0) || "C"}
                      </span>
                    </div>
                    <h3 className="font-medium mt-2">{selectedConversation.name}</h3>
                    <Badge variant="outline" className="mt-1">
                      {selectedConversation.channel === 'whatsapp' ? 'WhatsApp' : 
                      selectedConversation.channel === 'instagram' ? 'Instagram' :
                      selectedConversation.channel === 'facebook' ? 'Facebook' : 'Email'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Informações de Contato</h4>
                    <div className="rounded-md border p-3 space-y-2">
                      <div className="grid grid-cols-[20px_1fr] gap-2 items-center">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedConversation.identifier || "Não disponível"}</span>
                      </div>
                      <div className="grid grid-cols-[20px_1fr] gap-2 items-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Cliente desde 15/03/2023</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Tags</h4>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        Editar
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">Cliente VIP</Badge>
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">Suporte</Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="flex-1 overflow-auto p-3">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Conversas Anteriores</h4>
                  
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="rounded-md border p-2">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-[10px] h-4 px-1">{
                            i === 1 ? "WhatsApp" : i === 2 ? "Email" : "Instagram"
                          }</Badge>
                          <span className="text-xs text-muted-foreground">{
                            i === 1 ? "Hoje" : i === 2 ? "Ontem" : "15/03/2023"
                          }</span>
                        </div>
                        <p className="text-sm mb-1">{
                          i === 1 ? "Suporte técnico" : i === 2 ? "Informações de produto" : "Reclamação"
                        }</p>
                        <p className="text-xs text-muted-foreground">{i * 3} mensagens • Resolvido</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="ai" className="flex-1 overflow-auto p-3">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Assistente IA</h4>
                  
                  <div className="rounded-md border p-3 space-y-3">
                    <p className="text-sm">Baseado na conversa atual, o cliente parece estar com problemas técnicos.</p>
                    
                    <Button className="w-full text-xs" size="sm">
                      Gerar Resposta Sugerida
                    </Button>
                    
                    <Button variant="outline" className="w-full text-xs" size="sm">
                      Resumir Conversa
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="flex items-center justify-center h-full p-4 text-center">
            <div>
              <h3 className="font-medium mb-2">Painel de Contexto</h3>
              <p className="text-sm text-muted-foreground">
                Selecione uma conversa para ver o perfil do contato, histórico e sugestões da IA.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;