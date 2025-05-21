import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index, date, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table para autenticação
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("agent"),
  avatar: text("avatar"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  email: true,
  role: true,
  avatar: true,
});

// Contact table
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  notes: text("notes"),
  metadata: jsonb("metadata"), // Para armazenar dados da Z-API e outras fontes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const insertContactSchema = createInsertSchema(contacts).pick({
  name: true,
  email: true,
  phone: true,
  company: true,
  notes: true,
  metadata: true,
  createdBy: true,
});

// Company table
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  website: text("website"),
  industry: text("industry"),
  size: text("size"),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const insertCompanySchema = createInsertSchema(companies).pick({
  name: true,
  website: true,
  industry: true,
  size: true,
  address: true,
  notes: true,
  createdBy: true,
});

// Deal/Opportunity table
export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  value: integer("value"), // In cents
  stage: text("stage").notNull(), // e.g. "lead", "opportunity", "negotiation", "won", "lost"
  contactId: integer("contact_id").references(() => contacts.id),
  companyId: integer("company_id").references(() => companies.id),
  notes: text("notes"),
  expectedCloseDate: timestamp("expected_close_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  assignedTo: integer("assigned_to").references(() => users.id),
});

export const insertDealSchema = createInsertSchema(deals).pick({
  title: true,
  value: true,
  stage: true,
  contactId: true,
  companyId: true,
  notes: true,
  expectedCloseDate: true,
  assignedTo: true,
});

// Tabela para as conversas
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  channel: text("channel").notNull(), // whatsapp, instagram, facebook, email
  avatar: text("avatar"),
  lastMessage: text("last_message"),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  unreadCount: integer("unread_count").default(0),
  status: text("status").default("open"), // open, resolved, closed
  assignedTo: integer("assigned_to").references(() => users.id),
  contactId: integer("contact_id").references(() => contacts.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).pick({
  name: true,
  channel: true,
  avatar: true,
  lastMessage: true,
  lastMessageAt: true,
  unreadCount: true,
  status: true,
  assignedTo: true,
  contactId: true,
});

// Tabela para as mensagens
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id).notNull(),
  content: text("content").notNull(),
  type: text("type").default("text"), // text, image, video, audio, document, location, interactive
  sender: text("sender").notNull(), // user, contact, system
  status: text("status").default("sent"), // sent, delivered, read, error
  metadata: jsonb("metadata"), // para metadados adicionais: caption, fileSize, interactiveData, etc
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  conversationId: true,
  content: true,
  type: true,
  sender: true,
  status: true,
  metadata: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Deal = typeof deals.$inferSelect;

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Teams table
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  managerId: integer("manager_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTeamSchema = createInsertSchema(teams).pick({
  name: true,
  description: true,
  managerId: true,
});

// User-Team relationship table
export const userTeams = pgTable("user_teams", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  teamId: integer("team_id").references(() => teams.id).notNull(),
  role: text("role").default("member"), // member, manager, admin
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    userTeamUnique: unique().on(table.userId, table.teamId),
  }
});

export const insertUserTeamSchema = createInsertSchema(userTeams).pick({
  userId: true,
  teamId: true,
  role: true,
});

// Roles table for permission management
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  permissions: jsonb("permissions").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRoleSchema = createInsertSchema(roles).pick({
  name: true,
  description: true,
  permissions: true,
});

// Campaigns table
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // email, whatsapp, sms, etc.
  status: text("status").default("draft"), // draft, scheduled, running, paused, completed, cancelled
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  targetAudience: jsonb("target_audience"), // Criteria for selecting targets
  content: jsonb("content").notNull(), // Message templates, subject lines, etc.
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCampaignSchema = createInsertSchema(campaigns).pick({
  name: true,
  description: true,
  type: true,
  status: true,
  startDate: true,
  endDate: true,
  targetAudience: true,
  content: true,
  createdBy: true,
});

// Campaign Results table
export const campaignResults = pgTable("campaign_results", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id).notNull(),
  contactId: integer("contact_id").references(() => contacts.id).notNull(),
  status: text("status").notNull(), // sent, delivered, opened, clicked, responded, bounced, etc.
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  respondedAt: timestamp("responded_at"),
  metadata: jsonb("metadata"), // Additional data like device, location, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCampaignResultSchema = createInsertSchema(campaignResults).pick({
  campaignId: true,
  contactId: true,
  status: true,
  sentAt: true,
  deliveredAt: true,
  openedAt: true,
  clickedAt: true,
  respondedAt: true,
  metadata: true,
});

// Automations table
export const automations = pgTable("automations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  trigger: jsonb("trigger").notNull(), // Event that triggers this automation
  conditions: jsonb("conditions"), // Conditions that must be met
  actions: jsonb("actions").notNull(), // Actions to perform
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAutomationSchema = createInsertSchema(automations).pick({
  name: true,
  description: true,
  trigger: true,
  conditions: true,
  actions: true,
  isActive: true,
  createdBy: true,
});

// Subscription Plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // In cents
  cycle: text("cycle").notNull(), // monthly, yearly
  features: jsonb("features").notNull(), // Array of features included
  limits: jsonb("limits").notNull(), // Limits for different resources
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).pick({
  name: true,
  description: true,
  price: true,
  cycle: true,
  features: true,
  limits: true,
  isActive: true,
});

// Tenant Subscription table
export const tenantSubscriptions = pgTable("tenant_subscriptions", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").references(() => subscriptionPlans.id).notNull(),
  status: text("status").notNull(), // active, pending, cancelled, expired
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  billingInfo: jsonb("billing_info"), // Company name, address, tax ID, etc.
  paymentMethod: jsonb("payment_method"), // Payment method details
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTenantSubscriptionSchema = createInsertSchema(tenantSubscriptions).pick({
  planId: true,
  status: true,
  startDate: true,
  endDate: true,
  billingInfo: true,
  paymentMethod: true,
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  subscriptionId: integer("subscription_id").references(() => tenantSubscriptions.id).notNull(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  amount: integer("amount").notNull(), // In cents
  status: text("status").notNull(), // pending, paid, overdue, cancelled
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  pdfUrl: text("pdf_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).pick({
  subscriptionId: true,
  invoiceNumber: true,
  amount: true,
  status: true,
  dueDate: true,
  paidDate: true,
  pdfUrl: true,
});

// Goals table
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // individual, team, company
  metricType: text("metric_type").notNull(), // deals_closed, revenue_generated, messages_sent, etc.
  targetValue: integer("target_value").notNull(),
  currentValue: integer("current_value").default(0),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  ownerId: integer("owner_id").references(() => users.id),
  teamId: integer("team_id").references(() => teams.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGoalSchema = createInsertSchema(goals).pick({
  name: true,
  description: true,
  type: true,
  metricType: true,
  targetValue: true,
  currentValue: true,
  startDate: true,
  endDate: true,
  ownerId: true,
  teamId: true,
});

// Achievements table (for gamification)
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // badge, trophy, certificate, etc.
  criteria: jsonb("criteria").notNull(), // Rules for unlocking
  points: integer("points").default(0),
  icon: text("icon"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAchievementSchema = createInsertSchema(achievements).pick({
  name: true,
  description: true,
  type: true,
  criteria: true,
  points: true,
  icon: true,
});

// User Achievements table
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  achievementId: integer("achievement_id").references(() => achievements.id).notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    userAchievementUnique: unique().on(table.userId, table.achievementId),
  }
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).pick({
  userId: true,
  achievementId: true,
  unlockedAt: true,
});

// Settings table
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  key: text("key").notNull(),
  value: jsonb("value").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    categoryKeyUnique: unique().on(table.category, table.key),
  }
});

export const insertSettingSchema = createInsertSchema(settings).pick({
  category: true,
  key: true,
  value: true,
});

// Audience Segments table
export const audienceSegments = pgTable("audience_segments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  criteria: jsonb("criteria").notNull(), // Rules for segment inclusion
  count: integer("count").default(0), // Cached count of contacts in this segment
  isStatic: boolean("is_static").default(false), // Static segments have fixed members, dynamic are rule-based
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAudienceSegmentSchema = createInsertSchema(audienceSegments).pick({
  name: true,
  description: true,
  criteria: true,
  isStatic: true,
  createdBy: true,
});

// Segment Members table (only used for static segments)
export const segmentMembers = pgTable("segment_members", {
  id: serial("id").primaryKey(),
  segmentId: integer("segment_id").references(() => audienceSegments.id).notNull(),
  contactId: integer("contact_id").references(() => contacts.id).notNull(),
  addedAt: timestamp("added_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    segmentMemberUnique: unique().on(table.segmentId, table.contactId),
  }
});

export const insertSegmentMemberSchema = createInsertSchema(segmentMembers).pick({
  segmentId: true,
  contactId: true,
  addedAt: true,
});

// Email Templates table
export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  design: jsonb("design"), // Design data (colors, fonts, layout)
  category: text("category"), // transactional, marketing, notification
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).pick({
  name: true,
  description: true,
  subject: true,
  body: true,
  design: true,
  category: true,
  isActive: true,
  createdBy: true,
});

// Marketing Channels table
export const marketingChannels = pgTable("marketing_channels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // email, sms, whatsapp, push, social, etc
  configuration: jsonb("configuration"), // Channel-specific configuration
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMarketingChannelSchema = createInsertSchema(marketingChannels).pick({
  name: true,
  description: true,
  type: true,
  configuration: true,
  isActive: true,
  createdBy: true,
});

// Contact Forms table
export const contactForms = pgTable("contact_forms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  fields: jsonb("fields").notNull(), // Form fields definition
  successMessage: text("success_message"),
  notificationEmails: jsonb("notification_emails"), // Emails to notify on submission
  redirectUrl: text("redirect_url"),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertContactFormSchema = createInsertSchema(contactForms).pick({
  name: true,
  description: true,
  fields: true,
  successMessage: true,
  notificationEmails: true,
  redirectUrl: true,
  isActive: true,
  createdBy: true,
});

// Form Submissions table
export const formSubmissions = pgTable("form_submissions", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").references(() => contactForms.id).notNull(),
  data: jsonb("data").notNull(), // Submitted form data
  contactId: integer("contact_id").references(() => contacts.id), // May be linked to a contact
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  status: text("status").default("new"), // new, processed, converted, spam
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFormSubmissionSchema = createInsertSchema(formSubmissions).pick({
  formId: true,
  data: true,
  contactId: true,
  ipAddress: true,
  userAgent: true,
  referrer: true,
  status: true,
});

// Engagement Metrics table
export const engagementMetrics = pgTable("engagement_metrics", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id).notNull(),
  eventType: text("event_type").notNull(), // email_open, email_click, page_view, form_submit, etc
  source: text("source"), // which campaign, automation, page, etc
  sourceId: integer("source_id"), // ID of the source
  sourceType: text("source_type"), // Type of the source (campaign, email, page, etc)
  metadata: jsonb("metadata"), // Additional event data
  occurredAt: timestamp("occurred_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEngagementMetricSchema = createInsertSchema(engagementMetrics).pick({
  contactId: true,
  eventType: true,
  source: true,
  sourceId: true,
  sourceType: true,
  metadata: true,
  occurredAt: true,
});

// Export types for all tables
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;

export type InsertUserTeam = z.infer<typeof insertUserTeamSchema>;
export type UserTeam = typeof userTeams.$inferSelect;

export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = typeof roles.$inferSelect;

export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;

export type InsertCampaignResult = z.infer<typeof insertCampaignResultSchema>;
export type CampaignResult = typeof campaignResults.$inferSelect;

export type InsertAutomation = z.infer<typeof insertAutomationSchema>;
export type Automation = typeof automations.$inferSelect;

// Análise e Performance: KPIs (Indicadores-chave de performance)
export const kpis = pgTable("kpis", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // sales, customer_service, marketing, etc.
  metricType: text("metric_type").notNull(), // count, percentage, amount, ratio, etc.
  formula: jsonb("formula"), // Como este KPI é calculado (campos/operações)
  targetValue: integer("target_value"), // Valor alvo (opcional)
  warningThreshold: integer("warning_threshold"), // Limiar de alerta (opcional)
  criticalThreshold: integer("critical_threshold"), // Limiar crítico (opcional)
  compareToHistorical: boolean("compare_to_historical").default(false), // Comparar com histórico
  historicalPeriods: integer("historical_periods"), // Quanto histórico considerar (em períodos)
  active: boolean("active").default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertKpiSchema = createInsertSchema(kpis).pick({
  name: true,
  description: true,
  category: true,
  metricType: true,
  formula: true,
  targetValue: true,
  warningThreshold: true,
  criticalThreshold: true,
  compareToHistorical: true,
  historicalPeriods: true,
  active: true,
  createdBy: true,
});

// Análise e Performance: Valores de KPI (medições históricas)
export const kpiValues = pgTable("kpi_values", {
  id: serial("id").primaryKey(),
  kpiId: integer("kpi_id").references(() => kpis.id).notNull(),
  value: integer("value").notNull(), // Valor numérico (para cálculos)
  textValue: text("text_value"), // Representação textual (ex: "45%")
  dateFrom: timestamp("date_from").notNull(), // Data de início do período
  dateTo: timestamp("date_to").notNull(), // Data de fim do período
  periodType: text("period_type").notNull(), // daily, weekly, monthly, quarterly, yearly
  metadata: jsonb("metadata"), // Dados adicionais sobre a medição
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertKpiValueSchema = createInsertSchema(kpiValues).pick({
  kpiId: true,
  value: true,
  textValue: true,
  dateFrom: true,
  dateTo: true,
  periodType: true,
  metadata: true,
});

// Análise e Performance: Dashboards
export const dashboards = pgTable("dashboards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  layout: jsonb("layout").notNull(), // Configuração do layout (grid)
  isDefault: boolean("is_default").default(false),
  isPublic: boolean("is_public").default(false), // Visível para todos os usuários
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDashboardSchema = createInsertSchema(dashboards).pick({
  name: true,
  description: true,
  layout: true,
  isDefault: true,
  isPublic: true,
  createdBy: true,
});

// Análise e Performance: Widgets (elementos do dashboard)
export const dashboardWidgets = pgTable("dashboard_widgets", {
  id: serial("id").primaryKey(),
  dashboardId: integer("dashboard_id").references(() => dashboards.id).notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(), // chart, table, kpi, goal, custom
  size: text("size").notNull(), // small, medium, large
  position: jsonb("position").notNull(), // { x, y, w, h } - posição no grid
  configuration: jsonb("configuration").notNull(), // Configuração específica
  dataSource: jsonb("data_source").notNull(), // Fonte de dados (queries, filtros, etc)
  refreshInterval: integer("refresh_interval"), // Em segundos, se automaticamente atualizado
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets).pick({
  dashboardId: true,
  title: true,
  type: true,
  size: true,
  position: true,
  configuration: true,
  dataSource: true,
  refreshInterval: true,
});

// Análise e Performance: Relatórios personalizados
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // static, dynamic, scheduled
  format: text("format").notNull(), // pdf, excel, csv, html
  query: jsonb("query").notNull(), // Definição da consulta (filtros, campos, ordenação)
  schedule: jsonb("schedule"), // Configuração de agendamento (se agendado)
  lastRunAt: timestamp("last_run_at"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertReportSchema = createInsertSchema(reports).pick({
  name: true,
  description: true,
  type: true,
  format: true,
  query: true,
  schedule: true,
  createdBy: true,
});

// Análise e Performance: Relatórios gerados
export const reportResults = pgTable("report_results", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").references(() => reports.id).notNull(),
  fileUrl: text("file_url"), // URL para o arquivo gerado
  status: text("status").notNull(), // success, error, processing
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"), // Metadados do relatório (número de registros, etc)
  generatedAt: timestamp("generated_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // Quando o resultado expira (se temporário)
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReportResultSchema = createInsertSchema(reportResults).pick({
  reportId: true,
  fileUrl: true,
  status: true,
  errorMessage: true,
  metadata: true,
  expiresAt: true,
});

// Análise e Performance: Métricas de atividade do usuário
export const userActivities = pgTable("user_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  activityType: text("activity_type").notNull(), // login, message_sent, deal_created, etc.
  entityType: text("entity_type"), // contact, deal, message, etc.
  entityId: integer("entity_id"), // ID da entidade relacionada
  details: jsonb("details"), // Detalhes específicos da atividade
  performedAt: timestamp("performed_at").defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserActivitySchema = createInsertSchema(userActivities).pick({
  userId: true,
  activityType: true,
  entityType: true,
  entityId: true,
  details: true,
  performedAt: true,
  ipAddress: true,
  userAgent: true,
});

// Análise e Performance: Métricas de performance da equipe
export const teamPerformanceMetrics = pgTable("team_performance_metrics", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").references(() => teams.id).notNull(),
  period: text("period").notNull(), // daily, weekly, monthly, quarterly, yearly
  dateFrom: timestamp("date_from").notNull(),
  dateTo: timestamp("date_to").notNull(),
  metrics: jsonb("metrics").notNull(), // JSON com diferentes métricas e valores
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTeamPerformanceMetricSchema = createInsertSchema(teamPerformanceMetrics).pick({
  teamId: true,
  period: true,
  dateFrom: true,
  dateTo: true,
  metrics: true,
});

// Export types for marketing and engagement tables
export type InsertAudienceSegment = z.infer<typeof insertAudienceSegmentSchema>;
export type AudienceSegment = typeof audienceSegments.$inferSelect;

export type InsertSegmentMember = z.infer<typeof insertSegmentMemberSchema>;
export type SegmentMember = typeof segmentMembers.$inferSelect;

export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;

export type InsertMarketingChannel = z.infer<typeof insertMarketingChannelSchema>;
export type MarketingChannel = typeof marketingChannels.$inferSelect;

export type InsertContactForm = z.infer<typeof insertContactFormSchema>;
export type ContactForm = typeof contactForms.$inferSelect;

export type InsertFormSubmission = z.infer<typeof insertFormSubmissionSchema>;
export type FormSubmission = typeof formSubmissions.$inferSelect;

export type InsertEngagementMetric = z.infer<typeof insertEngagementMetricSchema>;
export type EngagementMetric = typeof engagementMetrics.$inferSelect;

// Export types for análise e performance tables
export type InsertKpi = z.infer<typeof insertKpiSchema>;
export type Kpi = typeof kpis.$inferSelect;

export type InsertKpiValue = z.infer<typeof insertKpiValueSchema>;
export type KpiValue = typeof kpiValues.$inferSelect;

export type InsertDashboard = z.infer<typeof insertDashboardSchema>;
export type Dashboard = typeof dashboards.$inferSelect;

export type InsertDashboardWidget = z.infer<typeof insertDashboardWidgetSchema>;
export type DashboardWidget = typeof dashboardWidgets.$inferSelect;

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

export type InsertReportResult = z.infer<typeof insertReportResultSchema>;
export type ReportResult = typeof reportResults.$inferSelect;

export type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;
export type UserActivity = typeof userActivities.$inferSelect;

export type InsertTeamPerformanceMetric = z.infer<typeof insertTeamPerformanceMetricSchema>;
export type TeamPerformanceMetric = typeof teamPerformanceMetrics.$inferSelect;

// Tipos para as tabelas do módulo de Configurações (Administração)
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

export type InsertSettingHistory = z.infer<typeof insertSettingHistorySchema>;
export type SettingHistory = typeof settingHistory.$inferSelect;

export type InsertAdminNotification = z.infer<typeof insertAdminNotificationSchema>;
export type AdminNotification = typeof adminNotifications.$inferSelect;

export type InsertNotificationAcknowledgement = z.infer<typeof insertNotificationAcknowledgementSchema>;
export type NotificationAcknowledgement = typeof notificationAcknowledgements.$inferSelect;

export type InsertSecurityPolicy = z.infer<typeof insertSecurityPolicySchema>;
export type SecurityPolicy = typeof securityPolicies.$inferSelect;

export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
export type Integration = typeof integrations.$inferSelect;

export type InsertIntegrationLog = z.infer<typeof insertIntegrationLogSchema>;
export type IntegrationLog = typeof integrationLogs.$inferSelect;

export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

export type InsertTenantSubscription = z.infer<typeof insertTenantSubscriptionSchema>;
export type TenantSubscription = typeof tenantSubscriptions.$inferSelect;

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;

export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;

export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;

// Audit Logs para rastrear ações do usuário (módulo de Configurações/Administração)
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(), // create, update, delete, login, etc.
  entityType: text("entity_type"), // user, team, deal, etc.
  entityId: integer("entity_id"), // ID da entidade afetada
  oldValues: jsonb("old_values"), // Valores anteriores (se aplicável)
  newValues: jsonb("new_values"), // Novos valores (se aplicável)
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  performedAt: timestamp("performed_at").defaultNow(),
  metadata: jsonb("metadata"), // Informações adicionais
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).pick({
  userId: true,
  action: true,
  entityType: true,
  entityId: true,
  oldValues: true,
  newValues: true,
  ipAddress: true,
  userAgent: true,
  performedAt: true,
  metadata: true,
});

// Histórico de alterações de configurações
export const settingHistory = pgTable("setting_history", {
  id: serial("id").primaryKey(),
  settingId: integer("setting_id").references(() => settings.id).notNull(),
  category: text("category").notNull(),
  key: text("key").notNull(),
  oldValue: jsonb("old_value"), // Valor anterior
  newValue: jsonb("new_value").notNull(), // Novo valor
  changedBy: integer("changed_by").references(() => users.id),
  changedAt: timestamp("changed_at").defaultNow(),
  reason: text("reason"), // Motivo da alteração
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSettingHistorySchema = createInsertSchema(settingHistory).pick({
  settingId: true,
  category: true,
  key: true,
  oldValue: true,
  newValue: true,
  changedBy: true,
  changedAt: true,
  reason: true,
});

// Notificações Administrativas
export const adminNotifications = pgTable("admin_notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // info, warning, error, success
  priority: text("priority").default("normal"), // low, normal, high, critical
  isGlobal: boolean("is_global").default(false), // Se true, para todos os usuários
  targetUserIds: jsonb("target_user_ids").default([]), // Array de IDs de usuários específicos
  targetRoles: jsonb("target_roles").default([]), // Array de roles que devem receber
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"), // Quando expira
  requiresAcknowledgement: boolean("requires_acknowledgement").default(false),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAdminNotificationSchema = createInsertSchema(adminNotifications).pick({
  title: true,
  message: true,
  type: true,
  priority: true,
  isGlobal: true,
  targetUserIds: true,
  targetRoles: true,
  startDate: true,
  endDate: true,
  requiresAcknowledgement: true,
  createdBy: true,
});

// Reconhecimento de Notificações
export const notificationAcknowledgements = pgTable("notification_acknowledgements", {
  id: serial("id").primaryKey(),
  notificationId: integer("notification_id").references(() => adminNotifications.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  acknowledgedAt: timestamp("acknowledged_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    notificationUserUnique: unique().on(table.notificationId, table.userId),
  }
});

export const insertNotificationAcknowledgementSchema = createInsertSchema(notificationAcknowledgements).pick({
  notificationId: true,
  userId: true,
  acknowledgedAt: true,
});

// Políticas de Segurança
export const securityPolicies = pgTable("security_policies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // password, session, data_access, etc.
  settings: jsonb("settings").notNull(), // Configurações específicas da política
  isActive: boolean("is_active").default(true),
  appliesTo: jsonb("applies_to").notNull(), // Roles ou usuários específicos
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSecurityPolicySchema = createInsertSchema(securityPolicies).pick({
  name: true,
  description: true,
  type: true,
  settings: true,
  isActive: true,
  appliesTo: true,
  createdBy: true,
});

// Integrações com Sistemas Externos
export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  provider: text("provider").notNull(), // google, slack, salesforce, etc.
  type: text("type").notNull(), // auth, data_sync, webhook, etc.
  config: jsonb("config").notNull(), // Configurações da integração
  credentials: jsonb("credentials"), // Credenciais (criptografadas)
  status: text("status").default("inactive"), // active, inactive, error
  lastSyncAt: timestamp("last_sync_at"),
  lastErrorMessage: text("last_error_message"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertIntegrationSchema = createInsertSchema(integrations).pick({
  name: true,
  provider: true,
  type: true,
  config: true,
  credentials: true,
  status: true,
  lastSyncAt: true,
  lastErrorMessage: true,
  createdBy: true,
});

// Logs de Integração
export const integrationLogs = pgTable("integration_logs", {
  id: serial("id").primaryKey(),
  integrationId: integer("integration_id").references(() => integrations.id).notNull(),
  event: text("event").notNull(), // sync_started, sync_completed, error, etc.
  status: text("status").notNull(), // success, error, warning
  message: text("message"),
  details: jsonb("details"),
  performedAt: timestamp("performed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertIntegrationLogSchema = createInsertSchema(integrationLogs).pick({
  integrationId: true,
  event: true,
  status: true,
  message: true,
  details: true,
  performedAt: true,
});
