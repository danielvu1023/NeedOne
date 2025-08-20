export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      check_in: {
        Row: {
          check_in_time: string
          check_out_time: string | null
          id: number
          park_id: number
          user_id: string
        }
        Insert: {
          check_in_time?: string
          check_out_time?: string | null
          id?: number
          park_id: number
          user_id: string
        }
        Update: {
          check_in_time?: string
          check_out_time?: string | null
          id?: number
          park_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_in_park_id_fkey"
            columns: ["park_id"]
            isOneToOne: false
            referencedRelation: "park"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_in_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_requests: {
        Row: {
          created_at: string | null
          id: string
          receiver_id: string
          sender_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          receiver_id: string
          sender_id: string
          status?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string | null
          user_id_1: string
          user_id_2: string
        }
        Insert: {
          created_at?: string | null
          user_id_1: string
          user_id_2: string
        }
        Update: {
          created_at?: string | null
          user_id_1?: string
          user_id_2?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_user_id_1_fkey"
            columns: ["user_id_1"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_user_id_2_fkey"
            columns: ["user_id_2"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      park: {
        Row: {
          id: number
          location: string
          name: string
        }
        Insert: {
          id?: number
          location: string
          name: string
        }
        Update: {
          id?: number
          location?: string
          name?: string
        }
        Relationships: []
      }
      park_users: {
        Row: {
          park_id: number
          user_id: string
        }
        Insert: {
          park_id: number
          user_id: string
        }
        Update: {
          park_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "park_users_park_id_fkey"
            columns: ["park_id"]
            isOneToOne: false
            referencedRelation: "park"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "park_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      profile: {
        Row: {
          id: string
          image_url: string | null
          name: string | null
        }
        Insert: {
          id: string
          image_url?: string | null
          name?: string | null
        }
        Update: {
          id?: string
          image_url?: string | null
          name?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          id: string
          park_id: number
          report_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          park_id: number
          report_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          park_id?: number
          report_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_park_id_fkey"
            columns: ["park_id"]
            isOneToOne: false
            referencedRelation: "park"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          id: number
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          id?: number
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          id?: number
          permission?: Database["public"]["Enums"]["app_permission"]
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: number
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: number
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: number
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_friend_request: {
        Args: {
          friend_user_1: string
          friend_user_2: string
          request_receiver_id: string
          request_sender_id: string
        }
        Returns: undefined
      }
      authorize: {
        Args: {
          requested_permission: Database["public"]["Enums"]["app_permission"]
        }
        Returns: boolean
      }
      auto_checkout_stale_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_in_user: {
        Args: { park_id_to_check_in: number }
        Returns: undefined
      }
      custom_access_token_hook: {
        Args: { event: Json }
        Returns: Json
      }
    }
    Enums: {
      app_permission: "reports.insert"
      app_role: "moderator"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_permission: ["reports.insert"],
      app_role: ["moderator"],
    },
  },
} as const
