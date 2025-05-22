import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Info, Phone, Video, CheckCheck, Check, Share2 } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageProps } from "./MessageBubble";
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
  const [conversationStatus, setConversationStatus] = useState<string>("open");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Buscar mensagens do servidor quando uma conversa é selecionada
  const { data: fetchedMessages, isLoading, refetch } = useQuery({
    queryKey: [`/api/conversations/${conversation.id}/messages`], // Chave única por conversa
    queryFn: async () => {
      try {
        // Adicionando um timestamp para evitar cache do navegador
        const timestamp = new Date().getTime();
        const response = await axios.get(`/api/conversations/${conversation.id}/messages?t=${timestamp}`);
        console.log("Mensagens recebidas:", response.data);
        
        // Processar as mensagens do servidor
        const processedMessages = response.data.map((msg: any) => {
          // Informações básicas da mensagem
          const messageId = msg.id.toString();
          const messageType = msg.type || "text";
          const messageSender = msg.sender;
          const messageStatus = msg.status;
          const messageTimestamp = new Date(msg.timestamp);
          const messageMetadata = msg.metadata || {};
          
          // Mensagens de status - não mostrar na interface
          if (messageType === 'MessageStatusCallback' || messageType === 'PresenceChatCallback') {
            return null;
          }
          
          // Processamento do conteúdo da mensagem
          let messageContent = "";
          let hasMediaAttachment = false;
          let mediaType = "";
          let mediaUrl = "";
          
          // Processar o conteúdo baseado no formato
          if (typeof msg.content === 'string') {
            // Converter conteúdos vazios para texto significativo
            if (msg.content === "{}" || msg.content === "") {
              // Para mensagens do tipo ReceivedCallback, provavelmente são mensagens de mídia
              if (messageType === 'ReceivedCallback') {
                messageContent = "Nova mensagem";
                
                // Tentar identificar o tipo de mídia pelos metadados
                if (messageMetadata.isAudio || (messageMetadata.zapiMessageId && messageType.includes('audio'))) {
                  messageContent = "🔊 Mensagem de áudio";
                  hasMediaAttachment = true;
                  mediaType = "audio";
                } 
                else if (messageMetadata.isImage || (messageMetadata.zapiMessageId && messageType.includes('image'))) {
                  messageContent = "🖼️ Imagem";
                  hasMediaAttachment = true;
                  mediaType = "image";
                }
                else if (messageMetadata.isVideo || (messageMetadata.zapiMessageId && messageType.includes('video'))) {
                  messageContent = "🎥 Vídeo";
                  hasMediaAttachment = true;
                  mediaType = "video";
                }
                else if (messageMetadata.isFile || (messageMetadata.zapiMessageId && messageType.includes('document'))) {
                  messageContent = "📄 Documento";
                  hasMediaAttachment = true;
                  mediaType = "document";
                }
              } 
              else if (messageType === 'text') {
                messageContent = "Mensagem de texto";
              }
              else {
                // Mensagem genérica para outros tipos
                messageContent = messageSender === 'contact' ? 
                  "Mensagem recebida" : "Mensagem enviada";
              }
            }
            // Processar conteúdo JSON
            else if (msg.content.startsWith('{') && msg.content.endsWith('}')) {
              try {
                const contentObj = JSON.parse(msg.content);
                
                // Tentar extrair texto de diferentes formatos de mensagem Z-API
                if (contentObj.text && typeof contentObj.text === 'object' && contentObj.text.message) {
                  messageContent = contentObj.text.message;
                } 
                else if (contentObj.text) {
                  messageContent = contentObj.text;
                } 
                else if (contentObj.body) {
                  messageContent = contentObj.body;
                } 
                else if (contentObj.message) {
                  messageContent = contentObj.message;
                } 
                else if (contentObj.content) {
                  messageContent = contentObj.content;
                }
                
                // Verificar se é uma mensagem de mídia
                if (contentObj.audio) {
                  hasMediaAttachment = true;
                  mediaType = 'audio';
                  mediaUrl = contentObj.audio.audioUrl || '';
                  messageContent = messageContent || '🔊 Mensagem de áudio';
                } 
                else if (contentObj.image) {
                  hasMediaAttachment = true;
                  mediaType = 'image';
                  mediaUrl = contentObj.image.imageUrl || '';
                  messageContent = contentObj.caption || messageContent || '🖼️ Imagem';
                } 
                else if (contentObj.video) {
                  hasMediaAttachment = true;
                  mediaType = 'video';
                  mediaUrl = contentObj.video.videoUrl || '';
                  messageContent = messageContent || '🎥 Vídeo';
                } 
                else if (contentObj.document) {
                  hasMediaAttachment = true;
                  mediaType = 'document';
                  mediaUrl = contentObj.document.documentUrl || '';
                  messageContent = contentObj.document.fileName || messageContent || '📄 Documento';
                }
                
                // Se ainda não encontramos nenhum conteúdo significativo
                if (!messageContent) {
                  if (contentObj.messageId) {
                    messageContent = "Nova mensagem";
                  } 
                  else {
                    // Usar JSON simplificado como último recurso
                    const simpleObj = { ...contentObj };
                    delete simpleObj.instanceId;
                    delete simpleObj.photo;
                    delete simpleObj.senderPhoto;
                    
                    // Se o objeto tiver muitas propriedades, usar um texto genérico
                    if (Object.keys(simpleObj).length > 3) {
                      messageContent = "Mensagem de mídia";
                    } else {
                      messageContent = JSON.stringify(simpleObj);
                    }
                  }
                }
              } catch (e) {
                console.log("Erro ao processar mensagem JSON:", e);
                messageContent = "Mensagem com formato não reconhecido";
              }
            }
            // Texto simples
            else {
              messageContent = msg.content;
            }
          } else {
            messageContent = "Mensagem sem conteúdo";
          }
          
          return {
            id: messageId,
            content: messageContent,
            type: messageType,
            sender: messageSender,
            status: messageStatus,
            timestamp: messageTimestamp,
            metadata: messageMetadata,
            hasMedia: hasMediaAttachment,
            mediaType,
            mediaUrl
          };
        });
        
        // Filtrar mensagens nulas (como notificações de status)
        return processedMessages.filter((item: any) => item !== null);
      } catch (error) {
        console.error("Erro ao buscar mensagens:", error);
        return [{
          id: "error-1",
          content: "Não foi possível carregar as mensagens. Por favor, tente novamente.",
          type: "system",
          sender: "system",
          status: "error",
          timestamp: new Date(),
          metadata: {},
          hasMedia: false
        }];
      }
    },
    refetchInterval: 3000, // Atualizações a cada 3 segundos
    refetchOnWindowFocus: true,
    staleTime: 0 // Sempre considerar os dados obsoletos para forçar refetch
  });
  
  // Verificar se há novas mensagens periodicamente
  useEffect(() => {
    // Refetch imediato quando o componente montar ou a conversa mudar
    refetch();
    
    const intervalId = setInterval(() => {
      // Removed console.log to reduce console clutter
      refetch();
    }, 3000); // Reduzido de 1s para 3s para diminuir carga no servidor
    
    return () => {
      clearInterval(intervalId);
    };
  }, [refetch, conversation.id]);
  
  // Atualizar mensagens quando os dados são buscados - versão simplificada para evitar problemas
  useEffect(() => {
    if (fetchedMessages && fetchedMessages.length > 0) {
      // Convertemos para string para simples comparação
      const currentIds = JSON.stringify(messagesList.map(msg => msg.id).sort());
      const newIds = JSON.stringify(fetchedMessages.map((msg: any) => msg.id).sort());
      
      // Só atualizamos se forem diferentes ou se não temos mensagens
      if (currentIds !== newIds || messagesList.length === 0) {
        setMessagesList(fetchedMessages);
      }
    } else if (messagesList.length === 0) {
      // Caso não tenhamos mensagens, mostramos a mensagem padrão
      setMessagesList([defaultWelcomeMessage]);
    }
  }, [fetchedMessages]);

  // Rolagem para o final da lista de mensagens quando novas mensagens são adicionadas
  // Mas só faz isso quando mensagens são realmente adicionadas, não em qualquer renderização
  useEffect(() => {
    // Usamos um ref para comparar com o último valor conhecido
    if (messagesList.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesList.length]);

  // Extrai o número de telefone formatado da conversa
  const extractPhoneNumber = () => {
    // Se não for WhatsApp, retorna null
    if (conversation.channel !== 'whatsapp') return null;
    
    // Usar o campo identifier para obter o número de telefone
    if (conversation.identifier) {
      return conversation.identifier.replace(/\D/g, '');
    } 
    
    // Fallback para outros cenários (ex: conversas antigas)
    console.log("Conversação sem identificador:", conversation);
    return null;
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
      // Atualizar no servidor (quando estiver pronto)
      try {
        await axios.put(`/api/conversations/${conversation.id}`, {
          status: "resolved"
        });
      } catch (error) {
        console.log("Função de atualização de status será implementada em breve");
      }
      
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
      // Atualizar no servidor (quando estiver pronto)
      try {
        await axios.put(`/api/conversations/${conversation.id}`, {
          status: "open"
        });
      } catch (error) {
        console.log("Função de atualização de status será implementada em breve");
      }
      
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
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* Cabeçalho da conversa */}
      <div className="px-3 py-2 border-b flex items-center justify-between shrink-0">
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
      
      {/* Lista de mensagens - Implementação reconstruída */}
      <div className="flex-1 overflow-y-auto p-2 bg-card/5">
        {isLoading ? (
          // Esqueleto de carregamento redesenhado
          <div className="animate-pulse space-y-4 py-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <div className={`relative rounded-lg p-3 max-w-[75%] ${
                  i % 2 === 0 ? 'bg-primary/10 rounded-tr-none' : 'bg-gray-100 dark:bg-gray-800 rounded-tl-none'
                }`}>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-16 mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : fetchedMessages && fetchedMessages.length > 0 ? (
          // Nova implementação para exibir mensagens
          <div className="space-y-3 py-4">
            {fetchedMessages.map((message: any) => {
              // Processar conteúdo da mensagem
              let displayContent = message.content;
              let messageType = message.type;
              
              // Tentar parsear conteúdo JSON
              if (typeof message.content === 'string' && message.content.startsWith('{') && message.content.endsWith('}')) {
                try {
                  const contentObj = JSON.parse(message.content);
                  
                  // Extrair conteúdo do formato de mensagem Z-API
                  if (contentObj.text && typeof contentObj.text === 'object' && contentObj.text.message) {
                    displayContent = contentObj.text.message;
                  } else if (contentObj.text) {
                    displayContent = contentObj.text;
                  } else if (contentObj.body) {
                    displayContent = contentObj.body;
                  } else if (contentObj.message) {
                    displayContent = contentObj.message;
                  } else if (contentObj.content) {
                    displayContent = contentObj.content;
                  }
                  
                  // Verificar tipos especiais de mensagem
                  if (messageType === 'MessageStatusCallback' || 
                      messageType === 'PresenceChatCallback') {
                    displayContent = '[Atualização de status]';
                    messageType = 'system';
                  }
                  
                  // Verificar mensagens de mídia
                  if (contentObj.caption) {
                    displayContent = contentObj.caption;
                  }
                  
                  // Se ainda não temos conteúdo, usar informações de mídia
                  if (!displayContent && message.hasMedia) {
                    if (message.mediaType === 'audio') {
                      displayContent = '🔊 Mensagem de áudio';
                    } else if (message.mediaType === 'image') {
                      displayContent = '🖼️ Imagem';
                    } else if (message.mediaType === 'video') {
                      displayContent = '🎥 Vídeo';
                    } else if (message.mediaType === 'document') {
                      displayContent = '📄 Documento';
                    }
                  }
                } catch (e) {
                  // Se falhar o parse, manter conteúdo original
                  console.log("Erro ao processar mensagem JSON:", e);
                }
              }
              
              // Conversão final de mensagens vazias
              if (displayContent === "{}" || !displayContent) {
                if (message.hasMedia) {
                  if (message.mediaType === 'audio') {
                    displayContent = '🔊 Mensagem de áudio';
                  } else if (message.mediaType === 'image') {
                    displayContent = '🖼️ Imagem';
                  } else if (message.mediaType === 'video') {
                    displayContent = '🎥 Vídeo';
                  } else if (message.mediaType === 'document') {
                    displayContent = '📄 Documento';
                  } else {
                    displayContent = 'Mensagem de mídia';
                  }
                } else {
                  displayContent = "Nova mensagem";
                }
              }
              
              return (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'user' ? 'justify-end' : message.sender === 'system' ? 'justify-center' : 'justify-start'}`}
                >
                  {message.sender === 'system' ? (
                    // Mensagens do sistema
                    <div className="bg-muted/50 rounded-full px-4 py-1 text-xs text-muted-foreground max-w-[80%]">
                      {displayContent}
                    </div>
                  ) : (
                    // Mensagens de usuários e contatos
                    <div className={`max-w-[80%] ${message.sender === 'contact' ? 'flex items-start' : ''}`}>
                      {/* Avatar para mensagens de contato */}
                      {message.sender === 'contact' && (
                        <div className="mr-2 mt-1">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            {message.avatar ? (
                              <img src={message.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <span className="text-sm font-medium">C</span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex flex-col">
                        {/* Balão de mensagem com conteúdo */}
                        <div className={`px-3 py-2 rounded-lg break-words ${
                          message.sender === 'user' 
                            ? 'bg-primary text-primary-foreground rounded-br-none' 
                            : 'bg-gray-100 dark:bg-gray-800 text-foreground rounded-bl-none'
                        }`}>
                          {/* Exibir anexos de mídia, se houver */}
                          {message.hasMedia && (
                            <div className="mb-2">
                              {message.mediaType === 'audio' && (
                                <div className="mb-2">
                                  <audio controls src={message.mediaUrl} className="max-w-full">
                                    Seu navegador não suporta o elemento de áudio.
                                  </audio>
                                </div>
                              )}
                              
                              {message.mediaType === 'image' && (
                                <div className="mb-2">
                                  <img 
                                    src={message.mediaUrl} 
                                    alt="Imagem compartilhada" 
                                    className="rounded-md max-w-full max-h-[300px] object-contain"
                                  />
                                </div>
                              )}
                              
                              {message.mediaType === 'video' && (
                                <div className="mb-2">
                                  <video 
                                    controls 
                                    src={message.mediaUrl}
                                    className="rounded-md max-w-full max-h-[300px] object-contain"
                                  >
                                    Seu navegador não suporta o elemento de vídeo.
                                  </video>
                                </div>
                              )}
                              
                              {message.mediaType === 'document' && (
                                <div className="mb-2 flex items-center text-sm">
                                  <a 
                                    href={message.mediaUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-2 text-blue-500 hover:underline"
                                  >
                                    <span>📄</span>
                                    <span>Baixar documento</span>
                                  </a>
                                </div>
                              )}
                              
                              {(message.mediaType === 'location' || message.mediaType === 'contact') && (
                                <div className="mb-2 text-sm italic">
                                  {message.mediaType === 'location' ? '📍 Localização compartilhada' : '👤 Contato compartilhado'}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Conteúdo da mensagem */}
                          {displayContent}
                        </div>
                        
                        {/* Timestamp e status */}
                        <div className={`flex items-center mt-1 text-xs ${
                          message.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}>
                          <span className="text-muted-foreground">
                            {new Date(message.timestamp).toLocaleString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          
                          {message.sender === 'user' && (
                            <span className="ml-1.5 flex items-center">
                              {message.status === 'sending' ? (
                                <span className="flex items-center">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1 animate-pulse"></span>
                                  <span className="text-xs text-muted-foreground">Enviando</span>
                                </span>
                              ) : message.status === 'sent' ? (
                                <Check className="h-3.5 w-3.5 text-muted-foreground" />
                              ) : message.status === 'delivered' ? (
                                <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" />
                              ) : message.status === 'read' ? (
                                <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
                              ) : message.status === 'error' ? (
                                <span className="text-xs text-destructive">Erro</span>
                              ) : null}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          // Mensagem quando não há conversas
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p>Nenhuma mensagem ainda</p>
              <p className="text-sm">Inicie uma conversa</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Área de entrada de texto - posicionada na parte inferior */}
      <div className="mt-auto border-t bg-background shrink-0">
        <InputArea 
          onSendMessage={handleSendMessage} 
          isZapApiEnabled={conversation.channel === 'whatsapp' && isZapApiConnected} 
        />
      </div>
    </div>
  );
};