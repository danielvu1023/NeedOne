import { Database } from "./database.types";

export interface ApiResponse {
  success: boolean;
  message?: string;
}
export interface ApiDataResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
export type Park = Database["public"]["Tables"]["park"]["Row"];
export interface ParkCardProps {
  park: Park;
}

export type Report = Database["public"]["Tables"]["reports"]["Row"];

// Webhook payload interfaces
export interface WebhookCheckInRecord {
  id: string;
  park_id: string;
  user_id: string;
  check_in_time: string;
  check_out_time: string | null;
}

export interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: WebhookCheckInRecord;
  old_record: WebhookCheckInRecord | null;
}

// Push subscription interfaces
export interface PushSubscription {
  user_id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  user_agent_info: any;
}
