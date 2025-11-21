/**
 * API Authentication Middleware
 * Validates Bearer tokens for API requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/services/api-keys';
import type { ApiKey } from '@/lib/services/api-keys';

export interface AuthenticatedRequest extends NextRequest {
  apiKey?: ApiKey;
  userId?: string;
}

/**
 * Extract Bearer token from Authorization header
 */
function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return null;
  }

  // Support both "Bearer <token>" and just "<token>"
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return authHeader;
}

/**
 * Authenticate API request and validate API key
 * Returns the validated API key data or an error response
 */
export async function authenticateApiRequest(
  request: NextRequest
): Promise<
  | { success: true; apiKey: ApiKey; userId: string }
  | { success: false; response: NextResponse }
> {
  // Extract API key from Authorization header
  const apiKey = extractBearerToken(request);

  if (!apiKey) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Missing API key',
          message: 'Please provide an API key in the Authorization header',
          docs: 'https://github.com/SyncSphere7/AfriNova-App/blob/main/API_PRICING.md',
        },
        { status: 401 }
      ),
    };
  }

  // Validate API key format
  if (!apiKey.startsWith('afn_')) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Invalid API key format',
          message: 'API keys must start with "afn_"',
        },
        { status: 401 }
      ),
    };
  }

  // Validate API key and check rate limits
  const validation = await validateApiKey(apiKey);

  if (!validation.valid) {
    const status = validation.error.includes('Rate limit') ? 429 : 401;
    
    return {
      success: false,
      response: NextResponse.json(
        {
          error: validation.error,
          message: validation.error.includes('Rate limit')
            ? 'You have exceeded your rate limit. Please try again later.'
            : 'Invalid or expired API key',
        },
        {
          status,
          headers: validation.error.includes('Rate limit')
            ? {
                'X-RateLimit-Limit': validation.keyData?.rate_limit_per_minute?.toString() || '0',
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString(),
              }
            : undefined,
        }
      ),
    };
  }

  // Return validated API key data
  return {
    success: true,
    apiKey: validation.keyData,
    userId: validation.keyData.user_id,
  };
}

/**
 * Middleware wrapper for API routes
 * Usage:
 * 
 * export async function POST(request: NextRequest) {
 *   const auth = await withApiAuth(request);
 *   if (!auth.success) return auth.response;
 * 
 *   // Your authenticated API logic here
 *   const { apiKey, userId } = auth;
 * }
 */
export async function withApiAuth(
  request: NextRequest
): Promise<
  | { success: true; apiKey: ApiKey; userId: string }
  | { success: false; response: NextResponse }
> {
  return authenticateApiRequest(request);
}

/**
 * Check if user has sufficient credits for an operation
 */
export function checkCredits(
  apiKey: ApiKey,
  requiredCredits: number
): { hasCredits: boolean; available: number; response?: NextResponse } {
  const available = apiKey.credits_allocated - apiKey.credits_used;

  if (available < requiredCredits) {
    return {
      hasCredits: false,
      available,
      response: NextResponse.json(
        {
          error: 'Insufficient credits',
          message: `This operation requires ${requiredCredits} credits, but you only have ${available} available`,
          credits_required: requiredCredits,
          credits_available: available,
          upgrade_url: 'https://afrinova.com/pricing',
        },
        { status: 402 } // Payment Required
      ),
    };
  }

  return { hasCredits: true, available };
}

/**
 * Add standard API response headers
 */
export function addApiHeaders(
  response: NextResponse,
  apiKey: ApiKey
): NextResponse {
  const available = apiKey.credits_allocated - apiKey.credits_used;

  response.headers.set('X-API-Version', 'v1');
  response.headers.set('X-Credits-Used', apiKey.credits_used.toString());
  response.headers.set('X-Credits-Remaining', available.toString());
  response.headers.set('X-Credits-Total', apiKey.credits_allocated.toString());
  response.headers.set('X-RateLimit-Limit', apiKey.rate_limit_per_minute.toString());

  return response;
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  error: string,
  message: string,
  status: number = 400
): NextResponse {
  return NextResponse.json(
    {
      error,
      message,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Create standardized success response
 */
export function createSuccessResponse(
  data: any,
  apiKey?: ApiKey
): NextResponse {
  const response = NextResponse.json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  });

  if (apiKey) {
    return addApiHeaders(response, apiKey);
  }

  return response;
}
