import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, X, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContactDetail from "@/modules/Contacts/components/ContactDetail";
import { ContactForm } from "@/modules/Contacts/components/ContactForm";
import { ImportWhatsAppContacts } from "@/modules/Contacts/components/ImportWhatsAppContacts";

// Dados de exemplo para os contatos
const MOCK_CONTACTS = [
  { 
    id: 1, 
    name: "Maria Santos", 
    email: "maria.santos@email.com", 
    phone: "+55 11 91234-5678", 
    type: "Cliente",
    company: "ABC Tecnologia",
    lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(2023, 5, 15),
    tags: ["VIP", "Suporte Premium"],
    owner: "João da Silva"
  },
  { 
    id: 2, 
    name: "João Pereira", 
    email: "joao.pereira@email.com", 
    phone: "+55 11 98765-4321", 
    type: "Lead",
    company: "XYZ Marketing",
    lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(2023, 8, 22),
    tags: ["Novo", "Prospecto"],
    owner: "Ana Oliveira"
  },
  { 
    id: 3, 
    name: "Ana Oliveira", 
    email: "ana.oliveira@email.com", 
    phone: "+55 11 99876-5432", 
    type: "Cliente",
    company: "LMN Consultoria",
    lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(2022, 11, 10),
    tags: ["VIP", "Parceiro"],
    owner: "Carlos Gomes"
  },
  { 
    id: 4, 
    name: "Carlos Silva", 
    email: "carlos.silva@email.com", 
    phone: "+55 11 95432-1098", 
    type: "Cliente",
    company: "PQR Soluções",
    lastActivity: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    createdAt: new Date(2023, 2, 5),
    tags: ["Ativo"],
    owner: "João da Silva"
  },
  { 
    id: 5, 
    name: "Beatriz Lima", 
    email: "beatriz.lima@email.com", 
    phone: "+55 11 93210-9876", 
    type: "Lead",
    company: "STU Sistemas",
    lastActivity: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    createdAt: new Date(2023, 9, 30),
    tags: ["Potencial", "E-commerce"],
    owner: "Ana Oliveira"
  },
];

export default function ContactsPage() {
  // Estado para o termo de busca
  const [searchQuery, setSearchQuery] = useState("");
  
  // Estado para os filtros
  const [activeFilters, setActiveFilters] = useState({
    type: [] as string[],
    tags: [] as string[],
    owner: [] as string[]
  });
  
  // Estado para controlar a seleção de contatos para ações em massa
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  
  // Estado para controlar a exibição do modal de detalhes do contato
  const [contactDetailOpen, setContactDetailOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  
  // Estado para controlar a exibição do modal de criação/edição de contato
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  
  // Estado para controlar a exibição do popover de filtros
  const [filtersOpen, setFiltersOpen] = useState(false);

  const selectedContact = selectedContactId 
    ? MOCK_CONTACTS.find(contact => contact.id === selectedContactId) 
    : null;
  
  // Filtrar contatos com base na busca e nos filtros ativos
  const filteredContacts = MOCK_CONTACTS.filter(contact => {
    // Filtro da busca
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery) ||
      contact.company.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtros de tipo
    const matchesType = activeFilters.type.length === 0 || 
      activeFilters.type.includes(contact.type);
    
    // Filtros de tags
    const matchesTags = activeFilters.tags.length === 0 || 
      contact.tags.some(tag => activeFilters.tags.includes(tag));
    
    // Filtros de proprietário
    const matchesOwner = activeFilters.owner.length === 0 || 
      activeFilters.owner.includes(contact.owner);
    
    return matchesSearch && matchesType && matchesTags && matchesOwner;
  });

  // Toggle de seleção para todos os contatos (checkbox do cabeçalho)
  const toggleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(contact => contact.id));
    }
  };

  // Toggle de seleção para um contato específico
  const toggleSelectContact = (id: number) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter(contactId => contactId !== id));
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };

  // Formata a data de última atividade para exibição
  const formatLastActivity = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return `${diffDays} dias atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };
  
  // Abre o modal de detalhes do contato
  const openContactDetail = (id: number) => {
    setSelectedContactId(id);
    setContactDetailOpen(true);
  };
  
  // Abre o modal de edição de contato
  const openEditContact = (contact: any) => {
    setEditingContact(contact);
    setContactFormOpen(true);
  };
  
  // Fecha o modal de detalhes
  const handleCloseContactDetail = () => {
    setContactDetailOpen(false);
    setSelectedContactId(null);
  };
  
  // Fecha o modal de criação/edição de contato
  const handleCloseContactForm = () => {
    setContactFormOpen(false);
    setEditingContact(null);
  };
  
  // Lidar com a aplicação de filtros
  const handleApplyFilter = (filterType: string, value: string) => {
    setActiveFilters(prev => {
      const currentValues = prev[filterType as keyof typeof prev] as string[];
      
      if (currentValues.includes(value)) {
        // Remove o filtro se já estiver aplicado
        return {
          ...prev,
          [filterType]: currentValues.filter(v => v !== value)
        };
      } else {
        // Adiciona o filtro se não estiver aplicado
        return {
          ...prev,
          [filterType]: [...currentValues, value]
        };
      }
    });
  };
  
  // Reset de todos os filtros
  const resetFilters = () => {
    setActiveFilters({
      type: [],
      tags: [],
      owner: []
    });
    setFiltersOpen(false);
  };
  
  // Contagem de filtros ativos
  const activeFiltersCount = 
    activeFilters.type.length + 
    activeFilters.tags.length + 
    activeFilters.owner.length;

  // Extrair todas as tags e proprietários únicos da lista de contatos para os filtros
  const allTags = Array.from(new Set(MOCK_CONTACTS.flatMap(contact => contact.tags)));
  const allOwners = Array.from(new Set(MOCK_CONTACTS.map(contact => contact.owner)));
  
  // Simular salvar um contato
  const handleSaveContact = (contactData: any) => {
    console.log('Salvando contato:', contactData);
    setContactFormOpen(false);
    setEditingContact(null);
    // Aqui você faria uma chamada para a API para criar/atualizar o contato
  };

  return (
    <div className="p-6">
      {/* Cabeçalho da página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Contatos</h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar contatos..." 
              className="pl-9 w-full sm:w-[250px]" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Filtros */}
          <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                <Filter className="h-4 w-4 mr-1" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Filtros</h3>
                <Button variant="ghost" size="sm" onClick={resetFilters} className="h-7 text-xs">
                  Limpar filtros
                </Button>
              </div>
              
              <Tabs defaultValue="type">
                <TabsList className="w-full mb-3">
                  <TabsTrigger value="type" className="flex-1">Tipo</TabsTrigger>
                  <TabsTrigger value="tags" className="flex-1">Tags</TabsTrigger>
                  <TabsTrigger value="owner" className="flex-1">Proprietário</TabsTrigger>
                </TabsList>
                
                <TabsContent value="type" className="mt-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="filter-type-cliente" 
                        checked={activeFilters.type.includes("Cliente")}
                        onCheckedChange={() => handleApplyFilter("type", "Cliente")}
                      />
                      <label htmlFor="filter-type-cliente" className="text-sm">Cliente</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="filter-type-lead" 
                        checked={activeFilters.type.includes("Lead")}
                        onCheckedChange={() => handleApplyFilter("type", "Lead")}
                      />
                      <label htmlFor="filter-type-lead" className="text-sm">Lead</label>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="tags" className="mt-0">
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {allTags.map(tag => (
                      <div key={tag} className="flex items-center gap-2">
                        <Checkbox 
                          id={`filter-tag-${tag}`} 
                          checked={activeFilters.tags.includes(tag)}
                          onCheckedChange={() => handleApplyFilter("tags", tag)}
                        />
                        <label htmlFor={`filter-tag-${tag}`} className="text-sm">{tag}</label>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="owner" className="mt-0">
                  <div className="space-y-2">
                    {allOwners.map(owner => (
                      <div key={owner} className="flex items-center gap-2">
                        <Checkbox 
                          id={`filter-owner-${owner}`} 
                          checked={activeFilters.owner.includes(owner)}
                          onCheckedChange={() => handleApplyFilter("owner", owner)}
                        />
                        <label htmlFor={`filter-owner-${owner}`} className="text-sm">{owner}</label>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </PopoverContent>
          </Popover>
          
          {/* Botão para importar contatos do WhatsApp */}
          <ImportWhatsAppContacts 
            onImportComplete={() => {
              // Recarregar a lista de contatos ao concluir a importação
              console.log("Contatos do WhatsApp importados com sucesso!");
            }}
          />

          {/* Botão Novo Contato */}
          <Button 
            className="flex items-center ml-2" 
            onClick={() => {
              setEditingContact(null);
              setContactFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Novo Contato
          </Button>
        </div>
      </div>

      {/* Lista de contatos */}
      <div className="rounded-md border overflow-hidden">
        {/* Cabeçalho da tabela */}
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="py-3 px-4 text-left w-[40px]">
                <Checkbox 
                  id="select-all"
                  checked={filteredContacts.length > 0 && selectedContacts.length === filteredContacts.length}
                  onCheckedChange={toggleSelectAll}
                />
              </th>
              <th className="py-3 px-4 text-left font-medium text-sm">Nome</th>
              <th className="py-3 px-4 text-left font-medium text-sm">Email</th>
              <th className="py-3 px-4 text-left font-medium text-sm">Telefone</th>
              <th className="py-3 px-4 text-left font-medium text-sm">Empresa</th>
              <th className="py-3 px-4 text-left font-medium text-sm">Tipo</th>
              <th className="py-3 px-4 text-left font-medium text-sm">
                Última<br />Atividade
              </th>
              <th className="py-3 px-4 text-left font-medium text-sm">Proprietário</th>
              <th className="py-3 px-4 text-left font-medium text-sm">Tags</th>
              <th className="py-3 px-4 text-center font-medium text-sm">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.length > 0 ? (
              filteredContacts.map(contact => (
                <tr 
                  key={contact.id} 
                  className="border-b hover:bg-accent/10 cursor-pointer"
                  onClick={() => openContactDetail(contact.id)}
                >
                  <td className="py-3 px-4">
                    <Checkbox 
                      id={`contact-${contact.id}`}
                      checked={selectedContacts.includes(contact.id)}
                      onCheckedChange={() => toggleSelectContact(contact.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center bg-primary/10 rounded-full w-8 h-8 text-primary font-medium">
                        {contact.name.charAt(0)}
                      </div>
                      <div className="font-medium">{contact.name}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">{contact.email}</td>
                  <td className="py-3 px-4 text-sm">{contact.phone}</td>
                  <td className="py-3 px-4 text-sm">{contact.company}</td>
                  <td className="py-3 px-4">
                    <Badge 
                      variant="outline" 
                      className={
                        contact.type === "Cliente" 
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }
                    >
                      {contact.type}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {formatLastActivity(contact.lastActivity)}
                  </td>
                  <td className="py-3 px-4 text-sm">{contact.owner}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-2 px-4 text-right">
                    <div className="flex justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          openContactDetail(contact.id);
                        }}
                      >
                        Ver
                      </Button>
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditContact(contact);
                        }}
                      >
                        Editar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="py-12 text-center">
                  <p className="text-muted-foreground">Nenhum contato encontrado.</p>
                  {searchQuery && (
                    <Button 
                      variant="link" 
                      className="mt-1" 
                      onClick={() => setSearchQuery("")}
                    >
                      Limpar busca
                    </Button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Dialog para detalhes do contato */}
      <Dialog open={contactDetailOpen} onOpenChange={setContactDetailOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 h-[80vh] max-h-[700px] flex flex-col">
          {selectedContact && (
            <ContactDetail 
              contact={selectedContact} 
              onEdit={() => {
                handleCloseContactDetail();
                openEditContact(selectedContact);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para criar/editar contato */}
      <Dialog open={contactFormOpen} onOpenChange={setContactFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingContact ? "Editar Contato" : "Novo Contato"}</DialogTitle>
          </DialogHeader>
          <ContactForm 
            contact={editingContact} 
            onSave={handleSaveContact} 
            onCancel={handleCloseContactForm} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}