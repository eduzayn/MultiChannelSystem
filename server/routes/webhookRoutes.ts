import { Router, Request, Response } from "express";

export function registerWebhookRoutes(app: Router) {
  // Rota para visualizar as mensagens recentes recebidas via webhook
  app.get("/api/webhooks/recent", async (req: Request, res: Response) => {
    try {
      const { db } = await import('../db');
      const { messages, conversations } = await import('../../shared/schema');
      const { desc, eq } = await import('drizzle-orm');
      
      // Buscar as 10 mensagens mais recentes recebidas via webhook
      const recentMessages = await db.query.messages.findMany({
        where: eq(messages.sender, "contact"),
        orderBy: [desc(messages.timestamp)],
        limit: 10,
      });
      
      // Processar as mensagens para adicionar nome do contato
      const result = await Promise.all(recentMessages.map(async (message) => {
        // Buscar a conversa para esta mensagem
        const conversation = await db.query.conversations.findFirst({
          where: eq(conversations.id, message.conversationId)
        });
        
        return {
          id: message.id,
          content: message.content,
          type: message.type || "text",
          conversationId: message.conversationId,
          contactName: conversation ? conversation.name : "Desconhecido",
          timestamp: message.timestamp,
          metadata: message.metadata || {}
        };
      }));
      
      res.json({
        success: true,
        messages: result
      });
    } catch (error) {
      console.error("Erro ao buscar webhooks recentes:", error);
      res.status(500).json({ 
        success: false, 
        message: "Erro ao buscar webhooks recentes",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
}