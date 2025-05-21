import React, { ReactNode } from "react";
import { ResponsiveContainer } from "recharts";

interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

interface ChartContainerProps {
  children: ReactNode;
  config: ChartConfig;
}

export function ChartContainer({ children, config }: ChartContainerProps) {
  // Criar variáveis CSS para as cores configuradas
  const style = Object.entries(config).reduce((acc, [key, value]) => {
    return {
      ...acc,
      [`--color-${key}`]: value.color,
    };
  }, {});

  return (
    <div style={style} className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}