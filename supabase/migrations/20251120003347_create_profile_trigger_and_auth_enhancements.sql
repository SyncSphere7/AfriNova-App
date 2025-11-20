/*
  # Auth Enhancements - Profile Auto-Creation & Email Verification

  1. Changes
    - Create trigger function to auto-create profile on user signup
    - Add trigger to execute function on auth.users insert
    - Add function to handle user deletion (cascade to profiles)
    
  2. Security
    - Maintains RLS policies
    - Uses security definer for trigger functions
    - Handles edge cases (duplicate inserts, null values)

  3. Notes
    - Profile is created automatically when user signs up
    - Full name is extracted from user metadata
    - Default subscription tier is 'free' with 5 generations
    - Trigger handles both email/password and OAuth signups
*/

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    subscription_tier,
    generations_used,
    generations_limit,
    project_limit,
    team_seats,
    billing_cycle,
    usage_warning_sent
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'free',
    0,
    5,
    3,
    1,
    'monthly',
    false
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to handle user deletion (cascade to profiles)
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.profiles WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

-- Create trigger for user deletion
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_delete();

-- Add index for faster profile lookups
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier 
  ON public.profiles(subscription_tier);

CREATE INDEX IF NOT EXISTS idx_profiles_created_at 
  ON public.profiles(created_at);
