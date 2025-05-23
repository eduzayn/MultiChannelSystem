import React, { useState, useEffect, useRef } from 'react';
import { ConversationList } from './components/ConversationList';
import { ConversationItemProps } from './components/ConversationItem';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
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
  Loader2,
  Tag,
  CalendarRange,
  LifeBuoy,
  ShoppingCart,
  CircleOff,
  Forward,
  BellOff,
  Archive,
  X,
  FileText,
  MailQuestion,
  Trash,
  Copy
} from "lucide-react";
import axios from 'axios';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { DateSeparator } from './components/DateSeparator';
import MessageList from './components/MessageList';

// Tipo para as mensagens
interface Message {
  id: number;
  conversationId: number;
  content: string;
  type: string;
  sender: 'user' | 'contact' | 'system' | 'ai';
  status: string;
  metadata?: any;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Função auxiliar para verificar se um valor de data é válido
function isValidDate(dateValue: any): boolean {
  if (!dateValue) return false;
  
  // Tenta converter para data e verifica se é um valor válido
  const date = new Date(dateValue);
  return !isNaN(date.getTime());
}

// Função auxiliar para extrair o conteúdo legível da mensagem dependendo do tipo
function extractMessageContent(message: Message): string {
  try {
    if (typeof message.content === 'string') {
      if (message.type === 'text') {
        return message.content;
      } else {
        // Tenta fazer parse do JSON para outros tipos de mensagens
        const contentObj = JSON.parse(message.content);
        
        // Extrai o texto com base no tipo de mensagem
        if (message.type === 'text' || message.type === 'chat') {
          return contentObj.message || contentObj.text || contentObj.content || message.content;
        } else if (message.type === 'image' && contentObj.caption) {
          return contentObj.caption;
        } else if (message.type === 'video' && contentObj.caption) {
          return contentObj.caption;
        } else if (message.type === 'document' && contentObj.fileName) {
          return `Documento: ${contentObj.fileName}`;
        } else if (message.type === 'audio') {
          return 'Mensagem de áudio';
        } else if (message.type === 'location') {
          return 'Localização compartilhada';
        } else if (message.type === 'contact') {
          return 'Contato compartilhado';
        } else {
          return contentObj.message || contentObj.text || contentObj.content || '';
        }
      }
    }
    return message.content || '';
  } catch (error) {
    // Se não conseguir fazer parse do JSON, retorna o conteúdo original
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
  const [contextPanelTab, setContextPanelTab] = useState('info');
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
    { label: 'Telegram', value: 'telegram' }
  ];
  
  const statusOptions = [
    { label: 'Novo', value: 'new' },
    { label: 'Aberto', value: 'open' },
    { label: 'Pendente', value: 'pending' },
    { label: 'Resolvido', value: 'resolved' },
    { label: 'Fechado', value: 'closed' }
  ];
  
  const sortOptions = [
    { label: 'Mais recentes', value: 'recent' },
    { label: 'Mais antigos', value: 'oldest' },
    { label: 'Prioridade', value: 'priority' }
  ];
  
  // Simula carregamento de conversas do servidor
  useEffect(() => {
    // Aqui seria feita uma chamada à API para obter conversas com filtros aplicados
    console.log('Filtros aplicados:', { 
      search: searchQuery, 
      channels: selectedChannels,
      statuses: selectedStatuses,
      sort: sortBy
    });
  }, [searchQuery, selectedChannels, selectedStatuses, sortBy]);
  
  // Função para carregar mensagens da conversa selecionada
  const loadConversationMessages = async (conversation: ConversationItemProps, page = 1, append = false) => {
    if (!conversation) return;
    
    try {
      setLoadingMessages(true);
      
      // Simulando uma chamada à API para obter mensagens
      const response = await axios.get(`/api/conversations/${conversation.id}/messages`, {
        params: { page, limit: 20 }
      });
      
      // Se a resposta for bem-sucedida
      if (response.status === 200) {
        const newMessages = response.data.messages.map((msg: any) => {
          // Verifica se os valores de data são válidos
          const timestampValue = msg.timestamp || msg.createdAt;
          const createdAtValue = msg.createdAt;
          const updatedAtValue = msg.updatedAt;
          
          // Utiliza valores padrão se as datas forem inválidas
          const currentTime = new Date();
          
          return {
            ...msg,
            timestamp: isValidDate(timestampValue) ? new Date(timestampValue) : currentTime,
            createdAt: isValidDate(createdAtValue) ? new Date(createdAtValue) : currentTime,
            updatedAt: isValidDate(updatedAtValue) ? new Date(updatedAtValue) : currentTime
          };
        });
        
        // Se for para anexar ou substituir as mensagens atuais
        if (append) {
          setMessages(prev => [...newMessages, ...prev]);
          setDisplayedMessages(prev => [...newMessages, ...prev]);
        } else {
          setMessages(newMessages);
          setDisplayedMessages(newMessages);
        }
        
        // Verifica se há mais mensagens para carregar
        setHasMoreMessages(response.data.hasMore);
        setMessagePage(page);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      
      // Dados fictícios para testar a interface
      const currentTime = new Date();
      const newMessages: Message[] = Array.from({ length: 15 }, (_, i) => {
        const isEven = i % 2 === 0;
        const messageTime = new Date(currentTime.getTime() - (i * 3600000));
        const randomStatus = ['sending', 'sent', 'delivered', 'read'][Math.floor(Math.random() * 4)];
        
        return {
          id: i + 1,
          conversationId: Number(conversation.id), // Garantir que o ID seja um número
          content: isEven 
            ? `Mensagem do contato ${conversation.name} (${i + 1}). Esta é uma mensagem de teste mais longa para verificar como o layout se comporta com textos maiores que ocupam várias linhas.`
            : `Resposta do atendente (${i + 1})`,
          type: 'text',
          sender: isEven ? 'contact' : 'user',
          status: isEven ? 'received' : randomStatus,
          timestamp: messageTime,
          createdAt: messageTime,
          updatedAt: messageTime
        };
      });
      
      // Adiciona alguns tipos especiais de mensagens para testar
      if (page === 1) {
        newMessages.push({
          id: 101,
          conversationId: Number(conversation.id),
          content: JSON.stringify({ message: "Olha esta imagem que encontrei!" }),
          type: 'image',
          sender: 'contact',
          status: 'received',
          metadata: { 
            url: 'https://via.placeholder.com/400x300',
            width: 400,
            height: 300
          },
          timestamp: new Date(currentTime.getTime() - 1800000),
          createdAt: new Date(currentTime.getTime() - 1800000),
          updatedAt: new Date(currentTime.getTime() - 1800000)
        });
        
        newMessages.push({
          id: 102,
          conversationId: Number(conversation.id),
          content: JSON.stringify({ message: "Veja este documento importante" }),
          type: 'document',
          sender: 'user',
          status: 'read',
          metadata: { 
            url: 'https://example.com/document.pdf',
            fileName: 'Relatório_Mensal.pdf',
            fileSize: '2.4 MB'
          },
          timestamp: new Date(currentTime.getTime() - 1200000),
          createdAt: new Date(currentTime.getTime() - 1200000),
          updatedAt: new Date(currentTime.getTime() - 1200000)
        });
        
        newMessages.push({
          id: 103,
          conversationId: Number(conversation.id),
          content: JSON.stringify({ message: "Mensagem do sistema" }),
          type: 'text',
          sender: 'system',
          status: 'received',
          timestamp: new Date(currentTime.getTime() - 600000),
          createdAt: new Date(currentTime.getTime() - 600000),
          updatedAt: new Date(currentTime.getTime() - 600000)
        });
      }
      
      if (append) {
        setMessages(prev => [...newMessages, ...prev]);
        setDisplayedMessages(prev => [...newMessages, ...prev]);
      } else {
        setMessages(newMessages);
        setDisplayedMessages(newMessages);
      }
      
      setHasMoreMessages(page < 3); // Limita a 3 páginas para testes
      setMessagePage(page);
    } finally {
      setLoadingMessages(false);
      
      // Scroll para a última mensagem se não estivermos carregando mensagens anteriores
      if (!append && messagesEndRef.current) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  };
  
  // Carrega mais mensagens (mensagens mais antigas)
  const loadMoreMessages = () => {
    if (loadingMessages || !hasMoreMessages || !selectedConversation) return;
    loadConversationMessages(selectedConversation, messagePage + 1, true);
  };
  
  // Função para enviar uma nova mensagem
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;
    
    const newMessage: Message = {
      id: Date.now(),
      conversationId: Number(selectedConversation.id),
      content: messageText,
      type: 'text',
      sender: 'user',
      status: 'sending',
      timestamp: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Adiciona a mensagem à lista e limpa o campo de texto
    setMessages(prev => [...prev, newMessage]);
    setDisplayedMessages(prev => [...prev, newMessage]);
    setMessageText('');
    
    // Scroll para a nova mensagem
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    
    try {
      // Simulando o envio da mensagem para o servidor
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Atualiza o status da mensagem para 'sent'
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );
      setDisplayedMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );
      
      // Simulação de atualização para 'delivered' após mais 1 segundo
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
          )
        );
        setDisplayedMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
          )
        );
      }, 1000);
      
      // Simulação de atualização para 'read' após mais 2 segundos
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
          )
        );
        setDisplayedMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
          )
        );
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Atualiza o status da mensagem para 'error'
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'error' } : msg
        )
      );
      setDisplayedMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'error' } : msg
        )
      );
    }
  };
  
  // Função para selecionar uma conversa e carregar suas mensagens
  const handleSelectConversation = (conversation: ConversationItemProps) => {
    setSelectedConversation(conversation);
    loadConversationMessages(conversation);
  };
  
  // Atualiza o painel de contexto quando uma nova conversa é selecionada
  useEffect(() => {
    if (selectedConversation) {
      setContextPanelTab('info');
    }
  }, [selectedConversation]);
  
  // Componente principal
  return (
    <div className="flex h-screen bg-background">
      {/* Painel da esquerda: Lista de conversas */}
      <div className="w-80 border-r flex flex-col">
        {/* Cabeçalho do painel esquerdo */}
        <div className="p-3 border-b">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    <div className={cn(
                      "h-2 w-2 rounded-full mr-1.5",
                      {
                        "bg-green-500": agentStatus === 'online',
                        "bg-amber-500": agentStatus === 'busy',
                        "bg-gray-400": agentStatus === 'away',
                        "bg-red-500": agentStatus === 'offline',
                      }
                    )}></div>
                    {agentStatus === 'online' ? 'Disponível' :
                     agentStatus === 'busy' ? 'Ocupado' :
                     agentStatus === 'away' ? 'Ausente' : 'Offline'}
                    <ChevronDown className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Status de Atendimento</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setAgentStatus('online')}>
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    Disponível
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAgentStatus('busy')}>
                    <div className="h-2 w-2 rounded-full bg-amber-500 mr-2"></div>
                    Ocupado
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAgentStatus('away')}>
                    <div className="h-2 w-2 rounded-full bg-gray-400 mr-2"></div>
                    Ausente
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAgentStatus('offline')}>
                    <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                    Offline
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <div className="text-xs">
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-1">Conversas:</span>
                  <Badge variant="secondary" className="h-4 text-[10px] px-1">32</Badge>
                </div>
                <div className="flex items-center mt-0.5">
                  <span className="text-muted-foreground mr-1">Atribuídas:</span>
                  <Badge variant="secondary" className="h-4 text-[10px] px-1">5</Badge>
                </div>
              </div>
            </div>
            
            <Button size="sm" variant="outline" className="h-7 w-7 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Campo de busca universal */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar conversas..." 
              className="pl-8 h-8 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Filtros para as conversas (abas) */}
        <div className="border-b p-1 flex items-center">
          <div className="flex-1 grid grid-cols-3 gap-1">
            <Button 
              variant={activeTab === 'all' ? "default" : "ghost"}
              className="h-7 text-xs rounded-sm px-2"
              onClick={() => setActiveTab('all')}
            >
              Todas
            </Button>
            <Button 
              variant={activeTab === 'pending' ? "default" : "ghost"}
              className="h-7 text-xs rounded-sm px-2"
              onClick={() => setActiveTab('pending')}
            >
              Pendentes
            </Button>
            <Button 
              variant={activeTab === 'resolved' ? "default" : "ghost"}
              className="h-7 text-xs rounded-sm px-2"
              onClick={() => setActiveTab('resolved')}
            >
              Resolvidas
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 ml-1"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter className={cn("h-4 w-4", showAdvancedFilters ? "text-primary" : "text-muted-foreground")} />
          </Button>
        </div>
        
        {/* Filtros avançados (expansível) */}
        {showAdvancedFilters && (
          <div className="p-3 border-b space-y-3 bg-muted/30">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Canais</label>
              <div className="grid grid-cols-3 gap-1">
                {channelOptions.map(channel => (
                  <div key={channel.value} className="flex items-center space-x-1">
                    <Checkbox 
                      id={`channel-${channel.value}`} 
                      className="h-3.5 w-3.5"
                      checked={selectedChannels.includes(channel.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedChannels(prev => [...prev, channel.value]);
                        } else {
                          setSelectedChannels(prev => prev.filter(c => c !== channel.value));
                        }
                      }}
                    />
                    <label 
                      htmlFor={`channel-${channel.value}`}
                      className="text-xs cursor-pointer"
                    >
                      {channel.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Status</label>
              <div className="grid grid-cols-3 gap-1">
                {statusOptions.map(status => (
                  <div key={status.value} className="flex items-center space-x-1">
                    <Checkbox 
                      id={`status-${status.value}`}
                      className="h-3.5 w-3.5"
                      checked={selectedStatuses.includes(status.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedStatuses(prev => [...prev, status.value]);
                        } else {
                          setSelectedStatuses(prev => prev.filter(s => s !== status.value));
                        }
                      }}
                    />
                    <label 
                      htmlFor={`status-${status.value}`}
                      className="text-xs cursor-pointer"
                    >
                      {status.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Ordenar por</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Ordenar por..." />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value} className="text-xs">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs"
                onClick={() => {
                  setSelectedChannels([]);
                  setSelectedStatuses([]);
                  setSortBy('recent');
                  setSearchQuery('');
                }}
              >
                Limpar filtros
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="h-7 text-xs"
                onClick={() => {
                  setIsFiltering(true);
                  // Aqui aplicaria os filtros em uma chamada de API
                  setTimeout(() => setIsFiltering(false), 500);
                }}
                disabled={isFiltering}
              >
                {isFiltering ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Filtrando...
                  </>
                ) : 'Aplicar filtros'}
              </Button>
            </div>
          </div>
        )}
        
        {/* Lista de conversas */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <ConversationList 
            activeTab={activeTab}
            onSelectConversation={handleSelectConversation}
            selectedConversation={selectedConversation}
            searchQuery={searchQuery}
            filters={{
              channels: selectedChannels,
              statuses: selectedStatuses,
              sortBy: sortBy
            }}
          />
        </div>
      </div>
      
      {/* Painel central: Exibição da conversa selecionada */}
      <div className="flex-1 flex flex-col bg-muted/10">
        {selectedConversation ? (
          <>
            {/* Cabeçalho da conversa */}
            <div className="border-b">
              {/* Linha superior: Informações básicas e ações */}
              <div className="px-4 py-2 flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-9 w-9 mr-3">
                    <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.name} />
                    <AvatarFallback>{selectedConversation.name?.charAt(0) || 'C'}</AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center">
                      <h2 className="font-medium">{selectedConversation.name}</h2>
                      {selectedConversation.isOnline && (
                        <div className="ml-2 h-2 w-2 rounded-full bg-green-500"></div>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground gap-2">
                      <div className="flex items-center">
                        {selectedConversation.channel === 'whatsapp' && 'WhatsApp'}
                        {selectedConversation.channel === 'email' && 'Email'}
                        {selectedConversation.channel === 'instagram' && 'Instagram'}
                        {selectedConversation.channel === 'facebook' && 'Facebook'}
                        {selectedConversation.channel === 'telegram' && 'Telegram'}
                      </div>
                      
                      <span>•</span>
                      
                      <span>
                        {selectedConversation.lastActivity && isValidDate(selectedConversation.lastActivity) 
                          ? format(new Date(selectedConversation.lastActivity), 'dd/MM/yyyy HH:mm') 
                          : 'Sem atividade'}
                      </span>
                      
                      {selectedConversation.sla && (
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs font-normal flex items-center gap-1 h-5 px-1.5",
                            selectedConversation.sla <= 5 ? "text-red-500 border-red-200" :
                            selectedConversation.sla <= 15 ? "text-amber-500 border-amber-200" :
                            "text-muted-foreground"
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
            
            {/* Área de mensagens com visualização cronológica e status de entrega */}
            <div className="flex-1 overflow-y-scroll p-4 space-y-4 custom-scrollbar" 
                 style={{ maxHeight: "calc(100vh - 230px)" }}>
              
              {/* Utilizando o componente MessageList para exibir as mensagens com todas as melhorias */}
              {selectedConversation && displayedMessages.length > 0 && (
                <MessageList
                  messages={displayedMessages}
                  messagesEndRef={messagesEndRef}
                  loadMoreMessages={loadMoreMessages}
                  hasMoreMessages={hasMoreMessages}
                  loadingMessages={loadingMessages}
                  senderName={selectedConversation.name || 'Contato'}
                  senderAvatar={selectedConversation.avatar}
                  extractMessageContent={extractMessageContent}
                />
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
            </div>
            
            {/* Área de entrada de mensagem */}
            <div className="bg-muted/25 border-t px-4 py-3">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Digite uma mensagem..."
                    className="min-h-10"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && messageText.trim()) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Smile className="h-5 w-5" />
                </Button>
                
                <Button 
                  size="icon" 
                  className="rounded-full" 
                  disabled={!messageText.trim()}
                  onClick={handleSendMessage}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <MailQuestion className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Nenhuma conversa selecionada</h3>
            <p className="text-muted-foreground max-w-md">
              Selecione uma conversa da lista à esquerda para visualizar as mensagens ou inicie uma nova conversa clicando no botão + acima.
            </p>
          </div>
        )}
      </div>
      
      {/* Painel de contexto */}
      <div className="w-80 border-l hidden md:block">
        {selectedConversation && (
          <Tabs value={contextPanelTab} onValueChange={setContextPanelTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="notes">Anotações</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Detalhes do Contato</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Nome:</span>
                      <span className="font-medium">{selectedConversation.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Telefone:</span>
                      <span className="font-medium">{selectedConversation.phone}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{selectedConversation.email || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Canal:</span>
                      <Badge variant="outline" className="font-normal">
                        {selectedConversation.channel === 'whatsapp' ? 'WhatsApp' : 
                         selectedConversation.channel === 'email' ? 'Email' : 
                         selectedConversation.channel === 'instagram' ? 'Instagram' : 'Outro'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium">Dados da Conversa</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={selectedConversation.status === 'resolved' ? 'secondary' : 'outline'}>
                        {selectedConversation.status === 'new' ? 'Novo' :
                         selectedConversation.status === 'open' ? 'Aberto' :
                         selectedConversation.status === 'pending' ? 'Pendente' :
                         selectedConversation.status === 'resolved' ? 'Resolvido' : 'Fechado'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Atribuído:</span>
                      <span className="font-medium">{selectedConversation.assignedTo || 'Não atribuído'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Criado em:</span>
                      <span className="font-medium">
                        {selectedConversation.createdAt && isValidDate(selectedConversation.createdAt) 
                          ? format(new Date(selectedConversation.createdAt), 'dd/MM/yyyy')
                          : 'Data indisponível'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Última atividade:</span>
                      <span className="font-medium">
                        {selectedConversation.lastActivity && isValidDate(selectedConversation.lastActivity) ? 
                          format(new Date(selectedConversation.lastActivity), 'dd/MM/yyyy HH:mm') : 
                          'Sem atividade'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium">Ações Rápidas</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Button size="sm" variant="outline" className="text-xs">
                      <User className="h-3.5 w-3.5 mr-1" /> Ver perfil
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      <BadgeIcon className="h-3.5 w-3.5 mr-1" /> Adicionar tag
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      <Copy className="h-3.5 w-3.5 mr-1" /> Copiar ID
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notes" className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Anotações</h3>
                  <Textarea 
                    placeholder="Adicione anotações sobre este contato aqui..."
                    className="min-h-[150px]"
                    defaultValue={selectedConversation.notes || ''}
                  />
                  <Button size="sm" className="mt-2">Salvar Anotações</Button>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Anotações anteriores</h3>
                  <div className="space-y-3">
                    <div className="bg-muted/50 p-3 rounded-md">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-medium">Maria Silva</span>
                        <span className="text-xs text-muted-foreground">22/05/2025 14:30</span>
                      </div>
                      <p className="text-sm">Cliente solicitou informações sobre garantia estendida.</p>
                    </div>
                    
                    <div className="bg-muted/50 p-3 rounded-md">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-medium">Carlos Almeida</span>
                        <span className="text-xs text-muted-foreground">18/05/2025 09:15</span>
                      </div>
                      <p className="text-sm">Cliente é VIP, oferecemos 10% de desconto na próxima compra.</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Histórico de Interações</h3>
                  <div className="mt-2 space-y-3">
                    {/* Lista fictícia de interações anteriores */}
                    <div className="border rounded-md p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-medium">Atendimento #523</span>
                        <span className="text-xs text-muted-foreground">22/05/2025</span>
                      </div>
                      <p className="text-sm">Dúvida sobre entrega de pedido resolvida por Maria S.</p>
                    </div>
                    <div className="border rounded-md p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-medium">Atendimento #498</span>
                        <span className="text-xs text-muted-foreground">15/05/2025</span>
                      </div>
                      <p className="text-sm">Solicitação de troca aprovada por Carlos A.</p>
                    </div>
                    <div className="border rounded-md p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-medium">Atendimento #456</span>
                        <span className="text-xs text-muted-foreground">02/05/2025</span>
                      </div>
                      <p className="text-sm">Reclamação sobre produto com defeito registrada.</p>
                    </div>
                    <div className="border rounded-md p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-medium">Atendimento #412</span>
                        <span className="text-xs text-muted-foreground">18/04/2025</span>
                      </div>
                      <p className="text-sm">Informações sobre garantia enviadas por João P.</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium">Compras Recentes</h3>
                  <div className="mt-2 space-y-3">
                    <div className="border rounded-md p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-medium">Pedido #8752</span>
                        <span className="text-xs text-muted-foreground">20/05/2025</span>
                      </div>
                      <p className="text-sm">2 itens - R$ 256,90 - Status: Entregue</p>
                    </div>
                    <div className="border rounded-md p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-medium">Pedido #7645</span>
                        <span className="text-xs text-muted-foreground">03/03/2025</span>
                      </div>
                      <p className="text-sm">1 item - R$ 89,90 - Status: Entregue</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Inbox;