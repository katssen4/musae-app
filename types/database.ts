// Types Supabase — format exact compatible supabase-js 2.x / postgrest-js 2.x
// Les sections vides utilisent { [_ in never]: never } et non Record<string, never>

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          author_style: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: string
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          author_style?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: string
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          author_style?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: string
          created_at?: string
        }
        Relationships: []
      }
      social_connections: {
        Row: {
          id: string
          user_id: string
          platform: string
          access_token: string
          page_id: string | null
          instagram_account_id: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: string
          access_token: string
          page_id?: string | null
          instagram_account_id?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: string
          access_token?: string
          page_id?: string | null
          instagram_account_id?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      contents: {
        Row: {
          id: string
          user_id: string
          type: string
          raw_text: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          raw_text?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          raw_text?: string | null
          image_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content_id: string | null
          platform: string
          format: string
          body: string
          status: string
          scheduled_at: string | null
          published_at: string | null
          meta_post_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content_id?: string | null
          platform: string
          format: string
          body: string
          status?: string
          scheduled_at?: string | null
          published_at?: string | null
          meta_post_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content_id?: string | null
          platform?: string
          format?: string
          body?: string
          status?: string
          scheduled_at?: string | null
          published_at?: string | null
          meta_post_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      schedules: {
        Row: {
          id: string
          user_id: string
          platform: string
          frequency: string
          preferred_time: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: string
          frequency: string
          preferred_time?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: string
          frequency?: string
          preferred_time?: string
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
