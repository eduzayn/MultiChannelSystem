import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Deal = typeof deals.$inferSelect;
