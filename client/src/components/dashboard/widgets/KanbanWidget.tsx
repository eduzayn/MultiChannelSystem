import React, { useState } from 'react';
import { DashboardWidget, KanbanConfig } from '@/types/dashboard';
import { WidgetHeader } from './WidgetHeader';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface KanbanWidgetProps {
  widget: DashboardWidget;
  isEditing?: boolean;
  onRefresh?: () => void;
}

interface KanbanCard {
  id: string | number;
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string | Date;
  priority?: string;
  tags?: string[];
  color?: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  color?: string;
}

export const KanbanWidget: React.FC<KanbanWidgetProps> = ({
  widget,
  isEditing,
  onRefresh
}) => {
  const { kanbanConfig = {} as KanbanConfig } = widget.configuration;
  const [columns, setColumns] = useState<KanbanColumn[]>(
    widget.data?.columns || []
  );

  // Formata a data de vencimento
  const formatDueDate = (date: string | Date) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    }).format(dateObj);
  };

  // Manipula o drag and drop dos cartões
  const handleDragEnd = (result: any) => {
    if (!result.destination || !kanbanConfig.dragEnabled) return;

    const { source, destination } = result;
    const newColumns = [...columns];
    
    // Remove o cartão da coluna de origem
    const sourceColumn = newColumns.find(col => col.id === source.droppableId);
    const [movedCard] = sourceColumn?.cards.splice(source.index, 1) || [];
    
    if (!movedCard) return;

    // Adiciona o cartão na coluna de destino
    const destColumn = newColumns.find(col => col.id === destination.droppableId);
    destColumn?.cards.splice(destination.index, 0, movedCard);

    setColumns(newColumns);
  };

  // Renderiza um cartão individual
  const renderCard = (card: KanbanCard) => {
    const cardContent = kanbanConfig.cardTemplate ? (
      // Renderiza o template personalizado
      <div dangerouslySetInnerHTML={{ __html: kanbanConfig.cardTemplate
        .replace('{{title}}', card.title)
        .replace('{{description}}', card.description || '')
        .replace('{{assignee}}', card.assignee || '')
        .replace('{{dueDate}}', formatDueDate(card.dueDate || ''))
      }} />
    ) : (
      // Renderiza o layout padrão
      <>
        <div className="font-medium">{card.title}</div>
        {card.description && (
          <div className="text-sm text-gray-500 mt-1">{card.description}</div>
        )}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
          {card.assignee && (
            <div className="flex items-center">
              <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                {card.assignee.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {card.dueDate && (
            <div>{formatDueDate(card.dueDate)}</div>
          )}
        </div>
        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {card.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </>
    );

    return (
      <div
        className="bg-white rounded-lg shadow p-3 mb-2 last:mb-0"
        style={card.color ? { borderLeft: `4px solid ${card.color}` } : undefined}
      >
        {cardContent}
      </div>
    );
  };

  return (
    <div className="h-full w-full p-4">
      <WidgetHeader
        title={widget.title}
        isEditing={isEditing}
        onRefresh={onRefresh}
      />
      <div className="h-[calc(100%-40px)] overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex space-x-4 h-full">
            {columns.map(column => (
              <div
                key={column.id}
                className="flex-shrink-0 w-72"
              >
                {/* Cabeçalho da coluna */}
                <div
                  className="h-10 px-3 rounded-t-lg flex items-center justify-between"
                  style={{ backgroundColor: column.color || '#f3f4f6' }}
                >
                  <span className="font-medium">{column.title}</span>
                  <span className="text-sm text-gray-500">
                    {column.cards.length}
                  </span>
                </div>
                {/* Lista de cartões */}
                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="min-h-[calc(100%-2.5rem)] bg-gray-50 rounded-b-lg p-2"
                    >
                      {column.cards.map((card, index) => (
                        <Draggable
                          key={card.id}
                          draggableId={card.id.toString()}
                          index={index}
                          isDragDisabled={!kanbanConfig.dragEnabled}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              {renderCard(card)}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}; 