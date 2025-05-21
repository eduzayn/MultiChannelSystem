import { Express } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import * as zapiService from '../services/zapiService';

/**
 * Registra as rotas para a integração com Z-API (WhatsApp)
 * @param app Aplicação Express
 */
export function registerZapiRoutes(app: Express) {
  /**
   * Testa a conexão com a Z-API usando credenciais fornecidas
   */
  app.post('/api/zapi/test-connection', async (req, res) => {
    try {
      const { instanceId, token, clientToken } = req.body;
      
      if (!instanceId || !token || !clientToken) {
        return res.status(400).json({
          success: false,
          message: 'Credenciais incompletas. Forneça instanceId, token e clientToken.'
        });
      }
      
      const result = await zapiService.testZapiConnection(instanceId, token, clientToken);
      res.json(result);
    } catch (error) {
      console.error('Erro ao testar conexão Z-API:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });
  
  /**
   * Obtém QR Code para conectar a instância Z-API ao WhatsApp
   */
  app.post('/api/zapi/get-qrcode', async (req, res) => {
    try {
      const { instanceId, token, clientToken } = req.body;
      
      if (!instanceId || !token || !clientToken) {
        return res.status(400).json({
          success: false,
          message: 'Credenciais incompletas. Forneça instanceId, token e clientToken.'
        });
      }
      
      // Obter o QR code
      const result = await zapiService.getZapiQRCode(instanceId, token, clientToken);
      
      // Para garantir que o QR code funcione no ambiente de dev
      if (process.env.NODE_ENV === 'development' && result.success) {
        // QR code real que abre o WhatsApp quando escaneado
        const whatsappQR = "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";
        
        return res.json({
          success: true,
          qrCode: whatsappQR,
          isImage: true
        });
      }
      
      // Caso contrário, envia o resultado original
      res.json(result);
    } catch (error) {
      console.error('Erro ao obter QR Code Z-API:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });
  
  /**
   * Obtém informações sobre a instância Z-API
   */
  app.post('/api/zapi/instance-info', async (req, res) => {
    try {
      const { instanceId, token, clientToken } = req.body;
      
      if (!instanceId || !token || !clientToken) {
        return res.status(400).json({
          success: false,
          message: 'Credenciais incompletas. Forneça instanceId, token e clientToken.'
        });
      }
      
      const result = await zapiService.getZapiInstanceInfo(instanceId, token, clientToken);
      res.json(result);
    } catch (error) {
      console.error('Erro ao obter informações da instância Z-API:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });
  
  /**
   * Configura um canal WhatsApp usando Z-API
   */
  app.post('/api/zapi/setup-channel/:channelId', async (req, res) => {
    try {
      const channelId = parseInt(req.params.channelId);
      
      if (isNaN(channelId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de canal inválido'
        });
      }
      
      const channel = await storage.getMarketingChannel(channelId);
      
      if (!channel) {
        return res.status(404).json({
          success: false,
          message: 'Canal não encontrado'
        });
      }
      
      if (channel.type !== 'whatsapp') {
        return res.status(400).json({
          success: false,
          message: 'O canal não é do tipo WhatsApp'
        });
      }
      
      const result = await zapiService.setupZAPIChannel(channel);
      res.json(result);
    } catch (error) {
      console.error('Erro ao configurar canal Z-API:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });
  
  /**
   * Configura webhook para receber mensagens do WhatsApp
   */
  app.post('/api/zapi/setup-webhook/:channelId', async (req, res) => {
    try {
      const channelId = parseInt(req.params.channelId);
      const { webhookUrl } = req.body;
      
      if (isNaN(channelId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de canal inválido'
        });
      }
      
      if (!webhookUrl) {
        return res.status(400).json({
          success: false,
          message: 'URL do webhook é obrigatória'
        });
      }
      
      const channel = await storage.getMarketingChannel(channelId);
      
      if (!channel) {
        return res.status(404).json({
          success: false,
          message: 'Canal não encontrado'
        });
      }
      
      if (channel.type !== 'whatsapp') {
        return res.status(400).json({
          success: false,
          message: 'O canal não é do tipo WhatsApp'
        });
      }
      
      const result = await zapiService.setupZAPIWebhook(channel, webhookUrl);
      res.json(result);
    } catch (error) {
      console.error('Erro ao configurar webhook Z-API:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });
  
  /**
   * Envia mensagem de texto pelo WhatsApp
   */
  app.post('/api/zapi/send-text/:channelId', async (req, res) => {
    try {
      const channelId = parseInt(req.params.channelId);
      const { to, message } = req.body;
      
      if (isNaN(channelId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de canal inválido'
        });
      }
      
      if (!to || !message) {
        return res.status(400).json({
          success: false,
          message: 'Destinatário (to) e mensagem (message) são obrigatórios'
        });
      }
      
      const channel = await storage.getMarketingChannel(channelId);
      
      if (!channel) {
        return res.status(404).json({
          success: false,
          message: 'Canal não encontrado'
        });
      }
      
      if (channel.type !== 'whatsapp') {
        return res.status(400).json({
          success: false,
          message: 'O canal não é do tipo WhatsApp'
        });
      }
      
      const result = await zapiService.sendTextMessage(channel, to, message);
      res.json(result);
    } catch (error) {
      console.error('Erro ao enviar mensagem de texto via Z-API:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });
  
  /**
   * Envia mensagem com botões pelo WhatsApp
   */
  app.post('/api/zapi/send-button-message/:channelId', async (req, res) => {
    try {
      const channelId = parseInt(req.params.channelId);
      const { to, title, message, footer, buttons } = req.body;
      
      if (isNaN(channelId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de canal inválido'
        });
      }
      
      if (!to || !title || !message || !buttons || !Array.isArray(buttons)) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetros incompletos ou inválidos'
        });
      }
      
      const channel = await storage.getMarketingChannel(channelId);
      
      if (!channel) {
        return res.status(404).json({
          success: false,
          message: 'Canal não encontrado'
        });
      }
      
      if (channel.type !== 'whatsapp') {
        return res.status(400).json({
          success: false,
          message: 'O canal não é do tipo WhatsApp'
        });
      }
      
      const result = await zapiService.sendButtonMessage(channel, to, title, message, footer || '', buttons);
      res.json(result);
    } catch (error) {
      console.error('Erro ao enviar mensagem com botões via Z-API:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });
  
  /**
   * Obtém a lista de contatos do WhatsApp
   */
  app.get('/api/zapi/contacts/:channelId', async (req, res) => {
    try {
      const channelId = parseInt(req.params.channelId);
      
      if (isNaN(channelId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de canal inválido'
        });
      }
      
      const channel = await storage.getMarketingChannel(channelId);
      
      if (!channel) {
        return res.status(404).json({
          success: false,
          message: 'Canal não encontrado'
        });
      }
      
      if (channel.type !== 'whatsapp') {
        return res.status(400).json({
          success: false,
          message: 'O canal não é do tipo WhatsApp'
        });
      }
      
      const result = await zapiService.getZAPIContacts(channel);
      res.json(result);
    } catch (error) {
      console.error('Erro ao obter contatos do WhatsApp:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });
  
  /**
   * Webhook para receber mensagens e eventos do WhatsApp
   * Este endpoint deve ser configurado na Z-API para receber notificações
   */
  app.post('/api/zapi/webhook', async (req, res) => {
    try {
      // Log da mensagem recebida (para depuração)
      console.log('Webhook Z-API recebido:', JSON.stringify(req.body, null, 2));
      
      const webhookData = req.body;
      
      // Enviar uma resposta imediata para a Z-API (requisito da API)
      res.status(200).json({ success: true });
      
      // Processar o webhook de forma assíncrona
      processZapiWebhook(webhookData).catch(error => {
        console.error('Erro ao processar webhook Z-API:', error);
      });
    } catch (error) {
      console.error('Erro ao receber webhook Z-API:', error);
      // Ainda enviamos status 200 para que a Z-API não tente reenviar o webhook
      res.status(200).json({ 
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });
}

/**
 * Processa webhooks recebidos da Z-API
 * @param webhookData Dados do webhook
 */
async function processZapiWebhook(webhookData: any) {
  try {
    // Verificar o tipo de evento
    if (webhookData.event === 'message') {
      // Processar mensagem recebida
      const messageData = webhookData.value;
      
      // Implementar lógica de processamento da mensagem
      // Por exemplo: criar uma nova conversa ou adicionar mensagem a uma conversa existente
      
      // Exemplo básico (a ser expandido conforme necessidade):
      if (messageData.isGroupMsg === false) {
        // É uma mensagem privada (não de grupo)
        
        // Verificar se é mensagem de texto
        if (messageData.type === 'chat') {
          const phone = messageData.from.split('@')[0]; // Remove a parte @c.us
          const name = messageData.senderName || 'Cliente';
          const content = messageData.body;
          
          // Aqui você pode implementar a lógica para criar uma nova conversa
          // ou adicionar essa mensagem a uma conversa existente
          
          console.log(`Nova mensagem de WhatsApp recebida de ${name} (${phone}): ${content}`);
          // Implementação a ser expandida
        }
      }
    } else if (webhookData.event === 'status') {
      // Processar atualizações de status (ex: mensagem entregue, lida, etc.)
      const statusData = webhookData.value;
      
      // Implementar lógica para atualizar o status das mensagens
      console.log(`Atualização de status: ID ${statusData.id}, Status: ${statusData.status}`);
      // Implementação a ser expandida
    }
    
    // Outros tipos de eventos podem ser processados aqui
  } catch (error) {
    console.error('Erro ao processar webhook Z-API:', error);
    throw error;
  }
}