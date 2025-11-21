/**
 * API Usage Statistics Endpoint
 * GET /api/v1/usage - Get usage statistics for authenticated user or specific API key
 * 
 * Query params:
 * - api_key_id: Get stats for specific API key (optional)
 * - period: 'day' | 'week' | 'month' | 'all' (default: 'month')
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUsageStats, getUserUsageStats } from '@/lib/services/api-usage-tracker';
import { createErrorResponse, createSuccessResponse } from '@/lib/middleware/api-auth';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 'Please log in to view usage statistics', 401);
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const apiKeyId = searchParams.get('api_key_id');
    const period = searchParams.get('period') || 'month';

    // Validate period
    if (!['day', 'week', 'month', 'all'].includes(period)) {
      return createErrorResponse(
        'Validation Error',
        'Period must be one of: day, week, month, all',
        400
      );
    }

    // If api_key_id provided, get stats for that specific key
    if (apiKeyId) {
      // Verify user owns this API key
      const { data: keyData, error: keyError } = await supabase
        .from('api_keys')
        .select('id, user_id')
        .eq('id', apiKeyId)
        .eq('user_id', user.id)
        .single();

      if (keyError || !keyData) {
        return createErrorResponse(
          'Not Found',
          'API key not found or you do not have access',
          404
        );
      }

      // Get usage stats for this key
      const stats = await getUsageStats(apiKeyId);

      if (!stats) {
        return createErrorResponse('Error', 'Failed to fetch usage statistics', 500);
      }

      return createSuccessResponse({
        api_key_id: apiKeyId,
        period,
        statistics: stats,
      });
    }

    // Get usage across all user's API keys
    const userStats = await getUserUsageStats(user.id);

    if (!userStats) {
      return createErrorResponse('Error', 'Failed to fetch usage statistics', 500);
    }

    return createSuccessResponse({
      period,
      statistics: userStats,
    });
  } catch (error) {
    console.error('Error in GET /api/v1/usage:', error);
    return createErrorResponse('Server Error', 'An unexpected error occurred', 500);
  }
}
