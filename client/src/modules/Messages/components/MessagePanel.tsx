import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Info, Phone, Video, CheckCheck, Share2 } from "lucide-react";
import { MessageBubble, MessageProps } from "./MessageBubble";
import { InputArea } from "./InputArea";
import { ConversationItemProps } from "@/modules/Inbox/components/ConversationItem";
import { useToast } from "@/hooks/use-toast";
import { sendTextMessage, sendButtonMessage } from "@/services/zapiService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Dados de exemplo para mensagens
const initialMessages: MessageProps[] = [
  {
    id: "1",
    content: "Início da conversa",
    timestamp: new Date(Date.now() - 3600000 * 5),
    sender: "system",
  },
  {
    id: "2",
    content: "Olá! Preciso de ajuda com meu pedido #1234. Não recebi ainda e já se passaram 7 dias.",
    timestamp: new Date(Date.now() - 3600000 * 2),
    sender: "contact",
  },
  {
    id: "3",
    content: "Olá! Claro, vou verificar o status do seu pedido agora mesmo. Pode me informar o seu nome completo e email para confirmar os dados?",
    timestamp: new Date(Date.now() - 3600000 * 1.9),
    sender: "user",
    status: "read",
  },
  {
    id: "4",
    content: "Sim, claro. Me chamo Maria Santos e meu email é maria.santos@email.com",
    timestamp: new Date(Date.now() - 3600000 * 1.8),
    sender: "contact",
  },
  {
    id: "5",
    content: "Obrigado pelas informações! Estou verificando seu pedido no sistema...",
    timestamp: new Date(Date.now() - 3600000 * 1.7),
    sender: "user",
    status: "read",
  },
  {
    id: "6",
    content: "Encontrei seu pedido. Ele está em trânsito e deve chegar amanhã conforme a transportadora. Consigo ver aqui que houve um pequeno atraso devido a problemas logísticos.",
    timestamp: new Date(Date.now() - 3600000 * 1.5),
    sender: "user",
    status: "read",
  },
  {
    id: "7",
    content: "Ah, entendi. Obrigada por verificar! Vou aguardar até amanhã então.",
    timestamp: new Date(Date.now() - 3600000 * 1.4),
    sender: "contact",
  },
  {
    id: "8",
    content: "Disponha! Se precisar de mais alguma coisa, é só avisar. Você receberá uma notificação assim que o pedido for entregue.",
    timestamp: new Date(Date.now() - 3600000 * 1.3),
    sender: "user",
    status: "read",
  },
  {
    id: "9",
    type: "image",
    content: "https://via.placeholder.com/300",
    caption: "Comprovante de envio",
    timestamp: new Date(Date.now() - 3600000 * 1),
    sender: "user",
    status: "delivered",
  },
  {
    id: "10",
    type: "interactive",
    content: "Você poderia confirmar sua preferência de entrega?",
    interactiveData: {
      type: "button",
      selected: "Entrega Padrão",
      options: ["Entrega Padrão", "Entrega Expressa", "Retirar na Loja"]
    },
    timestamp: new Date(Date.now() - 3600000 * 0.8),
    sender: "contact",
  },
  {
    id: "11",
    type: "document",
    content: "nota-fiscal-pedido-1234.pdf",
    fileSize: "320 KB",
    timestamp: new Date(Date.now() - 3600000 * 0.5),
    sender: "user",
    status: "sent",
  },
];

interface MessagePanelProps {
  conversation: ConversationItemProps;
  onToggleContactPanel: () => void;
}

export const MessagePanel = ({ conversation, onToggleContactPanel }: MessagePanelProps) => {
  const [messages, setMessages] = useState<MessageProps[]>(initialMessages);
  const [conversationStatus, setConversationStatus] = useState<string>("open");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Rolagem para o final da lista de mensagens quando novas mensagens são adicionadas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    
    setMessages([...messages, newMessage]);
    
    // Se a conversa for do WhatsApp e tivermos uma integração Z-API configurada,
    // envie realmente a mensagem via API
    if (conversation.channel === 'whatsapp') {
      const phoneNumber = extractPhoneNumber();
      
      if (phoneNumber) {
        try {
          // Assumindo que temos o channelId 
          // Na vida real, precisaríamos obter isso do banco de dados ou do objeto de conversa
          const channelId = 1; // Este valor deveria vir de uma configuração ou do objeto de conversa
          
          // Tenta enviar a mensagem para o número do telefone
          let result;
          
          if (attachmentType === 'interactive' && newMessage.interactiveData?.type === 'button') {
            // Envio de mensagem com botões
            result = await sendButtonMessage({
              channelId,
              to: phoneNumber,
              title: '', // Título vazio para mensagens simples com botões
              message: content,
              footer: '',
              buttons: newMessage.interactiveData.options?.map(option => ({ buttonText: option })) || []
            });
          } else {
            // Envio de mensagem de texto simples
            result = await sendTextMessage({
              channelId,
              to: phoneNumber,
              message: content
            });
          }
          
          if (result.success) {
            // Atualize o status da mensagem para "sent" e guarde o messageId
            setMessages((prevMessages) => 
              prevMessages.map(msg => 
                msg.id === newMessage.id 
                  ? { ...msg, status: "sent" as const, messageId: result.messageId } 
                  : msg
              )
            );
            
            // Simula o status "delivered" após um pequeno tempo (apenas para demo)
            setTimeout(() => {
              setMessages((prevMessages) => 
                prevMessages.map(msg => 
                  msg.id === newMessage.id 
                    ? { ...msg, status: "delivered" as const } 
                    : msg
                )
              );
            }, 1500);
          } else {
            // Se falhou, mostra um erro
            toast({
              title: "Erro ao enviar mensagem",
              description: result.message || "Não foi possível enviar a mensagem. Tente novamente.",
              variant: "destructive"
            });
            
            // Atualiza o status da mensagem para indicar erro
            setMessages((prevMessages) => 
              prevMessages.map(msg => 
                msg.id === newMessage.id 
                  ? { ...msg, status: "error" as const } 
                  : msg
              )
            );
          }
        } catch (error) {
          console.error("Erro ao enviar mensagem:", error);
          
          toast({
            title: "Erro ao enviar mensagem",
            description: "Ocorreu um erro ao tentar enviar a mensagem.",
            variant: "destructive"
          });
          
          // Atualiza o status da mensagem para indicar erro
          setMessages((prevMessages) => 
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
      setMessages((prevMessages) => 
        prevMessages.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: "delivered" as const } 
            : msg
        )
      );
      
      // Após mais alguns segundos, simular uma resposta e atualizar status para "read"
      setTimeout(() => {
        const autoReply: MessageProps = {
          id: `msg-${Date.now()}`,
          content: "Ótimo! Obrigado pelo suporte.",
          timestamp: new Date(),
          sender: "contact",
          avatar: conversation.avatar,
        };
        
        setMessages((prevMessages) => [
          ...prevMessages.map(msg => 
            msg.id === newMessage.id 
              ? { ...msg, status: "read" as const } 
              : msg
          ),
          autoReply
        ]);
      }, 3000);
    }, 1500);
  };

  // Função para resolver uma conversa
  const resolveConversation = () => {
    setConversationStatus("resolved");
    
    // Adicionar mensagem de sistema
    const systemMessage: MessageProps = {
      id: `msg-${Date.now()}`,
      content: "Conversa marcada como resolvida",
      timestamp: new Date(),
      sender: "system",
    };
    
    setMessages([...messages, systemMessage]);
  };

  // Função para reabrir uma conversa
  const reopenConversation = () => {
    setConversationStatus("open");
    
    // Adicionar mensagem de sistema
    const systemMessage: MessageProps = {
      id: `msg-${Date.now()}`,
      content: "Conversa reaberta",
      timestamp: new Date(),
      sender: "system",
    };
    
    setMessages([...messages, systemMessage]);
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
        {messages.map((message) => (
          <MessageBubble key={message.id} {...message} />
        ))}
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