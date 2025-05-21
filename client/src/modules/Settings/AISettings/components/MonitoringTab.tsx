import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowRight, ArrowUp, Download, LineChart, MessageCircle, PieChart, Search } from "lucide-react";

// Mock data for AI usage statistics
const mockInteractions = [
  { 
    id: 1, 
    timestamp: "2025-05-18T14:23:45", 
    user: "João Silva", 
    userType: "agent", 
    channel: "WhatsApp",
    query: "Como faço para trocar meu produto?", 
    responseTime: 0.8,
    confidence: 0.92,
    usedKnowledge: ["FAQ de Trocas", "Política de Devolução"],
    feedbackReceived: true,
    feedbackRating: "positive"
  },
  { 
    id: 2, 
    timestamp: "2025-05-18T13:45:20", 
    user: "cliente@email.com", 
    userType: "customer", 
    channel: "Chat",
    query: "Onde encontro meu código de rastreio?", 
    responseTime: 1.2,
    confidence: 0.85,
    usedKnowledge: ["FAQ de Entregas"],
    feedbackReceived: true,
    feedbackRating: "neutral"
  },
  { 
    id: 3, 
    timestamp: "2025-05-18T12:15:33", 
    user: "Maria Oliveira", 
    userType: "agent", 
    channel: "WhatsApp",
    query: "Como adicionar um novo método de pagamento?", 
    responseTime: 0.9,
    confidence: 0.78,
    usedKnowledge: ["Manual de Pagamentos", "FAQ de Pagamentos"],
    feedbackReceived: true,
    feedbackRating: "negative"
  },
  { 
    id: 4, 
    timestamp: "2025-05-18T11:05:12", 
    user: "+5511999998888", 
    userType: "customer", 
    channel: "WhatsApp",
    query: "Quanto tempo demora para entregar?", 
    responseTime: 0.6,
    confidence: 0.95,
    usedKnowledge: ["FAQ de Entregas", "Política de Envio"],
    feedbackReceived: false,
    feedbackRating: ""
  },
  { 
    id: 5, 
    timestamp: "2025-05-18T10:30:42", 
    user: "Pedro Santos", 
    userType: "agent", 
    channel: "Chat",
    query: "Quais documentos preciso para cancelar assinatura?", 
    responseTime: 1.5,
    confidence: 0.72,
    usedKnowledge: ["Política de Cancelamento"],
    feedbackReceived: true,
    feedbackRating: "positive"
  },
];

export const MonitoringTab = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Monitoramento da IA</h2>
          <p className="text-muted-foreground">
            Acompanhe o uso e performance da IA Prof. Ana
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select defaultValue="today">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="yesterday">Ontem</SelectItem>
              <SelectItem value="week">Últimos 7 dias</SelectItem>
              <SelectItem value="month">Últimos 30 dias</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" /> Exportar
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Interações</CardDescription>
            <CardTitle className="text-2xl">1,248</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              <ArrowUp className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500 font-medium">12%</span>
              <span className="ml-1">vs período anterior</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tempo Médio de Resposta</CardDescription>
            <CardTitle className="text-2xl">0.95s</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              <ArrowDown className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500 font-medium">5%</span>
              <span className="ml-1">vs período anterior</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Confiança Média</CardDescription>
            <CardTitle className="text-2xl">87%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              <ArrowUp className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500 font-medium">2%</span>
              <span className="ml-1">vs período anterior</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Taxa de Satisfação</CardDescription>
            <CardTitle className="text-2xl">78%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              <ArrowRight className="h-3 w-3 mr-1 text-yellow-500" />
              <span className="text-yellow-500 font-medium">0%</span>
              <span className="ml-1">vs período anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="interactions">
        <TabsList>
          <TabsTrigger value="interactions" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span>Interações</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            <span>Análise</span>
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            <span>Uso de Conhecimento</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="interactions" className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Interações Recentes</h3>
            
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Buscar interações..."
                  className="pl-8 h-9 w-[250px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filtrar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os canais</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="chat">Chat</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Data e Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead className="w-[300px]">Consulta</TableHead>
                  <TableHead className="text-right">Tempo</TableHead>
                  <TableHead className="text-right">Confiança</TableHead>
                  <TableHead className="text-right">Feedback</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockInteractions.map((interaction) => (
                  <TableRow key={interaction.id}>
                    <TableCell className="font-medium">
                      {new Date(interaction.timestamp).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>
                      {interaction.user}
                      <div className="text-xs text-muted-foreground">
                        {interaction.userType === "agent" ? "Agente" : "Cliente"}
                      </div>
                    </TableCell>
                    <TableCell>{interaction.channel}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{interaction.query}</TableCell>
                    <TableCell className="text-right">{interaction.responseTime}s</TableCell>
                    <TableCell className="text-right">{Math.round(interaction.confidence * 100)}%</TableCell>
                    <TableCell className="text-right">
                      {interaction.feedbackReceived ? (
                        <Badge variant="outline" className={
                          interaction.feedbackRating === "positive" 
                            ? "bg-green-100 text-green-800 border-green-200" 
                            : interaction.feedbackRating === "neutral"
                              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                              : "bg-red-100 text-red-800 border-red-200"
                        }>
                          {interaction.feedbackRating === "positive" 
                            ? "Positivo" 
                            : interaction.feedbackRating === "neutral"
                              ? "Neutro"
                              : "Negativo"
                          }
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Não avaliado</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Mostrando 5 de 1.248 interações
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled>Anterior</Button>
              <Button variant="outline" size="sm">Próxima</Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise Detalhada</CardTitle>
              <CardDescription>
                Análise de performance da IA ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md bg-muted/30">
                <p className="text-muted-foreground">Gráfico de análise temporal seria mostrado aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="knowledge" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Uso de Base de Conhecimento</CardTitle>
              <CardDescription>
                Quais fontes de conhecimento são mais utilizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md bg-muted/30">
                <p className="text-muted-foreground">Gráfico de uso de conhecimento seria mostrado aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};