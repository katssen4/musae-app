-- Migration : Simplifier les plans en un seul plan "musae"
-- À exécuter dans Supabase Dashboard > SQL Editor

-- Convertir les anciens plans vers "musae"
UPDATE public.profiles SET plan = 'musae' WHERE plan IN ('essential', 'author');

-- Mettre à jour la contrainte CHECK
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_check CHECK (plan IN ('free', 'musae'));
