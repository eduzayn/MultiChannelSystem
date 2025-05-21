import React, { useState } from "react";
import { ZAPIIntegration } from "./components/ZAPIIntegration";
import { AddChannelWizard } from "./components/AddChannelWizard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; 
import { MessageSquare, Instagram, Mail } from "lucide-react";

export const ChannelsSettingsModule = () => {
  const [openAddChannelWizard, setOpenAddChannelWizard] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Função para forçar atualização dos canais após adicionar um novo
  const handleChannelAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Canais de Comunicação</h2>
          <p className="text-muted-foreground">
            Configure os canais de comunicação com seus clientes
          </p>
        </div>
        <Button onClick={() => setOpenAddChannelWizard(true)}>
          Adicionar Novo Canal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-500" />
              <CardTitle className="text-base">WhatsApp</CardTitle>
            </div>
            <CardDescription>Conecte seu WhatsApp via Z-API</CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Instagram className="h-5 w-5 text-pink-500" />
              <CardTitle className="text-base">Instagram Direct</CardTitle>
            </div>
            <CardDescription>Em breve</CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-base">Email</CardTitle>
            </div>
            <CardDescription>Em breve</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Componente de integração Z-API */}
      <ZAPIIntegration key={`zapi-integration-${refreshTrigger}`} />
      
      {/* Wizard de adição de novos canais */}
      <AddChannelWizard 
        open={openAddChannelWizard} 
        onOpenChange={setOpenAddChannelWizard}
        onChannelAdded={handleChannelAdded}
      />
    </div>
  );
};