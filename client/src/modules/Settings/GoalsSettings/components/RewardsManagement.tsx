import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Gift, PlusCircle, Star, Edit, Trash, ArrowUpRight } from "lucide-react";

// Mock de recompensas disponíveis
const rewardsMock = [
  {
    id: 1,
    name: "Gift Card R$100",
    description: "Gift card para usar em várias lojas online.",
    pointsCost: 5000,
    type: "gift-card",
    quantity: 10,
    status: "active",
  },
  {
    id: 2,
    name: "Dia de Folga Extra",
    description: "Um dia adicional de folga para ser usado dentro do trimestre atual.",
    pointsCost: 8000,
    type: "time-off",
    quantity: -1, // ilimitado
    status: "active",
  },
  {
    id: 3,
    name: "Mentoria com Diretor",
    description: "Sessão de mentoria de 1 hora com um diretor da empresa.",
    pointsCost: 10000,
    type: "experience",
    quantity: 5,
    status: "active",
  },
  {
    id: 4,
    name: "Curso Online Premium",
    description: "Acesso a um curso online à sua escolha (até R$500).",
    pointsCost: 7500,
    type: "education",
    quantity: 8,
    status: "inactive",
  },
];

export const RewardsManagement = () => {
  const [rewards, setRewards] = useState(rewardsMock);
  const [openDialog, setOpenDialog] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Recompensas</h2>
          <p className="text-muted-foreground">
            Configure as recompensas que os usuários podem obter com seus pontos
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Recompensa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Recompensa</DialogTitle>
              <DialogDescription>
                Defina os detalhes da nova recompensa que os usuários poderão resgatar.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reward-name">Nome da Recompensa</Label>
                <Input id="reward-name" placeholder="Ex: Gift Card R$100" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reward-description">Descrição</Label>
                <Textarea 
                  id="reward-description" 
                  placeholder="Descreva a recompensa em detalhes..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reward-type">Tipo</Label>
                  <Select>
                    <SelectTrigger id="reward-type">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gift-card">Gift Card</SelectItem>
                      <SelectItem value="time-off">Folga/Tempo Livre</SelectItem>
                      <SelectItem value="experience">Experiência</SelectItem>
                      <SelectItem value="education">Educacional</SelectItem>
                      <SelectItem value="physical">Item Físico</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="points-cost">Custo em Pontos</Label>
                  <Input 
                    id="points-cost" 
                    type="number" 
                    placeholder="Ex: 5000"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade Disponível</Label>
                  <Input 
                    id="quantity" 
                    type="number" 
                    placeholder="Quantidade ou -1 para ilimitado"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use -1 para quantidade ilimitada
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select defaultValue="active">
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                      <SelectItem value="coming-soon">Em Breve</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Visibilidade por Papéis</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="role-todos" defaultChecked />
                    <label htmlFor="role-todos" className="text-sm">Todos os papéis</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="role-vendedor" />
                    <label htmlFor="role-vendedor" className="text-sm">Vendedor</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="role-gerente" />
                    <label htmlFor="role-gerente" className="text-sm">Gerente</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="role-atendimento" />
                    <label htmlFor="role-atendimento" className="text-sm">Atendimento</label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancelar</Button>
              <Button onClick={() => setOpenDialog(false)}>Salvar Recompensa</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rewards.map((reward) => (
          <Card key={reward.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{reward.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>{reward.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <Star className="h-3 w-3 mr-1" />
                  {reward.pointsCost} pontos
                </Badge>
                
                <Badge variant="outline">
                  {reward.type === "gift-card" && "Gift Card"}
                  {reward.type === "time-off" && "Folga/Tempo Livre"}
                  {reward.type === "experience" && "Experiência"}
                  {reward.type === "education" && "Educacional"}
                </Badge>
                
                {reward.status === "inactive" && (
                  <Badge variant="outline" className="text-muted-foreground">
                    Inativo
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground">
                Quantidade: {reward.quantity === -1 ? "Ilimitada" : `${reward.quantity} disponíveis`}
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="ghost" size="sm" className="ml-auto flex items-center gap-1 text-sm">
                <span>Ver Histórico de Resgates</span>
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configurações Gerais de Recompensas</CardTitle>
          <CardDescription>Defina como o sistema de recompensas funcionará</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-approval">Aprovação Automática</Label>
              <p className="text-sm text-muted-foreground">
                Aprovar automaticamente o resgate de recompensas
              </p>
            </div>
            <Switch id="auto-approval" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notify-manager">Notificar Gestores</Label>
              <p className="text-sm text-muted-foreground">
                Notificar gestores quando recompensas forem resgatadas
              </p>
            </div>
            <Switch id="notify-manager" defaultChecked />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expiration-period">Período de Expiração de Pontos</Label>
            <Select defaultValue="never">
              <SelectTrigger id="expiration-period">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3-months">3 meses</SelectItem>
                <SelectItem value="6-months">6 meses</SelectItem>
                <SelectItem value="1-year">1 ano</SelectItem>
                <SelectItem value="never">Nunca expiram</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Salvar Alterações</Button>
      </div>
    </div>
  );
};