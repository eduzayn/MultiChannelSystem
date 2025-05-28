import React from 'react';
import { DashboardWidget, FunnelConfig } from '@/types/dashboard';
import { WidgetHeader } from './WidgetHeader';

interface FunnelWidgetProps {
  widget: DashboardWidget;
  isEditing?: boolean;
  onRefresh?: () => void;
}

interface FunnelStep {
  id: string | number;
  label: string;
  value: number;
  color?: string;
  percentage?: number;
}

export const FunnelWidget: React.FC<FunnelWidgetProps> = ({
  widget,
  isEditing,
  onRefresh
}) => {
  const { funnelConfig = {} as FunnelConfig } = widget.configuration;
  const steps: FunnelStep[] = widget.data?.steps || [];
  const isVertical = funnelConfig.direction !== 'horizontal';

  // Calcula as porcentagens de cada etapa
  const stepsWithPercentages = steps.map((step, index) => {
    const previousValue = index > 0 ? steps[index - 1].value : step.value;
    const percentage = previousValue > 0 ? (step.value / previousValue) * 100 : 100;
    return { ...step, percentage };
  });

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

  // Cores padrão para as etapas
  const defaultColors = [
    '#3B82F6', // azul
    '#60A5FA',
    '#93C5FD',
    '#BFDBFE',
    '#DBEAFE'
  ];

  if (isVertical) {
    return (
      <div className="h-full w-full p-4">
        <WidgetHeader
          title={widget.title}
          isEditing={isEditing}
          onRefresh={onRefresh}
        />
        <div className="h-[calc(100%-40px)] flex items-center justify-center">
          <div className="w-full max-w-md">
            {stepsWithPercentages.map((step, index) => {
              const width = 100 - (index * (100 / steps.length) / 2);
              return (
                <div
                  key={step.id}
                  className="relative mb-4 last:mb-0"
                  style={{ width: `${width}%`, marginLeft: `${(100 - width) / 2}%` }}
                >
                  <div
                    className="h-16 flex items-center justify-center text-white rounded-lg"
                    style={{
                      backgroundColor: step.color || defaultColors[index % defaultColors.length]
                    }}
                  >
                    <div className="text-center">
                      <div className="font-medium">{step.label}</div>
                      {funnelConfig.showValues && (
                        <div className="text-sm">{formatValue(step.value)}</div>
                      )}
                    </div>
                  </div>
                  {funnelConfig.showPercentage && index > 0 && (
                    <div className="absolute -right-20 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      {step.percentage?.toFixed(1)}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Renderização horizontal
  return (
    <div className="h-full w-full p-4">
      <WidgetHeader
        title={widget.title}
        isEditing={isEditing}
        onRefresh={onRefresh}
      />
      <div className="h-[calc(100%-40px)] flex items-center">
        <div className="flex-1 flex items-center space-x-2">
          {stepsWithPercentages.map((step, index) => {
            const height = 100 - (index * (100 / steps.length) / 2);
            return (
              <div
                key={step.id}
                className="flex-1 flex flex-col items-center"
              >
                <div
                  className="w-full rounded-lg flex items-center justify-center text-white"
                  style={{
                    backgroundColor: step.color || defaultColors[index % defaultColors.length],
                    height: `${height}%`
                  }}
                >
                  <div className="text-center p-2">
                    <div className="font-medium">{step.label}</div>
                    {funnelConfig.showValues && (
                      <div className="text-sm">{formatValue(step.value)}</div>
                    )}
                  </div>
                </div>
                {funnelConfig.showPercentage && index > 0 && (
                  <div className="mt-2 text-sm text-gray-500">
                    {step.percentage?.toFixed(1)}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}; 