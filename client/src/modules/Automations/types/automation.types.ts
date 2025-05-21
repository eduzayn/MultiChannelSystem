export type AutomationStatus = 'active' | 'paused' | 'draft' | 'error' | 'archived';

export type TriggerType = 'contact' | 'deal' | 'company' | 'conversation' | 'time' | 'event' | 'ecommerce' | 'education';

export interface Automation {
  id: string;
  name: string;
  description: string;
  status: AutomationStatus;
  triggerType: TriggerType;
  triggerName: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  activeEntities: number;
  completedEntities: number;
  conversionRate?: number;
  nodes?: AutomationNode[];
  edges?: AutomationEdge[];
}

export interface AutomationNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'goal';
  data: {
    label: string;
    description?: string;
    properties?: Record<string, any>;
  };
  position: {
    x: number;
    y: number;
  };
}

export interface AutomationEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
}

export type AutomationComplexity = 'Simples' | 'Intermediário' | 'Avançado';

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'crm' | 'support' | 'ecommerce' | 'education';
  complexity: AutomationComplexity;
  stepsCount: number;
  benefits: string[];
  nodes: AutomationNode[];
  edges: AutomationEdge[];
  previewImageUrl?: string;
}