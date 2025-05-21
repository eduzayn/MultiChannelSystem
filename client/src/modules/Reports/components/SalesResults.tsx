import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { SalesOverviewMetrics } from "./SalesOverviewMetrics";
import { SalesTargetChart } from "./SalesTargetChart";
import { FunnelAnalysisChart } from "./FunnelAnalysisChart";
import { LossReasonsPieChart } from "./LossReasonsPieChart";
import { SalesCycleChart } from "./SalesCycleChart";

interface SalesResultsProps {
  dateRange?: DateRange;
  team?: string;
  selectedUsers?: string[];
}

export const SalesResults = ({ dateRange, team, selectedUsers }: SalesResultsProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Visão Geral de Vendas</CardTitle>
          <CardDescription>
            Principais métricas de performance de vendas e CRM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SalesOverviewMetrics />
        </CardContent>
      </Card>

      <div className="col-span-full">
        <SalesTargetChart />
      </div>

      <div className="md:col-span-1 lg:col-span-1">
        <FunnelAnalysisChart />
      </div>

      <div className="md:col-span-1 lg:col-span-1">
        <LossReasonsPieChart />
      </div>

      <div className="md:col-span-1 lg:col-span-1">
        <SalesCycleChart />
      </div>
    </div>
  );
};