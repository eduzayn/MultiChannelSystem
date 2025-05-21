import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Building2, Edit, Trash2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

// Dados mockados para exemplo - em uma implementação real, isso viria da API
const mockTeams = [
  { 
    id: 1, 
    name: "Atendimento", 
    description: "Equipe de atendimento ao cliente", 
    membersCount: 8, 
    leader: "Maria Oliveira", 
    createdAt: "2023-01-15T10:00:00" 
  },
  { 
    id: 2, 
    name: "Vendas", 
    description: "Equipe de vendas e negociações", 
    membersCount: 12, 
    leader: "Carlos Mendes", 
    createdAt: "2023-02-20T14:30:00" 
  },
  { 
    id: 3, 
    name: "Suporte", 
    description: "Equipe de suporte técnico", 
    membersCount: 6, 
    leader: "Ana Pereira", 
    createdAt: "2023-03-10T09:15:00" 
  },
  { 
    id: 4, 
    name: "Marketing", 
    description: "Equipe de marketing e comunicação", 
    membersCount: 5, 
    leader: "Lucas Santos", 
    createdAt: "2023-04-05T11:45:00" 
  }
];

// Dados mockados de usuários para membros da equipe
const mockUsers = [
  { id: 1, name: "João Silva", email: "joao.silva@empresa.com", role: "Agente" },
  { id: 2, name: "Maria Oliveira", email: "maria.oliveira@empresa.com", role: "Supervisor" },
  { id: 3, name: "Carlos Santos", email: "carlos.santos@empresa.com", role: "Administrador" },
  { id: 4, name: "Ana Pereira", email: "ana.pereira@empresa.com", role: "Agente" },
  { id: 5, name: "Roberto Lima", email: "roberto.lima@empresa.com", role: "Agente" },
  { id: 6, name: "Carla Mendes", email: "carla.mendes@empresa.com", role: "Supervisor" }
];

export const TeamsTab = () => {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openManageMembersDialog, setOpenManageMembersDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTeam, setCurrentTeam] = useState<any>(null);
  const { toast } = useToast();

  // Filtrar equipes com base na busca
  const filteredTeams = mockTeams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.leader.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTeam = (formData: any) => {
    // Lógica para criar equipe
    toast({
      title: "Equipe criada",
      description: `A equipe ${formData.name} foi criada com sucesso.`,
    });
    setOpenCreateDialog(false);
  };

  const handleEditTeam = (formData: any) => {
    // Lógica para editar equipe
    toast({
      title: "Equipe atualizada",
      description: `A equipe ${formData.name} foi atualizada com sucesso.`,
    });
    setOpenEditDialog(false);
  };

  const handleManageMembers = (formData: any) => {
    // Lógica para gerenciar membros da equipe
    toast({
      title: "Membros atualizados",
      description: `Os membros da equipe ${currentTeam?.name} foram atualizados.`,
    });
    setOpenManageMembersDialog(false);
  };

  const openTeamEdit = (team: any) => {
    setCurrentTeam(team);
    setOpenEditDialog(true);
  };

  const openManageTeamMembers = (team: any) => {
    setCurrentTeam(team);
    setOpenManageMembersDialog(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-medium">Gerenciar Equipes</h3>
        <Button onClick={() => setOpenCreateDialog(true)}>
          <Building2 className="mr-2 h-4 w-4" />
          Criar Nova Equipe
        </Button>
      </div>

      <div className="flex mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome de equipe..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome da Equipe</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Nº de Membros</TableHead>
              <TableHead>Líder da Equipe</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeams.length > 0 ? filteredTeams.map((team) => (
              <TableRow key={team.id}>
                <TableCell>
                  <div className="font-medium">{team.name}</div>
                </TableCell>
                <TableCell>{team.description}</TableCell>
                <TableCell>{team.membersCount}</TableCell>
                <TableCell>{team.leader}</TableCell>
                <TableCell>{formatDate(team.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openTeamEdit(team)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openManageTeamMembers(team)}>
                      <UserPlus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  Nenhuma equipe encontrada com os filtros atuais.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Criação de Equipe */}
      <CreateTeamDialog 
        open={openCreateDialog} 
        onOpenChange={setOpenCreateDialog} 
        onSubmit={handleCreateTeam} 
      />

      {/* Modal de Edição de Equipe */}
      {currentTeam && (
        <EditTeamDialog 
          open={openEditDialog} 
          onOpenChange={setOpenEditDialog} 
          team={currentTeam} 
          onSubmit={handleEditTeam} 
        />
      )}

      {/* Modal de Gerenciamento de Membros */}
      {currentTeam && (
        <ManageMembersDialog 
          open={openManageMembersDialog} 
          onOpenChange={setOpenManageMembersDialog} 
          team={currentTeam} 
          onSubmit={handleManageMembers} 
        />
      )}
    </div>
  );
};

// Componente do Modal de Criação de Equipe
interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

const CreateTeamDialog: React.FC<CreateTeamDialogProps> = ({ open, onOpenChange, onSubmit }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [leader, setLeader] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  
  const handleSubmit = () => {
    onSubmit({
      name,
      description,
      leader,
      members: selectedMembers
    });
    // Limpar o formulário
    setName("");
    setDescription("");
    setLeader("");
    setSelectedMembers([]);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar nova equipe</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar uma nova equipe.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="team-name">Nome da Equipe</Label>
            <Input 
              id="team-name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Atendimento ao Cliente"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="team-description">Descrição</Label>
            <Textarea 
              id="team-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o propósito da equipe"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="team-leader">Líder da Equipe</Label>
            <Select value={leader} onValueChange={setLeader}>
              <SelectTrigger id="team-leader">
                <SelectValue placeholder="Selecione o líder da equipe" />
              </SelectTrigger>
              <SelectContent>
                {mockUsers.filter(user => user.role === "Supervisor" || user.role === "Administrador").map((user) => (
                  <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Membros Iniciais</Label>
            <p className="text-sm text-muted-foreground">
              Você poderá adicionar mais membros posteriormente.
            </p>
            {/* Aqui poderia ser um componente de multi-seleção mais complexo */}
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Adicionar membros" />
              </SelectTrigger>
              <SelectContent>
                {mockUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>Criar Equipe</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Componente do Modal de Edição de Equipe
interface EditTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: any;
  onSubmit: (data: any) => void;
}

const EditTeamDialog: React.FC<EditTeamDialogProps> = ({ open, onOpenChange, team, onSubmit }) => {
  const [teamData, setTeamData] = useState({
    name: team?.name || "",
    description: team?.description || "",
    leader: team?.leader || ""
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTeamData({ ...teamData, [name]: value });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setTeamData({ ...teamData, [name]: value });
  };
  
  const handleSubmit = () => {
    onSubmit(teamData);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar equipe</DialogTitle>
          <DialogDescription>
            Atualize os dados da equipe.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-team-name">Nome da Equipe</Label>
            <Input 
              id="edit-team-name" 
              name="name"
              value={teamData.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-team-description">Descrição</Label>
            <Textarea 
              id="edit-team-description" 
              name="description"
              value={teamData.description}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-team-leader">Líder da Equipe</Label>
            <Select value={teamData.leader} onValueChange={(value) => handleSelectChange("leader", value)}>
              <SelectTrigger id="edit-team-leader">
                <SelectValue placeholder="Selecione o líder da equipe" />
              </SelectTrigger>
              <SelectContent>
                {mockUsers.filter(user => user.role === "Supervisor" || user.role === "Administrador").map((user) => (
                  <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Componente do Modal de Gerenciamento de Membros
interface ManageMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: any;
  onSubmit: (data: any) => void;
}

const ManageMembersDialog: React.FC<ManageMembersDialogProps> = ({ open, onOpenChange, team, onSubmit }) => {
  // Em um app real, carregaríamos os membros atuais da equipe
  const [members, setMembers] = useState<number[]>([]);
  const [searchMember, setSearchMember] = useState("");
  
  // Filtrar usuários baseado na busca
  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchMember.toLowerCase()) ||
    user.email.toLowerCase().includes(searchMember.toLowerCase())
  );
  
  const isMember = (userId: number) => members.includes(userId);
  
  const toggleMember = (userId: number) => {
    if (isMember(userId)) {
      setMembers(members.filter(id => id !== userId));
    } else {
      setMembers([...members, userId]);
    }
  };
  
  const handleSubmit = () => {
    onSubmit({
      team: team.id,
      members
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Gerenciar membros da equipe {team.name}</DialogTitle>
          <DialogDescription>
            Adicione ou remova membros da equipe.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuários..."
                className="pl-8"
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
              />
            </div>
          </div>
          
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={isMember(user.id) ? "destructive" : "default"}
                        size="sm"
                        onClick={() => toggleMember(user.id)}
                      >
                        {isMember(user.id) ? "Remover" : "Adicionar"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};