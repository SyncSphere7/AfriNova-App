/*
  # Fix Function Search Path Security Vulnerability (Correct Version)

  1. Problem
    - Functions with mutable search_path are vulnerable to schema injection attacks
    - Critical security vulnerability
  
  2. Solution
    - Drop and recreate functions with immutable search_path
    - Maintain correct function signatures (RETURNS trigger for trigger functions)
    - Set SECURITY DEFINER with safe search_path = public, pg_temp
  
  3. Security Impact
    - Prevents schema injection attacks
    - Production-ready security
*/

DROP FUNCTION IF EXISTS public.check_trial_status() CASCADE;
CREATE FUNCTION public.check_trial_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.trial_ends_at IS NOT NULL AND NEW.trial_ends_at < NOW() THEN
    NEW.subscription_tier := 'free';
    NEW.trial_ends_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
CREATE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS public.update_profile_limits() CASCADE;
CREATE FUNCTION public.update_profile_limits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.subscription_tier = 'free' THEN
    NEW.generations_limit = 5;
    NEW.projects_limit = 3;
  ELSIF NEW.subscription_tier = 'trial' THEN
    NEW.generations_limit = 10;
    NEW.projects_limit = 5;
  ELSIF NEW.subscription_tier = 'starter' THEN
    NEW.generations_limit = 50;
    NEW.projects_limit = 10;
  ELSIF NEW.subscription_tier = 'growth' THEN
    NEW.generations_limit = 200;
    NEW.projects_limit = 50;
  ELSIF NEW.subscription_tier = 'pro' THEN
    NEW.generations_limit = 1000;
    NEW.projects_limit = 200;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS public.update_integration_timestamp() CASCADE;
CREATE FUNCTION public.update_integration_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_trial_status_trigger ON public.profiles;
CREATE TRIGGER check_trial_status_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_trial_status();

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_profile_tier_limits ON public.profiles;
CREATE TRIGGER set_profile_tier_limits
  BEFORE INSERT OR UPDATE OF subscription_tier ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_limits();

DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_integrations_updated_at ON public.integrations;
CREATE TRIGGER set_integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_integration_timestamp();

DROP TRIGGER IF EXISTS set_user_integrations_updated_at ON public.user_integrations;
CREATE TRIGGER set_user_integrations_updated_at
  BEFORE UPDATE ON public.user_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_integration_timestamp();

DROP TRIGGER IF EXISTS set_integration_webhooks_updated_at ON public.integration_webhooks;
CREATE TRIGGER set_integration_webhooks_updated_at
  BEFORE UPDATE ON public.integration_webhooks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_integration_timestamp();

COMMENT ON FUNCTION public.check_trial_status IS 'Secure function with immutable search_path (public, pg_temp) to prevent schema injection attacks';
COMMENT ON FUNCTION public.handle_updated_at IS 'Secure trigger function with immutable search_path (public, pg_temp)';
COMMENT ON FUNCTION public.update_profile_limits IS 'Secure function with immutable search_path (public, pg_temp) for tier-based limits';
COMMENT ON FUNCTION public.update_integration_timestamp IS 'Secure trigger function with immutable search_path (public, pg_temp)';
