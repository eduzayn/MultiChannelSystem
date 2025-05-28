import { db } from '../db';
import { userActivities, insertUserActivitySchema } from '../../shared/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { InferSelectModel } from 'drizzle-orm';
import { socketService } from './socketService';
import { ServerEventTypes } from './socketService';
import { z } from 'zod';

export type UserActivity = InferSelectModel<typeof userActivities>;
export type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;

class UserActivityService {
  /**
   * Registra uma nova atividade do usuário
   */
  async logActivity(activityData: {
    userId: number;
    activityType: string;
    entityType?: string;
    entityId?: string | number;
    details?: any;
    performedAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<UserActivity> {
    try {
      const activityToInsert: InsertUserActivity = {
        userId: activityData.userId,
        activityType: activityData.activityType,
        entityType: activityData.entityType,
        entityId: typeof activityData.entityId === 'string' 
          ? parseInt(activityData.entityId, 10) 
          : activityData.entityId,
        details: activityData.details,
        performedAt: activityData.performedAt,
        ipAddress: activityData.ipAddress,
        userAgent: activityData.userAgent
      };
      
      const inserted = await db.insert(userActivities)
        .values(activityToInsert)
        .returning();
      
      const activity = inserted[0];
      
      socketService.emit(ServerEventTypes.TEAM_METRICS_UPDATED, {
        userId: activityData.userId,
        activityType: activityData.activityType
      });
      
      return activity;
    } catch (error) {
      console.error('Erro ao registrar atividade do usuário:', error);
      throw new Error('Falha ao registrar atividade do usuário');
    }
  }

  /**
   * Busca atividades de um usuário específico
   */
  async getUserActivities(userId: number, options: {
    limit?: number;
    offset?: number;
    dateFrom?: Date;
    dateTo?: Date;
    activityType?: string;
  } = {}): Promise<UserActivity[]> {
    try {
      const { limit = 50, offset = 0, dateFrom, dateTo, activityType } = options;
      
      const conditions = [eq(userActivities.userId, userId)];
      
      if (dateFrom) {
        conditions.push(gte(userActivities.performedAt, dateFrom));
      }
      
      if (dateTo) {
        conditions.push(lte(userActivities.performedAt, dateTo));
      }
      
      if (activityType) {
        conditions.push(eq(userActivities.activityType, activityType));
      }
      
      const query = db.select()
        .from(userActivities)
        .where(and(...conditions))
        .orderBy(desc(userActivities.performedAt))
        .limit(limit)
        .offset(offset);
      
      return await query;
    } catch (error) {
      console.error('Erro ao buscar atividades do usuário:', error);
      throw new Error('Falha ao buscar atividades do usuário');
    }
  }

  /**
   * Calcula métricas de produtividade para um usuário
   */
  async calculateUserProductivity(userId: number, dateFrom: Date, dateTo: Date): Promise<{
    messagesSent: number;
    conversationsHandled: number;
    averageResponseTime: number;
    resolutionRate: number;
    activitiesCount: Record<string, number>;
  }> {
    try {
      const activities = await this.getUserActivities(userId, { dateFrom, dateTo });
      
      const activitiesCount: Record<string, number> = {};
      activities.forEach(activity => {
        activitiesCount[activity.activityType] = (activitiesCount[activity.activityType] || 0) + 1;
      });
      
      const messagesSent = activitiesCount['send_message'] || 0;
      const conversationsHandled = activitiesCount['view_conversation'] || 0;
      
      const averageResponseTime = this.calculateAverageResponseTime(activities);
      const resolutionRate = this.calculateResolutionRate(activities);
      
      return {
        messagesSent,
        conversationsHandled,
        averageResponseTime,
        resolutionRate,
        activitiesCount
      };
    } catch (error) {
      console.error('Erro ao calcular produtividade do usuário:', error);
      throw new Error('Falha ao calcular produtividade do usuário');
    }
  }

  /**
   * Calcula o tempo médio de resposta com base nas atividades
   * Este é um cálculo simplificado para demonstração
   */
  private calculateAverageResponseTime(activities: UserActivity[]): number {
    const responseTimes: number[] = [];
    
    const messageReceivedActivities = activities.filter(a => a.activityType === 'message_received');
    
    messageReceivedActivities.forEach(receivedActivity => {
      // Verificar se performedAt existe
      if (!receivedActivity.performedAt) return;
      
      const receivedTime = receivedActivity.performedAt;
      
      const responseActivity = activities.find(a => 
        a.activityType === 'send_message' && 
        a.performedAt && // Verificar se performedAt existe
        a.entityId === receivedActivity.entityId &&
        a.performedAt > receivedTime // Usar a variável local que já foi verificada
      );
      
      if (responseActivity && responseActivity.performedAt) {
        const responseTime = (responseActivity.performedAt.getTime() - receivedTime.getTime()) / (1000 * 60);
        responseTimes.push(responseTime);
      }
    });
    
    if (responseTimes.length === 0) return 0;
    
    const sum = responseTimes.reduce((acc, time) => acc + time, 0);
    return sum / responseTimes.length;
  }

  /**
   * Calcula a taxa de resolução com base nas atividades
   * Este é um cálculo simplificado para demonstração
   */
  private calculateResolutionRate(activities: UserActivity[]): number {
    const conversationActivities = activities.filter(a => 
      a.activityType === 'update_conversation_status' && 
      a.details && 
      typeof a.details === 'object'
    );
    
    const resolvedCount = conversationActivities.filter(a => 
      a.details && 
      typeof a.details === 'object' && 
      'status' in a.details && 
      a.details.status === 'resolved'
    ).length;
    
    if (conversationActivities.length === 0) return 0;
    
    return resolvedCount / conversationActivities.length;
  }

  /**
   * Busca atividades recentes de todos os usuários
   */
  async getRecentActivities(limit = 20): Promise<UserActivity[]> {
    try {
      const query = db.select()
        .from(userActivities)
        .orderBy(desc(userActivities.performedAt))
        .limit(limit);
      
      return await query;
    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error);
      throw new Error('Falha ao buscar atividades recentes');
    }
  }
}

export const userActivityService = new UserActivityService();
