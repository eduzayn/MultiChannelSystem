import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListManagement } from "./components/ListManagement";
import { TemplateLibrary } from "./components/TemplateLibrary";
import { CampaignSettings } from "./components/CampaignSettings";
import { TrackingSettings } from "./components/TrackingSettings";
import { ConsentSettings } from "./components/ConsentSettings";
import { Mail, FileText, Settings, LineChart, Shield } from "lucide-react";

export const MarketingSettings = () => {
  const [activeTab, setActiveTab] = useState("lists");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Marketing</CardTitle>
        <CardDescription>
          Gerencie listas de contatos, modelos de mensagens, configurações de campanhas e outras preferências para otimizar suas ações de marketing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue="lists" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="mb-4 w-full justify-start overflow-x-auto">
            <TabsTrigger value="lists" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>Listas de Contatos</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Modelos de Mensagens</span>
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Campanhas</span>
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              <span>Rastreamento</span>
            </TabsTrigger>
            <TabsTrigger value="consent" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Consentimento</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lists">
            <ListManagement />
          </TabsContent>

          <TabsContent value="templates">
            <TemplateLibrary />
          </TabsContent>

          <TabsContent value="campaigns">
            <CampaignSettings />
          </TabsContent>

          <TabsContent value="tracking">
            <TrackingSettings />
          </TabsContent>

          <TabsContent value="consent">
            <ConsentSettings />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};