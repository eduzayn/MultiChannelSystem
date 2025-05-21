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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const GeneralConfig = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Configurações Gerais</h2>
        <p className="text-muted-foreground">
          Configure os parâmetros gerais do sistema de metas e gamificação
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status do Módulo</CardTitle>
          <CardDescription>Ativar ou desativar o módulo de metas e gamificação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-goals">Ativar Módulo de Metas</Label>
              <p className="text-sm text-muted-foreground">
                Permite o gerenciamento e visualização de metas de desempenho
              </p>
            </div>
            <Switch id="enable-goals" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-gamification">Ativar Gamificação</Label>
              <p className="text-sm text-muted-foreground">
                Ativa elementos de gamificação como pontos, insígnias e níveis
              </p>
            </div>
            <Switch id="enable-gamification" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-public-recognition">Painel de Reconhecimento Público</Label>
              <p className="text-sm text-muted-foreground">
                Exibe conquistas e reconhecimentos para toda a equipe
              </p>
            </div>
            <Switch id="enable-public-recognition" defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Períodos e Ciclos</CardTitle>
          <CardDescription>Configure os ciclos padrão para as metas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="default-goal-period">Período Padrão para Metas</Label>
              <Select defaultValue="quarterly">
                <SelectTrigger id="default-goal-period">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="annually">Anual</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reset-frequency">Frequência de Reinício de Pontos</Label>
              <Select defaultValue="never">
                <SelectTrigger id="reset-frequency">
                  <SelectValue placeholder="Selecione a frequência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="annually">Anual</SelectItem>
                  <SelectItem value="never">Nunca (acumulativo)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configurações de Visualização</CardTitle>
          <CardDescription>Defina como as informações são exibidas para os usuários</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-goal-progress">Mostrar Progresso das Metas</Label>
              <p className="text-sm text-muted-foreground">
                Exibe barras de progresso e percentuais para as metas
              </p>
            </div>
            <Switch id="show-goal-progress" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-ranking">Mostrar Ranking de Desempenho</Label>
              <p className="text-sm text-muted-foreground">
                Exibe tabela de classificação dos usuários em relação às metas
              </p>
            </div>
            <Switch id="show-ranking" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="ranking-top-n">Exibir Top N no Ranking</Label>
              <p className="text-sm text-muted-foreground">
                Número de usuários exibidos na tabela de classificação
              </p>
            </div>
            <Input 
              id="ranking-top-n" 
              type="number" 
              defaultValue="10"
              className="w-20"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">Salvar Alterações</Button>
      </div>
    </div>
  );
};