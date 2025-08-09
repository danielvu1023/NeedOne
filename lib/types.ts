import { Database } from "./database.types";

export interface ApiResponse {
  success: boolean;
  message?: string;
}
export type Park = Database["public"]["Tables"]["park"]["Row"];
export interface ParkCardProps {
  park: Park;
}
