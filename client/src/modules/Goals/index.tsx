import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceRanking } from './components/PerformanceRanking';
import { RecognitionPanel } from './components/RecognitionPanel';
import { MyAchievements } from './components/MyAchievements';

export const Goals = () => {
  const [activeTab, setActiveTab] = useState('performance');

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Metas e Reconhecimento</h1>
          <p className="text-muted-foreground">Acompanhe seu desempenho e o de sua equipe</p>
        </div>
        <button 
          className="text-sm rounded-md border px-3 py-1.5 flex items-center gap-1 hover:bg-muted"
          onClick={() => {}}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          Configurações
        </button>
      </div>

      <Tabs defaultValue="performance" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="performance">Ranking de Desempenho</TabsTrigger>
          <TabsTrigger value="recognition">Painel de Reconhecimento</TabsTrigger>
          <TabsTrigger value="achievements">Minhas Metas e Conquistas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="animate-fade-in">
          <PerformanceRanking />
        </TabsContent>
        
        <TabsContent value="recognition" className="animate-fade-in">
          <RecognitionPanel />
        </TabsContent>
        
        <TabsContent value="achievements" className="animate-fade-in">
          <MyAchievements />
        </TabsContent>
      </Tabs>
    </div>
  );
};