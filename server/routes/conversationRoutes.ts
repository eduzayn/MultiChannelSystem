import { Router, Request, Response } from 'express';
import { conversationService } from '../services/conversationService';
import { socketService } from '../services/socketService';
import { ServerEventTypes } from '../services/socketService';
import { kpiService } from '../services/kpiService';
import { db } from '../db';
import { conversations, messages } from '../../shared/schema';
import { eq, desc, count } from 'drizzle-orm';

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
  
  /**
   * Busca histórico de conversas para um contato
   */
  app.get('/api/contacts/:contactId/conversations', async (req: Request, res: Response) => {
    try {
      const { contactId } = req.params;
      const { limit = '5', offset = '0' } = req.query;
      
      if (!contactId || isNaN(parseInt(contactId, 10))) {
        return res.status(400).json({ error: 'ID de contato inválido' });
      }
      
      const contactIdNum = parseInt(contactId, 10);
      const limitNum = parseInt(limit as string, 10);
      const offsetNum = parseInt(offset as string, 10);
      
      const conversationsResult = await db.select({
        id: conversations.id,
        contactId: conversations.contactId,
        channel: conversations.channel,
        name: conversations.name,
        status: conversations.status,
        lastMessage: conversations.lastMessage,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt
      })
      .from(conversations)
      .where(eq(conversations.contactId, contactIdNum))
      .orderBy(desc(conversations.createdAt))
      .limit(limitNum)
      .offset(offsetNum);
      
      const conversationsWithMetrics = await Promise.all(
        conversationsResult.map(async (conversation) => {
          const messagesCountResult = await db.select({
            count: count()
          })
          .from(messages)
          .where(eq(messages.conversationId, conversation.id));
          
          const messageCount = messagesCountResult[0]?.count || 0;
          
          let resolutionTime: number | undefined;
          
          if (conversation.status === 'resolved') {
            const firstMessageResult = await db.select({
              createdAt: messages.timestamp
            })
            .from(messages)
            .where(eq(messages.conversationId, conversation.id))
            .orderBy(messages.timestamp)
            .limit(1);
            
            const lastMessageResult = await db.select({
              createdAt: messages.timestamp
            })
            .from(messages)
            .where(eq(messages.conversationId, conversation.id))
            .orderBy(desc(messages.timestamp))
            .limit(1);
            
            if (firstMessageResult.length > 0 && lastMessageResult.length > 0) {
              const firstDate = firstMessageResult[0].createdAt;
              const lastDate = lastMessageResult[0].createdAt;
              
              if (firstDate && lastDate) {
                const firstTime = firstDate instanceof Date ? firstDate.getTime() : new Date(String(firstDate)).getTime();
                const lastTime = lastDate instanceof Date ? lastDate.getTime() : new Date(String(lastDate)).getTime();
                
                resolutionTime = Math.round((lastTime - firstTime) / (1000 * 60)); // em minutos
              }
            }
          }
          
          return {
            ...conversation,
            messageCount,
            resolutionTime
          };
        })
      );
      
      socketService.emit(ServerEventTypes.TEAM_METRICS_UPDATED, {
        contactId: contactIdNum,
        action: 'view_history'
      });
      
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      
      kpiService.updateCustomerServiceKpis(startOfDay, new Date())
        .catch(err => console.error('Erro ao atualizar KPIs após visualização de histórico:', err));
      
      res.json(conversationsWithMetrics);
    } catch (error) {
      console.error(`Erro ao buscar conversas do contato:`, error);
      res.status(500).json({ error: 'Erro ao buscar conversas do contato' });
    }
  });
}
