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
      
      const result = await zapiService.getZapiQRCode(instanceId, token, clientToken);
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