-- Marketplace Database Schema
-- App store for purchasing and downloading pre-built templates

-- ==================== ENUMS ====================

CREATE TYPE app_category AS ENUM (
  'saas',
  'ecommerce',
  'blog',
  'portfolio',
  'social',
  'dashboard',
  'landing',
  'mobile',
  'ai',
  'other'
);

CREATE TYPE app_status AS ENUM (
  'draft',
  'pending_review',
  'approved',
  'rejected',
  'archived'
);

CREATE TYPE purchase_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'refunded'
);

-- ==================== TABLES ====================

-- Marketplace Apps
CREATE TABLE marketplace_apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Media
  icon TEXT, -- Emoji or image URL
  thumbnail_url TEXT,
  demo_url TEXT,
  video_url TEXT,
  screenshots TEXT[], -- Array of image URLs
  
  -- Categorization
  category app_category NOT NULL,
  tags TEXT[],
  tech_stack TEXT[], -- e.g., ['Next.js', 'TypeScript', 'Supabase']
  
  -- Pricing
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  currency TEXT DEFAULT 'KES',
  is_free BOOLEAN DEFAULT false,
  
  -- Stats
  status app_status DEFAULT 'draft',
  downloads_count INT DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 0.00,
  rating_count INT DEFAULT 0,
  
  -- Features
  features JSONB, -- Array of feature strings
  requirements JSONB, -- System requirements
  
  -- Template Data
  template_files JSONB, -- File structure and content
  github_repo TEXT,
  npm_package TEXT,
  
  -- Metadata
  version TEXT DEFAULT '1.0.0',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- App Categories (for filtering)
CREATE TABLE app_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- App Reviews
CREATE TABLE app_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID REFERENCES marketplace_apps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Review Content
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  
  -- Media
  images TEXT[],
  
  -- Stats
  helpful_count INT DEFAULT 0,
  reported_count INT DEFAULT 0,
  
  -- Seller Response
  seller_response TEXT,
  seller_response_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  is_verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(app_id, user_id)
);

-- App Purchases
CREATE TABLE app_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID REFERENCES marketplace_apps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Purchase Details
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'KES',
  status purchase_status DEFAULT 'pending',
  
  -- Payment Info
  payment_method TEXT, -- 'mpesa', 'card', 'free'
  payment_reference TEXT UNIQUE,
  pesapal_tracking_id TEXT,
  pesapal_merchant_reference TEXT,
  
  -- Download Tracking
  download_count INT DEFAULT 0,
  first_downloaded_at TIMESTAMP WITH TIME ZONE,
  last_downloaded_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(app_id, user_id)
);

-- App Templates (Generated from AI)
CREATE TABLE app_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID REFERENCES marketplace_apps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Customization
  customizations JSONB, -- User's custom settings
  
  -- Generated Files
  project_name TEXT NOT NULL,
  files JSONB NOT NULL, -- Generated file structure
  
  -- Metadata
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review Helpful Votes
CREATE TABLE review_helpful_votes (
  review_id UUID REFERENCES app_reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (review_id, user_id)
);

-- ==================== INDEXES ====================

CREATE INDEX idx_marketplace_apps_seller ON marketplace_apps(seller_id);
CREATE INDEX idx_marketplace_apps_category ON marketplace_apps(category);
CREATE INDEX idx_marketplace_apps_status ON marketplace_apps(status);
CREATE INDEX idx_marketplace_apps_price ON marketplace_apps(price);
CREATE INDEX idx_marketplace_apps_rating ON marketplace_apps(rating_average DESC);
CREATE INDEX idx_marketplace_apps_downloads ON marketplace_apps(downloads_count DESC);
CREATE INDEX idx_marketplace_apps_slug ON marketplace_apps(slug);

CREATE INDEX idx_app_reviews_app ON app_reviews(app_id);
CREATE INDEX idx_app_reviews_user ON app_reviews(user_id);
CREATE INDEX idx_app_reviews_rating ON app_reviews(rating);

CREATE INDEX idx_app_purchases_user ON app_purchases(user_id);
CREATE INDEX idx_app_purchases_app ON app_purchases(app_id);
CREATE INDEX idx_app_purchases_status ON app_purchases(status);
CREATE INDEX idx_app_purchases_payment_ref ON app_purchases(payment_reference);

-- ==================== RLS POLICIES ====================

-- Marketplace Apps: Public read, seller write
ALTER TABLE marketplace_apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved apps"
  ON marketplace_apps FOR SELECT
  USING (status = 'approved' OR seller_id = auth.uid());

CREATE POLICY "Sellers can insert their own apps"
  ON marketplace_apps FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own apps"
  ON marketplace_apps FOR UPDATE
  USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete their own apps"
  ON marketplace_apps FOR DELETE
  USING (auth.uid() = seller_id);

-- App Reviews: Public read, authenticated write
ALTER TABLE app_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON app_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews"
  ON app_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON app_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON app_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- App Purchases: User can only see their own
ALTER TABLE app_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own purchases"
  ON app_purchases FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT seller_id FROM marketplace_apps WHERE id = app_id
  ));

CREATE POLICY "Users can create purchases"
  ON app_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchases"
  ON app_purchases FOR UPDATE
  USING (auth.uid() = user_id);

-- App Templates: User can only see their own
ALTER TABLE app_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own templates"
  ON app_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create templates"
  ON app_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Review Helpful Votes: Public read, authenticated write
ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view helpful votes"
  ON review_helpful_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can vote helpful"
  ON review_helpful_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their votes"
  ON review_helpful_votes FOR DELETE
  USING (auth.uid() = user_id);

-- App Categories: Public read, admin write
ALTER TABLE app_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON app_categories FOR SELECT
  USING (true);

-- ==================== TRIGGERS ====================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_marketplace_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_marketplace_apps_updated_at
  BEFORE UPDATE ON marketplace_apps
  FOR EACH ROW
  EXECUTE FUNCTION update_marketplace_updated_at();

CREATE TRIGGER update_app_reviews_updated_at
  BEFORE UPDATE ON app_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_marketplace_updated_at();

CREATE TRIGGER update_app_purchases_updated_at
  BEFORE UPDATE ON app_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_marketplace_updated_at();

-- Auto-update app rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION update_app_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE marketplace_apps
  SET 
    rating_average = (
      SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0.00)
      FROM app_reviews
      WHERE app_id = COALESCE(NEW.app_id, OLD.app_id)
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM app_reviews
      WHERE app_id = COALESCE(NEW.app_id, OLD.app_id)
    )
  WHERE id = COALESCE(NEW.app_id, OLD.app_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_app_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON app_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_app_rating();

-- Increment download count on first download
CREATE OR REPLACE FUNCTION increment_download_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.first_downloaded_at IS NOT NULL AND OLD.first_downloaded_at IS NULL THEN
    UPDATE marketplace_apps
    SET downloads_count = downloads_count + 1
    WHERE id = NEW.app_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_download_count_trigger
  AFTER UPDATE ON app_purchases
  FOR EACH ROW
  EXECUTE FUNCTION increment_download_count();
