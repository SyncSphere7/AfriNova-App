-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type TEXT NOT NULL CHECK (alert_type IN ('error_rate', 'critical_error', 'slow_response', 'service_down', 'custom')),
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alert_rules table
CREATE TABLE IF NOT EXISTS alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('error_rate', 'critical_error', 'slow_response', 'service_down', 'custom')),
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
    enabled BOOLEAN DEFAULT true,
    conditions JSONB NOT NULL,
    channels TEXT[] DEFAULT ARRAY['email']::TEXT[],
    recipients TEXT[] DEFAULT ARRAY[]::TEXT[],
    cooldown_minutes INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for alerts
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX idx_alerts_alert_type ON alerts(alert_type);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_resolved ON alerts(resolved);
CREATE INDEX idx_alerts_unresolved ON alerts(created_at DESC) WHERE resolved = false;

-- Combined index for common queries
CREATE INDEX idx_alerts_type_severity_created ON alerts(alert_type, severity, created_at DESC);

-- Create indexes for alert_rules
CREATE INDEX idx_alert_rules_enabled ON alert_rules(enabled) WHERE enabled = true;
CREATE INDEX idx_alert_rules_alert_type ON alert_rules(alert_type);
CREATE INDEX idx_alert_rules_updated_at ON alert_rules(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can manage alerts
CREATE POLICY "Service role can manage alerts"
    ON alerts
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy: Admin users can view all alerts (when admin role is implemented)
-- CREATE POLICY "Admin users can view alerts"
--     ON alerts
--     FOR SELECT
--     TO authenticated
--     USING (
--         EXISTS (
--             SELECT 1 FROM profiles
--             WHERE profiles.id = auth.uid()
--             AND profiles.role = 'admin'
--         )
--     );

-- Policy: Service role can manage alert rules
CREATE POLICY "Service role can manage alert_rules"
    ON alert_rules
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy: Admin users can manage alert rules (when admin role is implemented)
-- CREATE POLICY "Admin users can manage alert_rules"
--     ON alert_rules
--     FOR ALL
--     TO authenticated
--     USING (
--         EXISTS (
--             SELECT 1 FROM profiles
--             WHERE profiles.id = auth.uid()
--             AND profiles.role = 'admin'
--         )
--     );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_alert_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER alert_rules_updated_at
    BEFORE UPDATE ON alert_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_alert_rules_updated_at();

-- Comments
COMMENT ON TABLE alerts IS 'Stores system alerts for monitoring critical issues';
COMMENT ON COLUMN alerts.alert_type IS 'Type of alert: error_rate, critical_error, slow_response, service_down, or custom';
COMMENT ON COLUMN alerts.severity IS 'Alert severity: critical, warning, or info';
COMMENT ON COLUMN alerts.metadata IS 'Additional context about the alert';
COMMENT ON COLUMN alerts.resolved IS 'Whether the alert has been resolved';

COMMENT ON TABLE alert_rules IS 'Defines rules for when alerts should be triggered';
COMMENT ON COLUMN alert_rules.conditions IS 'JSON object with threshold, timeWindowMinutes, and comparison';
COMMENT ON COLUMN alert_rules.channels IS 'Array of channels to send alerts to: email, slack, discord';
COMMENT ON COLUMN alert_rules.recipients IS 'Array of email addresses to notify';
COMMENT ON COLUMN alert_rules.cooldown_minutes IS 'Minimum time between alerts of this type';
