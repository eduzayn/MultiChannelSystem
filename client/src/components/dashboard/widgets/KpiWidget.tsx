import React from 'react';
import { DashboardWidget } from '@/types/dashboard';
import { WidgetHeader } from './WidgetHeader';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface KpiWidgetProps {
  widget: DashboardWidget;
  isEditing?: boolean;
  onRefresh?: () => void;
}

export const KpiWidget: React.FC<KpiWidgetProps> = ({
  widget,
  isEditing,
  onRefresh
}) => {
  const { format } = widget.configuration;
  const data = widget.data || {};
  const value = data.value || 0;
  const previousValue = data.previousValue || 0;
  const change = ((value - previousValue) / previousValue) * 100;
  const isPositive = change >= 0;

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

  return (
    <div className="h-full w-full p-4">
      <WidgetHeader
        title={widget.title}
        isEditing={isEditing}
        onRefresh={onRefresh}
      />
      <div className="flex flex-col items-center justify-center h-[calc(100%-40px)]">
        <div className="text-3xl font-bold mb-2">
          {formatValue(value)}
        </div>
        {previousValue > 0 && (
          <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? (
              <ArrowUpIcon className="w-4 h-4 mr-1" />
            ) : (
              <ArrowDownIcon className="w-4 h-4 mr-1" />
            )}
            <span>{Math.abs(change).toFixed(1)}%</span>
            <span className="text-gray-500 ml-1">vs. período anterior</span>
          </div>
        )}
        {data.description && (
          <div className="text-sm text-gray-500 mt-2 text-center">
            {data.description}
          </div>
        )}
      </div>
    </div>
  );
}; 