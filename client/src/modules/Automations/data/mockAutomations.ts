import { Automation } from "../types/automation.types";
import { v4 as uuidv4 } from "uuid";

// Data de exemplo para automações
export const automations: Automation[] = [
  {
    id: uuidv4(),
    name: "Boas-vindas ao Cliente",
    description: "Email + WhatsApp após cadastro",
    status: "active",
    triggerType: "contact",
    triggerName: "Novo contato criado",
    createdAt: "2023-10-15T14:30:00Z",
    updatedAt: "2023-10-15T16:45:00Z",
    createdBy: "Admin",
    activeEntities: 52,
    completedEntities: 487,
    conversionRate: 0.65
  },
  {
    id: uuidv4(),
    name: "Recuperação de Carrinho",
    description: "WhatsApp após abandono",
    status: "active",
    triggerType: "event",
    triggerName: "Carrinho abandonado",
    createdAt: "2023-09-20T10:15:00Z",
    updatedAt: "2023-10-10T09:30:00Z",
    createdBy: "Admin",
    activeEntities: 38,
    completedEntities: 215,
    conversionRate: 0.42
  },
  {
    id: uuidv4(),
    name: "Aniversário do Cliente",
    description: "Email com cupom de desconto",
    status: "active",
    triggerType: "time",
    triggerName: "Data específica do contato",
    createdAt: "2023-08-05T08:45:00Z",
    updatedAt: "2023-10-01T11:20:00Z",
    createdBy: "Admin",
    activeEntities: 23,
    completedEntities: 156,
    conversionRate: 0.78
  },
  {
    id: uuidv4(),
    name: "Nutrição de Leads",
    description: "Sequência de 5 emails",
    status: "draft",
    triggerType: "contact",
    triggerName: "Lead adicionado à lista",
    createdAt: "2023-10-18T15:00:00Z",
    updatedAt: "2023-10-18T15:00:00Z",
    createdBy: "Admin",
    activeEntities: 0,
    completedEntities: 0
  },
  {
    id: uuidv4(),
    name: "Notificação de Atrasos",
    description: "Alertas para pagamentos atrasados",
    status: "error",
    triggerType: "event",
    triggerName: "Pagamento atrasado",
    createdAt: "2023-09-10T09:00:00Z",
    updatedAt: "2023-10-19T14:20:00Z",
    createdBy: "Admin",
    activeEntities: 12,
    completedEntities: 34,
    conversionRate: 0.25
  },
  {
    id: uuidv4(),
    name: "Acompanhamento Pós-Compra",
    description: "Feedback e suporte",
    status: "paused",
    triggerType: "event",
    triggerName: "Pedido entregue",
    createdAt: "2023-07-25T13:30:00Z",
    updatedAt: "2023-10-15T10:15:00Z",
    createdBy: "Admin",
    activeEntities: 0,
    completedEntities: 124,
    conversionRate: 0.85
  }
];