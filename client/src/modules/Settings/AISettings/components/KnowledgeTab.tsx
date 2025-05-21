import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Check, File, FileText, Link, MoreHorizontal, Plus, RefreshCw, Trash2, Upload } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// Mock data for knowledge sources
const mockSources = [
  { id: 1, name: "Manual do Produto X", type: "PDF", status: "indexed", added: "2025-04-15", lastSync: "2025-05-17", size: "24 chunks", tags: ["Produto", "Manual"] },
  { id: 2, name: "FAQ do Site Institucional", type: "URL", status: "indexed", added: "2025-03-20", lastSync: "2025-05-17", size: "45 chunks", tags: ["FAQ", "Website"] },
  { id: 3, name: "Blog da Empresa", type: "URL", status: "processing", added: "2025-05-18", lastSync: "-", size: "-", tags: ["Blog", "Artigos"] },
  { id: 4, name: "Perguntas Frequentes - Clientes", type: "FAQ", status: "indexed", added: "2025-02-10", lastSync: "2025-05-10", size: "18 chunks", tags: ["FAQ", "Suporte"] },
  { id: 5, name: "Documentação Técnica API", type: "PDF", status: "error", added: "2025-05-01", lastSync: "2025-05-01", size: "Erro", tags: ["Técnico", "API"] },
];

export const KnowledgeTab = () => {
  const [isAddSourceDialogOpen, setIsAddSourceDialogOpen] = useState(false);
  const [sourceType, setSourceType] = useState("url");
  const [currentStep, setCurrentStep] = useState(1);
  const [faqItems, setFaqItems] = useState([
    { id: 1, question: "", answer: "" },
    { id: 2, question: "", answer: "" },
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "indexed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">🟢 Indexado</Badge>;
      case "processing":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">🟡 Processando</Badge>;
      case "error":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">🔴 Erro</Badge>;
      case "scheduled":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">🔵 Agendado</Badge>;
      default:
        return <Badge variant="outline">Status Desconhecido</Badge>;
    }
  };
  
  const handleAddFaqItem = () => {
    const newId = faqItems.length > 0 ? Math.max(...faqItems.map(item => item.id)) + 1 : 1;
    setFaqItems([...faqItems, { id: newId, question: "", answer: "" }]);
  };

  const renderAddSourceStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="sourceName">Nome da Fonte</Label>
                <Input id="sourceName" placeholder="Ex: Manual do Produto, FAQ do Site, etc." />
              </div>
              
              <div className="space-y-2">
                <Label>Tipo de Fonte</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    className={cn(
                      "flex flex-col h-auto items-center justify-start p-4 gap-2",
                      sourceType === "url" && "border-primary"
                    )}
                    onClick={() => setSourceType("url")}
                  >
                    <Link className="h-8 w-8" />
                    <div className="text-sm font-medium">Link / URL</div>
                    <div className="text-xs text-muted-foreground">Website ou Página</div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    type="button"
                    className={cn(
                      "flex flex-col h-auto items-center justify-start p-4 gap-2",
                      sourceType === "file" && "border-primary"
                    )}
                    onClick={() => setSourceType("file")}
                  >
                    <File className="h-8 w-8" />
                    <div className="text-sm font-medium">Arquivo</div>
                    <div className="text-xs text-muted-foreground">PDF, DOCX, TXT</div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    type="button"
                    className={cn(
                      "flex flex-col h-auto items-center justify-start p-4 gap-2",
                      sourceType === "faq" && "border-primary"
                    )}
                    onClick={() => setSourceType("faq")}
                  >
                    <FileText className="h-8 w-8" />
                    <div className="text-sm font-medium">FAQ</div>
                    <div className="text-xs text-muted-foreground">Perguntas e Respostas</div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    type="button"
                    className={cn(
                      "flex flex-col h-auto items-center justify-start p-4 gap-2",
                      sourceType === "manual" && "border-primary"
                    )}
                    onClick={() => setSourceType("manual")}
                  >
                    <FileText className="h-8 w-8" />
                    <div className="text-sm font-medium">Texto Manual</div>
                    <div className="text-xs text-muted-foreground">Escrever conteúdo</div>
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setIsAddSourceDialogOpen(false)}>Cancelar</Button>
              <Button onClick={() => setCurrentStep(2)}>Próximo</Button>
            </DialogFooter>
          </>
        );
        
      case 2:
        return (
          <>
            <div className="space-y-4 py-4">
              {sourceType === "url" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="url">URL a ser Indexada</Label>
                    <Input id="url" placeholder="https://..." />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="crawlDepth">Profundidade de Navegação</Label>
                    <Select defaultValue="1">
                      <SelectTrigger id="crawlDepth">
                        <SelectValue placeholder="Selecione a profundidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Apenas esta página</SelectItem>
                        <SelectItem value="1">Seguir links internos 1 nível</SelectItem>
                        <SelectItem value="2">Seguir links internos 2 níveis</SelectItem>
                        <SelectItem value="sitemap">Usar Sitemap XML (se disponível)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="syncFrequency">Frequência de Re-sincronização</Label>
                    <Select defaultValue="never">
                      <SelectTrigger id="syncFrequency">
                        <SelectValue placeholder="Selecione a frequência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Nunca (Manual)</SelectItem>
                        <SelectItem value="daily">Diariamente</SelectItem>
                        <SelectItem value="weekly">Semanalmente</SelectItem>
                        <SelectItem value="monthly">Mensalmente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              
              {sourceType === "file" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Arquivos para Upload</Label>
                    <div className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div className="mt-2">
                        <p className="text-sm font-medium">
                          Clique para selecionar ou arraste arquivos aqui
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Formatos suportados: PDF, DOCX, TXT (Máx. 10MB)
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="ocrEnabled" />
                    <Label htmlFor="ocrEnabled">Tentar extrair texto de imagens dentro dos PDFs (OCR)</Label>
                  </div>
                </div>
              )}
              
              {sourceType === "faq" && (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label>Perguntas e Respostas</Label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={handleAddFaqItem}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Adicionar Item
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {faqItems.map((item) => (
                      <div key={item.id} className="space-y-2 p-3 border rounded-md">
                        <div className="flex justify-between items-center">
                          <Label htmlFor={`question-${item.id}`} className="text-sm">Pergunta</Label>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                        <Input 
                          id={`question-${item.id}`} 
                          placeholder="Digite a pergunta aqui..." 
                          value={item.question}
                          onChange={(e) => {
                            const updatedItems = faqItems.map(faq => 
                              faq.id === item.id ? {...faq, question: e.target.value} : faq
                            );
                            setFaqItems(updatedItems);
                          }}
                        />
                        
                        <Label htmlFor={`answer-${item.id}`} className="text-sm">Resposta</Label>
                        <Textarea 
                          id={`answer-${item.id}`} 
                          placeholder="Digite a resposta aqui..." 
                          rows={2}
                          value={item.answer}
                          onChange={(e) => {
                            const updatedItems = faqItems.map(faq => 
                              faq.id === item.id ? {...faq, answer: e.target.value} : faq
                            );
                            setFaqItems(updatedItems);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {sourceType === "manual" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="manualContent">Conteúdo</Label>
                    <Textarea 
                      id="manualContent" 
                      placeholder="Insira o texto que deseja adicionar à base de conhecimento..." 
                      className="min-h-[300px]"
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (opcional)</Label>
                <Input id="tags" placeholder="Ex: Produto, Manual, FAQ (separe por vírgulas)" />
                <p className="text-xs text-muted-foreground">
                  Tags ajudam a organizar e filtrar suas fontes de conhecimento
                </p>
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>Voltar</Button>
              <Button>
                <Check className="mr-2 h-4 w-4" /> Adicionar Fonte
              </Button>
            </DialogFooter>
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Base de Conhecimento</h2>
          <p className="text-muted-foreground">
            Gerencie as fontes de informação usadas pela Prof. Ana
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsAddSourceDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" /> Adicionar Fonte
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" /> Sincronizar
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Adicionado</TableHead>
              <TableHead>Última Sincronização</TableHead>
              <TableHead>Tamanho</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockSources.map((source) => (
              <TableRow key={source.id}>
                <TableCell className="font-medium">
                  {source.name}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {source.tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-muted/50">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{source.type}</TableCell>
                <TableCell>{getStatusBadge(source.status)}</TableCell>
                <TableCell>{source.added}</TableCell>
                <TableCell>{source.lastSync}</TableCell>
                <TableCell>{source.size}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <RefreshCw className="h-4 w-4 mr-2" /> Sincronizar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="h-4 w-4 mr-2" /> Ver Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Trash2 className="h-4 w-4 mr-2" /> Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={isAddSourceDialogOpen} onOpenChange={setIsAddSourceDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Fonte de Conhecimento</DialogTitle>
            <DialogDescription>
              Adicione novas fontes para enriquecer a base de conhecimento da IA
            </DialogDescription>
          </DialogHeader>
          
          {renderAddSourceStep()}
        </DialogContent>
      </Dialog>
    </div>
  );
};