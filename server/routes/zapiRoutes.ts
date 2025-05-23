import { Router, Request, Response } from "express";
import { 
  getZapiQRCode, 
  testZapiConnection, 
  sendTextMessage, 
  forwardMessage,
  disconnectZapi,
  getZapiContacts,
  getZapiContactInfo,
  sendReaction,
  removeReaction,
  sendAudio,
  sendVideo,
  sendDocument,
  sendLink
} from "../services/zapiService";

export function registerZapiRoutes(app: Router) {
  // Rota para obter credenciais da Z-API para um canal específico
  app.get("/api/zapi/channels/:channelId/credentials", async (req: Request, res: Response) => {
    try {
      const { channelId } = req.params;
      
      if (!channelId) {
        return res.status(400).json({
          success: false,
          message: "ID do canal é obrigatório"
        });
      }
      
      console.log(`Obtendo credenciais Z-API para o canal ID: ${channelId}`);
      
      // Em um ambiente de produção, buscar as credenciais do banco de dados
      // Aqui estamos usando credenciais de exemplo para teste
      
      // Credenciais da Z-API
      const credentials = {
        instanceId: "3DF871A7ADFB20FB49998E66062CE0C1",
        token: "F17CB66AC44697A25E",
        clientToken: ""
      };
      
      res.json({
        success: true,
        ...credentials
      });
    } catch (error) {
      console.error(`Erro ao obter credenciais Z-API:`, error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor"
      });
    }
  });
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
          // Padronizar o formato do número para garantir correspondência exata
          const normalizedPhone = formattedPhone.replace(/^0+/, "").replace(/\D/g, "");
          console.log(`Procurando contato com número normalizado: ${normalizedPhone}`);
          
          let contact = await db.query.contacts.findFirst({
            where: eq(contacts.phone, normalizedPhone)
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
                identifier: formattedPhone, // Adicionar o número de telefone como identificador
                contactId: contact.id,
                status: "open",
                lastMessage: messageContent,
                lastMessageAt: new Date(),
                unreadCount: 1
                // campo metadata removido temporariamente até migração ser aplicada
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
                status: "open", // Reabrir se estava fechada
                identifier: formattedPhone // Garantir que o identificador esteja atualizado
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
  
  // Rota para encaminhar mensagem via Z-API
  app.post("/api/zapi/forward-message", async (req: Request, res: Response) => {
    try {
      const { instanceId, token, clientToken, phone, messageId } = req.body;
      
      if (!instanceId || !token || !phone || !messageId) {
        return res.status(400).json({
          success: false,
          message: "Instance ID, Token, número de telefone e ID da mensagem são obrigatórios",
        });
      }
      
      const result = await forwardMessage(instanceId, token, phone, messageId, clientToken);
      res.json(result);
    } catch (error) {
      console.error("Erro na rota de encaminhamento de mensagem:", error);
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

  // Rota para obter contatos da Z-API
  app.post("/api/zapi/get-contacts", async (req: Request, res: Response) => {
    try {
      const { instanceId, token, clientToken } = req.body;
      
      if (!instanceId || !token) {
        return res.status(400).json({
          success: false,
          message: "Instance ID e Token são obrigatórios",
        });
      }
      
      console.log(`Chamando Z-API para buscar contatos com ID: ${instanceId}`);
      const result = await getZapiContacts(instanceId, token, clientToken);
      
      // Verificar se a chamada à API foi bem-sucedida
      if (!result.success) {
        console.error(`Erro ao buscar contatos da Z-API: ${result.message}`);
        return res.status(400).json({
          success: false,
          message: result.message || "Erro ao importar contatos do WhatsApp."
        });
      }
      
      // Verificar se temos contatos para importar
      if (!result.contacts || !Array.isArray(result.contacts) || result.contacts.length === 0) {
        console.log("Nenhum contato retornado pela Z-API");
        return res.json({
          success: true,
          message: "Nenhum contato encontrado para importar.",
          contacts: []
        });
      }
      
      console.log(`Recebidos ${result.contacts.length} contatos da Z-API`);
      
      // Se obtiver os contatos com sucesso, sincronizar com o banco de dados
      try {
        const { db } = await import('../db');
        const { contacts } = await import('../../shared/schema');
        const { eq } = await import('drizzle-orm');
        
        console.log(`Sincronizando ${result.contacts.length} contatos do WhatsApp com o banco de dados...`);
        
        let importedCount = 0;
        let updatedCount = 0;
        let errorCount = 0;
        
        // Para cada contato recebido da Z-API
        for (const zapiContact of result.contacts) {
          try {
            // Formatar o número de telefone (remover caracteres não numéricos)
            let phone = '';
            
            if (zapiContact.phone) {
              phone = zapiContact.phone.replace(/\D/g, "");
            } else if (zapiContact.id) {
              phone = zapiContact.id.replace(/\D/g, "").replace("@c.us", "");
            }
            
            // Verificar se temos um número de telefone válido
            if (!phone) {
              console.log(`Contato sem número de telefone válido, ignorando: ${JSON.stringify(zapiContact)}`);
              continue;
            }
            
            // Remover o "@c.us" que a Z-API adiciona nos IDs
            phone = phone.replace("@c.us", "");
            
            // Verificar se já existe um contato com este número
            // Normalizar o número de telefone para garantir correspondência
            const normalizedPhone = phone.replace(/^0+/, "").replace(/\D/g, "");
            console.log(`Verificando contato com número normalizado: ${normalizedPhone}`);
            
            const existingContact = await db.query.contacts.findFirst({
              where: eq(contacts.phone, normalizedPhone)
            });
            
            // Obter o nome do contato
            const name = zapiContact.name || 
                        zapiContact.pushname || 
                        zapiContact.formattedName || 
                        `WhatsApp ${phone}`;
            
            // Se o contato não existe, inserir no banco de dados
            if (!existingContact) {
              await db.insert(contacts)
                .values({
                  name: name,
                  phone: normalizedPhone, // Salvar o número normalizado
                  email: null, // Email pode ser nulo
                  notes: "Contato importado automaticamente do WhatsApp",
                  metadata: {
                    zapiData: zapiContact,
                    source: "zapi-sync",
                    lastSync: new Date().toISOString(),
                    originalPhone: phone // Guardar o formato original do telefone no metadata
                  }
                });
              
              importedCount++;
              console.log(`Contato "${name}" (${phone}) importado do WhatsApp`);
            } 
            // Se o contato já existe, atualizar os dados
            else {
              // Salvar o numero normalizado e manter o formato original nos metadados
              await db.update(contacts)
                .set({
                  name: name,
                  phone: normalizedPhone, // Usar o número normalizado para consistência
                  metadata: {
                    zapiData: zapiContact,
                    source: "zapi-sync",
                    lastSync: new Date().toISOString(),
                    originalPhone: phone
                  }
                })
                .where(eq(contacts.id, existingContact.id));
              
              updatedCount++;
              console.log(`Contato "${name}" (${phone}) atualizado`);
            }
          } catch (contactError) {
            errorCount++;
            console.error(`Erro ao processar contato: ${JSON.stringify(zapiContact)}`, contactError);
          }
        }
        
        console.log(`Sincronização de contatos do WhatsApp concluída!`);
        console.log(`Importados: ${importedCount}, Atualizados: ${updatedCount}, Erros: ${errorCount}`);
        
        return res.json({
          success: true,
          message: `Contatos do WhatsApp sincronizados com sucesso! (${importedCount} novos, ${updatedCount} atualizados)`,
          contacts: result.contacts,
          stats: {
            imported: importedCount,
            updated: updatedCount,
            errors: errorCount,
            total: result.contacts.length
          }
        });
        
      } catch (dbError) {
        console.error("Erro ao sincronizar contatos com o banco de dados:", dbError);
        return res.status(500).json({
          success: false,
          message: "Erro ao salvar contatos no banco de dados: " + (dbError instanceof Error ? dbError.message : "Erro desconhecido"),
        });
      }
      
    } catch (error) {
      console.error("Erro na rota de obtenção de contatos:", error);
      return res.status(500).json({
        success: false,
        message: "Não foi possível importar os contatos do WhatsApp.",
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  });

  // Rota para obter informações detalhadas de um contato específico da Z-API
  app.post("/api/zapi/get-contact-info", async (req: Request, res: Response) => {
    try {
      const { instanceId, token, clientToken, phone } = req.body;
      
      if (!instanceId || !token || !phone) {
        return res.status(400).json({
          success: false,
          message: "Instance ID, Token e Phone são obrigatórios",
        });
      }
      
      const result = await getZapiContactInfo(instanceId, token, phone, clientToken);
      res.json(result);
    } catch (error) {
      console.error("Erro na rota de obtenção de informações de contato:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  });
  
  // Rota para enviar reação a uma mensagem via Z-API
  app.post("/api/zapi/send-reaction", async (req: Request, res: Response) => {
    try {
      const { instanceId, token, clientToken, phone, messageId, reaction } = req.body;
      
      if (!instanceId || !token || !phone || !messageId || !reaction) {
        return res.status(400).json({
          success: false,
          message: "Instance ID, Token, número de telefone, ID da mensagem e emoji de reação são obrigatórios",
        });
      }
      
      const result = await sendReaction(instanceId, token, phone, messageId, reaction, clientToken);
      res.json(result);
    } catch (error) {
      console.error("Erro na rota de envio de reação:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  });
  
  // Rota para remover reação de uma mensagem via Z-API
  app.post("/api/zapi/remove-reaction", async (req: Request, res: Response) => {
    try {
      const { instanceId, token, clientToken, phone, messageId } = req.body;
      
      if (!instanceId || !token || !phone || !messageId) {
        return res.status(400).json({
          success: false,
          message: "Instance ID, Token, número de telefone e ID da mensagem são obrigatórios",
        });
      }
      
      const result = await removeReaction(instanceId, token, phone, messageId, clientToken);
      res.json(result);
    } catch (error) {
      console.error("Erro na rota de remoção de reação:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  });
  
  // Rota para enviar áudio via Z-API
  app.post("/api/zapi/send-audio", async (req: Request, res: Response) => {
    try {
      const { instanceId, token, clientToken, phone, audioUrl, isVoiceMessage = true } = req.body;
      
      if (!instanceId || !token || !phone || !audioUrl) {
        return res.status(400).json({
          success: false,
          message: "Instance ID, Token, número de telefone e URL do áudio são obrigatórios",
        });
      }
      
      const result = await sendAudio(instanceId, token, phone, audioUrl, isVoiceMessage, clientToken);
      res.json(result);
    } catch (error) {
      console.error("Erro na rota de envio de áudio:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  });
  
  // Rota para enviar vídeo via Z-API
  app.post("/api/zapi/send-video", async (req: Request, res: Response) => {
    try {
      const { instanceId, token, clientToken, phone, videoUrl, caption = "" } = req.body;
      
      if (!instanceId || !token || !phone || !videoUrl) {
        return res.status(400).json({
          success: false,
          message: "Instance ID, Token, número de telefone e URL do vídeo são obrigatórios",
        });
      }
      
      const result = await sendVideo(instanceId, token, phone, videoUrl, caption, clientToken);
      res.json(result);
    } catch (error) {
      console.error("Erro na rota de envio de vídeo:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  });
  
  // Rota para enviar documento via Z-API
  app.post("/api/zapi/send-document", async (req: Request, res: Response) => {
    try {
      const { instanceId, token, clientToken, phone, documentUrl, fileName, caption = "" } = req.body;
      
      if (!instanceId || !token || !phone || !documentUrl || !fileName) {
        return res.status(400).json({
          success: false,
          message: "Instance ID, Token, número de telefone, URL do documento e nome do arquivo são obrigatórios",
        });
      }
      
      const result = await sendDocument(instanceId, token, phone, documentUrl, fileName, caption, clientToken);
      res.json(result);
    } catch (error) {
      console.error("Erro na rota de envio de documento:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  });
  
  // Rota para enviar link com pré-visualização via Z-API
  app.post("/api/zapi/send-link", async (req: Request, res: Response) => {
    try {
      const { instanceId, token, clientToken, phone, url, linkTitle = "", linkDescription = "" } = req.body;
      
      if (!instanceId || !token || !phone || !url) {
        return res.status(400).json({
          success: false,
          message: "Instance ID, Token, número de telefone e URL são obrigatórios",
        });
      }
      
      const result = await sendLink(instanceId, token, phone, url, linkTitle, linkDescription, clientToken);
      res.json(result);
    } catch (error) {
      console.error("Erro na rota de envio de link:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  });
}