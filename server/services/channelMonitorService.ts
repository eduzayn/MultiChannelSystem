import { socketService, ServerEventTypes } from './socketService';
import { db } from '../db';
import { marketingChannels } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import axios from 'axios';

interface ChannelStatus {
  id: number;
  type: string;
  connected: boolean;
  lastCheck: Date;
  errorMessage?: string;
}

/**
 * Serviço para monitorar o status dos canais de comunicação
 * Verifica periodicamente a conexão dos canais com as APIs externas
 * e notifica os clientes conectados sobre mudanças de status
 */
class ChannelMonitorService {
  private channels: Map<number, ChannelStatus> = new Map();
  private intervalId: NodeJS.Timeout | null = null;
  private checkIntervalMs = 30000; // 30 segundos

  /**
   * Inicia o monitoramento dos canais
   */
  start() {
    if (this.intervalId) {
      console.log('Monitoramento de canais já está ativo');
      return;
    }

    console.log('Iniciando monitoramento de canais');
    this.checkAllChannels(); // Verificação inicial

    // Configurar verificação periódica
    this.intervalId = setInterval(() => {
      this.checkAllChannels();
    }, this.checkIntervalMs);
  }

  /**
   * Para o monitoramento dos canais
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Monitoramento de canais interrompido');
    }
  }

  /**
   * Verifica o status de todos os canais ativos
   */
  async checkAllChannels() {
    try {
      // Buscar todos os canais WhatsApp ativos no banco de dados
      const whatsappChannels = await db.query.marketingChannels.findMany({
        where: and(
          eq(marketingChannels.type, 'whatsapp'),
          eq(marketingChannels.isActive, true)
        )
      });

      console.log(`Verificando ${whatsappChannels.length} canais WhatsApp ativos`);

      // Verificar cada canal
      for (const channel of whatsappChannels) {
        await this.checkWhatsAppChannel(channel);
      }
    } catch (error) {
      console.error('Erro ao verificar canais:', error);
    }
  }

  /**
   * Verifica o status de um canal WhatsApp específico
   */
  async checkWhatsAppChannel(channel: any) {
    try {
      if (!channel.configuration) {
        console.warn(`Canal ${channel.id} não possui configuração`);
        return;
      }

      const config = typeof channel.configuration === 'string' 
        ? JSON.parse(channel.configuration) 
        : channel.configuration;

      const { instanceId, token, clientToken } = config;

      if (!instanceId || !token) {
        console.warn(`Canal ${channel.id} não possui instanceId ou token`);
        return;
      }

      // Obter status anterior (se existir)
      const previousStatus = this.channels.get(channel.id);
      
      try {
        // Verificar status do canal na Z-API usando o endpoint correto
        const response = await axios.get(
          `https://api.z-api.io/instances/${instanceId}/token/${token}/status`, 
          { 
            headers: { 
              'Content-Type': 'application/json',
              ...(clientToken ? { 'Client-Token': clientToken } : {})
            } 
          }
        );

        const connected = response.data?.connected === true;
        const currentStatus: ChannelStatus = {
          id: channel.id,
          type: 'whatsapp',
          connected,
          lastCheck: new Date()
        };
        
        // Verificar se houve mudança no status
        const statusChanged = !previousStatus || previousStatus.connected !== connected;
        
        if (statusChanged) {
          console.log(`Status do canal ${channel.id} alterado: ${connected ? 'Conectado' : 'Desconectado'}`);
          
          // Atualizar status no banco de dados
          await db.update(marketingChannels)
            .set({ 
              isConnected: connected,
              lastStatusChange: new Date(),
              lastCheck: new Date()
            })
            .where(eq(marketingChannels.id, channel.id));
          
          // Notificar clientes sobre a mudança de status
          socketService.emit(ServerEventTypes.CHANNEL_STATUS_UPDATED, {
            channelId: channel.id,
            type: 'whatsapp',
            connected,
            timestamp: new Date()
          });
        }
        
        // Atualizar status no cache
        this.channels.set(channel.id, currentStatus);
        
      } catch (error: any) {
        console.error(`Erro ao verificar canal ${channel.id}:`, error.message);
        
        const connected = false;
        const errorMessage = error.response?.data?.message || error.message;
        
        const currentStatus: ChannelStatus = {
          id: channel.id,
          type: 'whatsapp',
          connected: false,
          lastCheck: new Date(),
          errorMessage
        };
        
        // Verificar se houve mudança no status
        const statusChanged = !previousStatus || previousStatus.connected !== connected;
        
        if (statusChanged) {
          console.log(`Status do canal ${channel.id} alterado: Desconectado (erro)`);
          
          // Atualizar status no banco de dados
          await db.update(marketingChannels)
            .set({ 
              isConnected: false,
              lastStatusChange: new Date(),
              lastErrorMessage: errorMessage,
              lastCheck: new Date()
            })
            .where(eq(marketingChannels.id, channel.id));
          
          // Notificar clientes sobre a mudança de status
          socketService.emit(ServerEventTypes.CHANNEL_STATUS_UPDATED, {
            channelId: channel.id,
            type: 'whatsapp',
            connected: false,
            error: errorMessage,
            timestamp: new Date()
          });
        }
        
        // Atualizar status no cache
        this.channels.set(channel.id, currentStatus);
      }
    } catch (error) {
      console.error(`Erro ao processar verificação do canal ${channel.id}:`, error);
    }
  }

  /**
   * Verifica imediatamente um canal específico pelo ID
   */
  async checkChannelById(channelId: number) {
    try {
      const channel = await db.query.marketingChannels.findFirst({
        where: eq(marketingChannels.id, channelId)
      });

      if (!channel) {
        console.warn(`Canal ${channelId} não encontrado`);
        return;
      }

      if (channel.type === 'whatsapp') {
        await this.checkWhatsAppChannel(channel);
      }
      // Adicionar outros tipos de canais conforme necessário
    } catch (error) {
      console.error(`Erro ao verificar canal ${channelId}:`, error);
    }
  }
}

// Exportar instância única (singleton) do serviço
export const channelMonitorService = new ChannelMonitorService();