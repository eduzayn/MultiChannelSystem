import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from "react-day-picker";

interface RankingFiltersProps {
  period: string;
  setPeriod: (value: string) => void;
  metric: string;
  setMetric: (value: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (value: DateRange | undefined) => void;
  activeTeam: 'sales' | 'support';
}

export const RankingFilters: React.FC<RankingFiltersProps> = ({
  period,
  setPeriod,
  metric,
  setMetric,
  dateRange,
  setDateRange,
  activeTeam
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[180px]">
            <label className="text-sm font-medium mb-1 block">Período</label>
            <div className="flex gap-2">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mês</SelectItem>
                  <SelectItem value="quarter">Este trimestre</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex-1 min-w-[180px]">
            <label className="text-sm font-medium mb-1 block">Métrica</label>
            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a métrica" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">{activeTeam === 'sales' ? 'Vendas (R$)' : 'Satisfação (%)'}</SelectItem>
                <SelectItem value={activeTeam === 'sales' ? 'deals' : 'tickets'}>
                  {activeTeam === 'sales' ? 'Negócios Fechados' : 'Tickets Atendidos'}
                </SelectItem>
                <SelectItem value={activeTeam === 'sales' ? 'amount' : 'resolution'}>
                  {activeTeam === 'sales' ? 'Valor Total (R$)' : 'Taxa de Resolução (%)'}
                </SelectItem>
                <SelectItem value="completion">Progresso da Meta (%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};