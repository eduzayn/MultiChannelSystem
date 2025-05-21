export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Stage {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface Deal {
  id: string;
  name: string;
  company: string;
  companyLogo?: string;
  value: number;
  stage: string;
  stageColor: string;
  status: 'open' | 'won' | 'lost' | 'onhold';
  probability: number;
  closeDate: string;
  createdDate: string;
  updatedDate: string;
  owner: string;
  ownerAvatar?: string;
  health: number;
  origin?: string;
  tags: Tag[];
}

export type ViewMode = 'kanban' | 'table';