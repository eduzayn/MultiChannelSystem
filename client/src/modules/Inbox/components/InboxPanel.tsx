import { useState } from "react";
import { ConversationList } from "./ConversationList";
import { ConversationItemProps } from "./ConversationItem";
import { MessagePanel } from "@/modules/Messages/components/MessagePanel";
import { ContactPanel } from "@/modules/Contacts/components/ContactPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Plus, ChevronDown, Users, MessageSquare, Search } from "lucide-react";
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

// Tipos de filtro
type FilterStatus = "all" | "unassigned" | "mine" | "mentioned" | "resolved";

export const InboxPanel = () => {
  const [selectedConversation, setSelectedConversation] = useState<ConversationItemProps | null>(null);
  const [contactPanelOpen, setContactPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string>("online");

  // Estados dos filtros avançados
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assignedToFilter, setAssignedToFilter] = useState<string>("all");

  const handleSelectConversation = (conversation: ConversationItemProps) => {
    setSelectedConversation(conversation);
    
    // Em dispositivos móveis, poderíamos querer fechar o painel de contato ao selecionar uma conversa
    // para economizar espaço
    if (window.innerWidth < 1024) {
      setContactPanelOpen(false);
    } else {
      setContactPanelOpen(true);
    }
  };

  const toggleContactPanel = () => {
    setContactPanelOpen(!contactPanelOpen);
  };

  const handleFilterChange = (filter: FilterStatus) => {
    setActiveFilter(filter);
    // Aqui implementaríamos a lógica para filtrar as conversas com base no filtro selecionado
  };

  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  // Contadores para o cabeçalho (simulados)
  const totalUnassigned = 5;
  const totalNewMessages = 12;

  return (
    <div className="h-full w-full flex overflow-hidden">
      {/* Lista de conversas (Esquerda) */}
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
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-gray-400" />
                    )}
                    {agentStatus === "online" ? "Disponível" : agentStatus === "busy" ? "Ocupado" : "Ausente"}
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
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Contadores globais */}
          <div className="flex space-x-1 mb-2">
            <Badge variant="outline" className="gap-1 py-0 text-xs px-1.5">
              <MessageSquare className="h-3 w-3" />
              <span>{totalNewMessages} novas</span>
            </Badge>
            <Badge variant="outline" className="gap-1 py-0 text-xs px-1.5">
              <Users className="h-3 w-3" />
              <span>{totalUnassigned} não atribuídas</span>
            </Badge>
          </div>

          {/* Barra de pesquisa e filtros */}
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
            >
              <Filter className="h-3.5 w-3.5" />
            </Button>
          </div>
          
          {/* Filtros rápidos */}
          <div className="flex mt-2 border-b pb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`rounded-md px-2 py-0.5 text-xs h-6 ${activeFilter === 'all' ? 'bg-accent text-accent-foreground' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              Todas
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`rounded-md px-2 py-0.5 text-xs h-6 ${activeFilter === 'unassigned' ? 'bg-accent text-accent-foreground' : ''}`}
              onClick={() => handleFilterChange('unassigned')}
            >
              Não Atribuídas
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`rounded-md px-2 py-0.5 text-xs h-6 ${activeFilter === 'mine' ? 'bg-accent text-accent-foreground' : ''}`}
              onClick={() => handleFilterChange('mine')}
            >
              Minhas
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`rounded-md px-2 py-0.5 text-xs h-6 ${activeFilter === 'mentioned' ? 'bg-accent text-accent-foreground' : ''}`}
              onClick={() => handleFilterChange('mentioned')}
            >
              @Menções
            </Button>
          </div>
          
          {/* Filtros avançados (expandidos) */}
          {showAdvancedFilters && (
            <div className="py-2 space-y-2 border-b">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Canal</label>
                <Select value={channelFilter} onValueChange={setChannelFilter}>
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Selecione o canal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">Todos os Canais</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp (ZapAPI)</SelectItem>
                      <SelectItem value="instagram">Instagram Direct</SelectItem>
                      <SelectItem value="facebook">Facebook Messenger</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="new">Nova</SelectItem>
                      <SelectItem value="open">Aberta</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="waiting">Aguardando Cliente</SelectItem>
                      <SelectItem value="resolved">Resolvida</SelectItem>
                      <SelectItem value="closed">Fechada</SelectItem>
                      <SelectItem value="ai">Atendimento pela IA</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Atribuído a</label>
                <Select value={assignedToFilter} onValueChange={setAssignedToFilter}>
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Selecione o agente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">Todos os Agentes</SelectItem>
                      <SelectItem value="unassigned">Não Atribuído</SelectItem>
                      <SelectItem value="me">Meus Atendimentos</SelectItem>
                      <SelectItem value="team-support">Equipe Suporte</SelectItem>
                      <SelectItem value="team-sales">Equipe Vendas</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Conteúdo da lista que deve ocupar o espaço disponível e permitir scroll */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <ConversationList onSelectConversation={handleSelectConversation} />
        </div>
      </div>

      {/* Painel de mensagens (Centro) */}
      <div className="flex-1 h-full overflow-hidden flex flex-col">
        {selectedConversation ? (
          <MessagePanel 
            conversation={selectedConversation} 
            onToggleContactPanel={toggleContactPanel} 
          />
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

      {/* Painel de contato (Direita) - Condicional */}
      {selectedConversation && contactPanelOpen && (
        <div className="w-72 h-full border-l hidden lg:block overflow-auto">
          <ContactPanel conversation={selectedConversation} />
        </div>
      )}
    </div>
  );
};