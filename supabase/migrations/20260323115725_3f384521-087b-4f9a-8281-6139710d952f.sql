ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS institution text,
ADD COLUMN IF NOT EXISTS source_platform text,
ADD COLUMN IF NOT EXISTS source_url text,
ADD COLUMN IF NOT EXISTS external_rating numeric DEFAULT 0;