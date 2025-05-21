import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { SalesResults } from "./components/SalesResults";
import { AttendancePerformance } from "./components/AttendancePerformance";
import { MarketingMetrics } from "./components/MarketingMetrics";
import { CalendarIcon, ArrowDownUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Reports = () => {
  const [activeTab, setActiveTab] = useState("sales");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2023, 0, 1),
    to: new Date(2023, 5, 30)
  });
  const [selectedTeam, setSelectedTeam] = useState<string | undefined>(undefined);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">
            Análise de performance de vendas, atendimento e marketing
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[240px] justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                      {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                    </>
                  ) : (
                    format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                  )
                ) : (
                  <span>Selecione um período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Equipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Equipes</SelectItem>
              <SelectItem value="sales">Equipe de Vendas</SelectItem>
              <SelectItem value="support">Equipe de Suporte</SelectItem>
              <SelectItem value="marketing">Equipe de Marketing</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2">
            <ArrowDownUp className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full md:w-auto">
          <TabsTrigger value="sales">Resultados de Vendas</TabsTrigger>
          <TabsTrigger value="support">Performance de Atendimento</TabsTrigger>
          <TabsTrigger value="marketing">Métricas de Marketing</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="pt-6">
          <SalesResults dateRange={dateRange} team={selectedTeam} selectedUsers={selectedUsers} />
        </TabsContent>

        <TabsContent value="support" className="pt-6">
          <AttendancePerformance dateRange={dateRange} team={selectedTeam} selectedUsers={selectedUsers} />
        </TabsContent>

        <TabsContent value="marketing" className="pt-6">
          <MarketingMetrics dateRange={dateRange} team={selectedTeam} selectedUsers={selectedUsers} />
        </TabsContent>
      </Tabs>
    </div>
  );
};