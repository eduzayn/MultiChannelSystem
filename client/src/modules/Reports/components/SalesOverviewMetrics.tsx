import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const SalesOverviewMetrics = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Valor Total Fechado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ 655.000</div>
          <p className="text-xs text-muted-foreground">
            +12% comparado ao período anterior
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Ticket Médio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ 4.367</div>
          <p className="text-xs text-muted-foreground">
            +5% comparado ao período anterior
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Taxa de Conversão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12%</div>
          <p className="text-xs text-muted-foreground">
            +2% comparado ao período anterior
          </p>
        </CardContent>
      </Card>
    </div>
  );
};