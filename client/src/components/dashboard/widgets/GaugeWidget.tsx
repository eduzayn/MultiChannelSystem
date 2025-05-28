import React from 'react';
import { DashboardWidget } from '@/types/dashboard';
import { WidgetHeader } from './WidgetHeader';

interface GaugeWidgetProps {
  widget: DashboardWidget;
  isEditing?: boolean;
  onRefresh?: () => void;
}

export const GaugeWidget: React.FC<GaugeWidgetProps> = ({
  widget,
  isEditing,
  onRefresh
}) => {
  const data = widget.data || {};
  const value = data.value || 0;
  const min = data.min || 0;
  const max = data.max || 100;
  const { format, colors = {}, thresholds = [] } = widget.configuration;

  // Calculate the percentage for the gauge
  const percentage = ((value - min) / (max - min)) * 100;
  
  // Calculate the color based on thresholds
  const getColor = (value: number) => {
    const threshold = thresholds.find(t => value <= t.value);
    return threshold?.color || colors.default || '#3b82f6';
  };

  // Format the value based on configuration
  const formatValue = (value: number) => {
    if (!format) return value.toString();

    const { type, options } = format;
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

  // Calculate the arc path for the gauge
  const getArcPath = (percentage: number) => {
    const radius = 80;
    const startAngle = -90;
    const endAngle = startAngle + (percentage * 180) / 100;
    
    const start = polarToCartesian(100, 100, radius, startAngle);
    const end = polarToCartesian(100, 100, radius, endAngle);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y
    ].join(" ");
  };

  // Helper function to convert polar coordinates to cartesian
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <div className="h-full w-full p-4">
      <WidgetHeader
        title={widget.title}
        isEditing={isEditing}
        onRefresh={onRefresh}
      />
      <div className="flex flex-col items-center justify-center h-[calc(100%-40px)]">
        <svg width="200" height="120" viewBox="0 0 200 120">
          {/* Background arc */}
          <path
            d={getArcPath(100)}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="20"
            strokeLinecap="round"
          />
          {/* Value arc */}
          <path
            d={getArcPath(percentage)}
            fill="none"
            stroke={getColor(value)}
            strokeWidth="20"
            strokeLinecap="round"
          />
          {/* Value text */}
          <text
            x="100"
            y="90"
            textAnchor="middle"
            className="text-2xl font-bold"
            fill="currentColor"
          >
            {formatValue(value)}
          </text>
        </svg>
        {data.description && (
          <div className="text-sm text-gray-500 mt-2 text-center">
            {data.description}
          </div>
        )}
      </div>
    </div>
  );
}; 