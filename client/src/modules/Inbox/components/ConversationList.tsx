import { useState, useEffect, useRef } from "react";
import { ConversationItem, ConversationItemProps } from "./ConversationItem";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

// Função para formatar a última mensagem, tratando objetos JSON
const formatLastMessage = (lastMessage: string): string => {
  if (!lastMessage) return "";
  
  // Se a mensagem parece ser um objeto JSON
  if (lastMessage.startsWith('{') && lastMessage.endsWith('}')) {
    try {
      const messageObj = JSON.parse(lastMessage);
      
      // Se o objeto tiver um campo de texto ou mensagem, usar esse valor
      if (messageObj.text) return messageObj.text;
      if (messageObj.message) return messageObj.message;
      if (messageObj.body) return messageObj.body;
      if (messageObj.content) return messageObj.content;
      
      // Se for um tipo especial de mensagem
      if (messageObj.type === 'image') return '🖼️ Imagem';
      if (messageObj.type === 'video') return '🎥 Vídeo';
      if (messageObj.type === 'audio') return '🔊 Áudio';
      if (messageObj.type === 'document') return '📄 Documento';
      if (messageObj.type === 'location') return '📍 Localização';
      if (messageObj.type === 'contact') return '👤 Contato';
      
      // Fallback para outros objetos JSON
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
    channel: "whatsapp"
  },
  {
    id: "2",
    name: "João Pereira",
    lastMessage: "Sim, isso resolve meu problema. Obrigado!",
    timestamp: new Date(Date.now() - 60 * 60000),
    unreadCount: 0,
    channel: "instagram"
  },
];

interface ConversationListProps {
  onSelectConversation: (conversation: ConversationItemProps) => void;
}

export const ConversationList = ({ onSelectConversation }: ConversationListProps) => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [storedData, setStoredData] = useState<ConversationItemProps[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Buscar conversas do servidor
  const { data: conversations, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/conversations'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/conversations');
        
        // Logging para debug
        console.log("Conversas recebidas do servidor:", response.data);
        
        return response.data.map((conversation: any) => ({
          id: conversation.id.toString(),
          name: conversation.name,
          lastMessage: formatLastMessage(conversation.lastMessage) || "Nova conversa",
          timestamp: conversation.lastMessageAt ? new Date(conversation.lastMessageAt) : new Date(),
          unreadCount: conversation.unreadCount || 0,
          channel: conversation.channel,
          status: conversation.status,
          contactId: conversation.contactId,
          identifier: conversation.identifier, // Adicionar o identificador
          avatar: conversation.avatar // Adicionar avatar, se existir
        }));
      } catch (err) {
        console.error("Erro ao buscar conversas:", err);
        // Em caso de erro, retornar mock data
        return mockConversations;
      }
    },
    refetchInterval: 3000, // Atualizar a cada 3 segundos para maior responsividade
    refetchOnWindowFocus: true, // Recarregar quando a janela ganhar foco
    staleTime: 2000 // Considerar os dados obsoletos após 2 segundos
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
      saveScrollPosition();
      setStoredData(conversations);
      // Aguarde um tick para garantir que o DOM foi atualizado
      setTimeout(() => {
        restoreScrollPosition();
      }, 0);
    }
  }, [conversations]);
  
  // Polling periódico adicional para garantir atualizações frequentes
  useEffect(() => {
    const intervalId = setInterval(() => {
      saveScrollPosition();
      refetch().then(() => {
        // Aguarde um tick para garantir que o DOM foi atualizado
        setTimeout(() => {
          restoreScrollPosition();
        }, 0);
      });
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [refetch]);
  
  const handleSelectConversation = (conversation: ConversationItemProps) => {
    setActiveConversationId(conversation.id);
    onSelectConversation(conversation);
  };

  // Determinar quais conversas exibir
  const conversationsToDisplay = storedData.length > 0 ? storedData : (conversations || mockConversations);

  return (
    <div className="h-full flex flex-col">
      {/* Lista de conversas */}
      <div 
        className="flex-1 flex flex-col overflow-y-auto" 
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
          conversationsToDisplay.map((conversation: ConversationItemProps) => (
            <ConversationItem
              key={conversation.id}
              {...conversation}
              isActive={activeConversationId === conversation.id}
              onClick={() => handleSelectConversation(conversation)}
            />
          ))
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