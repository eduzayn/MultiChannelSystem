import { AutomationTemplate } from "../types/automation.types";
import { v4 as uuidv4 } from "uuid";

export const automationTemplates: AutomationTemplate[] = [
  {
    id: uuidv4(),
    name: "Boas-vindas para Novos Clientes",
    description: "Sequência de boas-vindas com suporte para dúvidas",
    category: "crm",
    complexity: "Simples",
    stepsCount: 3,
    benefits: [
      "Aumentar engajamento inicial",
      "Reduzir abandono de novos clientes",
      "Facilitar onboarding"
    ],
    nodes: [],
    edges: []
  },
  {
    id: uuidv4(),
    name: "Recuperação de Carrinho Abandonado",
    description: "Lembretes e incentivos para retomar compras",
    category: "ecommerce",
    complexity: "Intermediário",
    stepsCount: 4,
    benefits: [
      "Recuperar vendas perdidas",
      "Aumentar taxa de conversão",
      "Enviar cupons de desconto personalizados"
    ],
    nodes: [],
    edges: []
  },
  {
    id: uuidv4(),
    name: "Nutrição de Leads",
    description: "Envio de conteúdo relevante para leads",
    category: "crm",
    complexity: "Avançado",
    stepsCount: 7,
    benefits: [
      "Educação do lead sobre produto/serviço",
      "Aumento gradual do engajamento",
      "Aquecimento para vendas"
    ],
    nodes: [],
    edges: []
  },
  {
    id: uuidv4(),
    name: "Renovação de Assinatura",
    description: "Lembretes e incentivos para renovação",
    category: "crm",
    complexity: "Intermediário",
    stepsCount: 5,
    benefits: [
      "Reduzir churn",
      "Aumentar receita recorrente",
      "Identificar clientes em risco"
    ],
    nodes: [],
    edges: []
  },
  {
    id: uuidv4(),
    name: "Acompanhamento Pós-Compra",
    description: "Engajamento para garantir satisfação",
    category: "support",
    complexity: "Simples",
    stepsCount: 3,
    benefits: [
      "Garantir satisfação do cliente",
      "Coletar feedback e avaliações",
      "Identificar oportunidades de cross-sell"
    ],
    nodes: [],
    edges: []
  },
  {
    id: uuidv4(),
    name: "Reengajamento de Clientes Inativos",
    description: "Recuperação de clientes sem atividade recente",
    category: "crm",
    complexity: "Intermediário",
    stepsCount: 4,
    benefits: [
      "Reativar clientes inativos",
      "Identificar razões de inatividade",
      "Aumentar lifetime value"
    ],
    nodes: [],
    edges: []
  },
  {
    id: uuidv4(),
    name: "Gestão de Tickets de Suporte",
    description: "Automação do fluxo de atendimento ao cliente",
    category: "support",
    complexity: "Avançado",
    stepsCount: 8,
    benefits: [
      "Reduzir tempo de resposta",
      "Garantir que nenhum ticket fique sem resposta",
      "Melhorar satisfação no atendimento"
    ],
    nodes: [],
    edges: []
  },
  {
    id: uuidv4(),
    name: "Sequência de Educação",
    description: "Envio de conteúdo didático em sequência",
    category: "education",
    complexity: "Intermediário",
    stepsCount: 6,
    benefits: [
      "Engajar alunos com conteúdo relevante",
      "Reduzir evasão de cursos",
      "Aumentar taxa de conclusão"
    ],
    nodes: [],
    edges: []
  },
  {
    id: uuidv4(),
    name: "Campanhas Sazonais",
    description: "Automação para datas comemorativas",
    category: "ecommerce",
    complexity: "Simples",
    stepsCount: 3,
    benefits: [
      "Aproveitar datas especiais",
      "Aumentar vendas em períodos estratégicos",
      "Criar senso de urgência"
    ],
    nodes: [],
    edges: []
  }
];