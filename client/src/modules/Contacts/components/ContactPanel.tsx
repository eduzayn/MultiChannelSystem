import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConversationItemProps } from "@/modules/Inbox/components/ConversationItem";
import { Mail, Phone, User, Building2, Tag, MapPin, Clock, CalendarClock, MoreHorizontal } from "lucide-react";

interface ContactPanelProps {
  conversation: ConversationItemProps;
}

export const ContactPanel = ({ conversation }: ContactPanelProps) => {
  // Mock data
  const contactInfo = {
    email: "maria.santos@email.com",
    phone: "+55 (11) 98765-4321",
    address: "Rua das Flores, 123 - São Paulo, SP",
    company: "Empresa ABC Ltda.",
    position: "Gerente de Marketing",
    tags: ["Cliente VIP", "Contrato Ativo", "Suporte Premium"],
    firstContact: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 dias atrás
    lastContact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
    totalConversations: 12,
    totalPurchases: 3,
    lifetimeValue: "R$ 2.350,00"
  };

  // Histórico de interações
  const interactions = [
    {
      id: "1",
      type: "message",
      channel: "whatsapp",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      description: "Solicitou informações sobre o status do pedido #1234"
    },
    {
      id: "2",
      type: "purchase",
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      description: "Comprou Produto X - R$ 750,00"
    },
    {
      id: "3",
      type: "message",
      channel: "email",
      date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      description: "Respondeu pesquisa de satisfação com NPS 9"
    },
    {
      id: "4",
      type: "call",
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      description: "Ligação de suporte técnico - 12min"
    }
  ];

  // Dados adicionais
  const additionalData = [
    { label: "ID do Cliente", value: "CL-" + Math.floor(Math.random() * 10000) },
    { label: "Segmento", value: "B2B" },
    { label: "Origem", value: "Site" },
    { label: "Atendente Responsável", value: "Carlos Silva" }
  ];

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      {/* Cabeçalho */}
      <div className="p-3 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Informações de Contato</h3>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-col items-center mb-3">
          <div className="relative mb-2">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
              {conversation.avatar ? (
                <img 
                  src={conversation.avatar} 
                  alt={conversation.name} 
                  className="h-full w-full rounded-full object-cover" 
                />
              ) : (
                <User className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className={`absolute -right-1 -bottom-1 w-4 h-4 rounded-full border-2 border-background ${
              conversation.channel === 'whatsapp' 
                ? 'bg-green-500' 
                : conversation.channel === 'instagram' 
                  ? 'bg-pink-500' 
                  : conversation.channel === 'facebook' 
                    ? 'bg-blue-600' 
                    : 'bg-yellow-500'
            }`} />
          </div>
          <h2 className="font-medium text-sm">{conversation.name}</h2>
          <p className="text-xs text-muted-foreground">{contactInfo.position}</p>
          <div className="flex flex-wrap gap-1 mt-1 justify-center">
            {contactInfo.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0 h-5">
                {tag}
              </Badge>
            ))}
            {contactInfo.tags.length > 2 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                +{contactInfo.tags.length - 2}
              </Badge>
            )}
          </div>
        </div>
        <div className="grid gap-1.5 text-xs">
          <div className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-xs break-words">{contactInfo.email}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-xs break-words">{contactInfo.phone}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-xs break-words">{contactInfo.company}</span>
          </div>
        </div>
      </div>

      {/* Tabs de dados */}
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="info" className="text-xs">Informações</TabsTrigger>
            <TabsTrigger value="history" className="text-xs">Histórico</TabsTrigger>
            <TabsTrigger value="deals" className="text-xs">Negócios</TabsTrigger>
          </TabsList>
          <div className="p-4">
            <TabsContent value="info" className="mt-0 space-y-4">
              <Card className="p-3">
                <h4 className="text-xs font-medium mb-2">Informações de Contato</h4>
                <div className="grid gap-2 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-xs break-words">{contactInfo.address}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs">Primeiro contato:</span>
                    </div>
                    <span className="text-xs ml-1">{contactInfo.firstContact.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs">Último contato:</span>
                    </div>
                    <span className="text-xs ml-1">{contactInfo.lastContact.toLocaleDateString()}</span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <h4 className="text-xs font-medium mb-2">Métricas do Cliente</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-muted/30 p-2 rounded">
                    <div className="text-muted-foreground text-xs">Conversas</div>
                    <div className="font-semibold text-xs">{contactInfo.totalConversations}</div>
                  </div>
                  <div className="bg-muted/30 p-2 rounded">
                    <div className="text-muted-foreground text-xs">Compras</div>
                    <div className="font-semibold text-xs">{contactInfo.totalPurchases}</div>
                  </div>
                  <div className="bg-primary/10 p-2 rounded col-span-2">
                    <div className="text-muted-foreground text-xs">Valor Total</div>
                    <div className="font-semibold text-xs text-primary">{contactInfo.lifetimeValue}</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <h4 className="text-xs font-medium mb-2">Dados Adicionais</h4>
                <div className="grid gap-2 text-xs">
                  {additionalData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs">{item.label}:</span>
                      <span className="text-xs ml-1 text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="mt-0">
              <div className="space-y-2">
                {interactions.map((interaction) => (
                  <Card key={interaction.id} className="p-3">
                    <div className="flex items-start gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        interaction.type === 'message' 
                          ? 'bg-primary-50' 
                          : interaction.type === 'purchase' 
                            ? 'bg-success-50' 
                            : 'bg-warning-50'
                      }`}>
                        {interaction.type === 'message' ? (
                          <Mail className="h-4 w-4 text-primary-500" />
                        ) : interaction.type === 'purchase' ? (
                          <Tag className="h-4 w-4 text-success-500" />
                        ) : (
                          <Phone className="h-4 w-4 text-warning-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">
                            {interaction.type === 'message' 
                              ? `Mensagem via ${interaction.channel}` 
                              : interaction.type === 'purchase' 
                                ? 'Compra realizada' 
                                : 'Chamada telefônica'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {interaction.date.toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{interaction.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="deals" className="mt-0">
              <div className="p-8 flex flex-col items-center justify-center text-center bg-muted/30 rounded-md">
                <Building2 className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-sm font-medium mb-1">Nenhum negócio ativo</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Este contato ainda não possui negócios em andamento.
                </p>
                <Button size="sm" variant="default" className="text-xs">
                  Criar Novo Negócio
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};