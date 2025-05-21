import { useState, useEffect } from "react";
import { Search, Plus, Hash, Lock, Bell, BellOff, Settings, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Tipos para os dados do chat
interface Channel {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  unreadCount: number;
  hasMention: boolean;
  isPinned: boolean;
}

interface DirectMessage {
  id: string;
  users: User[];
  unreadCount: number;
  lastMessage?: string;
  lastActivity: Date;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "away" | "dnd" | "offline";
  title?: string;
}

// Dados de exemplo
const currentUser: User = {
  id: "current-user",
  name: "João da Silva",
  status: "online",
  title: "Administrador"
};

const channels: Channel[] = [
  { id: "1", name: "geral", isPrivate: false, unreadCount: 0, hasMention: false, isPinned: true },
  { id: "2", name: "anuncios", isPrivate: false, unreadCount: 2, hasMention: true, isPinned: true },
  { id: "3", name: "vendas", isPrivate: false, unreadCount: 0, hasMention: false, isPinned: false },
  { id: "4", name: "suporte", isPrivate: false, unreadCount: 5, hasMention: false, isPinned: false },
  { id: "5", name: "marketing-q3", isPrivate: true, unreadCount: 0, hasMention: false, isPinned: false },
];

const users: User[] = [
  { id: "1", name: "Ana Beatriz", avatar: "https://ui.shadcn.com/avatars/01.png", status: "online", title: "Designer" },
  { id: "2", name: "Carlos Silva", avatar: "https://ui.shadcn.com/avatars/02.png", status: "away", title: "Desenvolvedor" },
  { id: "3", name: "Mariana Costa", avatar: "https://ui.shadcn.com/avatars/03.png", status: "dnd", title: "Gerente de Produto" },
  { id: "4", name: "Pedro Santos", avatar: "https://ui.shadcn.com/avatars/04.png", status: "offline", title: "Analista de Suporte" },
];

const directMessages: DirectMessage[] = [
  { id: "dm1", users: [users[0]], unreadCount: 3, lastActivity: new Date() },
  { id: "dm2", users: [users[1]], unreadCount: 0, lastActivity: new Date(Date.now() - 3600000) },
  { id: "dm3", users: [users[2], users[3]], unreadCount: 1, lastActivity: new Date(Date.now() - 86400000) },
];

export const ChatSidebar = ({
  activeChannelId,
  activeDmId,
  onSelectChannel,
  onSelectDm,
  onCreateChannel,
  onCreateDm
}: {
  activeChannelId?: string;
  activeDmId?: string;
  onSelectChannel: (channelId: string) => void;
  onSelectDm: (dmId: string) => void;
  onCreateChannel: () => void;
  onCreateDm: () => void;
}) => {
  const [showChannels, setShowChannels] = useState(true);
  const [showDirectMessages, setShowDirectMessages] = useState(true);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [newChannelDialogOpen, setNewChannelDialogOpen] = useState(false);
  const [newDmDialogOpen, setNewDmDialogOpen] = useState(false);
  
  // Status do usuário
  const [userStatus, setUserStatus] = useState<"online" | "away" | "dnd" | "offline">("online");
  
  const statusColors = {
    online: "bg-green-500",
    away: "bg-yellow-500",
    dnd: "bg-red-500",
    offline: "bg-gray-400"
  };

  // Renderiza o indicador de status do usuário
  const renderStatusIndicator = (status: "online" | "away" | "dnd" | "offline") => {
    return (
      <div className={cn(
        "h-2.5 w-2.5 rounded-full", 
        statusColors[status]
      )} />
    );
  };

  // Gerar avatar a partir do nome se avatar URL não existir
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Renderiza o avatar do usuário
  const renderUserAvatar = (user: User) => {
    if (user.avatar) {
      return (
        <div className="relative">
          <img src={user.avatar} alt={user.name} className="h-6 w-6 rounded-full" />
          <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full ring-1 ring-white">
            {renderStatusIndicator(user.status)}
          </div>
        </div>
      );
    }
    
    return (
      <div className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
        <span className="text-xs font-medium">{getInitials(user.name)}</span>
        <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full ring-1 ring-white">
          {renderStatusIndicator(user.status)}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      {/* Cabeçalho do tenant */}
      <div className="flex items-center justify-between border-b p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <span className="text-lg font-semibold text-primary-foreground">O</span>
          </div>
          <h1 className="font-semibold">OmniChannel</h1>
        </div>
        <Button size="icon" variant="ghost">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Informações do usuário logado */}
      <div className="border-b p-3">
        <DropdownMenu open={statusMenuOpen} onOpenChange={setStatusMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-start p-2 hover:bg-muted"
            >
              <div className="flex items-center gap-2">
                <div className="relative h-8 w-8 rounded-full bg-muted">
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-sm font-medium">JS</span>
                  </div>
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background">
                    {renderStatusIndicator(userStatus)}
                  </div>
                </div>
                <div className="flex flex-1 flex-col text-left">
                  <span className="text-sm font-medium">{currentUser.name}</span>
                  <span className="text-xs text-muted-foreground">{userStatus === "online" ? "Disponível" : userStatus === "away" ? "Ausente" : userStatus === "dnd" ? "Não perturbe" : "Invisível"}</span>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <div className="p-2">
              <h4 className="mb-2 text-sm font-medium">Definir status</h4>
              <div className="grid gap-1">
                <Button 
                  variant={userStatus === "online" ? "default" : "ghost"}
                  size="sm" 
                  className="justify-start text-sm"
                  onClick={() => {
                    setUserStatus("online");
                    setStatusMenuOpen(false);
                  }}
                >
                  <div className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                  Disponível
                </Button>
                <Button 
                  variant={userStatus === "away" ? "default" : "ghost"}
                  size="sm" 
                  className="justify-start text-sm"
                  onClick={() => {
                    setUserStatus("away");
                    setStatusMenuOpen(false);
                  }}
                >
                  <div className="mr-2 h-2 w-2 rounded-full bg-yellow-500" />
                  Ausente
                </Button>
                <Button 
                  variant={userStatus === "dnd" ? "default" : "ghost"}
                  size="sm" 
                  className="justify-start text-sm"
                  onClick={() => {
                    setUserStatus("dnd");
                    setStatusMenuOpen(false);
                  }}
                >
                  <div className="mr-2 h-2 w-2 rounded-full bg-red-500" />
                  Não perturbe
                </Button>
                <Button 
                  variant={userStatus === "offline" ? "default" : "ghost"}
                  size="sm" 
                  className="justify-start text-sm"
                  onClick={() => {
                    setUserStatus("offline");
                    setStatusMenuOpen(false);
                  }}
                >
                  <div className="mr-2 h-2 w-2 rounded-full bg-gray-400" />
                  Invisível
                </Button>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Bell className="mr-2 h-4 w-4" />
              Pausar notificações
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Preferências
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Conteúdo da barra lateral */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-6 py-3">
          {/* Seção de navegação rápida */}
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <span className="text-xs font-medium">@</span>
                </div>
                <span className="text-sm">Menções & Reações</span>
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <span className="text-xs font-medium">#</span>
                </div>
                <span className="text-sm">Threads</span>
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <span className="text-xs font-medium">⭐</span>
                </div>
                <span className="text-sm">Itens Salvos</span>
              </div>
            </Button>
          </div>

          {/* Seção de canais */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-1"
                onClick={() => setShowChannels(!showChannels)}
              >
                {showChannels ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
              <div className="flex items-center">
                <span className="text-xs font-medium text-muted-foreground">Canais</span>
                <Dialog open={newChannelDialogOpen} onOpenChange={setNewChannelDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar um novo canal</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <label htmlFor="channel-name" className="text-sm font-medium">
                          Nome do canal
                        </label>
                        <Input id="channel-name" placeholder="ex: marketing" />
                        <p className="text-xs text-muted-foreground">
                          Utilize letras minúsculas, números e hífens
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="channel-description" className="text-sm font-medium">
                          Descrição (opcional)
                        </label>
                        <Input id="channel-description" placeholder="Objetivo deste canal" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="private-channel" className="h-4 w-4 rounded" />
                        <label htmlFor="private-channel" className="text-sm font-medium">
                          Tornar privado
                        </label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setNewChannelDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={() => {
                          onCreateChannel();
                          setNewChannelDialogOpen(false);
                        }}
                      >
                        Criar canal
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            {showChannels && (
              <div className="space-y-0.5 pl-2">
                {channels.map((channel) => (
                  <Button
                    key={channel.id}
                    variant={activeChannelId === channel.id ? "secondary" : "ghost"}
                    className="w-full justify-between px-2 py-1 text-left h-auto"
                    onClick={() => onSelectChannel(channel.id)}
                  >
                    <div className="flex items-center">
                      {channel.isPrivate ? (
                        <Lock className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <Hash className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span className="truncate text-sm">{channel.name}</span>
                    </div>
                    {channel.unreadCount > 0 && (
                      <div className="flex items-center">
                        {channel.hasMention ? (
                          <Badge variant="destructive" className="h-5 px-1">
                            {channel.unreadCount}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="h-5 px-1">
                            {channel.unreadCount}
                          </Badge>
                        )}
                      </div>
                    )}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Seção de mensagens diretas */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-1"
                onClick={() => setShowDirectMessages(!showDirectMessages)}
              >
                {showDirectMessages ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
              <div className="flex items-center">
                <span className="text-xs font-medium text-muted-foreground">Mensagens diretas</span>
                <Dialog open={newDmDialogOpen} onOpenChange={setNewDmDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nova mensagem</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <label htmlFor="search-users" className="text-sm font-medium">
                          Para:
                        </label>
                        <Input 
                          id="search-users" 
                          placeholder="Digite um nome de usuário"
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        <div className="grid gap-1">
                          {users.map((user) => (
                            <Button
                              key={user.id}
                              variant="ghost"
                              className="w-full justify-start px-2 py-1.5 h-auto"
                            >
                              <div className="flex items-center gap-2">
                                {renderUserAvatar(user)}
                                <div className="flex flex-col items-start">
                                  <span className="text-sm font-medium">{user.name}</span>
                                  {user.title && (
                                    <span className="text-xs text-muted-foreground">{user.title}</span>
                                  )}
                                </div>
                                <div className="ml-auto">
                                  {renderStatusIndicator(user.status)}
                                </div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setNewDmDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={() => {
                          onCreateDm();
                          setNewDmDialogOpen(false);
                        }}
                      >
                        Iniciar conversa
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            {showDirectMessages && (
              <div className="space-y-0.5 pl-2">
                {directMessages.map((dm) => (
                  <Button
                    key={dm.id}
                    variant={activeDmId === dm.id ? "secondary" : "ghost"}
                    className="w-full justify-between px-2 py-1 text-left h-auto"
                    onClick={() => onSelectDm(dm.id)}
                  >
                    <div className="flex items-center gap-2">
                      {renderUserAvatar(dm.users[0])}
                      <span className="truncate text-sm">
                        {dm.users.length === 1 
                          ? dm.users[0].name.split(" ")[0] 
                          : dm.users.map(u => u.name.split(" ")[0]).join(", ")}
                      </span>
                    </div>
                    {dm.unreadCount > 0 && (
                      <Badge variant="secondary" className="h-5 px-1">
                        {dm.unreadCount}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};