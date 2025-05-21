import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertContactSchema, 
  insertCompanySchema, 
  insertDealSchema,
  insertConversationSchema,
  insertMessageSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Users API
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.listUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Contacts API
  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.listContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.get("/api/contacts/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid contact ID" });
      }
      
      const contact = await storage.getContact(id);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      res.json(contact);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact" });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create contact" });
    }
  });

  app.put("/api/contacts/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid contact ID" });
      }
      
      const validatedData = insertContactSchema.partial().parse(req.body);
      const updatedContact = await storage.updateContact(id, validatedData);
      
      if (!updatedContact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      res.json(updatedContact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update contact" });
    }
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid contact ID" });
      }
      
      const deleted = await storage.deleteContact(id);
      if (!deleted) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete contact" });
    }
  });

  // Companies API
  app.get("/api/companies", async (req, res) => {
    try {
      const companies = await storage.listCompanies();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.get("/api/companies/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid company ID" });
      }
      
      const company = await storage.getCompany(id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  app.post("/api/companies", async (req, res) => {
    try {
      const validatedData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(validatedData);
      res.status(201).json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid company data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create company" });
    }
  });

  app.put("/api/companies/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid company ID" });
      }
      
      const validatedData = insertCompanySchema.partial().parse(req.body);
      const updatedCompany = await storage.updateCompany(id, validatedData);
      
      if (!updatedCompany) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.json(updatedCompany);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid company data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update company" });
    }
  });

  app.delete("/api/companies/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid company ID" });
      }
      
      const deleted = await storage.deleteCompany(id);
      if (!deleted) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete company" });
    }
  });

  // Deals API
  app.get("/api/deals", async (req, res) => {
    try {
      const deals = await storage.listDeals();
      res.json(deals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deals" });
    }
  });

  app.get("/api/deals/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid deal ID" });
      }
      
      const deal = await storage.getDeal(id);
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      res.json(deal);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deal" });
    }
  });

  app.post("/api/deals", async (req, res) => {
    try {
      const validatedData = insertDealSchema.parse(req.body);
      const deal = await storage.createDeal(validatedData);
      res.status(201).json(deal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid deal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create deal" });
    }
  });

  app.put("/api/deals/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid deal ID" });
      }
      
      const validatedData = insertDealSchema.partial().parse(req.body);
      const updatedDeal = await storage.updateDeal(id, validatedData);
      
      if (!updatedDeal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      res.json(updatedDeal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid deal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update deal" });
    }
  });

  app.delete("/api/deals/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid deal ID" });
      }
      
      const deleted = await storage.deleteDeal(id);
      if (!deleted) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete deal" });
    }
  });

  // Conversations API
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.listConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar conversas" });
    }
  });

  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de conversa inválido" });
      }
      
      const conversation = await storage.getConversation(id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversa não encontrada" });
      }
      
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar conversa" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(validatedData);
      res.status(201).json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de conversa inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar conversa" });
    }
  });

  app.put("/api/conversations/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de conversa inválido" });
      }
      
      const validatedData = insertConversationSchema.partial().parse(req.body);
      const updatedConversation = await storage.updateConversation(id, validatedData);
      
      if (!updatedConversation) {
        return res.status(404).json({ message: "Conversa não encontrada" });
      }
      
      res.json(updatedConversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de conversa inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao atualizar conversa" });
    }
  });

  app.delete("/api/conversations/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de conversa inválido" });
      }
      
      const deleted = await storage.deleteConversation(id);
      if (!deleted) {
        return res.status(404).json({ message: "Conversa não encontrada" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Falha ao excluir conversa" });
    }
  });

  // Messages API
  app.get("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      const conversationId = Number(req.params.conversationId);
      if (isNaN(conversationId)) {
        return res.status(400).json({ message: "ID de conversa inválido" });
      }
      
      const messages = await storage.listMessagesByConversation(conversationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar mensagens" });
    }
  });

  app.get("/api/messages/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de mensagem inválido" });
      }
      
      const message = await storage.getMessage(id);
      if (!message) {
        return res.status(404).json({ message: "Mensagem não encontrada" });
      }
      
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar mensagem" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de mensagem inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar mensagem" });
    }
  });

  app.put("/api/messages/:id/status", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de mensagem inválido" });
      }
      
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status não informado" });
      }
      
      const message = await storage.updateMessageStatus(id, status);
      if (!message) {
        return res.status(404).json({ message: "Mensagem não encontrada" });
      }
      
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Falha ao atualizar status da mensagem" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
