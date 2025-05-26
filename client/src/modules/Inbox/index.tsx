import React, { useState, useEffect, useRef } from 'react';
import { ConversationList } from './components/ConversationList';
import { ConversationItemProps } from './components/ConversationItem';
import MessageList from './components/MessageList';
import MessageComposer from './components/MessageComposer';
import { sendTextMessage } from '../../services/messageService';
import { socketClient, ServerEventTypes } from '@/lib/socketClient';
import { useSocketContext } from '@/contexts/SocketContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import axios from 'axios';

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

export default function Inbox() {
  // Referências para auto-scroll e load more
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Estados para controle de conversas
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<ConversationItemProps | null>(null);
  
  // Estados para filtros e labels
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('recent');
  const [isFiltering, setIsFiltering] = useState(false);
  const [agentStatus, setAgentStatus] = useState('online');
  
  // Estados para controle dos filtros e ordenação
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [contextPanelTab, setContextPanelTab] = useState('info');
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [multipleAttachments, setMultipleAttachments] = useState<File[]>([]);
  
  // Estados para mensagens
  const [messages, setMessages] = useState<Message[]>([]);
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [page, setPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  // Opções para filtros
  const channelOptions = [
    { value: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> },
    { value: 'email', label: 'Email', icon: <AtSign className="h-3.5 w-3.5 mr-1.5" /> },
    { value: 'instagram', label: 'Instagram', icon: <ImageIcon className="h-3.5 w-3.5 mr-1.5" /> },
    { value: 'facebook', label: 'Facebook', icon: <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> }
  ];
  
  const statusOptions = [
    { value: 'open', label: 'Em aberto' },
    { value: 'pending', label: 'Pendente' },
    { value: 'resolved', label: 'Resolvido' }
  ];
  
  const sortOptions = [
    { value: 'recent', label: 'Mais recentes' },
    { value: 'oldest', label: 'Mais antigos' },
    { value: 'priority', label: 'Prioridade' },
    { value: 'unread', label: 'Não lidos' }
  ];

  // Função para verificar se um valor é uma data válida
  function isValidDate(dateValue: any): boolean {
    if (!dateValue) return false;
    const date = new Date(dateValue);
    return !isNaN(date.getTime());
  }

  // Função para extrair conteúdo de mensagem
  function extractMessageContent(message: Message): string {
    try {
      if (typeof message.content === 'string') {
        // Primeiro, verifica se a mensagem já é texto plano (formato novo e mais eficiente)
        if (message.content.trim() && !message.content.startsWith('{') && !message.content.startsWith('[')) {
          return message.content;
        }
        
        // Se parece ser JSON, tenta processar (formato antigo)
        try {
          // Tenta fazer parse do conteúdo como JSON
          const jsonContent = JSON.parse(message.content);
          
          // Verifica se é uma mensagem de texto do WhatsApp via Z-API
          if (jsonContent.text && jsonContent.text.message) {
            return jsonContent.text.message;
          }
          
          // Verifica se tem uma propriedade message genérica
          if (jsonContent.message) {
            return jsonContent.message;
          }
          
          // Se não conseguiu extrair por padrão conhecido, retorna a string JSON
          return JSON.stringify(jsonContent);
        } catch (e) {
          // Se não conseguiu fazer parse como JSON, retorna o conteúdo como está
          return message.content;
        }
      }
      return 'Conteúdo não disponível';
    } catch (error) {
      console.error('Erro ao extrair conteúdo da mensagem:', error);
      return 'Erro ao processar mensagem';
    }
  }

  // Efeito para rolagem automática
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedMessages]);

  // Efeito para carregar mensagens quando selecionar uma conversa
  useEffect(() => {
    if (selectedConversation) {
      setLoadingMessages(true);
      loadConversationMessages(selectedConversation);
      
      // Entra na sala de WebSocket para esta conversa
      socketClient.joinConversation(parseInt(selectedConversation.id));
    } else {
      setMessages([]);
      setDisplayedMessages([]);
    }
    
    // Limpar ao desmontar
    return () => {
      if (selectedConversation) {
        socketClient.leaveConversation(parseInt(selectedConversation.id));
      }
    };
  }, [selectedConversation]);
  
  // Efeito para ouvir novas mensagens via WebSocket
  useEffect(() => {
    // Configura o Socket.IO se ainda não estiver inicializado
    socketClient.init();
    
    // Ouvinte para novas mensagens
    const newMessageUnsubscribe = socketClient.on(ServerEventTypes.NEW_MESSAGE, (data: any) => {
      console.log('Nova mensagem recebida via WebSocket:', data);
      
      if (data && data.message) {
        const newMessage = data.message;
        
        // Verifica se é para a conversa atual
        if (selectedConversation && parseInt(selectedConversation.id) === newMessage.conversationId) {
          // Formata a data corretamente
          const formattedMessage = {
            ...newMessage,
            timestamp: new Date(newMessage.timestamp),
            createdAt: new Date(newMessage.createdAt || newMessage.timestamp),
            updatedAt: new Date(newMessage.updatedAt || newMessage.timestamp)
          };
          
          // Adiciona à lista de mensagens (evitando duplicatas pelo ID)
          setMessages(prev => {
            // Verifica se a mensagem já existe
            const messageExists = prev.some(msg => msg.id === formattedMessage.id);
            if (messageExists) {
              return prev;
            }
            return [...prev, formattedMessage];
          });
          
          setDisplayedMessages(prev => {
            // Verifica se a mensagem já existe
            const messageExists = prev.some(msg => msg.id === formattedMessage.id);
            if (messageExists) {
              return prev;
            }
            return [...prev, formattedMessage];
          });
          
          console.log('Mensagem adicionada ao estado:', formattedMessage);
          
          // Reproduzir um som de notificação (opcional)
          try {
            const audio = new Audio('/notification.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => console.log('Não foi possível reproduzir o som de notificação', e));
          } catch (e) {
            console.log('Erro ao tentar reproduzir som de notificação', e);
          }
        } else {
          console.log('Mensagem para outra conversa recebida');
        }
      }
    });
    
    return () => {
      newMessageUnsubscribe();
    };
  }, [selectedConversation]);

  // Função para carregar mais mensagens (paginação)
  const loadMoreMessages = () => {
    if (hasMoreMessages && !loadingMessages && selectedConversation) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadConversationMessages(selectedConversation, nextPage, true);
    }
  };

  // Função para carregar mensagens da conversa selecionada
  const loadConversationMessages = async (conversation: ConversationItemProps, page = 1, append = false) => {
    try {
      setLoadingMessages(true);
      
      // Chamada real para a API
      const response = await axios.get(`/api/conversations/${conversation.id}/messages?page=${page}&limit=20`);
      
      if (response.status === 200) {
        const apiMessages = response.data;
        
        // Processa as mensagens recebidas
        const formattedMessages: Message[] = apiMessages.map((msg: any) => {
          // Garante que as datas sejam objetos Date válidos
          const timestampValue = msg.timestamp || msg.createdAt;
          const timestamp = new Date(timestampValue);
          const createdAt = new Date(msg.createdAt);
          const updatedAt = new Date(msg.updatedAt);
          
          return {
            ...msg,
            timestamp,
            createdAt,
            updatedAt
          };
        });
        
        // Ordena as mensagens pela data
        formattedMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        
        // Atualiza o estado
        if (append) {
          setMessages(prev => [...prev, ...formattedMessages]);
          setDisplayedMessages(prev => [...prev, ...formattedMessages]);
        } else {
          setMessages(formattedMessages);
          setDisplayedMessages(formattedMessages);
          setPage(1);
        }
        
        // Verifica se há mais mensagens
        setHasMoreMessages(formattedMessages.length === 20);
      } else {
        console.error('Erro ao carregar mensagens:', response);
        
        // Estado vazio em caso de erro
        if (!append) {
          setMessages([]);
          setDisplayedMessages([]);
        }
      }
      
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Função para verificar a semelhança entre uma conversa e a consulta de pesquisa
  const matchesSearchQuery = (conversation: ConversationItemProps, query: string): boolean => {
    if (!query) return true;
    
    const lowerQuery = query.toLowerCase();
    const matchesName = conversation.name?.toLowerCase().includes(lowerQuery);
    const matchesLastMessage = conversation.lastMessage?.toLowerCase().includes(lowerQuery);
    
    return matchesName || matchesLastMessage;
  };

  // Função para selecionar uma conversa
  const handleSelectConversation = (conversation: ConversationItemProps) => {
    setSelectedConversation(conversation);
  };
  
  // Função para enviar uma mensagem
  const handleSendMessage = async (text: string) => {
    if (text.trim() && selectedConversation) {
      setIsSending(true);
      
      try {
        console.log('Preparando para enviar mensagem:', text, 'para conversa:', selectedConversation);
        
        // Identificando o número de telefone a partir do identificador da conversa
        // Normalmente o identificador está no formato "WhatsApp 5511999999999"
        const phoneNumber = selectedConversation.identifier?.replace(/\D/g, '') || '';
        
        if (!phoneNumber) {
          throw new Error('Não foi possível identificar o número de telefone para esta conversa');
        }
        
        // Adiciona uma mensagem temporária na UI
        const newMessage: Message = {
          id: Date.now(), // Temporário até receber o ID real do backend
          conversationId: parseInt(selectedConversation.id), // Convertendo para número
          content: text,
          type: 'text',
          sender: 'user' as 'user', // Força o tipo correto
          status: 'sending', // Status inicial
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Adiciona a mensagem ao estado
        setMessages(prev => [...prev, newMessage]);
        setDisplayedMessages(prev => [...prev, newMessage]);
        
        try {
          // Tenta enviar a mensagem através da Z-API diretamente
          console.log('Enviando mensagem via Z-API para:', phoneNumber);
          const result = await sendTextMessage({
            channelId: parseInt(selectedConversation.id),
            to: phoneNumber,
            message: text
          });
          
          console.log('Resultado do envio via Z-API:', result);
          
          if (result.success) {
            console.log('Mensagem enviada com sucesso via Z-API:', result);
            
            // Agora salva a mensagem no backend
            try {
              const apiResponse = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  conversationId: parseInt(selectedConversation.id),
                  content: text,
                  type: 'text',
                  sender: 'user' as 'user'
                }),
              });
              
              const savedMessage = await apiResponse.json();
              console.log('Mensagem salva no backend:', savedMessage);
              
              // Atualiza o status da mensagem para entregue
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === newMessage.id 
                    ? { 
                        ...msg, 
                        id: savedMessage.id || msg.id,
                        status: 'delivered',
                        messageId: result.messageId // Armazenar o ID retornado pela API
                      } 
                    : msg
                )
              );
              setDisplayedMessages(prev => 
                prev.map(msg => 
                  msg.id === newMessage.id 
                    ? { 
                        ...msg, 
                        id: savedMessage.id || msg.id,
                        status: 'delivered',
                        messageId: result.messageId
                      } 
                    : msg
                )
              );
            } catch (saveError) {
              console.error('Erro ao salvar mensagem no backend:', saveError);
              // Mesmo com erro ao salvar, a mensagem foi enviada
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === newMessage.id 
                    ? { ...msg, status: 'delivered' } 
                    : msg
                )
              );
              setDisplayedMessages(prev => 
                prev.map(msg => 
                  msg.id === newMessage.id 
                    ? { ...msg, status: 'delivered' } 
                    : msg
                )
              );
            }
          } else {
            console.error('Falha ao enviar mensagem via Z-API:', result.message);
            
            // Atualiza o status da mensagem para erro
            setMessages(prev => 
              prev.map(msg => 
                msg.id === newMessage.id 
                  ? { ...msg, status: 'error' } 
                  : msg
              )
            );
            setDisplayedMessages(prev => 
              prev.map(msg => 
                msg.id === newMessage.id 
                  ? { ...msg, status: 'error' } 
                  : msg
              )
            );
            
            // Mostrar mensagem de erro detalhada com toast ou alert
            const errorMsg = result.message || 'Falha ao enviar mensagem através da API Z-API';
            alert(`Erro ao enviar a mensagem: ${errorMsg}`);
          }
        } catch (sendError: any) {
          console.error('Erro ao enviar mensagem via Z-API:', sendError);
          
          // Atualiza o status da mensagem para erro
          setMessages(prev => 
            prev.map(msg => 
              msg.id === newMessage.id 
                ? { ...msg, status: 'error' } 
                : msg
            )
          );
          setDisplayedMessages(prev => 
            prev.map(msg => 
              msg.id === newMessage.id 
                ? { ...msg, status: 'error' } 
                : msg
            )
          );
          
          // Extrair a mensagem de erro mais detalhada possível
          const errorMessage = sendError.message || 'Erro desconhecido';
          alert(`Erro ao enviar a mensagem via WhatsApp: ${errorMessage}. Verifique as credenciais da Z-API e tente novamente.`);
        }
        
        setIsSending(false);
      } catch (error) {
        console.error('Erro geral ao enviar mensagem:', error);
        alert('Erro ao enviar a mensagem. Verifique a conexão e tente novamente.');
        setIsSending(false);
      }
    }
  };

  const validateImage = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 16 * 1024 * 1024; // 16MB (limite do WhatsApp)
    
    if (!validTypes.includes(file.type)) {
      throw new Error('Formato de imagem não suportado. Use JPG ou PNG.');
    }
    
    if (file.size > maxSize) {
      throw new Error('Imagem muito grande. O tamanho máximo é 16MB.');
    }
    
    return true;
  };

  const handleSendAttachment = async (file: File, type: string) => {
    try {
      if (!selectedConversation) {
        throw new Error('Nenhuma conversa selecionada');
      }

      const phoneNumber = selectedConversation.phone;
      if (!phoneNumber) {
        throw new Error('Número de telefone não encontrado');
      }

      setIsSending(true);

      if (type === 'image') {
        // Validar imagem
        validateImage(file);

        // Criar mensagem temporária
        const newMessage = {
          id: `temp-${Date.now()}`,
          content: `[Imagem: ${file.name}]`,
          type: 'image',
          sender: 'user',
          timestamp: new Date().toISOString(),
          status: 'sending',
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
          }
        };

        // Adicionar mensagem temporária
        setMessages(prev => [...prev, newMessage]);
        setDisplayedMessages(prev => [...prev, newMessage]);

        // Converter para Base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Enviar imagem
        const response = await fetch('/api/messages/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber,
            type: 'image',
            imageUrl: base64,
            caption: '',
            channelId: parseInt(selectedConversation.id)
          })
        });

        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Imagem enviada com sucesso via WhatsApp');
          
          // Atualizar status da mensagem para entregue
          setMessages(prev => 
            prev.map(msg => 
              msg.id === newMessage.id 
                ? { ...msg, status: 'delivered', messageId: result.messageId } 
                : msg
            )
          );
          setDisplayedMessages(prev => 
            prev.map(msg => 
              msg.id === newMessage.id 
                ? { ...msg, status: 'delivered', messageId: result.messageId } 
                : msg
            )
          );
          
          // Salvar no backend
          try {
            const apiResponse = await fetch('/api/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                conversationId: parseInt(selectedConversation.id),
                content: `[Imagem: ${file.name}]`,
                type: 'image',
                sender: 'user',
                metadata: { 
                  imageUrl: base64,
                  fileName: file.name,
                  fileSize: file.size,
                  fileType: file.type,
                  zapiMessageId: result.messageId 
                }
              }),
            });
            
            const savedMessage = await apiResponse.json();
            console.log('✅ Mensagem salva no backend:', savedMessage);
          } catch (saveError) {
            console.error('❌ Erro ao salvar mensagem no backend:', saveError);
          }
        } else {
          throw new Error(result.message || 'Erro ao enviar imagem');
        }
      } else {
        console.log(`Envio de ${type} ainda não implementado`);
      }
      
    } catch (error) {
      console.error('❌ Erro ao enviar imagem:', error);
      
      // Atualizar status da mensagem para erro se ela foi criada
      setMessages(prev => 
        prev.map(msg => 
          msg.status === 'sending' 
            ? { ...msg, status: 'error', error: error instanceof Error ? error.message : 'Erro desconhecido' } 
            : msg
        )
      );
      setDisplayedMessages(prev => 
        prev.map(msg => 
          msg.status === 'sending' 
            ? { ...msg, status: 'error', error: error instanceof Error ? error.message : 'Erro desconhecido' } 
            : msg
        )
      );

      // Mostrar erro para o usuário
      alert(error instanceof Error ? error.message : 'Erro ao enviar imagem');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid h-screen overflow-hidden bg-background" style={{gridTemplateColumns: '340px minmax(0, 1fr) 280px'}}>
      {/* Sidebar esquerda: Lista de conversas */}
      <div className="border-r flex flex-col h-full overflow-hidden">
        {/* Cabeçalho com opções de filtro e pesquisa */}
        <div className="p-3 border-b shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar conversas..."
                  className="pl-9 h-9 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 px-2.5"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              <ChevronDown className={cn("h-4 w-4 ml-1 transition-transform", showAdvancedFilters && "rotate-180")} />
            </Button>
            
            <Button variant="default" size="icon" className="h-9 w-9">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex mb-3 border rounded-md overflow-hidden bg-muted/20">
            <Button 
              variant={activeTab === 'all' ? 'secondary' : 'ghost'}
              className="flex-1 h-8 rounded-none text-xs font-normal"
              onClick={() => setActiveTab('all')}
            >
              Todos
            </Button>
            <Button 
              variant={activeTab === 'unread' ? 'secondary' : 'ghost'}
              className="flex-1 h-8 rounded-none text-xs font-normal"
              onClick={() => setActiveTab('unread')}
            >
              Não lidos
            </Button>
            <Button 
              variant={activeTab === 'assigned' ? 'secondary' : 'ghost'}
              className="flex-1 h-8 rounded-none text-xs font-normal"
              onClick={() => setActiveTab('assigned')}
            >
              Atribuídos
            </Button>
          </div>
          
          {/* Filtros avançados */}
          {showAdvancedFilters && (
            <div className="py-2 px-1 border rounded-md space-y-3 text-sm bg-muted/5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Canais</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {channelOptions.map(channel => (
                    <div 
                      key={channel.value} 
                      className={cn(
                        "px-2 py-1.5 rounded-md flex items-center text-xs cursor-pointer",
                        selectedChannels.includes(channel.value) 
                          ? "bg-primary/10 text-primary" 
                          : "hover:bg-muted"
                      )}
                      onClick={() => {
                        if (selectedChannels.includes(channel.value)) {
                          setSelectedChannels(prev => prev.filter(c => c !== channel.value));
                        } else {
                          setSelectedChannels(prev => [...prev, channel.value]);
                        }
                      }}
                    >
                      {channel.icon}
                      {channel.label}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Status</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {statusOptions.map(status => (
                    <div 
                      key={status.value} 
                      className={cn(
                        "px-2 py-1.5 rounded-md flex items-center text-xs cursor-pointer",
                        selectedStatuses.includes(status.value) 
                          ? "bg-primary/10 text-primary" 
                          : "hover:bg-muted"
                      )}
                      onClick={() => {
                        if (selectedStatuses.includes(status.value)) {
                          setSelectedStatuses(prev => prev.filter(s => s !== status.value));
                        } else {
                          setSelectedStatuses(prev => [...prev, status.value]);
                        }
                      }}
                    >
                      {status.label}
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
        </div>
        
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
      <div className="flex flex-col bg-muted/10 h-full overflow-hidden">
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
            
            {/* Área de composição de mensagem com o novo componente MessageComposer */}
            <MessageComposer 
              onSendMessage={handleSendMessage}
              onSendAttachment={handleSendAttachment}
              isSending={isSending}
            />
            
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
      <div className="border-l hidden md:block h-full bg-background overflow-hidden">
        {selectedConversation && (
          <Tabs value={contextPanelTab} onValueChange={setContextPanelTab} className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="notes">Anotações</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="flex-1 p-4 overflow-y-auto space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Detalhes do contato</h3>
                <div className="space-y-3">
                  <div className="flex items-start text-sm">
                    <User className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{selectedConversation.name}</div>
                      <div className="text-xs text-muted-foreground">{selectedConversation.phone || 'Sem telefone'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start text-sm">
                    <BadgeIcon className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Status</div>
                      <div className="text-xs">
                        <Badge variant="outline" className="rounded-sm text-xs font-normal">
                          {selectedConversation.status === 'resolved' ? 'Resolvido' : 
                           selectedConversation.status === 'pending' ? 'Pendente' : 'Em aberto'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start text-sm">
                    <Users className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Atribuído a</div>
                      <div className="text-xs text-muted-foreground">
                        {selectedConversation.assignedTo || 'Não atribuído'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start text-sm">
                    <CalendarRange className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Iniciado em</div>
                      <div className="text-xs text-muted-foreground">
                        {selectedConversation.createdAt && isValidDate(selectedConversation.createdAt)
                          ? format(new Date(selectedConversation.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                          : 'Data desconhecida'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start text-sm">
                    <Clock className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Última atividade</div>
                      <div className="text-xs text-muted-foreground">
                        {selectedConversation.lastActivity && isValidDate(selectedConversation.lastActivity)
                          ? format(new Date(selectedConversation.lastActivity), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                          : 'Sem atividade'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-2">Ações rápidas</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="justify-start text-xs h-8">
                    <User className="h-3.5 w-3.5 mr-1.5" /> Ver perfil
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start text-xs h-8">
                    <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Nova conversa
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start text-xs h-8">
                    <Tag className="h-3.5 w-3.5 mr-1.5" /> Adicionar tag
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start text-xs h-8">
                    <LinkIcon className="h-3.5 w-3.5 mr-1.5" /> Copiar link
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Anotações rápidas</h3>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Nova
                  </Button>
                </div>
                
                {selectedConversation.notes && selectedConversation.notes.length > 0 ? (
                  <div className="space-y-2">
                    {selectedConversation.notes.map((note, i) => (
                      <div key={i} className="text-xs p-2 border rounded-md bg-muted/10">
                        <div className="font-medium">{note.title}</div>
                        <p className="text-muted-foreground">{note.content}</p>
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {note.date && isValidDate(note.date) 
                            ? format(new Date(note.date), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                            : ''}
                          {note.author && ` - ${note.author}`}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground py-2">
                    Sem anotações para este contato.
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="notes" className="flex-1 p-4 overflow-y-auto">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Anotações da conversa</h3>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Nova anotação
                  </Button>
                </div>
                <Textarea 
                  placeholder="Adicione uma nova anotação sobre esta conversa..." 
                  className="resize-none h-24 text-sm"
                />
                <div className="flex justify-end mt-2">
                  <Button size="sm" className="h-7 text-xs">Salvar anotação</Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 border rounded-md">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">Carlos Nogueira</span>
                    </div>
                    <Badge variant="outline" className="text-xs font-normal">Interna</Badge>
                  </div>
                  <p className="text-sm">Cliente solicitou cotação para contratação de múltiplos cursos para sua equipe. Verificar com o departamento comercial possibilidade de desconto corporativo.</p>
                  <div className="text-xs text-muted-foreground mt-2">
                    Há 2 dias atrás
                  </div>
                </div>
                
                <div className="p-3 border rounded-md">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>JP</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">João Paulo</span>
                    </div>
                    <Badge variant="outline" className="text-xs font-normal">Interna</Badge>
                  </div>
                  <p className="text-sm">Histórico de pagamentos verificado. Cliente com bom histórico, aprovado para oferta de condições especiais caso solicitado.</p>
                  <div className="text-xs text-muted-foreground mt-2">
                    Há 3 dias atrás
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Histórico de atividades</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="bg-primary/10 p-1.5 rounded-full">
                        <MessageSquare className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1 text-sm">
                        <p>Conversa iniciada</p>
                        <span className="text-xs text-muted-foreground">
                          Hoje, 09:45
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <div className="bg-primary/10 p-1.5 rounded-full">
                        <Users className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1 text-sm">
                        <p>Conversa atribuída a <span className="font-medium">Carlos Nogueira</span></p>
                        <span className="text-xs text-muted-foreground">
                          Hoje, 10:12
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <div className="bg-primary/10 p-1.5 rounded-full">
                        <Tag className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1 text-sm">
                        <p>Tag <span className="font-medium">Vendas</span> adicionada</p>
                        <span className="text-xs text-muted-foreground">
                          Hoje, 10:30
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <div className="bg-primary/10 p-1.5 rounded-full">
                        <Tag className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1 text-sm">
                        <p>Tag <span className="font-medium">VIP</span> adicionada</p>
                        <span className="text-xs text-muted-foreground">
                          Hoje, 10:30
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <div className="bg-primary/10 p-1.5 rounded-full">
                        <Eye className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1 text-sm">
                        <p>Mensagens visualizadas por <span className="font-medium">Carlos Nogueira</span></p>
                        <span className="text-xs text-muted-foreground">
                          Hoje, 11:05
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Interações anteriores</h3>
                  <div className="space-y-3">
                    <div className="p-2 border rounded-md">
                      <div className="flex justify-between items-center">
                        <div className="font-medium text-sm">Dúvida sobre curso</div>
                        <Badge variant="outline" className="text-xs">Resolvido</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Atendente: João Paulo - 15/04/2023
                      </p>
                    </div>
                    
                    <div className="p-2 border rounded-md">
                      <div className="flex justify-between items-center">
                        <div className="font-medium text-sm">Suporte técnico</div>
                        <Badge variant="outline" className="text-xs">Resolvido</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Atendente: Maria Silva - 02/03/2023
                      </p>
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
}