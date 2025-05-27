import { User } from './user';

export interface Dashboard {
  id: number;
  name: string;
  description?: string;
  layout: DashboardLayout;
  isDefault: boolean;
  isPublic: boolean;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
  widgets: DashboardWidget[];
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  gap: number;
  padding: number;
}

export interface DashboardWidget {
  id: number;
  dashboardId: number;
  title: string;
  type: WidgetType;
  size: WidgetSize;
  position: WidgetPosition;
  configuration: WidgetConfiguration;
  dataSource: WidgetDataSource;
  refreshInterval?: number;
  createdAt: Date;
  updatedAt: Date;
  data?: any; // Dados dinâmicos do widget
}

export type WidgetType = 'chart' | 'table' | 'kpi' | 'goal' | 'custom';

export type WidgetSize = 'small' | 'medium' | 'large';

export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WidgetConfiguration {
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  stacked?: boolean;
  format?: {
    type: 'number' | 'currency' | 'percentage' | 'date';
    options?: Intl.NumberFormatOptions | Intl.DateTimeFormatOptions;
  };
  columns?: {
    [key: string]: {
      format?: {
        type: 'number' | 'currency' | 'percentage' | 'date';
        options?: Intl.NumberFormatOptions | Intl.DateTimeFormatOptions;
      };
    };
  };
  customOptions?: Record<string, any>;
}

export interface WidgetDataSource {
  type: 'kpi' | 'query' | 'api' | 'custom';
  config: {
    kpiId?: number;
    query?: string;
    endpoint?: string;
    method?: 'GET' | 'POST';
    params?: Record<string, any>;
    transform?: string; // Função de transformação em string
  };
}

export interface KpiValue {
  id: number;
  kpiId: number;
  value: number;
  textValue?: string;
  dateFrom: Date;
  dateTo: Date;
  periodType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface DashboardFilter {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'between' | 'in';
  value: any;
} 