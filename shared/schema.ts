import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
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
