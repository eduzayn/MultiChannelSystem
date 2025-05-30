import React, { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

export const CompanyProfileTab = () => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Função para acionar o input de arquivo quando o botão for clicado
  const handleLogoButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Função para processar o arquivo de logo selecionado
  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    // Verificar tamanho (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo do arquivo é 2MB.",
        variant: "destructive"
      });
      return;
    }

    // Verificar tipo de arquivo
    if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) {
      toast({
        title: "Formato não suportado",
        description: "Por favor, faça upload de arquivos PNG, JPG ou SVG.",
        variant: "destructive"
      });
      return;
    }

    // Criar preview do arquivo
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    toast({
      title: "Logo carregado com sucesso",
      description: "Clique em 'Salvar Alterações' para aplicar as mudanças.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Identificação da Empresa</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Nome da Empresa</Label>
            <Input id="companyName" defaultValue="Minha Empresa" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyLogo">Logo da Empresa</Label>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 border rounded-md flex items-center justify-center bg-gray-100 overflow-hidden">
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Logo da empresa" 
                    className="h-full w-full object-contain" 
                  />
                ) : (
                  <span className="text-muted-foreground">Logo</span>
                )}
              </div>
              <div>
                {/* Input oculto para seleção de arquivo */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleLogoFileChange}
                  accept=".png,.jpg,.jpeg,.svg"
                  style={{ display: 'none' }}
                  id="logo-upload"
                />
                <Button 
                  variant="outline" 
                  onClick={handleLogoButtonClick}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Carregar Logo
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Formatos suportados: PNG, JPG, SVG (máximo 2MB)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyCNPJ">CNPJ</Label>
            <Input id="companyCNPJ" defaultValue="00.000.000/0001-00" />
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium mb-3">Informações de Contato</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyEmail">Email de Contato</Label>
            <Input id="companyEmail" type="email" defaultValue="contato@minhaempresa.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyPhone">Telefone</Label>
            <Input id="companyPhone" defaultValue="(11) 3456-7890" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyWebsite">Website</Label>
            <Input id="companyWebsite" defaultValue="www.minhaempresa.com.br" />
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium mb-3">Endereço</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="companyStreet">Endereço</Label>
            <Input id="companyStreet" defaultValue="Av. Paulista, 1000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyCity">Cidade</Label>
            <Input id="companyCity" defaultValue="São Paulo" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyState">Estado</Label>
            <Input id="companyState" defaultValue="SP" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyZip">CEP</Label>
            <Input id="companyZip" defaultValue="01310-000" />
          </div>
        </div>
      </div>
      
      <div className="pt-4">
        <Button>Salvar Alterações</Button>
      </div>
    </div>
  );
};