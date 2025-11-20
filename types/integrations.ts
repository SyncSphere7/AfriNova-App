export type IntegrationAuthType = 'oauth' | 'api_key' | 'none' | 'custom';
export type IntegrationTier = 'free' | 'starter' | 'growth' | 'pro' | 'enterprise';
export type IntegrationStatus = 'active' | 'beta' | 'coming_soon' | 'deprecated';
export type SetupComplexity = 'easy' | 'medium' | 'hard';
export type UserIntegrationStatus = 'active' | 'inactive' | 'error' | 'expired';

export interface IntegrationCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  created_at: string;
}

export interface Integration {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  provider: string;
  description: string | null;
  logo_url: string | null;
  documentation_url: string | null;
  website_url: string | null;

  auth_type: IntegrationAuthType;
  oauth_config: Record<string, any>;
  config_schema: Record<string, any>;
  required_credentials?: string[];

  tier_required: IntegrationTier;
  status: IntegrationStatus;

  is_popular: boolean;
  is_recommended: boolean;
  region_focus: string[] | null;

  features: string[] | null;
  tags: string[] | null;

  setup_complexity: SetupComplexity;
  estimated_setup_time_minutes: number;

  rate_limit_per_hour: number;
  rate_limit_per_day: number;

  created_at: string;
  updated_at: string;

  category?: IntegrationCategory;
}

export interface UserIntegration {
  id: string;
  user_id: string;
  integration_id: string;

  credentials_encrypted: any;
  encryption_key_id: string | null;
  credentials?: IntegrationCredentials;

  config: Record<string, any>;

  oauth_access_token: string | null;
  oauth_refresh_token: string | null;
  oauth_token_expires_at: string | null;
  oauth_scope: string[] | null;

  status: UserIntegrationStatus;
  last_error: string | null;
  last_error_at: string | null;

  connected_at: string;
  last_used_at: string | null;
  last_synced_at: string | null;

  usage_count: number;

  metadata: Record<string, any>;

  created_at: string;
  updated_at: string;

  integration?: Integration;
}

export interface IntegrationWebhook {
  id: string;
  user_integration_id: string;

  webhook_url: string;
  webhook_secret: string;

  events: string[];

  is_active: boolean;

  last_triggered_at: string | null;
  success_count: number;
  failure_count: number;

  created_at: string;
  updated_at: string;
}

export interface IntegrationLog {
  id: string;
  user_integration_id: string;

  action: string;
  status: 'success' | 'error' | 'warning';

  request_data: Record<string, any> | null;
  response_data: Record<string, any> | null;

  error_message: string | null;
  error_code: string | null;

  duration_ms: number | null;

  ip_address: string | null;
  user_agent: string | null;

  created_at: string;
}

export interface IntegrationRateLimit {
  id: string;
  user_integration_id: string;

  window_start: string;
  window_end: string;

  request_count: number;
  limit_per_window: number;

  created_at: string;
  updated_at: string;
}

export interface IntegrationCredentials {
  api_key?: string;
  api_secret?: string;
  consumer_key?: string;
  consumer_secret?: string;
  access_token?: string;
  refresh_token?: string;
  client_id?: string;
  client_secret?: string;
  webhook_secret?: string;
  [key: string]: string | undefined;
}

export interface ConnectIntegrationRequest {
  integration_id: string;
  credentials?: IntegrationCredentials;
  config?: Record<string, any>;
}

export interface OAuthCallbackData {
  code: string;
  state: string;
  integration_slug: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  default_branch: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  url: string;
}

export interface CreateRepositoryRequest {
  name: string;
  description?: string;
  private: boolean;
  auto_init?: boolean;
  gitignore_template?: string;
  license_template?: string;
}

export interface CommitToRepositoryRequest {
  owner: string;
  repo: string;
  branch: string;
  message: string;
  files: Array<{
    path: string;
    content: string;
  }>;
}

export interface IntegrationMarketplaceFilters {
  category?: string;
  tier?: IntegrationTier;
  auth_type?: IntegrationAuthType;
  status?: IntegrationStatus;
  region?: string;
  search?: string;
  is_popular?: boolean;
  is_recommended?: boolean;
}
