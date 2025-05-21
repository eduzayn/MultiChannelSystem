import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus } from "lucide-react";
import AutomationsList from "./components/AutomationsList";
import AutomationTemplates from "./components/AutomationTemplates";
import StatsCards from "./components/StatsCards";

const AutomationsModule = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Dados para os cards de estatísticas
  const statsData = {
    totalWorkflows: 12,
    activeContacts: 843,
    actions24h: 2154,
    withErrors: 2
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Automações (Workflows)</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Automação
        </Button>
      </div>

      <StatsCards 
        totalWorkflows={statsData.totalWorkflows}
        activeContacts={statsData.activeContacts}
        actions24h={statsData.actions24h}
        withErrors={statsData.withErrors}
      />

      <div className="relative w-full">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar automações..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="todas" className="w-full">
        <TabsList>
          <TabsTrigger value="todas" onClick={() => setActiveTab("all")}>
            Todas
          </TabsTrigger>
          <TabsTrigger value="ativas" onClick={() => setActiveTab("active")}>
            Ativas
          </TabsTrigger>
          <TabsTrigger value="rascunhos" onClick={() => setActiveTab("draft")}>
            Rascunhos
          </TabsTrigger>
          <TabsTrigger value="erros" onClick={() => setActiveTab("error")}>
            Com Erros
          </TabsTrigger>
          <TabsTrigger value="templates">
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="mt-6">
          <AutomationsList filterStatus="all" searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="ativas" className="mt-6">
          <AutomationsList filterStatus="active" searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="rascunhos" className="mt-6">
          <AutomationsList filterStatus="draft" searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="erros" className="mt-6">
          <AutomationsList filterStatus="error" searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <AutomationTemplates />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomationsModule;