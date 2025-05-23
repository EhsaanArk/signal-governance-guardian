export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      active_cooldowns: {
        Row: {
          end_reason: string | null
          ended_at: string | null
          ended_by: string | null
          expires_at: string
          id: string
          market: Database["public"]["Enums"]["market_type"]
          provider_id: string
          rule_set_id: string
          started_at: string
          status: Database["public"]["Enums"]["cooldown_status"]
          sub_rule_id: string
        }
        Insert: {
          end_reason?: string | null
          ended_at?: string | null
          ended_by?: string | null
          expires_at: string
          id?: string
          market: Database["public"]["Enums"]["market_type"]
          provider_id: string
          rule_set_id: string
          started_at?: string
          status?: Database["public"]["Enums"]["cooldown_status"]
          sub_rule_id: string
        }
        Update: {
          end_reason?: string | null
          ended_at?: string | null
          ended_by?: string | null
          expires_at?: string
          id?: string
          market?: Database["public"]["Enums"]["market_type"]
          provider_id?: string
          rule_set_id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["cooldown_status"]
          sub_rule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "active_cooldowns_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "signal_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_cooldowns_rule_set_id_fkey"
            columns: ["rule_set_id"]
            isOneToOne: false
            referencedRelation: "rule_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_cooldowns_sub_rule_id_fkey"
            columns: ["sub_rule_id"]
            isOneToOne: false
            referencedRelation: "sub_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      active_trades: {
        Row: {
          direction: string
          id: string
          market: Database["public"]["Enums"]["market_type"]
          metadata: Json | null
          opened_at: string
          provider_id: string
          symbol: string
        }
        Insert: {
          direction: string
          id?: string
          market: Database["public"]["Enums"]["market_type"]
          metadata?: Json | null
          opened_at?: string
          provider_id: string
          symbol: string
        }
        Update: {
          direction?: string
          id?: string
          market?: Database["public"]["Enums"]["market_type"]
          metadata?: Json | null
          opened_at?: string
          provider_id?: string
          symbol?: string
        }
        Relationships: [
          {
            foreignKeyName: "active_trades_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "signal_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      breach_events: {
        Row: {
          action_taken: Database["public"]["Enums"]["breach_action"]
          details: Json
          id: string
          market: Database["public"]["Enums"]["market_type"]
          occurred_at: string
          provider_id: string
          rule_set_id: string
          signal_data: Json | null
          sub_rule_id: string
        }
        Insert: {
          action_taken: Database["public"]["Enums"]["breach_action"]
          details?: Json
          id?: string
          market: Database["public"]["Enums"]["market_type"]
          occurred_at?: string
          provider_id: string
          rule_set_id: string
          signal_data?: Json | null
          sub_rule_id: string
        }
        Update: {
          action_taken?: Database["public"]["Enums"]["breach_action"]
          details?: Json
          id?: string
          market?: Database["public"]["Enums"]["market_type"]
          occurred_at?: string
          provider_id?: string
          rule_set_id?: string
          signal_data?: Json | null
          sub_rule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "breach_events_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "signal_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "breach_events_rule_set_id_fkey"
            columns: ["rule_set_id"]
            isOneToOne: false
            referencedRelation: "rule_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "breach_events_sub_rule_id_fkey"
            columns: ["sub_rule_id"]
            isOneToOne: false
            referencedRelation: "sub_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_statistics: {
        Row: {
          cancellations_in_pip_band: number
          current_active_trades: number
          current_trade_cap: number
          id: string
          market: Database["public"]["Enums"]["market_type"]
          profitable_closes: number
          provider_id: string
          sl_count: number
          stat_date: string
          updated_at: string
        }
        Insert: {
          cancellations_in_pip_band?: number
          current_active_trades?: number
          current_trade_cap?: number
          id?: string
          market: Database["public"]["Enums"]["market_type"]
          profitable_closes?: number
          provider_id: string
          sl_count?: number
          stat_date?: string
          updated_at?: string
        }
        Update: {
          cancellations_in_pip_band?: number
          current_active_trades?: number
          current_trade_cap?: number
          id?: string
          market?: Database["public"]["Enums"]["market_type"]
          profitable_closes?: number
          provider_id?: string
          sl_count?: number
          stat_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_statistics_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "signal_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      rule_sets: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          markets: Database["public"]["Enums"]["market_type"][]
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          markets?: Database["public"]["Enums"]["market_type"][]
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          markets?: Database["public"]["Enums"]["market_type"][]
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      signal_providers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          metadata: Json | null
          provider_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          provider_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          provider_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      sub_rules: {
        Row: {
          configuration: Json
          created_at: string
          id: string
          is_enabled: boolean
          rule_set_id: string
          rule_type: Database["public"]["Enums"]["rule_type"]
          updated_at: string
        }
        Insert: {
          configuration?: Json
          created_at?: string
          id?: string
          is_enabled?: boolean
          rule_set_id: string
          rule_type: Database["public"]["Enums"]["rule_type"]
          updated_at?: string
        }
        Update: {
          configuration?: Json
          created_at?: string
          id?: string
          is_enabled?: boolean
          rule_set_id?: string
          rule_type?: Database["public"]["Enums"]["rule_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_rules_rule_set_id_fkey"
            columns: ["rule_set_id"]
            isOneToOne: false
            referencedRelation: "rule_sets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      breach_action:
        | "signal_rejected"
        | "cooldown_triggered"
        | "suspension_applied"
      cooldown_status: "active" | "ended_manually" | "expired"
      market_type: "Forex" | "Crypto" | "Indices"
      rule_type:
        | "cooling_off"
        | "same_direction_guard"
        | "max_active_trades"
        | "positive_pip_cancel_limit"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      breach_action: [
        "signal_rejected",
        "cooldown_triggered",
        "suspension_applied",
      ],
      cooldown_status: ["active", "ended_manually", "expired"],
      market_type: ["Forex", "Crypto", "Indices"],
      rule_type: [
        "cooling_off",
        "same_direction_guard",
        "max_active_trades",
        "positive_pip_cancel_limit",
      ],
    },
  },
} as const
