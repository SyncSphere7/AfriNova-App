-- Create performance_metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type TEXT NOT NULL CHECK (metric_type IN ('api_response', 'database_query', 'generation', 'external_api')),
    route TEXT,
    method TEXT,
    duration_ms INTEGER NOT NULL,
    status_code INTEGER,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_performance_metrics_created_at ON performance_metrics(created_at DESC);
CREATE INDEX idx_performance_metrics_metric_type ON performance_metrics(metric_type);
CREATE INDEX idx_performance_metrics_route ON performance_metrics(route) WHERE route IS NOT NULL;
CREATE INDEX idx_performance_metrics_user_id ON performance_metrics(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_performance_metrics_duration ON performance_metrics(duration_ms DESC);

-- Combined index for common queries
CREATE INDEX idx_performance_metrics_type_created ON performance_metrics(metric_type, created_at DESC);
CREATE INDEX idx_performance_metrics_route_created ON performance_metrics(route, created_at DESC) WHERE route IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do anything
CREATE POLICY "Service role can manage performance metrics"
    ON performance_metrics
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy: Users can view their own performance metrics
CREATE POLICY "Users can view their own performance metrics"
    ON performance_metrics
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Policy: Admin users can view all performance metrics (add when admin role is implemented)
-- CREATE POLICY "Admin users can view all performance metrics"
--     ON performance_metrics
--     FOR SELECT
--     TO authenticated
--     USING (
--         EXISTS (
--             SELECT 1 FROM profiles
--             WHERE profiles.id = auth.uid()
--             AND profiles.role = 'admin'
--         )
--     );

-- Comments
COMMENT ON TABLE performance_metrics IS 'Stores performance metrics for API responses, database queries, and other operations';
COMMENT ON COLUMN performance_metrics.metric_type IS 'Type of metric: api_response, database_query, generation, or external_api';
COMMENT ON COLUMN performance_metrics.route IS 'API route or operation identifier';
COMMENT ON COLUMN performance_metrics.method IS 'HTTP method (GET, POST, etc.) for API metrics';
COMMENT ON COLUMN performance_metrics.duration_ms IS 'Duration of the operation in milliseconds';
COMMENT ON COLUMN performance_metrics.status_code IS 'HTTP status code for API metrics';
COMMENT ON COLUMN performance_metrics.metadata IS 'Additional context about the operation';
