import React from 'react';
import { DashboardWidget } from '@/types/dashboard';
import { WidgetHeader } from './WidgetHeader';

interface CustomWidgetProps {
  widget: DashboardWidget;
  isEditing?: boolean;
  onRefresh?: () => void;
}

export const CustomWidget: React.FC<CustomWidgetProps> = ({
  widget,
  isEditing,
  onRefresh
}) => {
  const { customOptions } = widget.configuration;
  const data = widget.data || {};

  // Função para renderizar conteúdo personalizado baseado nas opções
  const renderCustomContent = () => {
    if (!customOptions?.template) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          Widget personalizado sem template
        </div>
      );
    }

    try {
      // Substitui placeholders no template com dados reais
      let content = customOptions.template;
      Object.entries(data).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        if (typeof value === 'object') {
          content = content.replace(placeholder, JSON.stringify(value));
        } else {
          content = content.replace(placeholder, String(value));
        }
      });

      // Se o template for HTML, renderiza como HTML
      if (customOptions.isHtml) {
        return (
          <div
            className="custom-widget-content h-full"
            style={customOptions.styles || {}}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        );
      }

      // Caso contrário, renderiza como texto
      return (
        <div
          className="custom-widget-content h-full whitespace-pre-wrap"
          style={customOptions.styles || {}}
        >
          {content}
        </div>
      );
    } catch (error) {
      console.error('Erro ao renderizar widget personalizado:', error);
      return (
        <div className="flex items-center justify-center h-full text-red-500">
          Erro ao renderizar widget
        </div>
      );
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
        {renderCustomContent()}
      </div>
    </div>
  );
}; 