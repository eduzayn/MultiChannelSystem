import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { socketClient, ServerEventTypes } from '../lib/socketClient';
import { useEffect } from 'react';

export interface UserActivity {
  id: number;
  userId: number;
  activityType: string;
  entityType?: string;
  entityId?: number;
  details?: any;
  performedAt: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface UserProductivity {
  messagesSent: number;
  conversationsHandled: number;
  averageResponseTime: number;
  resolutionRate: number;
  activitiesCount: Record<string, number>;
}

/**
 * Hook para buscar atividades de um usuário específico
 */
export function useUserActivities(userId: number, options: {
  limit?: number;
  offset?: number;
  dateFrom?: Date;
  dateTo?: Date;
  activityType?: string;
} = {}) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const unsubscribe = socketClient.on(ServerEventTypes.TEAM_METRICS_UPDATED, (data: any) => {
      if (data.userId === userId) {
        queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/activities`] });
      }
    });
    
    return unsubscribe;
  }, [userId, queryClient]);
  
  return useQuery({
    queryKey: [`/api/users/${userId}/activities`, options],
    queryFn: async () => {
      let url = `/api/users/${userId}/activities`;
      const params = new URLSearchParams();
      
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());
      if (options.dateFrom) params.append('dateFrom', options.dateFrom.toISOString());
      if (options.dateTo) params.append('dateTo', options.dateTo.toISOString());
      if (options.activityType) params.append('activityType', options.activityType);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const { data } = await api.get(url);
      return data;
    }
  });
}

/**
 * Hook para buscar atividades recentes de todos os usuários
 */
export function useRecentActivities(limit = 20) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const unsubscribe = socketClient.on(ServerEventTypes.TEAM_METRICS_UPDATED, () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-activities/recent'] });
    });
    
    return unsubscribe;
  }, [queryClient]);
  
  return useQuery({
    queryKey: ['/api/user-activities/recent', limit],
    queryFn: async () => {
      const { data } = await api.get(`/api/user-activities/recent?limit=${limit}`);
      return data;
    }
  });
}

/**
 * Hook para calcular métricas de produtividade para um usuário
 */
export function useUserProductivity(userId: number, dateFrom: Date, dateTo: Date) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const unsubscribe = socketClient.on(ServerEventTypes.TEAM_METRICS_UPDATED, (data: any) => {
      if (data.userId === userId) {
        queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/productivity`] });
      }
    });
    
    return unsubscribe;
  }, [userId, queryClient]);
  
  return useQuery({
    queryKey: [`/api/users/${userId}/productivity`, dateFrom, dateTo],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('dateFrom', dateFrom.toISOString());
      params.append('dateTo', dateTo.toISOString());
      
      const { data } = await api.get(`/api/users/${userId}/productivity?${params.toString()}`);
      return data;
    },
    enabled: !!userId && !!dateFrom && !!dateTo
  });
}

/**
 * Hook para registrar uma nova atividade do usuário
 */
export function useLogUserActivity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (activityData: {
      userId: number;
      activityType: string;
      entityType?: string;
      entityId?: string | number;
      details?: any;
      performedAt?: Date;
    }) => {
      const payload = {
        ...activityData,
        performedAt: activityData.performedAt?.toISOString() || new Date().toISOString()
      };
      
      const { data } = await api.post('/api/user-activities', payload);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${variables.userId}/activities`] });
      queryClient.invalidateQueries({ queryKey: ['/api/user-activities/recent'] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${variables.userId}/productivity`] });
    }
  });
}
