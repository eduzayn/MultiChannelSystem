import { io, Socket } from 'socket.io-client';

// Enums de tipos de eventos do servidor
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

// Enums de tipos de eventos do cliente
export enum ClientEventTypes {
  JOIN_CONVERSATION = 'join_conversation',
  LEAVE_CONVERSATION = 'leave_conversation',
  TYPING = 'typing',
  STOP_TYPING = 'stop_typing',
  READ_MESSAGES = 'read_messages'
}

// Definições de tipos para argumentos de cada evento
export interface NewMessageEvent {
  id: number;
  conversationId: number;
  content: string;
  sender: 'user' | 'contact';
  type: 'text' | 'image' | 'audio' | 'file' | 'location';
  timestamp: Date;
  contactId?: number;
  userId?: number;
  metadata?: Record<string, any>;
}

export interface ConversationUpdatedEvent {
  id: number;
  status?: string;
  unreadCount?: number;
  lastMessageAt?: Date;
  lastMessage?: string;
}

export interface NotificationEvent {
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
}

class SocketClient {
  private socket: Socket | null = null;
  private eventListeners: Map<string, Set<Function>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Inicializa a conexão com o servidor de WebSocket
   */
  init() {
    if (this.socket && this.socket.connected) {
      console.log('Socket já está conectado');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      console.log('Conectando socket ao servidor:', apiUrl);
      
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
      
      this.socket = io(apiUrl, {
        path: '/socket.io',
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectInterval,
        timeout: 20000, // Aumentar timeout para evitar desconexões prematuras
        transports: ['websocket', 'polling'],
        forceNew: true, // Forçar nova conexão para evitar problemas de estado
        autoConnect: false // Conectar manualmente para melhor controle
      });
      
      // Eventos de conexão
      this.socket.on('connect', this.handleConnect.bind(this));
      this.socket.on('disconnect', this.handleDisconnect.bind(this));
      this.socket.on('connect_error', this.handleConnectError.bind(this));
      this.socket.on('reconnect_attempt', this.handleReconnectAttempt.bind(this));
      this.socket.on('reconnect_failed', this.handleReconnectFailed.bind(this));
      
      this.socket.connect();
    } catch (error) {
      console.error('Erro ao inicializar socket:', error);
    }

    // Configurar ouvintes para eventos do servidor
    Object.values(ServerEventTypes).forEach(eventType => {
      this.socket!.on(eventType, (data: any) => {
        this.notifyEventListeners(eventType, data);
      });
    });

    console.log('Socket.IO inicializado');
  }

  /**
   * Trata o evento de conexão bem-sucedida
   */
  private handleConnect() {
    console.log('Socket conectado');
    this.reconnectAttempts = 0;
    this.notifyEventListeners('connect', {});
  }

  /**
   * Trata o evento de desconexão
   */
  private handleDisconnect(reason: string) {
    console.log(`Socket desconectado: ${reason}`);
    this.notifyEventListeners('disconnect', { reason });
  }

  /**
   * Trata o evento de erro na conexão
   */
  private handleConnectError(error: Error) {
    console.error('Erro de conexão do Socket:', error);
    this.notifyEventListeners('connect_error', { error });
  }

  /**
   * Trata uma tentativa de reconexão
   */
  private handleReconnectAttempt(attempt: number) {
    console.log(`Tentativa de reconexão #${attempt}`);
    this.reconnectAttempts = attempt;
    this.notifyEventListeners('reconnect_attempt', { attempt });
  }

  /**
   * Trata falha após várias tentativas de reconexão
   */
  private handleReconnectFailed() {
    console.error('Falha na reconexão após várias tentativas');
    this.notifyEventListeners('reconnect_failed', {});
  }

  /**
   * Notifica todos os ouvintes registrados para um evento específico
   */
  private notifyEventListeners(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Erro no listener para evento ${event}:`, error);
        }
      });
    }
  }

  /**
   * Registra um ouvinte para um evento específico
   */
  on(event: string, callback: Function): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    
    const listeners = this.eventListeners.get(event)!;
    listeners.add(callback);
    
    // Retorna uma função para remover este listener
    return () => {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.eventListeners.delete(event);
      }
    };
  }

  /**
   * Remove um ouvinte específico de um evento
   */
  off(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.eventListeners.delete(event);
      }
    }
  }

  /**
   * Entra em uma sala específica (útil para conversas)
   */
  joinConversation(conversationId: number) {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket não está conectado. Não é possível entrar na conversa.');
      return;
    }
    
    this.socket.emit(ClientEventTypes.JOIN_CONVERSATION, conversationId.toString());
    console.log(`Entrou na conversa ${conversationId}`);
  }

  /**
   * Sai de uma sala específica
   */
  leaveConversation(conversationId: number) {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket não está conectado. Não é possível sair da conversa.');
      return;
    }
    
    this.socket.emit(ClientEventTypes.LEAVE_CONVERSATION, conversationId.toString());
    console.log(`Saiu da conversa ${conversationId}`);
  }

  /**
   * Envia evento de "está digitando" para uma conversa
   */
  sendTyping(conversationId: number, userId: string, userName: string) {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket não está conectado. Não é possível enviar evento de digitação.');
      return;
    }
    
    this.socket.emit(ClientEventTypes.TYPING, { conversationId, userId, userName });
  }

  /**
   * Envia evento de "parou de digitar" para uma conversa
   */
  sendStopTyping(conversationId: number, userId: string) {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket não está conectado. Não é possível enviar evento de parar digitação.');
      return;
    }
    
    this.socket.emit(ClientEventTypes.STOP_TYPING, { conversationId, userId });
  }

  /**
   * Marca mensagens como lidas
   */
  markMessagesAsRead(conversationId: number, userId: string, messageIds: number[]) {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket não está conectado. Não é possível marcar mensagens como lidas.');
      return;
    }
    
    this.socket.emit(ClientEventTypes.READ_MESSAGES, { conversationId, userId, messageIds });
  }

  /**
   * Emite um evento para o servidor
   */
  emit(event: string, data: any) {
    if (!this.socket || !this.socket.connected) {
      console.warn(`Socket não está conectado. Não é possível emitir evento ${event}.`);
      return;
    }
    
    this.socket.emit(event, data);
    console.log(`Evento ${event} emitido:`, data);
  }

  /**
   * Desconecta o socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket desconectado manualmente');
    }
  }
}

// Exportar uma instância única (singleton) do cliente Socket.IO
export const socketClient = new SocketClient();
