import { Router, Request, Response } from 'express';
import { kpiService } from '../services/kpiService';
import { socketService } from '../services/socketService';
import { ServerEventTypes } from '../services/socketService';

/**
 * Rotas para gerenciamento de KPIs
 */
export function registerKpiRoutes(app: Router) {
  /**
   * Busca todos os KPIs
   */
  app.get('/api/kpis', async (req: Request, res: Response) => {
    try {
      const { category } = req.query as { category?: string };
      const kpis = await kpiService.listKpis(category);
      res.json(kpis);
    } catch (error) {
      console.error('Erro ao listar KPIs:', error);
      res.status(500).json({ error: 'Erro ao listar KPIs' });
    }
  });

  /**
   * Busca um KPI específico
   */
  app.get('/api/kpis/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const kpi = await kpiService.getKpi(parseInt(id, 10));
      
      if (!kpi) {
        return res.status(404).json({ error: 'KPI não encontrado' });
      }
      
      res.json(kpi);
    } catch (error) {
      console.error(`Erro ao buscar KPI:`, error);
      res.status(500).json({ error: 'Erro ao buscar KPI' });
    }
  });

  /**
   * Busca valores históricos de um KPI
   */
  app.get('/api/kpis/:id/values', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { periodType, limit } = req.query as { periodType?: string, limit?: string };
      
      const values = await kpiService.getKpiValues(
        parseInt(id, 10),
        periodType,
        limit ? parseInt(limit, 10) : undefined
      );
      
      res.json(values);
    } catch (error) {
      console.error(`Erro ao buscar valores de KPI:`, error);
      res.status(500).json({ error: 'Erro ao buscar valores de KPI' });
    }
  });

  /**
   * Cria um novo KPI
   */
  app.post('/api/kpis', async (req: Request, res: Response) => {
    try {
      const kpiData = req.body;
      const newKpi = await kpiService.createKpi(kpiData);
      
      socketService.emit(ServerEventTypes.KPI_UPDATED, { action: 'created', kpiId: newKpi.id });
      
      res.status(201).json(newKpi);
    } catch (error) {
      console.error('Erro ao criar KPI:', error);
      res.status(500).json({ error: 'Erro ao criar KPI' });
    }
  });

  /**
   * Atualiza um KPI existente
   */
  app.put('/api/kpis/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const kpiData = req.body;
      
      const updatedKpi = await kpiService.updateKpi(parseInt(id, 10), kpiData);
      
      if (!updatedKpi) {
        return res.status(404).json({ error: 'KPI não encontrado' });
      }
      
      socketService.emit(ServerEventTypes.KPI_UPDATED, { action: 'updated', kpiId: updatedKpi.id });
      
      res.json(updatedKpi);
    } catch (error) {
      console.error(`Erro ao atualizar KPI:`, error);
      res.status(500).json({ error: 'Erro ao atualizar KPI' });
    }
  });

  /**
   * Exclui um KPI
   */
  app.delete('/api/kpis/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await kpiService.deleteKpi(parseInt(id, 10));
      
      if (!deleted) {
        return res.status(404).json({ error: 'KPI não encontrado' });
      }
      
      socketService.emit(ServerEventTypes.KPI_UPDATED, { action: 'deleted', kpiId: parseInt(id, 10) });
      
      res.json({ success: true });
    } catch (error) {
      console.error(`Erro ao excluir KPI:`, error);
      res.status(500).json({ error: 'Erro ao excluir KPI' });
    }
  });

  /**
   * Atualiza KPIs de atendimento para um período específico
   */
  app.post('/api/kpis/update-customer-service', async (req: Request, res: Response) => {
    try {
      const { dateFrom, dateTo } = req.body;
      
      await kpiService.updateCustomerServiceKpis(new Date(dateFrom), new Date(dateTo));
      
      socketService.emit(ServerEventTypes.KPI_UPDATED, { action: 'batch_updated', category: 'customer_service' });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Erro ao atualizar KPIs de atendimento:', error);
      res.status(500).json({ error: 'Erro ao atualizar KPIs de atendimento' });
    }
  });

  /**
   * Atualiza KPIs de vendas para um período específico
   */
  app.post('/api/kpis/update-sales', async (req: Request, res: Response) => {
    try {
      const { dateFrom, dateTo } = req.body;
      
      await kpiService.updateSalesKpis(new Date(dateFrom), new Date(dateTo));
      
      socketService.emit(ServerEventTypes.KPI_UPDATED, { action: 'batch_updated', category: 'sales' });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Erro ao atualizar KPIs de vendas:', error);
      res.status(500).json({ error: 'Erro ao atualizar KPIs de vendas' });
    }
  });
}
