import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { salesCycleData } from "../data/salesReportData";

export const SalesCycleChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ciclo de Vendas</CardTitle>
        <CardDescription>Tempo médio de ciclo de vendas (em dias)</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={salesCycleData}
            margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
          >
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="days" stroke="#0EA5E9" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};