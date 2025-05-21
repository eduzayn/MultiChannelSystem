import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Search, 
  Phone, 
  Video,
  Info, 
  MoreHorizontal,
  Paperclip,
  Smile,
  Send,
  Reply,
  ThumbsUp,
  Mic,
  Plus,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface User {
  id: string;
  name: string;
  avatar?: string;
  title?: string;
}

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  sender: User;
  attachments?: {
    type: "image" | "file" | "audio";
    url: string;
    name?: string;
    size?: string;
  }[];
  reactions?: {
    emoji: string;
    count: number;
    userIds: string[];
  }[];
}

interface Channel {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  members?: User[];
  topic?: string;
}

interface DirectMessage {
  id: string;
  users: User[];
}

interface MessagePanelProps {
  channelId?: string;
  dmId?: string;
  onToggleDetails: () => void;
}

// Usuário atual
const currentUser: User = {
  id: "current-user",
  name: "João da Silva",
  title: "Administrador",
};

// Dados de exemplo
const users: User[] = [
  { id: "1", name: "Ana Beatriz", avatar: "https://ui.shadcn.com/avatars/01.png", title: "Designer" },
  { id: "2", name: "Carlos Silva", avatar: "https://ui.shadcn.com/avatars/02.png", title: "Desenvolvedor" },
  { id: "3", name: "Mariana Costa", avatar: "https://ui.shadcn.com/avatars/03.png", title: "Gerente de Produto" },
  { id: "4", name: "Pedro Santos", avatar: "https://ui.shadcn.com/avatars/04.png", title: "Analista de Suporte" },
];

const channels: Record<string, Channel> = {
  "1": {
    id: "1",
    name: "geral",
    isPrivate: false,
    topic: "Discussões gerais sobre o projeto Omnichannel",
    members: [...users, currentUser],
  },
  "2": {
    id: "2",
    name: "anuncios",
    isPrivate: false,
    topic: "Anúncios e comunicados importantes da empresa",
    members: [...users, currentUser],
  }
};

const directMessages: Record<string, DirectMessage> = {
  "dm1": {
    id: "dm1",
    users: [users[0]],
  },
  "dm2": {
    id: "dm2",
    users: [users[1]],
  },
};

// Mensagens de exemplo
const generateMessages = (channelId: string | undefined, dmId: string | undefined): Message[] => {
  if (!channelId && !dmId) return [];

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (channelId) {
    return [
      {
        id: "1",
        content: "Bom dia equipe! Alguém pode me atualizar sobre o status do novo recurso de Chat Interno?",
        timestamp: new Date(today.setHours(today.getHours() - 2)),
        sender: users[2], // Mariana
      },
      {
        id: "2",
        content: "Estamos avançando bem, terminamos a interface principal e estamos trabalhando na integração com WebSockets.",
        timestamp: new Date(today.setMinutes(today.getMinutes() + 15)),
        sender: users[1], // Carlos
      },
      {
        id: "3",
        content: "Ótimo! Preciso de um design para a seção de configurações de notificações. @Ana Beatriz pode ajudar?",
        timestamp: new Date(today.setMinutes(today.getMinutes() + 5)),
        sender: users[2], // Mariana
      },
      {
        id: "4",
        content: "Claro! Vou começar a trabalhar nisso hoje à tarde e envio uma prévia amanhã.",
        timestamp: new Date(today.setMinutes(today.getMinutes() + 3)),
        sender: users[0], // Ana
        reactions: [
          { emoji: "👍", count: 2, userIds: [users[2].id, users[1].id] },
          { emoji: "🎉", count: 1, userIds: [users[3].id] },
        ],
      },
      {
        id: "5",
        content: "Aqui estão alguns recursos que podemos nos inspirar:",
        timestamp: new Date(today.setMinutes(today.getMinutes() + 10)),
        sender: users[3], // Pedro
        attachments: [
          { 
            type: "image", 
            url: "https://via.placeholder.com/800x400?text=UI+Reference", 
            name: "ui-reference.jpg" 
          },
        ],
      },
    ];
  } else if (dmId) {
    const otherUser = directMessages[dmId].users[0];
    return [
      {
        id: "dm1",
        content: `Olá ${currentUser.name}, tudo bem?`,
        timestamp: new Date(today.setHours(today.getHours() - 1)),
        sender: otherUser,
      },
      {
        id: "dm2",
        content: `Oi ${otherUser.name}! Tudo ótimo, e com você?`,
        timestamp: new Date(today.setMinutes(today.getMinutes() + 5)),
        sender: currentUser,
      },
      {
        id: "dm3",
        content: "Estou bem! Só queria dar uma atualização rápida sobre aquele projeto que conversamos.",
        timestamp: new Date(today.setMinutes(today.getMinutes() + 2)),
        sender: otherUser,
      },
    ];
  }
  
  return [];
};

export const MessagePanel = ({ channelId, dmId, onToggleDetails }: MessagePanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Efeito para carregar mensagens quando o canal ou DM muda
  useEffect(() => {
    setMessages(generateMessages(channelId, dmId));
    
    // Resetar estado
    setNewMessage("");
    setIsRecording(false);
    
    // Simulação de "está digitando"
    if (channelId === "1" || dmId === "dm1") {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 5000);
      return () => clearTimeout(timer);
    }
    
    return () => {};
  }, [channelId, dmId]);
  
  // Rolar para o final quando as mensagens mudam
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Manipular envio de mensagem
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (newMessage.trim()) {
      const newMsg: Message = {
        id: `new-${Date.now()}`,
        content: newMessage.trim(),
        timestamp: new Date(),
        sender: currentUser,
      };
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage("");
      
      // Simular resposta
      if (channelId || dmId) {
        setTimeout(() => {
          const otherUser = dmId 
            ? directMessages[dmId].users[0] 
            : users[Math.floor(Math.random() * users.length)];
          
          const responseMsg: Message = {
            id: `resp-${Date.now()}`,
            content: "Entendido! Vamos continuar essa conversa mais tarde.",
            timestamp: new Date(),
            sender: otherUser,
          };
          
          setMessages(prev => [...prev, responseMsg]);
          setIsTyping(false);
        }, 8000);
        
        // Simular "está digitando"
        setTimeout(() => {
          setIsTyping(true);
        }, 2000);
      }
    }
  };
  
  // Lidar com Enter para enviar (permitir Shift+Enter para nova linha)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Renderizar avatar do usuário
  const renderUserAvatar = (user: User) => {
    if (user.avatar) {
      return (
        <img 
          src={user.avatar} 
          alt={user.name} 
          className="h-8 w-8 rounded-full"
        />
      );
    }
    
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
        {user.name.charAt(0)}
      </div>
    );
  };
  
  // Determinar título do painel de mensagens
  const getPanelTitle = () => {
    if (channelId && channels[channelId]) {
      const channel = channels[channelId];
      return (
        <div className="flex items-center">
          <span className="mr-1 font-medium">{channel.isPrivate ? "🔒" : "#"}</span>
          <span>{channel.name}</span>
        </div>
      );
    }
    
    if (dmId && directMessages[dmId]) {
      const dm = directMessages[dmId];
      if (dm.users.length === 1) {
        return dm.users[0].name;
      }
      return dm.users.map(u => u.name.split(" ")[0]).join(", ");
    }
    
    return "Nova conversa";
  };
  
  // Determinar tópico ou informações adicionais
  const getPanelSubtitle = () => {
    if (channelId && channels[channelId]) {
      const channel = channels[channelId];
      return channel.topic || `${channel.members?.length || 0} membros`;
    }
    
    if (dmId && directMessages[dmId]) {
      const dm = directMessages[dmId];
      if (dm.users.length === 1) {
        return dm.users[0].title || "";
      }
    }
    
    return "";
  };
  
  // Renderizar conteúdo da mensagem com formatação
  const renderMessageContent = (content: string) => {
    // Implementação simples de formatação - em uma versão real usaríamos uma biblioteca como marked
    let formattedContent = content;
    
    // Substituir @mentions
    formattedContent = formattedContent.replace(
      /@([a-zA-Z\s]+)/g,
      '<span class="text-primary font-medium">@$1</span>'
    );
    
    return (
      <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
    );
  };

  const aiSuggestions = [
    "Poderia detalhar mais sobre a pauta da reunião?",
    "Vou verificar e te retorno em breve",
    "Entendido, obrigado pela atualização!"
  ];

  const emojis = ["😊", "👍", "❤️", "😂", "🔥", "✅", "🎉", "🙏", "👌", "🤔"];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center overflow-hidden">
          <div className="mr-2">
            {dmId && directMessages[dmId]?.users.length === 1 && (
              renderUserAvatar(directMessages[dmId].users[0])
            )}
          </div>
          <div className="overflow-hidden">
            <h2 className="truncate text-sm font-medium">
              {getPanelTitle()}
            </h2>
            {getPanelSubtitle() && (
              <p className="truncate text-xs text-muted-foreground">
                {getPanelSubtitle()}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Phone className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Chamada de voz</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Video className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Chamada de vídeo</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Pesquisar na conversa</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onToggleDetails}>
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Detalhes</TooltipContent>
          </Tooltip>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                Configurações de notificações
              </DropdownMenuItem>
              {channelId && (
                <>
                  <DropdownMenuItem>
                    Ver membros
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Editar canal
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                {channelId ? "Sair do canal" : "Arquivar conversa"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      {/* Área de mensagens */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => {
            const isSelf = message.sender.id === currentUser.id;
            const showAvatar = index === 0 || messages[index - 1].sender.id !== message.sender.id;
            
            return (
              <div key={message.id} className="flex items-start gap-3">
                {/* Avatar do usuário ou espaçador */}
                {showAvatar ? (
                  <div className="shrink-0">
                    {renderUserAvatar(message.sender)}
                  </div>
                ) : (
                  <div className="w-8" />
                )}
                
                <div className="flex-1 min-w-0">
                  {/* Info do usuário e hora */}
                  {showAvatar && (
                    <div className="flex items-center mb-1">
                      <span className="text-sm font-medium">{message.sender.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {formatDistanceToNow(message.timestamp, { addSuffix: true, locale: ptBR })}
                      </span>
                    </div>
                  )}
                  
                  {/* Conteúdo da mensagem */}
                  <div>
                    <div className="text-sm">
                      {renderMessageContent(message.content)}
                    </div>
                    
                    {/* Anexos */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 grid gap-2">
                        {message.attachments.map((attachment, i) => (
                          <div key={i}>
                            {attachment.type === "image" && (
                              <img 
                                src={attachment.url} 
                                alt={attachment.name || "Anexo"} 
                                className="max-h-80 rounded-md border"
                              />
                            )}
                            {attachment.type === "file" && (
                              <div className="flex items-center gap-2 rounded-md border p-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                                  <span className="text-xs font-medium">DOC</span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium">{attachment.name}</div>
                                  {attachment.size && (
                                    <div className="text-xs text-muted-foreground">{attachment.size}</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Reações */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {message.reactions.map((reaction, i) => (
                          <button
                            key={i}
                            className="inline-flex items-center gap-1 rounded-full border bg-muted/30 px-2 py-0.5 text-xs"
                          >
                            <span>{reaction.emoji}</span>
                            <span>{reaction.count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Ações da mensagem */}
                  <div className="mt-1 -ml-1 hidden gap-1 group-hover:flex">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Reply className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Responder</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Reagir</TooltipContent>
                    </Tooltip>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem>
                          Editar mensagem
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Fixar mensagem
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Copiar texto
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Excluir mensagem
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Indicador de "está digitando" */}
          {isTyping && (
            <div className="flex items-start gap-3">
              <div className="shrink-0">
                {directMessages[dmId || ""]?.users[0] && renderUserAvatar(directMessages[dmId || ""].users[0])}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground italic">
                  está digitando...
                </div>
              </div>
            </div>
          )}
          
          {/* Referência para rolar para o final */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Campo de entrada de mensagem */}
      <div className="border-t p-3">
        <form onSubmit={handleSendMessage} className="relative">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              {/* Sugestões de IA */}
              <div className="mb-2 flex items-center gap-1 overflow-x-auto pb-1">
                {aiSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-xs"
                    onClick={() => setNewMessage(suggestion)}
                    type="button"
                  >
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
              
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem..."
                className="max-h-32"
                rows={1}
              />
            </div>
            
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Anexar arquivo</TooltipContent>
              </Tooltip>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Smile className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="end" alignOffset={0}>
                  <div className="grid grid-cols-5 gap-2">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                        onClick={() => setNewMessage(prev => prev + emoji)}
                        type="button"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button 
                type="button" 
                size="icon" 
                variant={isRecording ? "destructive" : "ghost"}
                className="h-9 w-9"
                onClick={() => setIsRecording(!isRecording)}
              >
                {isRecording ? <X className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              
              <Button 
                type="submit" 
                size="icon" 
                disabled={!newMessage.trim() && !isRecording}
                className="h-9 w-9"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};