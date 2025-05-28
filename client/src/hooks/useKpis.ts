import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { socketClient, ServerEventTypes } from '../lib/socketClient';
import { useEffect } from 'react';

export interface Kpi {
  id: number;
  name: string;
  description?: string;
  category: string;
  metricType: string;
  formula?: any;
  targetValue?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  compareToHistorical: boolean;
  historicalPeriods?: number;
  active: boolean;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface KpiValue {
  id: number;
  kpiId: number;
  value: number;
  textValue?: string;
  dateFrom: string;
  dateTo: string;
  periodType: string;
  metadata?: any;
  createdAt: string;
}

/**
 * Hook para listar todos os KPIs
 */
export function useKpis(category?: string) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const unsubscribe = socketClient.on(ServerEventTypes.KPI_UPDATED, (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/kpis'] });
      
      if (data.kpiId) {
        queryClient.invalidateQueries({ queryKey: [`/api/kpis/${data.kpiId}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/kpis/${data.kpiId}/values`] });
      }
    });
    
    return unsubscribe;
  }, [queryClient]);
  
  return useQuery({
    queryKey: ['/api/kpis', category],
    queryFn: async () => {
      const url = category ? `/api/kpis?category=${category}` : '/api/kpis';
      const { data } = await api.get(url);
      return data;
    }
  });
}

/**
 * Hook para buscar um KPI específico
 */
export function useKpi(id: number) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const unsubscribe = socketClient.on(ServerEventTypes.KPI_UPDATED, (data: any) => {
      if (data.kpiId === id) {
        queryClient.invalidateQueries({ queryKey: [`/api/kpis/${id}`] });
      }
    });
    
    return unsubscribe;
  }, [id, queryClient]);
  
  return useQuery({
    queryKey: [`/api/kpis/${id}`],
    queryFn: async () => {
      const { data } = await api.get(`/api/kpis/${id}`);
      return data;
    },
    enabled: !!id
  });
}

/**
 * Hook para buscar valores históricos de um KPI
 */
export function useKpiValues(kpiId: number, periodType?: string, limit?: number) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const unsubscribe = socketClient.on(ServerEventTypes.KPI_UPDATED, (data: any) => {
      if (data.kpiId === kpiId) {
        queryClient.invalidateQueries({ queryKey: [`/api/kpis/${kpiId}/values`] });
      }
    });
    
    return unsubscribe;
  }, [kpiId, queryClient]);
  
  return useQuery({
    queryKey: [`/api/kpis/${kpiId}/values`, periodType, limit],
    queryFn: async () => {
      let url = `/api/kpis/${kpiId}/values`;
      const params = new URLSearchParams();
      
      if (periodType) params.append('periodType', periodType);
      if (limit) params.append('limit', limit.toString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const { data } = await api.get(url);
      return data;
    },
    enabled: !!kpiId
  });
}

/**
 * Hook para criar um novo KPI
 */
export function useCreateKpi() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (kpiData: Omit<Kpi, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data } = await api.post('/api/kpis', kpiData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/kpis'] });
    }
  });
}

/**
 * Hook para atualizar um KPI existente
 */
export function useUpdateKpi() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...kpiData }: Partial<Kpi> & { id: number }) => {
      const { data } = await api.put(`/api/kpis/${id}`, kpiData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/kpis'] });
      queryClient.invalidateQueries({ queryKey: [`/api/kpis/${data.id}`] });
    }
  });
}

/**
 * Hook para excluir um KPI
 */
export function useDeleteKpi() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/kpis/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['/api/kpis'] });
      queryClient.invalidateQueries({ queryKey: [`/api/kpis/${id}`] });
    }
  });
}
