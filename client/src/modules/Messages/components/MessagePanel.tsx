import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Info, Phone, Video, CheckCheck, Share2 } from "lucide-react";
import { MessageBubble, MessageProps } from "./MessageBubble";
import { InputArea } from "./InputArea";
import { ConversationItemProps } from "@/modules/Inbox/components/ConversationItem";
import { useToast } from "@/hooks/use-toast";
import { sendTextMessage, sendButtonMessage } from "@/services/messageService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mensagem inicial padrão para novas conversas
const defaultWelcomeMessage: MessageProps = {
  id: "welcome",
  content: "Início da conversa",
  timestamp: new Date(),
  sender: "system",
};

interface MessagePanelProps {
  conversation: ConversationItemProps;
  onToggleContactPanel: () => void;
}

export const MessagePanel = ({ conversation, onToggleContactPanel }: MessagePanelProps) => {
  const [messagesList, setMessagesList] = useState<MessageProps[]>([]);
  const [conversationStatus, setConversationStatus] = useState<string>(conversation.status || "open");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Buscar mensagens do servidor quando uma conversa é selecionada
  const { data: fetchedMessages, isLoading } = useQuery({
    queryKey: [`/api/conversations/${conversation.id}/messages`],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/conversations/${conversation.id}/messages`);
        return response.data.map((msg: any) => ({
          id: msg.id.toString(),
          content: msg.content,
          type: msg.type || "text",
          sender: msg.sender,
          status: msg.status,
          timestamp: new Date(msg.timestamp),
          metadata: msg.metadata || {}
        }));
      } catch (error) {
        console.error("Erro ao buscar mensagens:", error);
        // Em caso de erro, carregar apenas a mensagem de boas-vindas
        return [defaultWelcomeMessage];
      }
    },
    refetchInterval: 5000 // Recarregar a cada 5 segundos para novas mensagens
  });
  
  // Atualizar mensagens quando os dados são buscados
  useEffect(() => {
    if (fetchedMessages && fetchedMessages.length > 0) {
      setMessagesList(fetchedMessages);
    } else if (!isLoading && fetchedMessages && fetchedMessages.length === 0) {
      // Se não houver mensagens, mostrar uma mensagem de boas-vindas
      setMessagesList([defaultWelcomeMessage]);
    }
  }, [fetchedMessages, isLoading]);

  // Rolagem para o final da lista de mensagens quando novas mensagens são adicionadas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesList]);

  // Extrai o número de telefone formatado da conversa (assumindo que é o identifier)
  const extractPhoneNumber = () => {
    // Se não for WhatsApp, retorna null
    if (conversation.channel !== 'whatsapp') return null;
    
    // Assumindo que o identifier é o número do telefone
    // Remove caracteres não numéricos (espaços, parênteses, traços, etc.)
    return conversation.identifier?.replace(/\D/g, '');
  };

  // Função para enviar nova mensagem
  const handleSendMessage = async (content: string, attachmentType?: string, attachmentData?: any) => {
    const newMessage: MessageProps = {
      id: `msg-${Date.now()}`,
      content,
      timestamp: new Date(),
      sender: "user",
      status: "sending", // Começamos com "sending" para indicar que está em andamento
    };

    // Se houver um anexo, adiciona ao objeto de mensagem
    if (attachmentType && attachmentType !== 'text') {
      newMessage.type = attachmentType as any;
      
      if (attachmentType === 'image') {
        newMessage.caption = attachmentData?.caption || '';
      } else if (attachmentType === 'document') {
        newMessage.fileSize = attachmentData?.fileSize || '';
      } else if (attachmentType === 'interactive') {
        newMessage.interactiveData = attachmentData;
      }
    }
    
    setMessagesList([...messagesList, newMessage]);
    
    // Se a conversa for do WhatsApp e tivermos uma integração Z-API configurada,
    // envie realmente a mensagem via API
    if (conversation.channel === 'whatsapp') {
      const phoneNumber = extractPhoneNumber();
      
      if (phoneNumber) {
        try {
          // Enviar mensagem para a API
          const response = await axios.post('/api/messages', {
            conversationId: conversation.id,
            content,
            type: attachmentType || 'text',
            sender: 'user',
            status: 'sent',
            metadata: attachmentData
          });
          
          if (response.data && response.data.id) {
            // Atualizar o status da mensagem para "sent" e o ID para o real do banco
            setMessagesList((prevMessages) => 
              prevMessages.map(msg => 
                msg.id === newMessage.id 
                  ? { ...msg, id: response.data.id.toString(), status: "sent" as const } 
                  : msg
              )
            );
            
            // Enviar para a API Z-API
            try {
              const zapiResponse = await sendTextMessage({
                channelId: Number(conversation.id),
                to: phoneNumber,
                message: content
              });
              
              if (zapiResponse.success) {
                // Atualizar status para delivered
                setMessagesList((prevMessages) => 
                  prevMessages.map(msg => 
                    msg.id === response.data.id.toString() 
                      ? { ...msg, status: "delivered" as const } 
                      : msg
                  )
                );
              }
            } catch (zapiError) {
              console.error("Erro ao enviar para Z-API:", zapiError);
              // Mensagem ainda foi salva no banco, só não foi enviada ao WhatsApp
            }
          }
        } catch (error) {
          console.error("Erro ao salvar mensagem:", error);
          
          toast({
            title: "Erro ao enviar mensagem",
            description: "Ocorreu um erro ao tentar enviar a mensagem.",
            variant: "destructive"
          });
          
          // Atualiza o status da mensagem para indicar erro
          setMessagesList((prevMessages) => 
            prevMessages.map(msg => 
              msg.id === newMessage.id 
                ? { ...msg, status: "error" as const } 
                : msg
            )
          );
        }
      } else {
        // Quando não temos o número de telefone, cai no modo de simulação
        simulateMessageDelivery(newMessage);
      }
    } else {
      // Para outros canais que não o WhatsApp, apenas simulamos a entrega
      simulateMessageDelivery(newMessage);
    }
  };
  
  // Função para simular entrega e resposta (apenas para demo)
  const simulateMessageDelivery = (newMessage: MessageProps) => {
    // Simular status "delivered" após alguns segundos
    setTimeout(() => {
      setMessagesList((prevMessages) => 
        prevMessages.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: "delivered" as const } 
            : msg
        )
      );
    }, 1500);
  };

  // Função para resolver uma conversa
  const resolveConversation = async () => {
    try {
      // Atualizar no servidor
      await axios.put(`/api/conversations/${conversation.id}`, {
        status: "resolved"
      });
      
      setConversationStatus("resolved");
      
      // Adicionar mensagem de sistema
      const systemMessage: MessageProps = {
        id: `msg-${Date.now()}`,
        content: "Conversa marcada como resolvida",
        timestamp: new Date(),
        sender: "system",
      };
      
      setMessagesList([...messagesList, systemMessage]);
    } catch (error) {
      console.error("Erro ao resolver conversa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível resolver a conversa",
        variant: "destructive"
      });
    }
  };

  // Função para reabrir uma conversa
  const reopenConversation = async () => {
    try {
      // Atualizar no servidor
      await axios.put(`/api/conversations/${conversation.id}`, {
        status: "open"
      });
      
      setConversationStatus("open");
      
      // Adicionar mensagem de sistema
      const systemMessage: MessageProps = {
        id: `msg-${Date.now()}`,
        content: "Conversa reaberta",
        timestamp: new Date(),
        sender: "system",
      };
      
      setMessagesList([...messagesList, systemMessage]);
    } catch (error) {
      console.error("Erro ao reabrir conversa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível reabrir a conversa",
        variant: "destructive"
      });
    }
  };

  // Verificar se a sessão ZapAPI está conectada (simulado)
  const isZapApiConnected = conversation.channel === 'whatsapp';

  return (
    <div className="h-full flex flex-col">
      {/* Cabeçalho da conversa */}
      <div className="px-3 py-2 border-b flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-2">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              {conversation.avatar ? (
                <img 
                  src={conversation.avatar} 
                  alt={conversation.name} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium">
                  {conversation.name.charAt(0)}
                </span>
              )}
            </div>
          </div>
          <div>
            <h3 className="font-medium text-sm">{conversation.name}</h3>
            <div className="flex items-center">
              <div className={`h-1.5 w-1.5 rounded-full mr-1 ${
                conversation.channel === 'whatsapp' 
                  ? 'bg-green-500' 
                  : conversation.channel === 'instagram' 
                    ? 'bg-pink-500' 
                    : conversation.channel === 'facebook' 
                      ? 'bg-blue-600' 
                      : 'bg-yellow-500'}`}>
              </div>
              <span className="text-xs text-muted-foreground">
                {conversation.channel === 'whatsapp' 
                  ? 'WhatsApp' 
                  : conversation.channel === 'instagram' 
                    ? 'Instagram' 
                    : conversation.channel === 'facebook' 
                      ? 'Facebook' 
                      : 'Email'}
                {conversation.channel === 'whatsapp' && !isZapApiConnected && (
                  <span className="ml-2 text-destructive">● Desconectado</span>
                )}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                {conversationStatus === "open" ? "Aberta" : "Resolvida"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Status da Conversa</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {conversationStatus === "open" ? (
                <DropdownMenuItem onClick={resolveConversation}>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Marcar como Resolvida
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={reopenConversation}>
                  Reabrir Conversa
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Transferir Conversa
              </DropdownMenuItem>
              <DropdownMenuItem>
                Adicionar Tags
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onToggleContactPanel}
            className="h-7 w-7"
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Lista de mensagens */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          // Mostrar esqueleto de carregamento
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-lg p-3 max-w-[75%] ${i % 2 === 0 ? 'bg-primary/20' : 'bg-muted'}`}>
                  <div className="h-2 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-40"></div>
                </div>
              </div>
            ))}
          </div>
        ) : messagesList.length > 0 ? (
          // Mostrar mensagens
          messagesList.map((message) => (
            <MessageBubble key={message.id} {...message} />
          ))
        ) : (
          // Sem mensagens
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p>Nenhuma mensagem ainda</p>
              <p className="text-sm">Inicie uma conversa</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Área de entrada de texto */}
      <InputArea 
        onSendMessage={handleSendMessage} 
        isZapApiEnabled={conversation.channel === 'whatsapp' && isZapApiConnected} 
      />
    </div>
  );
};