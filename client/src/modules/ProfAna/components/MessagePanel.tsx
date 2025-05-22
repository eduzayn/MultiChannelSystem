import { useState, useRef, useEffect } from "react";
import { Conversation } from "../types";
import { MessageBubble } from "./MessageBubble";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Mic, PauseCircle, Send } from "lucide-react";

interface MessagePanelProps {
  conversation: Conversation;
  onSendMessage: (content: string, audioUrl?: string) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  isRecording: boolean;
  recordingTime: number;
}

export const MessagePanel = ({
  conversation,
  onSendMessage,
  onStartRecording,
  onStopRecording,
  isRecording,
  recordingTime,
}: MessagePanelProps) => {
  const [message, setMessage] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Sempre rolar para a última mensagem quando a conversa for atualizada
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Formatar o tempo de gravação como MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-full w-full bg-background relative overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center shrink-0">
        <div className="flex items-center ml-9">
          <div className="flex items-center justify-center bg-primary/10 rounded-full w-9 h-9 mr-3">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Prof. Ana</h2>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4 max-w-md">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold">Prof. Ana - Sua Assistente Virtual</h2>
              <p className="text-muted-foreground">
                Olá! Sou a Prof. Ana, sua assistente virtual. Estou aqui para responder suas perguntas
                sobre produtos, serviços, processos internos, ou qualquer outro tema que esteja na minha base de conhecimento.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => onSendMessage("Como posso criar uma campanha de marketing?")}>
                  Como criar uma campanha?
                </Button>
                <Button variant="outline" onClick={() => onSendMessage("Quais são os principais recursos do sistema?")}>
                  Principais recursos
                </Button>
                <Button variant="outline" onClick={() => onSendMessage("Como configurar um novo canal de comunicação?")}>
                  Configurar canais
                </Button>
                <Button variant="outline" onClick={() => onSendMessage("Quais são as melhores práticas de atendimento?")}>
                  Melhores práticas
                </Button>
              </div>
            </div>
          </div>
        ) : (
          conversation.messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        <div ref={messageEndRef} />
      </div>

      {/* Composer - fixado na parte inferior */}
      <div className="border-t border-border p-4 mt-auto shrink-0">
        {isRecording ? (
          <div className="flex items-center space-x-2 bg-background border rounded-lg p-3">
            <div className="flex-1">
              <div className="flex items-center">
                <div className="mr-2 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-medium">Gravando</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {formatTime(recordingTime)}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onStopRecording}>
              <PauseCircle className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-end space-x-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem para a Prof. Ana..."
              className="min-h-[80px] max-h-[200px] flex-1 resize-none"
              rows={3}
            />
            <div className="flex flex-col space-y-2">
              <Button 
                type="submit"
                size="icon"
                disabled={!message.trim()}
                onClick={handleSendMessage}
              >
                <Send className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={onStartRecording}
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};