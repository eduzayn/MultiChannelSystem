import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Shield, Building2 } from "lucide-react";
import { UsersTab } from "./components/UsersTab";
import { RolesTab } from "./components/RolesTab";
import { TeamsTab } from "./components/TeamsTab";

export const UsersSettings = () => {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Usuários e Equipes</CardTitle>
        <CardDescription>
          Gerencie usuários, papéis de permissões e estrutura de equipes da sua organização.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue="users" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="mb-4 w-full justify-start overflow-x-auto">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Usuários</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Papéis e Permissões</span>
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>Equipes</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersTab />
          </TabsContent>

          <TabsContent value="roles">
            <RolesTab />
          </TabsContent>

          <TabsContent value="teams">
            <TeamsTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};