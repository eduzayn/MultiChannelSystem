import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatInterface } from "@/modules/ProfAna/components/ChatInterface";
import { Conversation } from "@/modules/ProfAna/types";

export default function ProfAna() {
  // Estado para armazenar todas as conversas
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "inicial",
      title: "Nova conversa",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPinned: false
    }
  ]);

  // Estado para rastrear a conversa ativa
  const [activeConversationId, setActiveConversationId] = useState<string>("inicial");

  // Função para criar uma nova conversa
  const handleNewConversation = () => {
    const newConversation: Conversation = {
      id: uuidv4(),
      title: "Nova conversa",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPinned: false
    };

    setConversations([newConversation, ...conversations]);
    setActiveConversationId(newConversation.id);
  };

  // Obter a conversa ativa
  const activeConversation = conversations.find(
    (conv) => conv.id === activeConversationId
  ) || conversations[0];

  return (
    <div className="h-full">
      <ChatInterface
        conversation={activeConversation}
        conversations={conversations}
        setConversations={setConversations}
        activeConversationId={activeConversationId}
        setActiveConversationId={setActiveConversationId}
        onNewConversation={handleNewConversation}
      />
    </div>
  );
}