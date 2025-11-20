/*
  # Update Subscriptions Table for Multi-Gateway Support

  1. Changes
    - Rename `stripe_subscription_id` to `gateway_subscription_id` for flexibility
    - Rename `tier` to `plan` for consistency
    - Add `payment_gateway` column to track which gateway (pesapal, paypal, stripe)
    - Update status enum to match payment flow (active, cancelled, expired, pending)
    - Update profiles table to remove stripe-specific columns

  2. New Table
    - `transactions` table for payment history

  3. Security
    - Maintain existing RLS policies
    - Add policies for transactions table
*/

-- First, check and alter subscriptions table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE subscriptions RENAME COLUMN stripe_subscription_id TO gateway_subscription_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'tier'
  ) THEN
    ALTER TABLE subscriptions RENAME COLUMN tier TO plan;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'payment_gateway'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN payment_gateway text CHECK (payment_gateway IN ('pesapal', 'paypal', 'stripe'));
  END IF;
END $$;

-- Drop old constraint and add new one for status
DO $$
BEGIN
  ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
  ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check 
    CHECK (status IN ('active', 'cancelled', 'expired', 'pending'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Drop old constraint and add new one for plan
DO $$
BEGIN
  ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_tier_check;
  ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
  ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_check 
    CHECK (plan IN ('free', 'starter', 'growth', 'pro'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Update profiles table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE profiles RENAME COLUMN stripe_customer_id TO payment_gateway_customer_id;
  END IF;
END $$;

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE SET NULL,
  amount decimal(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_gateway text NOT NULL CHECK (payment_gateway IN ('pesapal', 'paypal', 'stripe')),
  gateway_transaction_id text,
  gateway_reference text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_gateway_id ON subscriptions(gateway_subscription_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_subscription_id ON transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_transactions_gateway_ref ON transactions(gateway_reference);