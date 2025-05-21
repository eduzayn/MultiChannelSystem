import { Router, Request, Response } from "express";
import { getZapiQRCode, testZapiConnection, sendTextMessage, disconnectZapi } from "../services/zapiService";

export function registerZapiRoutes(app: Router) {
  // Rota para receber webhooks da Z-API
  app.post("/api/zapi/webhook/:tenantId/:channelId", async (req: Request, res: Response) => {
    try {
      const { tenantId, channelId } = req.params;
      const webhookData = req.body;
      
      console.log(`Webhook Z-API recebido para tenant ${tenantId}, canal ${channelId}:`, 
        JSON.stringify(webhookData, null, 2));
      
      // Identificar o tipo de evento baseado na estrutura dos dados
      const isMessageEvent = webhookData.phone || 
        (webhookData.message && webhookData.messageId) || 
        (webhookData.isGroupMsg !== undefined);
      
      const isStatusEvent = webhookData.status && webhookData.id;
      
      const isDisconnectEvent = webhookData.connected === false && 
        webhookData.error && 
        webhookData.error.includes("Device has been disconnected");
      
      const isConnectEvent = webhookData.connected === true && 
        webhookData.smartphoneConnected === true;
        
      const isChatStatusEvent = webhookData.presence && 
        (webhookData.presence === "available" || webhookData.presence === "unavailable" || 
         webhookData.presence === "composing" || webhookData.presence === "recording");
      
      // Processar baseado no tipo de evento
      if (isMessageEvent) {
        // Ao receber - Mensagem recebida
        console.log(`[Z-API][AO RECEBER] Mensagem recebida no WhatsApp do tenant ${tenantId}, canal ${channelId}`);
        console.log(`  De: ${webhookData.phone || webhookData.sender}`);
        console.log(`  Tipo: ${webhookData.type || "text"}`);
        console.log(`  Conteúdo: ${webhookData.body || webhookData.message || JSON.stringify(webhookData.text || webhookData.content || {})}`);
        
        // Processar a mensagem recebida
        try {
          const { db } = await import('../db');
          const { conversations, messages, contacts } = await import('../../shared/schema');
          const { eq, and, desc } = await import('drizzle-orm');
          
          // Formatar o número no padrão internacional
          const senderPhone = webhookData.phone || webhookData.sender || "";
          const formattedPhone = senderPhone.replace(/\D/g, "");
          
          // Obter o tipo e conteúdo da mensagem
          const messageType = webhookData.type || "text";
          const messageContent = webhookData.body || webhookData.message || 
                                JSON.stringify(webhookData.text || webhookData.content || {});
          
          // Verificar se já existe um contato com este número
          let contact = await db.query.contacts.findFirst({
            where: eq(contacts.phone, formattedPhone)
          });
          
          // Se não existe contato, criar um novo
          if (!contact) {
            const name = webhookData.senderName || `WhatsApp ${formattedPhone}`;
            
            const [newContact] = await db.insert(contacts)
              .values({
                name,
                phone: formattedPhone,
                notes: `Contato criado automaticamente a partir de mensagem do WhatsApp`
              })
              .returning();
              
            contact = newContact;
            console.log(`[Z-API] Novo contato criado: ${name} (${formattedPhone})`);
          }
          
          // Verificar se já existe uma conversa com este contato no canal WhatsApp
          let conversation = await db.query.conversations.findFirst({
            where: and(
              eq(conversations.contactId, contact.id),
              eq(conversations.channel, "whatsapp")
            )
          });
          
          // Se não existe conversa, criar uma nova
          if (!conversation) {
            const [newConversation] = await db.insert(conversations)
              .values({
                name: contact.name,
                channel: "whatsapp",
                contactId: contact.id,
                status: "open",
                lastMessage: messageContent,
                lastMessageAt: new Date(),
                unreadCount: 1
              })
              .returning();
              
            conversation = newConversation;
            console.log(`[Z-API] Nova conversa criada para o contato: ${contact.name}`);
          } else {
            // Atualizar a conversa existente
            await db.update(conversations)
              .set({
                lastMessage: messageContent,
                lastMessageAt: new Date(),
                unreadCount: (conversation.unreadCount || 0) + 1,
                status: "open" // Reabrir se estava fechada
              })
              .where(eq(conversations.id, conversation.id));
            
            console.log(`[Z-API] Conversa atualizada para o contato: ${contact.name}`);
          }
          
          // Salvar a mensagem recebida
          const messageMetadata = {
            zapiInstanceId: channelId,
            zapiMessageId: webhookData.id || null,
            fromMe: false,
            receivedAt: new Date()
          };
          
          await db.insert(messages)
            .values({
              conversationId: conversation.id,
              content: messageContent,
              type: messageType,
              sender: "contact", // Mensagem recebida, então é do contato
              status: "delivered",
              metadata: messageMetadata,
              timestamp: new Date()
            });
          
          console.log(`[Z-API] Mensagem salva com sucesso para a conversa: ${conversation.id}`);
        } catch (error) {
          console.error(`[Z-API] Erro ao processar mensagem recebida:`, error);
        }
      } 
      else if (isStatusEvent) {
        // Ao atualizar status
        console.log(`[Z-API][STATUS] Status da mensagem atualizado para tenant ${tenantId}, canal ${channelId}`);
        console.log(`  MessageID: ${webhookData.id}`);
        console.log(`  Status: ${webhookData.status}`); // SENT, RECEIVED, READ
        
        // TODO: Atualizar status da mensagem no banco de dados
      } 
      else if (isDisconnectEvent) {
        // Ao desconectar
        console.log(`[Z-API][DESCONECTAR] WhatsApp desconectado para tenant ${tenantId}, canal ${channelId}`);
        console.log(`  Erro: ${webhookData.error}`);
        
        // TODO: Notificar desconexão para atualizações na interface
      } 
      else if (isConnectEvent) {
        // Ao conectar
        console.log(`[Z-API][CONECTAR] WhatsApp conectado para tenant ${tenantId}, canal ${channelId}`);
        
        // TODO: Atualizar estado da conexão no banco de dados
      } 
      else if (isChatStatusEvent) {
        // Status do chat (digitando, gravando, online/offline)
        console.log(`[Z-API][CHAT STATUS] Status do chat atualizado para tenant ${tenantId}, canal ${channelId}`);
        console.log(`  Telefone: ${webhookData.phone || webhookData.sender}`);
        console.log(`  Status: ${webhookData.presence}`);
        
        // TODO: Notificar atualizações de status do chat para a interface
      } 
      else if (webhookData.ack !== undefined && webhookData.id) {
        // Ao enviar - Confirmação de mensagem enviada
        console.log(`[Z-API][AO ENVIAR] Confirmação de envio para tenant ${tenantId}, canal ${channelId}`);
        console.log(`  MessageID: ${webhookData.id}`);
        console.log(`  ACK: ${webhookData.ack}`); // 1=enviado, 2=recebido, 3=lido
        
        // TODO: Atualizar status de envio no banco de dados
      } 
      else {
        // Outro tipo de evento
        console.log(`[Z-API][OUTRO] Evento não identificado para tenant ${tenantId}, canal ${channelId}:`, 
          JSON.stringify(webhookData));
      }
      
      // Confirmar recebimento para a Z-API
      // Z-API espera um status 200, não importa o corpo da resposta
      res.status(200).json({
        success: true,
        message: "Webhook processado com sucesso",
      });
    } catch (error) {
      console.error("[Z-API][ERRO] Erro ao processar webhook Z-API:", error);
      // Mesmo com erro, respondemos 200 para a Z-API não reenviar
      res.status(200).json({
        success: false,
        message: "Erro ao processar webhook, mas confirmando recebimento",
      });
    }
  });
  // Rota para obter o QR Code da Z-API
  app.post("/api/zapi/get-qrcode", async (req: Request, res: Response) => {
    try {
      const { instanceId, token, clientToken } = req.body;
      
      if (!instanceId || !token) {
        return res.status(400).json({
          success: false,
          message: "Instance ID e Token são obrigatórios",
        });
      }
      
      const result = await getZapiQRCode(instanceId, token, clientToken);
      res.json(result);
    } catch (error) {
      console.error("Erro na rota de QR Code:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  });
  
  // Rota para testar a conexão com a Z-API
  app.post("/api/zapi/test-connection", async (req: Request, res: Response) => {
    try {
      const { instanceId, token, clientToken } = req.body;
      
      if (!instanceId || !token) {
        return res.status(400).json({
          success: false,
          message: "Instance ID e Token são obrigatórios",
        });
      }
      
      const result = await testZapiConnection(instanceId, token, clientToken);
      res.json(result);
    } catch (error) {
      console.error("Erro na rota de teste de conexão:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  });
  
  // Rota para enviar mensagem de texto via Z-API
  app.post("/api/zapi/send-message", async (req: Request, res: Response) => {
    try {
      const { instanceId, token, clientToken, phone, message } = req.body;
      
      if (!instanceId || !token || !phone || !message) {
        return res.status(400).json({
          success: false,
          message: "Instance ID, Token, número de telefone e mensagem são obrigatórios",
        });
      }
      
      const result = await sendTextMessage(instanceId, token, phone, message, clientToken);
      res.json(result);
    } catch (error) {
      console.error("Erro na rota de envio de mensagem:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  });
  
  // Rota para desconectar WhatsApp da Z-API
  app.post("/api/zapi/disconnect", async (req: Request, res: Response) => {
    try {
      const { instanceId, token, clientToken } = req.body;
      
      if (!instanceId || !token) {
        return res.status(400).json({
          success: false,
          message: "Instance ID e Token são obrigatórios",
        });
      }
      
      const result = await disconnectZapi(instanceId, token, clientToken);
      res.json(result);
    } catch (error) {
      console.error("Erro na rota de desconexão:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  });
}