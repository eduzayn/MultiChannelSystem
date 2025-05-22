import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useConversationStore } from '../stores/conversationStore';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  User,
  Phone,
  Mail,
  Building2,
  MessageCircle,
  FileSpreadsheet,
  Clock,
  CalendarClock,
  Tag,
  History,
  Bot,
  ChevronRight,
  Loader2,
  X,
  Edit,
} from "lucide-react";

const ContextPanel = () => {
  const { selectedConversation } = useConversationStore();
  const [activeTab, setActiveTab] = useState('profile');

  // Consulta para buscar informações do contato
  const { data: contactData, isLoading: loadingContact } = useQuery({
    queryKey: ['/api/contacts', selectedConversation?.contactId],
    queryFn: async () => {
      if (!selectedConversation?.contactId) return null;
      
      try {
        const response = await axios.get(`/api/contacts/${selectedConversation.contactId}`);
        return response.data;
      } catch (error) {
        console.error('Erro ao buscar dados do contato:', error);
        return null;
      }
    },
    enabled: !!selectedConversation?.contactId,
  });

  // Se nenhuma conversa estiver selecionada, exibir mensagem informativa
  if (!selectedConversation) {
    return (
      <div className="w-72 h-full border-l hidden lg:flex lg:flex-col items-center justify-center p-6 text-center">
        <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="font-medium mb-2">Painel de Contexto</h3>
        <p className="text-sm text-muted-foreground">
          Selecione uma conversa para visualizar informações de contexto do contato, histórico de interações, e ferramentas de IA.
        </p>
      </div>
    );
  }

  return (
    <div className="w-72 h-full border-l hidden lg:flex lg:flex-col">
      {/* Cabeçalho do painel */}
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Informações do Contato</h3>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Abas para diferentes tipos de contexto */}
      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 px-2 py-1">
          <TabsTrigger value="profile" className="text-xs">Perfil</TabsTrigger>
          <TabsTrigger value="history" className="text-xs">Histórico</TabsTrigger>
          <TabsTrigger value="ai" className="text-xs">IA Prof. Ana</TabsTrigger>
        </TabsList>
        
        {/* Conteúdo da aba Perfil */}
        <TabsContent value="profile" className="flex-1 overflow-y-auto p-3 space-y-4">
          {loadingContact ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : contactData ? (
            <>
              {/* Card de perfil principal */}
              <Card>
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={contactData.avatar} alt={contactData.name} />
                      <AvatarFallback>{contactData.name?.charAt(0) || "C"}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <Edit className="h-3.5 w-3.5" /> Editar
                    </Button>
                  </div>
                  <CardTitle className="text-lg">{contactData.name}</CardTitle>
                  <CardDescription>
                    {contactData.company || "Sem empresa"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{contactData.phone || "Sem telefone"}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{contactData.email || "Sem email"}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{contactData.company || "Sem empresa"}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Cliente desde {contactData.createdAt ? new Date(contactData.createdAt).toLocaleDateString('pt-BR') : "Desconhecido"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Tags do contato */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Tags</h4>
                  <Button variant="ghost" size="sm" className="h-6 px-1.5 text-xs">
                    Gerenciar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs bg-blue-100 dark:bg-blue-950 border-blue-200">Cliente VIP</Badge>
                  <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-950 border-green-200">Pré-venda</Badge>
                  <Badge variant="outline" className="text-xs bg-yellow-100 dark:bg-yellow-950 border-yellow-200">Atendimento Prioritário</Badge>
                </div>
              </div>
              
              {/* Resumo de interações */}
              <Card>
                <CardHeader className="p-3">
                  <CardTitle className="text-sm">Resumo de Interações</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Total de conversas</span>
                    </div>
                    <span className="font-medium">23</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Tempo médio de resposta</span>
                    </div>
                    <span className="font-medium">15min</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Última interação</span>
                    </div>
                    <span className="font-medium">Hoje</span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Notas sobre o contato */}
              <Card>
                <CardHeader className="p-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Notas</CardTitle>
                    <Button variant="ghost" size="sm" className="h-6 px-1.5 text-xs">
                      Adicionar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  {contactData.notes ? (
                    <p className="text-sm">{contactData.notes}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Nenhuma nota adicional sobre este contato.</p>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <p className="text-muted-foreground mb-2">Informações do contato não disponíveis</p>
                <Button variant="outline" size="sm">Recarregar</Button>
              </div>
            </div>
          )}
        </TabsContent>
        
        {/* Conteúdo da aba Histórico */}
        <TabsContent value="history" className="flex-1 overflow-y-auto p-3 space-y-4">
          <Card>
            <CardHeader className="p-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Histórico de Interações</CardTitle>
                <Button variant="outline" size="sm" className="h-7 text-xs">Ver Tudo</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="p-3 hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-[10px] h-4 px-1">
                        WhatsApp
                      </Badge>
                      <span className="text-xs text-muted-foreground">15 dias atrás</span>
                    </div>
                    <p className="text-sm mb-1 font-medium">Atendimento sobre produto</p>
                    <p className="text-xs text-muted-foreground">5 mensagens · Resolvido em 15 minutos</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-sm">Relatórios e Documentos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                <div className="p-3 hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center">
                    <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Orçamento_2023.pdf</p>
                      <p className="text-xs text-muted-foreground">Enviado em 28/03/2023</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-sm">Histórico de Negócios</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                <div className="p-3 hover:bg-muted/50 cursor-pointer">
                  <p className="text-sm font-medium">Venda de Software</p>
                  <div className="flex items-center justify-between my-1">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 text-xs border-green-200">Concluído</Badge>
                    <span className="text-sm font-medium">R$ 1.500,00</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Fechado em 15/04/2023</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Conteúdo da aba IA */}
        <TabsContent value="ai" className="flex-1 overflow-y-auto p-3 space-y-4">
          <Card>
            <CardHeader className="p-3">
              <div className="flex items-center">
                <Bot className="h-5 w-5 mr-2 text-blue-500" />
                <CardTitle className="text-sm">Assistente IA Prof. Ana</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Use a IA para agilizar seu atendimento com sugestões inteligentes.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                <button className="p-3 w-full text-left hover:bg-muted/50 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-100 dark:bg-blue-950 p-2 rounded-md mr-2">
                      <History className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Resumir Conversa</p>
                      <p className="text-xs text-muted-foreground">Gerar resumo dos principais pontos</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
                
                <button className="p-3 w-full text-left hover:bg-muted/50 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-green-100 dark:bg-green-950 p-2 rounded-md mr-2">
                      <MessageCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Sugerir Resposta</p>
                      <p className="text-xs text-muted-foreground">Criar resposta com base no contexto</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
                
                <button className="p-3 w-full text-left hover:bg-muted/50 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 dark:bg-yellow-950 p-2 rounded-md mr-2">
                      <Tag className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Analisar Sentimento</p>
                      <p className="text-xs text-muted-foreground">Avaliar o sentimento do cliente</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <CardHeader className="p-3">
              <CardTitle className="text-sm">Sugestões da IA</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-sm mb-3">
                Com base na conversa atual, o cliente parece estar interessado em mais informações sobre os planos de assinatura premium.
              </p>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8">
                  Enviar detalhes do plano Premium
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8">
                  Oferecer demonstração personalizada
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContextPanel;