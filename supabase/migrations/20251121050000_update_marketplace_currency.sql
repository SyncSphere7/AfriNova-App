-- Update Marketplace Currency System
-- Change from KES to USD as standard, add currency conversion support

-- Update marketplace_apps table: Change currency default to USD
ALTER TABLE marketplace_apps 
  ALTER COLUMN currency SET DEFAULT 'USD';

-- Update app_purchases table: Change currency default to USD  
ALTER TABLE app_purchases
  ALTER COLUMN currency SET DEFAULT 'USD';

-- Update existing records to use USD equivalent prices
-- Conversion rate: 1 USD = 129 KES (approximate)
UPDATE marketplace_apps
SET 
  currency = 'USD',
  price = CASE 
    WHEN is_free THEN 0
    ELSE ROUND(price / 129.0, 2)
  END
WHERE currency = 'KES';

-- Update seed data comments
COMMENT ON COLUMN marketplace_apps.currency IS 'ISO 4217 currency code (default: USD). Prices stored in USD, converted at display time based on user location.';
COMMENT ON COLUMN marketplace_apps.price IS 'Price in USD. Will be converted to user''s local currency for display (KES, TZS, UGX, EUR, etc.)';

COMMENT ON COLUMN app_purchases.currency IS 'Currency used for this purchase (user''s local currency at time of purchase)';
COMMENT ON COLUMN app_purchases.amount IS 'Amount paid in the purchase currency';
