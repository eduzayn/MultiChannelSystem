import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const NotificationsConfig = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Notificações e Celebrações</h2>
        <p className="text-muted-foreground">
          Configure como e quando os usuários serão notificados sobre suas metas e conquistas
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notificações de Metas</CardTitle>
          <CardDescription>Defina quando os usuários serão notificados sobre suas metas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notify-meta-atribuida">Meta Atribuída</Label>
              <p className="text-sm text-muted-foreground">
                Notificar quando uma nova meta for atribuída ao usuário
              </p>
            </div>
            <Switch id="notify-meta-atribuida" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notify-meta-atualizada">Meta Atualizada</Label>
              <p className="text-sm text-muted-foreground">
                Notificar quando os parâmetros de uma meta forem modificados
              </p>
            </div>
            <Switch id="notify-meta-atualizada" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notify-progresso">Progresso Significativo</Label>
              <p className="text-sm text-muted-foreground">
                Notificar quando houver progresso significativo em uma meta
              </p>
            </div>
            <Switch id="notify-progresso" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notify-risco">Meta em Risco</Label>
              <p className="text-sm text-muted-foreground">
                Notificar quando uma meta estiver em risco de não ser cumprida
              </p>
            </div>
            <Switch id="notify-risco" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notify-conclusao">Meta Concluída</Label>
              <p className="text-sm text-muted-foreground">
                Notificar quando uma meta for concluída com sucesso
              </p>
            </div>
            <Switch id="notify-conclusao" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notify-prazo">Prazo Próximo</Label>
              <p className="text-sm text-muted-foreground">
                Notificar quando o prazo de uma meta estiver próximo
              </p>
            </div>
            <Switch id="notify-prazo" defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Celebrações e Reconhecimentos</CardTitle>
          <CardDescription>Configure como os sucessos serão celebrados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="public-celebration">Celebração Pública</Label>
              <p className="text-sm text-muted-foreground">
                Exibir conquistas e marcos importantes para toda a equipe
              </p>
            </div>
            <Switch id="public-celebration" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="announcement">Anúncios Gerais</Label>
              <p className="text-sm text-muted-foreground">
                Enviar anúncios para canais de comunicação da empresa
              </p>
            </div>
            <Switch id="announcement" defaultChecked />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="celebration-channels">Canais para Anúncios</Label>
            <Select defaultValue="all">
              <SelectTrigger id="celebration-channels">
                <SelectValue placeholder="Selecione os canais" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os canais</SelectItem>
                <SelectItem value="chat">Apenas chat interno</SelectItem>
                <SelectItem value="email">Apenas email</SelectItem>
                <SelectItem value="dashboard">Apenas dashboard</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="celebration-message">Modelo de Mensagem de Celebração</Label>
            <Textarea 
              id="celebration-message" 
              placeholder="Modelo de mensagem para celebrar conquistas..."
              defaultValue="Parabéns a {nome} por atingir {meta_nome}! 🎉 Esse é mais um exemplo do nosso compromisso com a excelência!"
              rows={3}
            />
            <p className="text-sm text-muted-foreground">
              Use {nome} para o nome do usuário, {meta_nome} para o nome da meta, {valor} para o valor atingido.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Frequência de Notificações</CardTitle>
          <CardDescription>Defina com que frequência as notificações serão enviadas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prazo-notificacao">Antecedência para Notificação de Prazo</Label>
            <div className="flex items-center gap-2">
              <Input 
                id="prazo-notificacao" 
                type="number" 
                defaultValue="3"
                className="w-20"
              />
              <Select defaultValue="days">
                <SelectTrigger id="prazo-notificacao-unidade" className="w-32">
                  <SelectValue placeholder="Unidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">Dias</SelectItem>
                  <SelectItem value="weeks">Semanas</SelectItem>
                  <SelectItem value="months">Meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="limite-notificacoes">Limite de Notificações por Dia</Label>
            <Input 
              id="limite-notificacoes" 
              type="number" 
              defaultValue="5"
              className="w-20"
            />
            <p className="text-sm text-muted-foreground">
              Número máximo de notificações que um usuário receberá por dia
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="horario-notificacoes">Horário Preferencial para Notificações</Label>
            <Select defaultValue="work-hours">
              <SelectTrigger id="horario-notificacoes">
                <SelectValue placeholder="Selecione o horário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work-hours">Horário comercial (8h às 18h)</SelectItem>
                <SelectItem value="morning">Apenas pela manhã</SelectItem>
                <SelectItem value="afternoon">Apenas à tarde</SelectItem>
                <SelectItem value="anytime">Qualquer horário</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">Salvar Alterações</Button>
      </div>
    </div>
  );
};