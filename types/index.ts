export type SubscriptionTier = 'free' | 'starter' | 'growth' | 'pro';

export type ProjectStatus = 'draft' | 'generating' | 'completed' | 'failed';

export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: SubscriptionTier;
  stripe_customer_id: string | null;
  generations_used: number;
  generations_limit: number;
  created_at: string;
  updated_at: string;
}

export interface TechStack {
  frontend?: string;
  backend?: string;
  database?: string;
  styling?: string;
  payments?: string[];
  integrations?: string[];
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  tech_stack: TechStack;
  prompt: string;
  enhanced_prompt: string | null;
  status: ProjectStatus;
  generated_code: Record<string, any> | null;
  error_message: string | null;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface Generation {
  id: string;
  project_id: string;
  user_id: string;
  prompt: string;
  enhanced_prompt: string | null;
  status: GenerationStatus;
  tokens_used: number;
  cost: number;
  model_used: string | null;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string | null;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface UploadedFile {
  id: string;
  project_id: string;
  user_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  created_at: string;
}
