export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          company: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          company?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          company?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      test_ideas: {
        Row: {
          id: string
          user_id: string | null
          name: string
          impact: number
          confidence: number
          ease: number
          ice_score: number
          current_conversion_rate: number
          expected_improvement: number
          monthly_traffic: number
          status: 'planned' | 'running' | 'completed'
          test_duration: number | null
          actual_result: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          impact: number
          confidence: number
          ease: number
          ice_score?: number
          current_conversion_rate: number
          expected_improvement: number
          monthly_traffic: number
          status?: 'planned' | 'running' | 'completed'
          test_duration?: number | null
          actual_result?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          impact?: number
          confidence?: number
          ease?: number
          ice_score?: number
          current_conversion_rate?: number
          expected_improvement?: number
          monthly_traffic?: number
          status?: 'planned' | 'running' | 'completed'
          test_duration?: number | null
          actual_result?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_ideas_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_top_test_ideas: {
        Args: {
          user_uuid: string
          limit_count?: number
        }
        Returns: Database['public']['Tables']['test_ideas']['Row'][]
      }
      get_monthly_performance: {
        Args: {
          user_uuid: string
        }
        Returns: {
          month: string
          test_count: number
          avg_improvement: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

