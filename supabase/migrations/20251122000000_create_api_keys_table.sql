-- Create API Keys table for programmatic access
-- Migration: 20251122000000_create_api_keys_table.sql

-- API Keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- API Key details
  key_hash TEXT NOT NULL UNIQUE, -- bcrypt hash of the actual key
  key_prefix TEXT NOT NULL, -- First 8 chars for display (e.g., "afn_abc1")
  name TEXT NOT NULL, -- User-friendly name for the key
  
  -- Usage tracking
  credits_allocated INTEGER DEFAULT 0, -- Credits allocated to this key
  credits_used INTEGER DEFAULT 0, -- Credits consumed
  total_requests INTEGER DEFAULT 0, -- Total API calls made
  last_used_at TIMESTAMPTZ, -- Last time the key was used
  
  -- Rate limiting
  rate_limit_per_minute INTEGER DEFAULT 10, -- Requests per minute allowed
  requests_this_minute INTEGER DEFAULT 0, -- Current minute's request count
  rate_limit_reset_at TIMESTAMPTZ DEFAULT NOW(), -- When to reset the counter
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Optional expiration date
  
  -- IP restrictions (optional)
  allowed_ips TEXT[], -- Whitelist of IPs (NULL = all IPs allowed)
  
  -- Environment
  environment TEXT DEFAULT 'production' CHECK (environment IN ('sandbox', 'production'))
);

-- Indexes for performance
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_keys_status ON public.api_keys(status);
CREATE INDEX idx_api_keys_last_used ON public.api_keys(last_used_at DESC);

-- API Usage tracking table (detailed logs)
CREATE TABLE IF NOT EXISTS public.api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Request details
  endpoint TEXT NOT NULL, -- e.g., "/api/v1/generate"
  method TEXT NOT NULL, -- GET, POST, etc.
  status_code INTEGER NOT NULL, -- HTTP status code
  
  -- Usage metrics
  credits_consumed INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  generation_time_ms INTEGER, -- Time taken to generate
  
  -- Request metadata
  prompt_length INTEGER, -- Length of user's prompt
  lines_of_code_generated INTEGER, -- Output size
  project_type TEXT, -- component, page, feature, project
  
  -- Error tracking
  error_message TEXT,
  error_code TEXT,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX idx_api_usage_api_key_id ON public.api_usage(api_key_id);
CREATE INDEX idx_api_usage_user_id ON public.api_usage(user_id);
CREATE INDEX idx_api_usage_created_at ON public.api_usage(created_at DESC);
CREATE INDEX idx_api_usage_status_code ON public.api_usage(status_code);

-- RLS Policies for api_keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Users can view their own API keys
CREATE POLICY "Users can view own API keys"
  ON public.api_keys
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own API keys
CREATE POLICY "Users can create own API keys"
  ON public.api_keys
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own API keys (revoke, rename)
CREATE POLICY "Users can update own API keys"
  ON public.api_keys
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own API keys
CREATE POLICY "Users can delete own API keys"
  ON public.api_keys
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for api_usage
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own API usage
CREATE POLICY "Users can view own API usage"
  ON public.api_usage
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert usage records
CREATE POLICY "Service role can insert usage"
  ON public.api_usage
  FOR INSERT
  WITH CHECK (true); -- Service role bypasses RLS anyway

-- Function to update api_keys updated_at timestamp
CREATE OR REPLACE FUNCTION update_api_keys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_api_keys_updated_at();

-- Function to automatically reset rate limit counter
CREATE OR REPLACE FUNCTION reset_rate_limit_if_needed()
RETURNS TRIGGER AS $$
BEGIN
  -- If more than 1 minute has passed, reset the counter
  IF NEW.rate_limit_reset_at < NOW() - INTERVAL '1 minute' THEN
    NEW.requests_this_minute = 0;
    NEW.rate_limit_reset_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reset_rate_limit
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION reset_rate_limit_if_needed();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_keys TO authenticated;
GRANT SELECT ON public.api_usage TO authenticated;
GRANT ALL ON public.api_usage TO service_role;

-- Comments for documentation
COMMENT ON TABLE public.api_keys IS 'Stores user API keys for programmatic access with usage tracking and rate limiting';
COMMENT ON TABLE public.api_usage IS 'Detailed logs of all API requests for analytics and billing';
COMMENT ON COLUMN public.api_keys.key_hash IS 'bcrypt hash of the actual API key for security';
COMMENT ON COLUMN public.api_keys.key_prefix IS 'First 8 characters of key for display (e.g., afn_abc1...)';
COMMENT ON COLUMN public.api_keys.credits_allocated IS 'Total credits allocated to this key (from subscription or purchase)';
COMMENT ON COLUMN public.api_keys.rate_limit_per_minute IS 'Maximum requests allowed per minute (10-500 depending on plan)';
