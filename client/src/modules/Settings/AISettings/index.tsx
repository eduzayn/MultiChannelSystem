import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "./components/OverviewTab";
import { PersonalityTab } from "./components/PersonalityTab";
import { KnowledgeTab } from "./components/KnowledgeTab";
import { IntegrationsTab } from "./components/IntegrationsTab";
import { ContextRulesTab } from "./components/ContextRulesTab";
import { MonitoringTab } from "./components/MonitoringTab";

export const AISettingsModule = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">IA - Prof. Ana</h1>
        <p className="text-muted-foreground">
          Configure a base de conhecimento e comportamento da IA
        </p>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2"
          >
            Visão Geral
          </TabsTrigger>
          <TabsTrigger 
            value="personality" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2"
          >
            Personalidade
          </TabsTrigger>
          <TabsTrigger 
            value="knowledge" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2"
          >
            Base de Conhecimento
          </TabsTrigger>
          <TabsTrigger 
            value="integrations" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2"
          >
            Integrações
          </TabsTrigger>
          <TabsTrigger 
            value="contexts" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2"
          >
            Contextos e Regras
          </TabsTrigger>
          <TabsTrigger 
            value="monitoring" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2"
          >
            Monitoramento
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>
        
        <TabsContent value="personality">
          <PersonalityTab />
        </TabsContent>
        
        <TabsContent value="knowledge">
          <KnowledgeTab />
        </TabsContent>
        
        <TabsContent value="integrations">
          <IntegrationsTab />
        </TabsContent>
        
        <TabsContent value="contexts">
          <ContextRulesTab />
        </TabsContent>
        
        <TabsContent value="monitoring">
          <MonitoringTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};