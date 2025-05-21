import { 
  users, type User, type InsertUser,
  contacts, type Contact, type InsertContact,
  companies, type Company, type InsertCompany,
  deals, type Deal, type InsertDeal,
  conversations, type Conversation, type InsertConversation,
  messages, type Message, type InsertMessage,
  teams, type Team, type InsertTeam,
  userTeams, type UserTeam, type InsertUserTeam,
  roles, type Role, type InsertRole,
  campaigns, type Campaign, type InsertCampaign,
  campaignResults, type CampaignResult, type InsertCampaignResult,
  automations, type Automation, type InsertAutomation,
  subscriptionPlans, type SubscriptionPlan, type InsertSubscriptionPlan,
  tenantSubscriptions, type TenantSubscription, type InsertTenantSubscription,
  invoices, type Invoice, type InsertInvoice,
  goals, type Goal, type InsertGoal,
  achievements, type Achievement, type InsertAchievement,
  userAchievements, type UserAchievement, type InsertUserAchievement,
  settings, type Setting, type InsertSetting
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
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
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
  
  // Team operations
  getTeam(id: number): Promise<Team | undefined>;
  listTeams(): Promise<Team[]>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: number, team: Partial<InsertTeam>): Promise<Team | undefined>;
  deleteTeam(id: number): Promise<boolean>;
  
  // UserTeam operations
  getUserTeam(userId: number, teamId: number): Promise<UserTeam | undefined>;
  listUserTeams(userId?: number, teamId?: number): Promise<UserTeam[]>;
  createUserTeam(userTeam: InsertUserTeam): Promise<UserTeam>;
  updateUserTeam(userId: number, teamId: number, role: string): Promise<UserTeam | undefined>;
  deleteUserTeam(userId: number, teamId: number): Promise<boolean>;
  
  // Role operations
  getRole(id: number): Promise<Role | undefined>;
  getRoleByName(name: string): Promise<Role | undefined>;
  listRoles(): Promise<Role[]>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: number, role: Partial<InsertRole>): Promise<Role | undefined>;
  deleteRole(id: number): Promise<boolean>;
  
  // Campaign operations
  getCampaign(id: number): Promise<Campaign | undefined>;
  listCampaigns(): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, campaign: Partial<InsertCampaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: number): Promise<boolean>;
  
  // CampaignResult operations
  getCampaignResult(id: number): Promise<CampaignResult | undefined>;
  listCampaignResults(campaignId?: number): Promise<CampaignResult[]>;
  createCampaignResult(campaignResult: InsertCampaignResult): Promise<CampaignResult>;
  updateCampaignResult(id: number, campaignResult: Partial<InsertCampaignResult>): Promise<CampaignResult | undefined>;
  
  // Automation operations
  getAutomation(id: number): Promise<Automation | undefined>;
  listAutomations(): Promise<Automation[]>;
  createAutomation(automation: InsertAutomation): Promise<Automation>;
  updateAutomation(id: number, automation: Partial<InsertAutomation>): Promise<Automation | undefined>;
  deleteAutomation(id: number): Promise<boolean>;
  toggleAutomation(id: number, isActive: boolean): Promise<Automation | undefined>;
  
  // SubscriptionPlan operations
  getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined>;
  listSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: number, plan: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined>;
  
  // TenantSubscription operations
  getTenantSubscription(id: number): Promise<TenantSubscription | undefined>;
  getCurrentTenantSubscription(): Promise<TenantSubscription | undefined>;
  createTenantSubscription(subscription: InsertTenantSubscription): Promise<TenantSubscription>;
  updateTenantSubscription(id: number, subscription: Partial<InsertTenantSubscription>): Promise<TenantSubscription | undefined>;
  
  // Invoice operations
  getInvoice(id: number): Promise<Invoice | undefined>;
  listInvoices(subscriptionId?: number): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  
  // Goal operations
  getGoal(id: number): Promise<Goal | undefined>;
  listGoals(ownerId?: number, teamId?: number): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;
  updateGoalProgress(id: number, newValue: number): Promise<Goal | undefined>;
  
  // Achievement operations
  getAchievement(id: number): Promise<Achievement | undefined>;
  listAchievements(): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  updateAchievement(id: number, achievement: Partial<InsertAchievement>): Promise<Achievement | undefined>;
  deleteAchievement(id: number): Promise<boolean>;
  
  // UserAchievement operations
  getUserAchievement(userId: number, achievementId: number): Promise<UserAchievement | undefined>;
  listUserAchievements(userId?: number): Promise<UserAchievement[]>;
  createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement>;
  
  // Setting operations
  getSetting(category: string, key: string): Promise<Setting | undefined>;
  listSettings(category?: string): Promise<Setting[]>;
  createOrUpdateSetting(setting: InsertSetting): Promise<Setting>;
  deleteSetting(category: string, key: string): Promise<boolean>;
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
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({
        ...userData,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
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
  
  // Team operations
  async getTeam(id: number): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team;
  }
  
  async listTeams(): Promise<Team[]> {
    return await db.select().from(teams);
  }
  
  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const [team] = await db.insert(teams).values({
      ...insertTeam,
      description: insertTeam.description || null,
      managerId: insertTeam.managerId || null
    }).returning();
    return team;
  }
  
  async updateTeam(id: number, teamData: Partial<InsertTeam>): Promise<Team | undefined> {
    const [team] = await db.update(teams)
      .set({
        ...teamData,
        updatedAt: new Date()
      })
      .where(eq(teams.id, id))
      .returning();
    return team;
  }
  
  async deleteTeam(id: number): Promise<boolean> {
    const result = await db.delete(teams).where(eq(teams.id, id));
    return !!result;
  }
  
  // UserTeam operations
  async getUserTeam(userId: number, teamId: number): Promise<UserTeam | undefined> {
    const [userTeam] = await db.select().from(userTeams)
      .where(and(
        eq(userTeams.userId, userId),
        eq(userTeams.teamId, teamId)
      ));
    return userTeam;
  }
  
  async listUserTeams(userId?: number, teamId?: number): Promise<UserTeam[]> {
    if (userId && teamId) {
      return await db.select().from(userTeams)
        .where(and(
          eq(userTeams.userId, userId),
          eq(userTeams.teamId, teamId)
        ));
    } else if (userId) {
      return await db.select().from(userTeams)
        .where(eq(userTeams.userId, userId));
    } else if (teamId) {
      return await db.select().from(userTeams)
        .where(eq(userTeams.teamId, teamId));
    } else {
      return await db.select().from(userTeams);
    }
  }
  
  async createUserTeam(insertUserTeam: InsertUserTeam): Promise<UserTeam> {
    const [userTeam] = await db.insert(userTeams).values({
      ...insertUserTeam,
      role: insertUserTeam.role || 'member'
    }).returning();
    return userTeam;
  }
  
  async updateUserTeam(userId: number, teamId: number, role: string): Promise<UserTeam | undefined> {
    const [userTeam] = await db.update(userTeams)
      .set({
        role
      })
      .where(and(
        eq(userTeams.userId, userId),
        eq(userTeams.teamId, teamId)
      ))
      .returning();
    return userTeam;
  }
  
  async deleteUserTeam(userId: number, teamId: number): Promise<boolean> {
    const result = await db.delete(userTeams)
      .where(and(
        eq(userTeams.userId, userId),
        eq(userTeams.teamId, teamId)
      ));
    return !!result;
  }
  
  // Role operations
  async getRole(id: number): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.id, id));
    return role;
  }
  
  async getRoleByName(name: string): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.name, name));
    return role;
  }
  
  async listRoles(): Promise<Role[]> {
    return await db.select().from(roles);
  }
  
  async createRole(insertRole: InsertRole): Promise<Role> {
    const [role] = await db.insert(roles).values({
      ...insertRole,
      description: insertRole.description || null
    }).returning();
    return role;
  }
  
  async updateRole(id: number, roleData: Partial<InsertRole>): Promise<Role | undefined> {
    const [role] = await db.update(roles)
      .set({
        ...roleData,
        updatedAt: new Date()
      })
      .where(eq(roles.id, id))
      .returning();
    return role;
  }
  
  async deleteRole(id: number): Promise<boolean> {
    const result = await db.delete(roles).where(eq(roles.id, id));
    return !!result;
  }
  
  // Campaign operations
  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign;
  }
  
  async listCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaigns);
  }
  
  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const [campaign] = await db.insert(campaigns).values({
      ...insertCampaign,
      description: insertCampaign.description || null,
      startDate: insertCampaign.startDate || null,
      endDate: insertCampaign.endDate || null,
      targetAudience: insertCampaign.targetAudience || null,
      createdBy: insertCampaign.createdBy || null
    }).returning();
    return campaign;
  }
  
  async updateCampaign(id: number, campaignData: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const [campaign] = await db.update(campaigns)
      .set({
        ...campaignData,
        updatedAt: new Date()
      })
      .where(eq(campaigns.id, id))
      .returning();
    return campaign;
  }
  
  async deleteCampaign(id: number): Promise<boolean> {
    const result = await db.delete(campaigns).where(eq(campaigns.id, id));
    return !!result;
  }
  
  // CampaignResult operations
  async getCampaignResult(id: number): Promise<CampaignResult | undefined> {
    const [result] = await db.select().from(campaignResults).where(eq(campaignResults.id, id));
    return result;
  }
  
  async listCampaignResults(campaignId?: number): Promise<CampaignResult[]> {
    if (campaignId) {
      return await db.select().from(campaignResults)
        .where(eq(campaignResults.campaignId, campaignId));
    }
    return await db.select().from(campaignResults);
  }
  
  async createCampaignResult(insertCampaignResult: InsertCampaignResult): Promise<CampaignResult> {
    const [result] = await db.insert(campaignResults).values({
      ...insertCampaignResult,
      sentAt: insertCampaignResult.sentAt || null,
      deliveredAt: insertCampaignResult.deliveredAt || null,
      openedAt: insertCampaignResult.openedAt || null,
      clickedAt: insertCampaignResult.clickedAt || null,
      respondedAt: insertCampaignResult.respondedAt || null,
      metadata: insertCampaignResult.metadata || {}
    }).returning();
    return result;
  }
  
  async updateCampaignResult(id: number, resultData: Partial<InsertCampaignResult>): Promise<CampaignResult | undefined> {
    const [result] = await db.update(campaignResults)
      .set({
        ...resultData,
        updatedAt: new Date()
      })
      .where(eq(campaignResults.id, id))
      .returning();
    return result;
  }
  
  // Automation operations
  async getAutomation(id: number): Promise<Automation | undefined> {
    const [automation] = await db.select().from(automations).where(eq(automations.id, id));
    return automation;
  }
  
  async listAutomations(): Promise<Automation[]> {
    return await db.select().from(automations);
  }
  
  async createAutomation(insertAutomation: InsertAutomation): Promise<Automation> {
    const [automation] = await db.insert(automations).values({
      ...insertAutomation,
      description: insertAutomation.description || null,
      conditions: insertAutomation.conditions || null,
      createdBy: insertAutomation.createdBy || null
    }).returning();
    return automation;
  }
  
  async updateAutomation(id: number, automationData: Partial<InsertAutomation>): Promise<Automation | undefined> {
    const [automation] = await db.update(automations)
      .set({
        ...automationData,
        updatedAt: new Date()
      })
      .where(eq(automations.id, id))
      .returning();
    return automation;
  }
  
  async deleteAutomation(id: number): Promise<boolean> {
    const result = await db.delete(automations).where(eq(automations.id, id));
    return !!result;
  }
  
  async toggleAutomation(id: number, isActive: boolean): Promise<Automation | undefined> {
    const [automation] = await db.update(automations)
      .set({
        isActive,
        updatedAt: new Date()
      })
      .where(eq(automations.id, id))
      .returning();
    return automation;
  }
  
  // SubscriptionPlan operations
  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan;
  }
  
  async listSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true));
  }
  
  async createSubscriptionPlan(insertPlan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [plan] = await db.insert(subscriptionPlans).values({
      ...insertPlan,
      description: insertPlan.description || null
    }).returning();
    return plan;
  }
  
  async updateSubscriptionPlan(id: number, planData: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.update(subscriptionPlans)
      .set({
        ...planData,
        updatedAt: new Date()
      })
      .where(eq(subscriptionPlans.id, id))
      .returning();
    return plan;
  }
  
  // TenantSubscription operations
  async getTenantSubscription(id: number): Promise<TenantSubscription | undefined> {
    const [subscription] = await db.select().from(tenantSubscriptions).where(eq(tenantSubscriptions.id, id));
    return subscription;
  }
  
  async getCurrentTenantSubscription(): Promise<TenantSubscription | undefined> {
    const [subscription] = await db.select().from(tenantSubscriptions)
      .where(eq(tenantSubscriptions.status, 'active'))
      .orderBy(desc(tenantSubscriptions.startDate))
      .limit(1);
    return subscription;
  }
  
  async createTenantSubscription(insertSubscription: InsertTenantSubscription): Promise<TenantSubscription> {
    const [subscription] = await db.insert(tenantSubscriptions).values({
      ...insertSubscription,
      endDate: insertSubscription.endDate || null,
      billingInfo: insertSubscription.billingInfo || {},
      paymentMethod: insertSubscription.paymentMethod || {}
    }).returning();
    return subscription;
  }
  
  async updateTenantSubscription(id: number, subscriptionData: Partial<InsertTenantSubscription>): Promise<TenantSubscription | undefined> {
    const [subscription] = await db.update(tenantSubscriptions)
      .set({
        ...subscriptionData,
        updatedAt: new Date()
      })
      .where(eq(tenantSubscriptions.id, id))
      .returning();
    return subscription;
  }
  
  // Invoice operations
  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }
  
  async listInvoices(subscriptionId?: number): Promise<Invoice[]> {
    if (subscriptionId) {
      return await db.select().from(invoices)
        .where(eq(invoices.subscriptionId, subscriptionId))
        .orderBy(desc(invoices.dueDate));
    }
    return await db.select().from(invoices).orderBy(desc(invoices.dueDate));
  }
  
  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const [invoice] = await db.insert(invoices).values({
      ...insertInvoice,
      paidDate: insertInvoice.paidDate || null,
      pdfUrl: insertInvoice.pdfUrl || null
    }).returning();
    return invoice;
  }
  
  async updateInvoice(id: number, invoiceData: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const [invoice] = await db.update(invoices)
      .set({
        ...invoiceData,
        updatedAt: new Date()
      })
      .where(eq(invoices.id, id))
      .returning();
    return invoice;
  }
  
  // Goal operations
  async getGoal(id: number): Promise<Goal | undefined> {
    const [goal] = await db.select().from(goals).where(eq(goals.id, id));
    return goal;
  }
  
  async listGoals(ownerId?: number, teamId?: number): Promise<Goal[]> {
    if (ownerId && teamId) {
      return await db.select().from(goals)
        .where(and(
          eq(goals.ownerId, ownerId),
          eq(goals.teamId, teamId)
        ));
    } else if (ownerId) {
      return await db.select().from(goals)
        .where(eq(goals.ownerId, ownerId));
    } else if (teamId) {
      return await db.select().from(goals)
        .where(eq(goals.teamId, teamId));
    }
    return await db.select().from(goals);
  }
  
  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const [goal] = await db.insert(goals).values({
      ...insertGoal,
      description: insertGoal.description || null,
      ownerId: insertGoal.ownerId || null,
      teamId: insertGoal.teamId || null
    }).returning();
    return goal;
  }
  
  async updateGoal(id: number, goalData: Partial<InsertGoal>): Promise<Goal | undefined> {
    const [goal] = await db.update(goals)
      .set({
        ...goalData,
        updatedAt: new Date()
      })
      .where(eq(goals.id, id))
      .returning();
    return goal;
  }
  
  async deleteGoal(id: number): Promise<boolean> {
    const result = await db.delete(goals).where(eq(goals.id, id));
    return !!result;
  }
  
  async updateGoalProgress(id: number, newValue: number): Promise<Goal | undefined> {
    const [goal] = await db.update(goals)
      .set({
        currentValue: newValue,
        updatedAt: new Date()
      })
      .where(eq(goals.id, id))
      .returning();
    return goal;
  }
  
  // Achievement operations
  async getAchievement(id: number): Promise<Achievement | undefined> {
    const [achievement] = await db.select().from(achievements).where(eq(achievements.id, id));
    return achievement;
  }
  
  async listAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements);
  }
  
  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const [achievement] = await db.insert(achievements).values({
      ...insertAchievement,
      description: insertAchievement.description || null,
      icon: insertAchievement.icon || null
    }).returning();
    return achievement;
  }
  
  async updateAchievement(id: number, achievementData: Partial<InsertAchievement>): Promise<Achievement | undefined> {
    const [achievement] = await db.update(achievements)
      .set({
        ...achievementData,
        updatedAt: new Date()
      })
      .where(eq(achievements.id, id))
      .returning();
    return achievement;
  }
  
  async deleteAchievement(id: number): Promise<boolean> {
    const result = await db.delete(achievements).where(eq(achievements.id, id));
    return !!result;
  }
  
  // UserAchievement operations
  async getUserAchievement(userId: number, achievementId: number): Promise<UserAchievement | undefined> {
    const [userAchievement] = await db.select().from(userAchievements)
      .where(and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId)
      ));
    return userAchievement;
  }
  
  async listUserAchievements(userId?: number): Promise<UserAchievement[]> {
    if (userId) {
      return await db.select().from(userAchievements)
        .where(eq(userAchievements.userId, userId));
    }
    return await db.select().from(userAchievements);
  }
  
  async createUserAchievement(insertUserAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const [userAchievement] = await db.insert(userAchievements).values(insertUserAchievement).returning();
    return userAchievement;
  }
  
  // Setting operations
  async getSetting(category: string, key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings)
      .where(and(
        eq(settings.category, category),
        eq(settings.key, key)
      ));
    return setting;
  }
  
  async listSettings(category?: string): Promise<Setting[]> {
    if (category) {
      return await db.select().from(settings)
        .where(eq(settings.category, category));
    }
    return await db.select().from(settings);
  }
  
  async createOrUpdateSetting(insertSetting: InsertSetting): Promise<Setting> {
    // Verificar se já existe
    const existing = await this.getSetting(insertSetting.category, insertSetting.key);
    
    if (existing) {
      // Atualizar
      const [setting] = await db.update(settings)
        .set({
          value: insertSetting.value,
          updatedAt: new Date()
        })
        .where(and(
          eq(settings.category, insertSetting.category),
          eq(settings.key, insertSetting.key)
        ))
        .returning();
      return setting;
    } else {
      // Criar novo
      const [setting] = await db.insert(settings).values(insertSetting).returning();
      return setting;
    }
  }
  
  async deleteSetting(category: string, key: string): Promise<boolean> {
    const result = await db.delete(settings)
      .where(and(
        eq(settings.category, category),
        eq(settings.key, key)
      ));
    return !!result;
  }
}

// Inicializa com o armazenamento em banco de dados
export const storage = new DatabaseStorage();
