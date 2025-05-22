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
  Send,
  Paperclip,
  Mic,
  ArrowUpRight,
  Calendar,
  Forward
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
  const [showPreviousMessages, setShowPreviousMessages] = useState(false);

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
      <div className="w-52 h-full border-r hidden md:flex md:flex-col">
        {/* Cabeçalho do painel */}
        <div className="p-2 border-b flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold">Caixa de Entrada</h2>
            <div className="flex items-center space-x-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-6 gap-1 text-xs">
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
              
              <Button variant="ghost" size="icon" className="h-6 w-6" title="Nova Conversa">
                <Plus className="h-3.5 w-3.5" />
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
              <span>{totalUnassigned} não atr.</span>
            </Badge>
          </div>

          {/* Barra de pesquisa universal e filtros */}
          <div className="flex gap-1">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                placeholder="Buscar..." 
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
            className="mt-1"
          >
            <TabsList className="w-full h-7 grid grid-cols-3 mb-1">
              <TabsTrigger value="all" className="text-xs h-6 px-1">
                Todas ({totalActiveConversations})
              </TabsTrigger>
              <TabsTrigger value="mine" className="text-xs h-6 px-1">
                Minhas ({Math.floor(totalActiveConversations/2)})
              </TabsTrigger>
              <TabsTrigger value="unassigned" className="text-xs h-6 px-1">
                Não Atr. ({totalUnassigned})
              </TabsTrigger>
            </TabsList>
            <TabsList className="w-full h-7 grid grid-cols-3 mb-1">
              <TabsTrigger value="mentioned" className="text-xs h-6 px-1">
                @Menções ({totalMentions})
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs h-6 px-1">
                Não Lidas ({totalUnread})
              </TabsTrigger>
              <TabsTrigger value="favorites" className="text-xs h-6 px-1">
                <Star className="h-3 w-3 mr-1" />
                Favoritas
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
              <SelectTrigger className="h-6 text-xs w-32">
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

        {/* Lista de Conversas com botão para carregar mais */}
        <div className="flex-1 overflow-auto flex flex-col" ref={conversationListRef}>
          <ConversationList onSelectConversation={handleSelectConversation} limit={20} />
        </div>
      </div>

      {/* Painel Central: Área da Conversa Ativa (ConversationView) */}
      <div className="flex-1 h-full overflow-hidden flex flex-col pl-0" ref={messagesPanelRef}>
        {selectedConversation ? (
          <div className="h-full flex flex-col">
            {/* Cabeçalho da Conversa */}
            <div className="border-b p-2 flex items-center justify-between bg-background sticky top-0 z-10">
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
            
            {/* Botão foi movido para o componente MessagePanel */}
            
            {/* Espaço para o histórico de mensagens */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-muted/20">
              <div className="text-center text-muted-foreground text-xs py-3">
                <span className="px-3 py-1 rounded-full bg-muted">Início da conversa</span>
              </div>
              
              {/* Mensagens do cliente - limitadas inicialmente, expandidas quando solicitado */}
              <div className="flex flex-col space-y-3">
                {/* Mensagem do Cliente 1 */}
                <div className="flex items-start gap-2 max-w-[70%]">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">
                      {selectedConversation.name?.charAt(0) || "C"}
                    </span>
                  </div>
                  <div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm p-2.5">
                      <p className="text-sm">Olá, gostaria de saber mais sobre o curso de licenciatura em Letras Português.</p>
                    </div>
                    <div className="flex items-center mt-1 ml-1">
                      <span className="text-xs text-muted-foreground">11:35</span>
                    </div>
                  </div>
                </div>
                
                {/* Mensagem do Agente 1 */}
                <div className="flex items-start gap-2 max-w-[70%] self-end flex-row-reverse">
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-white">A</span>
                  </div>
                  <div>
                    <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm p-2.5">
                      <p className="text-sm">Olá! Claro, temos duas modalidades de licenciatura em Letras Português: presencial e EAD. 
                      Qual delas você tem interesse?</p>
                    </div>
                    <div className="flex items-center justify-end mt-1 mr-1">
                      <span className="text-xs text-muted-foreground mr-1">11:36</span>
                      <span className="text-xs text-primary">✓✓</span>
                    </div>
                  </div>
                </div>
                
                {/* Mensagem do Cliente 2 */}
                <div className="flex items-start gap-2 max-w-[70%]">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">
                      {selectedConversation.name?.charAt(0) || "C"}
                    </span>
                  </div>
                  <div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm p-2.5">
                      <p className="text-sm">Gostaria de verificar as duas.</p>
                    </div>
                    <div className="flex items-center mt-1 ml-1">
                      <span className="text-xs text-muted-foreground">11:42</span>
                    </div>
                  </div>
                </div>
                
                {/* Marcador de tempo */}
                <div className="text-center text-muted-foreground text-xs py-2">
                  <span className="px-2 py-0.5 rounded-full bg-muted/60">Hoje</span>
                </div>
                
                {/* Mensagem do Cliente 3 */}
                <div className="flex items-start gap-2 max-w-[70%]">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">
                      {selectedConversation.name?.charAt(0) || "C"}
                    </span>
                  </div>
                  <div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm p-2.5">
                      <p className="text-sm">Se eu quiser fazer a segunda graduação em Licenciatura em Letras Português, é possível, né?</p>
                    </div>
                    <div className="flex items-center mt-1 ml-1">
                      <span className="text-xs text-muted-foreground">16:04</span>
                    </div>
                  </div>
                </div>
                
                {/* Nota Interna */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 mx-6">
                  <div className="flex items-center mb-1">
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center mr-1">
                      <span className="text-[10px] font-medium text-white">A</span>
                    </div>
                    <span className="text-xs font-medium">Nota Interna</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cliente está interessado em fazer uma segunda graduação. Verificar se ele tem direito ao desconto de 20% para alunos que já possuem graduação.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Área de composição de mensagem - Posicionada na parte inferior */}
            <div className="border-t bg-background sticky bottom-0 z-10">
              {/* Barra de ferramentas superior do editor */}
              <div className="px-3 pt-2 flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" title="Anexar arquivo">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" title="Mensagem de áudio">
                    <Mic className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" title="Respostas Rápidas">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    <span>Respostas Rápidas</span>
                  </Button>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" title="Agendar Envio">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Agendar</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-primary" title="Verificar com Prof. Ana">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain-circuit">
                      <path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08 2.5 2.5 0 0 0 4.91.05L12 20V4.5Z"/>
                      <path d="M16 8V5c0-1.1.9-2 2-2"/>
                      <path d="M12 13h4"/>
                      <path d="M12 18h6a2 2 0 0 1 2 2v1"/>
                      <path d="M12 8h8"/>
                      <path d="M20.5 8a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"/>
                      <path d="M16.5 13a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"/>
                      <path d="M20.5 21a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"/>
                      <path d="M2.5 14a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"/>
                    </svg>
                    <span>Prof. Ana</span>
                  </Button>
                </div>
              </div>
              
              {/* Área de entrada de texto */}
              <div className="p-3 relative">
                <textarea 
                  placeholder="Digite sua mensagem..." 
                  className="w-full px-3 py-2 resize-none rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px]"
                  rows={3}
                />
                
                <div className="mt-2 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" title="Adicionar emoji">
                      <Smile className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1" title="Criar Mensagem Interativa">
                      <Plus className="h-3.5 w-3.5" />
                      <span>Interativa</span>
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" title="Encaminhar para...">
                      <Forward className="h-3.5 w-3.5" />
                      <span>Encaminhar</span>
                    </Button>
                    <Button size="sm" className="h-8 gap-1 bg-primary text-primary-foreground">
                      <Send className="h-3.5 w-3.5" />
                      <span>Enviar</span>
                    </Button>
                  </div>
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