import React from 'react';
import { DashboardWidget } from '@/types/dashboard';
import { WidgetHeader } from './WidgetHeader';

interface HeatmapWidgetProps {
  widget: DashboardWidget;
  isEditing?: boolean;
  onRefresh?: () => void;
}

interface HeatmapConfig {
  xAxis: string;
  yAxis: string;
  colorScale?: string[];
  showValues?: boolean;
}

interface HeatmapData {
  [key: string]: any;
  value: number;
}

export const HeatmapWidget: React.FC<HeatmapWidgetProps> = ({
  widget,
  isEditing,
  onRefresh
}) => {
  const { heatmapConfig = {} as HeatmapConfig } = widget.configuration;
  const data = (widget.data || []) as HeatmapData[];
  const xLabels = Array.from(new Set(data.map(d => d[heatmapConfig.xAxis])));
  const yLabels = Array.from(new Set(data.map(d => d[heatmapConfig.yAxis])));
  
  // Encontra os valores mínimo e máximo para a escala de cores
  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  // Função para interpolar cores
  const interpolateColor = (value: number) => {
    const normalizedValue = (value - minValue) / (maxValue - minValue);
    const colors = heatmapConfig.colorScale || ['#f7fbff', '#2171b5'];
    
    if (colors.length === 2) {
      const [start, end] = colors;
      // Converte cores hex para RGB
      const startRGB = hexToRgb(start);
      const endRGB = hexToRgb(end);
      
      // Interpola cada componente RGB
      const r = Math.round(startRGB.r + (endRGB.r - startRGB.r) * normalizedValue);
      const g = Math.round(startRGB.g + (endRGB.g - startRGB.g) * normalizedValue);
      const b = Math.round(startRGB.b + (endRGB.b - startRGB.b) * normalizedValue);
      
      return `rgb(${r},${g},${b})`;
    }
    
    return colors[0];
  };

  // Helper para converter hex para RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Formata o valor para exibição
  const formatValue = (value: number) => {
    if (!widget.configuration.format) return value.toString();

    const { type, options } = widget.configuration.format;
    switch (type) {
      case 'number':
        return new Intl.NumberFormat('pt-BR', options).format(value);
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          ...options
        }).format(value);
      case 'percentage':
        return new Intl.NumberFormat('pt-BR', {
          style: 'percent',
          minimumFractionDigits: 1,
          ...options
        }).format(value / 100);
      default:
        return value.toString();
    }
  };

  return (
    <div className="h-full w-full p-4">
      <WidgetHeader
        title={widget.title}
        isEditing={isEditing}
        onRefresh={onRefresh}
      />
      <div className="h-[calc(100%-40px)] overflow-auto">
        <div className="flex">
          {/* Espaço para alinhamento com os rótulos Y */}
          <div className="w-24" />
          {/* Rótulos X */}
          <div className="flex-1 flex">
            {xLabels.map((label, i) => (
              <div
                key={i}
                className="flex-1 text-center text-sm text-gray-600 truncate px-1"
              >
                {String(label)}
              </div>
            ))}
          </div>
        </div>
        {/* Grid do heatmap */}
        <div className="flex">
          {/* Rótulos Y */}
          <div className="w-24">
            {yLabels.map((label, i) => (
              <div
                key={i}
                className="h-10 flex items-center justify-end pr-2 text-sm text-gray-600 truncate"
              >
                {String(label)}
              </div>
            ))}
          </div>
          {/* Células do heatmap */}
          <div className="flex-1">
            {yLabels.map((yLabel, i) => (
              <div key={i} className="flex h-10">
                {xLabels.map((xLabel, j) => {
                  const cell = data.find(
                    d =>
                      d[heatmapConfig.xAxis] === xLabel &&
                      d[heatmapConfig.yAxis] === yLabel
                  );
                  const value = cell ? cell.value : 0;
                  return (
                    <div
                      key={j}
                      className="flex-1 m-0.5 rounded flex items-center justify-center text-xs"
                      style={{
                        backgroundColor: interpolateColor(value),
                        color: value > (maxValue - minValue) / 2 ? 'white' : 'black'
                      }}
                      title={`${xLabel} - ${yLabel}: ${formatValue(value)}`}
                    >
                      {heatmapConfig.showValues && formatValue(value)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 