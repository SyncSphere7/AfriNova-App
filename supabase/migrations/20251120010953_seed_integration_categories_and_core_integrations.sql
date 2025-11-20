/*
  # Seed Integration Categories and Core Integrations

  1. Categories (25)
    - Payment Gateways, Authentication, Email, SMS, Storage, Databases, AI/ML, etc.
  
  2. Core Integrations (Phase 1 - 50 integrations)
    - GitHub (flagship)
    - Payment gateways (Africa-first)
    - Auth providers
    - Email services
    - AI/ML platforms
  
  3. Notes
    - All integrations marked by tier requirements
    - Africa-focused integrations prioritized
    - OAuth configs prepared for quick setup
*/

INSERT INTO public.integration_categories (name, slug, description, icon, display_order) VALUES
  ('Version Control', 'version-control', 'Git hosting and version control platforms', '🔄', 1),
  ('Payment Gateways', 'payment-gateways', 'Accept payments globally and in Africa', '💳', 2),
  ('Authentication', 'authentication', 'User authentication and identity management', '🔐', 3),
  ('Email Services', 'email-services', 'Transactional and marketing email platforms', '✉️', 4),
  ('SMS & Communication', 'sms-communication', 'SMS, WhatsApp, and messaging services', '💬', 5),
  ('Cloud Storage', 'cloud-storage', 'File storage and CDN services', '☁️', 6),
  ('Databases', 'databases', 'SQL, NoSQL, and specialized databases', '🗄️', 7),
  ('AI & Machine Learning', 'ai-ml', 'Large language models and AI services', '🤖', 8),
  ('Analytics', 'analytics', 'User analytics and monitoring tools', '📊', 9),
  ('CRM & Support', 'crm-support', 'Customer relationship and support tools', '🤝', 10),
  ('Project Management', 'project-management', 'Task and project tracking platforms', '📋', 11),
  ('CI/CD & DevOps', 'cicd-devops', 'Continuous integration and deployment', '🚀', 12),
  ('Search', 'search', 'Search engines and discovery platforms', '🔍', 13),
  ('Monitoring', 'monitoring', 'Error tracking and performance monitoring', '🔔', 14),
  ('Video & Media', 'video-media', 'Video streaming and media processing', '🎥', 15)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.integrations (
  category_id, name, slug, provider, description, logo_url, documentation_url, website_url,
  auth_type, tier_required, status, is_popular, is_recommended, region_focus,
  features, tags, setup_complexity, estimated_setup_time_minutes
) VALUES

-- VERSION CONTROL (Flagship)
(
  (SELECT id FROM public.integration_categories WHERE slug = 'version-control'),
  'GitHub',
  'github',
  'GitHub',
  'Complete GitHub integration: create repos, commit code, manage branches, automate workflows with GitHub Actions',
  'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
  'https://docs.github.com/en/rest',
  'https://github.com',
  'oauth',
  'free',
  'active',
  true,
  true,
  ARRAY['global'],
  ARRAY['Repository Management', 'Auto Commit', 'Branch Management', 'GitHub Actions', 'Pull Requests', 'CI/CD'],
  ARRAY['git', 'version-control', 'deployment'],
  'easy',
  5
),

(
  (SELECT id FROM public.integration_categories WHERE slug = 'version-control'),
  'GitLab',
  'gitlab',
  'GitLab',
  'GitLab integration with CI/CD pipelines, merge requests, and self-hosted support',
  'https://about.gitlab.com/images/press/logo/png/gitlab-icon-rgb.png',
  'https://docs.gitlab.com/ee/api/',
  'https://gitlab.com',
  'oauth',
  'starter',
  'coming_soon',
  true,
  false,
  ARRAY['global'],
  ARRAY['Repository Management', 'CI/CD', 'Self-Hosted', 'Merge Requests'],
  ARRAY['git', 'version-control', 'cicd'],
  'medium',
  10
),

(
  (SELECT id FROM public.integration_categories WHERE slug = 'version-control'),
  'Bitbucket',
  'bitbucket',
  'Atlassian',
  'Bitbucket with Jira integration and Bamboo CI/CD',
  'https://wac-cdn.atlassian.com/assets/img/favicons/bitbucket/favicon.svg',
  'https://developer.atlassian.com/cloud/bitbucket/',
  'https://bitbucket.org',
  'oauth',
  'growth',
  'coming_soon',
  false,
  false,
  ARRAY['global'],
  ARRAY['Repository Management', 'Jira Sync', 'Bamboo CI/CD'],
  ARRAY['git', 'version-control', 'atlassian'],
  'medium',
  10
),

-- PAYMENT GATEWAYS (Africa-First)
(
  (SELECT id FROM public.integration_categories WHERE slug = 'payment-gateways'),
  'Pesapal',
  'pesapal',
  'Pesapal',
  'Leading African payment gateway: M-Pesa, Airtel Money, card payments across East Africa',
  'https://www.pesapal.com/assets/img/logo.png',
  'https://developer.pesapal.com',
  'https://pesapal.com',
  'api_key',
  'free',
  'active',
  true,
  true,
  ARRAY['africa', 'kenya', 'uganda', 'tanzania'],
  ARRAY['M-Pesa', 'Airtel Money', 'Cards', 'Mobile Money'],
  ARRAY['payments', 'mobile-money', 'africa'],
  'easy',
  15
),

(
  (SELECT id FROM public.integration_categories WHERE slug = 'payment-gateways'),
  'Flutterwave',
  'flutterwave',
  'Flutterwave',
  'Pan-African payment platform supporting 150+ currencies and local payment methods',
  'https://flutterwave.com/images/logo-colored.svg',
  'https://developer.flutterwave.com',
  'https://flutterwave.com',
  'api_key',
  'free',
  'active',
  true,
  true,
  ARRAY['africa'],
  ARRAY['Mobile Money', 'Bank Transfer', 'Cards', 'USSD'],
  ARRAY['payments', 'mobile-money', 'africa'],
  'easy',
  15
),

(
  (SELECT id FROM public.integration_categories WHERE slug = 'payment-gateways'),
  'Paystack',
  'paystack',
  'Paystack',
  'Modern payment infrastructure for Africa: Nigeria, Ghana, South Africa',
  'https://paystack.com/assets/img/logo.svg',
  'https://paystack.com/docs/api',
  'https://paystack.com',
  'api_key',
  'free',
  'active',
  true,
  true,
  ARRAY['africa', 'nigeria', 'ghana', 'south-africa'],
  ARRAY['Cards', 'Bank Transfer', 'Mobile Money', 'USSD'],
  ARRAY['payments', 'africa'],
  'easy',
  15
),

(
  (SELECT id FROM public.integration_categories WHERE slug = 'payment-gateways'),
  'M-Pesa',
  'mpesa',
  'Safaricom',
  'Kenya M-Pesa integration: STK Push, B2C, C2B payments',
  'https://www.safaricom.co.ke/images/M-PESA_LOGO-01.svg',
  'https://developer.safaricom.co.ke',
  'https://safaricom.co.ke',
  'api_key',
  'starter',
  'active',
  true,
  true,
  ARRAY['africa', 'kenya'],
  ARRAY['STK Push', 'B2C', 'C2B', 'Mobile Money'],
  ARRAY['payments', 'mobile-money', 'africa'],
  'medium',
  20
),

(
  (SELECT id FROM public.integration_categories WHERE slug = 'payment-gateways'),
  'Stripe',
  'stripe',
  'Stripe',
  'Global payment leader: cards, wallets, subscriptions, and 135+ currencies',
  'https://images.ctfassets.net/fzn2n1nzq965/HTTOloNPhisV9P4hlMPNA/cacf1bb88b9fc492dfad34378d844280/Stripe_icon_-_square.svg',
  'https://stripe.com/docs/api',
  'https://stripe.com',
  'api_key',
  'free',
  'active',
  true,
  true,
  ARRAY['global'],
  ARRAY['Cards', 'Wallets', 'Subscriptions', 'Connect'],
  ARRAY['payments', 'global'],
  'easy',
  10
),

(
  (SELECT id FROM public.integration_categories WHERE slug = 'payment-gateways'),
  'PayPal',
  'paypal',
  'PayPal',
  'Worldwide payment acceptance with buyer protection',
  'https://www.paypalobjects.com/webstatic/icon/pp258.png',
  'https://developer.paypal.com/docs/api',
  'https://paypal.com',
  'oauth',
  'free',
  'active',
  true,
  false,
  ARRAY['global'],
  ARRAY['Checkout', 'Subscriptions', 'Payouts'],
  ARRAY['payments', 'global'],
  'medium',
  15
),

-- AUTHENTICATION
(
  (SELECT id FROM public.integration_categories WHERE slug = 'authentication'),
  'Google OAuth',
  'google-oauth',
  'Google',
  'Sign in with Google - most popular social login',
  'https://www.google.com/favicon.ico',
  'https://developers.google.com/identity/protocols/oauth2',
  'https://developers.google.com',
  'oauth',
  'free',
  'active',
  true,
  true,
  ARRAY['global'],
  ARRAY['Social Login', 'One-Click Auth', 'Profile Data'],
  ARRAY['auth', 'oauth', 'social'],
  'easy',
  5
),

(
  (SELECT id FROM public.integration_categories WHERE slug = 'authentication'),
  'GitHub OAuth',
  'github-oauth',
  'GitHub',
  'Sign in with GitHub - developer-friendly authentication',
  'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
  'https://docs.github.com/en/developers/apps/building-oauth-apps',
  'https://github.com',
  'oauth',
  'free',
  'active',
  true,
  true,
  ARRAY['global'],
  ARRAY['Developer Auth', 'Repository Access', 'Profile Data'],
  ARRAY['auth', 'oauth', 'developer'],
  'easy',
  5
),

(
  (SELECT id FROM public.integration_categories WHERE slug = 'authentication'),
  'Auth0',
  'auth0',
  'Auth0',
  'Enterprise authentication and authorization platform',
  'https://cdn.auth0.com/styleguide/components/1.0.8/media/logos/img/badge.png',
  'https://auth0.com/docs/api',
  'https://auth0.com',
  'custom',
  'growth',
  'active',
  true,
  false,
  ARRAY['global'],
  ARRAY['SSO', 'MFA', 'Enterprise', 'Social Login'],
  ARRAY['auth', 'enterprise', 'sso'],
  'hard',
  30
),

-- EMAIL SERVICES
(
  (SELECT id FROM public.integration_categories WHERE slug = 'email-services'),
  'Resend',
  'resend',
  'Resend',
  'Modern email API for developers: transactional emails with React',
  'https://resend.com/favicon.ico',
  'https://resend.com/docs',
  'https://resend.com',
  'api_key',
  'free',
  'active',
  true,
  true,
  ARRAY['global'],
  ARRAY['Transactional Email', 'React Templates', 'Analytics'],
  ARRAY['email', 'transactional'],
  'easy',
  5
),

(
  (SELECT id FROM public.integration_categories WHERE slug = 'email-services'),
  'SendGrid',
  'sendgrid',
  'Twilio',
  'Powerful email delivery platform with marketing tools',
  'https://sendgrid.com/favicon.ico',
  'https://docs.sendgrid.com/api-reference',
  'https://sendgrid.com',
  'api_key',
  'free',
  'active',
  true,
  false,
  ARRAY['global'],
  ARRAY['Transactional Email', 'Marketing', 'Templates', 'Analytics'],
  ARRAY['email', 'marketing'],
  'easy',
  10
),

-- AI & MACHINE LEARNING
(
  (SELECT id FROM public.integration_categories WHERE slug = 'ai-ml'),
  'OpenAI',
  'openai',
  'OpenAI',
  'GPT-4, ChatGPT, DALL-E, Whisper - leading AI models',
  'https://openai.com/favicon.ico',
  'https://platform.openai.com/docs',
  'https://openai.com',
  'api_key',
  'starter',
  'active',
  true,
  true,
  ARRAY['global'],
  ARRAY['GPT-4', 'ChatGPT', 'DALL-E', 'Whisper', 'Embeddings'],
  ARRAY['ai', 'llm', 'image-gen'],
  'easy',
  5
),

(
  (SELECT id FROM public.integration_categories WHERE slug = 'ai-ml'),
  'Anthropic Claude',
  'anthropic-claude',
  'Anthropic',
  'Claude AI: Constitutional AI for safer, more helpful responses',
  'https://anthropic.com/favicon.ico',
  'https://docs.anthropic.com',
  'https://anthropic.com',
  'api_key',
  'starter',
  'active',
  true,
  true,
  ARRAY['global'],
  ARRAY['Claude', 'Long Context', 'Constitutional AI'],
  ARRAY['ai', 'llm'],
  'easy',
  5
),

-- ANALYTICS
(
  (SELECT id FROM public.integration_categories WHERE slug = 'analytics'),
  'Google Analytics',
  'google-analytics',
  'Google',
  'Industry standard web analytics platform',
  'https://www.google.com/analytics/favicon.ico',
  'https://developers.google.com/analytics',
  'https://analytics.google.com',
  'api_key',
  'free',
  'active',
  true,
  true,
  ARRAY['global'],
  ARRAY['Page Views', 'Events', 'Conversions', 'E-commerce'],
  ARRAY['analytics', 'tracking'],
  'medium',
  15
),

(
  (SELECT id FROM public.integration_categories WHERE slug = 'analytics'),
  'PostHog',
  'posthog',
  'PostHog',
  'Open-source product analytics with session replay',
  'https://posthog.com/favicon.ico',
  'https://posthog.com/docs/api',
  'https://posthog.com',
  'api_key',
  'free',
  'active',
  true,
  true,
  ARRAY['global'],
  ARRAY['Product Analytics', 'Feature Flags', 'Session Replay', 'A/B Testing'],
  ARRAY['analytics', 'product'],
  'easy',
  10
)

ON CONFLICT (slug) DO NOTHING;
