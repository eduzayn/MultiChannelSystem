import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Copy, 
  Edit, 
  Eye, 
  FileText, 
  Mail, 
  MessageSquare, 
  Plus, 
  Search, 
  Trash2
} from "lucide-react";

export const TemplateLibrary = () => {
  const [activeTab, setActiveTab] = useState("email");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar modelos..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button className="sm:w-auto w-full">
          <Plus className="mr-2 h-4 w-4" /> Novo Modelo
        </Button>
      </div>

      <Tabs defaultValue="email" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="whatsapp-official">WhatsApp Oficial</TabsTrigger>
          <TabsTrigger value="whatsapp-zapi">WhatsApp ZApi</TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Template Card - Email */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-blue-500" />
                  Boas-vindas ao Novo Cliente
                </CardTitle>
                <CardDescription className="text-xs">
                  Última modificação: 15/04/2023
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3 line-clamp-2">
                  Olá {"{{nome}}"}, obrigado por se cadastrar em nossa plataforma...
                </p>
                <div className="flex justify-between">
                  <div className="space-x-1">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-3.5 w-3.5 mr-1" /> Ver
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Edit className="h-3.5 w-3.5 mr-1" /> Editar
                    </Button>
                  </div>
                  <div className="space-x-1">
                    <Button size="sm" variant="ghost">
                      <Copy className="h-3.5 w-3.5 mr-1" /> Clonar
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Template Card - Email */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-blue-500" />
                  Promoção Mensal
                </CardTitle>
                <CardDescription className="text-xs">
                  Última modificação: 22/03/2023
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3 line-clamp-2">
                  Aproveite nossas ofertas exclusivas do mês, {"{{nome}}"}! Produtos selecionados...
                </p>
                <div className="flex justify-between">
                  <div className="space-x-1">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-3.5 w-3.5 mr-1" /> Ver
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Edit className="h-3.5 w-3.5 mr-1" /> Editar
                    </Button>
                  </div>
                  <div className="space-x-1">
                    <Button size="sm" variant="ghost">
                      <Copy className="h-3.5 w-3.5 mr-1" /> Clonar
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Template Card - Email */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-blue-500" />
                  Lembrete de Pagamento
                </CardTitle>
                <CardDescription className="text-xs">
                  Última modificação: 05/05/2023
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3 line-clamp-2">
                  Olá {"{{nome}}"}, este é um lembrete sobre sua fatura {"{{fatura_id}}"} que vence...
                </p>
                <div className="flex justify-between">
                  <div className="space-x-1">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-3.5 w-3.5 mr-1" /> Ver
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Edit className="h-3.5 w-3.5 mr-1" /> Editar
                    </Button>
                  </div>
                  <div className="space-x-1">
                    <Button size="sm" variant="ghost">
                      <Copy className="h-3.5 w-3.5 mr-1" /> Clonar
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="whatsapp-official" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Template Card - WhatsApp Oficial */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2 text-green-500" />
                  Confirmação de Pedido
                </CardTitle>
                <CardDescription className="text-xs flex justify-between">
                  <span>Última modificação: 10/04/2023</span>
                  <span className="bg-green-100 text-green-800 px-1.5 rounded text-xs">Aprovado</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3 line-clamp-2">
                  Olá {"{{1}}"}, seu pedido {"{{2}}"} foi confirmado e está em preparação...
                </p>
                <div className="flex justify-between">
                  <div className="space-x-1">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-3.5 w-3.5 mr-1" /> Ver
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Edit className="h-3.5 w-3.5 mr-1" /> Editar
                    </Button>
                  </div>
                  <div className="space-x-1">
                    <Button size="sm" variant="ghost">
                      <Copy className="h-3.5 w-3.5 mr-1" /> Clonar
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Template Card - WhatsApp Oficial */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2 text-green-500" />
                  Notificação de Entrega
                </CardTitle>
                <CardDescription className="text-xs flex justify-between">
                  <span>Última modificação: 15/04/2023</span>
                  <span className="bg-yellow-100 text-yellow-800 px-1.5 rounded text-xs">Pendente</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3 line-clamp-2">
                  Olá {"{{1}}"}, seu pedido {"{{2}}"} está a caminho e deve chegar em {"{{3}}"}...
                </p>
                <div className="flex justify-between">
                  <div className="space-x-1">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-3.5 w-3.5 mr-1" /> Ver
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Edit className="h-3.5 w-3.5 mr-1" /> Editar
                    </Button>
                  </div>
                  <div className="space-x-1">
                    <Button size="sm" variant="ghost">
                      <Copy className="h-3.5 w-3.5 mr-1" /> Clonar
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="whatsapp-zapi" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Template Card - WhatsApp ZAPI */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2 text-purple-500" />
                  Lembrete de Agendamento
                </CardTitle>
                <CardDescription className="text-xs">
                  Última modificação: 18/04/2023
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3 line-clamp-2">
                  Olá {"{{nome}}"}, lembrar que você tem um agendamento para {"{{data}}"} às {"{{hora}}"}...
                </p>
                <div className="flex justify-between">
                  <div className="space-x-1">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-3.5 w-3.5 mr-1" /> Ver
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Edit className="h-3.5 w-3.5 mr-1" /> Editar
                    </Button>
                  </div>
                  <div className="space-x-1">
                    <Button size="sm" variant="ghost">
                      <Copy className="h-3.5 w-3.5 mr-1" /> Clonar
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};