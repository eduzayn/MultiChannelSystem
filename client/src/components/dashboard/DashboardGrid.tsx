import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Dashboard, DashboardWidget } from '@/types/dashboard';
import { dashboardService } from '@/services/dashboardService';
import { ChartWidget } from './widgets/ChartWidget';
import { TableWidget } from './widgets/TableWidget';
import { KpiWidget } from './widgets/KpiWidget';
import { GoalWidget } from './widgets/GoalWidget';
import { CustomWidget } from './widgets/CustomWidget';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
  dashboard: Dashboard;
  onLayoutChange?: (layout: any) => void;
  isEditing?: boolean;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  dashboard,
  onLayoutChange,
  isEditing = false
}) => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(dashboard.widgets);
  const [layouts, setLayouts] = useState({});

  useEffect(() => {
    // Converter widgets para o formato do grid
    const layout = widgets.map(widget => ({
      i: widget.id.toString(),
      x: widget.position.x,
      y: widget.position.y,
      w: widget.position.w,
      h: widget.position.h,
      minW: 2,
      minH: 2
    }));

    setLayouts({ lg: layout });
  }, [widgets]);

  const handleLayoutChange = (layout: any, layouts: any) => {
    setLayouts(layouts);
    if (onLayoutChange) {
      // Converter layout para o formato de posições dos widgets
      const positions = layout.map((item: any) => ({
        id: parseInt(item.i),
        position: {
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h
        }
      }));
      onLayoutChange(positions);
    }
  };

  const renderWidget = (widget: DashboardWidget) => {
    const props = {
      widget,
      isEditing,
      onRefresh: () => refreshWidget(widget.id)
    };

    switch (widget.type) {
      case 'chart':
        return <ChartWidget {...props} />;
      case 'table':
        return <TableWidget {...props} />;
      case 'kpi':
        return <KpiWidget {...props} />;
      case 'goal':
        return <GoalWidget {...props} />;
      case 'custom':
        return <CustomWidget {...props} />;
      default:
        return <div>Widget tipo não suportado</div>;
    }
  };

  const refreshWidget = async (widgetId: number) => {
    try {
      const widget = widgets.find(w => w.id === widgetId);
      if (!widget) return;

      // Atualizar dados do widget baseado na fonte de dados
      if (widget.dataSource.type === 'kpi') {
        const values = await dashboardService.getKpiValues(
          widget.dataSource.config.kpiId!,
          {
            periodType: 'daily',
            limit: 10
          }
        );
        // Atualizar widget com novos dados
        setWidgets(prev =>
          prev.map(w =>
            w.id === widgetId
              ? { ...w, data: values }
              : w
          )
        );
      }
      // Implementar outros tipos de fonte de dados...
    } catch (error) {
      console.error('Erro ao atualizar widget:', error);
    }
  };

  return (
    <div className="p-4">
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        margin={[16, 16]}
        containerPadding={[16, 16]}
        onLayoutChange={handleLayoutChange}
        isDraggable={isEditing}
        isResizable={isEditing}
        useCSSTransforms
      >
        {widgets.map(widget => (
          <div key={widget.id.toString()} className="bg-white rounded-lg shadow-md">
            {renderWidget(widget)}
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}; 