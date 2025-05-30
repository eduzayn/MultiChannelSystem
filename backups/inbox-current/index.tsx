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
  Copy,
  Mic,
  Video,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  Heart,
  ArrowRight,
  ClipboardCheck,
  Wand2,
  Check,
  Languages,
  Share2,
  Bookmark,
  ClipboardList,
  CalendarClock,
  File,
  MessageCircle,
  SlidersHorizontal
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  const [isSending, setIsSending] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [messagePreview, setMessagePreview] = useState<string | null>(null);
  const [selectedMessageTone, setSelectedMessageTone] = useState<string>("normal");
  const [showCommands, setShowCommands] = useState(false);
  const [multipleAttachments, setMultipleAttachments] = useState<File[]>([]);
  
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
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Painel da esquerda: Lista de conversas */}
      <div className="w-[350px] border-r flex flex-col h-full">
        {/* Cabeçalho do painel esquerdo */}
        <div className="p-3 border-b min-w-[350px]">
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
        <div className="border-b p-1 flex items-center min-w-[350px]">
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
          <div className="p-3 border-b space-y-3 bg-muted/30 min-w-[350px]">
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
        <div className="flex-1 overflow-y-auto custom-scrollbar min-w-[350px]">
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
      <div className="flex-1 flex flex-col bg-muted/10 h-full">
        {selectedConversation ? (
          <div className="flex flex-col h-full">
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
                 style={{ height: "calc(100vh - 230px)" }}>
              
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
            
            {/* Área de visualização de múltiplos anexos */}
            {multipleAttachments.length > 0 && (
              <div className="bg-muted/10 border-t px-4 py-2 flex gap-2 overflow-x-auto">
                {multipleAttachments.map((file, index) => (
                  <div key={index} className="relative group min-w-[120px]">
                    <div className="bg-background border rounded-md p-2 flex items-center gap-2">
                      {file.type.startsWith('image/') ? (
                        <div className="w-10 h-10 relative">
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt={file.name} 
                            className="w-full h-full object-cover rounded-sm"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-sm">
                          {file.type.startsWith('audio/') && <Mic className="h-5 w-5 text-muted-foreground" />}
                          {file.type.startsWith('video/') && <Video className="h-5 w-5 text-muted-foreground" />}
                          {file.type.includes('pdf') && <FileText className="h-5 w-5 text-muted-foreground" />}
                          {file.type.includes('doc') && <FileText className="h-5 w-5 text-muted-foreground" />}
                          {(!file.type.startsWith('audio/') && 
                            !file.type.startsWith('video/') && 
                            !file.type.includes('pdf') &&
                            !file.type.includes('doc') &&
                            !file.type.startsWith('image/')) && 
                            <File className="h-5 w-5 text-muted-foreground" />
                          }
                        </div>
                      )}
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-medium truncate max-w-[70px]">{file.name}</span>
                        <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 absolute top-1 right-1 bg-background/80"
                        onClick={() => {
                          setMultipleAttachments(prev => prev.filter((_, i) => i !== index));
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Área de sugestão da IA */}
            {aiSuggestion && (
              <div className="px-4 py-2 border-t bg-accent/10 text-sm flex items-center gap-2">
                <div className="flex-1">
                  <p className="font-medium text-accent-foreground flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Sugestão da Prof. Ana:</span>
                  </p>
                  <p className="text-sm text-muted-foreground">{aiSuggestion}</p>
                </div>
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-xs"
                    onClick={() => {
                      setMessageText(aiSuggestion);
                      setAiSuggestion(null);
                    }}
                  >
                    Usar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 text-xs"
                    onClick={() => setAiSuggestion(null)}
                  >
                    Ignorar
                  </Button>
                </div>
              </div>
            )}

            {/* Área de entrada de mensagem - Versão aprimorada */}
            <div className="relative">
              {/* Menu de comandos rápidos */}
              {showCommands && (
                <div className="absolute bottom-full left-4 mb-2 bg-background border rounded-md shadow-md w-72 max-h-60 overflow-y-auto z-10">
                  <div className="p-2">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Comandos Rápidos</p>
                    <div className="space-y-1">
                      {[
                        { command: '/notainterna', desc: 'Adiciona uma nota interna à conversa', example: '/notainterna Lembrar de verificar o status do pagamento' },
                        { command: '/tarefa', desc: 'Cria uma tarefa relacionada à conversa', example: '/tarefa Enviar contrato @maria 24/05' },
                        { command: '/resposta', desc: 'Insere uma resposta rápida salva', example: '/resposta saudacao' },
                        { command: '/atribuir', desc: 'Atribui a conversa para outro atendente', example: '/atribuir @joao' },
                        { command: '/resolver', desc: 'Marca a conversa como resolvida', example: '/resolver' },
                        { command: '/traduzir', desc: 'Traduz o texto para outro idioma', example: '/traduzir Olá, como posso ajudar? para ingles' },
                        { command: '/buscarfaq', desc: 'Busca na base de conhecimento', example: '/buscarfaq política de devolução' },
                      ].map((cmd, i) => (
                        <div 
                          key={i} 
                          className="p-1.5 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
                          onClick={() => {
                            setMessageText(prev => prev.replace(/\/\w*$/, cmd.command + ' '));
                            setShowCommands(false);
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <div className="bg-primary/10 text-primary rounded-sm px-1.5 py-0.5 text-xs font-mono">
                              {cmd.command}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs">{cmd.desc}</p>
                              <p className="text-xs text-muted-foreground mt-0.5 font-mono">Ex: {cmd.example}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Seletor de tom da mensagem */}
              {selectedMessageTone !== 'normal' && (
                <div className="flex items-center gap-2 px-4 py-1.5 border-t bg-muted/30 text-xs">
                  <div className="flex-1 flex items-center gap-1.5">
                    <Badge variant="outline" className="h-6 px-2 text-xs font-normal gap-1 items-center flex">
                      {selectedMessageTone === 'formal' && <ClipboardCheck className="h-3.5 w-3.5" />}
                      {selectedMessageTone === 'amigavel' && <Smile className="h-3.5 w-3.5" />}
                      {selectedMessageTone === 'empatico' && <Heart className="h-3.5 w-3.5" />}
                      {selectedMessageTone === 'direto' && <ArrowRight className="h-3.5 w-3.5" />}
                      {selectedMessageTone === 'formal' && 'Tom Formal'}
                      {selectedMessageTone === 'amigavel' && 'Tom Amigável'}
                      {selectedMessageTone === 'empatico' && 'Tom Empático'}
                      {selectedMessageTone === 'direto' && 'Tom Direto'}
                    </Badge>
                    {selectedMessageTone === 'formal' && <span>Comunicação profissional e estruturada</span>}
                    {selectedMessageTone === 'amigavel' && <span>Comunicação leve e próxima</span>}
                    {selectedMessageTone === 'empatico' && <span>Comunicação acolhedora e compreensiva</span>}
                    {selectedMessageTone === 'direto' && <span>Comunicação objetiva e concisa</span>}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => setSelectedMessageTone('normal')}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              {/* Indicador de status do contato */}
              <div className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground border-t">
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="h-5 gap-1 text-xs py-0 font-normal items-center flex">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <span>WhatsApp Zayn</span>
                  </Badge>
                </div>
                
                {selectedConversation?.channel === 'whatsapp' && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>Visto por último às {new Date().getHours()}:{String(new Date().getMinutes()).padStart(2, '0')}</span>
                  </div>
                )}
                
                <div className="ml-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-2 gap-1 text-xs">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Prof. Ana</span>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel className="text-xs flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Ajuda da Prof. Ana</span>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-xs gap-2" onClick={() => setSelectedMessageTone('formal')}>
                        <ClipboardCheck className="h-3.5 w-3.5" />
                        <span>Tom Formal</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-xs gap-2" onClick={() => setSelectedMessageTone('amigavel')}>
                        <Smile className="h-3.5 w-3.5" />
                        <span>Tom Amigável</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-xs gap-2" onClick={() => setSelectedMessageTone('empatico')}>
                        <Heart className="h-3.5 w-3.5" />
                        <span>Tom Empático</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-xs gap-2" onClick={() => setSelectedMessageTone('direto')}>
                        <ArrowRight className="h-3.5 w-3.5" />
                        <span>Tom Direto</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-xs gap-2" onClick={() => {
                        setAiSuggestion("Olá, tudo bem? Agradeço pelo seu contato com a Zayn Educacional. Estou à disposição para esclarecer quaisquer dúvidas sobre nossos cursos. Como posso te ajudar hoje?");
                      }}>
                        <Wand2 className="h-3.5 w-3.5" />
                        <span>Sugerir resposta</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-xs gap-2">
                        <Check className="h-3.5 w-3.5" />
                        <span>Revisar texto</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-xs gap-2">
                        <Languages className="h-3.5 w-3.5" />
                        <span>Traduzir mensagem</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Área principal de digitação e botões */}
              <div className="bg-muted/25 border-t px-4 py-3">
                <div className="flex items-end gap-2">
                  <div className="flex-1 border rounded-md bg-background overflow-hidden">
                    <Textarea
                      value={messageText}
                      onChange={(e) => {
                        setMessageText(e.target.value);
                        
                        // Detecta comandos de barra e mostra o menu de comandos
                        if (e.target.value.match(/\/\w*$/)) {
                          setShowCommands(true);
                        } else {
                          setShowCommands(false);
                        }
                        
                        // Simulação de sugestão da IA
                        if ((e.target.value.toLowerCase().includes('bom dia') || 
                            e.target.value.toLowerCase().includes('boa tarde') || 
                            e.target.value.toLowerCase().includes('boa noite')) && 
                            e.target.value.length > 10 && 
                            !aiSuggestion && 
                            Math.random() > 0.7) {
                          setAiSuggestion("Que tal adicionar uma pergunta sobre como posso ajudar hoje?");
                        }
                      }}
                      placeholder="Digite uma mensagem ou use '/' para comandos rápidos..."
                      className="min-h-[40px] max-h-[120px] resize-none border-0 focus-visible:ring-0 p-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && messageText.trim()) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                        
                        // Fecha o menu de comandos com Escape
                        if (e.key === 'Escape' && showCommands) {
                          e.preventDefault();
                          setShowCommands(false);
                        }
                      }}
                      rows={1}
                    />
                  </div>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent side="top" align="end" className="w-56 p-2">
                    <div className="grid gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="justify-start font-normal"
                        onClick={() => document.getElementById('file-audio')?.click()}
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        Áudio
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="justify-start font-normal"
                        onClick={() => document.getElementById('file-video')?.click()}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Vídeo
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="justify-start font-normal"
                        onClick={() => document.getElementById('file-document')?.click()}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Documento
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="justify-start font-normal"
                        onClick={() => document.getElementById('file-image')?.click()}
                      >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Imagem
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="justify-start font-normal"
                        onClick={() => {
                          const url = prompt('Digite a URL:');
                          if (url && selectedConversation) {
                            // TODO: Implementar envio de link
                            alert('Envio de link será implementado em breve');
                          }
                        }}
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Link
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                
                {/* Inputs escondidos para upload de arquivos */}
                <input 
                  type="file" 
                  id="file-audio" 
                  accept="audio/*" 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files?.[0] && selectedConversation) {
                      const file = e.target.files[0];
                      const formData = new FormData();
                      formData.append('file', file);
                      
                      // Primeiro fazemos upload do arquivo para um serviço de armazenamento
                      // (neste exemplo usamos um link direto, mas em produção seria um serviço como S3, Cloudinary, etc)
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        try {
                          // Em um caso real, precisaríamos fazer upload do arquivo para um servidor
                          // e obter a URL. Por agora, usaremos um alerta para simular o fluxo.
                          
                          // Simulando chamada à API Z-API para enviar áudio
                          const channelData = JSON.parse(localStorage.getItem('selectedChannelData') || '{}');
                          
                          if (channelData.instanceId && channelData.token) {
                            setIsSending(true);
                            const isVoiceMessage = true; // Definido como mensagem de voz
                            
                            // Em um ambiente real, esta URL viria do upload do arquivo
                            alert('Em um ambiente de produção, o arquivo seria enviado para um servidor e retornaria uma URL para ser usada com a Z-API');
                            
                            // Aqui implementaríamos o envio real do áudio via Z-API
                            /*
                            const response = await axios.post('/api/zapi/send-audio', {
                              instanceId: channelData.instanceId,
                              token: channelData.token,
                              clientToken: channelData.clientToken,
                              phone: selectedConversation.phone,
                              audioUrl: uploadedAudioUrl,
                              isVoiceMessage: isVoiceMessage
                            });
                            */
                            
                            // Simulação bem sucedida
                            setTimeout(() => {
                              setIsSending(false);
                              // Atualizaríamos a lista de mensagens após o envio bem-sucedido
                            }, 1000);
                          } else {
                            alert('Dados do canal não encontrados. Verifique se o canal está configurado corretamente.');
                          }
                        } catch (error) {
                          console.error('Erro ao enviar áudio:', error);
                          setIsSending(false);
                          alert('Erro ao enviar áudio. Tente novamente mais tarde.');
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <input 
                  type="file" 
                  id="file-video" 
                  accept="video/*" 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files?.[0] && selectedConversation) {
                      const file = e.target.files[0];
                      const formData = new FormData();
                      formData.append('file', file);
                      
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        try {
                          const channelData = JSON.parse(localStorage.getItem('selectedChannelData') || '{}');
                          
                          if (channelData.instanceId && channelData.token) {
                            setIsSending(true);
                            // Caption para o vídeo (opcional)
                            const caption = prompt('Digite uma legenda para o vídeo (opcional):') || '';
                            
                            alert('Em um ambiente de produção, o vídeo seria enviado para um servidor e retornaria uma URL para ser usada com a Z-API');
                            
                            /*
                            const response = await axios.post('/api/zapi/send-video', {
                              instanceId: channelData.instanceId,
                              token: channelData.token,
                              clientToken: channelData.clientToken,
                              phone: selectedConversation.phone,
                              videoUrl: uploadedVideoUrl,
                              caption: caption
                            });
                            */
                            
                            setTimeout(() => {
                              setIsSending(false);
                            }, 1000);
                          } else {
                            alert('Dados do canal não encontrados. Verifique se o canal está configurado corretamente.');
                          }
                        } catch (error) {
                          console.error('Erro ao enviar vídeo:', error);
                          setIsSending(false);
                          alert('Erro ao enviar vídeo. Tente novamente mais tarde.');
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <input 
                  type="file" 
                  id="file-document" 
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt" 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files?.[0] && selectedConversation) {
                      const file = e.target.files[0];
                      const formData = new FormData();
                      formData.append('file', file);
                      
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        try {
                          const channelData = JSON.parse(localStorage.getItem('selectedChannelData') || '{}');
                          
                          if (channelData.instanceId && channelData.token) {
                            setIsSending(true);
                            // Caption para o documento (opcional)
                            const caption = prompt('Digite uma descrição para o documento (opcional):') || '';
                            
                            alert('Em um ambiente de produção, o documento seria enviado para um servidor e retornaria uma URL para ser usada com a Z-API');
                            
                            /*
                            const response = await axios.post('/api/zapi/send-document', {
                              instanceId: channelData.instanceId,
                              token: channelData.token,
                              clientToken: channelData.clientToken,
                              phone: selectedConversation.phone,
                              documentUrl: uploadedDocumentUrl,
                              fileName: file.name,
                              caption: caption
                            });
                            */
                            
                            setTimeout(() => {
                              setIsSending(false);
                            }, 1000);
                          } else {
                            alert('Dados do canal não encontrados. Verifique se o canal está configurado corretamente.');
                          }
                        } catch (error) {
                          console.error('Erro ao enviar documento:', error);
                          setIsSending(false);
                          alert('Erro ao enviar documento. Tente novamente mais tarde.');
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <input 
                  type="file" 
                  id="file-image" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files?.[0] && selectedConversation) {
                      const file = e.target.files[0];
                      const formData = new FormData();
                      formData.append('file', file);
                      
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        try {
                          const channelData = JSON.parse(localStorage.getItem('selectedChannelData') || '{}');
                          
                          if (channelData.instanceId && channelData.token) {
                            setIsSending(true);
                            // Caption para a imagem (opcional)
                            const caption = prompt('Digite uma legenda para a imagem (opcional):') || '';
                            
                            alert('Em um ambiente de produção, a imagem seria enviada para um servidor e retornaria uma URL para ser usada com a Z-API');
                            
                            /*
                            // Na versão real, usaríamos o endpoint de envio de imagem
                            const response = await axios.post('/api/zapi/send-image', {
                              instanceId: channelData.instanceId,
                              token: channelData.token,
                              clientToken: channelData.clientToken,
                              phone: selectedConversation.phone,
                              imageUrl: uploadedImageUrl,
                              caption: caption
                            });
                            */
                            
                            setTimeout(() => {
                              setIsSending(false);
                            }, 1000);
                          } else {
                            alert('Dados do canal não encontrados. Verifique se o canal está configurado corretamente.');
                          }
                        } catch (error) {
                          console.error('Erro ao enviar imagem:', error);
                          setIsSending(false);
                          alert('Erro ao enviar imagem. Tente novamente mais tarde.');
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                
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
          </div>
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
      <div className="w-80 border-l hidden md:block h-full">
        {selectedConversation && (
          <Tabs value={contextPanelTab} onValueChange={setContextPanelTab} className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="notes">Anotações</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="p-4 flex-1 overflow-y-auto">
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
            
            <TabsContent value="notes" className="p-4 flex-1 overflow-y-auto">
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
            
            <TabsContent value="history" className="p-4 flex-1 overflow-y-auto">
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