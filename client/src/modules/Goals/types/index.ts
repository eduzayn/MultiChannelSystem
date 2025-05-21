// Types for the performance ranking components
export interface TeamMember {
  id: number;
  name: string;
  avatar: string;
  role: string;
  awards: string[];
  previousPosition: number;
  trend: "up" | "down" | "same";
}

export interface SalesTeamMember extends TeamMember {
  sales: number;
  deals: number;
  target: number;
  completion: number;
}

export interface SupportTeamMember extends TeamMember {
  tickets: number;
  resolution: number;
  satisfaction: number;
  target: number;
  completion: number;
}

export type TeamData = SalesTeamMember[] | SupportTeamMember[];