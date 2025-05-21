import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  UserPlus, 
  Search, 
  MoreHorizontal,
  Edit, 
  UserMinus, 
  RefreshCw, 
  Key, 
  ClipboardList, 
  Trash2 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Dados mockados para exemplo - em uma implementação real, isso viria da API
const mockUsers = [
  { 
    id: 1, 
    name: "João Silva", 
    email: "joao.silva@empresa.com", 
    team: "Atendimento", 
    role: "Agente", 
    status: "active", 
    lastLogin: "2023-05-18T14:30:00"
  },
  { 
    id: 2, 
    name: "Maria Oliveira", 
    email: "maria.oliveira@empresa.com", 
    team: "Vendas", 
    role: "Supervisor", 
    status: "active", 
    lastLogin: "2023-05-19T09:15:00"
  },
  { 
    id: 3, 
    name: "Carlos Santos", 
    email: "carlos.santos@empresa.com", 
    team: "Suporte", 
    role: "Administrador", 
    status: "inactive", 
    lastLogin: "2023-05-10T11:45:00"
  },
  { 
    id: 4, 
    name: "Ana Pereira", 
    email: "ana.pereira@empresa.com", 
    team: "Marketing", 
    role: "Agente", 
    status: "pending", 
    lastLogin: null
  }
];

export const UsersTab = () => {
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  // Filtrar usuários com base nos filtros aplicados
  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesTeam = teamFilter === "all" || user.team === teamFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesTeam && matchesRole;
  });

  const handleInviteUser = (formData: any) => {
    // Lógica para convidar usuário
    toast({
      title: "Convite enviado",
      description: `Um convite foi enviado para ${formData.email}.`,
    });
    setOpenInviteDialog(false);
  };

  const handleEditUser = (formData: any) => {
    // Lógica para editar usuário
    toast({
      title: "Usuário atualizado",
      description: `O usuário ${formData.name} foi atualizado com sucesso.`,
    });
    setOpenEditDialog(false);
  };

  const handleSelectAllUsers = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: number) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const openUserEdit = (user: any) => {
    setCurrentUser(user);
    setOpenEditDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-green-500">Ativo</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pendente</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nunca";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-medium">Gerenciar Usuários</h3>
        <Button onClick={() => setOpenInviteDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Convidar Usuário
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por equipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as equipes</SelectItem>
              <SelectItem value="Atendimento">Atendimento</SelectItem>
              <SelectItem value="Vendas">Vendas</SelectItem>
              <SelectItem value="Suporte">Suporte</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por papel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os papéis</SelectItem>
              <SelectItem value="Administrador">Administrador</SelectItem>
              <SelectItem value="Supervisor">Supervisor</SelectItem>
              <SelectItem value="Agente">Agente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {selectedUsers.length > 0 && (
        <div className="bg-muted p-2 rounded-md mb-4 flex items-center justify-between">
          <span>{selectedUsers.length} usuário(s) selecionado(s)</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Ativar
            </Button>
            <Button variant="outline" size="sm">
              Desativar
            </Button>
            <Button variant="outline" size="sm">
              Adicionar à equipe
            </Button>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
              Excluir
            </Button>
          </div>
        </div>
      )}
      
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  onChange={(e: any) => handleSelectAllUsers(e)} 
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                />
              </TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Equipe</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Último Login</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedUsers.includes(user.id)} 
                    onCheckedChange={() => handleSelectUser(user.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="font-medium">{user.name}</div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.team}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{getStatusBadge(user.status)}</TableCell>
                <TableCell>{formatDate(user.lastLogin)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openUserEdit(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      {user.status === 'active' ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                    </Button>
                    {user.status === 'pending' && (
                      <Button variant="ghost" size="icon">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  Nenhum usuário encontrado com os filtros atuais.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Modal de Convite de Usuário */}
      <InviteUserDialog 
        open={openInviteDialog} 
        onOpenChange={setOpenInviteDialog} 
        onSubmit={handleInviteUser} 
      />
      
      {/* Modal de Edição de Usuário */}
      {currentUser && (
        <EditUserDialog 
          open={openEditDialog} 
          onOpenChange={setOpenEditDialog} 
          user={currentUser} 
          onSubmit={handleEditUser} 
        />
      )}
    </div>
  );
};

// Componente do Modal de Convite de Usuário
interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

const InviteUserDialog: React.FC<InviteUserDialogProps> = ({ open, onOpenChange, onSubmit }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [team, setTeam] = useState("");
  const [role, setRole] = useState("agent");
  const [sendInvite, setSendInvite] = useState(true);
  
  const handleSubmit = () => {
    onSubmit({
      firstName,
      lastName,
      email,
      team,
      role,
      sendInvite
    });
    // Limpar o formulário
    setFirstName("");
    setLastName("");
    setEmail("");
    setTeam("");
    setRole("agent");
    setSendInvite(true);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convidar novo usuário</DialogTitle>
          <DialogDescription>
            Preencha os dados para adicionar um novo usuário à plataforma.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">Nome</Label>
              <Input 
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Nome"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Sobrenome</Label>
              <Input 
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Sobrenome"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="team">Equipe</Label>
            <Select value={team} onValueChange={setTeam}>
              <SelectTrigger id="team">
                <SelectValue placeholder="Selecione uma equipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Atendimento">Atendimento</SelectItem>
                <SelectItem value="Vendas">Vendas</SelectItem>
                <SelectItem value="Suporte">Suporte</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Papel</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Selecione um papel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agent">Agente</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="sendInvite" 
              checked={sendInvite} 
              onCheckedChange={(checked) => setSendInvite(checked as boolean)}
            />
            <Label htmlFor="sendInvite" className="text-sm">
              Enviar email de convite para o usuário
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>Convidar Usuário</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Componente do Modal de Edição de Usuário
interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  onSubmit: (data: any) => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({ open, onOpenChange, user, onSubmit }) => {
  const [userData, setUserData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    team: user?.team || "",
    role: user?.role || "",
    status: user?.status || "active"
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setUserData({ ...userData, [name]: value });
  };
  
  const handleSubmit = () => {
    onSubmit(userData);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar usuário</DialogTitle>
          <DialogDescription>
            Atualize os dados do usuário.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Nome Completo</Label>
            <Input 
              id="edit-name" 
              name="name"
              value={userData.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input 
              id="edit-email" 
              name="email"
              type="email"
              value={userData.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-team">Equipe</Label>
            <Select value={userData.team} onValueChange={(value) => handleSelectChange("team", value)}>
              <SelectTrigger id="edit-team">
                <SelectValue placeholder="Selecione uma equipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Atendimento">Atendimento</SelectItem>
                <SelectItem value="Vendas">Vendas</SelectItem>
                <SelectItem value="Suporte">Suporte</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-role">Papel</Label>
            <Select value={userData.role} onValueChange={(value) => handleSelectChange("role", value)}>
              <SelectTrigger id="edit-role">
                <SelectValue placeholder="Selecione um papel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Agente">Agente</SelectItem>
                <SelectItem value="Supervisor">Supervisor</SelectItem>
                <SelectItem value="Administrador">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select value={userData.status} onValueChange={(value) => handleSelectChange("status", value)}>
              <SelectTrigger id="edit-status">
                <SelectValue placeholder="Selecione um status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="w-full">
              <Key className="mr-2 h-4 w-4" />
              Redefinir Senha
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <ClipboardList className="mr-2 h-4 w-4" />
              Ver Atividade
            </Button>
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