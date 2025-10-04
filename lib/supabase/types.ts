export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      agent_apps: {
        Row: {
          api_key_hash: string | null;
          created_at: string;
          id: number;
          name: string | null;
        };
        Insert: {
          api_key_hash?: string | null;
          created_at?: string;
          id?: number;
          name?: string | null;
        };
        Update: {
          api_key_hash?: string | null;
          created_at?: string;
          id?: number;
          name?: string | null;
        };
        Relationships: [];
      };
      merchant_connectors: {
        Row: {
          capabilities: Json | null;
          created_at: string;
          credentials: Json | null;
          id: number;
          merchant_id: string | null;
          provider: Database["public"]["Enums"]["merchant_connector"] | null;
          status: Database["public"]["Enums"]["connector_status"] | null;
          updated_at: string | null;
        };
        Insert: {
          capabilities?: Json | null;
          created_at?: string;
          credentials?: Json | null;
          id?: number;
          merchant_id?: string | null;
          provider?: Database["public"]["Enums"]["merchant_connector"] | null;
          status?: Database["public"]["Enums"]["connector_status"] | null;
          updated_at?: string | null;
        };
        Update: {
          capabilities?: Json | null;
          created_at?: string;
          credentials?: Json | null;
          id?: number;
          merchant_id?: string | null;
          provider?: Database["public"]["Enums"]["merchant_connector"] | null;
          status?: Database["public"]["Enums"]["connector_status"] | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "merchant_connectors_merchant_id_fkey";
            columns: ["merchant_id"];
            isOneToOne: false;
            referencedRelation: "merchants";
            referencedColumns: ["id"];
          },
        ];
      };
      merchant_users: {
        Row: {
          created_at: string;
          email: string | null;
          id: number;
          merchant_id: string | null;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id?: number;
          merchant_id?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: number;
          merchant_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "merchant_users_merchant_id_fkey";
            columns: ["merchant_id"];
            isOneToOne: false;
            referencedRelation: "merchants";
            referencedColumns: ["id"];
          },
        ];
      };
      merchants: {
        Row: {
          created_at: string;
          id: string;
          name: string | null;
          slug: string | null;
          stripe_account_id: string | null;
          stripe_charges_enabled: boolean | null;
          stripe_onboarding_type: string | null;
          stripe_payouts_enabled: boolean | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name?: string | null;
          slug?: string | null;
          stripe_account_id?: string | null;
          stripe_charges_enabled?: boolean | null;
          stripe_onboarding_type?: string | null;
          stripe_payouts_enabled?: boolean | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string | null;
          slug?: string | null;
          stripe_account_id?: string | null;
          stripe_charges_enabled?: boolean | null;
          stripe_onboarding_type?: string | null;
          stripe_payouts_enabled?: boolean | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      connector_status: "connected" | "revoked";
      merchant_connector: "square" | "mindbody";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      connector_status: ["connected", "revoked"],
      merchant_connector: ["square", "mindbody"],
    },
  },
} as const;
