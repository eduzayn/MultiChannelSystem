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
import { Textarea } from "@/components/ui/textarea";
import { X, Tag, PlusCircle } from "lucide-react";

// Status options
const statusOptions = [
  "Cliente Ativo",
  "Prospect",
  "Lead Qualificado",
  "Ex-Cliente",
  "Parceiro Estratégico"
];

// Industry options
const industryOptions = [
  "Tecnologia",
  "Manufatura",
  "Varejo",
  "Serviços Financeiros",
  "Saúde",
  "Construção",
  "Educação",
  "Outro"
];

// Owners (usuários responsáveis)
const ownerOptions = [
  "João Silva",
  "Maria Souza",
  "Carlos Mendes",
  "Ana Costa",
  "Roberto Alves"
];

interface CompanyFormProps {
  company?: any;
  onSave: (companyData: any) => void;
  onCancel: () => void;
}

export function CompanyForm({ company, onSave, onCancel }: CompanyFormProps) {
  const [formData, setFormData] = useState({
    name: company?.name || "",
    tradingName: company?.tradingName || "",
    cnpj: company?.cnpj || "",
    website: company?.website || "",
    industry: company?.industry || "",
    status: company?.status || "Prospect",
    phone: company?.phone || "",
    email: company?.email || "",
    address: company?.address || "",
    city: company?.city || "",
    state: company?.state || "",
    description: company?.description || "",
    tags: company?.tags || [],
    owner: company?.owner || ""
  });

  const [newTag, setNewTag] = useState("");

  // Manipular mudanças nos campos do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manipular seleção em dropdowns
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

  // Enviar formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2 pb-4">
      <div className="grid grid-cols-1 gap-6">
        {/* Informações básicas */}
        <div>
          <h3 className="text-lg font-medium mb-3">Informações básicas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Empresa</Label>
              <Input
                id="name"
                name="name"
                placeholder="Nome da empresa"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tradingName">Razão Social</Label>
              <Input
                id="tradingName"
                name="tradingName"
                placeholder="Razão Social"
                value={formData.tradingName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                name="cnpj"
                placeholder="00.000.000/0001-00"
                value={formData.cnpj}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                placeholder="https://exemplo.com"
                value={formData.website}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Setor de Atuação</Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => handleSelectChange("industry", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  {industryOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Informações de contato */}
        <div>
          <h3 className="text-lg font-medium mb-3">Informações de contato</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone Principal</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="(00) 0000-0000"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Geral</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="contato@exemplo.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div>
          <h3 className="text-lg font-medium mb-3">Endereço</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Logradouro</Label>
              <Input
                id="address"
                name="address"
                placeholder="Av. Paulista, 1000"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="Cidade"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  name="state"
                  placeholder="UF"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Informações adicionais */}
        <div>
          <h3 className="text-lg font-medium mb-3">Informações Adicionais</h3>
          
          <div className="space-y-2 mb-4">
            <Label htmlFor="description">Descrição da Empresa</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Descreva a empresa..."
              rows={4}
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2 mb-4">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex items-center bg-muted px-2 py-1 rounded-md">
                  <Tag className="h-3 w-3 mr-1" />
                  <span className="text-sm">{tag}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTag(tag)}
                    className="h-5 w-5 p-0 ml-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                id="newTag"
                placeholder="Adicione tags separadas por vírgula"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="owner">Proprietário da Conta</Label>
            <Select
              value={formData.owner}
              onValueChange={(value) => handleSelectChange("owner", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o proprietário" />
              </SelectTrigger>
              <SelectContent>
                {ownerOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {company ? "Atualizar Empresa" : "Criar Empresa"}
        </Button>
      </div>
    </form>
  );
}