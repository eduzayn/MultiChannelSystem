import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const LocalizationSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Localização e Idioma</CardTitle>
        <CardDescription>
          Configure as preferências regionais do seu sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="timezone">Fuso Horário Padrão</Label>
            <Select defaultValue="America/Sao_Paulo">
              <SelectTrigger>
                <SelectValue placeholder="Selecione o fuso horário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/Sao_Paulo">(GMT-03:00) America/Sao_Paulo</SelectItem>
                <SelectItem value="America/Fortaleza">(GMT-03:00) America/Fortaleza</SelectItem>
                <SelectItem value="America/Manaus">(GMT-04:00) America/Manaus</SelectItem>
                <SelectItem value="America/Rio_Branco">(GMT-05:00) America/Rio_Branco</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              Define como datas e horas são exibidas no sistema
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Idioma Principal</Label>
            <Select defaultValue="pt_BR">
              <SelectTrigger>
                <SelectValue placeholder="Selecione o idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt_BR">Português (Brasil)</SelectItem>
                <SelectItem value="en_US">English (United States)</SelectItem>
                <SelectItem value="es_ES">Español</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              Define o idioma padrão para novos usuários
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Moeda Padrão</Label>
            <Select defaultValue="BRL">
              <SelectTrigger>
                <SelectValue placeholder="Selecione a moeda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">Real (R$)</SelectItem>
                <SelectItem value="USD">Dólar Americano ($)</SelectItem>
                <SelectItem value="EUR">Euro (€)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              Define como valores monetários são formatados
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateFormat">Formato de Data</Label>
            <Select defaultValue="DD/MM/AAAA">
              <SelectTrigger>
                <SelectValue placeholder="Selecione o formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/AAAA">DD/MM/AAAA</SelectItem>
                <SelectItem value="MM/DD/AAAA">MM/DD/AAAA</SelectItem>
                <SelectItem value="AAAA-MM-DD">AAAA-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeFormat">Formato de Hora</Label>
            <Select defaultValue="24h">
              <SelectTrigger>
                <SelectValue placeholder="Selecione o formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 horas (14:30)</SelectItem>
                <SelectItem value="12h">12 horas (2:30 PM)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">País Padrão</Label>
            <Select defaultValue="BR">
              <SelectTrigger>
                <SelectValue placeholder="Selecione o país" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BR">Brasil</SelectItem>
                <SelectItem value="US">Estados Unidos</SelectItem>
                <SelectItem value="PT">Portugal</SelectItem>
                <SelectItem value="ES">Espanha</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="pt-4">
          <Button>Salvar Configurações Regionais</Button>
        </div>
      </CardContent>
    </Card>
  );
};