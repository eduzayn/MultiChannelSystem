import { Router, Request, Response } from 'express';
import { userActivityService } from '../services/userActivityService';
import { socketService } from '../services/socketService';
import { ServerEventTypes } from '../services/socketService';
import { z } from 'zod';

/**
 * Schema de validação para registro de atividade
 */
const logActivitySchema = z.object({
  userId: z.number(),
  activityType: z.string(),
  entityType: z.string().optional(),
  entityId: z.union([z.string(), z.number()]).optional(),
  details: z.any().optional(),
  performedAt: z.string().transform(val => new Date(val)),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional()
});

/**
 * Rotas para gerenciamento de atividades do usuário
 */
export function registerUserActivityRoutes(app: Router) {
  /**
   * Registra uma nova atividade do usuário
   */
  app.post('/api/user-activities', async (req: Request, res: Response) => {
    try {
      const validationResult = logActivitySchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: validationResult.error.format() 
        });
      }
      
      const activityData = validationResult.data;
      
      if (req.ip) {
        activityData.ipAddress = req.ip;
      }
      
      if (req.headers['user-agent']) {
        activityData.userAgent = req.headers['user-agent'];
      }
      
      const activity = await userActivityService.logActivity(activityData);
      
      socketService.emit(ServerEventTypes.TEAM_METRICS_UPDATED, {
        userId: activityData.userId,
        activityType: activityData.activityType,
        timestamp: activityData.performedAt
      });
      
      res.status(201).json(activity);
    } catch (error) {
      console.error('Erro ao registrar atividade do usuário:', error);
      res.status(500).json({ error: 'Erro ao registrar atividade do usuário' });
    }
  });

  /**
   * Busca atividades de um usuário específico
   */
  app.get('/api/users/:userId/activities', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { limit, offset, dateFrom, dateTo, activityType } = req.query;
      
      const options: {
        limit?: number;
        offset?: number;
        dateFrom?: Date;
        dateTo?: Date;
        activityType?: string;
      } = {};
      
      if (limit) options.limit = parseInt(limit as string, 10);
      if (offset) options.offset = parseInt(offset as string, 10);
      if (dateFrom) options.dateFrom = new Date(dateFrom as string);
      if (dateTo) options.dateTo = new Date(dateTo as string);
      if (activityType) options.activityType = activityType as string;
      
      const activities = await userActivityService.getUserActivities(
        parseInt(userId, 10),
        options
      );
      
      res.json(activities);
    } catch (error) {
      console.error('Erro ao buscar atividades do usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar atividades do usuário' });
    }
  });

  /**
   * Busca atividades recentes de todos os usuários
   */
  app.get('/api/user-activities/recent', async (req: Request, res: Response) => {
    try {
      const { limit } = req.query;
      const limitNum = limit ? parseInt(limit as string, 10) : 20;
      
      const activities = await userActivityService.getRecentActivities(limitNum);
      
      res.json(activities);
    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error);
      res.status(500).json({ error: 'Erro ao buscar atividades recentes' });
    }
  });

  /**
   * Calcula métricas de produtividade para um usuário
   */
  app.get('/api/users/:userId/productivity', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { dateFrom, dateTo } = req.query;
      
      if (!dateFrom || !dateTo) {
        return res.status(400).json({ error: 'Parâmetros dateFrom e dateTo são obrigatórios' });
      }
      
      const productivity = await userActivityService.calculateUserProductivity(
        parseInt(userId, 10),
        new Date(dateFrom as string),
        new Date(dateTo as string)
      );
      
      res.json(productivity);
    } catch (error) {
      console.error('Erro ao calcular produtividade do usuário:', error);
      res.status(500).json({ error: 'Erro ao calcular produtividade do usuário' });
    }
  });
}
