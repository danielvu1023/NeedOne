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
