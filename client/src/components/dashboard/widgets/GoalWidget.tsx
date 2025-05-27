import React from 'react';
import { DashboardWidget } from '@/types/dashboard';
import { WidgetHeader } from './WidgetHeader';
import { Progress } from '@/components/ui/progress';

interface GoalWidgetProps {
  widget: DashboardWidget;
  isEditing?: boolean;
  onRefresh?: () => void;
}

export const GoalWidget: React.FC<GoalWidgetProps> = ({
  widget,
  isEditing,
  onRefresh
}) => {
  const { format } = widget.configuration;
  const data = widget.data || {};
  const value = data.value || 0;
  const target = data.target || 100;
  const progress = Math.min(Math.round((value / target) * 100), 100);
  const remaining = target - value;

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

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-green-400';
    if (progress >= 50) return 'bg-yellow-400';
    if (progress >= 25) return 'bg-orange-400';
    return 'bg-red-400';
  };

  return (
    <div className="h-full w-full p-4">
      <WidgetHeader
        title={widget.title}
        isEditing={isEditing}
        onRefresh={onRefresh}
      />
      <div className="flex flex-col space-y-4 h-[calc(100%-40px)]">
        <div className="flex justify-between items-baseline">
          <div className="text-3xl font-bold">
            {formatValue(value)}
          </div>
          <div className="text-sm text-gray-500">
            Meta: {formatValue(target)}
          </div>
        </div>

        <div className="space-y-2">
          <Progress
            value={progress}
            className={`h-2 ${getProgressColor(progress)}`}
          />
          <div className="flex justify-between text-sm">
            <div className="font-medium">{progress}%</div>
            {remaining > 0 && (
              <div className="text-gray-500">
                Faltam {formatValue(remaining)}
              </div>
            )}
          </div>
        </div>

        {data.description && (
          <div className="text-sm text-gray-500 mt-auto">
            {data.description}
          </div>
        )}

        {data.deadline && (
          <div className="text-sm text-gray-500">
            Prazo: {new Intl.DateTimeFormat('pt-BR').format(new Date(data.deadline))}
          </div>
        )}
      </div>
    </div>
  );
}; 