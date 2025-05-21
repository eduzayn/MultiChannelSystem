import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Globe,
  Phone,
  Mail,
  MapPin,
  Tag,
  User,
  Calendar,
  Edit,
  ArrowUpRight,
} from "lucide-react";

// Mock contacts for company details
const mockContacts = [
  {
    id: '1',
    name: 'Amanda Silva',
    title: 'CEO',
    email: 'amanda@techinovations.com',
    phone: '+55 11 99876-5432',
    role: 'Decisor',
  },
  {
    id: '2',
    name: 'Rafael Gomes',
    title: 'CFO',
    email: 'rafael@techinovations.com',
    phone: '+55 11 98765-4321',
    role: 'Influenciador',
  },
  {
    id: '3',
    name: 'Carla Mendonça',
    title: 'CTO',
    email: 'carla@techinovations.com',
    phone: '+55 11 97654-3210',
    role: 'Usuário Chave',
  }
];

// Mock deals for company details
const mockDeals = [
  {
    id: '1',
    name: 'Implementação Sistema ERP',
    value: 50000,
    stage: 'Proposta',
    expectedCloseDate: '2023-06-15',
    owner: 'João Silva',
    status: 'Aberto',
  },
  {
    id: '2',
    name: 'Upgrade Infraestrutura',
    value: 25000,
    stage: 'Negociação',
    expectedCloseDate: '2023-07-01',
    owner: 'Maria Souza',
    status: 'Aberto',
  }
];

// Mock activities for company details
const mockActivities = [
  {
    id: '1',
    type: 'email',
    title: 'Email enviado: Proposta Comercial',
    date: '2023-05-14T14:30:00',
    user: 'João Silva',
    contact: 'Amanda Silva',
    content: 'Enviada proposta de implementação do sistema ERP.'
  },
  {
    id: '2',
    type: 'call',
    title: 'Ligação: Follow-up da proposta',
    date: '2023-05-12T10:15:00',
    user: 'João Silva',
    contact: 'Rafael Gomes',
    content: 'Discutidos detalhes de implementação e cronograma.'
  },
  {
    id: '3',
    type: 'meeting',
    title: 'Reunião: Apresentação técnica',
    date: '2023-05-05T09:00:00',
    user: 'Carla Mendonça',
    contact: 'Maria Souza',
    content: 'Apresentados aspectos técnicos e requisitos de infraestrutura.'
  }
];

interface CompanyDetailProps {
  company: any;
  onEdit: () => void;
}

export function CompanyDetail({ company, onEdit }: CompanyDetailProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  // Format datetime
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Cliente Ativo':
        return "bg-green-100 text-green-800 border-green-200";
      case 'Prospect':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'Lead Qualificado':
        return "bg-purple-100 text-purple-800 border-purple-200";
      case 'Ex-Cliente':
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-start p-6 border-b">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-md flex items-center justify-center bg-primary/10 text-primary font-medium text-lg mr-4">
            {company.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{company.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant="outline" 
                className={getStatusBadgeColor(company.status)}
              >
                {company.status}
              </Badge>
              <span className="text-sm text-muted-foreground">{company.industry}</span>
            </div>
          </div>
        </div>
        <Button onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b px-6">
          <TabsList className="bg-transparent border-b-0 h-auto p-0">
            <TabsTrigger
              value="overview"
              className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
            >
              Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="contacts"
              className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
            >
              Contatos
            </TabsTrigger>
            <TabsTrigger
              value="deals"
              className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
            >
              Negócios
            </TabsTrigger>
            <TabsTrigger
              value="activities"
              className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
            >
              Atividades
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {/* Overview Tab */}
          <TabsContent value="overview" className="h-full mt-0">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Informações básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informações básicas</h3>
                
                <div className="space-y-3">
                  {company.website && (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center"
                      >
                        {company.website}
                        <ArrowUpRight className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  )}
                  
                  {company.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{company.phone}</span>
                    </div>
                  )}
                  
                  {company.city && company.state && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        {company.address && `${company.address}, `}
                        {company.city}, {company.state}
                      </span>
                    </div>
                  )}
                  
                  {company.owner && (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Proprietário: {company.owner}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Última atividade: {formatDate(company.lastActivity)}</span>
                  </div>
                </div>
              </div>
              
              {/* Estatísticas e Tags */}
              <div className="space-y-6">
                {/* Estatísticas */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Estatísticas</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-md">
                      <div className="text-sm text-muted-foreground">Contatos</div>
                      <div className="text-2xl font-semibold">{company.contactsCount}</div>
                    </div>
                    <div className="p-4 border rounded-md">
                      <div className="text-sm text-muted-foreground">Negócios</div>
                      <div className="flex flex-col">
                        <span className="text-2xl font-semibold">{company.dealsCount}</span>
                        {company.dealsValue > 0 && (
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(company.dealsValue)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Tags */}
                {company.tags && company.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {company.tags.map((tag: string, index: number) => (
                        <div key={index} className="flex items-center bg-muted px-2 py-1 rounded-md">
                          <Tag className="h-3 w-3 mr-1" />
                          <span className="text-sm">{tag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Descrição */}
                {company.description && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Descrição</h3>
                    <p className="text-sm">{company.description}</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="h-full mt-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Contatos</h3>
              <Button variant="outline" size="sm">
                Adicionar Contato
              </Button>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left py-3 px-4 font-medium text-sm">Nome</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Cargo</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Telefone</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Função</th>
                  </tr>
                </thead>
                <tbody>
                  {mockContacts.map(contact => (
                    <tr key={contact.id} className="border-b hover:bg-muted/20">
                      <td className="py-3 px-4">
                        <div className="font-medium">{contact.name}</div>
                      </td>
                      <td className="py-3 px-4 text-sm">{contact.title}</td>
                      <td className="py-3 px-4 text-sm">{contact.email}</td>
                      <td className="py-3 px-4 text-sm">{contact.phone}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{contact.role}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Deals Tab */}
          <TabsContent value="deals" className="h-full mt-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Negócios</h3>
              <Button variant="outline" size="sm">
                Adicionar Negócio
              </Button>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left py-3 px-4 font-medium text-sm">Nome</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Valor</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Estágio</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Data Prevista</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Proprietário</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockDeals.map(deal => (
                    <tr key={deal.id} className="border-b hover:bg-muted/20">
                      <td className="py-3 px-4">
                        <div className="font-medium">{deal.name}</div>
                      </td>
                      <td className="py-3 px-4 text-sm">{formatCurrency(deal.value)}</td>
                      <td className="py-3 px-4 text-sm">{deal.stage}</td>
                      <td className="py-3 px-4 text-sm">{formatDate(deal.expectedCloseDate)}</td>
                      <td className="py-3 px-4 text-sm">{deal.owner}</td>
                      <td className="py-3 px-4">
                        <Badge variant={deal.status === "Aberto" ? "default" : "secondary"}>
                          {deal.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="h-full mt-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Atividades</h3>
              <Button variant="outline" size="sm">
                Registrar Atividade
              </Button>
            </div>
            
            <div className="space-y-4">
              {mockActivities.map(activity => (
                <div key={activity.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{activity.title}</h4>
                    <span className="text-xs text-muted-foreground">{formatDateTime(activity.date)}</span>
                  </div>
                  <div className="text-sm mb-2">{activity.content}</div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <div>Usuário: {activity.user}</div>
                    <div>Contato: {activity.contact}</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}