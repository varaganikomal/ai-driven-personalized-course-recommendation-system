
-- Add extended profile fields for better personalization
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS learning_style TEXT DEFAULT 'visual';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_study_hours INTEGER DEFAULT 2;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'English';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_timeline TEXT DEFAULT '6 months';
