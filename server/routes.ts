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
  insertMessageSchema,
  insertTeamSchema,
  insertUserTeamSchema,
  insertRoleSchema,
  insertCampaignSchema,
  insertCampaignResultSchema,
  insertAutomationSchema,
  insertSubscriptionPlanSchema,
  insertTenantSubscriptionSchema,
  insertInvoiceSchema,
  insertGoalSchema,
  insertAchievementSchema,
  insertUserAchievementSchema,
  insertSettingSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // ===== API de Autenticação =====
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Usuário e senha são obrigatórios" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }
      
      // Armazenar o usuário na sessão
      if (req.session) {
        req.session.user = {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          role: user.role
        };
      }
      
      // Retorna os dados do usuário (sem a senha)
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
      
    } catch (error) {
      res.status(500).json({ message: "Erro ao fazer login" });
    }
  });
  
  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      
      const user = await storage.getUser(req.session.user.id);
      
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      // Retorna os dados do usuário (sem a senha)
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
      
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar usuário autenticado" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          return res.status(500).json({ message: "Erro ao fazer logout" });
        }
        res.status(200).json({ message: "Logout realizado com sucesso" });
      });
    } else {
      res.status(200).json({ message: "Nenhuma sessão ativa" });
    }
  });
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

  // Teams API
  app.get("/api/teams", async (req, res) => {
    try {
      const teams = await storage.listTeams();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar equipes" });
    }
  });

  app.get("/api/teams/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de equipe inválido" });
      }
      
      const team = await storage.getTeam(id);
      if (!team) {
        return res.status(404).json({ message: "Equipe não encontrada" });
      }
      
      res.json(team);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar equipe" });
    }
  });

  app.post("/api/teams", async (req, res) => {
    try {
      const validatedData = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam(validatedData);
      res.status(201).json(team);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de equipe inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar equipe" });
    }
  });

  app.put("/api/teams/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de equipe inválido" });
      }
      
      const validatedData = insertTeamSchema.partial().parse(req.body);
      const updatedTeam = await storage.updateTeam(id, validatedData);
      
      if (!updatedTeam) {
        return res.status(404).json({ message: "Equipe não encontrada" });
      }
      
      res.json(updatedTeam);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de equipe inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao atualizar equipe" });
    }
  });

  app.delete("/api/teams/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de equipe inválido" });
      }
      
      const deleted = await storage.deleteTeam(id);
      if (!deleted) {
        return res.status(404).json({ message: "Equipe não encontrada" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Falha ao excluir equipe" });
    }
  });

  // UserTeams API
  app.get("/api/userteams", async (req, res) => {
    try {
      const { userId, teamId } = req.query;
      const userIdNum = userId ? Number(userId) : undefined;
      const teamIdNum = teamId ? Number(teamId) : undefined;
      
      const userTeams = await storage.listUserTeams(userIdNum, teamIdNum);
      res.json(userTeams);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar relações usuário-equipe" });
    }
  });

  app.post("/api/userteams", async (req, res) => {
    try {
      const validatedData = insertUserTeamSchema.parse(req.body);
      const userTeam = await storage.createUserTeam(validatedData);
      res.status(201).json(userTeam);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao adicionar usuário à equipe" });
    }
  });

  app.put("/api/userteams/:userId/:teamId", async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const teamId = Number(req.params.teamId);
      if (isNaN(userId) || isNaN(teamId)) {
        return res.status(400).json({ message: "IDs inválidos" });
      }
      
      const { role } = req.body;
      if (!role) {
        return res.status(400).json({ message: "Papel não informado" });
      }
      
      const userTeam = await storage.updateUserTeam(userId, teamId, role);
      if (!userTeam) {
        return res.status(404).json({ message: "Relação usuário-equipe não encontrada" });
      }
      
      res.json(userTeam);
    } catch (error) {
      res.status(500).json({ message: "Falha ao atualizar papel do usuário na equipe" });
    }
  });

  app.delete("/api/userteams/:userId/:teamId", async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const teamId = Number(req.params.teamId);
      if (isNaN(userId) || isNaN(teamId)) {
        return res.status(400).json({ message: "IDs inválidos" });
      }
      
      const deleted = await storage.deleteUserTeam(userId, teamId);
      if (!deleted) {
        return res.status(404).json({ message: "Relação usuário-equipe não encontrada" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Falha ao remover usuário da equipe" });
    }
  });

  // Roles API
  app.get("/api/roles", async (req, res) => {
    try {
      const roles = await storage.listRoles();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar papéis/permissões" });
    }
  });

  app.get("/api/roles/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de papel inválido" });
      }
      
      const role = await storage.getRole(id);
      if (!role) {
        return res.status(404).json({ message: "Papel não encontrado" });
      }
      
      res.json(role);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar papel" });
    }
  });

  app.post("/api/roles", async (req, res) => {
    try {
      const validatedData = insertRoleSchema.parse(req.body);
      const role = await storage.createRole(validatedData);
      res.status(201).json(role);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de papel inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar papel" });
    }
  });

  app.put("/api/roles/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de papel inválido" });
      }
      
      const validatedData = insertRoleSchema.partial().parse(req.body);
      const updatedRole = await storage.updateRole(id, validatedData);
      
      if (!updatedRole) {
        return res.status(404).json({ message: "Papel não encontrado" });
      }
      
      res.json(updatedRole);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de papel inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao atualizar papel" });
    }
  });

  app.delete("/api/roles/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de papel inválido" });
      }
      
      const deleted = await storage.deleteRole(id);
      if (!deleted) {
        return res.status(404).json({ message: "Papel não encontrado" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Falha ao excluir papel" });
    }
  });

  // Campaigns API
  app.get("/api/campaigns", async (req, res) => {
    try {
      const campaigns = await storage.listCampaigns();
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar campanhas" });
    }
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de campanha inválido" });
      }
      
      const campaign = await storage.getCampaign(id);
      if (!campaign) {
        return res.status(404).json({ message: "Campanha não encontrada" });
      }
      
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar campanha" });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const validatedData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(validatedData);
      res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de campanha inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar campanha" });
    }
  });

  app.put("/api/campaigns/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de campanha inválido" });
      }
      
      const validatedData = insertCampaignSchema.partial().parse(req.body);
      const updatedCampaign = await storage.updateCampaign(id, validatedData);
      
      if (!updatedCampaign) {
        return res.status(404).json({ message: "Campanha não encontrada" });
      }
      
      res.json(updatedCampaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de campanha inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao atualizar campanha" });
    }
  });

  app.delete("/api/campaigns/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de campanha inválido" });
      }
      
      const deleted = await storage.deleteCampaign(id);
      if (!deleted) {
        return res.status(404).json({ message: "Campanha não encontrada" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Falha ao excluir campanha" });
    }
  });

  // Settings API
  app.get("/api/settings", async (req, res) => {
    try {
      const { category } = req.query;
      let settings;
      
      if (category && typeof category === 'string') {
        settings = await storage.listSettings(category);
      } else {
        settings = await storage.listSettings();
      }
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar configurações" });
    }
  });

  app.get("/api/settings/:category/:key", async (req, res) => {
    try {
      const { category, key } = req.params;
      
      const setting = await storage.getSetting(category, key);
      if (!setting) {
        return res.status(404).json({ message: "Configuração não encontrada" });
      }
      
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Falha ao buscar configuração" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const validatedData = insertSettingSchema.parse(req.body);
      const setting = await storage.createOrUpdateSetting(validatedData);
      res.status(201).json(setting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de configuração inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao salvar configuração" });
    }
  });

  app.delete("/api/settings/:category/:key", async (req, res) => {
    try {
      const { category, key } = req.params;
      
      const deleted = await storage.deleteSetting(category, key);
      if (!deleted) {
        return res.status(404).json({ message: "Configuração não encontrada" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Falha ao excluir configuração" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
