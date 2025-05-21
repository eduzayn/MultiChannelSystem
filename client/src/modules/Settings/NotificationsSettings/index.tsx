import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Bell, BellOff, Settings, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  active: boolean;
  category: string;
  channels: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
    chatInternal: boolean;
    push: boolean;
  };
  recipients: string[];
}

export const NotificationsSettings = () => {
  const [activeTab, setActiveTab] = useState("inbox");
  const [editingNotification, setEditingNotification] = useState<NotificationItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Mock data for notifications
  const notifications: NotificationItem[] = [
    // Inbox & Attendance notifications
    {
      id: "new-conversation",
      title: "Nova Conversa Recebida",
      description: "Notifica quando uma nova conversa é recebida e não está atribuída a ninguém",
      active: true,
      category: "inbox",
      channels: { inApp: true, email: true, sms: false, chatInternal: false, push: true },
      recipients: ["triageTeam"]
    },
    {
      id: "conversation-assigned",
      title: "Conversa Atribuída",
      description: "Notifica agentes quando uma conversa é atribuída a eles",
      active: true,
      category: "inbox",
      channels: { inApp: true, email: true, sms: false, chatInternal: false, push: true },
      recipients: ["assignedAgent"]
    },
    {
      id: "new-message-offline",
      title: "Nova Mensagem (Agente Offline)",
      description: "Notifica agentes sobre novas mensagens recebidas quando estão offline",
      active: true,
      category: "inbox",
      channels: { inApp: false, email: true, sms: false, chatInternal: false, push: true },
      recipients: ["assignedAgent", "teamManager"]
    },
    {
      id: "sla-first-response",
      title: "SLA de Primeira Resposta",
      description: "Alerta quando uma conversa está próxima de violar o SLA de primeira resposta",
      active: true,
      category: "inbox",
      channels: { inApp: true, email: false, sms: false, chatInternal: true, push: false },
      recipients: ["assignedAgent", "teamManager"]
    },
    
    // CRM notifications
    {
      id: "new-lead-assigned",
      title: "Novo Lead Atribuído ao Agente",
      description: "Notifica agentes quando um novo lead é atribuído a eles",
      active: true,
      category: "crm",
      channels: { inApp: true, email: true, sms: false, chatInternal: false, push: false },
      recipients: ["assignedAgent"]
    },
    {
      id: "task-due",
      title: "Tarefa Vencendo",
      description: "Notifica sobre tarefas que estão prestes a vencer",
      active: true,
      category: "crm",
      channels: { inApp: true, email: true, sms: false, chatInternal: false, push: false },
      recipients: ["taskOwner"]
    },
    {
      id: "deal-stage-changed",
      title: "Negócio Mudou de Etapa",
      description: "Notifica quando um negócio muda de etapa no funil de vendas",
      active: false,
      category: "crm",
      channels: { inApp: true, email: false, sms: false, chatInternal: true, push: false },
      recipients: ["dealOwner", "salesManager"]
    },
    
    // Marketing notifications
    {
      id: "campaign-started",
      title: "Campanha Iniciada",
      description: "Notifica quando uma campanha agendada começa a enviar mensagens",
      active: true,
      category: "marketing",
      channels: { inApp: true, email: false, sms: false, chatInternal: false, push: false },
      recipients: ["campaignCreator", "marketingTeam"]
    },
    {
      id: "campaign-completed",
      title: "Campanha Concluída",
      description: "Notifica quando uma campanha é concluída com métricas básicas",
      active: true,
      category: "marketing",
      channels: { inApp: true, email: true, sms: false, chatInternal: false, push: false },
      recipients: ["campaignCreator", "marketingTeam"]
    },
    
    // Goals notifications
    {
      id: "goal-progress",
      title: "Progresso de Meta",
      description: "Notifica quando o progresso de uma meta atinge marcos importantes",
      active: true,
      category: "goals",
      channels: { inApp: true, email: false, sms: false, chatInternal: true, push: false },
      recipients: ["goalOwner", "teamManager"]
    },
    {
      id: "goal-achieved",
      title: "Meta Alcançada",
      description: "Celebra quando uma meta individual ou de equipe é alcançada",
      active: true,
      category: "goals",
      channels: { inApp: true, email: false, sms: false, chatInternal: true, push: false },
      recipients: ["goalOwner", "teamManager", "recognitionPanel"]
    },
    
    // AI notifications
    {
      id: "ai-escalation",
      title: "Escalonamento da IA",
      description: "Notifica quando a IA Prof. Ana não consegue responder a uma pergunta",
      active: true,
      category: "ai",
      channels: { inApp: true, email: false, sms: false, chatInternal: true, push: false },
      recipients: ["aiSupportTeam"]
    },
    {
      id: "ai-negative-feedback",
      title: "Feedback Negativo da IA",
      description: "Notifica quando um usuário dá feedback negativo sobre uma resposta da IA",
      active: true,
      category: "ai",
      channels: { inApp: true, email: true, sms: false, chatInternal: false, push: false },
      recipients: ["aiAdministrators", "contentCurationTeam"]
    },
    
    // Admin notifications
    {
      id: "user-invited",
      title: "Usuário Convidado",
      description: "Notifica quando um novo usuário é convidado para a plataforma",
      active: true,
      category: "admin",
      channels: { inApp: true, email: false, sms: false, chatInternal: false, push: false },
      recipients: ["administrators"]
    },
    {
      id: "password-reset",
      title: "Senha Redefinida",
      description: "Notifica quando a senha de um usuário é redefinida",
      active: true,
      category: "admin",
      channels: { inApp: true, email: false, sms: false, chatInternal: false, push: false },
      recipients: ["administrators"]
    },
    {
      id: "payment-overdue",
      title: "Mensalidade Atrasada",
      description: "Notifica sobre mensalidades de alunos/clientes em atraso",
      active: true,
      category: "admin",
      channels: { inApp: true, email: true, sms: false, chatInternal: false, push: false },
      recipients: ["financialTeam"]
    },
    {
      id: "daily-activity-summary",
      title: "Resumo Diário de Atividades",
      description: "Envia um resumo diário das atividades para gestores",
      active: false,
      category: "admin",
      channels: { inApp: false, email: true, sms: false, chatInternal: false, push: false },
      recipients: ["managers"]
    }
  ];

  const handleEditNotification = (notification: NotificationItem) => {
    setEditingNotification(notification);
    setIsDialogOpen(true);
  };

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    console.log(`Toggling notification ${id} to ${!currentStatus}`);
    toast({
      title: currentStatus ? "Notificação desativada" : "Notificação ativada",
      description: `A configuração foi atualizada com sucesso.`
    });
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingNotification(null);
  };

  const handleSaveNotification = () => {
    if (!editingNotification) return;
    
    console.log("Salvando configurações da notificação:", editingNotification);
    toast({
      title: "Configurações salvas",
      description: "As configurações de notificação foram atualizadas com sucesso."
    });
    
    setIsDialogOpen(false);
    setEditingNotification(null);
  };

  const getRecipientLabel = (recipient: string): string => {
    const recipientMap: Record<string, string> = {
      "assignedAgent": "Agente responsável",
      "teamManager": "Gestor da equipe",
      "taskOwner": "Responsável pela tarefa",
      "dealOwner": "Proprietário do negócio",
      "salesManager": "Gestor de vendas",
      "campaignCreator": "Criador da campanha",
      "marketingTeam": "Equipe de marketing",
      "goalOwner": "Proprietário da meta",
      "recognitionPanel": "Painel de reconhecimento",
      "aiSupportTeam": "Equipe de suporte da IA",
      "aiAdministrators": "Administradores da IA",
      "contentCurationTeam": "Equipe de curadoria de conteúdo",
      "administrators": "Administradores",
      "managers": "Gestores",
      "financialTeam": "Equipe financeira",
      "triageTeam": "Equipe de triagem"
    };

    return recipientMap[recipient] || recipient;
  };

  const filteredNotifications = notifications.filter(
    (notification) => notification.category === activeTab
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Notificações</CardTitle>
        <CardDescription>
          Configure quais notificações o sistema enviará, seus destinatários e canais de comunicação
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="inbox" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-7">
            <TabsTrigger value="inbox">Caixa de Entrada</TabsTrigger>
            <TabsTrigger value="crm">CRM</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="goals">Metas</TabsTrigger>
            <TabsTrigger value="ai">IA - Prof. Ana</TabsTrigger>
            <TabsTrigger value="admin">Administração</TabsTrigger>
            <TabsTrigger value="templates">Modelos</TabsTrigger>
          </TabsList>

          {["inbox", "crm", "marketing", "goals", "ai", "admin"].map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue}>
              <div className="border rounded-md divide-y">
                {filteredNotifications.map((notification) => (
                  <div key={notification.id} className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {notification.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditNotification(notification)}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Configurar
                      </Button>
                      <div className="flex items-center gap-2">
                        <span className={`${notification.active ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'} text-xs font-medium px-2.5 py-0.5 rounded-full`}>
                          {notification.active ? 'Ativo' : 'Desativado'}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleToggleActive(notification.id, notification.active)}
                        >
                          {notification.active ? 
                            <Bell className="h-4 w-4" /> : 
                            <BellOff className="h-4 w-4" />
                          }
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}

          <TabsContent value="templates">
            <div className="space-y-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Modelos de Notificação</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure modelos personalizados para diferentes tipos de notificação.
                  Use variáveis como <code>{'{{nome}}'}</code>, <code>{'{{data}}'}</code>, etc.
                </p>
                <Button variant="outline">
                  Gerenciar Modelos de Notificação
                </Button>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Frequência e Horários</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure com que frequência as notificações são enviadas e em quais horários.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="digest-mode" className="flex-grow">
                      Habilitar modo resumo
                      <p className="text-xs text-muted-foreground">
                        Agrupa múltiplas notificações em um único envio
                      </p>
                    </Label>
                    <Checkbox id="digest-mode" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="work-hours-only" className="flex-grow">
                      Apenas em horário comercial
                      <p className="text-xs text-muted-foreground">
                        Enviar notificações somente entre 8h e 18h
                      </p>
                    </Label>
                    <Checkbox id="work-hours-only" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="user-timezone" className="flex-grow">
                      Respeitar fuso horário do usuário
                    </Label>
                    <Checkbox id="user-timezone" defaultChecked />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Modal de edição de notificação */}
      {editingNotification && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Configurar Notificação</DialogTitle>
              <DialogDescription>
                Ajuste como e para quem esta notificação será enviada
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">{editingNotification.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {editingNotification.description}
                </p>
              </div>
              
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notification-active" className="flex-grow">
                    Status da Notificação
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className={`${editingNotification.active ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'} text-xs font-medium px-2.5 py-0.5 rounded-full`}>
                      {editingNotification.active ? 'Ativo' : 'Desativado'}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        if (editingNotification) {
                          setEditingNotification({
                            ...editingNotification,
                            active: !editingNotification.active
                          });
                        }
                      }}
                    >
                      {editingNotification.active ? 
                        <Bell className="h-4 w-4" /> : 
                        <BellOff className="h-4 w-4" />
                      }
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-base">Canais de Entrega</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="channel-inapp" 
                        checked={editingNotification.channels.inApp}
                        onCheckedChange={(checked) => {
                          if (editingNotification) {
                            setEditingNotification({
                              ...editingNotification,
                              channels: {
                                ...editingNotification.channels,
                                inApp: checked as boolean
                              }
                            });
                          }
                        }}
                      />
                      <Label htmlFor="channel-inapp">No aplicativo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="channel-email" 
                        checked={editingNotification.channels.email}
                        onCheckedChange={(checked) => {
                          if (editingNotification) {
                            setEditingNotification({
                              ...editingNotification,
                              channels: {
                                ...editingNotification.channels,
                                email: checked as boolean
                              }
                            });
                          }
                        }}
                      />
                      <Label htmlFor="channel-email">E-mail</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="channel-sms" 
                        checked={editingNotification.channels.sms}
                        onCheckedChange={(checked) => {
                          if (editingNotification) {
                            setEditingNotification({
                              ...editingNotification,
                              channels: {
                                ...editingNotification.channels,
                                sms: checked as boolean
                              }
                            });
                          }
                        }}
                      />
                      <Label htmlFor="channel-sms">SMS</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="channel-chat" 
                        checked={editingNotification.channels.chatInternal}
                        onCheckedChange={(checked) => {
                          if (editingNotification) {
                            setEditingNotification({
                              ...editingNotification,
                              channels: {
                                ...editingNotification.channels,
                                chatInternal: checked as boolean
                              }
                            });
                          }
                        }}
                      />
                      <Label htmlFor="channel-chat">Chat Interno</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="channel-push" 
                        checked={editingNotification.channels.push}
                        onCheckedChange={(checked) => {
                          if (editingNotification) {
                            setEditingNotification({
                              ...editingNotification,
                              channels: {
                                ...editingNotification.channels,
                                push: checked as boolean
                              }
                            });
                          }
                        }}
                      />
                      <Label htmlFor="channel-push">Push Notification</Label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-base">Destinatários</Label>
                  <div className="border rounded-md p-2">
                    {editingNotification.recipients.map((recipient, index) => (
                      <div key={index} className="flex items-center py-1">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span>{getRecipientLabel(recipient)}</span>
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" className="mt-2 w-full text-center text-sm">
                      + Adicionar outros destinatários
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
              <Button onClick={handleSaveNotification}>Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};