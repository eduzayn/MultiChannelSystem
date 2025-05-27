import express, { Express, Request, Response, Router } from 'express';
import { ParsedQs } from 'qs';
import fileUpload from 'express-fileupload';
import { Server } from 'http';
import { storage } from "./storage";
import { z } from "zod";
import { registerZapiRoutes } from "./routes/zapiRoutes";
import { registerWebhookRoutes } from "./routes/webhookRoutes";
import { 
  insertUserSchema, 
  insertContactSchema, 
  insertCompanySchema, 
  insertDealSchema,
  insertConversationSchema,
  insertMessageSchema,
  insertTeamSchema,
  insertUserTeamSchema,
  insertRoleSchema,
  insertCampaignSchema,
  insertCampaignResultSchema,
  insertAutomationSchema,
  insertSubscriptionPlanSchema,
  insertTenantSubscriptionSchema,
  insertInvoiceSchema,
  insertGoalSchema,
  insertAchievementSchema,
  // Análise & Performance imports
  insertKpiSchema,
  insertKpiValueSchema,
  insertDashboardSchema,
  insertDashboardWidgetSchema,
  insertReportSchema,
  insertReportResultSchema,
  insertUserActivitySchema,
  insertTeamPerformanceMetricSchema,
  // Configurações (Administração) imports
  insertAuditLogSchema,
  insertSettingHistorySchema,
  insertAdminNotificationSchema,
  insertSecurityPolicySchema,
  insertIntegrationSchema,
  insertIntegrationLogSchema,
  insertUserAchievementSchema,
  insertSettingSchema,
  // Marketing & Engagement schemas
  insertAudienceSegmentSchema,
  insertSegmentMemberSchema,
  insertEmailTemplateSchema,
  insertMarketingChannelSchema,
  insertContactFormSchema,
  insertFormSubmissionSchema,
  insertEngagementMetricSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configurar middleware para upload de arquivos
  app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    useTempFiles: false,
    tempFileDir: '/tmp/'
  }));

  // Servir arquivos estáticos da pasta uploads
  const path = require('path');
  app.use('/uploads', require('express').static(path.join(process.cwd(), 'uploads')));
  // ===== API de Autenticação =====
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Usuário e senha são obrigatórios" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }
      
      // Armazenar o usuário na sessão
      if (req.session) {
        req.session.user = {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          role: user.role
        };
      }
      
      // Retorna os dados do usuário (sem a senha)
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
      
    } catch (error) {
      res.status(500).json({ message: "Erro ao fazer login" });
    }
  });
  
  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      
      const user = await storage.getUser(req.session.user.id);
      
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      // Retorna os dados do usuário (sem a senha)
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
      
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar usuário autenticado" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    if (req.session) {
      req.session.destroy((err: Error | null) => {
        if (err) {
          return res.status(500).json({ message: "Erro ao fazer logout" });
        }
        res.status(200).json({ message: "Logout realizado com sucesso" });
      });
    } else {
      res.status(200).json({ message: "Nenhuma sessão ativa" });
    }
  });
  // Users API
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.listUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Contacts API
  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.listContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.get("/api/contacts/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid contact ID" });
      }
      
      const contact = await storage.getContact(id);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      res.json(contact);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact" });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create contact" });
    }
  });

  app.put("/api/contacts/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid contact ID" });
      }
      
      const validatedData = insertContactSchema.partial().parse(req.body);
      const updatedContact = await storage.updateContact(id, validatedData);
      
      if (!updatedContact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      res.json(updatedContact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update contact" });
    }
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid contact ID" });
      }
      
      const deleted = await storage.deleteContact(id);
      if (!deleted) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete contact" });
    }
  });

  // Companies API
  app.get("/api/companies", async (req, res) => {
    try {
      const companies = await storage.listCompanies();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.get("/api/companies/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid company ID" });
      }
      
      const company = await storage.getCompany(id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  app.post("/api/companies", async (req, res) => {
    try {
      const validatedData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(validatedData);
      res.status(201).json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid company data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create company" });
    }
  });

  app.put("/api/companies/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid company ID" });
      }
      
      const validatedData = insertCompanySchema.partial().parse(req.body);
      const updatedCompany = await storage.updateCompany(id, validatedData);
      
      if (!updatedCompany) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.json(updatedCompany);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid company data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update company" });
    }
  });

  app.delete("/api/companies/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid company ID" });
      }
      
      const deleted = await storage.deleteCompany(id);
      if (!deleted) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete company" });
    }
  });

  // Deals API
  app.get("/api/deals", async (req, res) => {
    try {
      const deals = await storage.listDeals();
      res.json(deals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deals" });
    }
  });

  app.get("/api/deals/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid deal ID" });
      }
      
      const deal = await storage.getDeal(id);
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      res.json(deal);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deal" });
    }
  });

  app.post("/api/deals", async (req, res) => {
    try {
      const validatedData = insertDealSchema.parse(req.body);
      const deal = await storage.createDeal(validatedData);
      res.status(201).json(deal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid deal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create deal" });
    }
  });

  app.put("/api/deals/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid deal ID" });
      }
      
      const validatedData = insertDealSchema.partial().parse(req.body);
      const updatedDeal = await storage.updateDeal(id, validatedData);
      
      if (!updatedDeal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      res.json(updatedDeal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid deal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update deal" });
    }
  });

  app.delete("/api/deals/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid deal ID" });
      }
      
      const deleted = await storage.deleteDeal(id);
      if (!deleted) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete deal" });
    }
  });

  // Conversations API
  app.get("/api/conversations", async (req, res) => {
    try {
      // Usar diretamente o banco de dados para garantir dados atualizados
      try {
        const { db } = await import('./db');
        const { conversations } = await import('../shared/schema');
        const { desc } = await import('drizzle-orm');
        
        // Buscar conversas mais recentes primeiro
        const dbConversations = await db.query.conversations.findMany({
          orderBy: [desc(conversations.lastMessageAt)]
        });
        
        console.log(`Retornando ${dbConversations.length} conversas para a interface`);
        
        // Garantir que não haja caching
        res.set('Cache-Control', 'no-store');
        res.json(dbConversations);
      } catch (dbError) {
        console.error("Erro ao acessar banco de dados para conversas:", dbError);
        // Fallback para o storage padrão
        const conversations = await storage.listConversations();
        res.json(conversations);
      }
    } catch (error) {
      console.error("Falha ao buscar conversas:", error);
      res.status(500).json({ message: "Falha ao buscar conversas" });
    }
  });

  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de conversa inválido" });
      }
      
      const conversation = await storage.getConversation(id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversa não encontrada" });
      }
      
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar conversa" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(validatedData);
      res.status(201).json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de conversa inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar conversa" });
    }
  });

  app.put("/api/conversations/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de conversa inválido" });
      }
      
      const validatedData = insertConversationSchema.partial().parse(req.body);
      const updatedConversation = await storage.updateConversation(id, validatedData);
      
      if (!updatedConversation) {
        return res.status(404).json({ message: "Conversa não encontrada" });
      }
      
      res.json(updatedConversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de conversa inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao atualizar conversa" });
    }
  });

  app.delete("/api/conversations/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de conversa inválido" });
      }
      
      const deleted = await storage.deleteConversation(id);
      if (!deleted) {
        return res.status(404).json({ message: "Conversa não encontrada" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Falha ao excluir conversa" });
    }
  });

  // Messages API
  app.get("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      const conversationId = Number(req.params.conversationId);
      if (isNaN(conversationId)) {
        return res.status(400).json({ message: "ID de conversa inválido" });
      }
      
      // Usar diretamente o banco de dados para garantir dados atualizados
      try {
        const { db } = await import('./db');
        const { messages } = await import('../shared/schema');
        const { desc, eq } = await import('drizzle-orm');
        
        // Buscar mensagens diretamente do banco em ordem cronológica
        const dbMessages = await db.query.messages.findMany({
          where: eq(messages.conversationId, conversationId),
          orderBy: [desc(messages.timestamp)]
        });
        
        // Modificação para sempre obter novas mensagens e evitar caching no HTTP 304
        // Adicionando um timestamp como parâmetro de controle
        res.set('Cache-Control', 'no-store');
        res.set('Content-Type', 'application/json');
        res.status(200).json(dbMessages);
      } catch (dbError) {
        console.error("Erro ao acessar banco de dados:", dbError);
        // Fallback para o storage padrão
        const messages = await storage.listMessagesByConversation(conversationId);
        res.json(messages);
      }
    } catch (error) {
      console.error("Falha ao buscar mensagens:", error);
      res.status(500).json({ message: "Falha ao buscar mensagens" });
    }
  });

  app.get("/api/messages/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de mensagem inválido" });
      }
      
      const message = await storage.getMessage(id);
      if (!message) {
        return res.status(404).json({ message: "Mensagem não encontrada" });
      }
      
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar mensagem" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de mensagem inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar mensagem" });
    }
  });

  // Rota para upload de arquivos (imagens)
  app.post("/api/upload", async (req, res) => {
    try {
      const file = req.files?.file;
      
      if (!file) {
        return res.status(400).json({
          success: false,
          message: "Nenhum arquivo foi enviado"
        });
      }
      
      // Verificar se é um único arquivo
      const uploadedFile = Array.isArray(file) ? file[0] : file;
      
      // Validar tipo de arquivo
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimeTypes.includes(uploadedFile.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Tipo de arquivo não permitido. Use JPEG, PNG, GIF ou WebP."
        });
      }
      
      // Validar tamanho do arquivo (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (uploadedFile.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: "Arquivo muito grande. Tamanho máximo: 10MB"
        });
      }
      
      // Criar diretório uploads se não existir
      const fs = require('fs');
      const path = require('path');
      const uploadDir = path.join(process.cwd(), 'uploads');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = path.extname(uploadedFile.name);
      const filename = `${timestamp}_${randomString}${extension}`;
      const filepath = path.join(uploadDir, filename);
      
      // Salvar arquivo
      await uploadedFile.mv(filepath);
      
      // Gerar URL pública
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const host = process.env.REPLIT_DOMAINS 
        ? process.env.REPLIT_DOMAINS.split(',')[0]
        : `localhost:${process.env.PORT || 3000}`;
      
      const publicUrl = `${protocol}://${host}/uploads/${filename}`;
      
      console.log(`✅ UPLOAD REAL - Arquivo salvo: ${filepath}`);
      console.log(`✅ UPLOAD REAL - URL pública: ${publicUrl}`);
      console.log(`✅ UPLOAD REAL - Nome do arquivo original: ${uploadedFile.name}`);
      console.log(`✅ UPLOAD REAL - Tamanho do arquivo: ${uploadedFile.size} bytes`);
      
      res.json({
        success: true,
        url: publicUrl,
        filename: filename,
        message: "Upload realizado com sucesso"
      });
      
    } catch (error) {
      console.error("Erro no upload:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor durante o upload"
      });
    }
  });
  
  // Nova rota para envio de mensagens via Z-API
  app.post("/api/messages/send", async (req: Request, res: Response) => {
    try {
      const { phoneNumber, message, channelId, type, imageUrl, caption } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ 
          success: false, 
          message: "Número de telefone é obrigatório" 
        });
      }
      
      // Validação flexível: aceitar se houver imageUrl para imagens
      if (type === 'image' && !imageUrl) {
        return res.status(400).json({ 
          success: false, 
          message: "URL da imagem é obrigatória para envio de imagens" 
        });
      }
      
      // Validação de segurança: verificar se a URL da imagem é do picsum.photos
      if (type === 'image' && imageUrl) {
        console.log(`🚨 CRITICAL CHECK - URL da imagem recebida: ${imageUrl.substring(0, 100)}...`);
        
        // Verificar se é uma URL de teste/desenvolvimento
        if (typeof imageUrl === 'string' && imageUrl.includes('picsum.photos')) {
          console.error('🚨 ALERTA DE SEGURANÇA: Tentativa de envio de URL de imagem aleatória bloqueada');
          return res.status(400).json({
            success: false,
            message: "URL de imagem não permitida por motivos de segurança"
          });
        }
        
        // Verificar se é uma URL válida ou base64
        if (typeof imageUrl === 'string' && !imageUrl.startsWith('data:') && !imageUrl.startsWith('http')) {
          console.error('🚨 ALERTA: Formato de imagem inválido:', imageUrl.substring(0, 30));
          return res.status(400).json({
            success: false,
            message: "Formato de imagem inválido. Use URL ou base64."
          });
        }
      }
      
      if (type !== 'image' && !message) {
        return res.status(400).json({ 
          success: false, 
          message: "Mensagem é obrigatória" 
        });
      }

      // Buscar canal e suas credenciais
      const channel = await storage.getChannel(channelId);
      if (!channel) {
        return res.status(404).json({
          success: false,
          message: "Canal não encontrado"
        });
      }

      // Verificar se é um canal Z-API
      if (channel.provider !== 'zapi') {
        return res.status(400).json({
          success: false,
          message: "Canal não é do tipo Z-API"
        });
      }

      // Extrair credenciais do canal
      const instanceId = channel.config?.instanceId;
      const token = channel.config?.token;
      const clientToken = channel.config?.clientToken;

      if (!instanceId || !token) {
        return res.status(400).json({
          success: false,
          message: "Canal Z-API não configurado corretamente"
        });
      }

      console.log(`[Z-API DEBUG] Enviando mensagem via canal ${channelId}:`);
      console.log(`- Instance ID: ${instanceId}`);
      console.log(`- Token: ${token}`);
      console.log(`- Client Token: ${clientToken || "Não fornecido"}`);
      
      // Importar o serviço da Z-API
      const { sendTextMessage, sendImage } = await import('./services/zapiService');
      
      // Determinar o tipo de envio e realizar o envio efetivo via Z-API
      let result;
      if (type === 'image' && imageUrl) {
        console.log(`[Z-API DEBUG] Enviando imagem para ${phoneNumber}`);
        console.log(`[Z-API DEBUG] URL/Base64 da imagem (primeiros 50 chars): ${imageUrl.substring(0, 50)}...`);
        result = await sendImage(instanceId, token, phoneNumber, imageUrl, caption || '', clientToken);
      } else {
        console.log(`[Z-API DEBUG] Enviando texto para ${phoneNumber}`);
        result = await sendTextMessage(instanceId, token, phoneNumber, message, clientToken);
      }
      
      // Retornar resultado
      if (result.success) {
        res.json({
          success: true,
          messageId: result.messageId,
          message: "Mensagem enviada com sucesso"
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || "Erro ao enviar mensagem"
        });
      }
    } catch (error) {
      console.error('[Z-API ERROR] Erro ao processar envio:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor"
      });
    }
  });

  app.put("/api/messages/:id/status", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de mensagem inválido" });
      }
      
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status não informado" });
      }
      
      const message = await storage.updateMessageStatus(id, status);
      if (!message) {
        return res.status(404).json({ message: "Mensagem não encontrada" });
      }
      
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Falha ao atualizar status da mensagem" });
    }
  });

  // Teams API
  app.get("/api/teams", async (req, res) => {
    try {
      const teams = await storage.listTeams();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar equipes" });
    }
  });
  
  // Campaigns API
  app.get("/api/campaigns", async (req, res) => {
    try {
      const campaigns = await storage.listCampaigns();
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar campanhas" });
    }
  });
  
  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de campanha inválido" });
      }
      
      const campaign = await storage.getCampaign(id);
      if (!campaign) {
        return res.status(404).json({ message: "Campanha não encontrada" });
      }
      
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar campanha" });
    }
  });
  
  app.post("/api/campaigns", async (req, res) => {
    try {
      const validatedData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(validatedData);
      res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de campanha inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar campanha" });
    }
  });
  
  app.put("/api/campaigns/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de campanha inválido" });
      }
      
      const validatedData = insertCampaignSchema.partial().parse(req.body);
      const updatedCampaign = await storage.updateCampaign(id, validatedData);
      
      if (!updatedCampaign) {
        return res.status(404).json({ message: "Campanha não encontrada" });
      }
      
      res.json(updatedCampaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de campanha inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao atualizar campanha" });
    }
  });
  
  app.delete("/api/campaigns/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de campanha inválido" });
      }
      
      const deleted = await storage.deleteCampaign(id);
      if (!deleted) {
        return res.status(404).json({ message: "Campanha não encontrada" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Falha ao excluir campanha" });
    }
  });

  app.get("/api/teams/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de equipe inválido" });
      }
      
      const team = await storage.getTeam(id);
      if (!team) {
        return res.status(404).json({ message: "Equipe não encontrada" });
      }
      
      res.json(team);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar equipe" });
    }
  });

  app.post("/api/teams", async (req, res) => {
    try {
      const validatedData = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam(validatedData);
      res.status(201).json(team);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de equipe inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar equipe" });
    }
  });

  app.put("/api/teams/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de equipe inválido" });
      }
      
      const validatedData = insertTeamSchema.partial().parse(req.body);
      const updatedTeam = await storage.updateTeam(id, validatedData);
      
      if (!updatedTeam) {
        return res.status(404).json({ message: "Equipe não encontrada" });
      }
      
      res.json(updatedTeam);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de equipe inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao atualizar equipe" });
    }
  });

  app.delete("/api/teams/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de equipe inválido" });
      }
      
      const deleted = await storage.deleteTeam(id);
      if (!deleted) {
        return res.status(404).json({ message: "Equipe não encontrada" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Falha ao excluir equipe" });
    }
  });

  // UserTeams API
  app.get("/api/userteams", async (req, res) => {
    try {
      const { userId, teamId } = req.query;
      const userIdNum = userId ? Number(userId) : undefined;
      const teamIdNum = teamId ? Number(teamId) : undefined;
      
      const userTeams = await storage.listUserTeams(userIdNum, teamIdNum);
      res.json(userTeams);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar relações usuário-equipe" });
    }
  });

  app.post("/api/userteams", async (req, res) => {
    try {
      const validatedData = insertUserTeamSchema.parse(req.body);
      const userTeam = await storage.createUserTeam(validatedData);
      res.status(201).json(userTeam);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao adicionar usuário à equipe" });
    }
  });

  app.put("/api/userteams/:userId/:teamId", async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const teamId = Number(req.params.teamId);
      if (isNaN(userId) || isNaN(teamId)) {
        return res.status(400).json({ message: "IDs inválidos" });
      }
      
      const { role } = req.body;
      if (!role) {
        return res.status(400).json({ message: "Papel não informado" });
      }
      
      const userTeam = await storage.updateUserTeam(userId, teamId, role);
      if (!userTeam) {
        return res.status(404).json({ message: "Relação usuário-equipe não encontrada" });
      }
      
      res.json(userTeam);
    } catch (error) {
      res.status(500).json({ message: "Falha ao atualizar papel do usuário na equipe" });
    }
  });

  app.delete("/api/userteams/:userId/:teamId", async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const teamId = Number(req.params.teamId);
      if (isNaN(userId) || isNaN(teamId)) {
        return res.status(400).json({ message: "IDs inválidos" });
      }
      
      const deleted = await storage.deleteUserTeam(userId, teamId);
      if (!deleted) {
        return res.status(404).json({ message: "Relação usuário-equipe não encontrada" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Falha ao remover usuário da equipe" });
    }
  });

  // Roles API
  app.get("/api/roles", async (req, res) => {
    try {
      const roles = await storage.listRoles();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar papéis/permissões" });
    }
  });

  app.get("/api/roles/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de papel inválido" });
      }
      
      const role = await storage.getRole(id);
      if (!role) {
        return res.status(404).json({ message: "Papel não encontrado" });
      }
      
      res.json(role);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar papel" });
    }
  });

  app.post("/api/roles", async (req, res) => {
    try {
      const validatedData = insertRoleSchema.parse(req.body);
      const role = await storage.createRole(validatedData);
      res.status(201).json(role);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de papel inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar papel" });
    }
  });

  app.put("/api/roles/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de papel inválido" });
      }
      
      const validatedData = insertRoleSchema.partial().parse(req.body);
      const updatedRole = await storage.updateRole(id, validatedData);
      
      if (!updatedRole) {
        return res.status(404).json({ message: "Papel não encontrado" });
      }
      
      res.json(updatedRole);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de papel inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao atualizar papel" });
    }
  });

  app.delete("/api/roles/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de papel inválido" });
      }
      
      const deleted = await storage.deleteRole(id);
      if (!deleted) {
        return res.status(404).json({ message: "Papel não encontrado" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Falha ao excluir papel" });
    }
  });

  // Campaigns API
  app.get("/api/campaigns", async (req, res) => {
    try {
      const campaigns = await storage.listCampaigns();
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar campanhas" });
    }
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de campanha inválido" });
      }
      
      const campaign = await storage.getCampaign(id);
      if (!campaign) {
        return res.status(404).json({ message: "Campanha não encontrada" });
      }
      
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar campanha" });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const validatedData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(validatedData);
      res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de campanha inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar campanha" });
    }
  });

  app.put("/api/campaigns/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de campanha inválido" });
      }
      
      const validatedData = insertCampaignSchema.partial().parse(req.body);
      const updatedCampaign = await storage.updateCampaign(id, validatedData);
      
      if (!updatedCampaign) {
        return res.status(404).json({ message: "Campanha não encontrada" });
      }
      
      res.json(updatedCampaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de campanha inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao atualizar campanha" });
    }
  });

  app.delete("/api/campaigns/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de campanha inválido" });
      }
      
      const deleted = await storage.deleteCampaign(id);
      if (!deleted) {
        return res.status(404).json({ message: "Campanha não encontrada" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Falha ao excluir campanha" });
    }
  });

  // Automations API
  app.get("/api/automations", async (req, res) => {
    try {
      const automations = await storage.listAutomations();
      res.json(automations);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar automações" });
    }
  });
  
  app.get("/api/automations/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de automação inválido" });
      }
      
      const automation = await storage.getAutomation(id);
      if (!automation) {
        return res.status(404).json({ message: "Automação não encontrada" });
      }
      
      res.json(automation);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar automação" });
    }
  });
  
  app.post("/api/automations", async (req, res) => {
    try {
      const validatedData = insertAutomationSchema.parse(req.body);
      const automation = await storage.createAutomation(validatedData);
      res.status(201).json(automation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de automação inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar automação" });
    }
  });
  
  app.put("/api/automations/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de automação inválido" });
      }
      
      const validatedData = insertAutomationSchema.partial().parse(req.body);
      const updatedAutomation = await storage.updateAutomation(id, validatedData);
      
      if (!updatedAutomation) {
        return res.status(404).json({ message: "Automação não encontrada" });
      }
      
      res.json(updatedAutomation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de automação inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao atualizar automação" });
    }
  });
  
  app.delete("/api/automations/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de automação inválido" });
      }
      
      const deleted = await storage.deleteAutomation(id);
      if (!deleted) {
        return res.status(404).json({ message: "Automação não encontrada" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Falha ao excluir automação" });
    }
  });
  
  app.patch("/api/automations/:id/toggle", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de automação inválido" });
      }
      
      const { isActive } = req.body;
      if (isActive === undefined) {
        return res.status(400).json({ message: "Status ativo não informado" });
      }
      
      const automation = await storage.toggleAutomation(id, isActive);
      if (!automation) {
        return res.status(404).json({ message: "Automação não encontrada" });
      }
      
      res.json(automation);
    } catch (error) {
      res.status(500).json({ message: "Falha ao alternar status da automação" });
    }
  });
  
  // Goals API
  app.get("/api/goals", async (req, res) => {
    try {
      const ownerId = req.query.ownerId ? Number(req.query.ownerId) : undefined;
      const teamId = req.query.teamId ? Number(req.query.teamId) : undefined;
      
      const goals = await storage.listGoals(ownerId, teamId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar metas" });
    }
  });
  
  app.get("/api/goals/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de meta inválido" });
      }
      
      const goal = await storage.getGoal(id);
      if (!goal) {
        return res.status(404).json({ message: "Meta não encontrada" });
      }
      
      res.json(goal);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar meta" });
    }
  });
  
  app.post("/api/goals", async (req, res) => {
    try {
      const validatedData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(validatedData);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de meta inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar meta" });
    }
  });
  
  app.put("/api/goals/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de meta inválido" });
      }
      
      const validatedData = insertGoalSchema.partial().parse(req.body);
      const updatedGoal = await storage.updateGoal(id, validatedData);
      
      if (!updatedGoal) {
        return res.status(404).json({ message: "Meta não encontrada" });
      }
      
      res.json(updatedGoal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de meta inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao atualizar meta" });
    }
  });
  
  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de meta inválido" });
      }
      
      const deleted = await storage.deleteGoal(id);
      if (!deleted) {
        return res.status(404).json({ message: "Meta não encontrada" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Falha ao excluir meta" });
    }
  });
  
  app.patch("/api/goals/:id/progress", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de meta inválido" });
      }
      
      const { value } = req.body;
      if (value === undefined) {
        return res.status(400).json({ message: "Valor não informado" });
      }
      
      const goal = await storage.updateGoalProgress(id, value);
      if (!goal) {
        return res.status(404).json({ message: "Meta não encontrada" });
      }
      
      res.json(goal);
    } catch (error) {
      res.status(500).json({ message: "Falha ao atualizar progresso da meta" });
    }
  });
  
  // Achievements API
  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.listAchievements();
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar conquistas" });
    }
  });
  
  app.get("/api/achievements/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de conquista inválido" });
      }
      
      const achievement = await storage.getAchievement(id);
      if (!achievement) {
        return res.status(404).json({ message: "Conquista não encontrada" });
      }
      
      res.json(achievement);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar conquista" });
    }
  });
  
  app.post("/api/achievements", async (req, res) => {
    try {
      const validatedData = insertAchievementSchema.parse(req.body);
      const achievement = await storage.createAchievement(validatedData);
      res.status(201).json(achievement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de conquista inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar conquista" });
    }
  });
  
  app.put("/api/achievements/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de conquista inválido" });
      }
      
      const validatedData = insertAchievementSchema.partial().parse(req.body);
      const updatedAchievement = await storage.updateAchievement(id, validatedData);
      
      if (!updatedAchievement) {
        return res.status(404).json({ message: "Conquista não encontrada" });
      }
      
      res.json(updatedAchievement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de conquista inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao atualizar conquista" });
    }
  });
  
  app.delete("/api/achievements/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de conquista inválido" });
      }
      
      const deleted = await storage.deleteAchievement(id);
      if (!deleted) {
        return res.status(404).json({ message: "Conquista não encontrada" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Falha ao excluir conquista" });
    }
  });
  
  // ==========================================================================
  // MARKETING E ENGAJAMENTO - AUDIENCE SEGMENTS (SEGMENTOS DE PÚBLICO)
  // ==========================================================================
  app.get("/api/audience-segments", async (req, res) => {
    try {
      const segments = await storage.listAudienceSegments();
      res.json(segments);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar segmentos de público" });
    }
  });
  
  app.get("/api/audience-segments/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de segmento inválido" });
      }
      
      const segment = await storage.getAudienceSegment(id);
      if (!segment) {
        return res.status(404).json({ message: "Segmento não encontrado" });
      }
      
      res.json(segment);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar segmento de público" });
    }
  });
  
  app.post("/api/audience-segments", async (req, res) => {
    try {
      const validatedData = insertAudienceSegmentSchema.parse(req.body);
      const segment = await storage.createAudienceSegment(validatedData);
      res.status(201).json(segment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de segmento inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar segmento de público" });
    }
  });
  
  app.put("/api/audience-segments/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de segmento inválido" });
      }
      
      const validatedData = insertAudienceSegmentSchema.partial().parse(req.body);
      const updatedSegment = await storage.updateAudienceSegment(id, validatedData);
      
      if (!updatedSegment) {
        return res.status(404).json({ message: "Segmento não encontrado" });
      }
      
      res.json(updatedSegment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de segmento inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao atualizar segmento de público" });
    }
  });
  
  app.delete("/api/audience-segments/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de segmento inválido" });
      }
      
      const deleted = await storage.deleteAudienceSegment(id);
      if (!deleted) {
        return res.status(404).json({ message: "Segmento não encontrado" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Falha ao excluir segmento de público" });
    }
  });
  
  // Segment Members API
  app.get("/api/audience-segments/:segmentId/members", async (req, res) => {
    try {
      const segmentId = Number(req.params.segmentId);
      if (isNaN(segmentId)) {
        return res.status(400).json({ message: "ID de segmento inválido" });
      }
      
      const members = await storage.listSegmentMembers(segmentId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar membros do segmento" });
    }
  });
  
  app.post("/api/audience-segments/:segmentId/members", async (req, res) => {
    try {
      const segmentId = Number(req.params.segmentId);
      const { contactId } = req.body;
      
      if (isNaN(segmentId) || !contactId) {
        return res.status(400).json({ message: "ID de segmento ou contato inválido" });
      }
      
      const member = await storage.addContactToSegment(segmentId, contactId);
      res.status(201).json(member);
    } catch (error) {
      res.status(500).json({ message: "Falha ao adicionar contato ao segmento" });
    }
  });
  
  app.delete("/api/audience-segments/:segmentId/members/:contactId", async (req, res) => {
    try {
      const segmentId = Number(req.params.segmentId);
      const contactId = Number(req.params.contactId);
      
      if (isNaN(segmentId) || isNaN(contactId)) {
        return res.status(400).json({ message: "ID de segmento ou contato inválido" });
      }
      
      const deleted = await storage.removeContactFromSegment(segmentId, contactId);
      if (!deleted) {
        return res.status(404).json({ message: "Membro não encontrado no segmento" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Falha ao remover contato do segmento" });
    }
  });
  
  // ==========================================================================
  // MARKETING E ENGAJAMENTO - EMAIL TEMPLATES (MODELOS DE EMAIL)
  // ==========================================================================
  app.get("/api/email-templates", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const templates = await storage.listEmailTemplates(category);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar modelos de email" });
    }
  });
  
  app.get("/api/email-templates/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de modelo inválido" });
      }
      
      const template = await storage.getEmailTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Modelo de email não encontrado" });
      }
      
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar modelo de email" });
    }
  });
  
  app.post("/api/email-templates", async (req, res) => {
    try {
      const validatedData = insertEmailTemplateSchema.parse(req.body);
      const template = await storage.createEmailTemplate(validatedData);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de modelo inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar modelo de email" });
    }
  });
  
  app.put("/api/email-templates/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de modelo inválido" });
      }
      
      const validatedData = insertEmailTemplateSchema.partial().parse(req.body);
      const updatedTemplate = await storage.updateEmailTemplate(id, validatedData);
      
      if (!updatedTemplate) {
        return res.status(404).json({ message: "Modelo de email não encontrado" });
      }
      
      res.json(updatedTemplate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de modelo inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao atualizar modelo de email" });
    }
  });
  
  app.delete("/api/email-templates/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de modelo inválido" });
      }
      
      const deleted = await storage.deleteEmailTemplate(id);
      if (!deleted) {
        return res.status(404).json({ message: "Modelo de email não encontrado" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Falha ao excluir modelo de email" });
    }
  });
  
  // ==========================================================================
  // MARKETING E ENGAJAMENTO - MARKETING CHANNELS (CANAIS DE MARKETING)
  // ==========================================================================
  app.get("/api/marketing-channels", async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const channels = await storage.listMarketingChannels(type);
      res.json(channels);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar canais de marketing" });
    }
  });
  
  app.get("/api/marketing-channels/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de canal inválido" });
      }
      
      const channel = await storage.getMarketingChannel(id);
      if (!channel) {
        return res.status(404).json({ message: "Canal de marketing não encontrado" });
      }
      
      res.json(channel);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar canal de marketing" });
    }
  });
  
  app.post("/api/marketing-channels", async (req, res) => {
    try {
      console.log("Criando canal de marketing:", req.body);
      
      // Verificar campos obrigatórios antes de validar com Zod
      const { name, type } = req.body;
      if (!name || !type) {
        return res.status(400).json({ 
          message: "Dados de canal inválidos", 
          errors: [
            !name ? "Nome do canal é obrigatório" : null,
            !type ? "Tipo de canal é obrigatório" : null
          ].filter(Boolean)
        });
      }
      
      const validatedData = insertMarketingChannelSchema.parse(req.body);
      console.log("Dados validados:", validatedData);
      const channel = await storage.createMarketingChannel(validatedData);
      res.status(201).json(channel);
    } catch (error) {
      console.error("Erro ao criar canal de marketing:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados de canal inválidos", 
          errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        });
      }
      res.status(500).json({ message: "Falha ao criar canal de marketing", error: error instanceof Error ? error.message : String(error) });
    }
  });
  
  app.put("/api/marketing-channels/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de canal inválido" });
      }
      
      const validatedData = insertMarketingChannelSchema.partial().parse(req.body);
      const updatedChannel = await storage.updateMarketingChannel(id, validatedData);
      
      if (!updatedChannel) {
        return res.status(404).json({ message: "Canal de marketing não encontrado" });
      }
      
      res.json(updatedChannel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de canal inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao atualizar canal de marketing" });
    }
  });
  
  app.delete("/api/marketing-channels/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de canal inválido" });
      }
      
      const deleted = await storage.deleteMarketingChannel(id);
      if (!deleted) {
        return res.status(404).json({ message: "Canal de marketing não encontrado" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Falha ao excluir canal de marketing" });
    }
  });
  
  // ==========================================================================
  // MARKETING E ENGAJAMENTO - CONTACT FORMS (FORMULÁRIOS DE CONTATO)
  // ==========================================================================
  app.get("/api/contact-forms", async (req, res) => {
    try {
      const forms = await storage.listContactForms();
      res.json(forms);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar formulários de contato" });
    }
  });
  
  app.get("/api/contact-forms/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de formulário inválido" });
      }
      
      const form = await storage.getContactForm(id);
      if (!form) {
        return res.status(404).json({ message: "Formulário de contato não encontrado" });
      }
      
      res.json(form);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar formulário de contato" });
    }
  });
  
  app.post("/api/contact-forms", async (req, res) => {
    try {
      const validatedData = insertContactFormSchema.parse(req.body);
      const form = await storage.createContactForm(validatedData);
      res.status(201).json(form);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de formulário inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar formulário de contato" });
    }
  });
  
  app.put("/api/contact-forms/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de formulário inválido" });
      }
      
      const validatedData = insertContactFormSchema.partial().parse(req.body);
      const updatedForm = await storage.updateContactForm(id, validatedData);
      
      if (!updatedForm) {
        return res.status(404).json({ message: "Formulário de contato não encontrado" });
      }
      
      res.json(updatedForm);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de formulário inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao atualizar formulário de contato" });
    }
  });
  
  app.delete("/api/contact-forms/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de formulário inválido" });
      }
      
      const deleted = await storage.deleteContactForm(id);
      if (!deleted) {
        return res.status(404).json({ message: "Formulário de contato não encontrado" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Falha ao excluir formulário de contato" });
    }
  });
  
  // Form Submissions API
  app.get("/api/form-submissions", async (req, res) => {
    try {
      const formId = req.query.formId ? Number(req.query.formId) : undefined;
      const submissions = await storage.listFormSubmissions(formId);
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar submissões de formulário" });
    }
  });
  
  app.get("/api/form-submissions/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de submissão inválido" });
      }
      
      const submission = await storage.getFormSubmission(id);
      if (!submission) {
        return res.status(404).json({ message: "Submissão de formulário não encontrada" });
      }
      
      res.json(submission);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar submissão de formulário" });
    }
  });
  
  app.post("/api/form-submissions", async (req, res) => {
    try {
      const validatedData = insertFormSubmissionSchema.parse(req.body);
      const submission = await storage.createFormSubmission(validatedData);
      res.status(201).json(submission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de submissão inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar submissão de formulário" });
    }
  });
  
  app.patch("/api/form-submissions/:id/status", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de submissão inválido" });
      }
      
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status não informado" });
      }
      
      const submission = await storage.updateFormSubmissionStatus(id, status);
      if (!submission) {
        return res.status(404).json({ message: "Submissão de formulário não encontrada" });
      }
      
      res.json(submission);
    } catch (error) {
      res.status(500).json({ message: "Falha ao atualizar status da submissão" });
    }
  });
  
  // ==========================================================================
  // MARKETING E ENGAJAMENTO - ENGAGEMENT METRICS (MÉTRICAS DE ENGAJAMENTO)
  // ==========================================================================
  app.post("/api/engagement-metrics", async (req, res) => {
    try {
      const validatedData = insertEngagementMetricSchema.parse(req.body);
      const metric = await storage.recordEngagement(validatedData);
      res.status(201).json(metric);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de métrica inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao registrar métrica de engajamento" });
    }
  });
  
  app.get("/api/contacts/:contactId/engagements", async (req, res) => {
    try {
      const contactId = Number(req.params.contactId);
      if (isNaN(contactId)) {
        return res.status(400).json({ message: "ID de contato inválido" });
      }
      
      const engagements = await storage.getContactEngagements(contactId);
      res.json(engagements);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar engajamentos do contato" });
    }
  });
  
  app.get("/api/engagements/by-event/:eventType", async (req, res) => {
    try {
      const { eventType } = req.params;
      if (!eventType) {
        return res.status(400).json({ message: "Tipo de evento não informado" });
      }
      
      const engagements = await storage.getEventTypeEngagements(eventType);
      res.json(engagements);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar engajamentos por tipo de evento" });
    }
  });
  
  app.get("/api/engagements/by-source/:sourceType/:sourceId?", async (req, res) => {
    try {
      const { sourceType } = req.params;
      const sourceId = req.params.sourceId ? Number(req.params.sourceId) : undefined;
      
      if (!sourceType) {
        return res.status(400).json({ message: "Tipo de fonte não informado" });
      }
      
      const engagements = await storage.getSourceEngagements(sourceType, sourceId);
      res.json(engagements);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar engajamentos por fonte" });
    }
  });
  
  app.get("/api/users/:userId/achievements", async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "ID de usuário inválido" });
      }
      
      const achievements = await storage.listUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar conquistas do usuário" });
    }
  });
  
  app.post("/api/user-achievements", async (req, res) => {
    try {
      const validatedData = insertUserAchievementSchema.parse(req.body);
      const userAchievement = await storage.createUserAchievement(validatedData);
      res.status(201).json(userAchievement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao atribuir conquista ao usuário" });
    }
  });
  
  // Settings API
  app.get("/api/settings", async (req, res) => {
    try {
      const { category } = req.query;
      let settings;
      
      if (category && typeof category === 'string') {
        settings = await storage.listSettings(category);
      } else {
        settings = await storage.listSettings();
      }
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar configurações" });
    }
  });

  app.get("/api/settings/:category/:key", async (req, res) => {
    try {
      const { category, key } = req.params;
      
      const setting = await storage.getSetting(category, key);
      if (!setting) {
        return res.status(404).json({ message: "Configuração não encontrada" });
      }
      
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar configuração" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const validatedData = insertSettingSchema.parse(req.body);
      const setting = await storage.createOrUpdateSetting(validatedData);
      res.status(201).json(setting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de configuração inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao salvar configuração" });
    }
  });

  app.delete("/api/settings/:category/:key", async (req, res) => {
    try {
      const { category, key } = req.params;
      
      const deleted = await storage.deleteSetting(category, key);
      if (!deleted) {
        return res.status(404).json({ message: "Configuração não encontrada" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Falha ao excluir configuração" });
    }
  });

  // Módulo de Análise & Performance: KPIs
  app.get("/api/kpis", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const kpis = await storage.listKpis(category);
      res.json(kpis);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar KPIs" });
    }
  });
  
  app.get("/api/kpis/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de KPI inválido" });
      }
      
      const kpi = await storage.getKpi(id);
      if (!kpi) {
        return res.status(404).json({ message: "KPI não encontrado" });
      }
      
      res.json(kpi);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar KPI" });
    }
  });
  
  app.post("/api/kpis", async (req, res) => {
    try {
      const validatedData = insertKpiSchema.parse(req.body);
      const kpi = await storage.createKpi(validatedData);
      res.status(201).json(kpi);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de KPI inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar KPI" });
    }
  });
  
  app.put("/api/kpis/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de KPI inválido" });
      }
      
      const validatedData = insertKpiSchema.partial().parse(req.body);
      const kpi = await storage.updateKpi(id, validatedData);
      
      if (!kpi) {
        return res.status(404).json({ message: "KPI não encontrado" });
      }
      
      res.json(kpi);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de KPI inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao atualizar KPI" });
    }
  });
  
  app.delete("/api/kpis/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de KPI inválido" });
      }
      
      await storage.deleteKpi(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Falha ao excluir KPI" });
    }
  });
  
  // Módulo de Análise & Performance: KPI Values
  app.get("/api/kpis/:kpiId/values", async (req, res) => {
    try {
      const kpiId = Number(req.params.kpiId);
      if (isNaN(kpiId)) {
        return res.status(400).json({ message: "ID de KPI inválido" });
      }
      
      const periodType = req.query.periodType as string | undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      
      const values = await storage.listKpiValues(kpiId, periodType, limit);
      res.json(values);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar valores de KPI" });
    }
  });
  
  app.post("/api/kpi-values", async (req, res) => {
    try {
      const validatedData = insertKpiValueSchema.parse(req.body);
      const kpiValue = await storage.createKpiValue(validatedData);
      res.status(201).json(kpiValue);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de valor de KPI inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar valor de KPI" });
    }
  });
  
  app.delete("/api/kpi-values/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de valor de KPI inválido" });
      }
      
      await storage.deleteKpiValue(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Falha ao excluir valor de KPI" });
    }
  });
  
  // Módulo de Análise & Performance: Dashboards
  app.get("/api/dashboards", async (req, res) => {
    try {
      const isPublic = req.query.isPublic !== undefined 
        ? req.query.isPublic === 'true'
        : undefined;
        
      const dashboards = await storage.listDashboards(isPublic);
      res.json(dashboards);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar dashboards" });
    }
  });
  
  app.get("/api/dashboards/default", async (req, res) => {
    try {
      const dashboard = await storage.getDefaultDashboard();
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard padrão não encontrado" });
      }
      
      res.json(dashboard);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar dashboard padrão" });
    }
  });
  
  app.get("/api/dashboards/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de dashboard inválido" });
      }
      
      const dashboard = await storage.getDashboard(id);
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard não encontrado" });
      }
      
      res.json(dashboard);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar dashboard" });
    }
  });
  
  app.post("/api/dashboards", async (req, res) => {
    try {
      const validatedData = insertDashboardSchema.parse(req.body);
      const dashboard = await storage.createDashboard(validatedData);
      res.status(201).json(dashboard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de dashboard inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar dashboard" });
    }
  });
  
  app.put("/api/dashboards/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de dashboard inválido" });
      }
      
      const validatedData = insertDashboardSchema.partial().parse(req.body);
      const dashboard = await storage.updateDashboard(id, validatedData);
      
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard não encontrado" });
      }
      
      res.json(dashboard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de dashboard inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao atualizar dashboard" });
    }
  });
  
  app.delete("/api/dashboards/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de dashboard inválido" });
      }
      
      await storage.deleteDashboard(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Falha ao excluir dashboard" });
    }
  });
  
  // Módulo de Análise & Performance: Dashboard Widgets
  app.get("/api/dashboards/:dashboardId/widgets", async (req, res) => {
    try {
      const dashboardId = Number(req.params.dashboardId);
      if (isNaN(dashboardId)) {
        return res.status(400).json({ message: "ID de dashboard inválido" });
      }
      
      const widgets = await storage.listDashboardWidgets(dashboardId);
      res.json(widgets);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar widgets do dashboard" });
    }
  });
  
  app.get("/api/dashboard-widgets/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de widget inválido" });
      }
      
      const widget = await storage.getDashboardWidget(id);
      if (!widget) {
        return res.status(404).json({ message: "Widget não encontrado" });
      }
      
      res.json(widget);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar widget" });
    }
  });
  
  app.post("/api/dashboard-widgets", async (req, res) => {
    try {
      const validatedData = insertDashboardWidgetSchema.parse(req.body);
      const widget = await storage.createDashboardWidget(validatedData);
      res.status(201).json(widget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de widget inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar widget" });
    }
  });
  
  app.put("/api/dashboard-widgets/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de widget inválido" });
      }
      
      const validatedData = insertDashboardWidgetSchema.partial().parse(req.body);
      const widget = await storage.updateDashboardWidget(id, validatedData);
      
      if (!widget) {
        return res.status(404).json({ message: "Widget não encontrado" });
      }
      
      res.json(widget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de widget inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao atualizar widget" });
    }
  });
  
  app.delete("/api/dashboard-widgets/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de widget inválido" });
      }
      
      await storage.deleteDashboardWidget(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Falha ao excluir widget" });
    }
  });
  
  // Módulo de Análise & Performance: Relatórios
  app.get("/api/reports", async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const reports = await storage.listReports(type);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar relatórios" });
    }
  });
  
  app.get("/api/reports/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de relatório inválido" });
      }
      
      const report = await storage.getReport(id);
      if (!report) {
        return res.status(404).json({ message: "Relatório não encontrado" });
      }
      
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar relatório" });
    }
  });
  
  app.post("/api/reports", async (req, res) => {
    try {
      const validatedData = insertReportSchema.parse(req.body);
      const report = await storage.createReport(validatedData);
      res.status(201).json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de relatório inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar relatório" });
    }
  });
  
  app.put("/api/reports/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de relatório inválido" });
      }
      
      const validatedData = insertReportSchema.partial().parse(req.body);
      const report = await storage.updateReport(id, validatedData);
      
      if (!report) {
        return res.status(404).json({ message: "Relatório não encontrado" });
      }
      
      res.json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de relatório inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao atualizar relatório" });
    }
  });
  
  app.delete("/api/reports/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de relatório inválido" });
      }
      
      await storage.deleteReport(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Falha ao excluir relatório" });
    }
  });
  
  // Módulo de Análise & Performance: Resultados de Relatórios
  app.get("/api/reports/:reportId/results", async (req, res) => {
    try {
      const reportId = Number(req.params.reportId);
      if (isNaN(reportId)) {
        return res.status(400).json({ message: "ID de relatório inválido" });
      }
      
      const results = await storage.listReportResults(reportId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar resultados de relatório" });
    }
  });
  
  app.get("/api/report-results/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de resultado inválido" });
      }
      
      const result = await storage.getReportResult(id);
      if (!result) {
        return res.status(404).json({ message: "Resultado não encontrado" });
      }
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar resultado" });
    }
  });
  
  app.post("/api/report-results", async (req, res) => {
    try {
      const validatedData = insertReportResultSchema.parse(req.body);
      const result = await storage.createReportResult(validatedData);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de resultado inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar resultado" });
    }
  });
  
  app.delete("/api/report-results/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de resultado inválido" });
      }
      
      await storage.deleteReportResult(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Falha ao excluir resultado" });
    }
  });
  
  // Módulo de Análise & Performance: Atividades de Usuário
  app.get("/api/user-activities", async (req, res) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      const activityType = req.query.activityType as string | undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      
      const activities = await storage.listUserActivities(userId, activityType, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar atividades de usuário" });
    }
  });
  
  app.get("/api/user-activities/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de atividade inválido" });
      }
      
      const activity = await storage.getUserActivity(id);
      if (!activity) {
        return res.status(404).json({ message: "Atividade não encontrada" });
      }
      
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar atividade" });
    }
  });
  
  app.post("/api/user-activities", async (req, res) => {
    try {
      const validatedData = insertUserActivitySchema.parse(req.body);
      const activity = await storage.createUserActivity(validatedData);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de atividade inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao registrar atividade" });
    }
  });
  
  // Módulo de Análise & Performance: Métricas de Performance da Equipe
  app.get("/api/teams/:teamId/performance-metrics", async (req, res) => {
    try {
      const teamId = Number(req.params.teamId);
      if (isNaN(teamId)) {
        return res.status(400).json({ message: "ID de equipe inválido" });
      }
      
      const period = req.query.period as string | undefined;
      const metrics = await storage.listTeamPerformanceMetrics(teamId, period);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar métricas de performance" });
    }
  });
  
  app.get("/api/team-performance-metrics/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de métrica inválido" });
      }
      
      const metric = await storage.getTeamPerformanceMetric(id);
      if (!metric) {
        return res.status(404).json({ message: "Métrica não encontrada" });
      }
      
      res.json(metric);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar métrica de performance" });
    }
  });
  
  app.post("/api/team-performance-metrics", async (req, res) => {
    try {
      const validatedData = insertTeamPerformanceMetricSchema.parse(req.body);
      const metric = await storage.createTeamPerformanceMetric(validatedData);
      res.status(201).json(metric);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de métrica inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar métrica de performance" });
    }
  });
  
  app.put("/api/team-performance-metrics/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de métrica inválido" });
      }
      
      const validatedData = insertTeamPerformanceMetricSchema.partial().parse(req.body);
      const metric = await storage.updateTeamPerformanceMetric(id, validatedData);
      
      if (!metric) {
        return res.status(404).json({ message: "Métrica não encontrada" });
      }
      
      res.json(metric);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de métrica inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao atualizar métrica de performance" });
    }
  });
  
  // ===== Módulo de Configurações (Administração) =====
  
  // Logs de Auditoria
  app.get("/api/audit-logs", async (req, res) => {
    try {
      const options = {
        userId: req.query.userId ? Number(req.query.userId) : undefined,
        action: req.query.action as string | undefined,
        entityType: req.query.entityType as string | undefined,
        entityId: req.query.entityId ? Number(req.query.entityId) : undefined,
        fromDate: req.query.fromDate ? new Date(req.query.fromDate as string) : undefined,
        toDate: req.query.toDate ? new Date(req.query.toDate as string) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
      };
      
      const logs = await storage.listAuditLogs(options);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar logs de auditoria" });
    }
  });

  app.get("/api/audit-logs/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de log inválido" });
      }
      
      const log = await storage.getAuditLog(id);
      if (!log) {
        return res.status(404).json({ message: "Log de auditoria não encontrado" });
      }
      
      res.json(log);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar log de auditoria" });
    }
  });

  app.post("/api/audit-logs", async (req, res) => {
    try {
      const validatedData = insertAuditLogSchema.parse(req.body);
      const log = await storage.createAuditLog(validatedData);
      res.status(201).json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de log inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar log de auditoria" });
    }
  });

  // Histórico de Configurações
  app.get("/api/setting-history", async (req, res) => {
    try {
      const settingId = req.query.settingId ? Number(req.query.settingId) : undefined;
      const category = req.query.category as string | undefined;
      const key = req.query.key as string | undefined;
      
      const historyItems = await storage.listSettingHistory(settingId, category, key);
      res.json(historyItems);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar histórico de configurações" });
    }
  });

  app.get("/api/setting-history/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de histórico inválido" });
      }
      
      const historyItem = await storage.getSettingHistory(id);
      if (!historyItem) {
        return res.status(404).json({ message: "Item de histórico não encontrado" });
      }
      
      res.json(historyItem);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar item de histórico" });
    }
  });

  app.post("/api/setting-history", async (req, res) => {
    try {
      const validatedData = insertSettingHistorySchema.parse(req.body);
      const historyItem = await storage.createSettingHistory(validatedData);
      res.status(201).json(historyItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de histórico inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar item de histórico" });
    }
  });

  // Notificações Administrativas
  app.get("/api/admin-notifications", async (req, res) => {
    try {
      const options = {
        isGlobal: req.query.isGlobal === 'true' ? true : 
                 (req.query.isGlobal === 'false' ? false : undefined),
        userId: req.query.userId ? Number(req.query.userId) : undefined,
        role: req.query.role as string | undefined,
        active: req.query.active === 'true' ? true : undefined,
        type: req.query.type as string | undefined,
        priority: req.query.priority as string | undefined,
      };
      
      const notifications = await storage.listAdminNotifications(options);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar notificações administrativas" });
    }
  });

  app.get("/api/admin-notifications/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de notificação inválido" });
      }
      
      const notification = await storage.getAdminNotification(id);
      if (!notification) {
        return res.status(404).json({ message: "Notificação administrativa não encontrada" });
      }
      
      res.json(notification);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar notificação administrativa" });
    }
  });

  app.post("/api/admin-notifications", async (req, res) => {
    try {
      const validatedData = insertAdminNotificationSchema.parse(req.body);
      const notification = await storage.createAdminNotification(validatedData);
      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de notificação inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar notificação administrativa" });
    }
  });

  app.put("/api/admin-notifications/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de notificação inválido" });
      }
      
      const validatedData = insertAdminNotificationSchema.partial().parse(req.body);
      const notification = await storage.updateAdminNotification(id, validatedData);
      
      if (!notification) {
        return res.status(404).json({ message: "Notificação administrativa não encontrada" });
      }
      
      res.json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de notificação inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao atualizar notificação administrativa" });
    }
  });

  app.delete("/api/admin-notifications/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de notificação inválido" });
      }
      
      const deleted = await storage.deleteAdminNotification(id);
      if (!deleted) {
        return res.status(404).json({ message: "Notificação administrativa não encontrada" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Falha ao excluir notificação administrativa" });
    }
  });

  // Reconhecimento de Notificações
  app.post("/api/notification-acknowledgements", async (req, res) => {
    try {
      const { notificationId, userId } = req.body;
      if (!notificationId || !userId) {
        return res.status(400).json({ message: "notificationId e userId são obrigatórios" });
      }
      
      const acknowledgement = await storage.acknowledgeNotification(
        Number(notificationId), 
        Number(userId)
      );
      res.status(201).json(acknowledgement);
    } catch (error) {
      res.status(500).json({ message: "Falha ao reconhecer notificação" });
    }
  });

  app.get("/api/notification-acknowledgements/user/:userId", async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "ID de usuário inválido" });
      }
      
      const notificationIds = req.query.notificationIds 
        ? (req.query.notificationIds as string).split(',').map(id => Number(id)) 
        : undefined;
      
      const acknowledgements = await storage.getUserNotificationAcknowledgements(userId, notificationIds);
      res.json(acknowledgements);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar reconhecimentos de notificações" });
    }
  });

  // Políticas de Segurança
  app.get("/api/security-policies", async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const isActive = req.query.isActive === 'true' ? true :
                      (req.query.isActive === 'false' ? false : undefined);
      
      const policies = await storage.listSecurityPolicies(type, isActive);
      res.json(policies);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar políticas de segurança" });
    }
  });

  app.get("/api/security-policies/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de política inválido" });
      }
      
      const policy = await storage.getSecurityPolicy(id);
      if (!policy) {
        return res.status(404).json({ message: "Política de segurança não encontrada" });
      }
      
      res.json(policy);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar política de segurança" });
    }
  });

  app.post("/api/security-policies", async (req, res) => {
    try {
      const validatedData = insertSecurityPolicySchema.parse(req.body);
      const policy = await storage.createSecurityPolicy(validatedData);
      res.status(201).json(policy);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de política inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar política de segurança" });
    }
  });

  app.put("/api/security-policies/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de política inválido" });
      }
      
      const validatedData = insertSecurityPolicySchema.partial().parse(req.body);
      const policy = await storage.updateSecurityPolicy(id, validatedData);
      
      if (!policy) {
        return res.status(404).json({ message: "Política de segurança não encontrada" });
      }
      
      res.json(policy);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de política inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao atualizar política de segurança" });
    }
  });

  app.delete("/api/security-policies/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de política inválido" });
      }
      
      const deleted = await storage.deleteSecurityPolicy(id);
      if (!deleted) {
        return res.status(404).json({ message: "Política de segurança não encontrada" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Falha ao excluir política de segurança" });
    }
  });

  // Integrações
  app.get("/api/integrations", async (req, res) => {
    try {
      const provider = req.query.provider as string | undefined;
      const type = req.query.type as string | undefined;
      const status = req.query.status as string | undefined;
      
      const integrations = await storage.listIntegrations(provider, type, status);
      res.json(integrations);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar integrações" });
    }
  });

  app.get("/api/integrations/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de integração inválido" });
      }
      
      const integration = await storage.getIntegration(id);
      if (!integration) {
        return res.status(404).json({ message: "Integração não encontrada" });
      }
      
      res.json(integration);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar integração" });
    }
  });

  app.post("/api/integrations", async (req, res) => {
    try {
      const validatedData = insertIntegrationSchema.parse(req.body);
      const integration = await storage.createIntegration(validatedData);
      res.status(201).json(integration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de integração inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar integração" });
    }
  });

  app.put("/api/integrations/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de integração inválido" });
      }
      
      const validatedData = insertIntegrationSchema.partial().parse(req.body);
      const integration = await storage.updateIntegration(id, validatedData);
      
      if (!integration) {
        return res.status(404).json({ message: "Integração não encontrada" });
      }
      
      res.json(integration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de integração inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao atualizar integração" });
    }
  });

  app.delete("/api/integrations/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de integração inválido" });
      }
      
      const deleted = await storage.deleteIntegration(id);
      if (!deleted) {
        return res.status(404).json({ message: "Integração não encontrada" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Falha ao excluir integração" });
    }
  });

  // Logs de Integração
  app.get("/api/integrations/:integrationId/logs", async (req, res) => {
    try {
      const integrationId = Number(req.params.integrationId);
      if (isNaN(integrationId)) {
        return res.status(400).json({ message: "ID de integração inválido" });
      }
      
      const event = req.query.event as string | undefined;
      const status = req.query.status as string | undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      
      const logs = await storage.listIntegrationLogs(integrationId, event, status, limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar logs de integração" });
    }
  });

  app.get("/api/integration-logs/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de log inválido" });
      }
      
      const log = await storage.getIntegrationLog(id);
      if (!log) {
        return res.status(404).json({ message: "Log de integração não encontrado" });
      }
      
      res.json(log);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar log de integração" });
    }
  });

  app.post("/api/integration-logs", async (req, res) => {
    try {
      const validatedData = insertIntegrationLogSchema.parse(req.body);
      const log = await storage.createIntegrationLog(validatedData);
      res.status(201).json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de log inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar log de integração" });
    }
  });

  app.delete("/api/integrations/:integrationId/logs", async (req, res) => {
    try {
      const integrationId = Number(req.params.integrationId);
      if (isNaN(integrationId)) {
        return res.status(400).json({ message: "ID de integração inválido" });
      }
      
      const olderThan = req.query.olderThan ? new Date(req.query.olderThan as string) : undefined;
      
      const success = await storage.deleteIntegrationLogs(integrationId, olderThan);
      res.status(success ? 204 : 404).end();
    } catch (error) {
      res.status(500).json({ message: "Falha ao excluir logs de integração" });
    }
  });

  // Registrar rotas de integração com Z-API (WhatsApp)
  registerZapiRoutes(app);
  
  // Registrar rotas para visualização de webhooks
  registerWebhookRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
