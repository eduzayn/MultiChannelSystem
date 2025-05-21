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

// Export types for all new tables
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
