import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';

// Tipos de eventos que podem ser emitidos pelo servidor
export enum ServerEventTypes {
  // Eventos relacionados a mensagens
  NEW_MESSAGE = 'new_message',
  MESSAGE_UPDATED = 'message_updated',
  MESSAGE_READ = 'message_read',
  
  // Eventos relacionados a conversas
  NEW_CONVERSATION = 'new_conversation',
  CONVERSATION_UPDATED = 'conversation_updated',
  
  // Eventos relacionados a contatos
  NEW_CONTACT = 'new_contact',
  CONTACT_UPDATED = 'contact_updated',
  
  // Eventos relacionados a canais/integrações
  CHANNEL_STATUS_UPDATED = 'channel_status_updated',
  WEBHOOK_RECEIVED = 'webhook_received',
  
  // Eventos relacionados a KPIs e métricas
  KPI_UPDATED = 'kpi_updated',
  DASHBOARD_UPDATED = 'dashboard_updated',
  TEAM_METRICS_UPDATED = 'team_metrics_updated',
  GOAL_PROGRESS_UPDATED = 'goal_progress_updated',
  
  // Eventos de sistema
  NOTIFICATION = 'notification'
}

// Tipos de eventos que o cliente pode enviar
export enum ClientEventTypes {
  JOIN_CONVERSATION = 'join_conversation',
  LEAVE_CONVERSATION = 'leave_conversation',
  TYPING = 'typing',
  STOP_TYPING = 'stop_typing',
  READ_MESSAGES = 'read_messages'
}

// Interface para o serviço de socket
export interface SocketServiceInterface {
  init(httpServer: HTTPServer): void;
  emit(event: ServerEventTypes, data: any): void;
  emitToRoom(room: string, event: ServerEventTypes, data: any): void;
}

// Classe que gerencia a comunicação por socket
class SocketService implements SocketServiceInterface {
  private io: Server | null = null;
  private connectedClients: Map<string, Socket> = new Map();

  init(httpServer: HTTPServer): void {
    if (this.io) {
      console.log('Socket.IO já está inicializado');
      return;
    }

    this.io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket: Socket) => {
      console.log(`Cliente conectado: ${socket.id}`);
      this.connectedClients.set(socket.id, socket);

      // Escutar eventos de entrada em salas (conversas)
      socket.on(ClientEventTypes.JOIN_CONVERSATION, (conversationId: string) => {
        socket.join(`conversation:${conversationId}`);
        console.log(`Cliente ${socket.id} entrou na conversa ${conversationId}`);
      });

      // Escutar eventos de saída de salas
      socket.on(ClientEventTypes.LEAVE_CONVERSATION, (conversationId: string) => {
        socket.leave(`conversation:${conversationId}`);
        console.log(`Cliente ${socket.id} saiu da conversa ${conversationId}`);
      });

      // Escutar eventos de digitação
      socket.on(ClientEventTypes.TYPING, ({ conversationId, userId, userName }: { conversationId: string, userId: string, userName: string }) => {
        socket.to(`conversation:${conversationId}`).emit('user_typing', { userId, userName });
      });

      // Escutar eventos de parar digitação
      socket.on(ClientEventTypes.STOP_TYPING, ({ conversationId, userId }: { conversationId: string, userId: string }) => {
        socket.to(`conversation:${conversationId}`).emit('user_stop_typing', { userId });
      });

      // Escutar eventos de leitura de mensagens
      socket.on(ClientEventTypes.READ_MESSAGES, ({ conversationId, userId, messageIds }: { conversationId: string, userId: string, messageIds: number[] }) => {
        // Emitir para todos na sala que as mensagens foram lidas
        this.io?.to(`conversation:${conversationId}`).emit(ServerEventTypes.MESSAGE_READ, { conversationId, userId, messageIds });
      });

      // Gerenciar desconexão
      socket.on('disconnect', () => {
        console.log(`Cliente desconectado: ${socket.id}`);
        this.connectedClients.delete(socket.id);
      });
    });

    console.log('Serviço de Socket.IO inicializado');
  }

  // Emitir evento para todos os clientes conectados
  emit(event: ServerEventTypes, data: any): void {
    if (!this.io) {
      console.warn('Tentativa de emitir evento, mas Socket.IO não está inicializado');
      return;
    }

    this.io.emit(event, data);
    console.log(`Evento ${event} emitido para todos os clientes`);
  }

  // Emitir evento para uma sala específica (ex: uma conversa)
  emitToRoom(room: string, event: ServerEventTypes, data: any): void {
    if (!this.io) {
      console.warn('Tentativa de emitir evento para sala, mas Socket.IO não está inicializado');
      return;
    }

    this.io.to(room).emit(event, data);
    console.log(`Evento ${event} emitido para sala ${room}`);
  }

  // Retorna o número de clientes conectados
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}

// Exportar uma instância única (singleton) do serviço
export const socketService = new SocketService();
