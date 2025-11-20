/*
  # Add Language Preference Support

  1. Changes
    - Add preferred_language column to profiles table
    - Set default to 'en' (English)
    - Add index for faster lookups
  
  2. Notes
    - Supports 20 languages in Tier 1 launch
    - Users can change language in settings
    - Language preference syncs across devices
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'preferred_language'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN preferred_language text DEFAULT 'en' NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_preferred_language 
  ON public.profiles(preferred_language);

COMMENT ON COLUMN public.profiles.preferred_language IS 'User preferred language code (ISO 639-1). Supports 20 languages: en, es, zh, hi, pt, fr, de, ja, ko, ru, id, th, vi, tl, it, nl, pl, tr, sw, ar';
