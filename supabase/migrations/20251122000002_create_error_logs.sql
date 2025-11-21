-- Create error_logs table for error tracking and monitoring
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  route TEXT,
  method TEXT,
  status_code INTEGER,
  request_body JSONB,
  user_agent TEXT,
  ip_address TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_error_logs_created ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_user ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_route ON error_logs(route);
CREATE INDEX IF NOT EXISTS idx_error_logs_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_combined ON error_logs(created_at DESC, error_type, route);

-- Enable RLS
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can manage all error logs
CREATE POLICY "Service role can manage error logs" 
  ON error_logs
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Policy: Users can view their own error logs (optional, for debugging)
CREATE POLICY "Users can view own error logs" 
  ON error_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE error_logs IS 'Centralized error logging for monitoring and debugging';
