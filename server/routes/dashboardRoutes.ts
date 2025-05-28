import { Router, Request, Response } from 'express';
import { dashboardService } from '../services/dashboardService';
import { socketService } from '../services/socketService';
import { ServerEventTypes } from '../services/socketService';

/**
 * Rotas para gerenciamento de dashboards
 */
export function registerDashboardRoutes(app: Router) {
  /**
   * Busca todos os dashboards
   */
  app.get('/api/dashboards', async (req: Request, res: Response) => {
    try {
      const { isPublic } = req.query as { isPublic?: string };
      const dashboards = await dashboardService.listDashboards(
        isPublic !== undefined ? isPublic === 'true' : undefined
      );
      res.json(dashboards);
    } catch (error) {
      console.error('Erro ao listar dashboards:', error);
      res.status(500).json({ error: 'Erro ao listar dashboards' });
    }
  });

  /**
   * Busca o dashboard padrão
   */
  app.get('/api/dashboards/default', async (req: Request, res: Response) => {
    try {
      const dashboard = await dashboardService.getDefaultDashboard();
      
      if (!dashboard) {
        return res.status(404).json({ error: 'Dashboard padrão não encontrado' });
      }
      
      res.json(dashboard);
    } catch (error) {
      console.error('Erro ao buscar dashboard padrão:', error);
      res.status(500).json({ error: 'Erro ao buscar dashboard padrão' });
    }
  });

  /**
   * Busca um dashboard específico
   */
  app.get('/api/dashboards/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const dashboard = await dashboardService.getDashboard(parseInt(id, 10));
      
      if (!dashboard) {
        return res.status(404).json({ error: 'Dashboard não encontrado' });
      }
      
      res.json(dashboard);
    } catch (error) {
      console.error(`Erro ao buscar dashboard:`, error);
      res.status(500).json({ error: 'Erro ao buscar dashboard' });
    }
  });

  /**
   * Busca widgets de um dashboard
   */
  app.get('/api/dashboards/:id/widgets', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const widgets = await dashboardService.listDashboardWidgets(parseInt(id, 10));
      res.json(widgets);
    } catch (error) {
      console.error(`Erro ao buscar widgets do dashboard:`, error);
      res.status(500).json({ error: 'Erro ao buscar widgets do dashboard' });
    }
  });

  /**
   * Busca dados de um widget específico
   */
  app.get('/api/dashboards/widgets/:id/data', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { dateFrom, dateTo } = req.query as { dateFrom?: string, dateTo?: string };
      
      const widget = await dashboardService.getDashboardWidget(parseInt(id, 10));
      
      if (!widget) {
        return res.status(404).json({ error: 'Widget não encontrado' });
      }
      
      const data = await dashboardService.getWidgetData(
        widget,
        dateFrom ? new Date(dateFrom) : undefined,
        dateTo ? new Date(dateTo) : undefined
      );
      
      res.json(data);
    } catch (error) {
      console.error(`Erro ao buscar dados do widget:`, error);
      res.status(500).json({ error: 'Erro ao buscar dados do widget' });
    }
  });

  /**
   * Cria um novo dashboard
   */
  app.post('/api/dashboards', async (req: Request, res: Response) => {
    try {
      const dashboardData = req.body;
      const newDashboard = await dashboardService.createDashboard(dashboardData);
      
      socketService.emit(ServerEventTypes.DASHBOARD_UPDATED, { action: 'created', dashboardId: newDashboard.id });
      
      res.status(201).json(newDashboard);
    } catch (error) {
      console.error('Erro ao criar dashboard:', error);
      res.status(500).json({ error: 'Erro ao criar dashboard' });
    }
  });

  /**
   * Atualiza um dashboard existente
   */
  app.put('/api/dashboards/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const dashboardData = req.body;
      
      const updatedDashboard = await dashboardService.updateDashboard(parseInt(id, 10), dashboardData);
      
      if (!updatedDashboard) {
        return res.status(404).json({ error: 'Dashboard não encontrado' });
      }
      
      socketService.emit(ServerEventTypes.DASHBOARD_UPDATED, { action: 'updated', dashboardId: updatedDashboard.id });
      
      res.json(updatedDashboard);
    } catch (error) {
      console.error(`Erro ao atualizar dashboard:`, error);
      res.status(500).json({ error: 'Erro ao atualizar dashboard' });
    }
  });

  /**
   * Exclui um dashboard
   */
  app.delete('/api/dashboards/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await dashboardService.deleteDashboard(parseInt(id, 10));
      
      if (!deleted) {
        return res.status(404).json({ error: 'Dashboard não encontrado' });
      }
      
      socketService.emit(ServerEventTypes.DASHBOARD_UPDATED, { action: 'deleted', dashboardId: parseInt(id, 10) });
      
      res.json({ success: true });
    } catch (error) {
      console.error(`Erro ao excluir dashboard:`, error);
      res.status(500).json({ error: 'Erro ao excluir dashboard' });
    }
  });

  /**
   * Cria um novo widget
   */
  app.post('/api/dashboards/widgets', async (req: Request, res: Response) => {
    try {
      const widgetData = req.body;
      const newWidget = await dashboardService.createDashboardWidget(widgetData);
      
      socketService.emit(ServerEventTypes.DASHBOARD_UPDATED, { 
        action: 'widget_created', 
        dashboardId: newWidget.dashboardId,
        widgetId: newWidget.id
      });
      
      res.status(201).json(newWidget);
    } catch (error) {
      console.error('Erro ao criar widget:', error);
      res.status(500).json({ error: 'Erro ao criar widget' });
    }
  });

  /**
   * Atualiza um widget existente
   */
  app.put('/api/dashboards/widgets/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const widgetData = req.body;
      
      const updatedWidget = await dashboardService.updateDashboardWidget(parseInt(id, 10), widgetData);
      
      if (!updatedWidget) {
        return res.status(404).json({ error: 'Widget não encontrado' });
      }
      
      socketService.emit(ServerEventTypes.DASHBOARD_UPDATED, { 
        action: 'widget_updated', 
        dashboardId: updatedWidget.dashboardId,
        widgetId: updatedWidget.id
      });
      
      res.json(updatedWidget);
    } catch (error) {
      console.error(`Erro ao atualizar widget:`, error);
      res.status(500).json({ error: 'Erro ao atualizar widget' });
    }
  });

  /**
   * Exclui um widget
   */
  app.delete('/api/dashboards/widgets/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const widget = await dashboardService.getDashboardWidget(parseInt(id, 10));
      
      if (!widget) {
        return res.status(404).json({ error: 'Widget não encontrado' });
      }
      
      const deleted = await dashboardService.deleteDashboardWidget(parseInt(id, 10));
      
      if (!deleted) {
        return res.status(500).json({ error: 'Erro ao excluir widget' });
      }
      
      socketService.emit(ServerEventTypes.DASHBOARD_UPDATED, { 
        action: 'widget_deleted', 
        dashboardId: widget.dashboardId,
        widgetId: parseInt(id, 10)
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error(`Erro ao excluir widget:`, error);
      res.status(500).json({ error: 'Erro ao excluir widget' });
    }
  });
}
