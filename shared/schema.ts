import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index, date, unique, float } from "drizzle-orm/pg-core";
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
  description: text("description"),
  contactId: integer("contact_id").references(() => contacts.id),
  companyId: integer("company_id").references(() => companies.id),
  value: integer("value"), // Valor em centavos
  currency: text("currency").default("BRL"),
  stage: text("stage").notNull(), // new, contacted, qualified, proposal, negotiation, won, lost
  priority: text("priority"), // low, medium, high
  assignedTo: integer("assigned_to").references(() => users.id),
  region: text("region"), // Região geográfica do negócio
  source: text("source"), // Origem do lead
  tags: jsonb("tags"), // Array de tags
  customFields: jsonb("custom_fields"), // Campos personalizados
  metadata: jsonb("metadata"), // Metadados adicionais
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  closedAt: timestamp("closed_at"),
});

export const insertDealSchema = createInsertSchema(deals).pick({
  title: true,
  description: true,
  contactId: true,
  companyId: true,
  value: true,
  currency: true,
  stage: true,
  priority: true,
  assignedTo: true,
  region: true,
  source: true,
  tags: true,
  customFields: true,
  metadata: true,
  closedAt: true,
});

// Tabela para as conversas
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  channel: text("channel").notNull(), // whatsapp, instagram, facebook, email
  identifier: text("identifier"), // ID do contato no canal (número de telefone no WhatsApp, email, etc)
  avatar: text("avatar"),
  lastMessage: text("last_message"),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  unreadCount: integer("unread_count").default(0),
  status: text("status").default("open"), // open, resolved, closed
  assignedTo: integer("assigned_to").references(() => users.id),
  contactId: integer("contact_id").references(() => contacts.id),
  metadata: jsonb("metadata"), // Armazenar dados específicos do canal
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).pick({
  name: true,
  channel: true,
  identifier: true,
  avatar: true,
  lastMessage: true,
  lastMessageAt: true,
  unreadCount: true,
  status: true,
  assignedTo: true,
  contactId: true,
  metadata: true,
});

// Tabela para as mensagens
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id).notNull(),
  content: text("content").notNull(),
  contentType: text("content_type").default("text"), // text, image, file, etc.
  sender: text("sender").notNull(), // user, contact, system
  timestamp: timestamp("timestamp").defaultNow(),
  status: text("status").default("sent"), // sent, delivered, read
  metadata: jsonb("metadata"), // Metadados adicionais (ex: coordenadas para mensagens de localização)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  conversationId: true,
  content: true,
  contentType: true,
  sender: true,
  timestamp: true,
  status: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
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
  isConnected: boolean("is_connected").default(false), // Status da conexão com o serviço externo
  lastStatusChange: timestamp("last_status_change"), // Quando o status mudou pela última vez
  lastErrorMessage: text("last_error_message"), // Última mensagem de erro
  lastCheck: timestamp("last_check"), // Quando foi verificado pela última vez
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
  metricType: text("metric_type").notNull(), // number, percentage, currency, time, ratio
  warningThreshold: integer("warning_threshold"), // Limite para alertas
  criticalThreshold: integer("critical_threshold"), // Limite crítico
  goal: integer("goal"), // Meta a ser alcançada
  unit: text("unit"), // Unidade de medida (%, R$, min, etc.)
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertKpiSchema = createInsertSchema(kpis).pick({
  name: true,
  description: true,
  category: true,
  metricType: true,
  warningThreshold: true,
  criticalThreshold: true,
  goal: true,
  unit: true,
  active: true,
  createdAt: true,
  updatedAt: true,
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
  name: text("name").notNull(),
  type: text("type").notNull(), // kpi, chart, table, map, heatmap, gauge, timeline, funnel, kanban, custom
  dataSource: text("data_source"), // Nome da fonte de dados (tabela, API, etc.)
  configuration: jsonb("configuration").notNull(), // Configurações específicas do widget
  position: jsonb("position").notNull(), // { x: number, y: number, width: number, height: number }
  refreshInterval: integer("refresh_interval"), // Intervalo de atualização em segundos
  isVisible: boolean("is_visible").default(true),
  permissions: jsonb("permissions"), // { roles: string[], teams: number[] }
  customization: jsonb("customization"), // { theme: string, colors: string[], icons: string[] }
  filters: jsonb("filters"), // { date: DateRange, category: string[], value: number[] }
  drillDown: jsonb("drill_down"), // { enabled: boolean, maxLevels: number, types: string[] }
  events: jsonb("events"), // { click: boolean, hover: boolean, selection: boolean }
  integration: jsonb("integration"), // { export: string[], share: string[], api: object }
  accessibility: jsonb("accessibility"), // { role: string, ariaLabel: string, features: object }
  responsive: jsonb("responsive"), // { breakpoints: object }
  animation: jsonb("animation"), // { enabled: boolean, duration: number, effects: object }
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const dashboardLayouts = pgTable("dashboard_layouts", {
  id: serial("id").primaryKey(),
  dashboardId: integer("dashboard_id").references(() => dashboards.id).notNull(),
  name: text("name").notNull(),
  layout: jsonb("layout").notNull(), // Array de posições de widgets
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const dashboardThemes = pgTable("dashboard_themes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  colors: jsonb("colors").notNull(), // { primary, secondary, background, text, etc. }
  typography: jsonb("typography").notNull(), // { fontFamily, fontSize, fontWeight, etc. }
  spacing: jsonb("spacing").notNull(), // { padding, margin, gap, etc. }
  borders: jsonb("borders").notNull(), // { radius, width, style, etc. }
  shadows: jsonb("shadows").notNull(), // { small, medium, large, etc. }
  animations: jsonb("animations").notNull(), // { duration, easing, etc. }
  darkMode: jsonb("dark_mode"), // Configurações específicas para modo escuro
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const dashboardPresets = pgTable("dashboard_presets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  widgets: jsonb("widgets").notNull(), // Array de configurações de widgets
  layout: jsonb("layout").notNull(), // Layout padrão dos widgets
  theme: jsonb("theme"), // Tema padrão
  category: text("category"), // Categoria do preset (vendas, suporte, etc.)
  thumbnail: text("thumbnail"), // URL da miniatura
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const dashboardShares = pgTable("dashboard_shares", {
  id: serial("id").primaryKey(),
  dashboardId: integer("dashboard_id").references(() => dashboards.id).notNull(),
  type: text("type").notNull(), // link, embed
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at"),
  permissions: jsonb("permissions"), // { view: boolean, edit: boolean, share: boolean }
  restrictions: jsonb("restrictions"), // { ip: string[], domain: string[], referer: string[] }
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const dashboardExports = pgTable("dashboard_exports", {
  id: serial("id").primaryKey(),
  dashboardId: integer("dashboard_id").references(() => dashboards.id).notNull(),
  format: text("format").notNull(), // pdf, png, xlsx
  status: text("status").notNull(), // pending, processing, completed, failed
  url: text("url"), // URL do arquivo exportado
  error: text("error"), // Mensagem de erro, se houver
  metadata: jsonb("metadata"), // { size: number, pages: number, etc. }
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const dashboardAlerts = pgTable("dashboard_alerts", {
  id: serial("id").primaryKey(),
  dashboardId: integer("dashboard_id").references(() => dashboards.id).notNull(),
  widgetId: integer("widget_id").references(() => dashboardWidgets.id).notNull(),
  name: text("name").notNull(),
  condition: jsonb("condition").notNull(), // { metric: string, operator: string, value: number }
  frequency: text("frequency").notNull(), // realtime, hourly, daily, weekly
  channels: jsonb("channels").notNull(), // { email: boolean, slack: boolean, webhook: boolean }
  recipients: jsonb("recipients"), // { users: number[], teams: number[], webhooks: string[] }
  message: text("message"),
  isActive: boolean("is_active").default(true),
  lastTriggered: timestamp("last_triggered"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const dashboardAlertHistory = pgTable("dashboard_alert_history", {
  id: serial("id").primaryKey(),
  alertId: integer("alert_id").references(() => dashboardAlerts.id).notNull(),
  triggeredAt: timestamp("triggered_at").notNull(),
  value: float("value").notNull(),
  threshold: float("threshold").notNull(),
  status: text("status").notNull(), // triggered, acknowledged, resolved
  acknowledgedBy: integer("acknowledged_by").references(() => users.id),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedAt: timestamp("resolved_at"),
  metadata: jsonb("metadata"), // Dados adicionais do alerta
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const dashboardComments = pgTable("dashboard_comments", {
  id: serial("id").primaryKey(),
  dashboardId: integer("dashboard_id").references(() => dashboards.id).notNull(),
  widgetId: integer("widget_id").references(() => dashboardWidgets.id),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  type: text("type").default("comment"), // comment, note, insight
  visibility: text("visibility").default("public"), // public, private, team
  metadata: jsonb("metadata"), // { position: object, attachments: array }
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const dashboardBookmarks = pgTable("dashboard_bookmarks", {
  id: serial("id").primaryKey(),
  dashboardId: integer("dashboard_id").references(() => dashboards.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name"),
  filters: jsonb("filters"), // Filtros salvos
  layout: jsonb("layout"), // Layout personalizado
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
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

export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets).pick({
  dashboardId: true,
  name: true,
  type: true,
  dataSource: true,
  configuration: true,
  position: true,
  refreshInterval: true,
  isVisible: true,
  permissions: true,
  customization: true,
  filters: true,
  drillDown: true,
  events: true,
  integration: true,
  accessibility: true,
  responsive: true,
  animation: true
});

export const insertDashboardLayoutSchema = createInsertSchema(dashboardLayouts).pick({
  dashboardId: true,
  name: true,
  layout: true,
  isDefault: true
});

export const insertDashboardThemeSchema = createInsertSchema(dashboardThemes).pick({
  name: true,
  colors: true,
  typography: true,
  spacing: true,
  borders: true,
  shadows: true,
  animations: true,
  darkMode: true
});

export const insertDashboardPresetSchema = createInsertSchema(dashboardPresets).pick({
  name: true,
  description: true,
  widgets: true,
  layout: true,
  theme: true,
  category: true,
  thumbnail: true
});

export const insertDashboardShareSchema = createInsertSchema(dashboardShares).pick({
  dashboardId: true,
  type: true,
  token: true,
  expiresAt: true,
  permissions: true,
  restrictions: true
});

export const insertDashboardExportSchema = createInsertSchema(dashboardExports).pick({
  dashboardId: true,
  format: true,
  status: true,
  url: true,
  error: true,
  metadata: true
});

export const insertDashboardAlertSchema = createInsertSchema(dashboardAlerts).pick({
  dashboardId: true,
  widgetId: true,
  name: true,
  condition: true,
  frequency: true,
  channels: true,
  recipients: true,
  message: true,
  isActive: true
});

export const insertDashboardAlertHistorySchema = createInsertSchema(dashboardAlertHistory).pick({
  alertId: true,
  triggeredAt: true,
  value: true,
  threshold: true,
  status: true,
  acknowledgedBy: true,
  acknowledgedAt: true,
  resolvedAt: true,
  metadata: true
});

export const insertDashboardCommentSchema = createInsertSchema(dashboardComments).pick({
  dashboardId: true,
  widgetId: true,
  userId: true,
  content: true,
  type: true,
  visibility: true,
  metadata: true
});

export const insertDashboardBookmarkSchema = createInsertSchema(dashboardBookmarks).pick({
  dashboardId: true,
  userId: true,
  name: true,
  filters: true,
  layout: true
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertReportSchema = createInsertSchema(reports).pick({
  name: true,
  description: true,
  type: true,
  format: true,
  query: true,
  schedule: true,
  createdBy: true
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
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertReportResultSchema = createInsertSchema(reportResults).pick({
  reportId: true,
  fileUrl: true,
  status: true,
  errorMessage: true,
  metadata: true,
  expiresAt: true
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
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertUserActivitySchema = createInsertSchema(userActivities).pick({
  userId: true,
  activityType: true,
  entityType: true,
  entityId: true,
  details: true,
  performedAt: true,
  ipAddress: true,
  userAgent: true
});

// Análise e Performance: Métricas de performance da equipe
export const teamPerformanceMetrics = pgTable("team_performance_metrics", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").references(() => teams.id).notNull(),
  period: text("period").notNull(), // daily, weekly, monthly, quarterly, yearly
  dateFrom: timestamp("date_from").notNull(),
  dateTo: timestamp("date_to").notNull(),
  metrics: jsonb("metrics").notNull(), // JSON com diferentes métricas e valores
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertTeamPerformanceMetricSchema = createInsertSchema(teamPerformanceMetrics).pick({
  teamId: true,
  period: true,
  dateFrom: true,
  dateTo: true,
  metrics: true
});
