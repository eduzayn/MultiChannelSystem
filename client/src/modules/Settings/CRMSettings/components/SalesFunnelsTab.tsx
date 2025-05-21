import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";

// Mock data for demonstration
const mockFunnels = [
  {
    id: 1,
    name: "Vendas B2B",
    stages: [
      { id: 1, name: "Prospecção", probability: 10, color: "#B3BAC5", order: 1 },
      { id: 2, name: "Qualificação", probability: 30, color: "#79E2F2", order: 2 },
      { id: 3, name: "Proposta", probability: 60, color: "#FFAB00", order: 3 },
      { id: 4, name: "Negociação", probability: 80, color: "#FF8B00", order: 4 },
      { id: 5, name: "Ganho", probability: 100, color: "#36B37E", order: 5, isFinal: true, type: "won" },
      { id: 6, name: "Perdido", probability: 0, color: "#FF5630", order: 6, isFinal: true, type: "lost" },
    ],
  },
  {
    id: 2,
    name: "Vendas B2C",
    stages: [
      { id: 7, name: "Inicial", probability: 10, color: "#B3BAC5", order: 1 },
      { id: 8, name: "Interesse", probability: 40, color: "#79E2F2", order: 2 },
      { id: 9, name: "Demonstração", probability: 70, color: "#FFAB00", order: 3 },
      { id: 10, name: "Fechamento", probability: 90, color: "#FF8B00", order: 4 },
      { id: 11, name: "Ganho", probability: 100, color: "#36B37E", order: 5, isFinal: true, type: "won" },
      { id: 12, name: "Perdido", probability: 0, color: "#FF5630", order: 6, isFinal: true, type: "lost" },
    ],
  },
];

export const SalesFunnelsTab = () => {
  const [selectedFunnel, setSelectedFunnel] = useState(mockFunnels[0]);
  const [isCreateStageDialogOpen, setIsCreateStageDialogOpen] = useState(false);
  const [isEditStageDialogOpen, setIsEditStageDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<any>(null);
  const [isCreateFunnelDialogOpen, setIsCreateFunnelDialogOpen] = useState(false);

  const handleEditStage = (stage: any) => {
    setEditingStage(stage);
    setIsEditStageDialogOpen(true);
  };

  const handleSaveStage = () => {
    // Save logic would go here
    setIsCreateStageDialogOpen(false);
    setIsEditStageDialogOpen(false);
    setEditingStage(null);
  };

  const handleMoveStage = (stage: any, direction: 'up' | 'down') => {
    // Logic to reorder stages would go here
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Funis de Vendas</h2>
          <p className="text-muted-foreground">
            Configure as etapas dos funis de vendas para seu processo comercial
          </p>
        </div>
        <Button onClick={() => setIsCreateFunnelDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Funil
        </Button>
      </div>

      <div className="flex items-center space-x-4 py-2">
        <Label htmlFor="funnel-select">Selecionar Funil:</Label>
        <Select
          value={selectedFunnel.id.toString()}
          onValueChange={(value) => {
            const funnel = mockFunnels.find(f => f.id.toString() === value);
            if (funnel) setSelectedFunnel(funnel);
          }}
        >
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Selecionar Funil" />
          </SelectTrigger>
          <SelectContent>
            {mockFunnels.map((funnel) => (
              <SelectItem key={funnel.id} value={funnel.id.toString()}>
                {funnel.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Ordem</TableHead>
              <TableHead className="w-[50px]">Cor</TableHead>
              <TableHead>Nome da Etapa</TableHead>
              <TableHead className="w-[150px]">Probabilidade (%)</TableHead>
              <TableHead className="w-[150px]">Tipo</TableHead>
              <TableHead className="w-[150px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedFunnel.stages.map((stage) => (
              <TableRow key={stage.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={stage.order === 1}
                      onClick={() => handleMoveStage(stage, 'up')}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <span className="text-center">{stage.order}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={stage.order === selectedFunnel.stages.length}
                      onClick={() => handleMoveStage(stage, 'down')}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div 
                    className="w-6 h-6 rounded-full" 
                    style={{ backgroundColor: stage.color }}
                  />
                </TableCell>
                <TableCell className="font-medium">{stage.name}</TableCell>
                <TableCell>{stage.probability}%</TableCell>
                <TableCell>
                  {stage.isFinal && (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      stage.type === 'won' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {stage.type === 'won' ? "Ganho" : "Perdido"}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditStage(stage)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {!stage.isFinal && (
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="pt-4">
        <Button onClick={() => setIsCreateStageDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar Etapa
        </Button>
      </div>

      {/* Create Stage Dialog */}
      <Dialog open={isCreateStageDialogOpen} onOpenChange={setIsCreateStageDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Etapa ao Funil</DialogTitle>
            <DialogDescription>
              Crie uma nova etapa para o funil {selectedFunnel.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stageName" className="text-right">
                Nome
              </Label>
              <Input id="stageName" placeholder="Ex: Demonstração" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stageProbability" className="text-right">
                Probabilidade (%)
              </Label>
              <Input id="stageProbability" type="number" min="0" max="100" defaultValue="50" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stageColor" className="text-right">
                Cor
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input id="stageColor" type="color" className="w-12 h-8 p-1" defaultValue="#FFAB00" />
                <span className="text-sm text-muted-foreground">Escolha uma cor para identificar esta etapa no funil</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stageType" className="text-right">
                Tipo de Etapa
              </Label>
              <Select defaultValue="regular">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Etapa Regular</SelectItem>
                  <SelectItem value="won">Etapa Final (Ganho)</SelectItem>
                  <SelectItem value="lost">Etapa Final (Perdido)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateStageDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={handleSaveStage}>
              <Check className="mr-2 h-4 w-4" /> Criar Etapa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Stage Dialog */}
      <Dialog open={isEditStageDialogOpen} onOpenChange={setIsEditStageDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Etapa do Funil</DialogTitle>
            <DialogDescription>
              Modifique as propriedades desta etapa do funil.
            </DialogDescription>
          </DialogHeader>
          {editingStage && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editStageName" className="text-right">
                  Nome
                </Label>
                <Input id="editStageName" defaultValue={editingStage.name} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editStageProbability" className="text-right">
                  Probabilidade (%)
                </Label>
                <Input 
                  id="editStageProbability" 
                  type="number" 
                  min="0" 
                  max="100" 
                  defaultValue={editingStage.probability} 
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editStageColor" className="text-right">
                  Cor
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Input 
                    id="editStageColor" 
                    type="color" 
                    className="w-12 h-8 p-1" 
                    defaultValue={editingStage.color} 
                  />
                  <span className="text-sm text-muted-foreground">Escolha uma cor para identificar esta etapa no funil</span>
                </div>
              </div>
              {!editingStage.isFinal && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="editStageType" className="text-right">
                    Tipo de Etapa
                  </Label>
                  <Select defaultValue={editingStage.isFinal ? editingStage.type : "regular"}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Etapa Regular</SelectItem>
                      <SelectItem value="won">Etapa Final (Ganho)</SelectItem>
                      <SelectItem value="lost">Etapa Final (Perdido)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditStageDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={handleSaveStage}>
              <Check className="mr-2 h-4 w-4" /> Atualizar Etapa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Funnel Dialog */}
      <Dialog open={isCreateFunnelDialogOpen} onOpenChange={setIsCreateFunnelDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Funil de Vendas</DialogTitle>
            <DialogDescription>
              Defina um novo funil para representar seu processo de vendas.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="funnelName" className="text-right">
                Nome
              </Label>
              <Input id="funnelName" placeholder="Ex: Vendas Governo" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="funnelDescription" className="text-right">
                Descrição
              </Label>
              <Input id="funnelDescription" placeholder="Descrição opcional" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateFunnelDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={() => setIsCreateFunnelDialogOpen(false)}>
              <Check className="mr-2 h-4 w-4" /> Criar Funil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};