import { Router, Request, Response } from "express";

export function registerWebhookRoutes(app: Router) {
  // Rota para visualizar as mensagens recentes recebidas via webhook
  app.get("/api/webhooks/recent", async (req: Request, res: Response) => {
    try {
      const { db } = await import('../db');
      const { messages } = await import('../../shared/schema');
      const { desc, eq } = await import('drizzle-orm');
      
      // Buscar as 10 mensagens mais recentes recebidas via webhook
      const recentMessages = await db.query.messages.findMany({
        where: eq(messages.sender, "contact"),
        orderBy: [desc(messages.timestamp)],
        limit: 10,
        with: {
          conversation: {
            columns: {
              id: true,
              name: true,
              contactId: true
            }
          }
        }
      });
      
      res.json({
        success: true,
        messages: recentMessages.map(message => ({
          id: message.id,
          content: message.content,
          type: message.type,
          conversationId: message.conversationId,
          contactName: message.conversation?.name || "Desconhecido",
          timestamp: message.timestamp,
          metadata: message.metadata || {}
        }))
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