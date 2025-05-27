import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { DashboardWidget } from '@/types/dashboard';
import { WidgetHeader } from './WidgetHeader';

interface ChartWidgetProps {
  widget: DashboardWidget;
  isEditing?: boolean;
  onRefresh?: () => void;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({
  widget,
  isEditing,
  onRefresh
}) => {
  const renderChart = () => {
    const { chartType, colors, showLegend, showGrid, stacked } = widget.configuration;
    const data = widget.data || [];

    switch (chartType) {
      case 'line':
        return (
          <LineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {showLegend && <Legend />}
            {Object.keys(data[0] || {})
              .filter(key => key !== 'name')
              .map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors?.[index]}
                  strokeWidth={2}
                />
              ))}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {showLegend && <Legend />}
            {Object.keys(data[0] || {})
              .filter(key => key !== 'name')
              .map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={colors?.[index]}
                  stackId={stacked ? "stack" : undefined}
                />
              ))}
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={colors?.[index % (colors?.length || 1)]} />
              ))}
            </Pie>
            <Tooltip />
            {showLegend && <Legend />}
          </PieChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {showLegend && <Legend />}
            {Object.keys(data[0] || {})
              .filter(key => key !== 'name')
              .map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  fill={colors?.[index]}
                  stroke={colors?.[index]}
                  stackId={stacked ? "stack" : undefined}
                />
              ))}
          </AreaChart>
        );

      case 'scatter':
        return (
          <ScatterChart>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="x" type="number" />
            <YAxis dataKey="y" type="number" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            {showLegend && <Legend />}
            {Object.keys(data[0] || {})
              .filter(key => key !== 'x' && key !== 'y')
              .map((key, index) => (
                <Scatter
                  key={key}
                  name={key}
                  data={data}
                  fill={colors?.[index]}
                />
              ))}
          </ScatterChart>
        );

      default:
        return <div>Tipo de gráfico não suportado</div>;
    }
  };

  return (
    <div className="h-full w-full p-4">
      <WidgetHeader
        title={widget.title}
        isEditing={isEditing}
        onRefresh={onRefresh}
      />
      <div className="h-[calc(100%-40px)]">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}; 