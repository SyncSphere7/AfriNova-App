/**
 * Individual API Key Management
 * PATCH /api/v1/keys/:id - Update specific key
 * DELETE /api/v1/keys/:id - Delete specific key
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { revokeApiKey, deleteApiKey, allocateCredits } from '@/lib/services/api-keys';
import { createErrorResponse, createSuccessResponse } from '@/lib/middleware/api-auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 'Please log in', 401);
    }

    const body = await request.json();

    // Revoke key
    if (body.status === 'revoked') {
      const result = await revokeApiKey(params.id, user.id);
      if (!result.success) {
        return createErrorResponse('Update Failed', result.error || 'Failed to revoke', 500);
      }
      return createSuccessResponse({ message: 'Key revoked', key_id: params.id });
    }

    // Allocate credits
    if (body.allocate_credits) {
      const result = await allocateCredits(params.id, user.id, body.allocate_credits);
      if (!result.success) {
        return createErrorResponse('Update Failed', result.error || 'Failed to allocate', 500);
      }
      return createSuccessResponse({
        message: `Allocated ${body.allocate_credits} credits`,
        key_id: params.id,
      });
    }

    return createErrorResponse('Validation Error', 'Invalid update operation', 400);
  } catch (error) {
    console.error('Error in PATCH /api/v1/keys/:id:', error);
    return createErrorResponse('Server Error', 'An unexpected error occurred', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 'Please log in', 401);
    }

    const result = await deleteApiKey(params.id, user.id);

    if (!result.success) {
      return createErrorResponse('Deletion Failed', result.error || 'Failed to delete', 500);
    }

    return createSuccessResponse({ message: 'Key deleted', key_id: params.id });
  } catch (error) {
    console.error('Error in DELETE /api/v1/keys/:id:', error);
    return createErrorResponse('Server Error', 'An unexpected error occurred', 500);
  }
}
