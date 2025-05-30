import { useState } from "react";
import { X, Search, Plus, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface User {
  id: string;
  name: string;
  avatar?: string;
  title?: string;
  status?: "online" | "away" | "dnd" | "offline";
}

interface Channel {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  members?: User[];
  topic?: string;
  pinnedMessages?: {
    id: string;
    content: string;
    sender: User;
    timestamp: Date;
  }[];
  sharedFiles?: {
    id: string;
    name: string;
    type: string;
    size: string;
    uploadedBy: User;
    timestamp: Date;
    url: string;
  }[];
}

interface DirectMessage {
  id: string;
  users: User[];
  sharedFiles?: {
    id: string;
    name: string;
    type: string;
    size: string;
    uploadedBy: User;
    timestamp: Date;
    url: string;
  }[];
}

interface DetailsPanelProps {
  channelId?: string;
  dmId?: string;
  onClose: () => void;
}

// Dados de exemplo
const users: User[] = [
  { id: "1", name: "Ana Beatriz", avatar: "https://ui.shadcn.com/avatars/01.png", title: "Designer", status: "online" },
  { id: "2", name: "Carlos Silva", avatar: "https://ui.shadcn.com/avatars/02.png", title: "Desenvolvedor", status: "away" },
  { id: "3", name: "Mariana Costa", avatar: "https://ui.shadcn.com/avatars/03.png", title: "Gerente de Produto", status: "dnd" },
  { id: "4", name: "Pedro Santos", avatar: "https://ui.shadcn.com/avatars/04.png", title: "Analista de Suporte", status: "offline" },
  { id: "5", name: "Lucas Mendes", avatar: "https://ui.shadcn.com/avatars/05.png", title: "Desenvolvedor Frontend", status: "online" },
  { id: "6", name: "Gabriela Dias", avatar: "https://ui.shadcn.com/avatars/06.png", title: "UX Designer", status: "online" },
];

const channels: Record<string, Channel> = {
  "1": {
    id: "1",
    name: "geral",
    isPrivate: false,
    topic: "Discussões gerais sobre o projeto Omnichannel",
    members: users,
    pinnedMessages: [
      {
        id: "pinned-1",
        content: "🚨 Importante: nova versão será lançada na próxima semana. Todos devem atualizar seus ambientes.",
        sender: users[2],
        timestamp: new Date(Date.now() - 86400000 * 2),
      }
    ],
    sharedFiles: [
      {
        id: "file-1",
        name: "design-guidelines.pdf",
        type: "pdf",
        size: "2.4 MB",
        uploadedBy: users[0],
        timestamp: new Date(Date.now() - 86400000),
        url: "#",
      },
      {
        id: "file-2",
        name: "screenshot.png",
        type: "image",
        size: "843 KB",
        uploadedBy: users[1],
        timestamp: new Date(Date.now() - 86400000 * 2),
        url: "https://via.placeholder.com/300",
      },
    ]
  },
  "2": {
    id: "2",
    name: "anuncios",
    isPrivate: false,
    topic: "Anúncios e comunicados importantes da empresa",
    members: users,
  }
};

const directMessages: Record<string, DirectMessage> = {
  "dm1": {
    id: "dm1",
    users: [users[0]],
    sharedFiles: [
      {
        id: "dm-file-1",
        name: "design-feedback.docx",
        type: "docx",
        size: "1.2 MB",
        uploadedBy: users[0],
        timestamp: new Date(Date.now() - 86400000),
        url: "#",
      }
    ]
  },
  "dm2": {
    id: "dm2",
    users: [users[1]],
  },
};

export const DetailsPanel = ({ channelId, dmId, onClose }: DetailsPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("about");
  
  const channel = channelId ? channels[channelId] : undefined;
  const dm = dmId ? directMessages[dmId] : undefined;
  
  // Obter usuário ou canal atual
  const getCurrentInfo = () => {
    if (channel) {
      return {
        name: `#${channel.name}`,
        description: channel.topic,
        isChannel: true,
      };
    }
    
    if (dm && dm.users.length > 0) {
      const otherUser = dm.users[0];
      return {
        name: otherUser.name,
        description: otherUser.title,
        avatar: otherUser.avatar,
        isChannel: false,
      };
    }
    
    return { name: "", description: "", isChannel: false };
  };
  
  const currentInfo = getCurrentInfo();
  
  // Renderizar avatar se for DM
  const renderAvatar = () => {
    if (!currentInfo.isChannel && currentInfo.avatar) {
      return (
        <img 
          src={currentInfo.avatar} 
          alt={currentInfo.name} 
          className="h-16 w-16 rounded-full" 
        />
      );
    }
    
    if (!currentInfo.isChannel) {
      return (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-medium">
          {currentInfo.name.charAt(0)}
        </div>
      );
    }
    
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted text-2xl font-semibold">
        #
      </div>
    );
  };
  
  // Renderizar status do usuário
  const renderUserStatus = (status?: string) => {
    if (!status) return null;
    
    const statusColors: Record<string, string> = {
      online: "bg-green-500",
      away: "bg-yellow-500",
      dnd: "bg-red-500",
      offline: "bg-gray-400"
    };
    
    const statusText: Record<string, string> = {
      online: "Disponível",
      away: "Ausente",
      dnd: "Não perturbe",
      offline: "Offline"
    };
    
    return (
      <div className="flex items-center gap-1.5">
        <div className={`h-2 w-2 rounded-full ${statusColors[status]}`}></div>
        <span className="text-sm">{statusText[status]}</span>
      </div>
    );
  };
  
  // Gerar iniciais para avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Renderizar um item de membro
  const renderMemberItem = (user: User) => {
    return (
      <div key={user.id} className="flex items-center justify-between py-2">
        <div className="flex items-center">
          {user.avatar ? (
            <div className="relative mr-3">
              <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full" />
              <div className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background 
                ${user.status === "online" ? "bg-green-500" : 
                  user.status === "away" ? "bg-yellow-500" : 
                  user.status === "dnd" ? "bg-red-500" : "bg-gray-400"}`} />
            </div>
          ) : (
            <div className="relative mr-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <span className="text-xs font-medium">{getInitials(user.name)}</span>
              </div>
              <div className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background 
                ${user.status === "online" ? "bg-green-500" : 
                  user.status === "away" ? "bg-yellow-500" : 
                  user.status === "dnd" ? "bg-red-500" : "bg-gray-400"}`} />
            </div>
          )}
          <div>
            <div className="text-sm font-medium">{user.name}</div>
            {user.title && <div className="text-xs text-muted-foreground">{user.title}</div>}
          </div>
        </div>
        
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <CircleCheck className="h-4 w-4" />
        </Button>
      </div>
    );
  };
  
  // Renderizar um item de arquivo
  const renderFileItem = (file: any) => {
    return (
      <div key={file.id} className="flex items-center gap-3 rounded-md border p-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
          {file.type === "pdf" && <span className="text-xs font-medium text-red-500">PDF</span>}
          {file.type === "docx" && <span className="text-xs font-medium text-blue-500">DOC</span>}
          {file.type === "image" && <span className="text-xs font-medium text-green-500">IMG</span>}
          {!["pdf", "docx", "image"].includes(file.type) && <span className="text-xs font-medium">FILE</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="truncate text-sm font-medium">{file.name}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            <span>{file.size}</span>
            <span className="mx-1">•</span>
            <span>{new Date(file.timestamp).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <aside className="flex h-full w-64 flex-col border-l">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between border-b px-4 py-2">
        <h2 className="text-sm font-medium">Detalhes</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </header>
      
      {/* Conteúdo principal */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col items-center p-4">
          {renderAvatar()}
          
          <h3 className="mt-3 text-center text-lg font-semibold">
            {currentInfo.name}
          </h3>
          
          {!currentInfo.isChannel && dmId && dm?.users[0]?.status && (
            <div className="mt-1">
              {renderUserStatus(dm.users[0].status)}
            </div>
          )}
          
          {currentInfo.description && (
            <p className="mt-1 text-center text-sm text-muted-foreground">
              {currentInfo.description}
            </p>
          )}
          
          <div className="mt-4 w-full">
            <Tabs defaultValue="about" className="w-full" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="about" className="flex-1">
                  {currentInfo.isChannel ? "Sobre" : "Perfil"}
                </TabsTrigger>
                {currentInfo.isChannel && (
                  <TabsTrigger value="members" className="flex-1">
                    Membros
                  </TabsTrigger>
                )}
                <TabsTrigger value="files" className="flex-1">
                  Arquivos
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="py-4">
                {currentInfo.isChannel && (
                  <>
                    <div className="mb-4">
                      <h4 className="mb-1 text-sm font-medium">Tópico</h4>
                      <p className="text-sm">
                        {channel?.topic || "Nenhum tópico definido"}
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="mb-1 text-sm font-medium">Criado em</h4>
                      <p className="text-sm">
                        10 de Maio de 2023
                      </p>
                    </div>
                    
                    {channel?.pinnedMessages && channel.pinnedMessages.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-sm font-medium">Mensagens fixadas</h4>
                        <div className="space-y-2">
                          {channel.pinnedMessages.map(msg => (
                            <div key={msg.id} className="rounded-md border bg-muted/30 p-2 text-sm">
                              <p className="mb-1">{msg.content}</p>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Por {msg.sender.name}</span>
                                <span>{new Date(msg.timestamp).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                {!currentInfo.isChannel && dmId && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-1 text-sm font-medium">Nome completo</h4>
                      <p className="text-sm">{dm?.users[0]?.name}</p>
                    </div>
                    
                    <div>
                      <h4 className="mb-1 text-sm font-medium">Cargo</h4>
                      <p className="text-sm">{dm?.users[0]?.title || "Não definido"}</p>
                    </div>
                    
                    <div>
                      <h4 className="mb-1 text-sm font-medium">Perfil desde</h4>
                      <p className="text-sm">15 de Janeiro de 2023</p>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              {currentInfo.isChannel && (
                <TabsContent value="members" className="py-4">
                  <div className="mb-3">
                    <Input
                      placeholder="Buscar membros"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="mb-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {channel?.members?.length || 0} membros neste canal
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    {channel?.members?.map(user => renderMemberItem(user))}
                  </div>
                </TabsContent>
              )}
              
              <TabsContent value="files" className="py-4">
                <div className="mb-3">
                  <Input
                    placeholder="Buscar arquivos"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mb-2"
                  />
                </div>
                
                <div className="space-y-2">
                  {currentInfo.isChannel && channel?.sharedFiles?.map(file => renderFileItem(file))}
                  {!currentInfo.isChannel && dm?.sharedFiles?.map(file => renderFileItem(file))}
                  
                  {((!currentInfo.isChannel && !dm?.sharedFiles?.length) || 
                    (currentInfo.isChannel && !channel?.sharedFiles?.length)) && (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      Nenhum arquivo compartilhado ainda
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
};