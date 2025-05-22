import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';

// Tipo para representar um contato do banco de dados
export interface Contact {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  company: string | null;
  type: string | null;
  address: string | null;
  tags: string[];
  notes: string | null;
  owner: string | null;
  lastActivity?: Date;
  createdAt?: Date;
  metadata?: Record<string, any> | null;
}

// Hook para buscar todos os contatos
export function useContacts() {
  return useQuery({
    queryKey: ['/api/contacts'],
    select: (data: any[]) => {
      // Transformar dados do backend para o formato esperado pelo frontend
      return data.map((contact) => ({
        ...contact,
        // Garantir que tags seja sempre um array
        tags: contact.tags || [],
        // Converter strings de data para objetos Date
        lastActivity: contact.lastActivity ? new Date(contact.lastActivity) : new Date(),
        createdAt: contact.createdAt ? new Date(contact.createdAt) : new Date(),
      }));
    }
  });
}

// Hook para buscar um contato específico
export function useContact(id: number) {
  return useQuery({
    queryKey: ['/api/contacts', id.toString()],
    enabled: !!id,
    select: (data: any) => ({
      ...data,
      tags: data.tags || [],
      lastActivity: data.lastActivity ? new Date(data.lastActivity) : new Date(),
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    })
  });
}

// Hook para criar um novo contato
export function useCreateContact() {
  return useMutation({
    mutationFn: async (newContact: Omit<Contact, 'id'>) => {
      const response = await apiRequest('POST', '/api/contacts', newContact);
      return response.json();
    },
    onSuccess: () => {
      // Invalidar a query para recarregar os contatos
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
    },
  });
}

// Hook para atualizar um contato existente
export function useUpdateContact() {
  return useMutation({
    mutationFn: async (contact: Contact) => {
      const response = await apiRequest('PATCH', `/api/contacts/${contact.id}`, contact);
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidar queries específicas
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/contacts', variables.id.toString()] });
    },
  });
}

// Hook para excluir um contato
export function useDeleteContact() {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/contacts/${id}`, undefined);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
    },
  });
}