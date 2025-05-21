import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Plus, Search, Edit, Copy, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Dados mockados para exemplo
const mockRoles = [
  {
    id: 1,
    name: "Administrador do Tenant",
    description: "Acesso completo a todas as funcionalidades da plataforma",
    type: "system",
    usersCount: 5
  },
  {
    id: 2,
    name: "Supervisor de Equipe",
    description: "Gerencia equipes, monitora desempenho e tem acesso a relatórios",
    type: "system",
    usersCount: 8
  },
  {
    id: 3,
    name: "Agente",
    description: "Atende conversas, gerencia contatos e registra atividades",
    type: "system",
    usersCount: 24
  },
  {
    id: 4,
    name: "Agente Júnior",
    description: "Acesso limitado a conversas e contatos, sem permissão para excluir registros",
    type: "custom",
    usersCount: 12
  },
  {
    id: 5,
    name: "Analista de Marketing",
    description: "Focado em campanhas de marketing e automações",
    type: "custom",
    usersCount: 3
  }
];

// Módulos e permissões mockados para exemplo
const mockPermissionModules = [
  {
    id: "inbox",
    name: "Caixa de Entrada",
    permissions: [
      { id: "inbox_view", name: "Visualizar conversas", options: ["none", "own", "team", "all"] },
      { id: "inbox_reply", name: "Responder conversas", options: ["none", "own", "team", "all"] },
      { id: "inbox_transfer", name: "Transferir conversas", options: ["yes", "no"] },
      { id: "inbox_close", name: "Encerrar conversas", options: ["none", "own", "team", "all"] }
    ]
  },
  {
    id: "contacts",
    name: "Contatos",
    permissions: [
      { id: "contacts_view", name: "Visualizar contatos", options: ["none", "own", "team", "all"] },
      { id: "contacts_create", name: "Criar contatos", options: ["yes", "no"] },
      { id: "contacts_edit", name: "Editar contatos", options: ["none", "own", "team", "all"] },
      { id: "contacts_delete", name: "Excluir contatos", options: ["none", "own", "team", "all"] }
    ]
  },
  {
    id: "deals",
    name: "Negócios",
    permissions: [
      { id: "deals_view", name: "Visualizar negócios", options: ["none", "own", "team", "all"] },
      { id: "deals_create", name: "Criar negócios", options: ["yes", "no"] },
      { id: "deals_edit", name: "Editar negócios", options: ["none", "own", "team", "all"] },
      { id: "deals_delete", name: "Excluir negócios", options: ["none", "own", "team", "all"] }
    ]
  },
  {
    id: "reports",
    name: "Relatórios",
    permissions: [
      { id: "reports_view", name: "Visualizar relatórios", options: ["none", "team", "all"] },
      { id: "reports_export", name: "Exportar relatórios", options: ["yes", "no"] }
    ]
  },
  {
    id: "settings",
    name: "Configurações",
    permissions: [
      { id: "settings_view", name: "Visualizar configurações", options: ["yes", "no"] },
      { id: "settings_edit", name: "Editar configurações", options: ["yes", "no"] }
    ]
  }
];

export const RolesTab = () => {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentRole, setCurrentRole] = useState<any>(null);
  const { toast } = useToast();

  // Filtrar papéis com base na busca
  const filteredRoles = mockRoles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateRole = (formData: any) => {
    toast({
      title: "Papel criado",
      description: `O papel ${formData.name} foi criado com sucesso.`,
    });
    setOpenCreateDialog(false);
  };

  const handleEditRole = (formData: any) => {
    toast({
      title: "Papel atualizado",
      description: `O papel ${formData.name} foi atualizado com sucesso.`,
    });
    setOpenEditDialog(false);
  };

  const handleCloneRole = (role: any) => {
    setCurrentRole({
      ...role,
      name: `Cópia de ${role.name}`,
      type: "custom"
    });
    setOpenCreateDialog(true);
    toast({
      description: `As configurações de ${role.name} foram copiadas. Personalize o novo papel.`,
    });
  };

  const openRoleEdit = (role: any) => {
    setCurrentRole(role);
    setOpenEditDialog(true);
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-medium">Gerenciar Papéis e Permissões</h3>
        <Button onClick={() => {
          setCurrentRole(null);
          setOpenCreateDialog(true);
        }}>
          <Shield className="mr-2 h-4 w-4" />
          <Plus className="mr-1 h-3 w-3" />
          Criar Novo Papel
        </Button>
      </div>

      <Alert className="mb-4">
        <AlertDescription>
          Configure papéis personalizados para definir exatamente o que cada usuário pode acessar e modificar na plataforma.
          Os papéis do sistema (Administrador, Supervisor, Agente) possuem permissões padrão que não podem ser completamente alteradas.
        </AlertDescription>
      </Alert>

      <div className="flex mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar papel..."
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
              <TableHead>Nome do Papel</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Nº de Usuários</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoles.length > 0 ? filteredRoles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>
                  <div className="font-medium">{role.name}</div>
                </TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>
                  {role.type === "system" ? 
                    "Sistema (Padrão)" : 
                    "Personalizado"}
                </TableCell>
                <TableCell>{role.usersCount}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => openRoleEdit(role)}
                      disabled={role.type === "system"}
                      title={role.type === "system" ? "Papéis do sistema não podem ser editados completamente" : "Editar papel"}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleCloneRole(role)}
                      title="Clonar este papel para criar um novo"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    {role.type !== "system" && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        title="Excluir papel"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  Nenhum papel encontrado com os filtros atuais.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Criação de Papel */}
      <RoleFormDialog 
        open={openCreateDialog} 
        onOpenChange={setOpenCreateDialog} 
        role={currentRole}
        onSubmit={handleCreateRole}
        mode="create"
      />

      {/* Modal de Edição de Papel */}
      {currentRole && (
        <RoleFormDialog 
          open={openEditDialog} 
          onOpenChange={setOpenEditDialog} 
          role={currentRole}
          onSubmit={handleEditRole}
          mode="edit"
        />
      )}
    </div>
  );
};

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: any | null;
  onSubmit: (data: any) => void;
  mode: 'create' | 'edit';
}

const RoleFormDialog: React.FC<RoleFormDialogProps> = ({ 
  open, 
  onOpenChange, 
  role, 
  onSubmit,
  mode
}) => {
  const isSystem = role?.type === 'system';
  const isCreate = mode === 'create';
  
  // Inicializar com dados do papel ou valores padrão
  const [name, setName] = useState(role?.name || '');
  const [description, setDescription] = useState(role?.description || '');

  // Estado para as permissões - em um app real seria mais complexo
  const [permissions, setPermissions] = useState<Record<string, string>>({});
  
  const handleSubmit = () => {
    onSubmit({
      name,
      description,
      permissions
    });
    
    // Limpar formulário
    if (isCreate) {
      setName('');
      setDescription('');
      setPermissions({});
    }
  };
  
  // Atualizar form quando o papel mudar
  React.useEffect(() => {
    if (role) {
      setName(role.name || '');
      setDescription(role.description || '');
      // Em um app real, carregaríamos permissões do papel aqui
    } else {
      setName('');
      setDescription('');
      setPermissions({});
    }
  }, [role]);
  
  const handlePermissionChange = (permissionId: string, value: string) => {
    setPermissions({
      ...permissions,
      [permissionId]: value
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isCreate ? 'Criar novo papel' : `Editar papel: ${role?.name}`}
          </DialogTitle>
          <DialogDescription>
            {isSystem 
              ? 'Este é um papel do sistema. Algumas permissões básicas não podem ser alteradas.'
              : 'Defina as permissões específicas para este papel.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="role-name">Nome do Papel</Label>
            <Input 
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Agente de Vendas"
              disabled={isSystem}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="role-description">Descrição</Label>
            <Textarea 
              id="role-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o propósito deste papel"
              disabled={isSystem}
            />
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium mb-2">Matriz de Permissões</h4>
            
            <Accordion type="single" collapsible className="w-full">
              {mockPermissionModules.map((module) => (
                <AccordionItem key={module.id} value={module.id}>
                  <AccordionTrigger>{module.name}</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      {module.permissions.map((permission) => (
                        <div key={permission.id} className="grid gap-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`permission-${permission.id}`} className="text-sm">
                              {permission.name}
                            </Label>
                            <select
                              id={`permission-${permission.id}`}
                              className="border rounded px-2 py-1 text-sm"
                              value={permissions[permission.id] || ''}
                              onChange={(e) => handlePermissionChange(permission.id, e.target.value)}
                              disabled={isSystem && ['inbox_view', 'contacts_view', 'settings_view'].includes(permission.id)}
                            >
                              {permission.options.map((option) => (
                                <option key={option} value={option}>
                                  {option === 'none' && 'Sem acesso'}
                                  {option === 'own' && 'Apenas próprios'}
                                  {option === 'team' && 'Equipe'}
                                  {option === 'all' && 'Todos'}
                                  {option === 'yes' && 'Sim'}
                                  {option === 'no' && 'Não'}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            {isCreate ? 'Criar Papel' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};