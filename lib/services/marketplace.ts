/**
 * Marketplace Service
 * 
 * App store functionality:
 * - Browse and search apps
 * - Purchase and download templates
 * - Review and rating system
 * - Seller dashboard
 * 
 * @author AfriNova CTO
 */

import { createClient } from '@/lib/supabase/client';

// ==================== TYPES ====================

export type AppCategory =
  | 'saas'
  | 'ecommerce'
  | 'blog'
  | 'portfolio'
  | 'social'
  | 'dashboard'
  | 'landing'
  | 'mobile'
  | 'ai'
  | 'other';

export type AppStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'archived';
export type PurchaseStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface MarketplaceApp {
  id: string;
  seller_id: string;
  seller?: {
    full_name: string;
    avatar_url?: string;
  };
  
  // Basic Info
  slug: string;
  name: string;
  tagline: string;
  description: string;
  
  // Media
  icon: string;
  thumbnail_url?: string;
  demo_url?: string;
  video_url?: string;
  screenshots: string[];
  
  // Categorization
  category: AppCategory;
  tags: string[];
  tech_stack: string[];
  
  // Pricing
  price: number;
  currency: string;
  is_free: boolean;
  
  // Stats
  status: AppStatus;
  downloads_count: number;
  rating_average: number;
  rating_count: number;
  
  // Features
  features: string[];
  requirements: Record<string, any>;
  
  // Template
  template_files?: Record<string, any>;
  github_repo?: string;
  npm_package?: string;
  
  // Metadata
  version: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AppReview {
  id: string;
  app_id: string;
  user_id: string;
  user?: {
    full_name: string;
    avatar_url?: string;
  };
  
  rating: number;
  title: string;
  content: string;
  images: string[];
  
  helpful_count: number;
  reported_count: number;
  
  seller_response?: string;
  seller_response_at?: string;
  
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppPurchase {
  id: string;
  app_id: string;
  user_id: string;
  app?: MarketplaceApp;
  
  amount: number;
  currency: string;
  status: PurchaseStatus;
  
  payment_method?: string;
  payment_reference?: string;
  pesapal_tracking_id?: string;
  
  download_count: number;
  first_downloaded_at?: string;
  last_downloaded_at?: string;
  
  purchased_at: string;
}

export interface SearchFilters {
  category?: AppCategory;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  tags?: string[];
  techStack?: string[];
  isFree?: boolean;
  query?: string;
}

// ==================== APP BROWSING ====================

/**
 * Get all approved marketplace apps
 */
export async function getMarketplaceApps(
  filters?: SearchFilters
): Promise<MarketplaceApp[]> {
  const supabase = createClient();

  let query = supabase
    .from('marketplace_apps')
    .select('*, seller:profiles(full_name, avatar_url)')
    .eq('status', 'approved');

  // Apply filters
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice);
  }

  if (filters?.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice);
  }

  if (filters?.minRating) {
    query = query.gte('rating_average', filters.minRating);
  }

  if (filters?.isFree !== undefined) {
    query = query.eq('is_free', filters.isFree);
  }

  if (filters?.query) {
    query = query.or(
      `name.ilike.%${filters.query}%,description.ilike.%${filters.query}%,tagline.ilike.%${filters.query}%`
    );
  }

  // Order by popularity (downloads * rating)
  query = query.order('downloads_count', { ascending: false });

  const { data, error } = await query;

  if (error) throw error;

  return data as any as MarketplaceApp[];
}

/**
 * Get app by slug
 */
export async function getApp(slug: string): Promise<MarketplaceApp> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('marketplace_apps')
    .select('*, seller:profiles(full_name, avatar_url)')
    .eq('slug', slug)
    .single();

  if (error) throw error;

  return data as any as MarketplaceApp;
}

/**
 * Get featured apps (highest rated + most downloads)
 */
export async function getFeaturedApps(limit: number = 6): Promise<MarketplaceApp[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('marketplace_apps')
    .select('*, seller:profiles(full_name, avatar_url)')
    .eq('status', 'approved')
    .gte('rating_average', 4.0)
    .gte('downloads_count', 10)
    .order('rating_average', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data as any as MarketplaceApp[]) || [];
}

/**
 * Get apps by category
 */
export async function getAppsByCategory(category: AppCategory): Promise<MarketplaceApp[]> {
  return getMarketplaceApps({ category });
}

// ==================== PURCHASES ====================

/**
 * Check if user has purchased an app
 */
export async function hasPurchased(appId: string): Promise<boolean> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('app_purchases')
    .select('id')
    .eq('app_id', appId)
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .single();

  return !!data;
}

/**
 * Create purchase (initiate payment)
 */
export async function createPurchase(appId: string): Promise<AppPurchase> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get app details
  const { data: app } = await supabase
    .from('marketplace_apps')
    .select('price, currency, is_free')
    .eq('id', appId)
    .single();

  if (!app) throw new Error('App not found');

  // Create purchase record
  const { data, error } = await supabase
    .from('app_purchases')
    .insert({
      app_id: appId,
      user_id: user.id,
      amount: app.price,
      currency: app.currency,
      status: app.is_free ? 'completed' : 'pending',
      payment_method: app.is_free ? 'free' : undefined,
    })
    .select()
    .single();

  if (error) throw error;

  return data as AppPurchase;
}

/**
 * Complete purchase (after payment success)
 */
export async function completePurchase(
  purchaseId: string,
  paymentReference: string,
  pesapalTrackingId?: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('app_purchases')
    .update({
      status: 'completed',
      payment_reference: paymentReference,
      pesapal_tracking_id: pesapalTrackingId,
    })
    .eq('id', purchaseId);

  if (error) throw error;
}

/**
 * Get user's purchases
 */
export async function getUserPurchases(): Promise<AppPurchase[]> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('app_purchases')
    .select('*, app:marketplace_apps(*)')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('purchased_at', { ascending: false });

  if (error) throw error;

  return data as any as AppPurchase[];
}

/**
 * Track download
 */
export async function trackDownload(purchaseId: string): Promise<void> {
  const supabase = createClient();

  const { data: purchase } = await supabase
    .from('app_purchases')
    .select('download_count, first_downloaded_at')
    .eq('id', purchaseId)
    .single();

  if (!purchase) throw new Error('Purchase not found');

  const updates: any = {
    download_count: purchase.download_count + 1,
    last_downloaded_at: new Date().toISOString(),
  };

  if (!purchase.first_downloaded_at) {
    updates.first_downloaded_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('app_purchases')
    .update(updates)
    .eq('id', purchaseId);

  if (error) throw error;
}

// ==================== REVIEWS ====================

/**
 * Get app reviews
 */
export async function getAppReviews(appId: string): Promise<AppReview[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('app_reviews')
    .select('*, user:profiles(full_name, avatar_url)')
    .eq('app_id', appId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data as any as AppReview[];
}

/**
 * Create review
 */
export async function createReview(
  appId: string,
  rating: number,
  title: string,
  content: string
): Promise<AppReview> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if user purchased the app
  const purchased = await hasPurchased(appId);

  const { data, error } = await supabase
    .from('app_reviews')
    .insert({
      app_id: appId,
      user_id: user.id,
      rating,
      title,
      content,
      is_verified_purchase: purchased,
    })
    .select()
    .single();

  if (error) throw error;

  return data as AppReview;
}

/**
 * Update review
 */
export async function updateReview(
  reviewId: string,
  rating: number,
  title: string,
  content: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('app_reviews')
    .update({ rating, title, content })
    .eq('id', reviewId);

  if (error) throw error;
}

/**
 * Delete review
 */
export async function deleteReview(reviewId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from('app_reviews').delete().eq('id', reviewId);

  if (error) throw error;
}

/**
 * Mark review as helpful
 */
export async function markReviewHelpful(reviewId: string): Promise<void> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if already voted
  const { data: existing } = await supabase
    .from('review_helpful_votes')
    .select('*')
    .eq('review_id', reviewId)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    // Remove vote
    await supabase
      .from('review_helpful_votes')
      .delete()
      .eq('review_id', reviewId)
      .eq('user_id', user.id);

    await supabase.rpc('decrement', {
      table_name: 'app_reviews',
      column_name: 'helpful_count',
      row_id: reviewId,
    });
  } else {
    // Add vote
    await supabase.from('review_helpful_votes').insert({
      review_id: reviewId,
      user_id: user.id,
    });

    await supabase.rpc('increment', {
      table_name: 'app_reviews',
      column_name: 'helpful_count',
      row_id: reviewId,
    });
  }
}

// ==================== SELLER DASHBOARD ====================

/**
 * Get seller's apps
 */
export async function getSellerApps(): Promise<MarketplaceApp[]> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('marketplace_apps')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data as MarketplaceApp[];
}

/**
 * Create new app listing
 */
export async function createApp(app: Partial<MarketplaceApp>): Promise<MarketplaceApp> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('marketplace_apps')
    .insert({
      ...app,
      seller_id: user.id,
      status: 'draft',
    })
    .select()
    .single();

  if (error) throw error;

  return data as MarketplaceApp;
}

/**
 * Update app
 */
export async function updateApp(
  appId: string,
  updates: Partial<MarketplaceApp>
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('marketplace_apps')
    .update(updates)
    .eq('id', appId);

  if (error) throw error;
}

/**
 * Submit app for review
 */
export async function submitAppForReview(appId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('marketplace_apps')
    .update({ status: 'pending_review' })
    .eq('id', appId);

  if (error) throw error;
}

/**
 * Get seller stats
 */
export async function getSellerStats(): Promise<{
  totalApps: number;
  totalDownloads: number;
  totalRevenue: number;
  averageRating: number;
}> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get apps
  const { data: apps } = await supabase
    .from('marketplace_apps')
    .select('downloads_count, rating_average, price')
    .eq('seller_id', user.id);

  // Get purchases
  const { data: purchases } = await supabase
    .from('app_purchases')
    .select('amount')
    .eq('status', 'completed')
    .in(
      'app_id',
      apps?.map((a: any) => a.id) || []
    );

  const totalApps = apps?.length || 0;
  const totalDownloads = apps?.reduce((sum: number, a: any) => sum + a.downloads_count, 0) || 0;
  const totalRevenue = purchases?.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0;
  const averageRating =
    apps?.reduce((sum: number, a: any) => sum + a.rating_average, 0) / totalApps || 0;

  return {
    totalApps,
    totalDownloads,
    totalRevenue,
    averageRating,
  };
}

// ==================== TEMPLATE GENERATION ====================

/**
 * Generate custom template from purchased app
 */
export async function generateTemplate(
  appId: string,
  projectName: string,
  customizations?: Record<string, any>
): Promise<{ files: Record<string, string>; readme: string }> {
  const supabase = createClient();

  // Get app template
  const { data: app } = await supabase
    .from('marketplace_apps')
    .select('template_files, name, description, tech_stack')
    .eq('id', appId)
    .single();

  if (!app || !app.template_files) {
    throw new Error('Template not available');
  }

  // Apply customizations to template
  const files: Record<string, string> = {};
  const templateFiles = app.template_files as Record<string, any>;

  for (const [path, content] of Object.entries(templateFiles)) {
    let fileContent = content as string;

    // Replace placeholders
    if (customizations) {
      fileContent = fileContent.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
      for (const [key, value] of Object.entries(customizations)) {
        fileContent = fileContent.replace(
          new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
          String(value)
        );
      }
    }

    files[path] = fileContent;
  }

  // Generate README
  const readme = `# ${projectName}

Generated from **${app.name}** template

## Description

${app.description}

## Tech Stack

${app.tech_stack.map((tech: string) => `- ${tech}`).join('\n')}

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Features

- Next.js 13+ App Router
- TypeScript
- Tailwind CSS
- Supabase Integration
- Authentication Ready

## Generated by AfriNova

This app was generated using AfriNova's AI-powered app marketplace.
Visit https://afrinova.com to build your own!
`;

  return { files, readme };
}
