import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { salesData } from "../data/salesReportData";

export const SalesTargetChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultados vs. Meta</CardTitle>
        <CardDescription>Comparação entre resultados e metas de vendas</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ChartContainer 
          config={{
            target: { 
              label: "Meta",
              color: "#D946EF" 
            },
            achieved: { 
              label: "Realizado",
              color: "#8B5CF6" 
            }
          }}
        >
          <BarChart 
            data={salesData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="target" name="Meta" fill="var(--color-target)" />
            <Bar dataKey="achieved" name="Realizado" fill="var(--color-achieved)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};