/*
  # Create Comprehensive Integrations System

  1. New Tables
    - `integration_categories`: Categories for organizing integrations
    - `integrations`: All available integrations (160+)
    - `user_integrations`: User-connected integrations with encrypted credentials
    - `integration_webhooks`: Webhook configurations for integrations
    - `integration_logs`: Audit trail for all integration actions
    - `integration_rate_limits`: Rate limiting per user per integration

  2. Security
    - Row Level Security enabled on all tables
    - Encrypted credential storage using pgcrypto
    - Audit logging for compliance
    - Rate limiting enforcement
  
  3. Features
    - Support for OAuth and API key integrations
    - Webhook management with HMAC verification
    - Health monitoring
    - Usage tracking
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.integration_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.integration_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Integration categories are viewable by everyone"
  ON public.integration_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS public.integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.integration_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  provider text NOT NULL,
  description text,
  logo_url text,
  documentation_url text,
  website_url text,
  
  auth_type text NOT NULL CHECK (auth_type IN ('oauth', 'api_key', 'none', 'custom')),
  oauth_config jsonb DEFAULT '{}'::jsonb,
  config_schema jsonb DEFAULT '{}'::jsonb,
  
  tier_required text DEFAULT 'free' CHECK (tier_required IN ('free', 'starter', 'growth', 'pro', 'enterprise')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'beta', 'coming_soon', 'deprecated')),
  
  is_popular boolean DEFAULT false,
  is_recommended boolean DEFAULT false,
  region_focus text[],
  
  features text[],
  tags text[],
  
  setup_complexity text DEFAULT 'medium' CHECK (setup_complexity IN ('easy', 'medium', 'hard')),
  estimated_setup_time_minutes int DEFAULT 10,
  
  rate_limit_per_hour int DEFAULT 1000,
  rate_limit_per_day int DEFAULT 10000,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Integrations are viewable by authenticated users"
  ON public.integrations FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_integrations_category ON public.integrations(category_id);
CREATE INDEX IF NOT EXISTS idx_integrations_slug ON public.integrations(slug);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON public.integrations(status);
CREATE INDEX IF NOT EXISTS idx_integrations_tier ON public.integrations(tier_required);

CREATE TABLE IF NOT EXISTS public.user_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  integration_id uuid REFERENCES public.integrations(id) ON DELETE CASCADE NOT NULL,
  
  credentials_encrypted bytea,
  encryption_key_id text,
  
  config jsonb DEFAULT '{}'::jsonb,
  
  oauth_access_token text,
  oauth_refresh_token text,
  oauth_token_expires_at timestamptz,
  oauth_scope text[],
  
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'expired')),
  last_error text,
  last_error_at timestamptz,
  
  connected_at timestamptz DEFAULT now(),
  last_used_at timestamptz,
  last_synced_at timestamptz,
  
  usage_count int DEFAULT 0,
  
  metadata jsonb DEFAULT '{}'::jsonb,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, integration_id)
);

ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own integrations"
  ON public.user_integrations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integrations"
  ON public.user_integrations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations"
  ON public.user_integrations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations"
  ON public.user_integrations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_integrations_user ON public.user_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_integrations_integration ON public.user_integrations(integration_id);
CREATE INDEX IF NOT EXISTS idx_user_integrations_status ON public.user_integrations(status);

CREATE TABLE IF NOT EXISTS public.integration_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_integration_id uuid REFERENCES public.user_integrations(id) ON DELETE CASCADE NOT NULL,
  
  webhook_url text NOT NULL,
  webhook_secret text NOT NULL,
  
  events text[] NOT NULL,
  
  is_active boolean DEFAULT true,
  
  last_triggered_at timestamptz,
  success_count int DEFAULT 0,
  failure_count int DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.integration_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage webhooks for their integrations"
  ON public.integration_webhooks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_integrations ui
      WHERE ui.id = user_integration_id
      AND ui.user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS public.integration_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_integration_id uuid REFERENCES public.user_integrations(id) ON DELETE CASCADE NOT NULL,
  
  action text NOT NULL,
  status text NOT NULL CHECK (status IN ('success', 'error', 'warning')),
  
  request_data jsonb,
  response_data jsonb,
  
  error_message text,
  error_code text,
  
  duration_ms int,
  
  ip_address inet,
  user_agent text,
  
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view logs for their integrations"
  ON public.integration_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_integrations ui
      WHERE ui.id = user_integration_id
      AND ui.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_integration_logs_user_integration ON public.integration_logs(user_integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_created_at ON public.integration_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_integration_logs_status ON public.integration_logs(status);

CREATE TABLE IF NOT EXISTS public.integration_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_integration_id uuid REFERENCES public.user_integrations(id) ON DELETE CASCADE NOT NULL,
  
  window_start timestamptz NOT NULL,
  window_end timestamptz NOT NULL,
  
  request_count int DEFAULT 0,
  limit_per_window int NOT NULL,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_integration_id, window_start)
);

ALTER TABLE public.integration_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rate limits are system managed"
  ON public.integration_rate_limits FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_integrations ui
      WHERE ui.id = user_integration_id
      AND ui.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_rate_limits_user_integration ON public.integration_rate_limits(user_integration_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON public.integration_rate_limits(window_start, window_end);

CREATE OR REPLACE FUNCTION public.update_integration_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_integration_timestamp();

CREATE TRIGGER set_user_integrations_updated_at
  BEFORE UPDATE ON public.user_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_integration_timestamp();

CREATE TRIGGER set_integration_webhooks_updated_at
  BEFORE UPDATE ON public.integration_webhooks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_integration_timestamp();

COMMENT ON TABLE public.integrations IS 'Master catalog of all available integrations (160+)';
COMMENT ON TABLE public.user_integrations IS 'User-connected integrations with encrypted credentials';
COMMENT ON TABLE public.integration_logs IS 'Audit trail for compliance and debugging';
COMMENT ON TABLE public.integration_rate_limits IS 'Rate limiting enforcement per user per integration';
