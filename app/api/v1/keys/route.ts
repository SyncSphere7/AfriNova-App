/**
 * API Keys Management Endpoint
 * GET /api/v1/keys - List all API keys for authenticated user
 * POST /api/v1/keys - Create a new API key
 * PATCH /api/v1/keys/:id - Update API key (revoke, allocate credits)
 * DELETE /api/v1/keys/:id - Delete an API key
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  createApiKey,
  getUserApiKeys,
  revokeApiKey,
  deleteApiKey,
  allocateCredits,
} from '@/lib/services/api-keys';
import { createErrorResponse, createSuccessResponse } from '@/lib/middleware/api-auth';

/**
 * GET /api/v1/keys
 * List all API keys for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 'Please log in to access this endpoint', 401);
    }

    // Fetch user's API keys
    const apiKeys = await getUserApiKeys(user.id);

    if (apiKeys === null) {
      return createErrorResponse('Error', 'Failed to fetch API keys', 500);
    }

    return createSuccessResponse({
      keys: apiKeys,
      total: apiKeys.length,
    });
  } catch (error) {
    console.error('Error in GET /api/v1/keys:', error);
    return createErrorResponse('Server Error', 'An unexpected error occurred', 500);
  }
}

/**
 * POST /api/v1/keys
 * Create a new API key
 * 
 * Body:
 * {
 *   "name": "Production API Key",
 *   "environment": "production", // or "sandbox"
 *   "credits_allocated": 1000, // optional
 *   "rate_limit_per_minute": 30, // optional
 *   "expires_at": "2025-12-31T23:59:59Z" // optional
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 'Please log in to create an API key', 401);
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string') {
      return createErrorResponse(
        'Validation Error',
        'API key name is required and must be a string',
        400
      );
    }

    // Validate environment
    const environment = body.environment || 'production';
    if (!['sandbox', 'production'].includes(environment)) {
      return createErrorResponse(
        'Validation Error',
        'Environment must be either "sandbox" or "production"',
        400
      );
    }

    // Create the API key
    const result = await createApiKey(user.id, {
      name: body.name,
      environment,
      credits_allocated: body.credits_allocated,
      rate_limit_per_minute: body.rate_limit_per_minute,
      expires_at: body.expires_at,
    });

    if ('error' in result) {
      return createErrorResponse('Creation Failed', result.error, 500);
    }

    // Return the API key (only time it's shown!)
    return NextResponse.json(
      {
        success: true,
        message: 'API key created successfully. Save this key now - you won\'t see it again!',
        apiKey: result.apiKey, // Plain key - show only once
        keyData: {
          id: result.keyData.id,
          name: result.keyData.name,
          key_prefix: result.keyData.key_prefix,
          environment: result.keyData.environment,
          credits_allocated: result.keyData.credits_allocated,
          rate_limit_per_minute: result.keyData.rate_limit_per_minute,
          status: result.keyData.status,
          created_at: result.keyData.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/v1/keys:', error);
    return createErrorResponse('Server Error', 'An unexpected error occurred', 500);
  }
}

/**
 * PATCH /api/v1/keys/:id
 * Update an API key (revoke or allocate credits)
 * 
 * Body:
 * {
 *   "status": "revoked", // To revoke a key
 *   "allocate_credits": 500 // To add credits
 * }
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 'Please log in to update API keys', 401);
    }

    // Extract key ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const keyId = pathParts[pathParts.length - 1];

    if (!keyId || keyId === 'keys') {
      return createErrorResponse('Validation Error', 'API key ID is required', 400);
    }

    // Parse request body
    const body = await request.json();

    // Handle status update (revoke)
    if (body.status === 'revoked') {
      const result = await revokeApiKey(keyId, user.id);

      if (!result.success) {
        return createErrorResponse('Update Failed', result.error || 'Failed to revoke key', 500);
      }

      return createSuccessResponse({
        message: 'API key revoked successfully',
        key_id: keyId,
        status: 'revoked',
      });
    }

    // Handle credit allocation
    if (body.allocate_credits && typeof body.allocate_credits === 'number') {
      if (body.allocate_credits <= 0) {
        return createErrorResponse(
          'Validation Error',
          'Credits to allocate must be a positive number',
          400
        );
      }

      const result = await allocateCredits(keyId, user.id, body.allocate_credits);

      if (!result.success) {
        return createErrorResponse(
          'Update Failed',
          result.error || 'Failed to allocate credits',
          500
        );
      }

      return createSuccessResponse({
        message: `Successfully allocated ${body.allocate_credits} credits`,
        key_id: keyId,
        credits_added: body.allocate_credits,
      });
    }

    return createErrorResponse(
      'Validation Error',
      'Please provide either "status": "revoked" or "allocate_credits": <number>',
      400
    );
  } catch (error) {
    console.error('Error in PATCH /api/v1/keys:', error);
    return createErrorResponse('Server Error', 'An unexpected error occurred', 500);
  }
}

/**
 * DELETE /api/v1/keys/:id
 * Permanently delete an API key
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 'Please log in to delete API keys', 401);
    }

    // Extract key ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const keyId = pathParts[pathParts.length - 1];

    if (!keyId || keyId === 'keys') {
      return createErrorResponse('Validation Error', 'API key ID is required', 400);
    }

    // Delete the key
    const result = await deleteApiKey(keyId, user.id);

    if (!result.success) {
      return createErrorResponse('Deletion Failed', result.error || 'Failed to delete key', 500);
    }

    return createSuccessResponse({
      message: 'API key deleted successfully',
      key_id: keyId,
    });
  } catch (error) {
    console.error('Error in DELETE /api/v1/keys:', error);
    return createErrorResponse('Server Error', 'An unexpected error occurred', 500);
  }
}
