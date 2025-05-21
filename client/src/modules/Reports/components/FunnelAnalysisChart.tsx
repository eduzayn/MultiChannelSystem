import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { funnelData } from "../data/salesReportData";

export const FunnelAnalysisChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Funil</CardTitle>
        <CardDescription>Conversão entre etapas do funil de vendas</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={funnelData}
            margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
          >
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip />
            <Bar dataKey="value" fill="#8B5CF6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};