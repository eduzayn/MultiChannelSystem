import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Check, Pencil, Plus, Tag, Trash2 } from "lucide-react";

// Mock data for demonstration
const mockTags = [
  { id: 1, name: "Cliente VIP", color: "#FF5630", usageCount: 42, createdAt: "2024-03-15" },
  { id: 2, name: "Prospect", color: "#36B37E", usageCount: 128, createdAt: "2024-02-10" },
  { id: 3, name: "Aguardando Retorno", color: "#FFAB00", usageCount: 56, createdAt: "2024-04-02" },
  { id: 4, name: "Lead Frio", color: "#0065FF", usageCount: 87, createdAt: "2024-01-20" },
  { id: 5, name: "Concorrente", color: "#6554C0", usageCount: 12, createdAt: "2024-02-28" },
];

export const TagsTab = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter tags based on search term
  const filteredTags = searchTerm 
    ? mockTags.filter(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : mockTags;

  const handleEditTag = (tag: any) => {
    setEditingTag(tag);
    setIsEditDialogOpen(true);
  };

  const handleSaveTag = () => {
    // Save logic would go here
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setEditingTag(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Tags do CRM</h2>
          <p className="text-muted-foreground">
            Crie e gerencie tags para categorizar seus registros
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nova Tag
        </Button>
      </div>

      <div className="flex items-center space-x-4 py-2">
        <Input
          type="search"
          placeholder="Buscar tags..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Tag</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Uso</TableHead>
              <TableHead>Criada em</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell>
                  <div 
                    className="w-6 h-6 rounded-full" 
                    style={{ backgroundColor: tag.color }}
                  />
                </TableCell>
                <TableCell className="font-medium">{tag.name}</TableCell>
                <TableCell>{tag.usageCount} registros</TableCell>
                <TableCell>{tag.createdAt}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditTag(tag)}>
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

      {/* Create Tag Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Criar Nova Tag</DialogTitle>
            <DialogDescription>
              Adicione uma nova tag para categorizar registros no CRM.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tagName" className="text-right">
                Nome
              </Label>
              <Input id="tagName" placeholder="Ex: Cliente VIP" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tagColor" className="text-right">
                Cor
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input id="tagColor" type="color" className="w-12 h-8 p-1" defaultValue="#36B37E" />
                <span className="text-sm text-muted-foreground">Escolha uma cor para identificar a tag</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tagDescription" className="text-right">
                Descrição
              </Label>
              <Input id="tagDescription" placeholder="Descrição opcional" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={handleSaveTag}>
              <Check className="mr-2 h-4 w-4" /> Criar Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tag Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Tag</DialogTitle>
            <DialogDescription>
              Modifique as propriedades desta tag.
            </DialogDescription>
          </DialogHeader>
          {editingTag && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editTagName" className="text-right">
                  Nome
                </Label>
                <Input id="editTagName" defaultValue={editingTag.name} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editTagColor" className="text-right">
                  Cor
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Input id="editTagColor" type="color" className="w-12 h-8 p-1" defaultValue={editingTag.color} />
                  <span className="text-sm text-muted-foreground">Escolha uma cor para identificar a tag</span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editTagDescription" className="text-right">
                  Descrição
                </Label>
                <Input id="editTagDescription" placeholder="Descrição opcional" className="col-span-3" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={handleSaveTag}>
              <Check className="mr-2 h-4 w-4" /> Atualizar Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};