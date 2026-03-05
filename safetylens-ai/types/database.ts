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
          email: string
          full_name: string | null
          company: string | null
          role: string | null
          avatar_url: string | null
          stripe_customer_id: string | null
          plan: 'free_trial' | 'starter' | 'professional' | 'coach' | 'enterprise'
          plan_status: 'trialing' | 'active' | 'past_due' | 'canceled'
          trial_ends_at: string | null
          walks_used_this_month: number
          walks_reset_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company?: string | null
          role?: string | null
          avatar_url?: string | null
          stripe_customer_id?: string | null
          plan?: string
          plan_status?: string
          trial_ends_at?: string | null
          walks_used_this_month?: number
          walks_reset_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company?: string | null
          role?: string | null
          avatar_url?: string | null
          stripe_customer_id?: string | null
          plan?: string
          plan_status?: string
          trial_ends_at?: string | null
          walks_used_this_month?: number
          walks_reset_at?: string | null
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          location: string | null
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          location?: string | null
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          location?: string | null
          description?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      audits: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          audit_type: 'analyze' | 'coach'
          inspector_name: string | null
          audit_date: string
          status: 'draft' | 'completed'
          total_observations: number
          compliant_count: number
          non_compliant_count: number
          critical_count: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          audit_type?: string
          inspector_name?: string | null
          audit_date?: string
          status?: string
          total_observations?: number
          compliant_count?: number
          non_compliant_count?: number
          critical_count?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          project_id?: string | null
          audit_type?: string
          inspector_name?: string | null
          audit_date?: string
          status?: string
          total_observations?: number
          compliant_count?: number
          non_compliant_count?: number
          critical_count?: number
          notes?: string | null
          updated_at?: string
        }
      }
      observations: {
        Row: {
          id: string
          audit_id: string
          user_id: string
          sort_order: number
          compliance: 'compliant' | 'non_compliant'
          category: string
          osha_standard: string | null
          osha_description: string | null
          narrative: string | null
          severity: 'Low' | 'Medium' | 'High' | 'Critical'
          corrective_action: string | null
          inspection_items: string[] | null
          compliant_narrative: string | null
          compliant_corrective_action: string | null
          non_compliant_narrative: string | null
          non_compliant_corrective_action: string | null
          severity_if_compliant: string | null
          severity_if_non_compliant: string | null
          photo_url: string | null
          photo_thumbnail_url: string | null
          original_filename: string | null
          source: 'analyze' | 'coach'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          audit_id: string
          user_id: string
          sort_order?: number
          compliance?: string
          category: string
          osha_standard?: string | null
          osha_description?: string | null
          narrative?: string | null
          severity?: string
          corrective_action?: string | null
          inspection_items?: string[] | null
          compliant_narrative?: string | null
          compliant_corrective_action?: string | null
          non_compliant_narrative?: string | null
          non_compliant_corrective_action?: string | null
          severity_if_compliant?: string | null
          severity_if_non_compliant?: string | null
          photo_url?: string | null
          photo_thumbnail_url?: string | null
          original_filename?: string | null
          source?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          sort_order?: number
          compliance?: string
          category?: string
          osha_standard?: string | null
          osha_description?: string | null
          narrative?: string | null
          severity?: string
          corrective_action?: string | null
          inspection_items?: string[] | null
          compliant_narrative?: string | null
          compliant_corrective_action?: string | null
          non_compliant_narrative?: string | null
          non_compliant_corrective_action?: string | null
          severity_if_compliant?: string | null
          severity_if_non_compliant?: string | null
          photo_url?: string | null
          photo_thumbnail_url?: string | null
          original_filename?: string | null
          updated_at?: string
        }
      }
      coach_sessions: {
        Row: {
          id: string
          audit_id: string
          user_id: string
          messages: Json
          area: string | null
          trades_active: string[] | null
          started_at: string
          ended_at: string | null
        }
        Insert: {
          id?: string
          audit_id: string
          user_id: string
          messages?: Json
          area?: string | null
          trades_active?: string[] | null
          started_at?: string
          ended_at?: string | null
        }
        Update: {
          messages?: Json
          area?: string | null
          trades_active?: string[] | null
          ended_at?: string | null
        }
      }
      usage_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          audit_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          audit_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          action?: string
          metadata?: Json | null
        }
      }
    }
  }
}
