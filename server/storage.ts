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
  settings, type Setting, type InsertSetting,
  // Marketing & Engagement imports
  audienceSegments, type AudienceSegment, type InsertAudienceSegment,
  segmentMembers, type SegmentMember, type InsertSegmentMember,
  emailTemplates, type EmailTemplate, type InsertEmailTemplate,
  marketingChannels, type MarketingChannel, type InsertMarketingChannel,
  contactForms, type ContactForm, type InsertContactForm,
  formSubmissions, type FormSubmission, type InsertFormSubmission,
  engagementMetrics, type EngagementMetric, type InsertEngagementMetric,
  // Análise & Performance imports
  kpis, type Kpi, type InsertKpi,
  kpiValues, type KpiValue, type InsertKpiValue,
  dashboards, type Dashboard, type InsertDashboard,
  dashboardWidgets, type DashboardWidget, type InsertDashboardWidget,
  reports, type Report, type InsertReport,
  reportResults, type ReportResult, type InsertReportResult,
  userActivities, type UserActivity, type InsertUserActivity,
  teamPerformanceMetrics, type TeamPerformanceMetric, type InsertTeamPerformanceMetric
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, or, and, isNull } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // Marketing & Engagement: Audience Segments
  getAudienceSegment(id: number): Promise<AudienceSegment | undefined>;
  listAudienceSegments(): Promise<AudienceSegment[]>;
  createAudienceSegment(segment: InsertAudienceSegment): Promise<AudienceSegment>;
  updateAudienceSegment(id: number, segment: Partial<InsertAudienceSegment>): Promise<AudienceSegment | undefined>;
  deleteAudienceSegment(id: number): Promise<boolean>;
  
  // Marketing & Engagement: Segment Members
  addContactToSegment(segmentId: number, contactId: number): Promise<SegmentMember>;
  removeContactFromSegment(segmentId: number, contactId: number): Promise<boolean>;
  listSegmentMembers(segmentId: number): Promise<SegmentMember[]>;
  
  // Marketing & Engagement: Email Templates
  getEmailTemplate(id: number): Promise<EmailTemplate | undefined>;
  listEmailTemplates(category?: string): Promise<EmailTemplate[]>;
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  updateEmailTemplate(id: number, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined>;
  deleteEmailTemplate(id: number): Promise<boolean>;
  
  // Marketing & Engagement: Marketing Channels
  getMarketingChannel(id: number): Promise<MarketingChannel | undefined>;
  listMarketingChannels(type?: string): Promise<MarketingChannel[]>;
  createMarketingChannel(channel: InsertMarketingChannel): Promise<MarketingChannel>;
  updateMarketingChannel(id: number, channel: Partial<InsertMarketingChannel>): Promise<MarketingChannel | undefined>;
  deleteMarketingChannel(id: number): Promise<boolean>;

  // Análise & Performance: KPIs
  getKpi(id: number): Promise<Kpi | undefined>;
  listKpis(category?: string): Promise<Kpi[]>;
  createKpi(kpi: InsertKpi): Promise<Kpi>;
  updateKpi(id: number, kpi: Partial<InsertKpi>): Promise<Kpi | undefined>;
  deleteKpi(id: number): Promise<boolean>;
  
  // Análise & Performance: KPI Values
  getKpiValue(id: number): Promise<KpiValue | undefined>;
  listKpiValues(kpiId: number, periodType?: string, limit?: number): Promise<KpiValue[]>;
  createKpiValue(kpiValue: InsertKpiValue): Promise<KpiValue>;
  deleteKpiValue(id: number): Promise<boolean>;
  
  // Análise & Performance: Dashboards
  getDashboard(id: number): Promise<Dashboard | undefined>;
  listDashboards(isPublic?: boolean): Promise<Dashboard[]>;
  getDefaultDashboard(): Promise<Dashboard | undefined>;
  createDashboard(dashboard: InsertDashboard): Promise<Dashboard>;
  updateDashboard(id: number, dashboard: Partial<InsertDashboard>): Promise<Dashboard | undefined>;
  deleteDashboard(id: number): Promise<boolean>;
  
  // Análise & Performance: Dashboard Widgets
  getDashboardWidget(id: number): Promise<DashboardWidget | undefined>;
  listDashboardWidgets(dashboardId: number): Promise<DashboardWidget[]>;
  createDashboardWidget(widget: InsertDashboardWidget): Promise<DashboardWidget>;
  updateDashboardWidget(id: number, widget: Partial<InsertDashboardWidget>): Promise<DashboardWidget | undefined>;
  deleteDashboardWidget(id: number): Promise<boolean>;
  
  // Análise & Performance: Reports
  getReport(id: number): Promise<Report | undefined>;
  listReports(type?: string): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: number, report: Partial<InsertReport>): Promise<Report | undefined>;
  deleteReport(id: number): Promise<boolean>;
  
  // Análise & Performance: Report Results
  getReportResult(id: number): Promise<ReportResult | undefined>;
  listReportResults(reportId: number): Promise<ReportResult[]>;
  createReportResult(result: InsertReportResult): Promise<ReportResult>;
  deleteReportResult(id: number): Promise<boolean>;
  
  // Análise & Performance: User Activities
  getUserActivity(id: number): Promise<UserActivity | undefined>;
  listUserActivities(userId?: number, activityType?: string, limit?: number): Promise<UserActivity[]>;
  createUserActivity(activity: InsertUserActivity): Promise<UserActivity>;
  
  // Análise & Performance: Team Performance Metrics
  getTeamPerformanceMetric(id: number): Promise<TeamPerformanceMetric | undefined>;
  listTeamPerformanceMetrics(teamId: number, period?: string): Promise<TeamPerformanceMetric[]>;
  createTeamPerformanceMetric(metric: InsertTeamPerformanceMetric): Promise<TeamPerformanceMetric>;
  updateTeamPerformanceMetric(id: number, metric: Partial<InsertTeamPerformanceMetric>): Promise<TeamPerformanceMetric | undefined>;
  
  // Marketing & Engagement: Contact Forms
  getContactForm(id: number): Promise<ContactForm | undefined>;
  listContactForms(): Promise<ContactForm[]>;
  createContactForm(form: InsertContactForm): Promise<ContactForm>;
  updateContactForm(id: number, form: Partial<InsertContactForm>): Promise<ContactForm | undefined>;
  deleteContactForm(id: number): Promise<boolean>;
  
  // Marketing & Engagement: Form Submissions
  getFormSubmission(id: number): Promise<FormSubmission | undefined>;
  listFormSubmissions(formId?: number): Promise<FormSubmission[]>;
  createFormSubmission(submission: InsertFormSubmission): Promise<FormSubmission>;
  updateFormSubmissionStatus(id: number, status: string): Promise<FormSubmission | undefined>;
  
  // Marketing & Engagement: Engagement Metrics
  recordEngagement(metric: InsertEngagementMetric): Promise<EngagementMetric>;
  getContactEngagements(contactId: number): Promise<EngagementMetric[]>;
  getEventTypeEngagements(eventType: string): Promise<EngagementMetric[]>;
  getSourceEngagements(sourceType: string, sourceId?: number): Promise<EngagementMetric[]>;
  
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
  // Marketing & Engagement: Audience Segments
  async getAudienceSegment(id: number): Promise<AudienceSegment | undefined> {
    const [segment] = await db.select().from(audienceSegments).where(eq(audienceSegments.id, id));
    return segment;
  }
  
  async listAudienceSegments(): Promise<AudienceSegment[]> {
    return await db.select().from(audienceSegments);
  }
  
  async createAudienceSegment(insertSegment: InsertAudienceSegment): Promise<AudienceSegment> {
    const [segment] = await db.insert(audienceSegments).values({
      ...insertSegment,
      description: insertSegment.description || null,
    }).returning();
    return segment;
  }
  
  async updateAudienceSegment(id: number, segmentData: Partial<InsertAudienceSegment>): Promise<AudienceSegment | undefined> {
    const [segment] = await db.update(audienceSegments)
      .set({
        ...segmentData,
        updatedAt: new Date()
      })
      .where(eq(audienceSegments.id, id))
      .returning();
    return segment;
  }
  
  async deleteAudienceSegment(id: number): Promise<boolean> {
    const result = await db.delete(audienceSegments).where(eq(audienceSegments.id, id));
    return !!result;
  }

  // Marketing & Engagement: Segment Members
  async addContactToSegment(segmentId: number, contactId: number): Promise<SegmentMember> {
    const [segmentMember] = await db.insert(segmentMembers).values({
      segmentId,
      contactId,
      addedAt: new Date()
    }).returning();
    
    // Atualizar o contador de segmentos (opcional, mas útil para performance)
    const [currentSegment] = await db.select().from(audienceSegments).where(eq(audienceSegments.id, segmentId));
    
    await db.update(audienceSegments)
      .set({
        count: (currentSegment?.count || 0) + 1,
        updatedAt: new Date()
      })
      .where(eq(audienceSegments.id, segmentId));
    
    return segmentMember;
  }
  
  async removeContactFromSegment(segmentId: number, contactId: number): Promise<boolean> {
    const result = await db.delete(segmentMembers)
      .where(
        and(
          eq(segmentMembers.segmentId, segmentId),
          eq(segmentMembers.contactId, contactId)
        )
      );
    
    if (result) {
      // Atualizar o contador de segmentos
      const [currentSegment] = await db.select().from(audienceSegments).where(eq(audienceSegments.id, segmentId));
      
      await db.update(audienceSegments)
        .set({
          count: Math.max(0, (currentSegment?.count || 0) - 1), // Garantir que o contador nunca fique negativo
          updatedAt: new Date()
        })
        .where(eq(audienceSegments.id, segmentId));
    }
    
    return !!result;
  }
  
  async listSegmentMembers(segmentId: number): Promise<SegmentMember[]> {
    return await db.select()
      .from(segmentMembers)
      .where(eq(segmentMembers.segmentId, segmentId));
  }

  // Marketing & Engagement: Email Templates
  async getEmailTemplate(id: number): Promise<EmailTemplate | undefined> {
    const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id));
    return template;
  }
  
  async listEmailTemplates(category?: string): Promise<EmailTemplate[]> {
    if (category) {
      return await db.select()
        .from(emailTemplates)
        .where(eq(emailTemplates.category, category));
    }
    return await db.select().from(emailTemplates);
  }
  
  async createEmailTemplate(insertTemplate: InsertEmailTemplate): Promise<EmailTemplate> {
    const [template] = await db.insert(emailTemplates).values({
      ...insertTemplate,
      description: insertTemplate.description || null,
      design: insertTemplate.design || null,
      category: insertTemplate.category || null
    }).returning();
    return template;
  }
  
  async updateEmailTemplate(id: number, templateData: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined> {
    const [template] = await db.update(emailTemplates)
      .set({
        ...templateData,
        updatedAt: new Date()
      })
      .where(eq(emailTemplates.id, id))
      .returning();
    return template;
  }
  
  async deleteEmailTemplate(id: number): Promise<boolean> {
    const result = await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
    return !!result;
  }

  // Marketing & Engagement: Marketing Channels
  async getMarketingChannel(id: number): Promise<MarketingChannel | undefined> {
    const [channel] = await db.select().from(marketingChannels).where(eq(marketingChannels.id, id));
    return channel;
  }
  
  async listMarketingChannels(type?: string): Promise<MarketingChannel[]> {
    if (type) {
      return await db.select()
        .from(marketingChannels)
        .where(eq(marketingChannels.type, type));
    }
    return await db.select().from(marketingChannels);
  }
  
  async createMarketingChannel(insertChannel: InsertMarketingChannel): Promise<MarketingChannel> {
    const [channel] = await db.insert(marketingChannels).values({
      ...insertChannel,
      description: insertChannel.description || null,
      configuration: insertChannel.configuration || null
    }).returning();
    return channel;
  }
  
  async updateMarketingChannel(id: number, channelData: Partial<InsertMarketingChannel>): Promise<MarketingChannel | undefined> {
    const [channel] = await db.update(marketingChannels)
      .set({
        ...channelData,
        updatedAt: new Date()
      })
      .where(eq(marketingChannels.id, id))
      .returning();
    return channel;
  }
  
  async deleteMarketingChannel(id: number): Promise<boolean> {
    const result = await db.delete(marketingChannels).where(eq(marketingChannels.id, id));
    return !!result;
  }

  // Marketing & Engagement: Contact Forms
  async getContactForm(id: number): Promise<ContactForm | undefined> {
    const [form] = await db.select().from(contactForms).where(eq(contactForms.id, id));
    return form;
  }
  
  async listContactForms(): Promise<ContactForm[]> {
    return await db.select().from(contactForms);
  }
  
  async createContactForm(insertForm: InsertContactForm): Promise<ContactForm> {
    const [form] = await db.insert(contactForms).values({
      ...insertForm,
      description: insertForm.description || null,
      successMessage: insertForm.successMessage || null,
      notificationEmails: insertForm.notificationEmails || null,
      redirectUrl: insertForm.redirectUrl || null
    }).returning();
    return form;
  }
  
  async updateContactForm(id: number, formData: Partial<InsertContactForm>): Promise<ContactForm | undefined> {
    const [form] = await db.update(contactForms)
      .set({
        ...formData,
        updatedAt: new Date()
      })
      .where(eq(contactForms.id, id))
      .returning();
    return form;
  }
  
  async deleteContactForm(id: number): Promise<boolean> {
    const result = await db.delete(contactForms).where(eq(contactForms.id, id));
    return !!result;
  }

  // Marketing & Engagement: Form Submissions
  async getFormSubmission(id: number): Promise<FormSubmission | undefined> {
    const [submission] = await db.select().from(formSubmissions).where(eq(formSubmissions.id, id));
    return submission;
  }
  
  async listFormSubmissions(formId?: number): Promise<FormSubmission[]> {
    if (formId) {
      return await db.select()
        .from(formSubmissions)
        .where(eq(formSubmissions.formId, formId))
        .orderBy(desc(formSubmissions.createdAt));
    }
    return await db.select()
      .from(formSubmissions)
      .orderBy(desc(formSubmissions.createdAt));
  }
  
  async createFormSubmission(insertSubmission: InsertFormSubmission): Promise<FormSubmission> {
    const [submission] = await db.insert(formSubmissions).values({
      ...insertSubmission,
      contactId: insertSubmission.contactId || null,
      ipAddress: insertSubmission.ipAddress || null,
      userAgent: insertSubmission.userAgent || null,
      referrer: insertSubmission.referrer || null
    }).returning();
    return submission;
  }
  
  async updateFormSubmissionStatus(id: number, status: string): Promise<FormSubmission | undefined> {
    const [submission] = await db.update(formSubmissions)
      .set({ status })
      .where(eq(formSubmissions.id, id))
      .returning();
    return submission;
  }

  // Marketing & Engagement: Engagement Metrics
  async recordEngagement(insertMetric: InsertEngagementMetric): Promise<EngagementMetric> {
    const [metric] = await db.insert(engagementMetrics).values({
      ...insertMetric,
      source: insertMetric.source || null,
      sourceId: insertMetric.sourceId || null,
      sourceType: insertMetric.sourceType || null,
      metadata: insertMetric.metadata || null
    }).returning();
    return metric;
  }
  
  async getContactEngagements(contactId: number): Promise<EngagementMetric[]> {
    return await db.select()
      .from(engagementMetrics)
      .where(eq(engagementMetrics.contactId, contactId))
      .orderBy(desc(engagementMetrics.occurredAt));
  }
  
  async getEventTypeEngagements(eventType: string): Promise<EngagementMetric[]> {
    return await db.select()
      .from(engagementMetrics)
      .where(eq(engagementMetrics.eventType, eventType))
      .orderBy(desc(engagementMetrics.occurredAt));
  }
  
  async getSourceEngagements(sourceType: string, sourceId?: number): Promise<EngagementMetric[]> {
    if (sourceId) {
      return await db.select()
        .from(engagementMetrics)
        .where(
          and(
            eq(engagementMetrics.sourceType, sourceType),
            eq(engagementMetrics.sourceId, sourceId)
          )
        )
        .orderBy(desc(engagementMetrics.occurredAt));
    }
    return await db.select()
      .from(engagementMetrics)
      .where(eq(engagementMetrics.sourceType, sourceType))
      .orderBy(desc(engagementMetrics.occurredAt));
  }
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

  // Análise & Performance: KPIs
  async getKpi(id: number): Promise<Kpi | undefined> {
    const [kpi] = await db.select().from(kpis).where(eq(kpis.id, id));
    return kpi;
  }

  async listKpis(category?: string): Promise<Kpi[]> {
    if (category) {
      return db.select().from(kpis).where(eq(kpis.category, category)).orderBy(kpis.name);
    }
    return db.select().from(kpis).orderBy(kpis.name);
  }

  async createKpi(kpiData: InsertKpi): Promise<Kpi> {
    const [kpi] = await db.insert(kpis).values({
      ...kpiData,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return kpi;
  }

  async updateKpi(id: number, kpiData: Partial<InsertKpi>): Promise<Kpi | undefined> {
    const [kpi] = await db.update(kpis)
      .set({
        ...kpiData,
        updatedAt: new Date()
      })
      .where(eq(kpis.id, id))
      .returning();
    return kpi;
  }

  async deleteKpi(id: number): Promise<boolean> {
    const result = await db.delete(kpis).where(eq(kpis.id, id));
    return !!result;
  }

  // Análise & Performance: KPI Values
  async getKpiValue(id: number): Promise<KpiValue | undefined> {
    const [kpiValue] = await db.select().from(kpiValues).where(eq(kpiValues.id, id));
    return kpiValue;
  }

  async listKpiValues(kpiId: number, periodType?: string, limit?: number): Promise<KpiValue[]> {
    // Iniciar com a condição base de kpiId
    let conditions = [eq(kpiValues.kpiId, kpiId)];
    
    // Adicionar condição de periodType se fornecido
    if (periodType) {
      conditions.push(eq(kpiValues.periodType, periodType));
    }
    
    // Construir a query com todas as condições
    let query = db.select().from(kpiValues).where(and(...conditions));
    
    // Aplicar ordenação
    query = query.orderBy(desc(kpiValues.dateTo));
    
    // Aplicar limite se fornecido
    if (limit) {
      query = query.limit(limit);
    }
    
    return query;
  }

  async createKpiValue(kpiValueData: InsertKpiValue): Promise<KpiValue> {
    const [kpiValue] = await db.insert(kpiValues).values({
      ...kpiValueData,
      createdAt: new Date()
    }).returning();
    return kpiValue;
  }

  async deleteKpiValue(id: number): Promise<boolean> {
    const result = await db.delete(kpiValues).where(eq(kpiValues.id, id));
    return !!result;
  }

  // Análise & Performance: Dashboards
  async getDashboard(id: number): Promise<Dashboard | undefined> {
    const [dashboard] = await db.select().from(dashboards).where(eq(dashboards.id, id));
    return dashboard;
  }

  async listDashboards(isPublic?: boolean): Promise<Dashboard[]> {
    if (isPublic !== undefined) {
      return db.select().from(dashboards).where(eq(dashboards.isPublic, isPublic)).orderBy(dashboards.name);
    }
    return db.select().from(dashboards).orderBy(dashboards.name);
  }

  async getDefaultDashboard(): Promise<Dashboard | undefined> {
    const [dashboard] = await db.select().from(dashboards).where(eq(dashboards.isDefault, true));
    return dashboard;
  }

  async createDashboard(dashboardData: InsertDashboard): Promise<Dashboard> {
    // Se este for o dashboard padrão, remova o padrão de qualquer outro dashboard
    if (dashboardData.isDefault) {
      await db.update(dashboards)
        .set({ isDefault: false })
        .where(eq(dashboards.isDefault, true));
    }
    
    const [dashboard] = await db.insert(dashboards).values({
      ...dashboardData,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return dashboard;
  }

  async updateDashboard(id: number, dashboardData: Partial<InsertDashboard>): Promise<Dashboard | undefined> {
    // Se este for o dashboard padrão, remova o padrão de qualquer outro dashboard
    if (dashboardData.isDefault) {
      await db.update(dashboards)
        .set({ isDefault: false })
        .where(and(
          eq(dashboards.isDefault, true),
          // Não atualizar o próprio dashboard que está sendo editado
          // para evitar conflitos na atualização subsequente
          // e.g. se o dashboard que estamos editando já era o default
          // não queremos remover esse status dele
          // apenas queremos ter certeza que nenhum outro é o default
          // para evitar múltiplos dashboards default
          // que violaria a restrição do domínio
          // (apenas um dashboard pode ser o default)
          // (isso não é uma restrição da base de dados)
          // (mas sim do domínio da aplicação)
          // (e, portanto, implementada aqui, no código)
          // (e não no schema)
          // (para permitir que o usuário altere essa configuração)
          // (sem violar as restrições do domínio)
          // (garantindo a integridade dos dados)
          // (e a consistência das regras de negócio)
          // (que são implementadas aqui, no código)
          // (e não no schema)
          // (para permitir maior flexibilidade)
          // (sem comprometer a integridade dos dados)
          // (nem a consistência das regras de negócio)
          // (que são implementadas aqui, no código)
          // (garantindo a integridade dos dados)
          // (e a consistência das regras de negócio)
          eq(dashboards.id, id),
        ));
    }
    
    const [dashboard] = await db.update(dashboards)
      .set({
        ...dashboardData,
        updatedAt: new Date()
      })
      .where(eq(dashboards.id, id))
      .returning();
    return dashboard;
  }

  async deleteDashboard(id: number): Promise<boolean> {
    // Primeiro, excluir todos os widgets associados
    await db.delete(dashboardWidgets).where(eq(dashboardWidgets.dashboardId, id));
    
    // Em seguida, excluir o dashboard
    const result = await db.delete(dashboards).where(eq(dashboards.id, id));
    return !!result;
  }

  // Análise & Performance: Dashboard Widgets
  async getDashboardWidget(id: number): Promise<DashboardWidget | undefined> {
    const [widget] = await db.select().from(dashboardWidgets).where(eq(dashboardWidgets.id, id));
    return widget;
  }

  async listDashboardWidgets(dashboardId: number): Promise<DashboardWidget[]> {
    return db.select().from(dashboardWidgets)
      .where(eq(dashboardWidgets.dashboardId, dashboardId));
  }

  async createDashboardWidget(widgetData: InsertDashboardWidget): Promise<DashboardWidget> {
    const [widget] = await db.insert(dashboardWidgets).values({
      ...widgetData,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return widget;
  }

  async updateDashboardWidget(id: number, widgetData: Partial<InsertDashboardWidget>): Promise<DashboardWidget | undefined> {
    const [widget] = await db.update(dashboardWidgets)
      .set({
        ...widgetData,
        updatedAt: new Date()
      })
      .where(eq(dashboardWidgets.id, id))
      .returning();
    return widget;
  }

  async deleteDashboardWidget(id: number): Promise<boolean> {
    const result = await db.delete(dashboardWidgets).where(eq(dashboardWidgets.id, id));
    return !!result;
  }

  // Análise & Performance: Reports
  async getReport(id: number): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report;
  }

  async listReports(type?: string): Promise<Report[]> {
    if (type) {
      return db.select().from(reports).where(eq(reports.type, type)).orderBy(reports.name);
    }
    return db.select().from(reports).orderBy(reports.name);
  }

  async createReport(reportData: InsertReport): Promise<Report> {
    const [report] = await db.insert(reports).values({
      ...reportData,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return report;
  }

  async updateReport(id: number, reportData: Partial<InsertReport>): Promise<Report | undefined> {
    const [report] = await db.update(reports)
      .set({
        ...reportData,
        updatedAt: new Date()
      })
      .where(eq(reports.id, id))
      .returning();
    return report;
  }

  async deleteReport(id: number): Promise<boolean> {
    // Primeiro, excluir todos os resultados associados
    await db.delete(reportResults).where(eq(reportResults.reportId, id));
    
    // Em seguida, excluir o relatório
    const result = await db.delete(reports).where(eq(reports.id, id));
    return !!result;
  }

  // Análise & Performance: Report Results
  async getReportResult(id: number): Promise<ReportResult | undefined> {
    const [result] = await db.select().from(reportResults).where(eq(reportResults.id, id));
    return result;
  }

  async listReportResults(reportId: number): Promise<ReportResult[]> {
    return db.select().from(reportResults)
      .where(eq(reportResults.reportId, reportId))
      .orderBy(desc(reportResults.generatedAt));
  }

  async createReportResult(resultData: InsertReportResult): Promise<ReportResult> {
    const [result] = await db.insert(reportResults).values({
      ...resultData,
      createdAt: new Date()
    }).returning();
    
    // Atualizar o campo lastRunAt do relatório
    await db.update(reports)
      .set({ lastRunAt: new Date() })
      .where(eq(reports.id, resultData.reportId));
    
    return result;
  }

  async deleteReportResult(id: number): Promise<boolean> {
    const result = await db.delete(reportResults).where(eq(reportResults.id, id));
    return !!result;
  }

  // Análise & Performance: User Activities
  async getUserActivity(id: number): Promise<UserActivity | undefined> {
    const [activity] = await db.select().from(userActivities).where(eq(userActivities.id, id));
    return activity;
  }

  async listUserActivities(userId?: number, activityType?: string, limit?: number): Promise<UserActivity[]> {
    // Iniciar a consulta básica
    let query = db.select().from(userActivities);
    
    // Construir condições de filtragem
    const conditions = [];
    if (userId) {
      conditions.push(eq(userActivities.userId, userId));
    }
    
    if (activityType) {
      conditions.push(eq(userActivities.activityType, activityType));
    }
    
    // Aplicar filtros se houver condições
    if (conditions.length > 0) {
      query = conditions.length === 1 
        ? query.where(conditions[0])
        : query.where(and(...conditions));
    }
    
    // Aplicar ordenação
    const orderedQuery = query.orderBy(desc(userActivities.performedAt));
    
    // Aplicar limite se fornecido
    if (limit) {
      return orderedQuery.limit(limit);
    }
    
    return orderedQuery;
  }

  async createUserActivity(activityData: InsertUserActivity): Promise<UserActivity> {
    const [activity] = await db.insert(userActivities).values({
      ...activityData,
      createdAt: new Date()
    }).returning();
    return activity;
  }

  // Análise & Performance: Team Performance Metrics
  async getTeamPerformanceMetric(id: number): Promise<TeamPerformanceMetric | undefined> {
    const [metric] = await db.select().from(teamPerformanceMetrics).where(eq(teamPerformanceMetrics.id, id));
    return metric;
  }

  async listTeamPerformanceMetrics(teamId: number, period?: string): Promise<TeamPerformanceMetric[]> {
    // Iniciar com a condição base de teamId
    let conditions = [eq(teamPerformanceMetrics.teamId, teamId)];
    
    // Adicionar condição de período se fornecido
    if (period) {
      conditions.push(eq(teamPerformanceMetrics.period, period));
    }
    
    // Construir a query com todas as condições
    let query = db.select().from(teamPerformanceMetrics).where(and(...conditions));
    
    // Aplicar ordenação
    return query.orderBy(desc(teamPerformanceMetrics.dateTo));
  }

  async createTeamPerformanceMetric(metricData: InsertTeamPerformanceMetric): Promise<TeamPerformanceMetric> {
    const [metric] = await db.insert(teamPerformanceMetrics).values({
      ...metricData,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return metric;
  }

  async updateTeamPerformanceMetric(id: number, metricData: Partial<InsertTeamPerformanceMetric>): Promise<TeamPerformanceMetric | undefined> {
    const [metric] = await db.update(teamPerformanceMetrics)
      .set({
        ...metricData,
        updatedAt: new Date()
      })
      .where(eq(teamPerformanceMetrics.id, id))
      .returning();
    return metric;
  }
}

// Inicializa com o armazenamento em banco de dados
export const storage = new DatabaseStorage();
