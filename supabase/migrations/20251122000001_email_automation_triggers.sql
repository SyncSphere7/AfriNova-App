-- Email Automation Triggers
-- Automatically queue emails for important events

-- Function to queue email via HTTP request to our API
CREATE OR REPLACE FUNCTION queue_email_via_api(
  p_user_id UUID,
  p_email_type TEXT,
  p_recipient TEXT,
  p_data JSONB
)
RETURNS VOID AS $$
DECLARE
  v_subject TEXT;
  v_html TEXT;
  v_text TEXT;
BEGIN
  -- For now, just insert into queue table
  -- The cron job will process it
  INSERT INTO email_queue (
    user_id,
    email_type,
    recipient,
    subject,
    html_content,
    text_content,
    status,
    attempts
  ) VALUES (
    p_user_id,
    p_email_type,
    p_recipient,
    'Email notification from AfriNova', -- Generic subject, will be replaced by template
    p_data::text, -- Store data as JSON for processing
    '',
    'pending',
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Send usage warning when reaching 80% of generation limit
CREATE OR REPLACE FUNCTION check_usage_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_email TEXT;
  v_full_name TEXT;
  v_percentage NUMERIC;
BEGIN
  -- Calculate usage percentage
  v_percentage := (NEW.generations_used::NUMERIC / NULLIF(NEW.generations_limit, 0)::NUMERIC) * 100;
  
  -- Send warning at 80% and 95%
  IF v_percentage >= 80 AND v_percentage < 95 
     AND (OLD.generations_used::NUMERIC / NULLIF(OLD.generations_limit, 0)::NUMERIC) * 100 < 80 THEN
    
    -- Get user email
    SELECT email INTO v_email 
    FROM auth.users 
    WHERE id = NEW.user_id;
    
    -- Get user name
    SELECT full_name INTO v_full_name 
    FROM profiles 
    WHERE id = NEW.user_id;
    
    -- Queue email
    INSERT INTO email_queue (user_id, email_type, recipient, subject, html_content, status)
    VALUES (
      NEW.user_id,
      'usage_warning_80',
      v_email,
      '⚠️ You''ve used 80% of your generation limit',
      jsonb_build_object(
        'full_name', COALESCE(v_full_name, 'there'),
        'percentage', 80,
        'used', NEW.generations_used,
        'limit', NEW.generations_limit
      )::text,
      'pending'
    );
  ELSIF v_percentage >= 95 
        AND (OLD.generations_used::NUMERIC / NULLIF(OLD.generations_limit, 0)::NUMERIC) * 100 < 95 THEN
    
    SELECT email INTO v_email FROM auth.users WHERE id = NEW.user_id;
    SELECT full_name INTO v_full_name FROM profiles WHERE id = NEW.user_id;
    
    INSERT INTO email_queue (user_id, email_type, recipient, subject, html_content, status)
    VALUES (
      NEW.user_id,
      'usage_warning_95',
      v_email,
      '🚨 You''ve used 95% of your generation limit!',
      jsonb_build_object(
        'full_name', COALESCE(v_full_name, 'there'),
        'percentage', 95,
        'used', NEW.generations_used,
        'limit', NEW.generations_limit
      )::text,
      'pending'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_usage_limit
  AFTER UPDATE OF generations_used ON subscriptions
  FOR EACH ROW
  WHEN (NEW.generations_used IS DISTINCT FROM OLD.generations_used)
  EXECUTE FUNCTION check_usage_limit();

-- Trigger: Send email when project generation completes
CREATE OR REPLACE FUNCTION notify_generation_complete()
RETURNS TRIGGER AS $$
DECLARE
  v_email TEXT;
  v_full_name TEXT;
BEGIN
  -- Only trigger when status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    
    -- Get user email
    SELECT email INTO v_email 
    FROM auth.users 
    WHERE id = NEW.user_id;
    
    -- Get user name
    SELECT full_name INTO v_full_name 
    FROM profiles 
    WHERE id = NEW.user_id;
    
    -- Queue email
    INSERT INTO email_queue (user_id, email_type, recipient, subject, html_content, status)
    VALUES (
      NEW.user_id,
      'generation_complete',
      v_email,
      '✅ Your project is ready!',
      jsonb_build_object(
        'full_name', COALESCE(v_full_name, 'there'),
        'project_name', NEW.name,
        'project_id', NEW.id,
        'files_count', COALESCE(jsonb_array_length(NEW.generated_files), 0)
      )::text,
      'pending'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_generation_complete
  AFTER UPDATE OF status ON projects
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_generation_complete();

-- Trigger: Send email when trial is ending soon (7 days, 3 days, 1 day)
CREATE OR REPLACE FUNCTION check_trial_ending()
RETURNS VOID AS $$
DECLARE
  v_subscription RECORD;
  v_email TEXT;
  v_full_name TEXT;
  v_days_remaining INTEGER;
BEGIN
  -- Check for trials ending in 7 days, 3 days, or 1 day
  FOR v_subscription IN 
    SELECT * FROM subscriptions 
    WHERE status = 'trialing'
    AND trial_ends_at IS NOT NULL
    AND trial_ends_at > NOW()
    AND trial_ends_at <= NOW() + INTERVAL '7 days'
  LOOP
    v_days_remaining := EXTRACT(DAY FROM v_subscription.trial_ends_at - NOW())::INTEGER;
    
    -- Only send at 7, 3, and 1 day marks
    IF v_days_remaining IN (7, 3, 1) THEN
      SELECT email INTO v_email FROM auth.users WHERE id = v_subscription.user_id;
      SELECT full_name INTO v_full_name FROM profiles WHERE id = v_subscription.user_id;
      
      -- Check if we already sent this notification
      IF NOT EXISTS (
        SELECT 1 FROM email_queue 
        WHERE user_id = v_subscription.user_id 
        AND email_type = 'trial_ending_' || v_days_remaining
        AND created_at > NOW() - INTERVAL '1 day'
      ) THEN
        INSERT INTO email_queue (user_id, email_type, recipient, subject, html_content, status)
        VALUES (
          v_subscription.user_id,
          'trial_ending_' || v_days_remaining,
          v_email,
          '⏰ Your trial ends in ' || v_days_remaining || ' day(s)',
          jsonb_build_object(
            'full_name', COALESCE(v_full_name, 'there'),
            'days_remaining', v_days_remaining,
            'plan', v_subscription.tier
          )::text,
          'pending'
        );
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- This function should be called by a cron job daily
-- We'll create an API endpoint for this

-- Trigger: Send email when API key is created
CREATE OR REPLACE FUNCTION notify_api_key_created()
RETURNS TRIGGER AS $$
DECLARE
  v_email TEXT;
  v_full_name TEXT;
BEGIN
  -- Get user email
  SELECT email INTO v_email 
  FROM auth.users 
  WHERE id = NEW.user_id;
  
  -- Get user name
  SELECT full_name INTO v_full_name 
  FROM profiles 
  WHERE id = NEW.user_id;
  
  -- Queue email
  INSERT INTO email_queue (user_id, email_type, recipient, subject, html_content, status)
  VALUES (
    NEW.user_id,
    'api_key_created',
    v_email,
    '🔑 New API Key Created',
    jsonb_build_object(
      'full_name', COALESCE(v_full_name, 'there'),
      'key_name', NEW.name,
      'environment', NEW.environment
    )::text,
    'pending'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_api_key_created
  AFTER INSERT ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION notify_api_key_created();

-- Trigger: Send email when subscription is cancelled
CREATE OR REPLACE FUNCTION notify_subscription_cancelled()
RETURNS TRIGGER AS $$
DECLARE
  v_email TEXT;
  v_full_name TEXT;
BEGIN
  -- Only trigger when status changes to 'cancelled'
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    
    -- Get user email
    SELECT email INTO v_email 
    FROM auth.users 
    WHERE id = NEW.user_id;
    
    -- Get user name
    SELECT full_name INTO v_full_name 
    FROM profiles 
    WHERE id = NEW.user_id;
    
    -- Queue email
    INSERT INTO email_queue (user_id, email_type, recipient, subject, html_content, status)
    VALUES (
      NEW.user_id,
      'subscription_cancelled',
      v_email,
      'Subscription Cancelled',
      jsonb_build_object(
        'full_name', COALESCE(v_full_name, 'there'),
        'plan', NEW.tier,
        'end_date', NEW.current_period_end
      )::text,
      'pending'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_subscription_cancelled
  AFTER UPDATE OF status ON subscriptions
  FOR EACH ROW
  WHEN (NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_subscription_cancelled();

-- Add comments
COMMENT ON FUNCTION queue_email_via_api IS 'Queue an email for delivery via background worker';
COMMENT ON FUNCTION check_usage_limit IS 'Send warning emails when user approaches generation limit';
COMMENT ON FUNCTION notify_generation_complete IS 'Send email when project generation completes';
COMMENT ON FUNCTION check_trial_ending IS 'Check for trials ending soon and send reminder emails';
COMMENT ON FUNCTION notify_api_key_created IS 'Send security alert when new API key is created';
COMMENT ON FUNCTION notify_subscription_cancelled IS 'Send confirmation email when subscription is cancelled';
