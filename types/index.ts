export type Platform = 'facebook' | 'instagram' | 'linkedin'
export type PostFormat = 'quote' | 'reflective' | 'question' | 'announcement' | 'behind_scenes'
export type PostStatus = 'draft' | 'approved' | 'scheduled' | 'published' | 'failed'
export type Plan = 'free' | 'essential' | 'author'
export type ContentType = 'text' | 'image' | 'mixed'
export type ScheduleFrequency = 'daily' | '3x_week' | 'weekly'

export interface Profile {
  id: string
  full_name: string | null
  author_style: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan: Plan
  created_at: string
}

export interface SocialConnection {
  id: string
  user_id: string
  platform: Platform
  access_token: string
  page_id: string | null
  instagram_account_id: string | null
  expires_at: string | null
  created_at: string
}

export interface Content {
  id: string
  user_id: string
  type: ContentType
  raw_text: string | null
  image_url: string | null
  created_at: string
}

export interface Post {
  id: string
  user_id: string
  content_id: string | null
  platform: Platform
  format: PostFormat
  body: string
  status: PostStatus
  scheduled_at: string | null
  published_at: string | null
  meta_post_id: string | null
  created_at: string
}

export interface Schedule {
  id: string
  user_id: string
  platform: Platform
  frequency: ScheduleFrequency
  preferred_time: string
  is_active: boolean
  created_at: string
}

// API payloads
export interface GenerateRequest {
  contentId: string
  rawText?: string
  imageUrl?: string
  platforms: Platform[]
  authorStyle?: string
}

export interface GeneratedPost {
  platform: Platform
  format: PostFormat
  body: string
}

export interface GenerateResponse {
  posts: GeneratedPost[]
}
