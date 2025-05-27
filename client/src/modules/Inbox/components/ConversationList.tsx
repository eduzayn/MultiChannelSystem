import { useState, useEffect, useRef } from "react";
import { ConversationItem, ConversationItemProps } from "./ConversationItem";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

// Função para formatar a última mensagem, tratando objetos JSON e mensagens Z-API
const formatLastMessage = (lastMessage: string): string => {
  if (!lastMessage) return "";
  
  // Se a mensagem parece ser um objeto JSON
  if (lastMessage.startsWith('{') && lastMessage.endsWith('}')) {
    try {
      const messageObj = JSON.parse(lastMessage);
      
      // Verificar formatos específicos da Z-API
      if (messageObj.text && messageObj.text.message) {
        return messageObj.text.message;
      }
      
      // Verificar formatos de webhook da Z-API
      if (messageObj.body && messageObj.body.text) {
        return messageObj.body.text;
      }
      
      if (messageObj.body && messageObj.body.caption) {
        return messageObj.body.caption;
      }
      
      // Verificar formatos de mensagens interativas
      if (messageObj.buttonList && messageObj.message) {
        return `${messageObj.message} [Mensagem com botões]`;
      }
      
      if (messageObj.listMessage && messageObj.listMessage.description) {
        return `${messageObj.listMessage.description} [Lista de opções]`;
      }
      
      // Se o objeto tiver um campo de texto ou mensagem, usar esse valor
      if (messageObj.text) return messageObj.text;
      if (messageObj.message) return messageObj.message;
      if (messageObj.body) return messageObj.body;
      if (messageObj.content) return messageObj.content;
      
      // Se for um tipo especial de mensagem
      if (messageObj.type === 'image' || messageObj.body?.type === 'image') return '🖼️ Imagem';
      if (messageObj.type === 'video' || messageObj.body?.type === 'video') return '🎥 Vídeo';
      if (messageObj.type === 'audio' || messageObj.body?.type === 'audio' || messageObj.body?.type === 'ptt') return '🔊 Áudio';
      if (messageObj.type === 'document' || messageObj.body?.type === 'document') return '📄 Documento';
      if (messageObj.type === 'location' || messageObj.body?.type === 'location') return '📍 Localização';
      if (messageObj.type === 'contact' || messageObj.body?.type === 'contact') return '👤 Contato';
      if (messageObj.type === 'button-list' || messageObj.body?.type === 'button-list') return '🔘 Mensagem com botões';
      if (messageObj.type === 'option-list' || messageObj.body?.type === 'option-list') return '📋 Lista de opções';
      if (messageObj.type === 'interactive' || messageObj.body?.type === 'interactive') return '🔄 Mensagem interativa';
      
      // Verificar se é uma mensagem de status (ReceivedCallback, MessageStatusCallback, etc.)
      if (messageObj.type && messageObj.type.includes('Callback')) {
        return 'Atualização de status';
      }
      
      // Fallback para outros objetos JSON - tentar extrair qualquer texto útil
      for (const key in messageObj) {
        if (typeof messageObj[key] === 'string' && messageObj[key].length > 0) {
          return messageObj[key].length > 30 ? messageObj[key].substring(0, 30) + "..." : messageObj[key];
        }
      }
      
      return "Nova mensagem";
    } catch (e) {
      // Se falhar o parse, retornar a mensagem original com limite de caracteres
      return lastMessage.length > 30 ? lastMessage.substring(0, 30) + "..." : lastMessage;
    }
  }
  
  // Se for uma string normal, retornar com limite de caracteres
  return lastMessage.length > 30 ? lastMessage.substring(0, 30) + "..." : lastMessage;
};

// Mock data para backup/fallback
const mockConversations: ConversationItemProps[] = [
  {
    id: "1",
    name: "Maria Santos",
    lastMessage: "Olá, preciso de ajuda com meu pedido #1234",
    timestamp: new Date(Date.now() - 15 * 60000),
    unreadCount: 3,
    channel: "whatsapp",
    status: "open",
    priority: "high",
    sla: 10,
    waitingTime: 15,
    tags: ["Urgente", "VIP"]
  },
  {
    id: "2",
    name: "João Pereira",
    lastMessage: "Sim, isso resolve meu problema. Obrigado!",
    timestamp: new Date(Date.now() - 60 * 60000),
    unreadCount: 0,
    channel: "instagram",
    status: "pending",
    priority: "medium",
    sla: 30,
    tags: ["Suporte"]
  },
];

interface ConversationListProps {
  onSelectConversation: (conversation: ConversationItemProps) => void;
  limit?: number; // Número máximo de conversas a mostrar
  activeTab?: string; // Aba ativa para filtragem
  searchQuery?: string; // Consulta de busca
  selectedConversation?: ConversationItemProps | null; // Conversa selecionada
  filters?: {
    channels?: string[];
    statuses?: string[];
    sortBy?: string;
  }; // Filtros adicionais
}

export const ConversationList = ({ 
  onSelectConversation, 
  limit,
  activeTab = 'all',
  searchQuery = '',
  selectedConversation = null,
  filters = {}
}: ConversationListProps) => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [storedData, setStoredData] = useState<ConversationItemProps[]>([]);
  const [showAllConversations, setShowAllConversations] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Buscar conversas do servidor
  const { data: conversations, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/conversations'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/conversations');
        
        // Substituir log detalhado por um resumo da quantidade
        console.log(`Recebendo ${response.data.length} conversas do servidor`);
        
        // Mapeamos e adicionamos propriedades extras para demonstração visual dos indicadores
        return response.data.map((conversation: any, index: number) => {
          // Propriedades extras para demonstração visual (na versão final seriam vindo do backend)
          const priority = index % 10 === 0 ? 'high' : index % 5 === 0 ? 'low' : 'medium';
          const sla = index % 7 === 0 ? 5 : index % 3 === 0 ? 12 : undefined;
          const waitingTime = index % 11 === 0 ? 65 : index % 4 === 0 ? 35 : undefined;
          const active = index % 6 === 0;
          
          // Tags baseadas em padrões para demonstração
          const tags = [];
          if (index % 8 === 0) tags.push('VIP');
          if (index % 9 === 0) tags.push('Urgente');
          if (index % 12 === 0) tags.push('Suporte');
          if (index % 15 === 0) tags.push('Vendas');
          
          // Status da conversa para demonstração
          const status = index % 13 === 0 ? 'resolved' : 
                         index % 7 === 0 ? 'pending' : 
                         index % 21 === 0 ? 'closed' : 'open';
          
          // Verificar se lastMessageAt é uma data válida
          let timestamp;
          try {
            if (conversation.lastMessageAt) {
              const date = new Date(conversation.lastMessageAt);
              timestamp = !isNaN(date.getTime()) ? date : new Date();
            } else {
              timestamp = new Date();
            }
          } catch (error) {
            timestamp = new Date(); // Fallback para data atual em caso de erro
          }
          
          // Garante que campos importantes estejam presentes para filtragem
          const normalizedName = conversation.name ? conversation.name.toLowerCase() : '';
          const normalizedIdentifier = conversation.identifier ? conversation.identifier.toLowerCase() : '';
          const searchableFields = [normalizedName, normalizedIdentifier].filter(Boolean).join(' ');
          
          return {
            id: conversation.id.toString(),
            name: conversation.name,
            lastMessage: formatLastMessage(conversation.lastMessage) || "Nova conversa",
            timestamp: timestamp,
            unreadCount: conversation.unreadCount || 0,
            channel: conversation.channel,
            status: conversation.status || status,
            contactId: conversation.contactId,
            identifier: conversation.identifier,
            avatar: conversation.avatar,
            // Campo para busca
            searchableText: searchableFields,
            // Propriedades extras
            priority,
            sla,
            waitingTime,
            active,
            tags
          };
        });
      } catch (err) {
        console.error("Erro ao buscar conversas:", err);
        // Em caso de erro, retornar mock data para feedback visual
        return mockConversations;
      }
    },
    refetchInterval: 5000, // 5 segundos para reduzir carga no servidor
    refetchOnWindowFocus: true, // Recarregar quando a janela ganhar foco
    staleTime: 3000 // 3 segundos
  });
  
  // Salvar a posição de scroll antes de atualizar
  const saveScrollPosition = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.dataset.scrollTop = scrollContainerRef.current.scrollTop.toString();
    }
  };

  // Restaurar a posição de scroll após atualizar
  const restoreScrollPosition = () => {
    if (scrollContainerRef.current && scrollContainerRef.current.dataset.scrollTop) {
      scrollContainerRef.current.scrollTop = parseInt(scrollContainerRef.current.dataset.scrollTop);
    }
  };
  
  // Atualizando dados preservando a posição de scroll
  useEffect(() => {
    if (conversations) {
      // Primeiro verificamos se os dados são diferentes para evitar atualizações desnecessárias
      if (storedData.length !== conversations.length || 
          JSON.stringify(storedData.map((c: ConversationItemProps) => c.id)) !== 
          JSON.stringify(conversations.map((c: ConversationItemProps) => c.id))) {
        
        // Salvamos a posição de rolagem
        saveScrollPosition();
        
        // Atualizamos os dados
        setStoredData(conversations);
        
        // Aguardamos um tick para garantir que o DOM foi atualizado
        setTimeout(() => {
          restoreScrollPosition();
        }, 0);
      }
    }
  }, [conversations]);
  
  // Polling periódico para garantir atualizações com preservação da posição de rolagem
  useEffect(() => {
    // Usamos um intervalo mais longo (7s) do que o refetchInterval (5s) 
    // para evitar muitas requisições simultâneas
    const intervalId = setInterval(() => {
      // Salvamos a posição de rolagem antes de atualizar
      saveScrollPosition();
      
      // Executamos o refetch e depois restauramos a posição
      refetch().then(() => {
        // Pequeno atraso para garantir que o DOM foi atualizado
        setTimeout(() => {
          restoreScrollPosition();
        }, 0);
      }).catch(error => {
        // Em caso de erro, ainda tentamos restaurar a posição
        setTimeout(() => {
          restoreScrollPosition();
        }, 0);
      });
    }, 7000);
    
    return () => clearInterval(intervalId);
  }, [refetch]);
  
  const handleSelectConversation = (conversation: ConversationItemProps) => {
    setActiveConversationId(conversation.id);
    onSelectConversation(conversation);
  };

  // Aplicar filtros de pesquisa e outros filtros às conversas
  const filterConversations = (convs: ConversationItemProps[]) => {
    return convs.filter(conversation => {
      // Filtrar por texto de pesquisa
      if (searchQuery && searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        
        // Verificar no campo searchableText criado especialmente para buscas
        if (conversation.searchableText) {
          if (!conversation.searchableText.includes(query)) {
            return false;
          }
        }
        // Ou usar o nome e lastMessage se searchableText não estiver disponível
        else if (
          !(conversation.name?.toLowerCase().includes(query) || 
            conversation.lastMessage?.toLowerCase().includes(query) ||
            (conversation.identifier && conversation.identifier.toLowerCase().includes(query)))
        ) {
          return false;
        }
      }
      
      // Filtrar por aba ativa
      if (activeTab === 'unread' && (!conversation.unreadCount || conversation.unreadCount <= 0)) {
        return false;
      } else if (activeTab === 'assigned' && !conversation.assignedTo) {
        return false;
      }
      
      // Filtrar por canais
      if (filters.channels && filters.channels.length > 0) {
        if (!conversation.channel || !filters.channels.includes(conversation.channel)) {
          return false;
        }
      }
      
      // Filtrar por status
      if (filters.statuses && filters.statuses.length > 0) {
        if (!conversation.status || !filters.statuses.includes(conversation.status)) {
          return false;
        }
      }
      
      return true;
    });
  };
  
  // Ordenar conversas
  const sortConversations = (convs: ConversationItemProps[]) => {
    return [...convs].sort((a, b) => {
      if (filters.sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      } else if (filters.sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return (priorityOrder[a.priority as keyof typeof priorityOrder] || 1) - 
               (priorityOrder[b.priority as keyof typeof priorityOrder] || 1);
      } else {
        // Por padrão, ordenar por timestamp (mais recente primeiro)
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });
  };
  
  // Obter as conversas com filtros e ordenação aplicados
  const allConversations = storedData.length > 0 ? storedData : (conversations || mockConversations);
  const filteredConversations = sortConversations(filterConversations(allConversations));
  
  // Definir limite padrão de 20 conversas se nenhum limite for fornecido
  const effectiveLimit = limit || 20;
  
  // Limitar conversas mostradas se não estiver mostrando todas
  const conversationsToDisplay = !showAllConversations 
    ? filteredConversations.slice(0, effectiveLimit) 
    : filteredConversations;
  
  // Verificar se tem mais conversas além do limite
  const hasMoreConversations = filteredConversations.length > effectiveLimit;

  const handleLoadMore = () => {
    setShowAllConversations(true);
  };

  return (
    <div className="h-full flex flex-col w-full">
      {/* Lista de conversas - com scrollbar personalizada e forçadamente visível */}
      <div 
        className="flex-1 flex flex-col overflow-y-scroll pb-2 custom-scrollbar" 
        style={{ height: "calc(100vh - 230px)", width: "100%" }}
        ref={scrollContainerRef}
      >
        {isLoading && !storedData.length && (
          <div className="p-4 text-center">
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex p-3 border-b">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="ml-3 space-y-1 flex-1">
                    <div className="h-2 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {!isLoading && error && (
          <div className="p-4 text-center text-red-500">
            Erro ao carregar conversas. Tente novamente.
          </div>
        )}
        
        {!isLoading && conversationsToDisplay.length > 0 ? (
          <>
            {conversationsToDisplay.map((conversation: ConversationItemProps) => (
              <ConversationItem
                key={conversation.id}
                {...conversation}
                isActive={activeConversationId === conversation.id}
                onClick={() => handleSelectConversation(conversation)}
              />
            ))}
            
            {/* Botão para carregar mais conversas */}
            {hasMoreConversations && !showAllConversations && (
              <Button 
                variant="ghost"
                size="sm"
                className="mx-auto my-2 text-xs text-muted-foreground hover:text-primary"
                onClick={handleLoadMore}
              >
                Carregar mais conversas ({allConversations.length - (limit || 0)} restantes)
              </Button>
            )}
          </>
        ) : (
          !isLoading && !storedData.length && (
            <div className="p-4 text-center text-muted-foreground">
              Nenhuma conversa encontrada
            </div>
          )
        )}
      </div>
    </div>
  );
};
