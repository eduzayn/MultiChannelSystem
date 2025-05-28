import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { socketClient, ServerEventTypes } from '../lib/socketClient';
import { useEffect } from 'react';

export interface TeamPerformanceMetric {
  id: number;
  teamId: number;
  period: string;
  dateFrom: string;
  dateTo: string;
  metrics: {
    messagesSent?: number;
    messagesReceived?: number;
    averageResponseTime?: number;
    resolutionRate?: number;
    customerSatisfaction?: number;
    dealsCreated?: number;
    dealsWon?: number;
    conversionRate?: number;
    totalRevenue?: number;
    averageDealValue?: number;
    salesCycle?: number;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

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

/**
 * Hook para buscar métricas de performance da equipe
 */
export function useTeamPerformance(teamId: number, period?: string, dateFrom?: Date, dateTo?: Date) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const unsubscribe = socketClient.on(ServerEventTypes.TEAM_METRICS_UPDATED, (data: any) => {
      if (data.teamId === teamId) {
        queryClient.invalidateQueries({ queryKey: [`/api/teams/${teamId}/performance`] });
      }
    });
    
    return unsubscribe;
  }, [teamId, queryClient]);
  
  return useQuery({
    queryKey: [`/api/teams/${teamId}/performance`, period, dateFrom, dateTo],
    queryFn: async () => {
      let url = `/api/teams/${teamId}/performance`;
      const params = new URLSearchParams();
      
      if (period) params.append('period', period);
      if (dateFrom) params.append('dateFrom', dateFrom.toISOString());
      if (dateTo) params.append('dateTo', dateTo.toISOString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const { data } = await api.get(url);
      return data;
    },
    enabled: !!teamId
  });
}

/**
 * Hook para buscar métricas de performance de um usuário específico
 */
export function useUserPerformance(userId: number, period?: string, dateFrom?: Date, dateTo?: Date) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const unsubscribe = socketClient.on(ServerEventTypes.TEAM_METRICS_UPDATED, (data: any) => {
      if (data.userId === userId) {
        queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/performance`] });
      }
    });
    
    return unsubscribe;
  }, [userId, queryClient]);
  
  return useQuery({
    queryKey: [`/api/users/${userId}/performance`, period, dateFrom, dateTo],
    queryFn: async () => {
      let url = `/api/users/${userId}/performance`;
      const params = new URLSearchParams();
      
      if (period) params.append('period', period);
      if (dateFrom) params.append('dateFrom', dateFrom.toISOString());
      if (dateTo) params.append('dateTo', dateTo.toISOString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const { data } = await api.get(url);
      return data;
    },
    enabled: !!userId
  });
}

/**
 * Hook para buscar atividades de um usuário
 */
export function useUserActivities(userId: number, limit?: number, offset?: number) {
  return useQuery({
    queryKey: [`/api/users/${userId}/activities`, limit, offset],
    queryFn: async () => {
      let url = `/api/users/${userId}/activities`;
      const params = new URLSearchParams();
      
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const { data } = await api.get(url);
      return data;
    },
    enabled: !!userId
  });
}

/**
 * Hook para buscar ranking de performance da equipe
 */
export function useTeamRanking(teamId: number, metric: string, period?: string, limit?: number) {
  return useQuery({
    queryKey: [`/api/teams/${teamId}/ranking`, metric, period, limit],
    queryFn: async () => {
      let url = `/api/teams/${teamId}/ranking`;
      const params = new URLSearchParams();
      
      params.append('metric', metric);
      if (period) params.append('period', period);
      if (limit) params.append('limit', limit.toString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const { data } = await api.get(url);
      return data;
    },
    enabled: !!teamId && !!metric
  });
}

/**
 * Hook para buscar comparação de performance entre equipes
 */
export function useTeamsComparison(teamIds: number[], metrics: string[], period?: string) {
  return useQuery({
    queryKey: ['/api/teams/comparison', teamIds, metrics, period],
    queryFn: async () => {
      let url = '/api/teams/comparison';
      const params = new URLSearchParams();
      
      params.append('teamIds', teamIds.join(','));
      params.append('metrics', metrics.join(','));
      if (period) params.append('period', period);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const { data } = await api.get(url);
      return data;
    },
    enabled: teamIds.length > 0 && metrics.length > 0
  });
}

/**
 * Hook para registrar uma nova atividade de usuário
 */
export function useLogUserActivity() {
  return useMutation({
    mutationFn: async (activityData: Omit<UserActivity, 'id' | 'createdAt'>) => {
      const { data } = await api.post('/api/user-activities', activityData);
      return data;
    }
  });
}

/**
 * Hook para buscar tendências de métricas ao longo do tempo
 */
export function useMetricTrend(metric: string, teamId?: number, userId?: number, period?: string, dateFrom?: Date, dateTo?: Date) {
  return useQuery({
    queryKey: ['/api/metrics/trend', metric, teamId, userId, period, dateFrom, dateTo],
    queryFn: async () => {
      let url = '/api/metrics/trend';
      const params = new URLSearchParams();
      
      params.append('metric', metric);
      if (teamId) params.append('teamId', teamId.toString());
      if (userId) params.append('userId', userId.toString());
      if (period) params.append('period', period);
      if (dateFrom) params.append('dateFrom', dateFrom.toISOString());
      if (dateTo) params.append('dateTo', dateTo.toISOString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const { data } = await api.get(url);
      return data;
    },
    enabled: !!metric
  });
}
