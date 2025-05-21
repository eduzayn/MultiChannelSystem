import { 
  users, type User, type InsertUser,
  contacts, type Contact, type InsertContact,
  companies, type Company, type InsertCompany,
  deals, type Deal, type InsertDeal,
  conversations, type Conversation, type InsertConversation,
  messages, type Message, type InsertMessage 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, or, and, isNull } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  listUsers(): Promise<User[]>;
  
  // Contact operations
  getContact(id: number): Promise<Contact | undefined>;
  listContacts(): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact | undefined>;
  deleteContact(id: number): Promise<boolean>;
  
  // Company operations
  getCompany(id: number): Promise<Company | undefined>;
  listCompanies(): Promise<Company[]>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: number): Promise<boolean>;
  
  // Deal operations
  getDeal(id: number): Promise<Deal | undefined>;
  listDeals(): Promise<Deal[]>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  updateDeal(id: number, deal: Partial<InsertDeal>): Promise<Deal | undefined>;
  deleteDeal(id: number): Promise<boolean>;

  // Conversation operations
  getConversation(id: number): Promise<Conversation | undefined>;
  listConversations(): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: number, conversation: Partial<InsertConversation>): Promise<Conversation | undefined>;
  deleteConversation(id: number): Promise<boolean>;

  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  listMessagesByConversation(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessageStatus(id: number, status: string): Promise<Message | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      role: insertUser.role || "agent",
      avatar: insertUser.avatar || null
    }).returning();
    return user;
  }
  
  async listUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  // Contact operations
  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact;
  }
  
  async listContacts(): Promise<Contact[]> {
    return await db.select().from(contacts);
  }
  
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db.insert(contacts).values({
      ...insertContact,
      email: insertContact.email || null,
      phone: insertContact.phone || null,
      company: insertContact.company || null,
      notes: insertContact.notes || null,
      createdBy: insertContact.createdBy || null
    }).returning();
    return contact;
  }
  
  async updateContact(id: number, contactData: Partial<InsertContact>): Promise<Contact | undefined> {
    const [contact] = await db.update(contacts)
      .set({
        ...contactData,
        updatedAt: new Date()
      })
      .where(eq(contacts.id, id))
      .returning();
    return contact;
  }
  
  async deleteContact(id: number): Promise<boolean> {
    const result = await db.delete(contacts).where(eq(contacts.id, id));
    return !!result;
  }
  
  // Company operations
  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }
  
  async listCompanies(): Promise<Company[]> {
    return await db.select().from(companies);
  }
  
  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db.insert(companies).values({
      ...insertCompany,
      website: insertCompany.website || null,
      industry: insertCompany.industry || null,
      size: insertCompany.size || null,
      address: insertCompany.address || null,
      notes: insertCompany.notes || null,
      createdBy: insertCompany.createdBy || null
    }).returning();
    return company;
  }
  
  async updateCompany(id: number, companyData: Partial<InsertCompany>): Promise<Company | undefined> {
    const [company] = await db.update(companies)
      .set({
        ...companyData,
        updatedAt: new Date()
      })
      .where(eq(companies.id, id))
      .returning();
    return company;
  }
  
  async deleteCompany(id: number): Promise<boolean> {
    const result = await db.delete(companies).where(eq(companies.id, id));
    return !!result;
  }
  
  // Deal operations
  async getDeal(id: number): Promise<Deal | undefined> {
    const [deal] = await db.select().from(deals).where(eq(deals.id, id));
    return deal;
  }
  
  async listDeals(): Promise<Deal[]> {
    return await db.select().from(deals);
  }
  
  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const [deal] = await db.insert(deals).values({
      ...insertDeal,
      value: insertDeal.value || null,
      notes: insertDeal.notes || null,
      contactId: insertDeal.contactId || null,
      companyId: insertDeal.companyId || null,
      expectedCloseDate: insertDeal.expectedCloseDate || null,
      assignedTo: insertDeal.assignedTo || null
    }).returning();
    return deal;
  }
  
  async updateDeal(id: number, dealData: Partial<InsertDeal>): Promise<Deal | undefined> {
    const [deal] = await db.update(deals)
      .set({
        ...dealData,
        updatedAt: new Date()
      })
      .where(eq(deals.id, id))
      .returning();
    return deal;
  }
  
  async deleteDeal(id: number): Promise<boolean> {
    const result = await db.delete(deals).where(eq(deals.id, id));
    return !!result;
  }

  // Conversation operations
  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }
  
  async listConversations(): Promise<Conversation[]> {
    return await db.select().from(conversations).orderBy(desc(conversations.lastMessageAt));
  }
  
  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db.insert(conversations).values({
      ...insertConversation,
      avatar: insertConversation.avatar || null,
      lastMessage: insertConversation.lastMessage || '',
      assignedTo: insertConversation.assignedTo || null,
      contactId: insertConversation.contactId || null
    }).returning();
    return conversation;
  }
  
  async updateConversation(id: number, conversationData: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const [conversation] = await db.update(conversations)
      .set({
        ...conversationData,
        updatedAt: new Date()
      })
      .where(eq(conversations.id, id))
      .returning();
    return conversation;
  }
  
  async deleteConversation(id: number): Promise<boolean> {
    const result = await db.delete(conversations).where(eq(conversations.id, id));
    return !!result;
  }

  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }
  
  async listMessagesByConversation(conversationId: number): Promise<Message[]> {
    return await db.select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.timestamp);
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values({
      ...insertMessage,
      metadata: insertMessage.metadata || {}
    }).returning();
    
    // Primeiro buscar o valor atual de unreadCount
    const [currentConversation] = await db.select().from(conversations)
      .where(eq(conversations.id, insertMessage.conversationId));
      
    // Update the conversation with the last message
    await db.update(conversations)
      .set({
        lastMessage: insertMessage.content,
        lastMessageAt: insertMessage.timestamp || new Date(),
        unreadCount: insertMessage.sender === 'contact' 
          ? (currentConversation.unreadCount || 0) + 1 
          : (currentConversation.unreadCount || 0),
        updatedAt: new Date()
      })
      .where(eq(conversations.id, insertMessage.conversationId));
    
    return message;
  }
  
  async updateMessageStatus(id: number, status: string): Promise<Message | undefined> {
    const [message] = await db.update(messages)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(messages.id, id))
      .returning();
    return message;
  }
}

// Inicializa com o armazenamento em banco de dados
export const storage = new DatabaseStorage();
