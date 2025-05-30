import { Button } from "@/components/ui/button";
import { Conversation } from "../types";
import { Card } from "@/components/ui/card";
import { Plus, Star, StarOff, Trash2 } from "lucide-react";
import { formatRelative } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  onNewConversation: () => void;
}

export const ChatSidebar = ({
  conversations,
  activeConversationId,
  setActiveConversationId,
  onNewConversation,
}: ChatSidebarProps) => {
  // Ordena as conversas: fixadas primeiro, depois por data (mais recente primeiro)
  const sortedConversations = [...conversations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <div className="h-full flex flex-col border-r border-border bg-background">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <span className="mr-2">Prof. Ana</span>
        </h2>
        <Button className="w-full" onClick={onNewConversation}>
          <Plus className="mr-2 h-4 w-4" />
          Nova conversa
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sortedConversations.map((conversation) => (
          <Card
            key={conversation.id}
            className={`p-3 cursor-pointer transition-colors hover:bg-accent ${
              activeConversationId === conversation.id
                ? "border-primary bg-accent"
                : ""
            }`}
            onClick={() => setActiveConversationId(conversation.id)}
          >
            <div className="flex justify-between">
              <div className="flex-1 truncate">
                <h3 className="font-medium truncate">
                  {conversation.title || "Nova conversa"}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {conversation.messages.length > 0
                    ? conversation.messages[
                        conversation.messages.length - 1
                      ].content.substring(0, 30) + "..."
                    : "Sem mensagens"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatRelative(conversation.createdAt, new Date(), {
                    locale: ptBR,
                  })}
                </p>
              </div>
              <div className="flex flex-col">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                >
                  {conversation.isPinned ? (
                    <Star className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};