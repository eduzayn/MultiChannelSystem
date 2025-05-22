import { create } from 'zustand';
import { ConversationItemProps } from '../components/ConversationItem';

interface ConversationState {
  // Estado atual
  selectedConversation: ConversationItemProps | null;
  conversations: ConversationItemProps[];
  filterType: 'all' | 'mine' | 'unassigned' | 'mentioned' | 'unread' | 'sla-risk' | 'favorites';
  searchQuery: string;
  
  // Ações
  setSelectedConversation: (conversation: ConversationItemProps | null) => void;
  setConversations: (conversations: ConversationItemProps[]) => void;
  addConversation: (conversation: ConversationItemProps) => void;
  updateConversation: (id: string, updates: Partial<ConversationItemProps>) => void;
  removeConversation: (id: string) => void;
  setFilterType: (type: 'all' | 'mine' | 'unassigned' | 'mentioned' | 'unread' | 'sla-risk' | 'favorites') => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
  // Estado inicial
  selectedConversation: null,
  conversations: [],
  filterType: 'all',
  searchQuery: '',
  
  // Ações implementadas
  setSelectedConversation: (conversation) => 
    set({ selectedConversation: conversation }),
    
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
}));