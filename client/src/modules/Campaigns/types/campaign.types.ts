export type CampaignChannel = "whatsapp" | "sms" | "email" | "conversation";

export type CampaignStatus = 
  | "draft" 
  | "scheduled" 
  | "sending" 
  | "completed" 
  | "paused" 
  | "error" 
  | "archived"
  | "active"; // Adding "active" to the allowed status types

export interface AudienceInfo {
  id?: string;
  name: string;
  size: number;
  filters?: string[];
}

export interface ContentInfo {
  subject?: string;
  body: string;
  attachments?: string[];
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  channel: CampaignChannel;
  channelType?: "official" | "zapi"; // For WhatsApp
  status: CampaignStatus;
  createdAt: string;
  scheduledAt?: string;
  sentAt?: string;
  completedAt?: string;
  audienceId: string;
  audienceName: string;
  totalContacts: number;
  sentCount: number;
  deliveredCount: number;
  readCount?: number; // WhatsApp only
  responseCount: number;
  clickCount?: number; // For tracking links
  conversionCount?: number;
  conversionValue?: number;
  tags?: string[];
  // Add new fields for the campaign wizard
  messageContent?: string;
  scheduleType?: "immediate" | "scheduled";
  enableBatching?: boolean;
  batchSize?: number;
  batchInterval?: number;
  batchIntervalUnit?: "minutes" | "hours";
  enableTagging?: boolean;
  tagName?: string;
  enableTracking?: boolean;
  senderPhone?: string;
  template?: string;
  mediaUrl?: string;
  audience?: AudienceInfo;
  content?: ContentInfo;
}