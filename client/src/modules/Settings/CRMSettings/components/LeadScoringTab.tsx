import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Check, Pencil, Plus, Star, Trash2 } from "lucide-react";

// Mock data for demonstration
const mockScoringRules = [
  { 
    id: 1, 
    description: "Formulário de contato preenchido", 
    criteria: "Origem do Lead é 'Formulário de Contato'", 
    property: "leadSource",
    operator: "equals",
    value: "Formulário de Contato", 
    points: 10, 
    status: "active" 
  },
  { 
    id: 2, 
    description: "Email aberto", 
    criteria: "Email marketing foi aberto", 
    property: "emailOpened",
    operator: "equals",
    value: "true", 
    points: 5, 
    status: "active" 
  },
  { 
    id: 3, 
    description: "Orçamento estimado alto", 
    criteria: "Orçamento Estimado é maior que R$ 100.000", 
    property: "estimatedBudget",
    operator: "greaterThan",
    value: "100000", 
    points: 15, 
    status: "active" 
  },
  { 
    id: 4, 
    description: "Lead de região não prioritária", 
    criteria: "Estado é AC, RO, RR ou AP", 
    property: "state",
    operator: "in",
    value: "AC,RO,RR,AP", 
    points: -5, 
    status: "active" 
  },
  { 
    id: 5, 
    description: "Visitou página de preços", 
    criteria: "Visitou a página de preços do site", 
    property: "visitedPricingPage",
    operator: "equals",
    value: "true", 
    points: 20, 
    status: "inactive" 
  },
];

const mockQualificationLevels = [
  { id: 1, name: "Lead Frio", minScore: 0, maxScore: 20, color: "#0065FF" },
  { id: 2, name: "Lead Morno", minScore: 21, maxScore: 50, color: "#FFAB00" },
  { id: 3, name: "MQL (Marketing Qualified Lead)", minScore: 51, maxScore: 80, color: "#FF8B00" },
  { id: 4, name: "SQL (Sales Qualified Lead)", minScore: 81, maxScore: 1000, color: "#36B37E" },
];

export const LeadScoringTab = () => {
  const [isLeadScoringEnabled, setIsLeadScoringEnabled] = useState(true);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [isEditRuleDialogOpen, setIsEditRuleDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [isLevelDialogOpen, setIsLevelDialogOpen] = useState(false);
  const [isEditLevelDialogOpen, setIsEditLevelDialogOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("rules");

  const handleEditRule = (rule: any) => {
    setEditingRule(rule);
    setIsEditRuleDialogOpen(true);
  };

  const handleEditLevel = (level: any) => {
    setEditingLevel(level);
    setIsEditLevelDialogOpen(true);
  };

  const handleSaveRule = () => {
    // Save logic would go here
    setIsRuleDialogOpen(false);
    setIsEditRuleDialogOpen(false);
    setEditingRule(null);
  };

  const handleSaveLevel = () => {
    // Save logic would go here
    setIsLevelDialogOpen(false);
    setIsEditLevelDialogOpen(false);
    setEditingLevel(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Pontuação de Leads (Lead Scoring)</h2>
          <p className="text-muted-foreground">
            Configure regras para qualificar seus leads automaticamente
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Switch 
            checked={isLeadScoringEnabled} 
            onCheckedChange={setIsLeadScoringEnabled} 
            id="lead-scoring-toggle"
          />
          <Label htmlFor="lead-scoring-toggle">
            {isLeadScoringEnabled ? "Ativado" : "Desativado"}
          </Label>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab("rules")}
            className={`py-2 border-b-2 font-medium transition-colors ${
              activeTab === "rules"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Regras de Pontuação
          </button>
          <button
            onClick={() => setActiveTab("levels")}
            className={`py-2 border-b-2 font-medium transition-colors ${
              activeTab === "levels"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Níveis de Qualificação
          </button>
        </div>
      </div>

      {activeTab === "rules" && (
        <>
          <div className="flex justify-between items-center">
            <div>
              <Button
                onClick={() => setIsRuleDialogOpen(true)}
                disabled={!isLeadScoringEnabled}
              >
                <Plus className="mr-2 h-4 w-4" /> Nova Regra
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Critério</TableHead>
                  <TableHead className="w-[100px] text-center">Pontos</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[120px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockScoringRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.description}</TableCell>
                    <TableCell>{rule.criteria}</TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                        rule.points > 0 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {rule.points > 0 ? `+${rule.points}` : rule.points}
                      </span>
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
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {activeTab === "levels" && (
        <>
          <div className="flex justify-between items-center">
            <div>
              <Button
                onClick={() => setIsLevelDialogOpen(true)}
                disabled={!isLeadScoringEnabled}
              >
                <Plus className="mr-2 h-4 w-4" /> Novo Nível
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Cor</TableHead>
                  <TableHead>Nível de Qualificação</TableHead>
                  <TableHead className="w-[150px]">Faixa de Pontuação</TableHead>
                  <TableHead className="w-[120px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockQualificationLevels.map((level) => (
                  <TableRow key={level.id}>
                    <TableCell>
                      <div 
                        className="w-6 h-6 rounded-full" 
                        style={{ backgroundColor: level.color }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{level.name}</TableCell>
                    <TableCell>
                      {level.minScore} - {level.maxScore === 1000 ? "∞" : level.maxScore}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditLevel(level)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Create Scoring Rule Dialog */}
      <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Criar Nova Regra de Pontuação</DialogTitle>
            <DialogDescription>
              Defina uma regra para atribuir pontos a leads com base em suas características ou comportamento.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ruleDescription" className="text-right">
                Descrição
              </Label>
              <Input 
                id="ruleDescription" 
                placeholder="Ex: Lead preencheu formulário" 
                className="col-span-3" 
              />
            </div>
            
            <div className="space-y-2">
              <div className="font-medium mb-2">Condição (SE...)</div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ruleProperty" className="text-right">
                  Propriedade
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione a propriedade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leadSource">Origem do Lead</SelectItem>
                    <SelectItem value="state">Estado</SelectItem>
                    <SelectItem value="emailOpened">Email Aberto</SelectItem>
                    <SelectItem value="visitedPricingPage">Visitou Página de Preços</SelectItem>
                    <SelectItem value="estimatedBudget">Orçamento Estimado</SelectItem>
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
                  placeholder="Ex: Formulário de Contato" 
                  className="col-span-3" 
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rulePoints" className="text-right">
                Pontos
              </Label>
              <Input 
                id="rulePoints" 
                type="number" 
                placeholder="Ex: 10" 
                defaultValue="5"
                className="col-span-3" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsRuleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={handleSaveRule}>
              <Check className="mr-2 h-4 w-4" /> Criar Regra
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Rule Dialog */}
      <Dialog open={isEditRuleDialogOpen} onOpenChange={setIsEditRuleDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Regra de Pontuação</DialogTitle>
            <DialogDescription>
              Modifique as propriedades desta regra de pontuação.
            </DialogDescription>
          </DialogHeader>
          {editingRule && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editRuleDescription" className="text-right">
                  Descrição
                </Label>
                <Input 
                  id="editRuleDescription" 
                  defaultValue={editingRule.description}
                  className="col-span-3" 
                />
              </div>
              
              <div className="space-y-2">
                <div className="font-medium mb-2">Condição (SE...)</div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="editRuleProperty" className="text-right">
                    Propriedade
                  </Label>
                  <Select defaultValue={editingRule.property}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione a propriedade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leadSource">Origem do Lead</SelectItem>
                      <SelectItem value="state">Estado</SelectItem>
                      <SelectItem value="emailOpened">Email Aberto</SelectItem>
                      <SelectItem value="visitedPricingPage">Visitou Página de Preços</SelectItem>
                      <SelectItem value="estimatedBudget">Orçamento Estimado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="editRuleOperator" className="text-right">
                    Operador
                  </Label>
                  <Select defaultValue={editingRule.operator}>
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
                  <Label htmlFor="editRuleValue" className="text-right">
                    Valor
                  </Label>
                  <Input 
                    id="editRuleValue" 
                    defaultValue={editingRule.value}
                    className="col-span-3" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editRulePoints" className="text-right">
                  Pontos
                </Label>
                <Input 
                  id="editRulePoints" 
                  type="number" 
                  defaultValue={editingRule.points}
                  className="col-span-3" 
                />
              </div>

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

      {/* Create Level Dialog */}
      <Dialog open={isLevelDialogOpen} onOpenChange={setIsLevelDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Nível de Qualificação</DialogTitle>
            <DialogDescription>
              Defina um novo nível para classificar seus leads com base na pontuação.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="levelName" className="text-right">
                Nome
              </Label>
              <Input id="levelName" placeholder="Ex: Lead Quente" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="levelMinScore" className="text-right">
                Pontuação Mínima
              </Label>
              <Input id="levelMinScore" type="number" min="0" defaultValue="0" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="levelMaxScore" className="text-right">
                Pontuação Máxima
              </Label>
              <Input id="levelMaxScore" type="number" min="0" defaultValue="100" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="levelColor" className="text-right">
                Cor
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input id="levelColor" type="color" className="w-12 h-8 p-1" defaultValue="#36B37E" />
                <span className="text-sm text-muted-foreground">Escolha uma cor para identificar este nível</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsLevelDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={handleSaveLevel}>
              <Check className="mr-2 h-4 w-4" /> Criar Nível
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Level Dialog */}
      <Dialog open={isEditLevelDialogOpen} onOpenChange={setIsEditLevelDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Nível de Qualificação</DialogTitle>
            <DialogDescription>
              Modifique as propriedades deste nível de qualificação.
            </DialogDescription>
          </DialogHeader>
          {editingLevel && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editLevelName" className="text-right">
                  Nome
                </Label>
                <Input id="editLevelName" defaultValue={editingLevel.name} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editLevelMinScore" className="text-right">
                  Pontuação Mínima
                </Label>
                <Input 
                  id="editLevelMinScore" 
                  type="number" 
                  min="0" 
                  defaultValue={editingLevel.minScore} 
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editLevelMaxScore" className="text-right">
                  Pontuação Máxima
                </Label>
                <Input 
                  id="editLevelMaxScore" 
                  type="number" 
                  min="0" 
                  defaultValue={editingLevel.maxScore === 1000 ? "" : editingLevel.maxScore} 
                  placeholder="Deixe em branco para infinito"
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editLevelColor" className="text-right">
                  Cor
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Input 
                    id="editLevelColor" 
                    type="color" 
                    className="w-12 h-8 p-1" 
                    defaultValue={editingLevel.color} 
                  />
                  <span className="text-sm text-muted-foreground">Escolha uma cor para identificar este nível</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditLevelDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={handleSaveLevel}>
              <Check className="mr-2 h-4 w-4" /> Atualizar Nível
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};