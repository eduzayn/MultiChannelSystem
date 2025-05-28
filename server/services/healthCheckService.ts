import { db } from '../db';
import { sql } from 'drizzle-orm';
import { socketService } from './socketService';

/**
 * Serviço para monitoramento de saúde do sistema
 */
class HealthCheckService {
  private isRunning: boolean = false;
  private checkInterval: NodeJS.Timeout | null = null;
  private lastCheckTime: Date | null = null;
  private healthStatus: {
    database: boolean;
    websocket: boolean;
    memory: boolean;
    uptime: number;
    lastChecked: Date | null;
  } = {
    database: false,
    websocket: false,
    memory: false,
    uptime: 0,
    lastChecked: null
  };

  private startTime: Date = new Date();

  /**
   * Inicia o monitoramento de saúde
   */
  startHealthCheck(intervalMs: number = 60000): void {
    if (this.isRunning) {
      console.log('Monitoramento de saúde já está em execução');
      return;
    }

    this.isRunning = true;
    this.checkInterval = setInterval(() => this.performHealthCheck(), intervalMs);
    console.log(`Monitoramento de saúde iniciado com intervalo de ${intervalMs}ms`);
    
    this.performHealthCheck();
  }

  /**
   * Para o monitoramento de saúde
   */
  stopHealthCheck(): void {
    if (!this.isRunning || !this.checkInterval) {
      console.log('Monitoramento de saúde não está em execução');
      return;
    }

    clearInterval(this.checkInterval);
    this.isRunning = false;
    this.checkInterval = null;
    console.log('Monitoramento de saúde interrompido');
  }

  /**
   * Realiza verificação de saúde do sistema
   */
  async performHealthCheck(): Promise<void> {
    try {
      const now = new Date();
      this.lastCheckTime = now;
      
      const dbStatus = await this.checkDatabaseConnection();
      
      const wsStatus = this.checkWebSocketService();
      
      const memoryStatus = this.checkMemoryUsage();
      
      const uptimeMs = now.getTime() - this.startTime.getTime();
      const uptimeDays = uptimeMs / (1000 * 60 * 60 * 24);
      
      this.healthStatus = {
        database: dbStatus,
        websocket: wsStatus,
        memory: memoryStatus,
        uptime: uptimeDays,
        lastChecked: now
      };
      
      console.log('Verificação de saúde concluída:', this.healthStatus);
    } catch (error) {
      console.error('Erro ao realizar verificação de saúde:', error);
    }
  }

  /**
   * Verifica conexão com banco de dados
   */
  private async checkDatabaseConnection(): Promise<boolean> {
    try {
      const result = await db.execute(sql`SELECT 1 as test`);
      return result.rows.length > 0 && result.rows[0].test === 1;
    } catch (error) {
      console.error('Erro ao verificar conexão com banco de dados:', error);
      return false;
    }
  }

  /**
   * Verifica serviço de WebSocket
   */
  private checkWebSocketService(): boolean {
    try {
      const clientCount = (socketService as any).getConnectedClientsCount();
      return clientCount !== undefined;
    } catch (error) {
      console.error('Erro ao verificar serviço de WebSocket:', error);
      return false;
    }
  }

  /**
   * Verifica uso de memória
   */
  private checkMemoryUsage(): boolean {
    try {
      const memoryUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
      const rssMemoryMB = Math.round(memoryUsage.rss / 1024 / 1024);
      
      console.log(`Uso de memória: Heap ${heapUsedMB}MB/${heapTotalMB}MB, RSS ${rssMemoryMB}MB`);
      
      return (heapUsedMB / heapTotalMB) < 0.8;
    } catch (error) {
      console.error('Erro ao verificar uso de memória:', error);
      return false;
    }
  }

  /**
   * Retorna o status atual de saúde do sistema
   */
  getHealthStatus(): typeof this.healthStatus {
    return { ...this.healthStatus };
  }
}

export const healthCheckService = new HealthCheckService();
