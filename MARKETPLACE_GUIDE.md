# 🛒 App Marketplace - Complete Guide

## Overview

The **App Marketplace** is AfriNova's template marketplace where developers can buy, sell, and customize pre-built app templates. It competes directly with premium template marketplaces like ThemeForest, TemplateMonster, and Creative Tim, but with game-changing advantages:

### 🎯 Competitive Advantages

| Feature | AfriNova | ThemeForest | TemplateMonster | Creative Tim |
|---------|----------|-------------|-----------------|--------------|
| **AI Customization** | ✅ 20 languages | ❌ | ❌ | ❌ |
| **Instant Generation** | ✅ Real-time | ❌ Manual | ❌ Manual | ❌ Manual |
| **M-Pesa Payment** | ✅ Africa-first | ❌ | ❌ | ❌ |
| **Free Templates** | ✅ Many | Limited | Limited | Few |
| **Learning Integration** | ✅ Learn-to-Code Mode | ❌ | ❌ | ❌ |
| **Built-in Editor** | ✅ Monaco + AI | ❌ | ❌ | ❌ |
| **Collaboration** | ✅ Real-time | ❌ | ❌ | ❌ |
| **Lifetime Updates** | ✅ Always | ❌ Limited | ❌ Limited | ✅ |
| **One-time Payment** | ✅ | ✅ | ✅ | ✅ |
| **Average Price** | KES 5K-20K | $50-200 | $75-500 | $49-299 |

---

## 📊 Database Schema

### Tables (7 total)

#### 1. `marketplace_apps`
Main app catalog with all template metadata.

```sql
CREATE TABLE marketplace_apps (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  
  -- Basic Info
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT '📦',
  
  -- Media
  thumbnail_url TEXT,
  demo_url TEXT,
  video_url TEXT,
  screenshots TEXT[],
  
  -- Categorization
  category app_category NOT NULL DEFAULT 'other',
  tags TEXT[],
  tech_stack TEXT[],
  
  -- Pricing
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'KES',
  is_free BOOLEAN GENERATED ALWAYS AS (price = 0) STORED,
  
  -- Stats
  status app_status NOT NULL DEFAULT 'draft',
  downloads_count INTEGER NOT NULL DEFAULT 0,
  rating_average DECIMAL(3,2) NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  
  -- Template
  template_files JSONB NOT NULL DEFAULT '{}'::jsonb,
  github_repo TEXT,
  npm_package TEXT,
  features TEXT[],
  
  -- Metadata
  version TEXT NOT NULL DEFAULT '1.0.0',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Enums:**
- `app_category`: saas, ecommerce, blog, portfolio, social, dashboard, landing, mobile, ai, other
- `app_status`: draft, pending_review, approved, rejected, archived

**Key Fields:**
- `template_files`: JSONB containing file structure (path → content)
- `tech_stack`: Array of technologies (Next.js, TypeScript, etc.)
- `features`: Array of feature descriptions

#### 2. `app_reviews`
User reviews with ratings and seller responses.

```sql
CREATE TABLE app_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES marketplace_apps ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  
  -- Review Content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  images TEXT[],
  
  -- Stats
  helpful_count INTEGER NOT NULL DEFAULT 0,
  reported_count INTEGER NOT NULL DEFAULT 0,
  
  -- Seller Response
  seller_response TEXT,
  seller_response_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(app_id, user_id) -- One review per user per app
);
```

#### 3. `app_purchases`
Purchase tracking and payment records.

```sql
CREATE TABLE app_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES marketplace_apps ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  
  -- Purchase Details
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  status purchase_status NOT NULL DEFAULT 'pending',
  
  -- Payment Info (Pesapal)
  payment_method TEXT,
  payment_reference TEXT,
  pesapal_tracking_id TEXT,
  pesapal_merchant_reference TEXT UNIQUE,
  
  -- Download Tracking
  download_count INTEGER NOT NULL DEFAULT 0,
  first_downloaded_at TIMESTAMP WITH TIME ZONE,
  last_downloaded_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(app_id, user_id) -- One purchase per user per app
);
```

**Enums:**
- `purchase_status`: pending, completed, failed, refunded

#### 4. `app_templates`
User-generated customized templates.

```sql
CREATE TABLE app_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID REFERENCES app_purchases ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  
  customizations JSONB NOT NULL DEFAULT '{}'::jsonb,
  project_name TEXT NOT NULL,
  files JSONB NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### 5. `review_helpful_votes`
Tracks helpful votes on reviews.

```sql
CREATE TABLE review_helpful_votes (
  review_id UUID REFERENCES app_reviews ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (review_id, user_id)
);
```

#### 6. `app_categories`
Category metadata for marketplace organization.

```sql
CREATE TABLE app_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);
```

---

## 🔒 Security (RLS Policies)

### marketplace_apps
- **Public Read**: Anyone can view approved apps
- **Seller Manage**: Sellers can create/update/delete their own apps
- **Admin Review**: Admins can change status for approval/rejection

```sql
-- Public read approved apps
CREATE POLICY "Anyone can view approved apps"
ON marketplace_apps FOR SELECT
USING (status = 'approved');

-- Sellers manage own apps
CREATE POLICY "Sellers can manage own apps"
ON marketplace_apps FOR ALL
USING (auth.uid() = seller_id);
```

### app_reviews
- **Public Read**: Anyone can read reviews
- **Authenticated Write**: Logged-in users can write reviews
- **Own Management**: Users can edit/delete own reviews
- **Purchase Verification**: `is_verified_purchase` auto-set if user bought app

```sql
-- Anyone can read reviews
CREATE POLICY "Anyone can read reviews"
ON app_reviews FOR SELECT
USING (true);

-- Users can create reviews
CREATE POLICY "Authenticated users can create reviews"
ON app_reviews FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Users can manage own reviews
CREATE POLICY "Users can manage own reviews"
ON app_reviews FOR UPDATE
USING (auth.uid() = user_id);
```

### app_purchases
- **User Read Own**: Users see only their purchases
- **Seller Read Sales**: Sellers see purchases of their apps
- **System Write**: Purchase creation handled by service layer

```sql
-- Users see own purchases
CREATE POLICY "Users see own purchases"
ON app_purchases FOR SELECT
USING (auth.uid() = user_id);

-- Sellers see their app sales
CREATE POLICY "Sellers see their sales"
ON app_purchases FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM marketplace_apps
    WHERE marketplace_apps.id = app_purchases.app_id
    AND marketplace_apps.seller_id = auth.uid()
  )
);
```

---

## 🔧 Service Layer API

### Location: `lib/services/marketplace.ts`

### 25+ Functions

#### App Browsing

##### `getMarketplaceApps(filters?: SearchFilters): Promise<MarketplaceApp[]>`
Browse apps with optional filtering.

```typescript
interface SearchFilters {
  category?: AppCategory;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  tags?: string[];
  techStack?: string[];
  isFree?: boolean;
  query?: string; // Search in name, tagline, description
}

// Usage
const apps = await getMarketplaceApps({
  category: 'saas',
  maxPrice: 10000,
  minRating: 4.0,
  query: 'dashboard'
});
```

##### `getApp(slug: string): Promise<MarketplaceApp | null>`
Get single app by slug.

```typescript
const app = await getApp('ecommerce-store-pro');
```

##### `getFeaturedApps(limit?: number): Promise<MarketplaceApp[]>`
Get top-rated apps (rating >= 4.0, downloads >= 10).

```typescript
const featured = await getFeaturedApps(3);
```

##### `getAppsByCategory(category: AppCategory): Promise<MarketplaceApp[]>`
Filter apps by category.

```typescript
const saasApps = await getAppsByCategory('saas');
```

#### Purchases

##### `hasPurchased(appId: string): Promise<boolean>`
Check if current user owns the app.

```typescript
const canDownload = await hasPurchased(appId);
```

##### `createPurchase(appId: string): Promise<AppPurchase>`
Initiate a purchase. Free apps auto-complete.

```typescript
const purchase = await createPurchase(appId);
// Returns: { id, status: 'pending' | 'completed', ... }
```

##### `completePurchase(purchaseId: string, paymentRef: string, pesapalId?: string): Promise<void>`
Mark purchase as completed after payment verification.

```typescript
await completePurchase(purchaseId, 'TXN123456', 'PESAPAL789');
```

##### `getUserPurchases(): Promise<AppPurchase[]>`
Get current user's purchased apps.

```typescript
const myApps = await getUserPurchases();
// Returns purchases with populated app data
```

##### `trackDownload(purchaseId: string): Promise<void>`
Increment download count, set first/last download timestamps.

```typescript
await trackDownload(purchaseId);
```

#### Reviews

##### `getAppReviews(appId: string): Promise<AppReview[]>`
Get all reviews for an app.

```typescript
const reviews = await getAppReviews(appId);
```

##### `createReview(appId: string, rating: number, title: string, content: string): Promise<AppReview>`
Create a review. Auto-verifies if user purchased the app.

```typescript
const review = await createReview(
  appId,
  5,
  'Amazing template!',
  'Saved me weeks of development. Highly recommended.'
);
```

##### `updateReview(reviewId: string, rating: number, title: string, content: string): Promise<void>`
Update existing review.

```typescript
await updateReview(reviewId, 4, 'Good template', 'Updated review...');
```

##### `deleteReview(reviewId: string): Promise<void>`
Delete a review.

```typescript
await deleteReview(reviewId);
```

##### `markReviewHelpful(reviewId: string): Promise<void>`
Toggle helpful vote on a review.

```typescript
await markReviewHelpful(reviewId);
```

#### Seller Dashboard

##### `getSellerApps(): Promise<MarketplaceApp[]>`
Get current user's app listings.

```typescript
const myApps = await getSellerApps();
```

##### `createApp(app: CreateAppInput): Promise<MarketplaceApp>`
Create a new app listing (status: draft).

```typescript
interface CreateAppInput {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: AppCategory;
  icon: string;
  price: number;
  tech_stack: string[];
  features: string[];
  template_files: Record<string, string>;
}

const app = await createApp({
  name: 'My SaaS Dashboard',
  slug: 'my-saas-dashboard',
  tagline: 'Complete SaaS starter',
  description: 'Full description...',
  category: 'saas',
  icon: '💼',
  price: 15000,
  tech_stack: ['Next.js', 'TypeScript', 'Tailwind'],
  features: ['Auth', 'Billing', 'Analytics'],
  template_files: {
    'app/page.tsx': '/* code */',
    'lib/db.ts': '/* code */'
  }
});
```

##### `updateApp(appId: string, updates: Partial<CreateAppInput>): Promise<void>`
Update app details.

```typescript
await updateApp(appId, { price: 12000 });
```

##### `submitAppForReview(appId: string): Promise<void>`
Submit app for admin approval (status: pending_review).

```typescript
await submitAppForReview(appId);
```

##### `getSellerStats(): Promise<SellerStats>`
Get seller analytics.

```typescript
interface SellerStats {
  totalApps: number;
  totalDownloads: number;
  totalRevenue: number;
  averageRating: number;
}

const stats = await getSellerStats();
```

#### Template Generation

##### `generateTemplate(appId: string, projectName: string, customizations: Record<string, any>): Promise<{ files: Record<string, string>; readme: string }>`
Generate customized template with user's project name and options.

```typescript
const { files, readme } = await generateTemplate(
  appId,
  'my-awesome-project',
  {
    color: 'blue',
    features: ['auth', 'billing']
  }
);

// Replaces {{PROJECT_NAME}}, {{CUSTOM_KEY}} in template files
```

---

## 🎨 UI Components

### Location: `components/marketplace/`

### 1. AppCard (`app-card.tsx`)

Display app in grid catalog.

```tsx
import { AppCard, AppGrid } from '@/components/marketplace/app-card';

<AppGrid apps={apps} />

// Or individual card
<AppCard
  app={app}
  href={`/marketplace/${app.slug}`}
/>
```

**Features:**
- Thumbnail image or emoji icon
- "Free" badge for free apps
- Category badge with color coding
- Tech stack badges (first 2)
- Star rating + review count
- Download count
- Price display
- Hover shadow effect

**Design:**
- Retro Windows 95: `border-2`, `font-pixel`, uppercase
- Category colors: 10 unique colors per category
- Responsive: 1/2/3 columns

### 2. ReviewCard (`review-card.tsx`)

Display user reviews with ratings.

```tsx
import { ReviewCard, ReviewSummary } from '@/components/marketplace/review-card';

// Summary stats
<ReviewSummary
  averageRating={4.8}
  totalReviews={23}
  ratingBreakdown={[
    { rating: 5, count: 15 },
    { rating: 4, count: 6 },
    { rating: 3, count: 2 },
    { rating: 2, count: 0 },
    { rating: 1, count: 0 }
  ]}
/>

// Individual review
<ReviewCard
  review={review}
  onMarkHelpful={(reviewId) => markReviewHelpful(reviewId)}
/>
```

**Features:**
- 5-star rating display
- Verified purchase badge
- Review title + content
- Review images grid
- Seller response card
- Helpful vote button
- Rating breakdown chart

### 3. CategoryFilter (`category-filter.tsx`)

Filter apps by category and price.

```tsx
import { CategoryFilter, PriceFilter } from '@/components/marketplace/category-filter';

<CategoryFilter
  selected={selectedCategory}
  onSelect={setSelectedCategory}
/>

<PriceFilter
  minPrice={minPrice}
  maxPrice={maxPrice}
  onSelect={(min, max) => {
    setMinPrice(min);
    setMaxPrice(max);
  }}
/>
```

**Categories (10):**
- All Apps 🌟
- SaaS 💼
- E-Commerce 🛒
- Blog 📝
- Portfolio 🎨
- Social 👥
- Dashboard 📊
- Landing 🚀
- Mobile 📱
- AI/ML 🤖
- Other 📦

**Price Ranges:**
- Any Price
- Free (0)
- Under KES 5,000
- KES 5,000-10,000
- KES 10,000-20,000
- Over KES 20,000

### 4. PurchaseModal (`purchase-modal.tsx`)

Handle app purchases with payment.

```tsx
import { PurchaseModal } from '@/components/marketplace/purchase-modal';

<PurchaseModal
  app={app}
  open={showModal}
  onClose={() => setShowModal(false)}
  onSuccess={() => {
    setPurchased(true);
    router.push('/marketplace/my-purchases');
  }}
/>
```

**Features:**
- App preview card
- Price display (large font-pixel)
- Payment method selection:
  * M-Pesa (recommended)
  * Credit Card
- M-Pesa phone input (254...)
- "What's Included" checklist
- Processing state with spinner
- Free app instant completion
- Success/error toasts

**Payment Flow:**
1. User clicks "Purchase"
2. Modal opens with payment options
3. M-Pesa selected → Phone number input
4. Click "Purchase" → Creates purchase record
5. Pesapal integration → Payment processing
6. Webhook → Completes purchase
7. Success → Redirect to My Purchases

---

## 📄 Pages

### Location: `app/marketplace/`

### 1. Marketplace Home (`page.tsx`)

Browse and search templates.

**Route:** `/marketplace`

**Features:**
- Search bar (name, tagline, description)
- Featured apps section (top 3)
- Stats cards (templates, delivery, rating)
- Filter toggle button
- Sidebar filters (category, price)
- App grid (3-4 columns)
- Loading/empty states

**State:**
```typescript
const [apps, setApps] = useState<MarketplaceApp[]>([]);
const [featuredApps, setFeaturedApps] = useState<MarketplaceApp[]>([]);
const [searchQuery, setSearchQuery] = useState('');
const [selectedCategory, setSelectedCategory] = useState<AppCategory>();
const [minPrice, setMinPrice] = useState<number>();
const [maxPrice, setMaxPrice] = useState<number>();
const [showFilters, setShowFilters] = useState(false);
```

### 2. App Detail (`[appSlug]/page.tsx`)

View app details and purchase.

**Route:** `/marketplace/[appSlug]`

**Layout:**
- Breadcrumb navigation
- 2/3 main content + 1/3 sticky sidebar

**Main Content:**
- App header card (icon, name, tagline, stats, seller)
- Tabs (border-2):
  * **Overview:** Description, tech stack badges
  * **Features:** Grid list with Zap icons
  * **Reviews:** ReviewSummary + ReviewCard list

**Sidebar (Sticky):**
- If purchased:
  * "Purchased" badge (green)
  * "View in Library" button
  * "Download Code" button
- If not purchased:
  * Price (FREE or currency + amount)
  * "Purchase"/"Get Free" button
  * "Live Demo" button (if demo_url exists)
- "What's Included" section

**State:**
```typescript
const [app, setApp] = useState<MarketplaceApp | null>(null);
const [reviews, setReviews] = useState<AppReview[]>([]);
const [purchased, setPurchased] = useState(false);
const [showPurchaseModal, setShowPurchaseModal] = useState(false);
```

### 3. My Purchases (`my-purchases/page.tsx`)

View purchased apps and download code.

**Route:** `/marketplace/my-purchases`

**Auth:** Redirects to `/auth/login` if not authenticated

**Features:**
- Stats cards (total apps, downloads, unlimited access)
- Purchase list with cards
- Each card shows:
  * App icon, name, tagline
  * "Purchased" badge
  * Tech stack badges
  * Purchase date, download count
  * Action buttons:
    - Download Code
    - View Details
    - Live Demo
- Empty state with CTA to browse
- Help section

**State:**
```typescript
const purchases = await getUserPurchases();
```

### 4. Seller Dashboard (`publish/page.tsx`)

Manage app listings and view analytics.

**Route:** `/marketplace/publish`

**Features:**
- Stats cards (apps, downloads, revenue, rating)
- "New App" button → Create dialog
- Apps table:
  * Columns: App, Status, Price, Rating, Downloads, Actions
  * Status badges: Draft, Pending, Approved, Rejected
  * Actions: View (Eye), Edit (Edit), Submit (Send)
- Create app dialog:
  * Form fields: Name, slug, tagline, description
  * Category, icon selector
  * Price input (0 for free)
  * Tech stack (comma-separated)
  * Features (one per line)
- Empty state with CTA to create
- Seller tips card

**State:**
```typescript
const [apps, setApps] = useState<MarketplaceApp[]>([]);
const [stats, setStats] = useState<SellerStats>({});
const [showCreateDialog, setShowCreateDialog] = useState(false);
const [formData, setFormData] = useState({
  name: '',
  slug: '',
  tagline: '',
  description: '',
  category: 'other',
  icon: '📦',
  price: 0,
  techStack: '',
  features: ''
});
```

---

## 💳 Payment Integration (Pesapal)

### Configuration

**File:** `lib/services/pesapal.ts` (from Feature #10)

```typescript
import { PesapalConfig } from '@/lib/services/pesapal';

const config: PesapalConfig = {
  consumer_key: process.env.PESAPAL_CONSUMER_KEY!,
  consumer_secret: process.env.PESAPAL_CONSUMER_SECRET!,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
};
```

### Purchase Flow

1. **Initiate Purchase**
```typescript
// User clicks "Purchase" in PurchaseModal
const purchase = await createPurchase(appId);
// Creates app_purchases record with status='pending'
```

2. **Payment Processing**
```typescript
if (app.is_free) {
  // Free apps: Auto-complete
  await completePurchase(purchase.id, 'FREE', null);
} else {
  // Paid apps: Pesapal integration
  const paymentUrl = await initiatePayment({
    amount: app.price,
    currency: app.currency,
    description: `Purchase: ${app.name}`,
    callback_url: `${origin}/api/pesapal/callback`,
    merchant_reference: purchase.id
  });
  
  // Redirect to Pesapal
  window.location.href = paymentUrl;
}
```

3. **Payment Callback**
```typescript
// API Route: app/api/pesapal/callback/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const merchantRef = searchParams.get('merchant_reference');
  const trackingId = searchParams.get('tracking_id');
  
  // Verify payment with Pesapal
  const status = await verifyPayment(trackingId);
  
  if (status === 'COMPLETED') {
    // Complete purchase
    await completePurchase(merchantRef, trackingId, trackingId);
  }
  
  // Redirect to my-purchases
  return redirect('/marketplace/my-purchases');
}
```

4. **Webhook (IPN)**
```typescript
// API Route: app/api/pesapal/ipn/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  const { tracking_id, merchant_reference } = body;
  
  // Verify payment
  const status = await verifyPayment(tracking_id);
  
  if (status === 'COMPLETED') {
    await completePurchase(merchant_reference, tracking_id, tracking_id);
  }
  
  return Response.json({ status: 'ok' });
}
```

### Environment Variables

```env
# Pesapal
PESAPAL_CONSUMER_KEY=your_consumer_key
PESAPAL_CONSUMER_SECRET=your_consumer_secret
```

---

## 📥 Template Download System

### Implementation

**Button Handler (My Purchases page):**

```typescript
const handleDownload = async (purchase: AppPurchase) => {
  try {
    // 1. Generate template
    const { files, readme } = await generateTemplate(
      purchase.app_id,
      purchase.app?.slug || 'my-project',
      {}
    );
    
    // 2. Create ZIP file
    const zip = new JSZip();
    
    for (const [path, content] of Object.entries(files)) {
      zip.file(path, content);
    }
    
    zip.file('README.md', readme);
    
    // 3. Generate ZIP blob
    const blob = await zip.generateAsync({ type: 'blob' });
    
    // 4. Trigger download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${purchase.app?.slug || 'template'}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    
    // 5. Track download
    await trackDownload(purchase.id);
    
    toast.success('✅ Template downloaded!');
  } catch (error) {
    console.error('Download failed:', error);
    toast.error('Failed to download template');
  }
};
```

**Dependencies:**
```bash
npm install jszip
```

### Template Structure

**Example `template_files` JSONB:**

```json
{
  "app/page.tsx": "export default function HomePage() {\n  return <div>{{PROJECT_NAME}}</div>;\n}",
  "app/layout.tsx": "export default function RootLayout({ children }) {\n  return <html><body>{children}</body></html>;\n}",
  "lib/config.ts": "export const config = {\n  name: '{{PROJECT_NAME}}',\n  color: '{{COLOR}}'\n};",
  "package.json": "{\n  \"name\": \"{{PROJECT_NAME}}\",\n  \"version\": \"1.0.0\",\n  \"dependencies\": {}\n}",
  "README.md": "# {{PROJECT_NAME}}\n\nGenerated by AfriNova Marketplace"
}
```

**Placeholder Replacement:**
- `{{PROJECT_NAME}}` → User's project name
- `{{COLOR}}` → User's selected color
- `{{FEATURE_*}}` → Custom feature toggles

---

## 🤖 AI Customization Assistant

### Integration with Agent Router

**Feature:** Users can customize templates in 20 languages with AI assistance.

**Implementation:**
```typescript
import { routeToAgent } from '@/lib/openrouter/client';

const handleCustomize = async (app: MarketplaceApp) => {
  const prompt = `I want to customize this ${app.category} template: ${app.name}. 
  
Tech Stack: ${app.tech_stack.join(', ')}
Features: ${app.features.join(', ')}

Please suggest customizations for my project.`;

  const response = await routeToAgent(prompt, 'en');
  // Agent suggests: color scheme, features to add/remove, deployment options
};
```

**Agents Used:**
- **Frontend Agent (Claude 3.5)**: UI/UX customization suggestions
- **Backend Agent (DeepSeek R1)**: Database schema modifications
- **UXUI Agent (Gemini 2.0)**: Design system adjustments

**Example Flow:**
1. User clicks "Customize with AI" on My Purchases page
2. Opens customization modal with chat interface
3. User asks: "Change color scheme to dark purple"
4. AI generates customized template files
5. User previews changes
6. Downloads customized template

---

## 🧪 Testing Checklist

### Database
- [ ] Run all migrations successfully
- [ ] Test RLS policies (user, seller, admin roles)
- [ ] Verify triggers (rating update, download count)
- [ ] Check indexes for query performance

### Service Layer
- [ ] Browse apps with various filters
- [ ] Create/update/delete apps as seller
- [ ] Purchase free app (auto-complete)
- [ ] Purchase paid app (Pesapal flow)
- [ ] Create/update/delete reviews
- [ ] Mark reviews as helpful
- [ ] Generate template with customizations
- [ ] Track downloads correctly

### UI Components
- [ ] AppCard displays all app info correctly
- [ ] ReviewCard shows ratings and helpful votes
- [ ] CategoryFilter changes selection
- [ ] PurchaseModal handles free/paid apps
- [ ] All retro styling consistent (border-2, font-pixel)

### Pages
- [ ] Marketplace home loads featured + filtered apps
- [ ] App detail shows tabs, reviews, purchase button
- [ ] My Purchases shows owned apps
- [ ] Seller Dashboard displays stats and apps
- [ ] Create app form validates and submits
- [ ] Submit for review changes status

### Payment
- [ ] Pesapal sandbox mode works
- [ ] Free apps complete instantly
- [ ] Paid apps redirect to Pesapal
- [ ] Callback updates purchase status
- [ ] IPN webhook processes correctly

### Download
- [ ] Template generates with correct files
- [ ] ZIP file downloads successfully
- [ ] Placeholders replaced correctly
- [ ] Download count increments

### Security
- [ ] Users can't access other users' purchases
- [ ] Sellers can only edit own apps
- [ ] Reviews require authentication
- [ ] Payment webhooks verify signatures

---

## 🚀 Deployment

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Pesapal
PESAPAL_CONSUMER_KEY=your_consumer_key
PESAPAL_CONSUMER_SECRET=your_consumer_secret

# OpenRouter (for AI customization)
OPENROUTER_API_KEY=your_openrouter_key
```

### Database Setup

```bash
# Run migrations
npx supabase migration up

# Or push to Supabase
npx supabase db push
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

---

## 📈 Analytics & Monitoring

### Key Metrics

**Marketplace Performance:**
- Total apps listed
- Total purchases (free + paid)
- Revenue generated (KES)
- Average app rating
- Top categories
- Top sellers

**User Engagement:**
- Page views per app
- Search queries
- Filter usage
- Download count
- Review submission rate

**Seller Success:**
- Apps per seller
- Approval rate
- Revenue per seller
- Response time to reviews

### Queries

```sql
-- Top selling apps
SELECT 
  a.name,
  COUNT(p.id) as purchases,
  SUM(p.amount) as revenue
FROM marketplace_apps a
LEFT JOIN app_purchases p ON a.id = p.app_id
WHERE p.status = 'completed'
GROUP BY a.id
ORDER BY purchases DESC
LIMIT 10;

-- Category distribution
SELECT 
  category,
  COUNT(*) as count,
  AVG(price) as avg_price,
  AVG(rating_average) as avg_rating
FROM marketplace_apps
WHERE status = 'approved'
GROUP BY category
ORDER BY count DESC;

-- Seller leaderboard
SELECT 
  u.email,
  COUNT(a.id) as total_apps,
  SUM(p.amount) as total_revenue,
  AVG(a.rating_average) as avg_rating
FROM auth.users u
JOIN marketplace_apps a ON u.id = a.seller_id
LEFT JOIN app_purchases p ON a.id = p.app_id AND p.status = 'completed'
GROUP BY u.id
ORDER BY total_revenue DESC
LIMIT 10;
```

---

## 🛠️ Troubleshooting

### Common Issues

**1. Migration Fails**
```bash
# Reset database (dev only)
npx supabase db reset

# Re-run migrations
npx supabase migration up
```

**2. RLS Denies Access**
```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'marketplace_apps';

-- Test as user
SET ROLE authenticated;
SET request.jwt.claims.sub = 'user-uuid';
SELECT * FROM marketplace_apps;
```

**3. Payment Callback Fails**
- Verify Pesapal webhook URL in dashboard
- Check IPN endpoint logs
- Ensure merchant_reference is unique

**4. Template Download Empty**
- Verify `template_files` JSONB is not empty
- Check ZIP generation (JSZip logs)
- Ensure browser allows downloads

---

## 🎯 Future Enhancements

### Phase 2 (Post-Launch)

1. **Advanced Search**
   - Elasticsearch integration
   - Full-text search
   - Faceted filters
   - Autocomplete suggestions

2. **Template Builder**
   - Drag-and-drop interface
   - Visual customization
   - Live preview
   - Export to code

3. **Version Management**
   - Multiple template versions
   - Changelog tracking
   - Auto-update notifications
   - Rollback support

4. **Affiliate Program**
   - Referral links
   - Commission tracking
   - Payout management

5. **Bundle Deals**
   - Multi-app packages
   - Discounted pricing
   - One-click purchase

6. **Template Ratings 2.0**
   - Separate ratings: Code Quality, Documentation, Support
   - Verified buyer badge
   - Review moderation

7. **AI-Powered Recommendations**
   - Personalized suggestions
   - "Customers also bought"
   - Category trends

8. **Sandbox Preview**
   - In-browser template preview
   - Live code editing
   - Test before purchase

---

## 📚 Resources

### Documentation
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Pesapal API](https://developer.pesapal.com/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Inspiration
- [ThemeForest](https://themeforest.net/)
- [TemplateMonster](https://www.templatemonster.com/)
- [Creative Tim](https://www.creative-tim.com/)
- [Gumroad](https://gumroad.com/)

---

## 🏆 Success Metrics

**Target (3 months post-launch):**
- [ ] 50+ app templates listed
- [ ] 500+ purchases (free + paid)
- [ ] KES 1,000,000+ revenue
- [ ] 4.5+ average marketplace rating
- [ ] 20+ active sellers
- [ ] 1000+ daily visitors

**Competitive Position:**
- ✅ Only marketplace with 20-language AI customization
- ✅ Only marketplace with M-Pesa payment (Africa-first)
- ✅ Only marketplace with integrated learning platform
- ✅ Only marketplace with real-time collaboration
- ✅ Best pricing (KES 5K-20K vs $50-500)

---

**Built with ❤️ by AfriNova Team**
**Version:** 1.0.0 (Feature #12)
**Last Updated:** 2024
