import React from 'react';
import { DashboardWidget, TimelineConfig } from '@/types/dashboard';
import { WidgetHeader } from './WidgetHeader';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimelineWidgetProps {
  widget: DashboardWidget;
  isEditing?: boolean;
  onRefresh?: () => void;
}

interface TimelineEvent {
  id: string | number;
  title: string;
  description?: string;
  date: Date | string;
  type?: string;
  group?: string;
  color?: string;
  icon?: string;
}

export const TimelineWidget: React.FC<TimelineWidgetProps> = ({
  widget,
  isEditing,
  onRefresh
}) => {
  const { timelineConfig = {} as TimelineConfig } = widget.configuration;
  const events: TimelineEvent[] = widget.data?.events || [];

  // Agrupa eventos por data ou grupo configurado
  const groupedEvents = events.reduce((acc: { [key: string]: TimelineEvent[] }, event) => {
    const groupKey = timelineConfig.groupBy === 'date'
      ? format(new Date(event.date), 'yyyy-MM-dd')
      : (event.group || 'Sem grupo');

    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(event);
    return acc;
  }, {});

  // Formata a data do evento
  const formatEventDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, timelineConfig.dateFormat || 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  // Determina a cor do evento
  const getEventColor = (event: TimelineEvent) => {
    if (event.color) return event.color;
    
    // Cores por tipo de evento
    const typeColors: { [key: string]: string } = {
      success: '#10B981', // verde
      warning: '#F59E0B', // amarelo
      error: '#EF4444',   // vermelho
      info: '#3B82F6',    // azul
      default: '#6B7280'  // cinza
    };

    return typeColors[event.type || 'default'];
  };

  return (
    <div className="h-full w-full p-4">
      <WidgetHeader
        title={widget.title}
        isEditing={isEditing}
        onRefresh={onRefresh}
      />
      <div className="h-[calc(100%-40px)] overflow-auto">
        {Object.entries(groupedEvents).map(([group, groupEvents], groupIndex) => (
          <div key={group} className="mb-6 last:mb-0">
            {/* Cabeçalho do grupo */}
            <div className="text-sm font-medium text-gray-500 mb-2">
              {timelineConfig.groupBy === 'date'
                ? format(new Date(group), 'dd/MM/yyyy', { locale: ptBR })
                : group}
            </div>
            {/* Lista de eventos do grupo */}
            <div className="relative pl-8">
              {groupEvents.map((event, eventIndex) => (
                <div
                  key={event.id}
                  className={`relative pb-6 last:pb-0 ${
                    eventIndex < groupEvents.length - 1 ? 'border-l-2' : ''
                  } border-gray-200`}
                >
                  {/* Indicador do evento */}
                  <div
                    className="absolute -left-[17px] w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: getEventColor(event) }}
                  >
                    {event.icon ? (
                      <span className="text-white text-sm">{event.icon}</span>
                    ) : (
                      <div className="w-3 h-3 bg-white rounded-full" />
                    )}
                  </div>
                  {/* Conteúdo do evento */}
                  <div className="relative flex items-start ml-4">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {event.title}
                      </div>
                      {event.description && (
                        <div className="mt-1 text-sm text-gray-500">
                          {event.description}
                        </div>
                      )}
                      <div className="mt-1 text-xs text-gray-400">
                        {formatEventDate(event.date)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 