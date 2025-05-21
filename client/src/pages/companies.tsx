import { useState, useEffect } from "react";
import {
  Building2,
  Search,
  Filter,
  PlusCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CompanyForm } from "@/modules/Companies/components/CompanyForm";
import { CompanyDetail } from "@/modules/Companies/components/CompanyDetail";

// Mock data for companies
const mockCompanies = [
  {
    id: '1',
    name: 'Tech Inovations',
    website: 'https://techinovations.com',
    phone: '+55 11 9999-8888',
    industry: 'Tecnologia',
    owner: 'João Silva',
    contactsCount: 5,
    dealsCount: 3,
    dealsValue: 75000,
    lastActivity: '2023-05-15',
    status: 'Cliente Ativo',
    city: 'São Paulo',
    state: 'SP',
    logo: 'https://via.placeholder.com/40',
  },
  {
    id: '2',
    name: 'Manufatura Brasil',
    website: 'https://manufaturabrasil.com.br',
    phone: '+55 11 7777-6666',
    industry: 'Manufatura',
    owner: 'Maria Souza',
    contactsCount: 8,
    dealsCount: 2,
    dealsValue: 120000,
    lastActivity: '2023-05-10',
    status: 'Prospect',
    city: 'Joinville',
    state: 'SC',
    logo: 'https://via.placeholder.com/40',
  },
  {
    id: '3',
    name: 'Varejo Futuro',
    website: 'https://varejofuturo.com.br',
    phone: '+55 21 5555-4444',
    industry: 'Varejo',
    owner: 'Carlos Mendes',
    contactsCount: 3,
    dealsCount: 1,
    dealsValue: 45000,
    lastActivity: '2023-05-05',
    status: 'Lead Qualificado',
    city: 'Rio de Janeiro',
    state: 'RJ',
    logo: 'https://via.placeholder.com/40',
  },
  {
    id: '4',
    name: 'Financeiro Global',
    website: 'https://financeiroglobal.com',
    phone: '+55 11 3333-2222',
    industry: 'Serviços Financeiros',
    owner: 'Ana Costa',
    contactsCount: 7,
    dealsCount: 4,
    dealsValue: 250000,
    lastActivity: '2023-05-02',
    status: 'Cliente Ativo',
    city: 'São Paulo',
    state: 'SP',
    logo: 'https://via.placeholder.com/40',
  },
  {
    id: '5',
    name: 'Saúde Integral',
    website: 'https://saudeintegral.com.br',
    phone: '+55 41 2222-1111',
    industry: 'Saúde',
    owner: 'Roberto Alves',
    contactsCount: 4,
    dealsCount: 0,
    dealsValue: 0,
    lastActivity: '2023-04-28',
    status: 'Prospect',
    city: 'Curitiba',
    state: 'PR',
    logo: 'https://via.placeholder.com/40',
  }
];

// Status options for filtering
const statusOptions = [
  'Todos',
  'Prospect',
  'Lead Qualificado',
  'Cliente Ativo',
  'Ex-Cliente',
  'Parceiro Estratégico'
];

// Industry options for filtering
const industryOptions = [
  'Todos',
  'Tecnologia',
  'Manufatura',
  'Varejo',
  'Serviços Financeiros',
  'Saúde',
  'Construção',
  'Educação'
];

export default function Companies() {
  // State for companies data and UI state
  const [companies, setCompanies] = useState(mockCompanies);
  const [filteredCompanies, setFilteredCompanies] = useState(mockCompanies);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Todos");
  const [selectedIndustry, setSelectedIndustry] = useState("Todos");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [isNewCompanyDialogOpen, setIsNewCompanyDialogOpen] = useState(false);
  const [isEditCompanyDialogOpen, setIsEditCompanyDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDetailOpen, setIsViewDetailOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const { toast } = useToast();

  // Filter companies based on search and filters
  useEffect(() => {
    let result = [...companies];
    
    if (searchTerm) {
      result = result.filter(company => 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        company.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedStatus !== "Todos") {
      result = result.filter(company => company.status === selectedStatus);
    }
    
    if (selectedIndustry !== "Todos") {
      result = result.filter(company => company.industry === selectedIndustry);
    }
    
    setFilteredCompanies(result);
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedIndustry, companies]);

  // Handle company actions (view, edit, delete)
  const handleViewCompany = (company: any) => {
    setSelectedCompany(company);
    setIsViewDetailOpen(true);
  };

  const handleEditCompany = (company: any) => {
    setSelectedCompany(company);
    setIsEditCompanyDialogOpen(true);
  };

  const handleDeleteConfirmation = (company: any) => {
    setSelectedCompany(company);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCompany = () => {
    const updatedCompanies = companies.filter(c => c.id !== selectedCompany.id);
    setCompanies(updatedCompanies);
    setIsDeleteDialogOpen(false);
    
    toast({
      title: "Empresa excluída",
      description: `${selectedCompany.name} foi removida com sucesso.`,
    });
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCompanies.slice(indexOfFirstItem, indexOfLastItem);
  
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

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

  // Handle save company (create/edit)
  const handleSaveCompany = (companyData: any) => {
    if (selectedCompany) {
      // Edit company
      const updatedCompanies = companies.map(company => 
        company.id === selectedCompany.id ? { ...company, ...companyData } : company
      );
      setCompanies(updatedCompanies);
      
      toast({
        title: "Empresa atualizada",
        description: `${companyData.name} foi atualizada com sucesso.`
      });
      
      setIsEditCompanyDialogOpen(false);
    } else {
      // Create new company
      const newCompany = {
        id: String(companies.length + 1),
        ...companyData,
        contactsCount: 0,
        dealsCount: 0,
        dealsValue: 0,
        lastActivity: new Date().toISOString().split('T')[0]
      };
      
      setCompanies([...companies, newCompany]);
      
      toast({
        title: "Empresa criada",
        description: `${companyData.name} foi criada com sucesso.`
      });
      
      setIsNewCompanyDialogOpen(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Empresas</h1>
          <p className="text-muted-foreground">
            Gerencie as contas corporativas da sua organização
          </p>
        </div>
        <Button onClick={() => setIsNewCompanyDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Empresa
        </Button>
      </div>
      
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar empresas..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className="sm:w-auto w-full"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </Button>
      </div>
      
      {/* Filter options */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-md bg-muted/10">
          <div>
            <label className="text-sm font-medium mb-1 block">Status</label>
            <select 
              className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statusOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Setor</label>
            <select 
              className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
            >
              {industryOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 flex items-end">
            <Button 
              variant="ghost" 
              onClick={() => {
                setSearchTerm("");
                setSelectedStatus("Todos");
                setSelectedIndustry("Todos");
              }}
              className="text-sm"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      )}
      
      {/* Companies Table */}
      <div className="border rounded-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="text-left py-3 px-4 font-medium text-sm">Empresa</th>
              <th className="text-left py-3 px-4 font-medium text-sm">Setor</th>
              <th className="text-left py-3 px-4 font-medium text-sm">Contatos</th>
              <th className="text-left py-3 px-4 font-medium text-sm">Negócios</th>
              <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
              <th className="text-left py-3 px-4 font-medium text-sm">Proprietário</th>
              <th className="text-left py-3 px-4 font-medium text-sm">Última Atividade</th>
              <th className="text-center py-3 px-4 font-medium text-sm">Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((company) => (
                <tr key={company.id} className="border-b hover:bg-muted/20">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 mr-3 rounded-md bg-primary/10 flex items-center justify-center font-medium text-primary">
                        {company.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{company.name}</div>
                        <div className="text-xs text-muted-foreground">{company.website}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">{company.industry}</td>
                  <td className="py-3 px-4 text-sm">{company.contactsCount}</td>
                  <td className="py-3 px-4">
                    <div className="text-sm">{company.dealsCount}</div>
                    {company.dealsValue > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(company.dealsValue)}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Badge 
                      variant="outline" 
                      className={getStatusBadgeColor(company.status)}
                    >
                      {company.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm">{company.owner}</td>
                  <td className="py-3 px-4 text-sm">{formatDate(company.lastActivity)}</td>
                  <td className="py-3 px-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewCompany(company)}>
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditCompany(company)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteConfirmation(company)}
                          className="text-destructive focus:text-destructive"
                        >
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-6 text-center text-muted-foreground">
                  Nenhuma empresa encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {filteredCompanies.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredCompanies.length)} de {filteredCompanies.length}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm">
              Página {currentPage} de {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* New Company Dialog */}
      <Dialog open={isNewCompanyDialogOpen} onOpenChange={setIsNewCompanyDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nova Empresa</DialogTitle>
          </DialogHeader>
          <CompanyForm 
            onSave={handleSaveCompany}
            onCancel={() => setIsNewCompanyDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Company Dialog */}
      <Dialog open={isEditCompanyDialogOpen} onOpenChange={setIsEditCompanyDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Empresa</DialogTitle>
          </DialogHeader>
          <CompanyForm 
            company={selectedCompany}
            onSave={handleSaveCompany}
            onCancel={() => setIsEditCompanyDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Tem certeza que deseja excluir a empresa <strong>{selectedCompany?.name}</strong>?
              Esta ação não pode ser desfeita.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCompany}
            >
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Company Detail Dialog */}
      <Dialog open={isViewDetailOpen} onOpenChange={setIsViewDetailOpen} >
        <DialogContent className="sm:max-w-[900px] p-0 h-[80vh]">
          {selectedCompany && (
            <CompanyDetail 
              company={selectedCompany} 
              onEdit={() => {
                setIsViewDetailOpen(false);
                handleEditCompany(selectedCompany);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}