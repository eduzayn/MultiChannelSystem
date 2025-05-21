import { db } from "./db";
import { 
  users, 
  contacts, 
  companies, 
  deals, 
  conversations, 
  messages, 
  teams, 
  userTeams, 
  roles, 
  campaigns,
  automations,
  settings
} from "@shared/schema";
import { storage } from "./storage";

/**
 * Inicializa o banco de dados com dados iniciais para teste
 */
export async function initializeDatabase() {
  try {
    console.log("Inicializando o banco de dados com dados iniciais...");
    
    // Verifica se já existem usuários no banco
    const existingUsers = await db.select().from(users);
    
    if (existingUsers.length > 0) {
      console.log("O banco de dados já foi inicializado. Pulando inicialização.");
      return;
    }
    
    // Criar usuários
    const adminUser = await storage.createUser({
      username: "admin",
      password: "admin123",
      displayName: "Administrador",
      email: "admin@sistema.com",
      role: "admin",
      avatar: null,
    });
    
    const agentUser = await storage.createUser({
      username: "atendente",
      password: "atendente123",
      displayName: "Atendente",
      email: "atendente@sistema.com",
      role: "agent",
      avatar: null,
    });
    
    const managerUser = await storage.createUser({
      username: "gerente",
      password: "gerente123",
      displayName: "Gerente",
      email: "gerente@sistema.com",
      role: "manager",
      avatar: null,
    });
    
    // Criar papéis
    await storage.createRole({
      name: "admin",
      description: "Administrador do sistema com acesso total",
      permissions: JSON.stringify(["*"]),
    });
    
    await storage.createRole({
      name: "manager",
      description: "Gerente com acesso a relatórios e configurações",
      permissions: JSON.stringify(["view_reports", "manage_users", "manage_teams", "view_dashboard", "manage_contacts"]),
    });
    
    await storage.createRole({
      name: "agent",
      description: "Atendente com acesso limitado",
      permissions: JSON.stringify(["view_dashboard", "manage_contacts", "manage_conversations"]),
    });
    
    // Criar equipes
    const supportTeam = await storage.createTeam({
      name: "Suporte Técnico",
      description: "Equipe de suporte técnico aos clientes",
      managerId: managerUser.id,
    });
    
    const salesTeam = await storage.createTeam({
      name: "Vendas",
      description: "Equipe comercial",
      managerId: managerUser.id,
    });
    
    // Associar usuários às equipes
    await storage.createUserTeam({
      userId: agentUser.id,
      teamId: supportTeam.id,
      role: "member",
    });
    
    await storage.createUserTeam({
      userId: managerUser.id,
      teamId: supportTeam.id,
      role: "manager",
    });
    
    // Criar contatos
    const contact1 = await storage.createContact({
      name: "João Silva",
      email: "joao.silva@email.com",
      phone: "11999887766",
      company: "Empresa ABC",
      notes: "Cliente VIP",
      createdBy: agentUser.id,
    });
    
    const contact2 = await storage.createContact({
      name: "Maria Souza",
      email: "maria.souza@email.com",
      phone: "11988776655",
      company: "Empresa XYZ",
      notes: "Interesse em novos produtos",
      createdBy: agentUser.id,
    });
    
    // Criar empresas
    const company1 = await storage.createCompany({
      name: "Empresa ABC",
      website: "www.empresaabc.com.br",
      industry: "Tecnologia",
      size: "Médio",
      address: "Rua das Flores, 123 - São Paulo",
      notes: "Parceiro estratégico",
      createdBy: agentUser.id,
    });
    
    const company2 = await storage.createCompany({
      name: "Empresa XYZ",
      website: "www.empresaxyz.com.br",
      industry: "Finanças",
      size: "Grande",
      address: "Av. Paulista, 1000 - São Paulo",
      notes: "Potencial para expansão",
      createdBy: managerUser.id,
    });
    
    // Criar negócios
    await storage.createDeal({
      title: "Venda de software",
      value: 150000, // em centavos
      stage: "negotiation",
      contactId: contact1.id,
      companyId: company1.id,
      notes: "Cliente interessado no pacote premium",
      expectedCloseDate: new Date(new Date().setDate(new Date().getDate() + 15)),
      assignedTo: agentUser.id,
    });
    
    await storage.createDeal({
      title: "Renovação de contrato",
      value: 75000, // em centavos
      stage: "lead",
      contactId: contact2.id,
      companyId: company2.id,
      notes: "Precisa de apresentação detalhada",
      expectedCloseDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      assignedTo: managerUser.id,
    });
    
    // Criar conversas
    const whatsappConversation = await storage.createConversation({
      name: "João Silva",
      channel: "whatsapp",
      avatar: null,
      lastMessage: "Olá, preciso de ajuda com o sistema",
      lastMessageAt: new Date(),
      unreadCount: 2,
      status: "open",
      assignedTo: agentUser.id,
      contactId: contact1.id,
    });
    
    const emailConversation = await storage.createConversation({
      name: "Maria Souza",
      channel: "email",
      avatar: null,
      lastMessage: "Solicitação de orçamento",
      lastMessageAt: new Date(),
      unreadCount: 0,
      status: "open",
      assignedTo: agentUser.id,
      contactId: contact2.id,
    });
    
    // Criar mensagens
    await storage.createMessage({
      conversationId: whatsappConversation.id,
      content: "Olá, preciso de ajuda com o sistema",
      type: "text",
      sender: "contact",
      status: "read",
      metadata: JSON.stringify({}),
      timestamp: new Date(new Date().setMinutes(new Date().getMinutes() - 30)),
    });
    
    await storage.createMessage({
      conversationId: whatsappConversation.id,
      content: "Claro, em que posso ajudar?",
      type: "text",
      sender: "user",
      status: "delivered",
      metadata: JSON.stringify({}),
      timestamp: new Date(new Date().setMinutes(new Date().getMinutes() - 25)),
    });
    
    await storage.createMessage({
      conversationId: whatsappConversation.id,
      content: "Estou com dificuldade para acessar minha conta",
      type: "text",
      sender: "contact",
      status: "sent",
      metadata: JSON.stringify({}),
      timestamp: new Date(new Date().setMinutes(new Date().getMinutes() - 20)),
    });
    
    await storage.createMessage({
      conversationId: emailConversation.id,
      content: "Gostaria de solicitar um orçamento para 50 licenças do software",
      type: "text",
      sender: "contact",
      status: "read",
      metadata: JSON.stringify({}),
      timestamp: new Date(new Date().setHours(new Date().getHours() - 2)),
    });
    
    await storage.createMessage({
      conversationId: emailConversation.id,
      content: "Bom dia Maria, vou preparar esse orçamento e te enviar ainda hoje.",
      type: "text",
      sender: "user",
      status: "delivered",
      metadata: JSON.stringify({}),
      timestamp: new Date(new Date().setHours(new Date().getHours() - 1)),
    });
    
    // Criar campanhas
    await storage.createCampaign({
      name: "Campanha de Fim de Ano",
      description: "Promoção especial para clientes existentes",
      type: "email",
      status: "draft",
      startDate: new Date(new Date().setDate(new Date().getDate() + 10)),
      endDate: new Date(new Date().setDate(new Date().getDate() + 20)),
      targetAudience: JSON.stringify({
        segments: ["existing_customers"],
        filters: {
          lastPurchase: { min: 30, max: 180 } // dias
        }
      }),
      content: JSON.stringify({
        subject: "Promoção Especial de Fim de Ano",
        body: "Olá {first_name}, aproveite nossas ofertas exclusivas para clientes como você!"
      }),
      createdBy: managerUser.id,
    });
    
    // Criar automações
    await storage.createAutomation({
      name: "Resposta Automática",
      description: "Responde automaticamente a novas mensagens fora do horário comercial",
      trigger: JSON.stringify({
        event: "new_message",
        condition: "outside_business_hours"
      }),
      conditions: JSON.stringify({
        channels: ["whatsapp", "email"],
        sender: "contact"
      }),
      actions: JSON.stringify({
        type: "send_message",
        template: "fora_horario_comercial",
        delay: 0
      }),
      isActive: true,
      createdBy: adminUser.id,
    });
    
    await storage.createAutomation({
      name: "Atribuição de Conversas",
      description: "Atribui conversas novas para agentes disponíveis",
      trigger: JSON.stringify({
        event: "new_conversation"
      }),
      conditions: JSON.stringify({
        status: "open",
        assignedTo: null
      }),
      actions: JSON.stringify({
        type: "assign_conversation",
        target: "least_busy_agent",
        team: "support"
      }),
      isActive: true,
      createdBy: adminUser.id,
    });
    
    // Criar configurações
    await storage.createOrUpdateSetting({
      category: "system",
      key: "business_hours",
      value: JSON.stringify({
        monday: { start: "09:00", end: "18:00" },
        tuesday: { start: "09:00", end: "18:00" },
        wednesday: { start: "09:00", end: "18:00" },
        thursday: { start: "09:00", end: "18:00" },
        friday: { start: "09:00", end: "18:00" },
        saturday: { start: null, end: null },
        sunday: { start: null, end: null }
      })
    });
    
    await storage.createOrUpdateSetting({
      category: "messaging",
      key: "templates",
      value: JSON.stringify({
        fora_horario_comercial: {
          content: "Olá! Obrigado por entrar em contato. Estamos fora do horário comercial no momento, mas retornaremos sua mensagem no próximo dia útil.",
          variables: []
        },
        boas_vindas: {
          content: "Olá {first_name}! Bem-vindo(a) à {company_name}. Como podemos ajudar?",
          variables: ["first_name", "company_name"]
        }
      })
    });
    
    await storage.createOrUpdateSetting({
      category: "ai",
      key: "configuration",
      value: JSON.stringify({
        enabled: true,
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        max_tokens: 150,
        auto_response_threshold: 0.85,
        allowed_topics: ["support", "information", "feedback"]
      })
    });
    
    console.log("Banco de dados inicializado com sucesso!");
  } catch (error) {
    console.error("Erro ao inicializar o banco de dados:", error);
    throw error;
  }
}