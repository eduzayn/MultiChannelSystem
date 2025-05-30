import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Download, Pencil, Archive, Trash, FileUp, Users, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Dados mockados para as listas estáticas
const staticLists = [
  { 
    id: 1, 
    name: "Clientes Premium", 
    contacts: 237, 
    createdAt: "2024-02-15", 
    origin: "Importada", 
    lastUpdated: "2024-04-05" 
  },
  { 
    id: 2, 
    name: "Leads Webinar Abril", 
    contacts: 153, 
    createdAt: "2024-04-02", 
    origin: "Importada", 
    lastUpdated: "2024-04-02" 
  },
  { 
    id: 3, 
    name: "Clientes Inativos +90 dias", 
    contacts: 89, 
    createdAt: "2024-03-10", 
    origin: "Manual", 
    lastUpdated: "2024-04-01" 
  },
];

// Dados mockados para os segmentos dinâmicos
const dynamicSegments = [
  { 
    id: 1, 
    name: "Interessados em Produto A", 
    criteria: "Tag 'Interesse Produto A' E Última Interação < 30 dias", 
    contacts: 145, 
    createdAt: "2024-03-01", 
    lastUpdated: "2024-04-10" 
  },
  { 
    id: 2, 
    name: "Clientes de Alto Valor", 
    criteria: "Total de Compras > R$ 5.000 OU Compra Recorrente >= 3", 
    contacts: 72, 
    createdAt: "2024-02-20", 
    lastUpdated: "2024-04-10" 
  },
  { 
    id: 3, 
    name: "Leads Quentes", 
    criteria: "Pontuação de Lead > 80 E Não Convertido", 
    contacts: 28, 
    createdAt: "2024-03-15", 
    lastUpdated: "2024-04-10" 
  },
];

export const ListManagement = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [listType, setListType] = useState("static");
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  const handleCreateNew = (type: string) => {
    setListType(type);
    setShowCreateForm(true);
    setFormData({ name: "", description: "" });
  };

  const handleCancel = () => {
    setShowCreateForm(false);
  };

  const handleSave = () => {
    console.log(`Salvando nova ${listType === 'static' ? 'lista' : 'segmento'}:`, formData);
    setShowCreateForm(false);
    // Aqui seria feita a chamada à API para salvar a lista/segmento
  };

  return (
    <div className="space-y-6">
      {!showCreateForm ? (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Gestão de Listas de Contatos e Segmentos</h3>
              <p className="text-muted-foreground">
                Crie e gerencie listas estáticas e segmentos dinâmicos para suas campanhas de marketing.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleCreateNew("static")}>
                <Plus className="h-4 w-4 mr-2" /> Nova Lista Estática
              </Button>
              <Button onClick={() => handleCreateNew("dynamic")}>
                <Plus className="h-4 w-4 mr-2" /> Novo Segmento Dinâmico
              </Button>
            </div>
          </div>

          <Tabs defaultValue="static" className="space-y-4">
            <TabsList>
              <TabsTrigger value="static">Listas Estáticas</TabsTrigger>
              <TabsTrigger value="dynamic">Segmentos Dinâmicos</TabsTrigger>
            </TabsList>

            <TabsContent value="static">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Nome da Lista</TableHead>
                        <TableHead>Contatos</TableHead>
                        <TableHead>Data de Criação</TableHead>
                        <TableHead>Origem</TableHead>
                        <TableHead>Última Atualização</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staticLists.map((list) => (
                        <TableRow key={list.id}>
                          <TableCell className="font-medium">{list.name}</TableCell>
                          <TableCell>{list.contacts}</TableCell>
                          <TableCell>{list.createdAt}</TableCell>
                          <TableCell>{list.origin}</TableCell>
                          <TableCell>{list.lastUpdated}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" title="Ver contatos">
                                <Users className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Editar">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Exportar">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Arquivar">
                                <Archive className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Excluir">
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dynamic">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Nome do Segmento</TableHead>
                        <TableHead>Critérios</TableHead>
                        <TableHead>Contatos Atuais</TableHead>
                        <TableHead>Data de Criação</TableHead>
                        <TableHead>Última Atualização</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dynamicSegments.map((segment) => (
                        <TableRow key={segment.id}>
                          <TableCell className="font-medium">{segment.name}</TableCell>
                          <TableCell className="max-w-[250px] truncate" title={segment.criteria}>
                            {segment.criteria}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {segment.contacts}
                              <Button variant="ghost" size="icon" title="Atualizar contagem" className="h-6 w-6">
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>{segment.createdAt}</TableCell>
                          <TableCell>{segment.lastUpdated}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" title="Ver contatos">
                                <Users className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Editar critérios">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Exportar">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Arquivar">
                                <Archive className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Excluir">
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {listType === "static" ? "Criar Nova Lista Estática" : "Criar Novo Segmento Dinâmico"}
            </CardTitle>
            <CardDescription>
              {listType === "static" 
                ? "Crie uma lista estática de contatos que você pode gerenciar manualmente ou importar."
                : "Crie um segmento dinâmico que será atualizado automaticamente com base nos critérios definidos."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={`Nome ${listType === 'static' ? 'da lista' : 'do segmento'}`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea 
                id="description" 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o propósito e conteúdo desta lista"
                rows={3}
              />
            </div>

            {listType === "static" ? (
              <div className="space-y-2 border rounded-md p-4">
                <Label>Adicionar Contatos</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <Button variant="outline" className="justify-start">
                    <FileUp className="h-4 w-4 mr-2" />
                    Importar CSV/Excel
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Selecionar do CRM
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Copiar de Outro Segmento
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Você pode adicionar contatos agora ou após criar a lista.
                </p>
              </div>
            ) : (
              <div className="space-y-4 border rounded-md p-4">
                <Label>Definir Critérios de Segmento</Label>
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Interface para definição de critérios será exibida aqui, permitindo regras como:
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">Tag é "Interesse Produto A"</Badge>
                    <Badge variant="outline">E</Badge>
                    <Badge variant="outline">Última Interação &lt; 30 dias</Badge>
                  </div>
                  <p className="text-sm mt-2">
                    Contatos atuais que correspondem: <strong>0</strong>
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
              <Button onClick={handleSave}>
                {listType === "static" ? "Criar Lista" : "Criar Segmento"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};