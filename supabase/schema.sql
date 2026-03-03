-- ============================================================
-- MUSAE — Schéma base de données Supabase
-- À exécuter dans l'éditeur SQL de Supabase (SQL Editor)
-- ============================================================

-- ============================================================
-- 1. TABLE PROFILES
-- Extension de auth.users avec les données auteur
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  author_style TEXT,            -- Description du style littéraire pour le prompt IA
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'essential', 'author')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 2. TABLE SOCIAL_CONNECTIONS
-- Tokens OAuth Facebook / Instagram
-- ============================================================
CREATE TABLE IF NOT EXISTS public.social_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'linkedin')),
  access_token TEXT NOT NULL,   -- Stocker chiffré en production
  page_id TEXT,                 -- Pour Facebook Pages
  instagram_account_id TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 3. TABLE CONTENTS
-- Textes et images déposés par l'auteur
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'image', 'mixed')),
  raw_text TEXT,
  image_url TEXT,               -- URL Supabase Storage
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT content_has_data CHECK (raw_text IS NOT NULL OR image_url IS NOT NULL)
);

-- ============================================================
-- 4. TABLE POSTS
-- Posts générés par l'IA
-- ============================================================
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES public.contents(id) ON DELETE SET NULL,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'linkedin')),
  format TEXT NOT NULL CHECK (format IN ('quote', 'reflective', 'question', 'announcement', 'behind_scenes')),
  body TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'scheduled', 'published', 'failed')),
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  meta_post_id TEXT,            -- ID retourné par Meta Graph API après publication
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 5. TABLE SCHEDULES
-- Configuration du planning de publication automatique
-- ============================================================
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'linkedin')),
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', '3x_week', 'weekly')),
  preferred_time TIME NOT NULL DEFAULT '09:00',
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, platform)    -- Un seul planning par plateforme par utilisateur
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Chaque utilisateur ne voit que ses propres données
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Profiles : lecture et mise à jour de son propre profil
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Social connections : CRUD sur ses propres connexions
CREATE POLICY "social_connections_all_own" ON public.social_connections
  FOR ALL USING (auth.uid() = user_id);

-- Contents : CRUD sur ses propres contenus
CREATE POLICY "contents_all_own" ON public.contents
  FOR ALL USING (auth.uid() = user_id);

-- Posts : CRUD sur ses propres posts
CREATE POLICY "posts_all_own" ON public.posts
  FOR ALL USING (auth.uid() = user_id);

-- Schedules : CRUD sur ses propres plannings
CREATE POLICY "schedules_all_own" ON public.schedules
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGER : Création automatique du profil après inscription
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- INDEX pour les performances
-- ============================================================
CREATE INDEX IF NOT EXISTS posts_user_id_status_idx ON public.posts (user_id, status);
CREATE INDEX IF NOT EXISTS posts_scheduled_at_idx ON public.posts (scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS contents_user_id_idx ON public.contents (user_id);
CREATE INDEX IF NOT EXISTS social_connections_user_id_idx ON public.social_connections (user_id);

-- ============================================================
-- STORAGE : Bucket pour les images uploadées par les auteurs
-- À configurer dans Supabase Dashboard > Storage
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('content-images', 'content-images', false);
-- CREATE POLICY "content_images_user_own" ON storage.objects
--   FOR ALL USING (auth.uid()::text = (storage.foldername(name))[1]);
