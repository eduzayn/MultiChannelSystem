import { Router, Request, Response } from 'express';
import { conversationService } from '../services/conversationService';
import { socketService } from '../services/socketService';
import { ServerEventTypes } from '../services/socketService';
import { kpiService } from '../services/kpiService';

/**
 * Rotas para gerenciamento de conversas com integração CRM e relatórios
 */
export function registerConversationRoutes(app: Router) {
  /**
   * Busca o contato associado a uma conversa
   */
  app.get('/api/conversations/:id/contact', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const contact = await conversationService.getConversationContact(parseInt(id, 10));
      
      if (!contact) {
        return res.status(404).json({ error: 'Contato não encontrado para esta conversa' });
      }
      
      res.json(contact);
    } catch (error) {
      console.error(`Erro ao buscar contato da conversa:`, error);
      res.status(500).json({ error: 'Erro ao buscar contato da conversa' });
    }
  });

  /**
   * Atualiza o status de uma conversa
   */
  app.put('/api/conversations/:id/status', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: 'Status é obrigatório' });
      }
      
      const conversation = await conversationService.updateConversationStatus(parseInt(id, 10), status);
      
      if (!conversation) {
        return res.status(404).json({ error: 'Conversa não encontrada' });
      }
      
      const userId = 1; // ID de usuário fixo para teste
      
      await conversationService.logConversationActivity(userId, parseInt(id, 10), 'update_status', { status });
      
      if (status === 'resolved') {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        
        await kpiService.updateCustomerServiceKpis(startOfDay, endOfDay);
        
        socketService.emit(ServerEventTypes.KPI_UPDATED, { 
          action: 'updated', 
          category: 'customer_service' 
        });
      }
      
      res.json(conversation);
    } catch (error) {
      console.error(`Erro ao atualizar status da conversa:`, error);
      res.status(500).json({ error: 'Erro ao atualizar status da conversa' });
    }
  });

  /**
   * Busca métricas de uma conversa
   */
  app.get('/api/conversations/:id/metrics', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const metrics = await conversationService.calculateConversationMetrics(parseInt(id, 10));
      
      res.json(metrics);
    } catch (error) {
      console.error(`Erro ao buscar métricas da conversa:`, error);
      res.status(500).json({ error: 'Erro ao buscar métricas da conversa' });
    }
  });
}
