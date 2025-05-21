import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Check } from "lucide-react";

export const EmailPreferencesTab = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Preferências de Email do CRM</h2>
        <p className="text-muted-foreground">
          Configure como os emails são tratados em relação ao CRM
        </p>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Registro de Emails</h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="logEmails" />
              <Label htmlFor="logEmails">
                Registrar automaticamente emails no histórico de Contatos/Negócios
              </Label>
            </div>
            
            <div className="ml-6">
              <div className="flex items-center space-x-2">
                <Switch id="excludeInternal" />
                <Label htmlFor="excludeInternal">
                  Excluir emails de domínios internos
                </Label>
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                Emails enviados para/de endereços da sua própria organização não serão registrados no CRM.
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Cópia Oculta (BCC) para o CRM</h3>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch id="enableBcc" />
              <Label htmlFor="enableBcc">
                Habilitar endereço BCC para o CRM
              </Label>
            </div>
            
            <div className="ml-6 space-y-4">
              <p className="text-muted-foreground text-sm">
                Use este endereço de email como BCC em seus emails externos para registrá-los automaticamente no CRM.
              </p>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bccAddress" className="text-right">
                  Endereço BCC
                </Label>
                <div className="col-span-3 flex items-center">
                  <span className="text-muted-foreground">crm-</span>
                  <Input id="bccAddress" defaultValue="bcc" className="mx-1" />
                  <span className="text-muted-foreground">@seudominio.com.br</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Sincronização de Calendário</h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="syncCalendar" />
              <Label htmlFor="syncCalendar">
                Sincronizar reuniões do calendário com o CRM
              </Label>
            </div>
            
            <div className="ml-6 space-y-4">
              <p className="text-muted-foreground text-sm">
                Reuniões com contatos do CRM serão automaticamente registradas como atividades no histórico.
              </p>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="calendarSource" className="text-right">
                  Fonte do Calendário
                </Label>
                <Select defaultValue="google">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione a fonte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">Google Calendar</SelectItem>
                    <SelectItem value="outlook">Microsoft Outlook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="syncFrequency" className="text-right">
                  Frequência
                </Label>
                <Select defaultValue="hourly">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione a frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Tempo Real</SelectItem>
                    <SelectItem value="hourly">A cada hora</SelectItem>
                    <SelectItem value="daily">Diariamente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button variant="outline" className="mt-2">
                Conectar Calendário
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t">
        <Button>
          <Check className="mr-2 h-4 w-4" /> Salvar Preferências
        </Button>
      </div>
    </div>
  );
};