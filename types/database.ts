// Auto-generated types for Supabase tables
// After creating the schema, run: npx supabase gen types typescript --linked > types/database.ts

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
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
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
