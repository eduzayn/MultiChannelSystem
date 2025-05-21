import { useState } from "react";
import { ConversationItem, ConversationItemProps } from "./ConversationItem";

// Mock data para as conversas
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
  {
    id: "3",
    name: "Ana Oliveira",
    lastMessage: "Quando meu pedido será entregue?",
    timestamp: new Date(Date.now() - 3 * 3600000),
    unreadCount: 2,
    channel: "facebook"
  },
  {
    id: "4",
    name: "Carlos Silva",
    lastMessage: "Segue o comprovante de pagamento em anexo.",
    timestamp: new Date(Date.now() - 12 * 3600000),
    unreadCount: 0,
    channel: "email"
  },
  {
    id: "5",
    name: "Beatriz Lima",
    lastMessage: "Preciso trocar o produto que recebi.",
    timestamp: new Date(Date.now() - 24 * 3600000),
    unreadCount: 1,
    channel: "whatsapp"
  },
  {
    id: "6",
    name: "Roberto Alves",
    lastMessage: "Olá, gostaria de saber mais sobre o produto X.",
    timestamp: new Date(Date.now() - 2 * 24 * 3600000),
    unreadCount: 0,
    channel: "instagram"
  },
];

interface ConversationListProps {
  onSelectConversation: (conversation: ConversationItemProps) => void;
}

export const ConversationList = ({ onSelectConversation }: ConversationListProps) => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  const handleSelectConversation = (conversation: ConversationItemProps) => {
    setActiveConversationId(conversation.id);
    onSelectConversation(conversation);
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Lista de conversas */}
      <div className="flex-1 flex flex-col">
        {mockConversations.length > 0 ? (
          mockConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              {...conversation}
              isActive={activeConversationId === conversation.id}
              onClick={() => handleSelectConversation(conversation)}
            />
          ))
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            Nenhuma conversa encontrada
          </div>
        )}
      </div>
    </div>
  );
};