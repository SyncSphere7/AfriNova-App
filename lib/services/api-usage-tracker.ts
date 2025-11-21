/**
 * API Usage Tracking Service
 * Tracks API requests, logs usage, and deducts credits
 */

import { createClient } from '@/lib/supabase/server';

export interface UsageLogParams {
  api_key_id: string;
  user_id: string;
  endpoint: string;
  method: string;
  status_code: number;
  credits_consumed: number;
  tokens_used?: number;
  generation_time_ms?: number;
  prompt_length?: number;
  lines_of_code_generated?: number;
  project_type?: 'component' | 'page' | 'feature' | 'project';
  error_message?: string;
  error_code?: string;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Log an API request to the usage tracking table
 */
export async function logApiUsage(params: UsageLogParams): Promise<boolean> {
  try {
    const supabase = createClient();

    const { error } = await supabase.from('api_usage').insert({
      api_key_id: params.api_key_id,
      user_id: params.user_id,
      endpoint: params.endpoint,
      method: params.method,
      status_code: params.status_code,
      credits_consumed: params.credits_consumed,
      tokens_used: params.tokens_used || 0,
      generation_time_ms: params.generation_time_ms,
      prompt_length: params.prompt_length,
      lines_of_code_generated: params.lines_of_code_generated,
      project_type: params.project_type,
      error_message: params.error_message,
      error_code: params.error_code,
      ip_address: params.ip_address,
      user_agent: params.user_agent,
    });

    if (error) {
      console.error('Error logging API usage:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in logApiUsage:', error);
    return false;
  }
}

/**
 * Deduct credits from an API key after successful usage
 */
export async function deductCredits(
  apiKeyId: string,
  creditsToDeduct: number
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  try {
    const supabase = createClient();

    // Fetch current usage
    const { data: keyData, error: fetchError } = await supabase
      .from('api_keys')
      .select('credits_used, credits_allocated, total_requests')
      .eq('id', apiKeyId)
      .single();

    if (fetchError || !keyData) {
      return { success: false, error: 'API key not found' };
    }

    // Check if user has enough credits
    const available = keyData.credits_allocated - keyData.credits_used;
    if (available < creditsToDeduct) {
      return { success: false, error: 'Insufficient credits' };
    }

    // Deduct credits
    const newCreditsUsed = keyData.credits_used + creditsToDeduct;
    const newTotalRequests = keyData.total_requests + 1;

    const { error: updateError } = await supabase
      .from('api_keys')
      .update({
        credits_used: newCreditsUsed,
        total_requests: newTotalRequests,
      })
      .eq('id', apiKeyId);

    if (updateError) {
      console.error('Error deducting credits:', updateError);
      return { success: false, error: 'Failed to deduct credits' };
    }

    return {
      success: true,
      newBalance: keyData.credits_allocated - newCreditsUsed,
    };
  } catch (error) {
    console.error('Error in deductCredits:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Calculate credits required based on generation complexity
 */
export function calculateCredits(params: {
  projectType: 'component' | 'page' | 'feature' | 'project';
  promptLength?: number;
  estimatedLines?: number;
}): number {
  // Base credits by project type (from API_PRICING.md)
  const baseCreditsByType = {
    component: 1, // ~50 lines
    page: 10, // ~500 lines
    feature: 50, // ~2,500 lines
    project: 200, // ~10,000 lines
  };

  let credits = baseCreditsByType[params.projectType] || 1;

  // Adjust based on prompt length (complex prompts = more work)
  if (params.promptLength && params.promptLength > 500) {
    credits *= 1.2; // 20% more for complex prompts
  }

  // Adjust based on estimated lines
  if (params.estimatedLines) {
    if (params.estimatedLines > 1000) {
      credits *= 1.5;
    } else if (params.estimatedLines > 5000) {
      credits *= 2;
    }
  }

  return Math.ceil(credits);
}

/**
 * Get usage statistics for an API key
 */
export async function getUsageStats(apiKeyId: string) {
  try {
    const supabase = createClient();

    // Get overall stats
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('credits_allocated, credits_used, total_requests, created_at')
      .eq('id', apiKeyId)
      .single();

    if (keyError || !keyData) {
      return null;
    }

    // Get recent usage logs
    const { data: recentUsage, error: usageError } = await supabase
      .from('api_usage')
      .select('*')
      .eq('api_key_id', apiKeyId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (usageError) {
      console.error('Error fetching usage logs:', usageError);
    }

    // Calculate stats
    const totalCreditsUsed = keyData.credits_used;
    const totalCreditsAvailable = keyData.credits_allocated - keyData.credits_used;
    const totalRequests = keyData.total_requests;

    // Usage by endpoint
    const usageByEndpoint: Record<string, number> = {};
    const usageByDay: Record<string, number> = {};
    let successfulRequests = 0;
    let failedRequests = 0;
    let totalGenerationTime = 0;
    let totalLinesGenerated = 0;

    recentUsage?.forEach((log) => {
      // By endpoint
      usageByEndpoint[log.endpoint] = (usageByEndpoint[log.endpoint] || 0) + 1;

      // By day
      const day = new Date(log.created_at).toISOString().split('T')[0];
      usageByDay[day] = (usageByDay[day] || 0) + log.credits_consumed;

      // Success/failure
      if (log.status_code >= 200 && log.status_code < 300) {
        successfulRequests++;
      } else {
        failedRequests++;
      }

      // Performance metrics
      if (log.generation_time_ms) {
        totalGenerationTime += log.generation_time_ms;
      }
      if (log.lines_of_code_generated) {
        totalLinesGenerated += log.lines_of_code_generated;
      }
    });

    const avgGenerationTime =
      successfulRequests > 0 ? totalGenerationTime / successfulRequests : 0;

    return {
      overview: {
        total_credits_allocated: keyData.credits_allocated,
        credits_used: totalCreditsUsed,
        credits_remaining: totalCreditsAvailable,
        total_requests: totalRequests,
        successful_requests: successfulRequests,
        failed_requests: failedRequests,
        success_rate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
      },
      performance: {
        avg_generation_time_ms: Math.round(avgGenerationTime),
        total_lines_generated: totalLinesGenerated,
      },
      usage_by_endpoint: usageByEndpoint,
      usage_by_day: usageByDay,
      recent_logs: recentUsage?.slice(0, 20) || [],
    };
  } catch (error) {
    console.error('Error getting usage stats:', error);
    return null;
  }
}

/**
 * Get usage statistics for a user across all their API keys
 */
export async function getUserUsageStats(userId: string) {
  try {
    const supabase = createClient();

    // Get all user's API keys
    const { data: apiKeys, error: keysError } = await supabase
      .from('api_keys')
      .select('id, name, credits_allocated, credits_used, total_requests, environment, status')
      .eq('user_id', userId);

    if (keysError || !apiKeys) {
      return null;
    }

    // Get usage across all keys
    const keyIds = apiKeys.map((key) => key.id);
    const { data: allUsage, error: usageError } = await supabase
      .from('api_usage')
      .select('*')
      .in('api_key_id', keyIds)
      .order('created_at', { ascending: false })
      .limit(500);

    if (usageError) {
      console.error('Error fetching user usage:', usageError);
    }

    // Aggregate stats
    const totalCreditsAllocated = apiKeys.reduce((sum, key) => sum + key.credits_allocated, 0);
    const totalCreditsUsed = apiKeys.reduce((sum, key) => sum + key.credits_used, 0);
    const totalRequests = apiKeys.reduce((sum, key) => sum + key.total_requests, 0);

    const activeKeys = apiKeys.filter((key) => key.status === 'active').length;
    const productionKeys = apiKeys.filter((key) => key.environment === 'production').length;

    return {
      summary: {
        total_api_keys: apiKeys.length,
        active_keys: activeKeys,
        production_keys: productionKeys,
        total_credits_allocated: totalCreditsAllocated,
        total_credits_used: totalCreditsUsed,
        credits_remaining: totalCreditsAllocated - totalCreditsUsed,
        total_requests: totalRequests,
      },
      keys: apiKeys,
      recent_activity: allUsage?.slice(0, 50) || [],
    };
  } catch (error) {
    console.error('Error getting user usage stats:', error);
    return null;
  }
}

/**
 * Track API request with automatic credit deduction
 * Use this as a wrapper for API operations
 */
export async function trackAndDeduct(params: {
  apiKeyId: string;
  userId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  creditsToDeduct: number;
  tokensUsed?: number;
  generationTimeMs?: number;
  promptLength?: number;
  linesOfCodeGenerated?: number;
  projectType?: 'component' | 'page' | 'feature' | 'project';
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  // Log the usage
  await logApiUsage({
    api_key_id: params.apiKeyId,
    user_id: params.userId,
    endpoint: params.endpoint,
    method: params.method,
    status_code: params.statusCode,
    credits_consumed: params.creditsToDeduct,
    tokens_used: params.tokensUsed,
    generation_time_ms: params.generationTimeMs,
    prompt_length: params.promptLength,
    lines_of_code_generated: params.linesOfCodeGenerated,
    project_type: params.projectType,
    error_message: params.errorMessage,
    ip_address: params.ipAddress,
    user_agent: params.userAgent,
  });

  // Deduct credits if successful
  if (params.statusCode >= 200 && params.statusCode < 300) {
    return await deductCredits(params.apiKeyId, params.creditsToDeduct);
  }

  return { success: true }; // Don't deduct credits for failed requests
}
