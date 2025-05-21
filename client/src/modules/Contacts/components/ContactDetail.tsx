import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit, 
  FileEdit, 
  AlertCircle, 
  Clock, 
  Plus, 
  Building, 
  Tag,
  BarChart,
  MessageSquare,
  FileText,
  Trash,
  MoreHorizontal
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  type: string;
  lastActivity: Date;
  createdAt: Date;
  tags: string[];
  owner: string;
}

interface ContactDetailProps {
  contact: Contact;
  onEdit: () => void;
}

const ContactDetail = ({ contact, onEdit }: ContactDetailProps) => {
  // Dados simulados adicionais que viriam da API
  const contactData = {
    ...contact,
    email: contact.email,
    phone: contact.phone,
    address: "Rua Exemplo, 123 - São Paulo, SP",
    joinDate: contact.createdAt,
    notes: "Cliente preferencial. Sempre verifica preços com concorrentes antes de comprar.",
    lastPurchase: {
      date: new Date(Date.now() - 30 * 24 * 3600000), // 30 dias atrás
      value: 249.90,
      product: "Assinatura Premium (Anual)"
    },
    paymentStatus: "Em dia",
    whatsappOptIn: true,
    whatsappOptInDate: new Date(2023, 5, 10) // 10 de junho de 2023
  };

  // Dados simulados da conversa atual
  const conversationData = {
    id: "conv-" + contact.id,
    startDate: new Date(Date.now() - 5 * 24 * 3600000), // 5 dias atrás
    previousAgents: ["Ana Silva", "Carlos Mendes"],
    tags: ["Suporte", "Problema de Entrega"]
  };

  // Simulação de artigos relacionados da base de conhecimento
  const relatedArticles = [
    {
      id: "art1",
      title: "Como rastrear pedidos",
      relevance: 95
    },
    {
      id: "art2",
      title: "Política de devolução",
      relevance: 80
    },
    {
      id: "art3",
      title: "Prazo de entrega por região",
      relevance: 75
    }
  ];

  // Simulação da análise de sentimento pela IA
  const sentimentAnalysis = {
    sentiment: "neutral", // positive, neutral, negative
    confidence: 78, // percentual de confiança
    keywords: ["entrega", "pedido", "atraso"]
  };

  return (
    <div className="h-full bg-card overflow-y-auto text-sm">
      <Tabs defaultValue="info">
        <div className="border-b">
          <div className="px-3 pt-2 pb-2">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-base font-semibold">{contactData.name}</h2>
                <p className="text-xs text-muted-foreground">
                  Cliente desde {format(contactData.joinDate, "MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar contato
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Iniciar conversa
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Tag className="h-4 w-4 mr-2" />
                    Gerenciar tags
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar dados
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash className="h-4 w-4 mr-2" />
                    Excluir contato
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <TabsList className="w-full justify-start px-3 pb-0">
            <TabsTrigger value="info" className="rounded-b-none text-xs py-1">Informações</TabsTrigger>
            <TabsTrigger value="history" className="rounded-b-none text-xs py-1">Histórico</TabsTrigger>
            <TabsTrigger value="deals" className="rounded-b-none text-xs py-1">Negócios</TabsTrigger>
            <TabsTrigger value="ia" className="rounded-b-none text-xs py-1">IA</TabsTrigger>
          </TabsList>
        </div>
      
        <TabsContent value="info" className="p-0 m-0">
          {/* Ações rápidas */}
          <div className="flex justify-center p-2 border-b">
            <Button variant="outline" size="sm" className="mr-2 h-7 text-xs" onClick={onEdit}>
              <Edit className="h-3 w-3 mr-1" />
              Editar
            </Button>
            <Button variant="default" size="sm" className="h-7 text-xs">
              <FileEdit className="h-3 w-3 mr-1" />
              Adicionar Nota
            </Button>
          </div>
          
          {/* Informações de contato */}
          <div className="p-3 border-b">
            <h3 className="text-xs font-medium mb-2">Informações de contato</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <Mail className="h-3 w-3 mr-2 text-muted-foreground" />
                <span className="text-xs">{contactData.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-3 w-3 mr-2 text-muted-foreground" />
                <span className="text-xs">{contactData.phone}</span>
              </div>
              <div className="flex items-center">
                <Building className="h-3 w-3 mr-2 text-muted-foreground" />
                <span className="text-xs">{contactData.company}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-2 text-muted-foreground" />
                <span className="text-xs">{contactData.address}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-2 text-muted-foreground" />
                <span className="text-xs">
                  Cadastrado em {format(contactData.joinDate, "dd/MM/yyyy")}
                </span>
              </div>
            </div>
          </div>
          
          {/* Tipo de contato */}
          <div className="p-3 border-b">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-xs font-medium">Tipo de contato</h3>
              <Badge 
                variant="outline" 
                className={`text-xs py-0 ${contactData.type === "Cliente" 
                  ? "bg-green-50 text-green-700 border-green-200" 
                  : "bg-blue-50 text-blue-700 border-blue-200"}`}
              >
                {contactData.type}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Proprietário: {contactData.owner}
            </p>
          </div>
          
          {/* Status de opt-in WhatsApp */}
          <div className="p-3 border-b">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-xs font-medium">Status Opt-in WhatsApp</h3>
              <Badge 
                variant="outline" 
                className={`text-xs py-0 ${contactData.whatsappOptIn 
                  ? "bg-green-50 text-green-700 border-green-200" 
                  : "bg-red-50 text-red-700 border-red-200"}`}
              >
                {contactData.whatsappOptIn ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            {contactData.whatsappOptIn && (
              <p className="text-xs text-muted-foreground">
                Opt-in confirmado em {format(contactData.whatsappOptInDate, "dd/MM/yyyy")}
              </p>
            )}
          </div>
          
          {/* Tags */}
          <div className="p-3 border-b">
            <h3 className="text-xs font-medium mb-2">Tags</h3>
            <div className="flex flex-wrap gap-1">
              {contactData.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="bg-accent text-accent-foreground text-xs py-0">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Informações da Conversa Atual */}
          <div className="p-3 border-b">
            <h3 className="text-xs font-medium mb-2">Conversa Atual</h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID:</span>
                <span>{conversationData.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Iniciada em:</span>
                <span>{format(conversationData.startDate, "dd/MM/yyyy")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Atendentes anteriores:</span>
                <span>{conversationData.previousAgents.join(", ")}</span>
              </div>
              <Separator className="my-2" />
              <div>
                <span className="text-muted-foreground block mb-1">Tags da conversa:</span>
                <div className="flex flex-wrap gap-1">
                  {conversationData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs py-0">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Última compra */}
          <div className="p-3 border-b">
            <h3 className="text-xs font-medium mb-2">Última compra</h3>
            <p className="text-xs mb-1">
              <strong>Produto:</strong> {contactData.lastPurchase.product}
            </p>
            <p className="text-xs mb-1">
              <strong>Valor:</strong> R$ {contactData.lastPurchase.value.toFixed(2)}
            </p>
            <p className="text-xs">
              <strong>Data:</strong> {format(contactData.lastPurchase.date, "dd/MM/yyyy")}
            </p>
            <Separator className="my-2" />
            <p className="text-xs flex justify-between">
              <span>Status de pagamento:</span>
              <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 text-xs py-0">
                {contactData.paymentStatus}
              </Badge>
            </p>
          </div>
          
          {/* Notas */}
          <div className="p-3">
            <h3 className="text-xs font-medium mb-1">Notas</h3>
            <p className="text-xs text-muted-foreground">
              {contactData.notes}
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="p-0 m-0">
          <div className="p-3 border-b">
            <h3 className="text-xs font-medium mb-2">Histórico de Interações</h3>
            <div className="space-y-3">
              {/* Timeline de interações simuladas */}
              <div className="relative pl-4 pb-3 border-l-2 border-muted">
                <div className="absolute left-[-4px] top-1 h-2 w-2 rounded-full bg-primary"></div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">Atendimento Finalizado</span>
                    <span className="text-muted-foreground">7 dias atrás</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Conversa sobre devolução de produto finalizada por Carlos Mendes.
                  </p>
                </div>
              </div>
              <div className="relative pl-4 pb-3 border-l-2 border-muted">
                <div className="absolute left-[-4px] top-1 h-2 w-2 rounded-full bg-muted"></div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">Compra Realizada</span>
                    <span className="text-muted-foreground">30 dias atrás</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Compra de Assinatura Premium (Anual) no valor de R$ 249,90
                  </p>
                </div>
              </div>
              <div className="relative pl-4 pb-3 border-l-2 border-muted">
                <div className="absolute left-[-4px] top-1 h-2 w-2 rounded-full bg-muted"></div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">Nota Adicionada</span>
                    <span className="text-muted-foreground">45 dias atrás</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    "Cliente demonstrou interesse em upgrade de plano." - por João da Silva
                  </p>
                </div>
              </div>
              <div className="relative pl-4 pb-0 border-l-2 border-muted">
                <div className="absolute left-[-4px] top-1 h-2 w-2 rounded-full bg-muted"></div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">Cadastro Realizado</span>
                    <span className="text-muted-foreground">{format(contactData.joinDate, "dd/MM/yyyy")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Contato cadastrado no sistema por {contactData.owner}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="deals" className="p-0 m-0">
          <div className="p-3 border-b">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-medium">Negócios Associados</h3>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                <Plus className="h-3 w-3 mr-1" />
                Novo Negócio
              </Button>
            </div>
            
            {/* Lista de negócios simulados */}
            <div className="space-y-3">
              <div className="rounded-md border p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-xs font-medium">Upgrade para Plano Enterprise</h4>
                    <p className="text-xs text-muted-foreground">R$ 5.999,00 - Em negociação</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs py-0">
                    Negociação
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs text-muted-foreground">Estimativa para fechar: 15 dias</span>
                </div>
              </div>
              
              <div className="rounded-md border p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-xs font-medium">Assinatura Premium (Anual)</h4>
                    <p className="text-xs text-muted-foreground">R$ 249,90 - Fechado</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs py-0">
                    Ganho
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Fechado em: 30/09/2023</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-3">
            <h3 className="text-xs font-medium mb-2">Estatísticas</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Total em negócios:</span>
                <span className="text-xs font-medium">R$ 6.248,90</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Taxa de conversão:</span>
                <span className="text-xs font-medium">50%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Ticket médio:</span>
                <span className="text-xs font-medium">R$ 3.124,45</span>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="ia" className="p-0 m-0">
          <div className="p-3 border-b">
            <h3 className="text-xs font-medium mb-2">Análise de Sentimento</h3>
            <div className="rounded-md border p-3 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs">Sentimento predominante:</span>
                <Badge 
                  variant="outline"
                  className={`text-xs py-0 ${
                    sentimentAnalysis.sentiment === "positive" 
                      ? "bg-green-50 text-green-700 border-green-200" 
                      : sentimentAnalysis.sentiment === "neutral" 
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {sentimentAnalysis.sentiment === "positive" 
                    ? "Positivo" 
                    : sentimentAnalysis.sentiment === "neutral" 
                      ? "Neutro" 
                      : "Negativo"}
                </Badge>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs">Confiança da análise:</span>
                <span className="text-xs font-medium">{sentimentAnalysis.confidence}%</span>
              </div>
              <div>
                <span className="text-xs block mb-1">Palavras-chave identificadas:</span>
                <div className="flex flex-wrap gap-1">
                  {sentimentAnalysis.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs py-0">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <h3 className="text-xs font-medium mb-2">Recomendações</h3>
            <div className="space-y-2">
              <div className="rounded-md border p-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <BarChart className="h-3 w-3 mr-1 text-muted-foreground" />
                    <span className="text-xs">Probabilidade de renovação:</span>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 text-xs py-0">
                    Alta (85%)
                  </Badge>
                </div>
              </div>
              
              <div className="rounded-md border p-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1 text-muted-foreground" />
                    <span className="text-xs">Risco de cancelamento:</span>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 text-xs py-0">
                    Baixo (15%)
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-3">
            <h3 className="text-xs font-medium mb-2">Artigos Recomendados</h3>
            <div className="space-y-2">
              {relatedArticles.map((article) => (
                <div key={article.id} className="rounded-md border p-2 flex justify-between items-center">
                  <span className="text-xs">{article.title}</span>
                  <Badge variant="outline" className="text-xs py-0">
                    {article.relevance}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContactDetail;