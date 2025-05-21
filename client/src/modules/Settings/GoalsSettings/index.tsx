import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Cog, 
  Goal, 
  Trophy, 
  Bell, 
  Star
} from "lucide-react";

// Importando componentes específicos para cada seção
import { GeneralConfig } from "./components/GeneralConfig";
import { GoalsManagement } from "./components/GoalsManagement";
import { AchievementsManagement } from "./components/AchievementsManagement";
import { NotificationsConfig } from "./components/NotificationsConfig";
import { RewardsManagement } from "./components/RewardsManagement";

export const GoalsSettings = () => {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metas e Gamificação</CardTitle>
        <CardDescription>
          Configure metas, conquistas e elementos de gamificação para engajar sua equipe
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 w-full justify-start overflow-x-auto">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Cog className="h-4 w-4" />
              <span>Configuração Geral</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Goal className="h-4 w-4" />
              <span>Gestão de Metas</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span>Conquistas</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span>Notificações e Celebrações</span>
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>Recompensas</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <GeneralConfig />
          </TabsContent>
          
          <TabsContent value="goals">
            <GoalsManagement />
          </TabsContent>
          
          <TabsContent value="achievements">
            <AchievementsManagement />
          </TabsContent>
          
          <TabsContent value="notifications">
            <NotificationsConfig />
          </TabsContent>
          
          <TabsContent value="rewards">
            <RewardsManagement />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};