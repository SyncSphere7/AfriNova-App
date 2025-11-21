-- Seed Marketplace Apps
-- 12 diverse app templates across all categories
-- Prices in USD (will be converted to user's local currency: KES, TZS, UGX, EUR, etc.)

-- Get the first user as the seller (you'll need to update this with a real user ID)
DO $$
DECLARE
  seller_id uuid;
BEGIN
  -- Get first user or create a demo seller
  SELECT id INTO seller_id FROM auth.users LIMIT 1;
  
  IF seller_id IS NULL THEN
    -- Create demo seller if no users exist
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'seller@afrinova.com',
      crypt('demo123', gen_salt('bf')),
      now(),
      now(),
      now()
    )
    RETURNING id INTO seller_id;
  END IF;

  -- 1. E-Commerce Store ($116 USD = ~15,000 KES)
  INSERT INTO marketplace_apps (
    seller_id, slug, name, tagline, description, icon, category, 
    tags, tech_stack, price, currency, is_free, status, 
    downloads_count, rating_average, rating_count, features, template_files
  ) VALUES (
    seller_id,
    'ecommerce-store-pro',
    'E-Commerce Store Pro',
    'Complete online store with shopping cart and checkout',
    'A fully-featured e-commerce platform built with Next.js and Stripe. Includes product catalog, shopping cart, checkout flow, order management, and admin dashboard. Perfect for launching your online store quickly.',
    '🛒',
    'ecommerce',
    ARRAY['ecommerce', 'store', 'shopping', 'stripe', 'nextjs'],
    ARRAY['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Stripe', 'Supabase'],
    116,
    'USD',
    false,
    'approved',
    47,
    4.8,
    12,
    ARRAY[
      'Product catalog with search and filters',
      'Shopping cart with quantity management',
      'Stripe payment integration',
      'Order tracking and history',
      'Admin dashboard for inventory',
      'Customer reviews and ratings',
      'Mobile-responsive design',
      'Email notifications'
    ],
    jsonb_build_object(
      'app/page.tsx', 'export default function HomePage() { /* Store homepage */ }',
      'app/products/[id]/page.tsx', 'export default function ProductPage() { /* Product details */ }',
      'app/cart/page.tsx', 'export default function CartPage() { /* Shopping cart */ }',
      'lib/stripe.ts', 'import Stripe from "stripe"; /* Stripe config */'
    )
  );

  -- 2. SaaS Dashboard
  INSERT INTO marketplace_apps (
    seller_id, slug, name, tagline, description, icon, category, 
    tags, tech_stack, price, currency, is_free, status, 
    downloads_count, rating_average, rating_count, features, template_files
  ) VALUES (
    seller_id,
    'saas-dashboard-starter',
    'SaaS Dashboard Starter',
    'Modern SaaS dashboard with analytics and billing',
    'Production-ready SaaS dashboard template with authentication, analytics, subscription billing, and team management. Built with best practices and ready to customize for your SaaS product.',
    '💼',
    'saas',
    ARRAY['saas', 'dashboard', 'analytics', 'billing', 'nextjs'],
    ARRAY['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Recharts'],
    140,
    'KES',
    false,
    'approved',
    89,
    4.9,
    23,
    ARRAY[
      'User authentication with Supabase Auth',
      'Subscription billing with Stripe',
      'Analytics dashboard with charts',
      'Team management and invitations',
      'Role-based access control',
      'Activity logs and audit trail',
      'Email notifications',
      'API documentation'
    ],
    jsonb_build_object(
      'app/dashboard/page.tsx', 'export default function DashboardPage() { /* Dashboard */ }',
      'app/dashboard/analytics/page.tsx', 'export default function AnalyticsPage() { /* Analytics */ }',
      'app/dashboard/billing/page.tsx', 'export default function BillingPage() { /* Billing */ }',
      'lib/analytics.ts', '/* Analytics service */'
    )
  );

  -- 3. Developer Portfolio
  INSERT INTO marketplace_apps (
    seller_id, slug, name, tagline, description, icon, category, 
    tags, tech_stack, price, currency, is_free, status, 
    downloads_count, rating_average, rating_count, features, template_files
  ) VALUES (
    seller_id,
    'dev-portfolio-nextjs',
    'Developer Portfolio',
    'Stunning portfolio website for developers',
    'Showcase your projects and skills with this modern portfolio template. Features smooth animations, dark mode, blog integration, and contact form. Perfect for developers, designers, and freelancers.',
    '🎨',
    'portfolio',
    ARRAY['portfolio', 'personal', 'developer', 'blog', 'nextjs'],
    ARRAY['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'MDX'],
    39,
    'KES',
    false,
    'approved',
    156,
    4.7,
    34,
    ARRAY[
      'Hero section with animations',
      'Projects showcase with filters',
      'Skills and experience timeline',
      'Blog with MDX support',
      'Contact form with email',
      'Dark/light mode toggle',
      'Mobile-responsive design',
      'SEO optimized'
    ],
    jsonb_build_object(
      'app/page.tsx', 'export default function HomePage() { /* Portfolio home */ }',
      'app/projects/page.tsx', 'export default function ProjectsPage() { /* Projects */ }',
      'app/blog/page.tsx', 'export default function BlogPage() { /* Blog */ }',
      'components/hero.tsx', '/* Hero component */'
    )
  );

  -- 4. Blog Platform (FREE)
  INSERT INTO marketplace_apps (
    seller_id, slug, name, tagline, description, icon, category, 
    tags, tech_stack, price, currency, is_free, status, 
    downloads_count, rating_average, rating_count, features, template_files
  ) VALUES (
    seller_id,
    'blog-platform-mdx',
    'Blog Platform',
    'Modern blog with MDX and dark mode',
    'Clean and fast blog platform with MDX support, syntax highlighting, reading time estimates, and SEO optimization. Includes author profiles, categories, and tags.',
    '📝',
    'blog',
    ARRAY['blog', 'mdx', 'content', 'nextjs', 'free'],
    ARRAY['Next.js 14', 'TypeScript', 'Tailwind CSS', 'MDX', 'Contentlayer'],
    0,
    'KES',
    true,
    'approved',
    234,
    4.6,
    45,
    ARRAY[
      'MDX support for rich content',
      'Syntax highlighting for code',
      'Reading time estimates',
      'Author profiles and bios',
      'Categories and tags',
      'Search functionality',
      'RSS feed generation',
      'SEO and Open Graph tags'
    ],
    jsonb_build_object(
      'app/blog/page.tsx', 'export default function BlogPage() { /* Blog listing */ }',
      'app/blog/[slug]/page.tsx', 'export default function PostPage() { /* Post */ }',
      'content/posts/hello-world.mdx', '/* Sample blog post */',
      'lib/mdx.ts', '/* MDX utilities */'
    )
  );

  -- 5. Social Network
  INSERT INTO marketplace_apps (
    seller_id, slug, name, tagline, description, icon, category, 
    tags, tech_stack, price, currency, is_free, status, 
    downloads_count, rating_average, rating_count, features, template_files
  ) VALUES (
    seller_id,
    'social-network-realtime',
    'Social Network',
    'Real-time social platform with posts and messaging',
    'Build your own social network with real-time features. Includes user profiles, posts, likes, comments, direct messaging, notifications, and friend system. Perfect for community platforms.',
    '👥',
    'social',
    ARRAY['social', 'realtime', 'messaging', 'community', 'nextjs'],
    ARRAY['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Supabase Realtime', 'WebRTC'],
    155,
    'KES',
    false,
    'approved',
    62,
    4.8,
    18,
    ARRAY[
      'User profiles with avatars',
      'Create and share posts',
      'Like and comment system',
      'Real-time notifications',
      'Direct messaging',
      'Friend/follow system',
      'Feed algorithm',
      'Image uploads'
    ],
    jsonb_build_object(
      'app/feed/page.tsx', 'export default function FeedPage() { /* Feed */ }',
      'app/profile/[id]/page.tsx', 'export default function ProfilePage() { /* Profile */ }',
      'app/messages/page.tsx', 'export default function MessagesPage() { /* Messages */ }',
      'lib/realtime.ts', '/* Realtime service */'
    )
  );

  -- 6. Admin Dashboard (FREE)
  INSERT INTO marketplace_apps (
    seller_id, slug, name, tagline, description, icon, category, 
    tags, tech_stack, price, currency, is_free, status, 
    downloads_count, rating_average, rating_count, features, template_files
  ) VALUES (
    seller_id,
    'admin-dashboard-free',
    'Admin Dashboard',
    'Clean admin panel with charts and tables',
    'Professional admin dashboard template with charts, data tables, forms, and responsive layout. Includes user management, settings, and analytics. Free and open source.',
    '📊',
    'dashboard',
    ARRAY['admin', 'dashboard', 'charts', 'tables', 'free'],
    ARRAY['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Recharts', 'TanStack Table'],
    0,
    'KES',
    true,
    'approved',
    312,
    4.5,
    67,
    ARRAY[
      'Interactive charts and graphs',
      'Data tables with sorting/filtering',
      'User management interface',
      'Settings and configuration',
      'Responsive sidebar navigation',
      'Dark mode support',
      'Form validation',
      'Export to CSV/PDF'
    ],
    jsonb_build_object(
      'app/admin/page.tsx', 'export default function AdminPage() { /* Overview */ }',
      'app/admin/users/page.tsx', 'export default function UsersPage() { /* Users */ }',
      'components/charts/line-chart.tsx', '/* Chart components */',
      'components/data-table.tsx', '/* Data table component */'
    )
  );

  -- 7. Landing Page
  INSERT INTO marketplace_apps (
    seller_id, slug, name, tagline, description, icon, category, 
    tags, tech_stack, price, currency, is_free, status, 
    downloads_count, rating_average, rating_count, features, template_files
  ) VALUES (
    seller_id,
    'saas-landing-page',
    'SaaS Landing Page',
    'High-converting landing page for SaaS products',
    'Beautiful landing page template designed to convert visitors into customers. Features pricing tables, testimonials, FAQ, and waitlist signup. Optimized for speed and SEO.',
    '🚀',
    'landing',
    ARRAY['landing', 'saas', 'marketing', 'conversion', 'nextjs'],
    ARRAY['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'React Hook Form'],
    62,
    'KES',
    false,
    'approved',
    128,
    4.9,
    29,
    ARRAY[
      'Hero section with CTA',
      'Features showcase',
      'Pricing tables with comparison',
      'Customer testimonials',
      'FAQ section',
      'Email waitlist signup',
      'Smooth scroll animations',
      'Mobile-optimized'
    ],
    jsonb_build_object(
      'app/page.tsx', 'export default function LandingPage() { /* Landing */ }',
      'components/hero.tsx', '/* Hero component */',
      'components/pricing.tsx', '/* Pricing component */',
      'components/testimonials.tsx', '/* Testimonials component */'
    )
  );

  -- 8. Mobile App Template
  INSERT INTO marketplace_apps (
    seller_id, slug, name, tagline, description, icon, category, 
    tags, tech_stack, price, currency, is_free, status, 
    downloads_count, rating_average, rating_count, features, template_files
  ) VALUES (
    seller_id,
    'react-native-starter',
    'React Native Starter',
    'Cross-platform mobile app with navigation',
    'Complete React Native template with navigation, authentication, state management, and API integration. Build iOS and Android apps from a single codebase with Expo.',
    '📱',
    'mobile',
    ARRAY['mobile', 'react-native', 'expo', 'ios', 'android'],
    ARRAY['React Native', 'TypeScript', 'Expo', 'React Navigation', 'Zustand'],
    93,
    'KES',
    false,
    'approved',
    94,
    4.7,
    21,
    ARRAY[
      'Tab and stack navigation',
      'User authentication flow',
      'State management with Zustand',
      'API integration examples',
      'Push notifications',
      'Offline storage',
      'Custom components library',
      'iOS and Android support'
    ],
    jsonb_build_object(
      'App.tsx', 'export default function App() { /* Root app */ }',
      'src/navigation/index.tsx', '/* Navigation setup */',
      'src/screens/HomeScreen.tsx', '/* Home screen */',
      'src/api/client.ts', '/* API client */'
    )
  );

  -- 9. AI Dashboard
  INSERT INTO marketplace_apps (
    seller_id, slug, name, tagline, description, icon, category, 
    tags, tech_stack, price, currency, is_free, status, 
    downloads_count, rating_average, rating_count, features, template_files
  ) VALUES (
    seller_id,
    'ai-dashboard-chatgpt',
    'AI Dashboard',
    'ChatGPT-style interface with OpenAI integration',
    'Modern AI chat interface similar to ChatGPT. Includes conversation history, streaming responses, code syntax highlighting, and model selection. Integrate with OpenAI, Claude, or custom models.',
    '🤖',
    'ai',
    ARRAY['ai', 'chatgpt', 'openai', 'chat', 'nextjs'],
    ARRAY['Next.js 14', 'TypeScript', 'Tailwind CSS', 'OpenAI', 'Vercel AI SDK'],
    124,
    'KES',
    false,
    'approved',
    73,
    4.8,
    16,
    ARRAY[
      'ChatGPT-style interface',
      'Streaming AI responses',
      'Conversation history',
      'Code syntax highlighting',
      'Multiple AI model support',
      'Markdown rendering',
      'Export conversations',
      'Dark mode'
    ],
    jsonb_build_object(
      'app/chat/page.tsx', 'export default function ChatPage() { /* Chat interface */ }',
      'app/api/chat/route.ts', '/* API route for chat */',
      'lib/openai.ts', '/* OpenAI configuration */',
      'components/message.tsx', '/* Message component */'
    )
  );

  -- 10. Analytics Platform
  INSERT INTO marketplace_apps (
    seller_id, slug, name, tagline, description, icon, category, 
    tags, tech_stack, price, currency, is_free, status, 
    downloads_count, rating_average, rating_count, features, template_files
  ) VALUES (
    seller_id,
    'analytics-platform-dashboard',
    'Analytics Platform',
    'Real-time analytics dashboard like Google Analytics',
    'Comprehensive analytics platform with real-time visitor tracking, event logging, conversion funnels, and custom reports. Self-hosted alternative to Google Analytics with full data ownership.',
    '📈',
    'dashboard',
    ARRAY['analytics', 'tracking', 'metrics', 'dashboard', 'realtime'],
    ARRAY['Next.js 14', 'TypeScript', 'Tailwind CSS', 'ClickHouse', 'Recharts'],
    170,
    'KES',
    false,
    'approved',
    51,
    4.9,
    14,
    ARRAY[
      'Real-time visitor tracking',
      'Event and conversion tracking',
      'Funnel analysis',
      'Custom dashboards',
      'Retention cohorts',
      'UTM campaign tracking',
      'API for data ingestion',
      'Privacy-focused (GDPR compliant)'
    ],
    jsonb_build_object(
      'app/analytics/page.tsx', 'export default function AnalyticsPage() { /* Dashboard */ }',
      'app/analytics/events/page.tsx', '/* Events page */',
      'lib/tracking.ts', '/* Tracking SDK */',
      'lib/clickhouse.ts', '/* Database client */'
    )
  );

  -- 11. CRM System
  INSERT INTO marketplace_apps (
    seller_id, slug, name, tagline, description, icon, category, 
    tags, tech_stack, price, currency, is_free, status, 
    downloads_count, rating_average, rating_count, features, template_files
  ) VALUES (
    seller_id,
    'crm-sales-pipeline',
    'CRM & Sales Pipeline',
    'Manage customers and sales with Kanban boards',
    'Complete CRM system with contact management, sales pipeline, task tracking, and email integration. Visualize your sales process with Kanban boards and track performance with analytics.',
    '💼',
    'saas',
    ARRAY['crm', 'sales', 'kanban', 'contacts', 'nextjs'],
    ARRAY['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Supabase', 'DnD Kit'],
    147,
    'KES',
    false,
    'approved',
    68,
    4.7,
    19,
    ARRAY[
      'Contact and company management',
      'Sales pipeline with Kanban view',
      'Task and activity tracking',
      'Email integration',
      'Deal forecasting',
      'Custom fields',
      'Reports and analytics',
      'Team collaboration'
    ],
    jsonb_build_object(
      'app/crm/page.tsx', 'export default function CRMPage() { /* Overview */ }',
      'app/crm/contacts/page.tsx', '/* Contacts page */',
      'app/crm/pipeline/page.tsx', '/* Pipeline with Kanban */',
      'components/kanban-board.tsx', '/* Kanban component */'
    )
  );

  -- 12. Job Board (FREE)
  INSERT INTO marketplace_apps (
    seller_id, slug, name, tagline, description, icon, category, 
    tags, tech_stack, price, currency, is_free, status, 
    downloads_count, rating_average, rating_count, features, template_files
  ) VALUES (
    seller_id,
    'job-board-platform',
    'Job Board Platform',
    'Post and search jobs with applicant tracking',
    'Full-featured job board platform for posting jobs and managing applications. Includes employer dashboard, applicant tracking, resume uploads, and job search with filters. Perfect for niche job boards.',
    '💼',
    'other',
    ARRAY['jobs', 'hiring', 'recruitment', 'careers', 'free'],
    ARRAY['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Uploadthing'],
    0,
    'KES',
    true,
    'approved',
    189,
    4.6,
    38,
    ARRAY[
      'Job posting and management',
      'Advanced job search and filters',
      'Applicant tracking system',
      'Resume upload and parsing',
      'Employer dashboard',
      'Email notifications',
      'Saved jobs and applications',
      'Mobile-responsive'
    ],
    jsonb_build_object(
      'app/jobs/page.tsx', 'export default function JobsPage() { /* Job listing */ }',
      'app/jobs/[id]/page.tsx', '/* Job details */',
      'app/employer/page.tsx', '/* Employer dashboard */',
      'lib/upload.ts', '/* File upload utilities */'
    )
  );

END $$;
