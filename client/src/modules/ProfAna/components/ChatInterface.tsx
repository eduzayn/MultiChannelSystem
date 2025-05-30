import { useState, useRef, useEffect } from "react";
import { ChatSidebar } from "./ChatSidebar";
import { MessagePanel } from "./MessagePanel";
import { ContextPanel } from "./ContextPanel";
import { Conversation, Message } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Brain, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

interface ChatInterfaceProps {
  conversation: Conversation;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  activeConversationId: string;
  setActiveConversationId: React.Dispatch<React.SetStateAction<string>>;
  onNewConversation: () => void;
}

export const ChatInterface = ({
  conversation,
  conversations,
  setConversations,
  activeConversationId,
  setActiveConversationId,
  onNewConversation,
}: ChatInterfaceProps) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [contextOpen, setContextOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Limpar timer ao desmontar o componente
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleToggleContext = () => {
    setContextOpen(!contextOpen);
  };

  const sendMessage = (content: string, audioUrl?: string) => {
    if (!content.trim() && !audioUrl) return;

    // Criar mensagem do usuário
    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content,
      timestamp: new Date(),
      audioUrl: audioUrl,
    };

    // Criar uma resposta simulada da assistente
    const assistantMessage: Message = {
      id: uuidv4(),
      role: "assistant",
      content: `Olá! Sou a Prof. Ana, sua assistente virtual. ${
        content.includes("?") 
          ? "Vou ajudar você com sua pergunta." 
          : "Estou aqui para auxiliar você!"
      }`,
      timestamp: new Date(Date.now() + 500),
      sources: content.toLowerCase().includes("produto") 
        ? [{ title: "Manual do Produto", url: "#" }] 
        : undefined,
    };

    // Atualizar a conversa com ambas as mensagens
    const updatedConversation = {
      ...conversation,
      messages: [...conversation.messages, userMessage, assistantMessage],
      title: conversation.messages.length === 0 
        ? content.slice(0, 30) + (content.length > 30 ? "..." : "") 
        : conversation.title,
    };

    // Atualizar o estado de conversas
    setConversations(
      conversations.map((conv) =>
        conv.id === activeConversationId ? updatedConversation : conv
      )
    );

    // Em uma implementação real, enviaríamos a mensagem para um backend e receberíamos a resposta da IA
    // Aqui estamos apenas simulando uma resposta após um breve delay
    toast({
      title: "Mensagem enviada",
      description: "A Prof. Ana está processando sua mensagem.",
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setIsRecording(false);
        
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        
        // Simular transcrição (em um cenário real, enviaríamos para uma API de transcrição)
        const transcription = "Mensagem de áudio transcrita simulada.";
        
        // Criamos uma URL temporária para o áudio
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Enviar mensagem com o áudio e transcrição
        sendMessage(transcription, audioUrl);
        
        // Liberar as trilhas de áudio
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Iniciar gravação
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Iniciar contador
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      toast({
        variant: "destructive",
        title: "Erro de gravação",
        description: "Não foi possível acessar o microfone.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Barra lateral de conversas */}
      <div
        className={`h-full transition-all duration-300 ${
          sidebarOpen ? "w-72" : "w-0"
        }`}
      >
        {sidebarOpen && (
          <ChatSidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            setActiveConversationId={setActiveConversationId}
            onNewConversation={onNewConversation}
          />
        )}
      </div>

      {/* Painel principal de mensagens */}
      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex flex-1 flex-col h-full">
          {/* Botão de toggle do sidebar */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 left-2 z-10"
            onClick={handleToggleSidebar}
          >
            {sidebarOpen ? <ChevronLeft /> : <MessageSquare />}
          </Button>

          <MessagePanel
            conversation={conversation}
            onSendMessage={sendMessage}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            isRecording={isRecording}
            recordingTime={recordingTime}
          />
        </div>

        {/* Painel de contexto (opcional) */}
        <div
          className={`h-full transition-all duration-300 ${
            contextOpen ? "w-72" : "w-0"
          }`}
        >
          {contextOpen && conversation.messages.length > 0 && (
            <ContextPanel conversation={conversation} />
          )}
        </div>

        {/* Botão de toggle do painel de contexto */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10"
          onClick={handleToggleContext}
        >
          {contextOpen ? <ChevronRight /> : <Brain />}
        </Button>
      </div>
    </div>
  );
};