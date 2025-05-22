import { useState, useRef, useEffect } from "react";
import { ConversationList } from "./ConversationList";
import { ConversationItemProps } from "./ConversationItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Filter, 
  Plus, 
  ChevronDown, 
  Users, 
  MessageSquare, 
  Search,
  Bell,
  Clock,
  Star,
  AtSign,
  Eye,
  CheckCheck,
  MoreHorizontal,
  Smile,
  Send
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Tipos e interfaces
type AgentStatus = "online" | "away" | "busy" | "offline";
type FilterTab = "all" | "mine" | "unassigned" | "mentioned" | "unread" | "sla-risk" | "favorites";
type ConversationStatus = "new" | "open" | "pending-client" | "pending-agent" | "ai-handling" | "resolved" | "closed" | "spam";
type ConversationPriority = "low" | "normal" | "high" | "urgent";
type ChannelType = "whatsapp-api" | "whatsapp-zapi" | "instagram" | "facebook" | "email" | "sms" | "voice" | "internal";

interface AdvancedFilters {
  channels: ChannelType[];
  status: ConversationStatus[];
  assignedTo: string[];
  teams: string[];
  tags: string[];
  priority: ConversationPriority[];
  dateRange: {
    field: "last-message" | "created-at";
    start: Date | null;
    end: Date | null;
    preset: "today" | "yesterday" | "last-week" | "custom" | null;
  };
  sentiment?: "positive" | "neutral" | "negative" | null;
  hasAttachment?: boolean | null;
}

export const InboxPanel = () => {
  // Estados principais
  const [selectedConversation, setSelectedConversation] = useState<ConversationItemProps | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>("online");
  const [activeSortOrder, setActiveSortOrder] = useState<string>("recent");
  const [contextPanelTab, setContextPanelTab] = useState<string>("profile");

  // Estados dos filtros avançados
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    channels: [],
    status: [],
    assignedTo: [],
    teams: [],
    tags: [],
    priority: [],
    dateRange: {
      field: "last-message",
      start: null,
      end: null,
      preset: null
    },
    sentiment: null,
    hasAttachment: null
  });

  // Referências para rolagem e virtualização
  const conversationListRef = useRef<HTMLDivElement>(null);
  const messagesPanelRef = useRef<HTMLDivElement>(null);

  // Contadores para o cabeçalho (simulados)
  const totalUnassigned = 5;
  const totalActiveConversations = 12;
  const totalMentions = 3;
  const totalUnread = 8;
  const totalSlaRisk = 2;
  const totalFavorites = 4;

  const handleSelectConversation = (conversation: ConversationItemProps) => {
    setSelectedConversation(conversation);
  };

  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab);
  };

  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };
  
  const updateAdvancedFilters = (newFilters: Partial<AdvancedFilters>) => {
    setAdvancedFilters({...advancedFilters, ...newFilters});
  };
  
  const handleSortOrderChange = (order: string) => {
    setActiveSortOrder(order);
  };

  return (
    <div className="h-full w-full flex overflow-hidden">
      {/* Painel Esquerdo: Lista de Conversas (InboxPanel) */}
      <div className="w-72 h-full border-r hidden md:flex md:flex-col">
        {/* Cabeçalho do painel */}
        <div className="p-2 border-b flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Caixa de Entrada</h2>
            <div className="flex items-center space-x-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
                    {agentStatus === "online" ? (
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                    ) : agentStatus === "busy" ? (
                      <span className="h-2 w-2 rounded-full bg-yellow-500" />
                    ) : agentStatus === "away" ? (
                      <span className="h-2 w-2 rounded-full bg-gray-400" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                    )}
                    {agentStatus === "online" ? "Disponível" : 
                     agentStatus === "busy" ? "Ocupado" : 
                     agentStatus === "away" ? "Ausente" : "Offline"}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Status do Agente</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setAgentStatus("online")}>
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                    Disponível
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAgentStatus("busy")}>
                    <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2" />
                    Ocupado
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAgentStatus("away")}>
                    <span className="h-2 w-2 rounded-full bg-gray-400 mr-2" />
                    Ausente
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAgentStatus("offline")}>
                    <span className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                    Offline
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="ghost" size="icon" className="h-7 w-7" title="Nova Conversa">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Indicadores de Volume de Trabalho */}
          <div className="flex flex-wrap gap-1 mb-2">
            <Badge variant="outline" className="gap-1 py-0 text-xs px-1.5">
              <MessageSquare className="h-3 w-3" />
              <span>{totalActiveConversations} ativas</span>
            </Badge>
            <Badge variant="outline" className="gap-1 py-0 text-xs px-1.5">
              <Users className="h-3 w-3" />
              <span>{totalUnassigned} não atribuídas</span>
            </Badge>
            <Badge variant="outline" className="gap-1 py-0 text-xs px-1.5">
              <Clock className="h-3 w-3" />
              <span>{totalSlaRisk} SLA em risco</span>
            </Badge>
          </div>

          {/* Barra de pesquisa universal e filtros */}
          <div className="flex gap-1">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                placeholder="Buscar nome, telefone, conteúdo..." 
                className="pl-7 h-7 text-sm" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={toggleAdvancedFilters}
              className={`h-7 w-7 ${showAdvancedFilters ? "bg-accent" : ""}`}
              title="Filtros Avançados"
            >
              <Filter className="h-3.5 w-3.5" />
            </Button>
          </div>
          
          {/* Abas de Filtros Rápidos */}
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => handleTabChange(value as FilterTab)}
            className="mt-2"
          >
            <TabsList className="w-full h-8 grid grid-cols-4 mb-2">
              <TabsTrigger value="all" className="text-xs h-7 px-1">
                Todas <span className="ml-1 text-muted-foreground">({totalActiveConversations})</span>
              </TabsTrigger>
              <TabsTrigger value="mine" className="text-xs h-7 px-1">
                Minhas <span className="ml-1 text-muted-foreground">({Math.floor(totalActiveConversations/2)})</span>
              </TabsTrigger>
              <TabsTrigger value="unassigned" className="text-xs h-7 px-1">
                Não Atr. <span className="ml-1 text-muted-foreground">({totalUnassigned})</span>
              </TabsTrigger>
              <TabsTrigger value="mentioned" className="text-xs h-7 px-1">
                @Menções <span className="ml-1 text-muted-foreground">({totalMentions})</span>
              </TabsTrigger>
            </TabsList>
            <TabsList className="w-full h-8 grid grid-cols-3 mb-1">
              <TabsTrigger value="unread" className="text-xs h-7 px-1">
                Não Lidas <span className="ml-1 text-muted-foreground">({totalUnread})</span>
              </TabsTrigger>
              <TabsTrigger value="sla-risk" className="text-xs h-7 px-1">
                SLA Risco <span className="ml-1 text-muted-foreground">({totalSlaRisk})</span>
              </TabsTrigger>
              <TabsTrigger value="favorites" className="text-xs h-7 px-1">
                <Star className="h-3 w-3 mr-1" />
                Favoritas <span className="ml-1 text-muted-foreground">({totalFavorites})</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Filtros avançados (expandidos) */}
          {showAdvancedFilters && (
            <div className="py-2 space-y-2 border-b">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Canal de Origem</label>
                <Select>
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Todos os canais" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">Todos os Canais</SelectItem>
                      <SelectItem value="whatsapp-api">WhatsApp API Oficial</SelectItem>
                      <SelectItem value="whatsapp-zapi">WhatsApp Z-API</SelectItem>
                      <SelectItem value="instagram">Instagram DM</SelectItem>
                      <SelectItem value="facebook">Facebook Messenger</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="voice">Telefonia</SelectItem>
                      <SelectItem value="internal">Chat Interno</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Status da Conversa</label>
                <Select>
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="new">Nova</SelectItem>
                      <SelectItem value="open">Aberta</SelectItem>
                      <SelectItem value="pending-client">Pendente Cliente</SelectItem>
                      <SelectItem value="pending-agent">Pendente Agente</SelectItem>
                      <SelectItem value="ai-handling">Em Atendimento pela IA</SelectItem>
                      <SelectItem value="resolved">Resolvida</SelectItem>
                      <SelectItem value="closed">Fechada</SelectItem>
                      <SelectItem value="spam">Spam</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Prioridade</label>
                <Select>
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Qualquer prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">Qualquer Prioridade</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-between pt-1">
                <Button variant="outline" size="sm" className="text-xs h-7">
                  Limpar Filtros
                </Button>
                <Button size="sm" className="text-xs h-7">
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          )}
          
          {/* Seletor de ordenação */}
          <div className="flex items-center justify-between pt-2 pb-1 border-t mt-1">
            <span className="text-xs text-muted-foreground">Ordenar por:</span>
            <Select value={activeSortOrder} onValueChange={handleSortOrderChange}>
              <SelectTrigger className="h-6 text-xs w-40">
                <SelectValue placeholder="Mais Recente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais Recente</SelectItem>
                <SelectItem value="oldest">Mais Antiga</SelectItem>
                <SelectItem value="priority">Prioridade</SelectItem>
                <SelectItem value="waiting-time">Maior Tempo de Espera</SelectItem>
                <SelectItem value="sla">SLA mais próximo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista de Conversas com scroll infinito */}
        <div className="flex-1 overflow-hidden flex flex-col" ref={conversationListRef}>
          <ConversationList onSelectConversation={handleSelectConversation} />
        </div>
      </div>

      {/* Painel Central: Área da Conversa Ativa (ConversationView) */}
      <div className="flex-1 h-full overflow-hidden flex flex-col" ref={messagesPanelRef}>
        {selectedConversation ? (
          <div className="h-full flex flex-col">
            {/* Cabeçalho da Conversa */}
            <div className="border-b p-2 flex items-center justify-between bg-background">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                  <span className="text-xs font-medium text-primary">
                    {selectedConversation.name?.charAt(0) || "C"}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-sm">{selectedConversation.name || "Contato"}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation.channel || "WhatsApp"} - {selectedConversation.identifier || "Cliente"}
                  </p>
                </div>
              </div>
              
              {/* Barra de ferramentas da conversa */}
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  <CheckCheck className="h-4 w-4 mr-1" /> Resolver
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Users className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" /> Marcar como Não Lida
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Star className="h-4 w-4 mr-2" /> Adicionar aos Favoritos
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <AtSign className="h-4 w-4 mr-2" /> Mencionar Colega
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Espaço para o histórico de mensagens */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-muted/20">
              <div className="text-center text-muted-foreground text-sm py-3">
                <span className="px-3 py-1 rounded-full bg-muted">Início da conversa</span>
              </div>
              
              {/* Placeholder para exibição de mensagens */}
              <div className="text-center p-4">
                <p className="text-muted-foreground">
                  O Histórico de Mensagens será reconstruído conforme novas orientações.
                </p>
              </div>
            </div>
            
            {/* Área de composição de mensagem - Posicionada na parte inferior */}
            <div className="border-t p-3 bg-background mt-auto shrink-0">
              <div className="relative">
                <Input 
                  placeholder="Digite sua mensagem..." 
                  className="pr-20 min-h-[40px]"
                />
                <div className="absolute right-2 top-[50%] transform -translate-y-1/2 flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <Smile className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button size="icon" className="h-8 w-8 rounded-full bg-primary">
                    <Send className="h-4 w-4 text-primary-foreground" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center bg-muted/30">
            <div className="text-center p-4">
              <h2 className="text-2xl font-semibold mb-2">Bem-vindo à Caixa de Entrada</h2>
              <p className="text-muted-foreground">
                Selecione uma conversa para começar a interagir.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Painel Direito: Contexto e Ferramentas (ContextPanel) */}
      <div className="w-72 h-full border-l hidden lg:block overflow-hidden">
        {selectedConversation ? (
          <div className="h-full flex flex-col">
            {/* Abas de navegação do contexto */}
            <Tabs value={contextPanelTab} onValueChange={setContextPanelTab} className="w-full h-full flex flex-col">
              <TabsList className="p-1 h-10 flex justify-between">
                <TabsTrigger value="profile" className="text-xs flex-1">Perfil</TabsTrigger>
                <TabsTrigger value="history" className="text-xs flex-1">Histórico</TabsTrigger>
                <TabsTrigger value="ai" className="text-xs flex-1">Prof. Ana</TabsTrigger>
              </TabsList>
              
              {/* Conteúdo da aba de perfil */}
              <TabsContent value="profile" className="flex-1 overflow-y-auto p-3 space-y-4">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-medium text-primary">
                      {selectedConversation.name?.charAt(0) || "C"}
                    </span>
                  </div>
                  <h3 className="font-semibold">{selectedConversation.name || "Contato"}</h3>
                  <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-0">
                    Cliente Ativo
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-[auto,1fr] gap-2 items-center">
                    <div className="text-muted-foreground text-xs">Email:</div>
                    <div className="text-xs font-medium">maria.santos@email.com</div>
                    
                    <div className="text-muted-foreground text-xs">Telefone:</div>
                    <div className="text-xs font-medium">+55 (11) 98765-4321</div>
                    
                    <div className="text-muted-foreground text-xs">Empresa:</div>
                    <div className="text-xs font-medium">ABC Ltda.</div>
                    
                    <div className="text-muted-foreground text-xs">Cadastrado em:</div>
                    <div className="text-xs font-medium">21/02/2025</div>
                    
                    <div className="text-muted-foreground text-xs">Último contato:</div>
                    <div className="text-xs font-medium">19/05/2025</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Métricas</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/40 p-2 rounded-md">
                      <div className="text-xs text-muted-foreground">Conversas</div>
                      <div className="text-sm font-semibold">12</div>
                    </div>
                    <div className="bg-muted/40 p-2 rounded-md">
                      <div className="text-xs text-muted-foreground">Compras</div>
                      <div className="text-sm font-semibold">3</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Valor Total</h4>
                  <div className="bg-primary/5 p-3 rounded-md text-center">
                    <span className="text-lg font-bold text-primary">R$ 2.350,00</span>
                  </div>
                </div>
              </TabsContent>
              
              {/* Outras abas serão implementadas conforme necessário */}
              <TabsContent value="history" className="flex-1 overflow-y-auto p-3">
                <p className="text-muted-foreground text-sm">
                  O histórico de interações será implementado conforme novas orientações.
                </p>
              </TabsContent>
              
              <TabsContent value="ai" className="flex-1 overflow-y-auto p-3">
                <p className="text-muted-foreground text-sm">
                  A assistência da IA Prof. Ana será implementada conforme novas orientações.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Painel de Contexto</h3>
            <p className="text-muted-foreground text-sm">
              Selecione uma conversa para ver detalhes e ferramentas de apoio.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};