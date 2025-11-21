/**
 * Error Monitoring and Logging
 * Centralized error tracking for production
 */

type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

interface ErrorContext {
  userId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  metadata?: Record<string, any>;
}

/**
 * Log error to console and external monitoring service
 */
export function logError(
  error: Error | string,
  severity: ErrorSeverity = 'error',
  context?: ErrorContext
) {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;

  const logData = {
    timestamp,
    severity,
    message: errorMessage,
    stack: errorStack,
    ...context,
  };

  // Console logging (always)
  if (severity === 'critical' || severity === 'error') {
    console.error('[ERROR]', logData);
  } else if (severity === 'warning') {
    console.warn('[WARNING]', logData);
  } else {
    console.log('[INFO]', logData);
  }

  // In production, send to external monitoring service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with Sentry, LogRocket, or similar
    // Example:
    // Sentry.captureException(error, {
    //   level: severity,
    //   contexts: { custom: context },
    // });
    
    // For now, we'll just ensure it's logged
    // You can add Sentry.io, LogRocket, Datadog, etc. here
  }
}

/**
 * Wrap async functions with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: Omit<ErrorContext, 'userId'>
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error(String(error)),
        'error',
        context
      );
      throw error;
    }
  }) as T;
}

/**
 * Create error response with logging
 */
export function createErrorResponse(
  error: Error | string,
  statusCode: number = 500,
  context?: ErrorContext
): Response {
  const errorMessage = error instanceof Error ? error.message : error;
  
  logError(error, statusCode >= 500 ? 'error' : 'warning', {
    ...context,
    statusCode,
  });

  // Don't expose internal errors in production
  const publicMessage = 
    process.env.NODE_ENV === 'production' && statusCode >= 500
      ? 'Internal server error'
      : errorMessage;

  return new Response(
    JSON.stringify({
      error: publicMessage,
      statusCode,
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
 * Monitor API performance
 */
export async function monitorPerformance<T>(
  operation: string,
  fn: () => Promise<T>,
  context?: ErrorContext
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    
    // Log slow operations (> 5 seconds)
    if (duration > 5000) {
      logError(
        `Slow operation: ${operation} took ${duration}ms`,
        'warning',
        { ...context, metadata: { duration, operation } }
      );
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(
      error instanceof Error ? error : new Error(String(error)),
      'error',
      {
        ...context,
        metadata: { duration, operation },
      }
    );
    throw error;
  }
}

/**
 * Health check utility
 */
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  services: {
    database: boolean;
    ai: boolean;
    payments: boolean;
    email: boolean;
  };
  timestamp: string;
}

/**
 * Check system health
 */
export async function checkHealth(): Promise<HealthStatus> {
  const checks = {
    database: false,
    ai: false,
    payments: false,
    email: false,
  };

  try {
    // Check database
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = createClient();
    const { error: dbError } = await supabase.from('profiles').select('id').limit(1);
    checks.database = !dbError;
  } catch (error) {
    logError('Database health check failed', 'warning');
  }

  try {
    // Check AI service (OpenRouter)
    if (process.env.OPENROUTER_API_KEY) {
      checks.ai = true; // Assume healthy if API key exists
    }
  } catch (error) {
    logError('AI health check failed', 'warning');
  }

  try {
    // Check payment service (Pesapal)
    if (process.env.PESAPAL_CONSUMER_KEY) {
      checks.payments = true; // Assume healthy if credentials exist
    }
  } catch (error) {
    logError('Payment health check failed', 'warning');
  }

  try {
    // Check email service (Resend)
    if (process.env.RESEND_API_KEY) {
      checks.email = true; // Assume healthy if API key exists
    }
  } catch (error) {
    logError('Email health check failed', 'warning');
  }

  const healthyCount = Object.values(checks).filter(Boolean).length;
  const status: HealthStatus['status'] = 
    healthyCount === 4 ? 'healthy' :
    healthyCount >= 2 ? 'degraded' :
    'down';

  return {
    status,
    services: checks,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Initialize error monitoring (call this in app startup)
 */
export function initErrorMonitoring() {
  // Handle unhandled promise rejections
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      logError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        'critical',
        { metadata: { type: 'unhandledRejection' } }
      );
    });
  }

  // In Node.js/Edge runtime
  if (typeof process !== 'undefined') {
    process.on('unhandledRejection', (reason: any) => {
      logError(
        reason instanceof Error ? reason : new Error(String(reason)),
        'critical',
        { metadata: { type: 'unhandledRejection' } }
      );
    });
  }

  console.log('✅ Error monitoring initialized');
}
