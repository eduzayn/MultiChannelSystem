import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, ChevronDown, ChevronUp, Pencil, Plus, Trash2, Users } from "lucide-react";

// Mock data for demonstration
const mockAssignmentRules = [
  { 
    id: 1, 
    name: "Leads de SP para Equipe Sudeste", 
    order: 1, 
    criteria: "Estado é São Paulo", 
    entityType: "leads",
    assignTo: "team",
    assignValue: "Equipe Sudeste",
    distributionMethod: "roundRobin",
    status: "active" 
  },
  { 
    id: 2, 
    name: "Negócios >R$50k para Vendedores Sênior", 
    order: 2, 
    criteria: "Valor Estimado > R$50.000", 
    entityType: "deals",
    assignTo: "team",
    assignValue: "Vendedores Sênior",
    distributionMethod: "leastWorkload",
    status: "active" 
  },
  { 
    id: 3, 
    name: "Mensagens WhatsApp para João Silva", 
    order: 3, 
    criteria: "Canal é WhatsApp", 
    entityType: "conversations",
    assignTo: "user",
    assignValue: "João Silva",
    status: "active" 
  },
  { 
    id: 4, 
    name: "Leads de clientes existentes para Maria Oliveira", 
    order: 4, 
    criteria: "Tipo de Lead é Cliente Existente", 
    entityType: "leads",
    assignTo: "user",
    assignValue: "Maria Oliveira",
    status: "inactive" 
  },
];

export const AssignmentRulesTab = () => {
  const [selectedEntity, setSelectedEntity] = useState<string>("leads");
  const [isCreateRuleDialogOpen, setIsCreateRuleDialogOpen] = useState(false);
  const [isEditRuleDialogOpen, setIsEditRuleDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);

  // Filter rules based on selected entity type
  const filteredRules = mockAssignmentRules.filter(rule => rule.entityType === selectedEntity);

  const handleEditRule = (rule: any) => {
    setEditingRule(rule);
    setIsEditRuleDialogOpen(true);
  };

  const handleSaveRule = () => {
    // Save logic would go here
    setIsCreateRuleDialogOpen(false);
    setIsEditRuleDialogOpen(false);
    setEditingRule(null);
  };

  const handleMoveRule = (rule: any, direction: 'up' | 'down') => {
    // Logic to reorder rules would go here
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Regras de Atribuição Automática</h2>
          <p className="text-muted-foreground">
            Automatize a distribuição de leads, negócios ou conversas
          </p>
        </div>
        <Button onClick={() => setIsCreateRuleDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nova Regra
        </Button>
      </div>

      <div className="border-b">
        <div className="flex space-x-6">
          <button
            onClick={() => setSelectedEntity("leads")}
            className={`py-2 border-b-2 font-medium transition-colors ${
              selectedEntity === "leads"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Regras para Leads/Contatos
          </button>
          <button
            onClick={() => setSelectedEntity("deals")}
            className={`py-2 border-b-2 font-medium transition-colors ${
              selectedEntity === "deals"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Regras para Negócios
          </button>
          <button
            onClick={() => setSelectedEntity("conversations")}
            className={`py-2 border-b-2 font-medium transition-colors ${
              selectedEntity === "conversations"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Regras para Conversas
          </button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Ordem</TableHead>
              <TableHead>Nome da Regra</TableHead>
              <TableHead>Critérios</TableHead>
              <TableHead>Atribuir Para</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[120px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRules.length > 0 ? (
              filteredRules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        disabled={rule.order === 1}
                        onClick={() => handleMoveRule(rule, 'up')}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <span className="text-center">{rule.order}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        disabled={rule.order === filteredRules.length}
                        onClick={() => handleMoveRule(rule, 'down')}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>{rule.criteria}</TableCell>
                  <TableCell>
                    {rule.assignTo === "user" ? (
                      <span>Usuário: {rule.assignValue}</span>
                    ) : (
                      <span>
                        Equipe: {rule.assignValue}
                        {rule.distributionMethod && (
                          <span className="block text-xs text-muted-foreground">
                            {rule.distributionMethod === "roundRobin" && "Distribuição: Round Robin"}
                            {rule.distributionMethod === "leastWorkload" && "Distribuição: Menor Carga"}
                          </span>
                        )}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      rule.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {rule.status === "active" ? "Ativo" : "Inativo"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditRule(rule)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  Não há regras de atribuição definidas para {
                    selectedEntity === "leads" ? "Leads/Contatos" :
                    selectedEntity === "deals" ? "Negócios" : "Conversas"
                  }.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Assignment Rule Dialog */}
      <Dialog open={isCreateRuleDialogOpen} onOpenChange={setIsCreateRuleDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Criar Nova Regra de Atribuição</DialogTitle>
            <DialogDescription>
              Defina critérios para atribuir automaticamente {
                selectedEntity === "leads" ? "leads/contatos" :
                selectedEntity === "deals" ? "negócios" : "conversas"
              } para usuários ou equipes.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ruleName" className="text-right">
                Nome
              </Label>
              <Input 
                id="ruleName" 
                placeholder="Ex: Leads de SP para Equipe Sudeste" 
                className="col-span-3" 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ruleEntity" className="text-right">
                Aplicar para
              </Label>
              <Select defaultValue={selectedEntity}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o tipo de entidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leads">Leads/Contatos</SelectItem>
                  <SelectItem value="deals">Negócios</SelectItem>
                  <SelectItem value="conversations">Conversas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium mb-2">Condições (SE...)</div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ruleProperty" className="text-right">
                  Propriedade
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione a propriedade" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedEntity === "leads" && (
                      <>
                        <SelectItem value="state">Estado</SelectItem>
                        <SelectItem value="leadSource">Origem do Lead</SelectItem>
                        <SelectItem value="leadType">Tipo de Lead</SelectItem>
                      </>
                    )}
                    {selectedEntity === "deals" && (
                      <>
                        <SelectItem value="estimatedValue">Valor Estimado</SelectItem>
                        <SelectItem value="dealType">Tipo de Negócio</SelectItem>
                        <SelectItem value="closingProbability">Probabilidade de Fechamento</SelectItem>
                      </>
                    )}
                    {selectedEntity === "conversations" && (
                      <>
                        <SelectItem value="channel">Canal</SelectItem>
                        <SelectItem value="initialMessage">Mensagem Inicial</SelectItem>
                        <SelectItem value="contactTag">Tag do Contato</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ruleOperator" className="text-right">
                  Operador
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione o operador" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Igual a</SelectItem>
                    <SelectItem value="notEquals">Diferente de</SelectItem>
                    <SelectItem value="contains">Contém</SelectItem>
                    <SelectItem value="notContains">Não Contém</SelectItem>
                    <SelectItem value="greaterThan">Maior que</SelectItem>
                    <SelectItem value="lessThan">Menor que</SelectItem>
                    <SelectItem value="in">Está em</SelectItem>
                    <SelectItem value="notIn">Não está em</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ruleValue" className="text-right">
                  Valor
                </Label>
                <Input 
                  id="ruleValue" 
                  placeholder="Ex: São Paulo" 
                  className="col-span-3" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium mb-2">Atribuição (ENTÃO...)</div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ruleAssignTo" className="text-right">
                  Atribuir para
                </Label>
                <Select defaultValue="user">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione o tipo de atribuição" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário Específico</SelectItem>
                    <SelectItem value="team">Equipe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ruleAssignValue" className="text-right">
                  Usuário/Equipe
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione o usuário ou equipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user1">João Silva</SelectItem>
                    <SelectItem value="user2">Maria Oliveira</SelectItem>
                    <SelectItem value="team1">Equipe Sudeste</SelectItem>
                    <SelectItem value="team2">Vendedores Sênior</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ruleDistributionMethod" className="text-right">
                  Método de Distribuição
                </Label>
                <Select defaultValue="roundRobin">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione o método (apenas para equipes)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="roundRobin">Round Robin (alternado)</SelectItem>
                    <SelectItem value="leastWorkload">Menor Carga de Trabalho</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateRuleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={handleSaveRule}>
              <Check className="mr-2 h-4 w-4" /> Criar Regra
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Assignment Rule Dialog */}
      <Dialog open={isEditRuleDialogOpen} onOpenChange={setIsEditRuleDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Regra de Atribuição</DialogTitle>
            <DialogDescription>
              Modifique os critérios e ações desta regra de atribuição automática.
            </DialogDescription>
          </DialogHeader>
          {editingRule && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editRuleName" className="text-right">
                  Nome
                </Label>
                <Input 
                  id="editRuleName" 
                  defaultValue={editingRule.name} 
                  className="col-span-3" 
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editRuleEntity" className="text-right">
                  Aplicar para
                </Label>
                <Select defaultValue={editingRule.entityType}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione o tipo de entidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leads">Leads/Contatos</SelectItem>
                    <SelectItem value="deals">Negócios</SelectItem>
                    <SelectItem value="conversations">Conversas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Mais campos para edição... (similar ao formulário de criação) */}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editRuleStatus" className="text-right">
                  Status
                </Label>
                <Select defaultValue={editingRule.status}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditRuleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={handleSaveRule}>
              <Check className="mr-2 h-4 w-4" /> Atualizar Regra
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};