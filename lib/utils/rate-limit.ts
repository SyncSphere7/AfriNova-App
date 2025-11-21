/**
 * Rate Limiting Utility
 * Prevents API abuse and DoS attacks
 */

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max requests per interval
}

const rateLimitMap = new Map<string, number[]>();

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Rate limit a request based on IP or token
 * @param identifier Unique identifier (IP address, user ID, API key)
 * @param config Rate limit configuration
 * @returns true if request is allowed, throws RateLimitError if rate limit exceeded
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig = {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 10, // 10 requests per minute
  }
): boolean {
  const now = Date.now();
  const tokenKey = `${identifier}:${Math.floor(now / config.interval)}`;

  const timestamps = rateLimitMap.get(tokenKey) || [];
  
  // Clean up old timestamps outside the current window
  const validTimestamps = timestamps.filter(
    (timestamp) => now - timestamp < config.interval
  );

  if (validTimestamps.length >= config.uniqueTokenPerInterval) {
    const retryAfter = Math.ceil(
      (validTimestamps[0] + config.interval - now) / 1000
    );
    throw new RateLimitError(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
  }

  validTimestamps.push(now);
  rateLimitMap.set(tokenKey, validTimestamps);

  // Cleanup old entries every 100 requests
  if (rateLimitMap.size > 1000) {
    const currentWindow = Math.floor(now / config.interval);
    Array.from(rateLimitMap.keys()).forEach((key) => {
      const keyWindow = parseInt(key.split(':')[1]);
      if (keyWindow < currentWindow - 1) {
        rateLimitMap.delete(key);
      }
    });
  }

  return true;
}

/**
 * Get client identifier from request (IP address or user ID)
 */
export function getIdentifier(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Try to get real IP from various headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare

  if (forwardedFor) {
    return `ip:${forwardedFor.split(',')[0].trim()}`;
  }

  if (realIp) {
    return `ip:${realIp}`;
  }

  if (cfConnectingIp) {
    return `ip:${cfConnectingIp}`;
  }

  // Fallback to a generic identifier
  return 'ip:unknown';
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Authentication endpoints - stricter limits
  AUTH: {
    interval: 15 * 60 * 1000, // 15 minutes
    uniqueTokenPerInterval: 5, // 5 attempts
  },
  
  // API endpoints - moderate limits
  API: {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 30, // 30 requests per minute
  },
  
  // Payment endpoints - strict limits
  PAYMENT: {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 5, // 5 requests per minute
  },
  
  // Code generation - resource intensive
  GENERATION: {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 3, // 3 generations per minute
  },
  
  // General endpoints - lenient limits
  GENERAL: {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 60, // 60 requests per minute
  },

  // Webhook endpoints - allow bursts
  WEBHOOK: {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 100, // 100 requests per minute
  },
};

/**
 * Middleware wrapper for rate limiting
 */
export function withRateLimit(
  handler: (request: Request) => Promise<Response>,
  config: RateLimitConfig = RATE_LIMITS.API
) {
  return async (request: Request): Promise<Response> => {
    try {
      const identifier = getIdentifier(request);
      rateLimit(identifier, config);
      return await handler(request);
    } catch (error) {
      if (error instanceof RateLimitError) {
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded',
            message: error.message,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '60',
            },
          }
        );
      }
      throw error;
    }
  };
}
