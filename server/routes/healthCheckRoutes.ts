import { Router, Request, Response } from 'express';
import { healthCheckService } from '../services/healthCheckService';

/**
 * Rotas para monitoramento de saúde do sistema
 */
export function registerHealthCheckRoutes(app: Router) {
  /**
   * Endpoint para verificar saúde do sistema
   */
  app.get('/api/health', async (req: Request, res: Response) => {
    try {
      const healthStatus = healthCheckService.getHealthStatus();
      
      const isHealthy = healthStatus.database && 
                        healthStatus.websocket && 
                        healthStatus.memory;
      
      if (isHealthy) {
        res.json({
          status: 'healthy',
          details: healthStatus
        });
      } else {
        res.status(503).json({
          status: 'unhealthy',
          details: healthStatus
        });
      }
    } catch (error) {
      console.error('Erro ao verificar saúde do sistema:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'Erro ao verificar saúde do sistema'
      });
    }
  });

  /**
   * Endpoint para iniciar monitoramento de saúde
   */
  app.post('/api/health/start', (req: Request, res: Response) => {
    try {
      const { interval } = req.body;
      
      healthCheckService.startHealthCheck(interval);
      
      res.json({
        status: 'success',
        message: 'Monitoramento de saúde iniciado'
      });
    } catch (error) {
      console.error('Erro ao iniciar monitoramento de saúde:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'Erro ao iniciar monitoramento de saúde'
      });
    }
  });

  /**
   * Endpoint para parar monitoramento de saúde
   */
  app.post('/api/health/stop', (req: Request, res: Response) => {
    try {
      healthCheckService.stopHealthCheck();
      
      res.json({
        status: 'success',
        message: 'Monitoramento de saúde interrompido'
      });
    } catch (error) {
      console.error('Erro ao parar monitoramento de saúde:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'Erro ao parar monitoramento de saúde'
      });
    }
  });
}
