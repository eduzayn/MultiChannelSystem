import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

interface ContactFormProps {
  contact?: any; // Contato existente para edição, null/undefined para novo
  onSave: (contactData: any) => void;
  onCancel: () => void;
}

export const ContactForm = ({ contact, onSave, onCancel }: ContactFormProps) => {
  // Estado do formulário
  const [formData, setFormData] = useState({
    name: contact?.name || "",
    email: contact?.email || "",
    phone: contact?.phone || "",
    company: contact?.company || "",
    type: contact?.type || "Lead",
    address: contact?.address || "",
    tags: contact?.tags || [],
    notes: contact?.notes || "",
    owner: contact?.owner || "João da Silva"
  });
  
  // Estado para o input de nova tag
  const [newTag, setNewTag] = useState("");
  
  // Manipular mudanças nos campos do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Manipular seleção de tipo de contato e proprietário
  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Adicionar nova tag
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ 
        ...prev, 
        tags: [...prev.tags, newTag.trim()] 
      }));
      setNewTag("");
    }
  };
  
  // Remover tag
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  // Lidar com o envio do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  // Listar possíveis proprietários (seria buscado da API)
  const possibleOwners = [
    "João da Silva", 
    "Ana Oliveira", 
    "Carlos Gomes", 
    "Mariana Costa"
  ];
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 py-2 pb-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            name="name"
            placeholder="Nome do contato"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="email@exemplo.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="+55 11 99999-9999"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Input
              id="company"
              name="company"
              placeholder="Nome da empresa"
              value={formData.company}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de contato</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleSelectChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lead">Lead</SelectItem>
                <SelectItem value="Cliente">Cliente</SelectItem>
                <SelectItem value="Parceiro">Parceiro</SelectItem>
                <SelectItem value="Fornecedor">Fornecedor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Endereço</Label>
          <Input
            id="address"
            name="address"
            placeholder="Rua, número, complemento"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="owner">Proprietário</Label>
          <Select
            value={formData.owner}
            onValueChange={(value) => handleSelectChange("owner", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o proprietário" />
            </SelectTrigger>
            <SelectContent>
              {possibleOwners.map(owner => (
                <SelectItem key={owner} value={owner}>{owner}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          
          <Card>
            <CardContent className="p-3">
              <div className="flex flex-wrap gap-1 mb-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs py-0 pl-2 pr-1 flex items-center">
                    {tag}
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 ml-1 p-0" 
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                {formData.tags.length === 0 && (
                  <span className="text-xs text-muted-foreground">Nenhuma tag adicionada</span>
                )}
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Nova tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="notes">Notas</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Adicione observações importantes sobre este contato"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button type="submit">
          {contact ? "Atualizar Contato" : "Criar Contato"}
        </Button>
      </div>
    </form>
  );
};