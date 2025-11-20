/*
  # Update Subscription Tiers V2

  ## Overview
  Updates the subscription system to support the new pricing structure with Free, Starter, Growth, and Pro tiers.
  Adds annual billing, free trials, and enhanced usage tracking.

  ## Changes

  ### 1. Profiles Table Updates
  - Add `trial_ends_at` for 14-day free trials
  - Add `billing_cycle` for monthly/annual options
  - Add `team_seats` for team sharing limits
  - Add `project_limit` for per-tier project caps
  - Add `usage_warning_sent` for 80% warning emails

  ### 2. Subscriptions Table Updates
  - Add `billing_cycle` (monthly/annual)
  - Add `trial_ends_at` timestamp
  - Add `original_price` and `discount_amount`

  ### 3. New Subscription Plans
  - Free: $0, 5 generations, 3 projects
  - Starter: $15/mo ($12 annual), 30 generations, 15 projects
  - Growth: $35/mo ($28 annual), 100 generations, 50 projects
  - Pro: $75/mo ($60 annual), 300 generations, unlimited projects

  ## Security
  - All existing RLS policies remain in place
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'trial_ends_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trial_ends_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'billing_cycle'
  ) THEN
    ALTER TABLE profiles ADD COLUMN billing_cycle text DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'team_seats'
  ) THEN
    ALTER TABLE profiles ADD COLUMN team_seats int DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'project_limit'
  ) THEN
    ALTER TABLE profiles ADD COLUMN project_limit int DEFAULT 3;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'usage_warning_sent'
  ) THEN
    ALTER TABLE profiles ADD COLUMN usage_warning_sent boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'billing_cycle'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN billing_cycle text DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'trial_ends_at'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN trial_ends_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'original_price'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN original_price numeric(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'discount_amount'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN discount_amount numeric(10,2) DEFAULT 0;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION update_profile_limits()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.subscription_tier = 'free' THEN
    NEW.generations_limit := 5;
    NEW.project_limit := 3;
    NEW.team_seats := 1;
  ELSIF NEW.subscription_tier = 'starter' THEN
    NEW.generations_limit := 30;
    NEW.project_limit := 15;
    NEW.team_seats := 1;
  ELSIF NEW.subscription_tier = 'growth' THEN
    NEW.generations_limit := 100;
    NEW.project_limit := 50;
    NEW.team_seats := 3;
  ELSIF NEW.subscription_tier = 'pro' THEN
    NEW.generations_limit := 300;
    NEW.project_limit := 999999;
    NEW.team_seats := 10;
  END IF;

  IF NEW.generations_used < (NEW.generations_limit * 0.8) THEN
    NEW.usage_warning_sent := false;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profile_limits_trigger ON profiles;
CREATE TRIGGER update_profile_limits_trigger
  BEFORE INSERT OR UPDATE OF subscription_tier ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_limits();

CREATE OR REPLACE FUNCTION check_trial_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.trial_ends_at IS NOT NULL AND NEW.trial_ends_at < NOW() THEN
    NEW.subscription_tier := 'free';
    NEW.trial_ends_at := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_trial_status_trigger ON profiles;
CREATE TRIGGER check_trial_status_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_trial_status();

UPDATE profiles
SET 
  project_limit = CASE subscription_tier
    WHEN 'free' THEN 3
    WHEN 'starter' THEN 15
    WHEN 'growth' THEN 50
    WHEN 'pro' THEN 999999
    ELSE 3
  END,
  team_seats = CASE subscription_tier
    WHEN 'free' THEN 1
    WHEN 'starter' THEN 1
    WHEN 'growth' THEN 3
    WHEN 'pro' THEN 10
    ELSE 1
  END
WHERE project_limit IS NULL OR team_seats IS NULL;
