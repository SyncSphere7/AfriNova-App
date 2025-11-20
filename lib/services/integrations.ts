import { createClient } from '@/lib/supabase/client';
import type {
  Integration,
  IntegrationCategory,
  UserIntegration,
  IntegrationMarketplaceFilters,
  ConnectIntegrationRequest,
  IntegrationCredentials,
} from '@/types/integrations';

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_INTEGRATION_ENCRYPTION_KEY || 'default-key-change-in-production';

export async function encryptCredentials(credentials: IntegrationCredentials): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(credentials));

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  let binary = '';
  for (let i = 0; i < combined.length; i++) {
    binary += String.fromCharCode(combined[i]);
  }
  return btoa(binary);
}

export async function decryptCredentials(encryptedData: string): Promise<IntegrationCredentials> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const encrypted = combined.slice(12);

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted
  );

  return JSON.parse(decoder.decode(decrypted));
}

export async function getIntegrationCategories(): Promise<IntegrationCategory[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('integration_categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getIntegrations(
  filters?: IntegrationMarketplaceFilters
): Promise<Integration[]> {
  const supabase = createClient();

  let query = supabase
    .from('integrations')
    .select(`
      *,
      category:integration_categories(*)
    `)
    .order('name', { ascending: true });

  if (filters?.category) {
    query = query.eq('category_id', filters.category);
  }

  if (filters?.tier) {
    query = query.eq('tier_required', filters.tier);
  }

  if (filters?.auth_type) {
    query = query.eq('auth_type', filters.auth_type);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  } else {
    query = query.in('status', ['active', 'beta']);
  }

  if (filters?.is_popular) {
    query = query.eq('is_popular', true);
  }

  if (filters?.is_recommended) {
    query = query.eq('is_recommended', true);
  }

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,tags.cs.{${filters.search}}`
    );
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function getIntegrationBySlug(slug: string): Promise<Integration | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('integrations')
    .select(`
      *,
      category:integration_categories(*)
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}

export async function getUserIntegrations(): Promise<UserIntegration[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('user_integrations')
    .select(`
      *,
      integration:integrations(
        *,
        category:integration_categories(*)
      )
    `)
    .order('connected_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getUserIntegration(integrationId: string): Promise<UserIntegration | null> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_integrations')
    .select(`
      *,
      integration:integrations(
        *,
        category:integration_categories(*)
      )
    `)
    .eq('user_id', user.id)
    .eq('integration_id', integrationId)
    .maybeSingle();

  if (error) throw error;

  if (data && data.credentials_encrypted) {
    try {
      const decrypted = await decryptCredentials(data.credentials_encrypted);
      return { ...data, credentials: decrypted };
    } catch (e) {
      console.error('Failed to decrypt credentials:', e);
    }
  }

  return data;
}

export async function connectIntegration(
  integrationId: string,
  credentials: IntegrationCredentials
): Promise<UserIntegration> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const existing = await getUserIntegration(integrationId);
  if (existing) {
    await updateIntegrationCredentials(existing.id, credentials);
    const updated = await getUserIntegration(integrationId);
    if (!updated) throw new Error('Failed to fetch updated integration');
    return updated;
  }

  let credentials_encrypted = null;
  if (credentials) {
    credentials_encrypted = await encryptCredentials(credentials);
  }

  const { data, error } = await supabase
    .from('user_integrations')
    .insert({
      user_id: user.id,
      integration_id: integrationId,
      credentials_encrypted,
      config: {},
      status: 'active',
    })
    .select(`
      *,
      integration:integrations(
        *,
        category:integration_categories(*)
      )
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function updateIntegrationCredentials(
  userIntegrationId: string,
  credentials: IntegrationCredentials
): Promise<void> {
  const supabase = createClient();

  const credentials_encrypted = await encryptCredentials(credentials);

  const { error } = await supabase
    .from('user_integrations')
    .update({
      credentials_encrypted,
      status: 'active',
      last_error: null,
      last_error_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userIntegrationId);

  if (error) throw error;
}

export async function disconnectIntegration(userIntegrationId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('user_integrations')
    .delete()
    .eq('id', userIntegrationId);

  if (error) throw error;
}

export async function logIntegrationAction(
  userIntegrationId: string,
  action: string,
  status: 'success' | 'error' | 'warning',
  details?: {
    request_data?: any;
    response_data?: any;
    error_message?: string;
    error_code?: string;
    duration_ms?: number;
  }
): Promise<void> {
  const supabase = createClient();

  await supabase.from('integration_logs').insert({
    user_integration_id: userIntegrationId,
    action,
    status,
    ...details,
  });
}

export async function checkRateLimit(
  userIntegrationId: string,
  integration: Integration
): Promise<boolean> {
  const supabase = createClient();

  const now = new Date();
  const windowStart = new Date(now.getTime() - 60 * 60 * 1000);

  const { data, error } = await supabase
    .from('integration_rate_limits')
    .select('request_count, limit_per_window')
    .eq('user_integration_id', userIntegrationId)
    .gte('window_start', windowStart.toISOString())
    .lte('window_end', now.toISOString())
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  if (data && data.request_count >= data.limit_per_window) {
    return false;
  }

  const { error: upsertError } = await supabase
    .from('integration_rate_limits')
    .upsert({
      user_integration_id: userIntegrationId,
      window_start: windowStart.toISOString(),
      window_end: now.toISOString(),
      request_count: (data?.request_count || 0) + 1,
      limit_per_window: integration.rate_limit_per_hour,
    });

  if (upsertError) throw upsertError;

  return true;
}

export function getIntegrationsByCategory(
  integrations: Integration[]
): Record<string, Integration[]> {
  return integrations.reduce((acc, integration) => {
    const categoryName = integration.category?.name || 'Other';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(integration);
    return acc;
  }, {} as Record<string, Integration[]>);
}

export function filterIntegrationsByTier(
  integrations: Integration[],
  userTier: string
): Integration[] {
  const tierHierarchy: Record<string, number> = {
    free: 0,
    starter: 1,
    growth: 2,
    pro: 3,
    enterprise: 4,
  };

  const userTierLevel = tierHierarchy[userTier] || 0;

  return integrations.filter(integration => {
    const requiredTierLevel = tierHierarchy[integration.tier_required] || 0;
    return userTierLevel >= requiredTierLevel;
  });
}
