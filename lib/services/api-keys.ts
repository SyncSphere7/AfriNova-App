/**
 * API Keys Service
 * Handles generation, validation, and management of API keys
 */

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// API key format: afn_live_xxxxxxxxxxxxxxxxxxxx (32 chars after prefix)
const API_KEY_PREFIX = 'afn_';
const API_KEY_LENGTH = 32;

export interface ApiKey {
  id: string;
  user_id: string;
  key_hash: string;
  key_prefix: string;
  name: string;
  credits_allocated: number;
  credits_used: number;
  total_requests: number;
  last_used_at: string | null;
  rate_limit_per_minute: number;
  status: 'active' | 'revoked' | 'expired';
  created_at: string;
  expires_at: string | null;
  environment: 'sandbox' | 'production';
}

export interface CreateApiKeyParams {
  name: string;
  credits_allocated?: number;
  rate_limit_per_minute?: number;
  environment?: 'sandbox' | 'production';
  expires_at?: string | null;
}

/**
 * Generate a cryptographically secure API key
 * Format: afn_live_xxxxxxxxxxxxxxxxxxxx or afn_test_xxxxxxxxxxxxxxxxxxxx
 */
export function generateApiKey(environment: 'sandbox' | 'production' = 'production'): string {
  const envPrefix = environment === 'sandbox' ? 'test_' : 'live_';
  const randomBytes = crypto.randomBytes(API_KEY_LENGTH / 2); // 16 bytes = 32 hex chars
  const keyBody = randomBytes.toString('hex');
  return `${API_KEY_PREFIX}${envPrefix}${keyBody}`;
}

/**
 * Hash an API key using SHA-256 for secure storage
 */
export function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Get the display prefix (first 12 chars) of an API key
 * Example: afn_live_abc... (for UI display)
 */
export function getKeyPrefix(apiKey: string): string {
  return apiKey.substring(0, 12) + '...';
}

/**
 * Create a new API key for a user
 */
export async function createApiKey(
  userId: string,
  params: CreateApiKeyParams
): Promise<{ apiKey: string; keyData: ApiKey } | { error: string }> {
  try {
    const supabase = createClient();

    // Generate the API key
    const apiKey = generateApiKey(params.environment || 'production');
    const keyHash = hashApiKey(apiKey);
    const keyPrefix = getKeyPrefix(apiKey);

    // Default rate limit based on plan (can be customized)
    const defaultRateLimit = params.rate_limit_per_minute || 30;

    // Insert into database
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: userId,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        name: params.name,
        credits_allocated: params.credits_allocated || 0,
        rate_limit_per_minute: defaultRateLimit,
        environment: params.environment || 'production',
        expires_at: params.expires_at || null,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating API key:', error);
      return { error: 'Failed to create API key' };
    }

    // Return both the plain API key (only time user sees it) and the database record
    return {
      apiKey, // Plain key - show this ONCE to the user
      keyData: data as ApiKey,
    };
  } catch (error) {
    console.error('Error in createApiKey:', error);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Validate an API key and return the key data if valid
 * Also checks rate limits
 */
export async function validateApiKey(
  apiKey: string
): Promise<{ valid: true; keyData: ApiKey } | { valid: false; error: string }> {
  try {
    const supabase = createClient();
    const keyHash = hashApiKey(apiKey);

    // Fetch the API key from database
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key_hash', keyHash)
      .single();

    if (error || !data) {
      return { valid: false, error: 'Invalid API key' };
    }

    const keyData = data as ApiKey;

    // Check if key is active
    if (keyData.status !== 'active') {
      return { valid: false, error: `API key is ${keyData.status}` };
    }

    // Check if key has expired
    if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
      // Auto-revoke expired keys
      await supabase
        .from('api_keys')
        .update({ status: 'expired' })
        .eq('id', keyData.id);

      return { valid: false, error: 'API key has expired' };
    }

    // Check rate limit
    const now = new Date();
    const resetTime = new Date(keyData.rate_limit_reset_at || now);
    
    if (resetTime < now) {
      // Reset counter if time window passed
      await supabase
        .from('api_keys')
        .update({
          requests_this_minute: 0,
          rate_limit_reset_at: new Date(now.getTime() + 60000).toISOString(),
        })
        .eq('id', keyData.id);
      
      keyData.requests_this_minute = 0;
    } else if ((keyData.requests_this_minute || 0) >= keyData.rate_limit_per_minute) {
      return {
        valid: false,
        error: `Rate limit exceeded. Max ${keyData.rate_limit_per_minute} requests per minute.`,
      };
    }

    // Increment request counter
    await supabase
      .from('api_keys')
      .update({
        requests_this_minute: (keyData.requests_this_minute || 0) + 1,
        last_used_at: now.toISOString(),
      })
      .eq('id', keyData.id);

    return { valid: true, keyData };
  } catch (error) {
    console.error('Error validating API key:', error);
    return { valid: false, error: 'Failed to validate API key' };
  }
}

/**
 * Get all API keys for a user
 */
export async function getUserApiKeys(userId: string): Promise<ApiKey[] | null> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching API keys:', error);
      return null;
    }

    return data as ApiKey[];
  } catch (error) {
    console.error('Error in getUserApiKeys:', error);
    return null;
  }
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(
  keyId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('api_keys')
      .update({ status: 'revoked' })
      .eq('id', keyId)
      .eq('user_id', userId); // Ensure user owns the key

    if (error) {
      console.error('Error revoking API key:', error);
      return { success: false, error: 'Failed to revoke API key' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in revokeApiKey:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Delete an API key permanently
 */
export async function deleteApiKey(
  keyId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', keyId)
      .eq('user_id', userId); // Ensure user owns the key

    if (error) {
      console.error('Error deleting API key:', error);
      return { success: false, error: 'Failed to delete API key' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteApiKey:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Update API key credits (for purchases/allocations)
 */
export async function allocateCredits(
  keyId: string,
  userId: string,
  creditsToAdd: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    // Fetch current credits
    const { data: keyData, error: fetchError } = await supabase
      .from('api_keys')
      .select('credits_allocated')
      .eq('id', keyId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !keyData) {
      return { success: false, error: 'API key not found' };
    }

    // Add credits
    const newTotal = (keyData.credits_allocated || 0) + creditsToAdd;

    const { error } = await supabase
      .from('api_keys')
      .update({ credits_allocated: newTotal })
      .eq('id', keyId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error allocating credits:', error);
      return { success: false, error: 'Failed to allocate credits' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in allocateCredits:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Check if user has sufficient credits
 */
export async function hasCredits(
  keyId: string,
  requiredCredits: number
): Promise<{ hasCredits: boolean; available: number }> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('api_keys')
      .select('credits_allocated, credits_used')
      .eq('id', keyId)
      .single();

    if (error || !data) {
      return { hasCredits: false, available: 0 };
    }

    const available = (data.credits_allocated || 0) - (data.credits_used || 0);
    return {
      hasCredits: available >= requiredCredits,
      available,
    };
  } catch (error) {
    console.error('Error checking credits:', error);
    return { hasCredits: false, available: 0 };
  }
}
