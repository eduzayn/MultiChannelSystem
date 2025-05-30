import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Tag, LineChart, Settings, Star, Users, Mail } from "lucide-react";
import { CustomFieldsTab } from "./components/CustomFieldsTab";
import { TagsTab } from "./components/TagsTab";
import { SalesFunnelsTab } from "./components/SalesFunnelsTab";
import { LeadScoringTab } from "./components/LeadScoringTab";
import { AssignmentRulesTab } from "./components/AssignmentRulesTab";
import { EmailPreferencesTab } from "./components/EmailPreferencesTab";

export const CRMSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do CRM</CardTitle>
        <CardDescription>
          Personalize e configure os módulos de Contatos, Empresas, Negócios e outras funcionalidades do seu CRM
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="fields" className="w-full">
          <TabsList className="mb-4 w-full justify-start overflow-x-auto">
            <TabsTrigger value="fields" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Campos Personalizados</span>
            </TabsTrigger>
            <TabsTrigger value="tags" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>Tags Globais</span>
            </TabsTrigger>
            <TabsTrigger value="funnels" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              <span>Funis de Vendas</span>
            </TabsTrigger>
            <TabsTrigger value="scoring" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>Pontuação de Leads</span>
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Regras de Atribuição</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>Preferências de Email</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="fields">
            <CustomFieldsTab />
          </TabsContent>
          
          <TabsContent value="tags">
            <TagsTab />
          </TabsContent>
          
          <TabsContent value="funnels">
            <SalesFunnelsTab />
          </TabsContent>
          
          <TabsContent value="scoring">
            <LeadScoringTab />
          </TabsContent>
          
          <TabsContent value="assignments">
            <AssignmentRulesTab />
          </TabsContent>
          
          <TabsContent value="email">
            <EmailPreferencesTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}