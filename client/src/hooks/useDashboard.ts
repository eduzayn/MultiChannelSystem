import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { socketClient, ServerEventTypes } from '../lib/socketClient';
import { useEffect } from 'react';

export interface Dashboard {
  id: number;
  name: string;
  description?: string;
  layout: any;
  isDefault: boolean;
  isPublic: boolean;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardWidget {
  id: number;
  dashboardId: number;
  title: string;
  type: string;
  size: string;
  position: any;
  configuration: any;
  dataSource: any;
  refreshInterval?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WidgetData {
  kpi?: any;
  currentValue?: any;
  previousValue?: any;
  percentChange?: number;
  trend?: 'up' | 'down' | 'stable';
  chartData?: any[];
}

/**
 * Hook para listar todos os dashboards
 */
export function useDashboards(isPublic?: boolean) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const unsubscribe = socketClient.on(ServerEventTypes.DASHBOARD_UPDATED, () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboards'] });
    });
    
    return unsubscribe;
  }, [queryClient]);
  
  return useQuery({
    queryKey: ['/api/dashboards', isPublic],
    queryFn: async () => {
      const url = isPublic !== undefined ? `/api/dashboards?isPublic=${isPublic}` : '/api/dashboards';
      const { data } = await api.get(url);
      return data;
    }
  });
}

/**
 * Hook para buscar um dashboard específico
 */
export function useDashboard(id: number) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const unsubscribe = socketClient.on(ServerEventTypes.DASHBOARD_UPDATED, (data: any) => {
      if (data.dashboardId === id) {
        queryClient.invalidateQueries({ queryKey: [`/api/dashboards/${id}`] });
      }
    });
    
    return unsubscribe;
  }, [id, queryClient]);
  
  return useQuery({
    queryKey: [`/api/dashboards/${id}`],
    queryFn: async () => {
      const { data } = await api.get(`/api/dashboards/${id}`);
      return data;
    },
    enabled: !!id
  });
}

/**
 * Hook para buscar o dashboard padrão
 */
export function useDefaultDashboard() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const unsubscribe = socketClient.on(ServerEventTypes.DASHBOARD_UPDATED, () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboards/default'] });
    });
    
    return unsubscribe;
  }, [queryClient]);
  
  return useQuery({
    queryKey: ['/api/dashboards/default'],
    queryFn: async () => {
      const { data } = await api.get('/api/dashboards/default');
      return data;
    }
  });
}

/**
 * Hook para buscar widgets de um dashboard
 */
export function useDashboardWidgets(dashboardId: number) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const unsubscribe = socketClient.on(ServerEventTypes.DASHBOARD_UPDATED, (data: any) => {
      if (data.dashboardId === dashboardId) {
        queryClient.invalidateQueries({ queryKey: [`/api/dashboards/${dashboardId}/widgets`] });
      }
    });
    
    return unsubscribe;
  }, [dashboardId, queryClient]);
  
  return useQuery({
    queryKey: [`/api/dashboards/${dashboardId}/widgets`],
    queryFn: async () => {
      const { data } = await api.get(`/api/dashboards/${dashboardId}/widgets`);
      return data;
    },
    enabled: !!dashboardId
  });
}

/**
 * Hook para buscar dados de um widget específico
 */
export function useWidgetData(widget: DashboardWidget, dateFrom?: Date, dateTo?: Date) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const unsubscribe = socketClient.on(ServerEventTypes.KPI_UPDATED, () => {
      queryClient.invalidateQueries({ queryKey: [`/api/dashboards/widgets/${widget.id}/data`] });
    });
    
    return unsubscribe;
  }, [widget.id, queryClient]);
  
  return useQuery({
    queryKey: [`/api/dashboards/widgets/${widget.id}/data`, dateFrom, dateTo],
    queryFn: async () => {
      let url = `/api/dashboards/widgets/${widget.id}/data`;
      const params = new URLSearchParams();
      
      if (dateFrom) params.append('dateFrom', dateFrom.toISOString());
      if (dateTo) params.append('dateTo', dateTo.toISOString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const { data } = await api.get(url);
      return data;
    },
    enabled: !!widget.id
  });
}

/**
 * Hook para criar um novo dashboard
 */
export function useCreateDashboard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (dashboardData: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data } = await api.post('/api/dashboards', dashboardData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboards'] });
    }
  });
}

/**
 * Hook para atualizar um dashboard existente
 */
export function useUpdateDashboard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...dashboardData }: Partial<Dashboard> & { id: number }) => {
      const { data } = await api.put(`/api/dashboards/${id}`, dashboardData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboards'] });
      queryClient.invalidateQueries({ queryKey: [`/api/dashboards/${data.id}`] });
    }
  });
}

/**
 * Hook para excluir um dashboard
 */
export function useDeleteDashboard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/dashboards/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboards'] });
      queryClient.invalidateQueries({ queryKey: [`/api/dashboards/${id}`] });
    }
  });
}

/**
 * Hook para criar um novo widget
 */
export function useCreateWidget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (widgetData: Omit<DashboardWidget, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data } = await api.post('/api/dashboards/widgets', widgetData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/dashboards/${data.dashboardId}/widgets`] });
    }
  });
}

/**
 * Hook para atualizar um widget existente
 */
export function useUpdateWidget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...widgetData }: Partial<DashboardWidget> & { id: number }) => {
      const { data } = await api.put(`/api/dashboards/widgets/${id}`, widgetData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/dashboards/${data.dashboardId}/widgets`] });
    }
  });
}

/**
 * Hook para excluir um widget
 */
export function useDeleteWidget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, dashboardId }: { id: number, dashboardId: number }) => {
      await api.delete(`/api/dashboards/widgets/${id}`);
      return { id, dashboardId };
    },
    onSuccess: ({ dashboardId }) => {
      queryClient.invalidateQueries({ queryKey: [`/api/dashboards/${dashboardId}/widgets`] });
    }
  });
}
