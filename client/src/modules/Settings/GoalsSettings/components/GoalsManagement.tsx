import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { BarChart2, Goal, PlusCircle, Target, Trash } from "lucide-react";

// Mock de metas que podem ser configuradas pelo administrador
const goalTemplates = [
  {
    id: 1,
    title: "Meta de Vendas",
    description: "Meta de vendas totais para o período",
    metricType: "currency",
    periodicity: "quarterly",
    applicableRoles: ["vendedor", "gerente-vendas"],
    status: "active",
  },
  {
    id: 2,
    title: "Novos Clientes",
    description: "Quantidade de novos clientes adquiridos no período",
    metricType: "integer",
    periodicity: "monthly",
    applicableRoles: ["vendedor"],
    status: "active",
  },
  {
    id: 3,
    title: "Taxa de Conversão",
    description: "Percentual de propostas convertidas em vendas",
    metricType: "percentage",
    periodicity: "monthly",
    applicableRoles: ["vendedor", "gerente-vendas"],
    status: "inactive",
  },
  {
    id: 4,
    title: "NPS Médio",
    description: "Pontuação média de satisfação dos clientes",
    metricType: "decimal",
    periodicity: "quarterly",
    applicableRoles: ["atendente", "gerente-cs"],
    status: "active",
  },
];

export const GoalsManagement = () => {
  const [goals, setGoals] = useState(goalTemplates);
  const [openDialog, setOpenDialog] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Gestão de Metas</h2>
          <p className="text-muted-foreground">
            Configure as metas disponíveis para atribuição aos usuários
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Meta</DialogTitle>
              <DialogDescription>
                Configure os detalhes da nova meta a ser disponibilizada no sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Meta</Label>
                <Input id="title" placeholder="Ex: Meta de Vendas Mensal" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input id="description" placeholder="Descreva a meta..." />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="metric-type">Tipo de Métrica</Label>
                  <Select>
                    <SelectTrigger id="metric-type">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="currency">Valor Monetário (R$)</SelectItem>
                      <SelectItem value="integer">Número Inteiro</SelectItem>
                      <SelectItem value="percentage">Percentual (%)</SelectItem>
                      <SelectItem value="decimal">Número Decimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="periodicity">Periodicidade</Label>
                  <Select>
                    <SelectTrigger id="periodicity">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                      <SelectItem value="annually">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Papéis Aplicáveis</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="role-vendedor" />
                    <label htmlFor="role-vendedor" className="text-sm">Vendedor</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="role-gerente" />
                    <label htmlFor="role-gerente" className="text-sm">Gerente de Vendas</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="role-suporte" />
                    <label htmlFor="role-suporte" className="text-sm">Atendimento/Suporte</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="role-cs" />
                    <label htmlFor="role-cs" className="text-sm">Customer Success</label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancelar</Button>
              <Button onClick={() => setOpenDialog(false)}>Salvar Meta</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {goals.map((goal) => (
          <Card key={goal.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{goal.title}</CardTitle>
                  {goal.status === "inactive" && (
                    <Badge variant="outline" className="text-muted-foreground">Inativa</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Editar</Button>
                  <Button variant="destructive" size="sm" className="h-8 w-8 p-0">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>{goal.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium">Tipo de Métrica</p>
                  <p className="text-sm text-muted-foreground">
                    {goal.metricType === "currency" && "Valor Monetário (R$)"}
                    {goal.metricType === "integer" && "Número Inteiro"}
                    {goal.metricType === "percentage" && "Percentual (%)"}
                    {goal.metricType === "decimal" && "Número Decimal"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Periodicidade</p>
                  <p className="text-sm text-muted-foreground">
                    {goal.periodicity === "weekly" && "Semanal"}
                    {goal.periodicity === "monthly" && "Mensal"}
                    {goal.periodicity === "quarterly" && "Trimestral"}
                    {goal.periodicity === "annually" && "Anual"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Papéis Aplicáveis</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {goal.applicableRoles.map((role) => (
                      <Badge key={role} variant="secondary" className="text-xs">
                        {role === "vendedor" && "Vendedor"}
                        {role === "gerente-vendas" && "Gerente de Vendas"}
                        {role === "atendente" && "Atendimento"}
                        {role === "gerente-cs" && "Gerente CS"}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/30 px-6 py-3">
              <Button variant="secondary" size="sm" className="ml-auto">
                <BarChart2 className="h-4 w-4 mr-2" />
                Ver Estatísticas
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};