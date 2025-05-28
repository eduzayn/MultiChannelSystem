import { create } from 'zustand';
import { ConversationItemProps } from '../components/ConversationItem';
import { socketClient, ServerEventTypes } from '@/lib/socketClient';

interface ContactData {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  type?: string;
  tags?: string[];
  lastActivity?: Date;
}

interface ConversationMetrics {
  responseTime?: number;
  resolutionTime?: number;
  messageCount?: number;
  customerSatisfaction?: number;
  lastUpdated: Date;
}

interface ConversationState {
  // Estado atual
  selectedConversation: ConversationItemProps | null;
  conversations: ConversationItemProps[];
  filterType: 'all' | 'mine' | 'unassigned' | 'mentioned' | 'unread' | 'sla-risk' | 'favorites';
  searchQuery: string;
  
  contactData: Record<string, ContactData>; // Mapeado por conversationId
  conversationMetrics: Record<string, ConversationMetrics>; // Mapeado por conversationId
  
  // Estado de carregamento
  isLoadingContact: boolean;
  isLoadingMetrics: boolean;
  
  setSelectedConversation: (conversation: ConversationItemProps | null) => void;
  setConversations: (conversations: ConversationItemProps[]) => void;
  addConversation: (conversation: ConversationItemProps) => void;
  updateConversation: (id: string, updates: Partial<ConversationItemProps>) => void;
  removeConversation: (id: string) => void;
  setFilterType: (type: 'all' | 'mine' | 'unassigned' | 'mentioned' | 'unread' | 'sla-risk' | 'favorites') => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  
  // Ações integradas com CRM e relatórios
  loadContactData: (conversationId: string) => Promise<void>;
  updateContactData: (conversationId: string, contactData: Partial<ContactData>) => Promise<void>;
  loadConversationMetrics: (conversationId: string) => Promise<void>;
  logUserActivity: (activityType: string, entityId: string, details?: any) => Promise<void>;
  updateConversationStatus: (conversationId: string, status: string) => Promise<void>;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  // Estado inicial
  selectedConversation: null,
  conversations: [],
  filterType: 'all',
  searchQuery: '',
  contactData: {},
  conversationMetrics: {},
  isLoadingContact: false,
  isLoadingMetrics: false,
  
  // Ações implementadas
  setSelectedConversation: (conversation) => {
    set({ selectedConversation: conversation });
    
    if (conversation) {
      get().loadContactData(conversation.id);
      get().loadConversationMetrics(conversation.id);
      
      get().logUserActivity('view_conversation', conversation.id, {
        conversationName: conversation.name,
        channel: conversation.channel
      });
    }
  },
    
  setConversations: (conversations) => 
    set({ conversations }),
    
  addConversation: (conversation) => 
    set((state) => ({ 
      conversations: [conversation, ...state.conversations] 
    })),
    
  updateConversation: (id, updates) => 
    set((state) => ({
      conversations: state.conversations.map((conv) => 
        conv.id === id ? { ...conv, ...updates } : conv
      ),
      // Se a conversa atualizada é a selecionada, atualizar também o selectedConversation
      selectedConversation: state.selectedConversation?.id === id
        ? { ...state.selectedConversation, ...updates }
        : state.selectedConversation
    })),
    
  removeConversation: (id) => 
    set((state) => ({
      conversations: state.conversations.filter((conv) => conv.id !== id),
      // Se a conversa removida é a selecionada, limpar a seleção
      selectedConversation: state.selectedConversation?.id === id
        ? null
        : state.selectedConversation
    })),
    
  setFilterType: (filterType) => 
    set({ filterType }),
    
  setSearchQuery: (searchQuery) => 
    set({ searchQuery }),
    
  clearFilters: () => 
    set({ filterType: 'all', searchQuery: '' }),
    
  loadContactData: async (conversationId) => {
    try {
      set({ isLoadingContact: true });
      
      const response = await fetch(`/api/conversations/${conversationId}/contact`);
      
      if (response.ok) {
        const data = await response.json();
        set((state) => ({
          contactData: {
            ...state.contactData,
            [conversationId]: data
          }
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do contato:', error);
    } finally {
      set({ isLoadingContact: false });
    }
  },
  
  updateContactData: async (conversationId, contactData) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/contact`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData)
      });
      
      if (response.ok) {
        const data = await response.json();
        set((state) => ({
          contactData: {
            ...state.contactData,
            [conversationId]: {
              ...state.contactData[conversationId],
              ...data
            }
          }
        }));
        
        socketClient.emit(ServerEventTypes.CONTACT_UPDATED, {
          conversationId,
          contactId: data.id
        });
        
        get().logUserActivity('update_contact', conversationId, {
          contactId: data.id,
          updatedFields: Object.keys(contactData)
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar dados do contato:', error);
    }
  },
  
  loadConversationMetrics: async (conversationId) => {
    try {
      set({ isLoadingMetrics: true });
      
      const response = await fetch(`/api/conversations/${conversationId}/metrics`);
      
      if (response.ok) {
        const data = await response.json();
        set((state) => ({
          conversationMetrics: {
            ...state.conversationMetrics,
            [conversationId]: {
              ...data,
              lastUpdated: new Date()
            }
          }
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar métricas da conversa:', error);
    } finally {
      set({ isLoadingMetrics: false });
    }
  },
  
  logUserActivity: async (activityType, entityId, details = {}) => {
    try {
      await fetch('/api/user-activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activityType,
          entityType: 'conversation',
          entityId,
          details,
          performedAt: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Erro ao registrar atividade do usuário:', error);
    }
  },
  
  updateConversationStatus: async (conversationId, status) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        get().updateConversation(conversationId, { status });
        
        get().logUserActivity('update_conversation_status', conversationId, { status });
        
        socketClient.emit(ServerEventTypes.CONVERSATION_UPDATED, {
          id: conversationId,
          status
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar status da conversa:', error);
    }
  }
}));
