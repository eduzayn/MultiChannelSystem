import { 
  users, type User, type InsertUser,
  contacts, type Contact, type InsertContact,
  companies, type Company, type InsertCompany,
  deals, type Deal, type InsertDeal 
} from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contacts: Map<number, Contact>;
  private companies: Map<number, Company>;
  private deals: Map<number, Deal>;
  
  private userCurrentId: number;
  private contactCurrentId: number;
  private companyCurrentId: number;
  private dealCurrentId: number;

  constructor() {
    this.users = new Map();
    this.contacts = new Map();
    this.companies = new Map();
    this.deals = new Map();
    
    this.userCurrentId = 1;
    this.contactCurrentId = 1;
    this.companyCurrentId = 1;
    this.dealCurrentId = 1;
    
    // Add some initial data for demo purposes
    this.users.set(1, {
      id: 1,
      username: "admin",
      password: "admin123",
      displayName: "Ana Silva",
      email: "ana@example.com",
      role: "admin",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    this.users.set(2, {
      id: 2,
      username: "supervisor",
      password: "supervisor123",
      displayName: "Carlos Oliveira",
      email: "carlos@example.com",
      role: "supervisor",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    this.users.set(3, {
      id: 3,
      username: "agent",
      password: "agent123",
      displayName: "Mariana Santos",
      email: "mariana@example.com",
      role: "agent",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    this.userCurrentId = 4;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      isActive: true,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Contact operations
  async getContact(id: number): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }
  
  async listContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }
  
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.contactCurrentId++;
    const now = new Date();
    const contact: Contact = {
      ...insertContact,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.contacts.set(id, contact);
    return contact;
  }
  
  async updateContact(id: number, contactData: Partial<InsertContact>): Promise<Contact | undefined> {
    const contact = this.contacts.get(id);
    if (!contact) return undefined;
    
    const updatedContact: Contact = {
      ...contact,
      ...contactData,
      id,
      updatedAt: new Date()
    };
    
    this.contacts.set(id, updatedContact);
    return updatedContact;
  }
  
  async deleteContact(id: number): Promise<boolean> {
    return this.contacts.delete(id);
  }
  
  // Company operations
  async getCompany(id: number): Promise<Company | undefined> {
    return this.companies.get(id);
  }
  
  async listCompanies(): Promise<Company[]> {
    return Array.from(this.companies.values());
  }
  
  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const id = this.companyCurrentId++;
    const now = new Date();
    const company: Company = {
      ...insertCompany,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.companies.set(id, company);
    return company;
  }
  
  async updateCompany(id: number, companyData: Partial<InsertCompany>): Promise<Company | undefined> {
    const company = this.companies.get(id);
    if (!company) return undefined;
    
    const updatedCompany: Company = {
      ...company,
      ...companyData,
      id,
      updatedAt: new Date()
    };
    
    this.companies.set(id, updatedCompany);
    return updatedCompany;
  }
  
  async deleteCompany(id: number): Promise<boolean> {
    return this.companies.delete(id);
  }
  
  // Deal operations
  async getDeal(id: number): Promise<Deal | undefined> {
    return this.deals.get(id);
  }
  
  async listDeals(): Promise<Deal[]> {
    return Array.from(this.deals.values());
  }
  
  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const id = this.dealCurrentId++;
    const now = new Date();
    const deal: Deal = {
      ...insertDeal,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.deals.set(id, deal);
    return deal;
  }
  
  async updateDeal(id: number, dealData: Partial<InsertDeal>): Promise<Deal | undefined> {
    const deal = this.deals.get(id);
    if (!deal) return undefined;
    
    const updatedDeal: Deal = {
      ...deal,
      ...dealData,
      id,
      updatedAt: new Date()
    };
    
    this.deals.set(id, updatedDeal);
    return updatedDeal;
  }
  
  async deleteDeal(id: number): Promise<boolean> {
    return this.deals.delete(id);
  }
}

export const storage = new MemStorage();
