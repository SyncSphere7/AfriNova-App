/**
 * Error Tracking Service
 * 
 * Centralized error logging and tracking
 * Ready for Sentry integration (just add DSN)
 */

export interface ErrorContext {
  userId?: string;
  email?: string;
  route?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface ErrorLog {
  id?: string;
  error_type: string;
  error_message: string;
  error_stack?: string;
  user_id?: string;
  route?: string;
  method?: string;
  status_code?: number;
  request_body?: any;
  user_agent?: string;
  ip_address?: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

/**
 * Log error to database and external services
 */
export async function logError(
  error: Error,
  context?: ErrorContext
): Promise<void> {
  try {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🔴 Error:', error.message);
      console.error('Stack:', error.stack);
      console.error('Context:', context);
    }

    // Log to database
    await logErrorToDatabase(error, context);

    // Log to Sentry (if configured)
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      await logErrorToSentry(error, context);
    }
  } catch (loggingError) {
    // Don't let logging errors crash the app
    console.error('Failed to log error:', loggingError);
  }
}

/**
 * Log error to database for analysis
 */
async function logErrorToDatabase(
  error: Error,
  context?: ErrorContext
): Promise<void> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    await supabase.from('error_logs').insert({
      error_type: error.name,
      error_message: error.message,
      error_stack: error.stack,
      user_id: context?.userId,
      route: context?.route,
      metadata: context?.metadata,
    });
  } catch (err) {
    console.error('Failed to log error to database:', err);
  }
}

/**
 * Log error to Sentry (external monitoring)
 */
async function logErrorToSentry(
  error: Error,
  context?: ErrorContext
): Promise<void> {
  try {
    // Dynamic import to avoid bundling if not used
    const Sentry = await import('@sentry/nextjs');

    Sentry.captureException(error, {
      user: context?.userId ? { id: context.userId, email: context.email } : undefined,
      tags: {
        route: context?.route,
        action: context?.action,
      },
      extra: context?.metadata,
    });
  } catch (err) {
    console.error('Failed to log error to Sentry:', err);
  }
}

/**
 * Log API error with full context
 */
export async function logApiError(
  error: Error,
  request: Request,
  userId?: string
): Promise<void> {
  const url = new URL(request.url);
  
  try {
    let requestBody;
    try {
      requestBody = await request.clone().json();
    } catch {
      requestBody = null;
    }

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    await supabase.from('error_logs').insert({
      error_type: error.name,
      error_message: error.message,
      error_stack: error.stack,
      user_id: userId,
      route: url.pathname,
      method: request.method,
      request_body: requestBody,
      user_agent: request.headers.get('user-agent'),
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      metadata: {
        query: Object.fromEntries(url.searchParams),
        headers: Object.fromEntries(request.headers),
      },
    });

    // Also log to Sentry if configured
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      const Sentry = await import('@sentry/nextjs');
      Sentry.captureException(error, {
        user: userId ? { id: userId } : undefined,
        tags: {
          route: url.pathname,
          method: request.method,
        },
        extra: {
          requestBody,
          query: Object.fromEntries(url.searchParams),
        },
      });
    }
  } catch (loggingError) {
    console.error('Failed to log API error:', loggingError);
  }
}

/**
 * Create error response with logging
 */
export async function createErrorResponse(
  error: Error,
  request: Request,
  statusCode: number = 500,
  userId?: string
): Promise<Response> {
  // Log the error
  await logApiError(error, request, userId);

  // Return user-friendly error
  return new Response(
    JSON.stringify({
      error: error.message || 'Internal server error',
      status: statusCode,
      timestamp: new Date().toISOString(),
    }),
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Get recent errors from database
 */
export async function getRecentErrors(
  limit: number = 100,
  filters?: {
    userId?: string;
    route?: string;
    errorType?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<ErrorLog[]> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    let query = supabase
      .from('error_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters?.route) {
      query = query.eq('route', filters.route);
    }

    if (filters?.errorType) {
      query = query.eq('error_type', filters.errorType);
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString());
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Failed to get recent errors:', error);
    return [];
  }
}

/**
 * Get error statistics
 */
export async function getErrorStats(days: number = 7): Promise<{
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsByRoute: Record<string, number>;
  errorRate: number;
  topErrors: Array<{ message: string; count: number }>;
}> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: errors, error } = await supabase
      .from('error_logs')
      .select('*')
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    const errorsByType: Record<string, number> = {};
    const errorsByRoute: Record<string, number> = {};
    const errorMessages: Record<string, number> = {};

    errors?.forEach((err) => {
      // Count by type
      errorsByType[err.error_type] = (errorsByType[err.error_type] || 0) + 1;

      // Count by route
      if (err.route) {
        errorsByRoute[err.route] = (errorsByRoute[err.route] || 0) + 1;
      }

      // Count by message
      errorMessages[err.error_message] = (errorMessages[err.error_message] || 0) + 1;
    });

    // Get top 10 errors by frequency
    const topErrors = Object.entries(errorMessages)
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalErrors: errors?.length || 0,
      errorsByType,
      errorsByRoute,
      errorRate: (errors?.length || 0) / days,
      topErrors,
    };
  } catch (error) {
    console.error('Failed to get error stats:', error);
    return {
      totalErrors: 0,
      errorsByType: {},
      errorsByRoute: {},
      errorRate: 0,
      topErrors: [],
    };
  }
}

/**
 * Clear old error logs (run daily)
 */
export async function cleanupErrorLogs(daysToKeep: number = 30): Promise<number> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { error, count } = await supabase
      .from('error_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) throw error;

    console.log(`🗑️ Cleaned up ${count || 0} old error logs`);
    return count || 0;
  } catch (error) {
    console.error('Failed to cleanup error logs:', error);
    return 0;
  }
}

/**
 * Initialize Sentry (call in app layout or root)
 */
export function initializeSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN && typeof window !== 'undefined') {
    import('@sentry/nextjs').then((Sentry) => {
      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        beforeSend(event) {
          // Don't send errors in development
          if (process.env.NODE_ENV === 'development') {
            return null;
          }
          return event;
        },
      });
    }).catch(console.error);
  }
}
