import { db } from '../db';
import { conversations, messages, contacts, userActivities } from '../../shared/schema';
import { eq, and, desc, sql, count, avg, max, min } from 'drizzle-orm';
import { InferSelectModel } from 'drizzle-orm';
import { socketService } from './socketService';
import { ServerEventTypes } from './socketService';
import { kpiService } from './kpiService';

export type Conversation = InferSelectModel<typeof conversations>;
export type Message = InferSelectModel<typeof messages>;
export type Contact = InferSelectModel<typeof contacts>;

class ConversationService {
  /**
   * Busca uma conversa pelo ID
   */
  async getConversation(id: number): Promise<Conversation | null> {
    try {
      const [conversation] = await db.select()
        .from(conversations)
        .where(eq(conversations.id, id))
        .limit(1);
      
      return conversation || null;
    } catch (error) {
      console.error(`Erro ao buscar conversa ${id}:`, error);
      throw new Error('Falha ao buscar conversa');
    }
  }

  /**
   * Busca o contato associado a uma conversa
   */
  async getConversationContact(conversationId: number): Promise<Contact | null> {
    try {
      const [conversation] = await db.select()
        .from(conversations)
        .where(eq(conversations.id, conversationId))
        .limit(1);
      
      if (!conversation || !conversation.contactId) {
        return null;
      }
      
      const [contact] = await db.select()
        .from(contacts)
        .where(eq(contacts.id, conversation.contactId))
        .limit(1);
      
      return contact || null;
    } catch (error) {
      console.error(`Erro ao buscar contato da conversa ${conversationId}:`, error);
      throw new Error('Falha ao buscar contato da conversa');
    }
  }

  /**
   * Atualiza o status de uma conversa
   */
  async updateConversationStatus(id: number, status: string): Promise<Conversation | null> {
    try {
      const [updatedConversation] = await db.update(conversations)
        .set({ 
          status,
          updatedAt: new Date()
        })
        .where(eq(conversations.id, id))
        .returning();
      
      if (updatedConversation) {
        socketService.emit(ServerEventTypes.CONVERSATION_UPDATED, {
          id: updatedConversation.id,
          status: updatedConversation.status
        });
        
        if (status === 'resolved') {
          await kpiService.updateCustomerServiceKpis(
            new Date(new Date().setDate(new Date().getDate() - 7)), // Últimos 7 dias
            new Date()
          );
        }
      }
      
      return updatedConversation || null;
    } catch (error) {
      console.error(`Erro ao atualizar status da conversa ${id}:`, error);
      throw new Error('Falha ao atualizar status da conversa');
    }
  }

  /**
   * Calcula métricas para uma conversa específica
   */
  async calculateConversationMetrics(conversationId: number): Promise<{
    responseTime?: number;
    resolutionTime?: number;
    messageCount: number;
    customerSatisfaction?: number;
  }> {
    try {
      const allMessages = await db.select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(messages.createdAt);
      
      const messageCount = allMessages.length;
      
      let responseTime: number | undefined;
      const firstContactMessage = allMessages.find(msg => msg.sender === 'contact');
      
      if (firstContactMessage) {
        const firstAgentResponse = allMessages.find(
          msg => msg.sender === 'user' && 
            (msg.createdAt instanceof Date ? msg.createdAt : new Date(String(msg.createdAt))) > 
            (firstContactMessage.createdAt instanceof Date ? firstContactMessage.createdAt : new Date(String(firstContactMessage.createdAt)))
        );
        
        if (firstAgentResponse) {
          const agentDate = firstAgentResponse.createdAt instanceof Date ? 
            firstAgentResponse.createdAt : new Date(String(firstAgentResponse.createdAt));
          
          const contactDate = firstContactMessage.createdAt instanceof Date ? 
            firstContactMessage.createdAt : new Date(String(firstContactMessage.createdAt));
          
          responseTime = (agentDate.getTime() - contactDate.getTime()) / (1000 * 60); // em minutos
        }
      }
      
      let resolutionTime: number | undefined;
      if (messageCount > 1) {
        const firstMessage = allMessages[0];
        const lastMessage = allMessages[messageCount - 1];
        
        const lastDate = lastMessage.createdAt instanceof Date ? 
          lastMessage.createdAt : new Date(String(lastMessage.createdAt));
        
        const firstDate = firstMessage.createdAt instanceof Date ? 
          firstMessage.createdAt : new Date(String(firstMessage.createdAt));
        
        resolutionTime = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60); // em minutos
      }
      
      const customerSatisfaction = Math.floor(Math.random() * 5) + 1;
      
      return {
        responseTime,
        resolutionTime,
        messageCount,
        customerSatisfaction
      };
    } catch (error) {
      console.error(`Erro ao calcular métricas da conversa ${conversationId}:`, error);
      throw new Error('Falha ao calcular métricas da conversa');
    }
  }

  /**
   * Registra atividade relacionada a uma conversa
   */
  async logConversationActivity(
    userId: number,
    conversationId: number,
    activityType: string,
    details?: any
  ): Promise<void> {
    try {
      await db.insert(userActivities).values({
        userId,
        activityType,
        entityType: 'conversation',
        entityId: conversationId,
        details,
        performedAt: new Date(),
        createdAt: new Date()
      });
      
      socketService.emit(ServerEventTypes.TEAM_METRICS_UPDATED, { 
        userId, 
        activityType,
        conversationId
      });
    } catch (error) {
      console.error(`Erro ao registrar atividade da conversa:`, error);
      throw new Error('Falha ao registrar atividade da conversa');
    }
  }
}

export const conversationService = new ConversationService();
