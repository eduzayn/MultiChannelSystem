import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image, Save, Undo, CircleCheck, CircleX, Sun, Moon, Palette } from "lucide-react";

// Utility to check color contrast ratio
const getContrastRatio = (foreground: string, background: string) => {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Calculate luminance
  const getLuminance = (color: { r: number, g: number, b: number }) => {
    const { r, g, b } = color;
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const rgb1 = hexToRgb(foreground);
  const rgb2 = hexToRgb(background);
  const l1 = getLuminance(rgb1);
  const l2 = getLuminance(rgb2);
  
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  return parseFloat(ratio.toFixed(2));
};

// Determine if text should be white or black based on background color
const getTextColor = (backgroundColor: string) => {
  const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(backgroundColor);
  if (rgb) {
    const r = parseInt(rgb[1], 16);
    const g = parseInt(rgb[2], 16);
    const b = parseInt(rgb[3], 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155 ? "#000000" : "#FFFFFF";
  }
  return "#FFFFFF";
};

// Determine conformance level
const getConformanceLevel = (ratio: number) => {
  // WCAG AA: Large text = 3:1, Normal text = 4.5:1
  // WCAG AAA: Large text = 4.5:1, Normal text = 7:1
  if (ratio >= 7) return { normal: { aa: true, aaa: true }, large: { aa: true, aaa: true } };
  if (ratio >= 4.5) return { normal: { aa: true, aaa: false }, large: { aa: true, aaa: true } };
  if (ratio >= 3) return { normal: { aa: false, aaa: false }, large: { aa: true, aaa: false } };
  return { normal: { aa: false, aaa: false }, large: { aa: false, aaa: false } };
};

export const BrandingTab = () => {
  const { toast } = useToast();
  
  const [primaryColor, setPrimaryColor] = useState("#8B5CF6");
  const [secondaryColor, setSecondaryColor] = useState("#D946EF");
  const [originalPrimaryColor, setOriginalPrimaryColor] = useState("#8B5CF6");
  const [originalSecondaryColor, setOriginalSecondaryColor] = useState("#D946EF");
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isFaviconModalOpen, setIsFaviconModalOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [defaultTheme, setDefaultTheme] = useState<"light" | "dark" | "system">("light");
  const [hasChanges, setHasChanges] = useState(false);

  // Calculate contrast ratios
  const primaryTextContrast = getContrastRatio(
    getTextColor(primaryColor), 
    primaryColor
  );
  const secondaryTextContrast = getContrastRatio(
    getTextColor(secondaryColor), 
    secondaryColor
  );
  const primaryTextOnLight = getContrastRatio(primaryColor, "#FFFFFF");
  const primaryTextOnDark = getContrastRatio(primaryColor, "#1A1F2C");
  const secondaryTextOnLight = getContrastRatio(secondaryColor, "#FFFFFF");
  const secondaryTextOnDark = getContrastRatio(secondaryColor, "#1A1F2C");

  // Get conformance levels
  const primaryConformance = getConformanceLevel(primaryTextContrast);
  const secondaryConformance = getConformanceLevel(secondaryTextContrast);

  useEffect(() => {
    // Check if there are any changes
    if (
      primaryColor !== originalPrimaryColor || 
      secondaryColor !== originalSecondaryColor
    ) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
    
    // Update CSS variables for real-time preview
    document.documentElement.style.setProperty('--preview-primary', primaryColor);
    document.documentElement.style.setProperty('--preview-primary-foreground', getTextColor(primaryColor));
    document.documentElement.style.setProperty('--preview-secondary', secondaryColor);
    document.documentElement.style.setProperty('--preview-secondary-foreground', getTextColor(secondaryColor));
  }, [primaryColor, secondaryColor, defaultTheme, originalPrimaryColor, originalSecondaryColor]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho máximo do arquivo é 2MB.",
          variant: "destructive"
        });
        return;
      }

      // Check file type
      if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) {
        toast({
          title: "Formato não suportado",
          description: "Por favor, faça upload de arquivos PNG, JPG ou SVG.",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setLogoPreview(e.target.result as string);
          setHasChanges(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 1MB)
      if (file.size > 1 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho máximo do arquivo é 1MB.",
          variant: "destructive"
        });
        return;
      }

      // Check file type
      if (!['image/png', 'image/jpeg'].includes(file.type)) {
        toast({
          title: "Formato não suportado",
          description: "Por favor, faça upload de arquivos PNG ou JPG. Formatos ICO não são suportados.",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setFaviconPreview(e.target.result as string);
          setHasChanges(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setHasChanges(true);
    setIsLogoModalOpen(false);
    toast({
      title: "Logo removido",
      description: "O logo foi removido com sucesso."
    });
  };

  const handleRemoveFavicon = () => {
    setFaviconPreview(null);
    setHasChanges(true);
    setIsFaviconModalOpen(false);
    toast({
      title: "Favicon removido",
      description: "O favicon foi removido com sucesso."
    });
  };

  const handleSaveChanges = () => {
    // Here you would save changes to your backend
    setOriginalPrimaryColor(primaryColor);
    setOriginalSecondaryColor(secondaryColor);
    
    // Apply theme change if needed
    if (defaultTheme !== "light") {
      document.documentElement.classList.toggle('dark', defaultTheme === 'dark');
      localStorage.setItem('theme', defaultTheme);
    }

    setHasChanges(false);
    toast({
      title: "Alterações salvas",
      description: "As configurações de aparência foram salvas com sucesso."
    });
  };

  const handleResetToDefaults = () => {
    setPrimaryColor("#8B5CF6");
    setSecondaryColor("#D946EF");
    setLogoPreview(null);
    setFaviconPreview(null);
    setDefaultTheme("system");
    setHasChanges(true);
    
    toast({
      title: "Configurações resetadas",
      description: "Todas as configurações de aparência foram restauradas para o padrão do sistema."
    });
  };

  const handleThemeChange = (value: string) => {
    setDefaultTheme(value as "light" | "dark" | "system");
  };

  const renderContrastStatus = (ratio: number, type: 'normal' | 'large', level: 'aa' | 'aaa') => {
    const conformance = getConformanceLevel(ratio);
    return conformance[type][level] ? (
      <span className="text-green-500 inline-flex items-center gap-1">
        <CircleCheck className="h-4 w-4" /> 
        Passa {level.toUpperCase()}
      </span>
    ) : (
      <span className="text-orange-500 inline-flex items-center gap-1">
        <CircleX className="h-4 w-4" /> 
        Falha {level.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Logo Upload Section */}
      <div>
        <h3 className="text-lg font-medium mb-3">Logo da Empresa</h3>
        <div className="flex items-center gap-4">
          <div className="h-16 w-48 border rounded-md flex items-center justify-center bg-gray-100 overflow-hidden">
            {logoPreview ? (
              <img 
                src={logoPreview} 
                alt="Logo da empresa" 
                className="h-full object-contain" 
              />
            ) : (
              <span className="text-sm text-muted-foreground">Sem logo</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsLogoModalOpen(true)}>
              <Upload className="h-4 w-4 mr-2" /> 
              Carregar Logo
            </Button>
            {logoPreview && (
              <Button variant="outline" onClick={handleRemoveLogo}>
                Remover
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Recomendado: arquivo PNG ou SVG com fundo transparente, mínimo 200px de largura.
        </p>
      </div>
      
      <Separator />
      
      {/* Favicon Upload Section */}
      <div>
        <h3 className="text-lg font-medium mb-3">Favicon</h3>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 border rounded-md flex items-center justify-center bg-gray-100 overflow-hidden">
            {faviconPreview ? (
              <img 
                src={faviconPreview} 
                alt="Favicon" 
                className="h-full object-contain" 
              />
            ) : (
              <span className="text-sm text-muted-foreground">Sem favicon</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsFaviconModalOpen(true)}>
              <Image className="h-4 w-4 mr-2" /> 
              Carregar Favicon
            </Button>
            {faviconPreview && (
              <Button variant="outline" onClick={handleRemoveFavicon}>
                Remover
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Recomendado: arquivo PNG quadrado, mínimo 32x32px. Será usado como ícone na aba do navegador.
        </p>
      </div>
      
      <Separator />
      
      {/* Colors Section */}
      <div>
        <h3 className="text-lg font-medium mb-3">Cores do Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Label>Cor Primária</Label>
            <div className="flex items-center gap-3">
              <div 
                className="h-10 w-10 rounded-md border"
                style={{ backgroundColor: primaryColor }}
              />
              <Input 
                type="text" 
                value={primaryColor} 
                onChange={(e) => setPrimaryColor(e.target.value)} 
                className="w-32" 
              />
              <Input 
                type="color" 
                value={primaryColor} 
                onChange={(e) => setPrimaryColor(e.target.value)} 
                className="w-10 h-10 p-1" 
              />
              <Palette className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-sm">
              <div className="mb-2">Contraste com texto:</div>
              <div className="grid grid-cols-1 gap-1">
                <div className="flex items-center gap-2">
                  {renderContrastStatus(primaryTextContrast, 'normal', 'aa')}
                  {renderContrastStatus(primaryTextContrast, 'normal', 'aaa')}
                  <span className="text-muted-foreground ml-2">Ratio: {primaryTextContrast}:1</span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <Label>Cor Secundária</Label>
            <div className="flex items-center gap-3">
              <div 
                className="h-10 w-10 rounded-md border"
                style={{ backgroundColor: secondaryColor }}
              />
              <Input 
                type="text" 
                value={secondaryColor} 
                onChange={(e) => setSecondaryColor(e.target.value)} 
                className="w-32" 
              />
              <Input 
                type="color" 
                value={secondaryColor} 
                onChange={(e) => setSecondaryColor(e.target.value)} 
                className="w-10 h-10 p-1" 
              />
              <Palette className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-sm">
              <div className="mb-2">Contraste com texto:</div>
              <div className="grid grid-cols-1 gap-1">
                <div className="flex items-center gap-2">
                  {renderContrastStatus(secondaryTextContrast, 'normal', 'aa')}
                  {renderContrastStatus(secondaryTextContrast, 'normal', 'aaa')}
                  <span className="text-muted-foreground ml-2">Ratio: {secondaryTextContrast}:1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 rounded-lg border overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 border-b">
            <h4 className="text-sm font-medium mb-1">Pré-visualização das cores no sistema</h4>
            <p className="text-xs text-muted-foreground">
              Veja como as cores escolhidas aparecem em diferentes elementos de interface.
            </p>
          </div>
          <div className="p-4 bg-white">
            <div className="flex gap-2 mb-4">
              <Button 
                style={{ 
                  backgroundColor: primaryColor, 
                  color: getTextColor(primaryColor),
                  border: 'none'
                }}
              >
                Botão Primário
              </Button>
              <Button 
                style={{ 
                  backgroundColor: secondaryColor, 
                  color: getTextColor(secondaryColor),
                  border: 'none'
                }}
              >
                Botão Secundário
              </Button>
            </div>
            <div className="flex gap-2">
              <div 
                className="px-3 py-1 rounded-full text-xs"
                style={{ 
                  backgroundColor: primaryColor, 
                  color: getTextColor(primaryColor)
                }}
              >
                Tag Primária
              </div>
              <div 
                className="px-3 py-1 rounded-full text-xs"
                style={{ 
                  backgroundColor: secondaryColor, 
                  color: getTextColor(secondaryColor)
                }}
              >
                Tag Secundária
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Theme Section */}
      <div>
        <h3 className="text-lg font-medium mb-3">Tema Padrão</h3>
        <RadioGroup 
          value={defaultTheme} 
          onValueChange={handleThemeChange}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2"
        >
          <div className="flex items-center">
            <RadioGroupItem value="light" id="theme-light" className="peer sr-only" />
            <Label
              htmlFor="theme-light"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 hover:border-gray-300 cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <Sun className="h-6 w-6 mb-2 text-orange-400" />
              <div className="text-sm font-medium">Modo Claro</div>
              <span className="text-xs text-muted-foreground mt-1">Fundo branco, texto escuro</span>
            </Label>
          </div>
          <div className="flex items-center">
            <RadioGroupItem value="dark" id="theme-dark" className="peer sr-only" />
            <Label
              htmlFor="theme-dark"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-gray-950 p-4 hover:bg-gray-900 hover:border-gray-700 cursor-pointer text-white peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <Moon className="h-6 w-6 mb-2 text-blue-400" />
              <div className="text-sm font-medium">Modo Escuro</div>
              <span className="text-xs text-gray-400 mt-1">Fundo escuro, texto claro</span>
            </Label>
          </div>
          <div className="flex items-center">
            <RadioGroupItem value="system" id="theme-system" className="peer sr-only" />
            <Label
              htmlFor="theme-system"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-gradient-to-r from-white to-gray-950 p-4 hover:border-gray-400 cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <div className="h-6 w-6 mb-2 rounded-full bg-gradient-to-r from-yellow-400 to-blue-400" />
              <div className="text-sm font-medium">Automático</div>
              <span className="text-xs text-muted-foreground mt-1">Segue o tema do dispositivo</span>
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      {/* Action Buttons */}
      {hasChanges && (
        <div className="flex justify-end gap-3 py-4 bg-muted/10 px-4 rounded-lg border">
          <Button variant="outline" onClick={handleResetToDefaults}>
            <Undo className="h-4 w-4 mr-2" />
            Restaurar Padrões
          </Button>
          <Button onClick={handleSaveChanges}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      )}
      
      {/* Logo Upload Modal */}
      <Dialog open={isLogoModalOpen} onOpenChange={setIsLogoModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Carregar Logo</DialogTitle>
            <DialogDescription>
              Escolha uma imagem para usar como logo da empresa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6">
              <label htmlFor="logo-upload" className="cursor-pointer text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <div className="text-sm font-medium">Clique para escolher um arquivo</div>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG ou SVG (máx. 2MB)
                </p>
                <Input
                  id="logo-upload"
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={handleLogoUpload}
                />
              </label>
            </div>
            {logoPreview && (
              <div className="mt-4">
                <Label className="mb-2 block">Pré-visualização:</Label>
                <div className="h-20 border rounded-md flex items-center justify-center bg-gray-100 overflow-hidden">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogoModalOpen(false)}>
              Cancelar
            </Button>
            {logoPreview && (
              <Button variant="destructive" onClick={handleRemoveLogo}>
                Remover
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Favicon Upload Modal */}
      <Dialog open={isFaviconModalOpen} onOpenChange={setIsFaviconModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Carregar Favicon</DialogTitle>
            <DialogDescription>
              Escolha uma imagem para usar como favicon do site.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6">
              <label htmlFor="favicon-upload" className="cursor-pointer text-center">
                <Image className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <div className="text-sm font-medium">Clique para escolher um arquivo</div>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG ou JPG (máx. 1MB)
                </p>
                <Input
                  id="favicon-upload"
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpeg"
                  onChange={handleFaviconUpload}
                />
              </label>
            </div>
            {faviconPreview && (
              <div className="mt-4">
                <Label className="mb-2 block">Pré-visualização:</Label>
                <div className="h-16 w-16 border rounded-md flex items-center justify-center bg-gray-100 overflow-hidden mx-auto">
                  <img
                    src={faviconPreview}
                    alt="Favicon preview"
                    className="h-full object-contain"
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Assim é como o ícone aparecerá na aba do navegador (em tamanho menor).
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFaviconModalOpen(false)}>
              Cancelar
            </Button>
            {faviconPreview && (
              <Button variant="destructive" onClick={handleRemoveFavicon}>
                Remover
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};