import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { salesTeamData, supportTeamData } from "../mockData";
import { RankingFilters } from "./RankingFilters";
import { Podium } from "./Podium";
import { TeamRankingTable } from "./TeamRankingTable";
import { TeamData } from "../types";

export const PerformanceRanking = () => {
  // Estado para os filtros
  const [activeTeam, setActiveTeam] = useState('sales');
  const [metric, setMetric] = useState('default');
  const [period, setPeriod] = useState('month');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  
  // Estado para os dados filtrados
  const [salesData, setSalesData] = useState<TeamData>(salesTeamData);
  const [supportData, setSupportData] = useState<TeamData>(supportTeamData);
  
  // Aplicar filtros na mudança de métricas
  useEffect(() => {
    // Aplicar filtros aos dados de vendas
    let filteredSalesData = [...salesTeamData];
    
    if (metric === 'amount') {
      filteredSalesData.sort((a, b) => b.sales - a.sales);
    } else if (metric === 'deals') {
      filteredSalesData.sort((a, b) => b.deals - a.deals);
    } else if (metric === 'completion') {
      filteredSalesData.sort((a, b) => b.completion - a.completion);
    } else {
      // default - por vendas
      filteredSalesData.sort((a, b) => b.sales - a.sales);
    }
    
    setSalesData(filteredSalesData);
    
    // Aplicar filtros aos dados de suporte
    let filteredSupportData = [...supportTeamData];
    
    if (metric === 'tickets') {
      filteredSupportData.sort((a, b) => b.tickets - a.tickets);
    } else if (metric === 'resolution') {
      filteredSupportData.sort((a, b) => b.resolution - a.resolution);
    } else if (metric === 'completion') {
      filteredSupportData.sort((a, b) => b.completion - a.completion);
    } else {
      // default - por satisfação
      filteredSupportData.sort((a, b) => b.satisfaction - a.satisfaction);
    }
    
    setSupportData(filteredSupportData);
  }, [metric]);

  return (
    <div className="space-y-6">
      {/* Filtros do ranking */}
      <RankingFilters
        period={period}
        setPeriod={setPeriod}
        metric={metric}
        setMetric={setMetric}
        dateRange={dateRange}
        setDateRange={setDateRange}
        activeTeam={activeTeam as 'sales' | 'support'}
      />

      {/* Pódio dos três primeiros */}
      <Podium
        salesData={salesData}
        supportData={supportData}
        activeTeam={activeTeam as 'sales' | 'support'}
        metric={metric}
      />

      <Tabs defaultValue="sales" className="w-full" value={activeTeam} onValueChange={setActiveTeam}>
        <TabsList className="mb-4">
          <TabsTrigger value="sales">Equipe de Vendas</TabsTrigger>
          <TabsTrigger value="support">Equipe de Atendimento</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="animate-fade-in">
          <TeamRankingTable
            teamData={salesData}
            activeTeam="sales"
            period={period}
          />
        </TabsContent>
        
        <TabsContent value="support" className="animate-fade-in">
          <TeamRankingTable
            teamData={supportData}
            activeTeam="support"
            period={period}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};