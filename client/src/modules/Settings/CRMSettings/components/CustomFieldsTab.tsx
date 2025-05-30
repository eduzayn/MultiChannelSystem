import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Pencil, Plus, Settings, Tag, Trash2 } from "lucide-react";

// Mock data for demonstration
const mockCustomFields = [
  { id: 1, label: "Orçamento Anual", internalName: "annual_budget", module: "companies", type: "number", required: true, status: "active" },
  { id: 2, label: "Cargo", internalName: "job_title", module: "contacts", type: "text", required: false, status: "active" },
  { id: 3, label: "Setor de Atuação", internalName: "industry", module: "companies", type: "dropdown", required: true, status: "active" },
  { id: 4, label: "Data de Aniversário", internalName: "birth_date", module: "contacts", type: "date", required: false, status: "active" },
  { id: 5, label: "Valor Estimado", internalName: "estimated_value", module: "deals", type: "number", required: true, status: "active" },
];

export const CustomFieldsTab = () => {
  const [filterModule, setFilterModule] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);

  // Filter fields based on selected module
  const filteredFields = filterModule === "all" 
    ? mockCustomFields 
    : mockCustomFields.filter(field => field.module === filterModule);

  const handleEditField = (field: any) => {
    setEditingField(field);
    setIsEditDialogOpen(true);
  };

  const handleSaveField = () => {
    // Save logic would go here
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setEditingField(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Campos Personalizados</h2>
          <p className="text-muted-foreground">
            Adicione campos específicos para Contatos, Empresas e Negócios
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Campo
        </Button>
      </div>

      <div className="flex items-center space-x-4 py-2">
        <Label htmlFor="module-filter">Filtrar por:</Label>
        <Select value={filterModule} onValueChange={setFilterModule}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todos os Módulos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Módulos</SelectItem>
            <SelectItem value="contacts">Contatos</SelectItem>
            <SelectItem value="companies">Empresas</SelectItem>
            <SelectItem value="deals">Negócios</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rótulo</TableHead>
                <TableHead>Nome Interno</TableHead>
                <TableHead>Módulo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Obrigatório</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFields.map((field) => (
                <TableRow key={field.id}>
                  <TableCell>{field.label}</TableCell>
                  <TableCell>{field.internalName}</TableCell>
                  <TableCell>
                    {field.module === "contacts" && "Contatos"}
                    {field.module === "companies" && "Empresas"}
                    {field.module === "deals" && "Negócios"}
                  </TableCell>
                  <TableCell>
                    {field.type === "text" && "Texto"}
                    {field.type === "number" && "Número"}
                    {field.type === "date" && "Data"}
                    {field.type === "dropdown" && "Lista Suspensa"}
                  </TableCell>
                  <TableCell>{field.required ? "Sim" : "Não"}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${field.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {field.status === "active" ? "Ativo" : "Inativo"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditField(field)}>
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
        </CardContent>
      </Card>

      {/* Create Field Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Campo Personalizado</DialogTitle>
            <DialogDescription>
              Adicione um novo campo para coletar dados específicos da sua organização.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fieldModule" className="text-right">
                Módulo
              </Label>
              <Select defaultValue="contacts">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o módulo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contacts">Contatos</SelectItem>
                  <SelectItem value="companies">Empresas</SelectItem>
                  <SelectItem value="deals">Negócios</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fieldLabel" className="text-right">
                Rótulo
              </Label>
              <Input id="fieldLabel" placeholder="Ex: Orçamento Anual" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fieldType" className="text-right">
                Tipo
              </Label>
              <Select defaultValue="text">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="textlong">Texto Longo</SelectItem>
                  <SelectItem value="number">Número</SelectItem>
                  <SelectItem value="date">Data</SelectItem>
                  <SelectItem value="dropdown">Lista Suspensa</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fieldRequired" className="text-right">
                Obrigatório
              </Label>
              <Select defaultValue="false">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Sim</SelectItem>
                  <SelectItem value="false">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={handleSaveField}>
              <Check className="mr-2 h-4 w-4" /> Salvar Campo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Field Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Editar Campo Personalizado</DialogTitle>
            <DialogDescription>
              Modifique as propriedades deste campo personalizado.
            </DialogDescription>
          </DialogHeader>
          {editingField && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editFieldModule" className="text-right">
                  Módulo
                </Label>
                <Select defaultValue={editingField.module}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione o módulo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contacts">Contatos</SelectItem>
                    <SelectItem value="companies">Empresas</SelectItem>
                    <SelectItem value="deals">Negócios</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editFieldLabel" className="text-right">
                  Rótulo
                </Label>
                <Input id="editFieldLabel" defaultValue={editingField.label} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editFieldType" className="text-right">
                  Tipo
                </Label>
                <Select defaultValue={editingField.type}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="textlong">Texto Longo</SelectItem>
                    <SelectItem value="number">Número</SelectItem>
                    <SelectItem value="date">Data</SelectItem>
                    <SelectItem value="dropdown">Lista Suspensa</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editFieldRequired" className="text-right">
                  Obrigatório
                </Label>
                <Select defaultValue={editingField.required ? "true" : "false"}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sim</SelectItem>
                    <SelectItem value="false">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={handleSaveField}>
              <Check className="mr-2 h-4 w-4" /> Atualizar Campo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};