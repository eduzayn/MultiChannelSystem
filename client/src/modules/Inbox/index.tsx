import React, { useState, useEffect, useRef } from 'react';
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

// Função auxiliar para extrair o conteúdo real da mensagem
function extractMessageContent(message: Message): string {
  try {
    // Se não tiver conteúdo, retorna string vazia
    if (!message.content) return '';
    
    // Verifica se o conteúdo parece ser JSON
    if (typeof message.content === 'string' && 
        (message.content.startsWith('{') || message.content.startsWith('['))) {
      
      // Tenta fazer o parse do JSON
      const contentObj = JSON.parse(message.content);
      
      // Casos específicos baseados na estrutura de dados
      if (contentObj.message) {
        return contentObj.message;
      } else if (contentObj.text && contentObj.text.message) {
        return contentObj.text.message;
      } else if (contentObj.caption) {
        return contentObj.caption;
      } else if (typeof contentObj === 'object' && Object.keys(contentObj).length > 0) {
        // Tenta encontrar alguma propriedade com texto
        for (const key of Object.keys(contentObj)) {
          if (typeof contentObj[key] === 'string' && contentObj[key].length > 0) {
            return contentObj[key];
          }
        }
      }
    }
    
    // Se não for um formato JSON ou não conseguiu extrair o texto, retorna o conteúdo original
    return message.content;
  } catch (error) {
    console.error('Erro ao extrair conteúdo da mensagem:', error);
    return message.content || '';
  }
};

const Inbox = () => {
  // Estados para controle da interface
  const [activeTab, setActiveTab] = useState('all');
  const [selectedConversation, setSelectedConversation] = useState<ConversationItemProps | null>(null);
  const [agentStatus, setAgentStatus] = useState('online');
  // Estados para controle dos filtros e ordenação
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [contextPanelTab, setContextPanelTab] = useState('profile');
  const [messageText, setMessageText] = useState('');
  
  // Estados para mensagens
  const [messages, setMessages] = useState<Message[]>([]);
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [messagePage, setMessagePage] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Estados para filtros de conversas
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('recent');
  const [isFiltering, setIsFiltering] = useState(false);
  
  // Opções para os filtros
  const channelOptions = [
    { label: 'WhatsApp', value: 'whatsapp' },
    { label: 'Email', value: 'email' },
    { label: 'Instagram', value: 'instagram' },
    { label: 'Facebook', value: 'facebook' },
    { label: 'SMS', value: 'sms' }
  ];
  
  const statusOptions = [
    { label: 'Aberto', value: 'open' },
    { label: 'Resolvido', value: 'resolved' },
    { label: 'Aguardando', value: 'pending' },
    { label: 'Fechado', value: 'closed' }
  ];
  
  const sortOptions = [
    { label: 'Mais Recentes', value: 'recent' },
    { label: 'Mais Antigos', value: 'oldest' },
    { label: 'Não Lidas', value: 'unread' },
    { label: 'Prioridade', value: 'priority' }
  ];

  // Efeito para carregar mensagens quando a conversa é selecionada
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    } else {
      setMessages([]);
      setDisplayedMessages([]);
    }
  }, [selectedConversation]);
  
  // Efeito para limitar as mensagens exibidas inicialmente a 20
  useEffect(() => {
    if (messages.length > 0) {
      // Exibe apenas as últimas 20 mensagens inicialmente
      const initialMessages = messages.length <= 20 
        ? messages 
        : messages.slice(messages.length - 20);
      
      setDisplayedMessages(initialMessages);
      setHasMoreMessages(messages.length > 20);
      
      // Rolamento suave para a última mensagem após carregar
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages]);
  
  // Efeito para rolar para a última mensagem sempre que uma nova é adicionada
  useEffect(() => {
    if (displayedMessages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [displayedMessages.length]);

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
      
      // Se já estamos exibindo todas as mensagens disponíveis, não faz nada
      if (displayedMessages.length >= messages.length) {
        setHasMoreMessages(false);
        setLoadingMessages(false);
        return;
      }
      
      // Simular um pequeno atraso para feedback visual
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Calcula quantas mensagens adicionais carregar (até 20 por vez)
      const currentCount = displayedMessages.length;
      const remainingMessages = messages.length - currentCount;
      const messagesToAdd = Math.min(remainingMessages, 20);
      
      // Adiciona mais mensagens do início da lista (as mais antigas)
      const startIndex = Math.max(0, messages.length - currentCount - messagesToAdd);
      const newMessages = [
        ...messages.slice(startIndex, messages.length - currentCount),
        ...displayedMessages
      ];
      
      setDisplayedMessages(newMessages);
      
      // Verifica se há mais mensagens para carregar
      setHasMoreMessages(newMessages.length < messages.length);
      
      // Incrementar página para futura implementação de paginação com API
      if (messagePage === 1) {
        setMessagePage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Erro ao carregar mais mensagens:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Funções para filtros de conversas
  const toggleChannelFilter = (channel: string) => {
    setSelectedChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel) 
        : [...prev, channel]
    );
  };
  
  const toggleStatusFilter = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedChannels([]);
    setSelectedStatuses([]);
    setSortBy('recent');
    setIsFiltering(false);
  };
  
  const handleSearchFilter = () => {
    // Aqui você implementaria a lógica de busca e filtro no backend
    // Por enquanto, apenas marcamos que estamos filtrando
    setIsFiltering(true);
    console.log('Aplicando filtros:', {
      searchQuery,
      channels: selectedChannels,
      statuses: selectedStatuses,
      sortBy
    });
    
    // Normalmente você faria uma chamada para algo como:
    // fetchFilteredConversations(searchQuery, selectedChannels, selectedStatuses, sortBy);
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
          {/* Título e botão Nova Conversa */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Caixa de Entrada</h2>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1 text-xs"
              onClick={() => alert('Funcionalidade de Nova Conversa em desenvolvimento')}
            >
              <Plus className="h-3 w-3" /> Nova
            </Button>
          </div>
          
          {/* Status do agente */}
          <div className="mb-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1 text-xs w-full justify-start">
                  {agentStatus === "online" ? (
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                  ) : agentStatus === "busy" ? (
                    <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  ) : agentStatus === "away" ? (
                    <span className="h-2 w-2 rounded-full bg-gray-400" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                  )}
                  <span className="ml-1.5">
                    {agentStatus === "online" ? "Disponível" : 
                     agentStatus === "busy" ? "Ocupado" : 
                     agentStatus === "away" ? "Ausente" : "Offline"}
                  </span>
                  <ChevronDown className="h-3 w-3 ml-auto" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
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
          </div>
          
          {/* Indicadores de Volume de Trabalho */}
          <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
            <div className="bg-secondary/30 rounded p-2 flex flex-col">
              <span className="text-muted-foreground">Minhas Ativas</span>
              <span className="font-semibold text-lg">12</span>
            </div>
            <div className="bg-secondary/30 rounded p-2 flex flex-col">
              <span className="text-muted-foreground">Não Atribuídas</span>
              <span className="font-semibold text-lg">8</span>
            </div>
          </div>
        </div>

        {/* Área de filtros e navegação */}
        <div className="p-3 border-b">
          {/* Contadores visuais - badges informativos */}
          <div className="flex flex-wrap gap-1 mb-3">
            <Badge variant="outline" className="gap-1 py-0.5 text-xs px-2">
              <MessageSquare className="h-3 w-3 mr-1" />
              <span>12 ativas</span>
            </Badge>
            <Badge variant="outline" className="gap-1 py-0.5 text-xs px-2">
              <Users className="h-3 w-3 mr-1" />
              <span>5 não atr.</span>
            </Badge>
            <Badge variant="outline" className="gap-1 py-0.5 text-xs px-2">
              <Clock className="h-3 w-3 mr-1" />
              <span>3 SLA</span>
            </Badge>
          </div>

          {/* Barra de pesquisa universal */}
          <div className="flex gap-1 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nome, número, conteúdo..." 
                className="pl-7 h-8 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchFilter();
                  }
                }}
              />
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`h-8 w-8 ${showAdvancedFilters ? "bg-accent" : ""} ${isFiltering ? "text-primary border-primary" : ""}`}
              title="Filtros Avançados"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Abas de Filtros Rápidos */}
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => {
              setActiveTab(value);
              // Aqui poderia ter lógica adicional para filtrar com base na aba selecionada
            }}
            className="mb-2"
          >
            <TabsList className="w-full h-8 grid grid-cols-3 mb-1">
              <TabsTrigger value="all" className="text-xs py-1 px-1 h-full">
                Todas (312)
              </TabsTrigger>
              <TabsTrigger value="mine" className="text-xs py-1 px-1 h-full">
                Minhas (42)
              </TabsTrigger>
              <TabsTrigger value="unassigned" className="text-xs py-1 px-1 h-full">
                Não Atr. (58)
              </TabsTrigger>
            </TabsList>
            <TabsList className="w-full h-8 grid grid-cols-3">
              <TabsTrigger value="mentioned" className="text-xs py-1 px-1 h-full">
                @Menções (3)
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs py-1 px-1 h-full">
                Não Lidas (24)
              </TabsTrigger>
              <TabsTrigger value="favorites" className="text-xs py-1 px-1 h-full flex items-center justify-center">
                <Star className="h-3 w-3 mr-1" />
                Favoritas (5)
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Filtros avançados (expandidos) */}
          {showAdvancedFilters && (
            <div className="py-2 space-y-3 border-t border-b mb-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Canal de Origem</label>
                <div className="flex flex-wrap gap-1">
                  {channelOptions.map(option => (
                    <Badge 
                      key={option.value} 
                      variant={selectedChannels.includes(option.value) ? "default" : "outline"} 
                      className="cursor-pointer hover:bg-secondary transition-colors"
                      onClick={() => toggleChannelFilter(option.value)}
                    >
                      {option.label}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Status da Conversa</label>
                <div className="flex flex-wrap gap-1">
                  {statusOptions.map(option => (
                    <Badge 
                      key={option.value} 
                      variant={selectedStatuses.includes(option.value) ? "default" : "outline"} 
                      className="cursor-pointer hover:bg-secondary transition-colors"
                      onClick={() => toggleStatusFilter(option.value)}
                    >
                      {option.label}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Prioridade</label>
                <div className="flex flex-wrap gap-1">
                  <Badge 
                    variant={sortBy === 'high' ? "default" : "outline"} 
                    className="cursor-pointer hover:bg-secondary transition-colors"
                    onClick={() => setSortBy('high')}
                  >
                    Alta
                  </Badge>
                  <Badge 
                    variant={sortBy === 'medium' ? "default" : "outline"} 
                    className="cursor-pointer hover:bg-secondary transition-colors"
                    onClick={() => setSortBy('medium')}
                  >
                    Média
                  </Badge>
                  <Badge 
                    variant={sortBy === 'low' ? "default" : "outline"} 
                    className="cursor-pointer hover:bg-secondary transition-colors"
                    onClick={() => setSortBy('low')}
                  >
                    Baixa
                  </Badge>
                </div>
              </div>
              
              {/* Indicador de filtros ativos */}
              {isFiltering && (
                <div className="pt-1 pb-1">
                  <p className="text-xs text-muted-foreground">
                    Filtros ativos: {[
                      selectedChannels.length > 0 && 'Canais',
                      selectedStatuses.length > 0 && 'Status',
                      sortBy !== 'recent' && 'Prioridade'
                    ].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}
              
              <div className="flex justify-between pt-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-8"
                  onClick={clearFilters}
                >
                  Limpar Filtros
                </Button>
                <Button 
                  size="sm" 
                  className="text-xs h-8"
                  onClick={handleSearchFilter}
                >
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          )}
          
          {/* Seletor de ordenação */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Ordenar por:</span>
            <Select 
              defaultValue="recent"
              onValueChange={(value) => {
                setSortBy(value);
                handleSearchFilter();
              }}
            >
              <SelectTrigger className="h-7 text-xs w-36">
                <SelectValue placeholder="Mais Recente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais Recente</SelectItem>
                <SelectItem value="oldest">Mais Antiga</SelectItem>
                <SelectItem value="priority">Prioridade</SelectItem>
                <SelectItem value="waiting-time">Tempo de Espera</SelectItem>
                <SelectItem value="sla">SLA em Risco</SelectItem>
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
            <div className="border-b sticky top-0 bg-background z-10">
              {/* Linha superior: Informações básicas e ferramentas */}
              <div className="p-3 flex items-center justify-between">
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
                      
                      {/* Indicador de status da conversa */}
                      <Badge 
                        className={cn(
                          "text-xs px-1.5",
                          selectedConversation.status === 'open' ? "bg-blue-500 hover:bg-blue-600" :
                          selectedConversation.status === 'pending' ? "bg-yellow-500 hover:bg-yellow-600" :
                          selectedConversation.status === 'resolved' ? "bg-green-500 hover:bg-green-600" :
                          "bg-gray-500 hover:bg-gray-600"
                        )}
                      >
                        {selectedConversation.status === 'open' ? "Aberta" :
                         selectedConversation.status === 'pending' ? "Pendente" :
                         selectedConversation.status === 'resolved' ? "Resolvida" :
                         selectedConversation.status === 'closed' ? "Fechada" : "Aberta"}
                      </Badge>
                      
                      {/* Indicador de prioridade */}
                      {selectedConversation.priority && (
                        <Badge 
                          variant="outline"
                          className={cn(
                            "text-xs px-1.5 border-2",
                            selectedConversation.priority === 'high' ? "border-red-500 text-red-500" :
                            selectedConversation.priority === 'medium' ? "border-yellow-500 text-yellow-500" :
                            "border-green-500 text-green-500"
                          )}
                        >
                          {selectedConversation.priority === 'high' ? "Alta" :
                           selectedConversation.priority === 'medium' ? "Média" : "Baixa"}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs text-muted-foreground">
                        {selectedConversation.identifier || "Cliente"}
                      </p>
                      
                      {/* Indicador de SLA, se disponível */}
                      {selectedConversation.sla !== undefined && selectedConversation.sla <= 15 && (
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs gap-1 px-1.5",
                            selectedConversation.sla <= 5 ? "text-red-500" : "text-yellow-500"
                          )}
                        >
                          <Clock className="h-3 w-3" />
                          SLA: {selectedConversation.sla}min
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Barra de ferramentas da conversa */}
                <div className="flex items-center gap-1.5">
                  <Button 
                    variant={selectedConversation.status === 'resolved' ? "secondary" : "outline"} 
                    size="sm" 
                    className="h-8 text-xs gap-1"
                    onClick={() => alert(`Conversa ${selectedConversation.id} marcada como ${selectedConversation.status === 'resolved' ? 'aberta' : 'resolvida'}`)}
                  >
                    <CheckCheck className="h-4 w-4" /> 
                    {selectedConversation.status === 'resolved' ? 'Reabrir' : 'Resolver'}
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
                      <DropdownMenuItem onClick={() => alert(`Conversa atribuída para você`)}>
                        <User className="h-4 w-4 mr-2" /> Mim
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => alert(`Conversa atribuída para equipe de Suporte`)}>
                        <LifeBuoy className="h-4 w-4 mr-2" /> Suporte
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => alert(`Conversa atribuída para equipe de Vendas`)}>
                        <ShoppingCart className="h-4 w-4 mr-2" /> Vendas
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => alert(`Conversa não atribuída`)}>
                        <CircleOff className="h-4 w-4 mr-2" /> Remover atribuição
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={() => alert('Agendamento em desenvolvimento')}>
                    <CalendarRange className="h-4 w-4" /> Agendar
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                        <Tag className="h-4 w-4" /> Tags
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Gerenciar Tags</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div className="p-2 space-y-1.5 max-h-48 overflow-y-auto">
                        {['Suporte', 'Vendas', 'Dúvida', 'Reclamação', 'Elogio', 'VIP', 'Urgente', 'Bug', 'Financeiro'].map(tag => (
                          <div key={tag} className="flex items-center">
                            <Checkbox id={`tag-${tag}`} className="mr-2" />
                            <label htmlFor={`tag-${tag}`} className="text-sm cursor-pointer">{tag}</label>
                          </div>
                        ))}
                      </div>
                      <DropdownMenuSeparator />
                      <div className="p-2">
                        <Input placeholder="Nova tag..." className="h-7 text-xs" />
                      </div>
                      <DropdownMenuSeparator />
                      <div className="p-1.5 flex justify-end">
                        <Button size="sm" variant="default" className="h-7 text-xs">
                          Salvar Tags
                        </Button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => alert('Conversa marcada como não lida')}>
                        <Eye className="h-4 w-4 mr-2" /> Marcar como não lida
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => alert('Conversa adicionada aos favoritos')}>
                        <Star className="h-4 w-4 mr-2" /> Adicionar aos favoritos
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => alert('Notificações silenciadas')}>
                        <BellOff className="h-4 w-4 mr-2" /> Silenciar notificações
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => alert('Transferir conversa')}>
                        <Forward className="h-4 w-4 mr-2" /> Transferir conversa
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => alert('Mencionar colega')}>
                        <AtSign className="h-4 w-4 mr-2" /> Mencionar colega
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => alert('Conversa arquivada')}>
                        <Archive className="h-4 w-4 mr-2" /> Arquivar conversa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {/* Linha inferior: Tags ativas */}
              {selectedConversation.tags && selectedConversation.tags.length > 0 && (
                <div className="px-3 pb-2 flex items-center">
                  <span className="text-xs text-muted-foreground mr-2">Tags:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedConversation.tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-xs px-1.5 h-5 flex items-center gap-1"
                      >
                        {tag}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-destructive" 
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Tag ${tag} removida`);
                          }}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Área de mensagens (real do banco de dados) - com scrollbar personalizada e limitado a 20 mensagens inicialmente */}
            <div className="flex-1 overflow-y-scroll p-4 space-y-4 custom-scrollbar" 
                 style={{ maxHeight: "calc(100vh - 230px)" }}
                 ref={messagesEndRef}>
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
              
              {/* Lista de mensagens reais - limitada a 20 mensagens inicialmente */}
              {displayedMessages.map((message, index) => {
                const isFromContact = message.sender === 'contact';
                const isFromUser = message.sender === 'user';
                
                // Verificar se a mensagem atual é do mesmo remetente e dentro de 5 minutos da anterior
                const isConsecutive = index > 0 && 
                  displayedMessages[index - 1].sender === message.sender && 
                  (message.timestamp.getTime() - displayedMessages[index - 1].timestamp.getTime() < 5 * 60 * 1000);
                
                // Determina se é a última mensagem para adicionar a referência
                const isLastMessage = index === displayedMessages.length - 1;
                
                return (
                  <div 
                    key={message.id} 
                    className={`flex ${isFromContact ? 'justify-start' : 'justify-end'} ${isConsecutive ? 'mt-1' : 'mt-4'}`}
                    ref={isLastMessage ? messagesEndRef : undefined}
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
                              alt="Imagem enviada" 
                              className="rounded-lg max-w-full max-h-[200px] object-cover mb-2 cursor-pointer"
                              onClick={() => window.open(message.metadata.url, '_blank')}
                            />
                            {message.content && (
                              <p className="text-sm">{extractMessageContent(message)}</p>
                            )}
                          </div>
                        ) : message.type === 'video' && message.metadata?.url ? (
                          <div>
                            <div className="relative rounded-lg overflow-hidden mb-2">
                              <video 
                                src={message.metadata.url} 
                                className="max-w-full max-h-[200px]" 
                                controls
                              />
                            </div>
                            {message.content && (
                              <p className="text-sm">{extractMessageContent(message)}</p>
                            )}
                          </div>
                        ) : message.type === 'audio' && message.metadata?.url ? (
                          <div>
                            <audio 
                              src={message.metadata.url} 
                              className="w-full max-w-[240px] my-1" 
                              controls
                            />
                          </div>
                        ) : message.type === 'file' && message.metadata?.url ? (
                          <div className="flex items-center gap-2 bg-background/80 p-2 rounded-md">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <div className="flex-1 overflow-hidden">
                              <div className="text-sm font-medium truncate">
                                {message.metadata.filename || "Arquivo anexado"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {message.metadata.filesize ? 
                                  (Math.round(message.metadata.filesize / 1024) + ' KB') : 
                                  "Tamanho desconhecido"}
                              </div>
                            </div>
                            <a 
                              href={message.metadata.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-primary hover:text-primary/80"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                              </svg>
                            </a>
                          </div>
                        ) : message.type === 'location' && message.metadata?.latitude && message.metadata?.longitude ? (
                          <div>
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
                                  href={`https://maps.google.com/?q=${message.metadata.latitude},${message.metadata.longitude}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-xs text-primary hover:underline"
                                >
                                  Abrir no Google Maps
                                </a>
                              </div>
                            </div>
                          </div>
                        ) : message.type === 'contact' && message.metadata ? (
                          <div className="bg-background/80 p-2 rounded-md">
                            <div className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                              </svg>
                              <span className="text-sm font-medium">Contato compartilhado</span>
                            </div>
                            <div className="mt-1 text-sm">
                              {message.metadata.name && <div>Nome: {message.metadata.name}</div>}
                              {message.metadata.phone && <div>Telefone: {message.metadata.phone}</div>}
                            </div>
                          </div>
                        ) : message.type === 'sticker' && message.metadata?.url ? (
                          <div>
                            <img 
                              src={message.metadata.url} 
                              alt="Sticker" 
                              className="max-w-[120px] max-h-[120px]"
                            />
                          </div>
                        ) : (
                          // Mensagem de texto padrão
                          <p className="text-sm whitespace-pre-wrap">{extractMessageContent(message)}</p>
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
                  {/* Avatar e Informações Básicas */}
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
                    
                    {/* Status do Contato */}
                    <div className="flex items-center gap-1 mt-2">
                      <span className={`h-2 w-2 rounded-full ${
                        selectedConversation.isActive ? 'bg-green-500' : 'bg-gray-400'
                      }`}></span>
                      <span className="text-xs text-muted-foreground">
                        {selectedConversation.isActive ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Informações de Contato Detalhadas */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Informações de Contato</h4>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        Editar
                      </Button>
                    </div>
                    <div className="rounded-md border p-3 space-y-2">
                      <div className="grid grid-cols-[20px_1fr] gap-2 items-center">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <div className="flex justify-between items-center w-full">
                          <span className="text-sm">{selectedConversation.identifier || "Não disponível"}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5" 
                            onClick={() => {
                              if (selectedConversation.identifier) {
                                navigator.clipboard.writeText(selectedConversation.identifier);
                                // Poderia mostrar um toast de sucesso aqui
                              }
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-[20px_1fr] gap-2 items-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Cliente desde 15/03/2023</span>
                      </div>
                      <div className="grid grid-cols-[20px_1fr] gap-2 items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {selectedConversation.identifier || "Telefone não cadastrado"}
                          </span>
                          {selectedConversation.identifier && selectedConversation.channel === 'whatsapp' && (
                            <Button variant="outline" size="sm" className="h-6 px-2 text-xs gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                              </svg>
                              Ligar
                            </Button>
                          )}
                        </div>
                      </div>
                      {selectedConversation.channel === 'email' && (
                        <div className="grid grid-cols-[20px_1fr] gap-2 items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                          </svg>
                          <span className="text-sm">{selectedConversation.identifier || "Email não cadastrado"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Tags */}
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
                      <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800">Whatsapp</Badge>
                    </div>
                  </div>
                  
                  {/* Notas */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Notas</h4>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        Adicionar
                      </Button>
                    </div>
                    <div className="rounded-md border p-3">
                      <p className="text-sm text-muted-foreground italic">
                        Nenhuma nota cadastrada para este contato.
                      </p>
                    </div>
                  </div>
                  
                  {/* Ações Rápidas */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Ações Rápidas</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="text-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="8.5" cy="7" r="4"></circle>
                          <line x1="20" y1="8" x2="20" y2="14"></line>
                          <line x1="23" y1="11" x2="17" y2="11"></line>
                        </svg>
                        Add ao CRM
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M12 20h9"></path>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                        Editar Dados
                      </Button>
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