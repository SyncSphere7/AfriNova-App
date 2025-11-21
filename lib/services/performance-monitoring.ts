import { createClient } from '@/lib/supabase/server';

/**
 * Performance Monitoring Service
 * 
 * Tracks API response times, database query performance, and generation times.
 */

export interface PerformanceMetric {
  id?: string;
  metric_type: 'api_response' | 'database_query' | 'generation' | 'external_api';
  route?: string;
  method?: string;
  duration_ms: number;
  status_code?: number;
  user_id?: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface PerformanceStats {
  avgResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  slowestRoutes: Array<{
    route: string;
    avgDuration: number;
    count: number;
  }>;
  totalRequests: number;
  errorRate: number;
}

/**
 * Start tracking performance for an operation
 */
export class PerformanceTracker {
  private startTime: number;
  private metricType: PerformanceMetric['metric_type'];
  private route?: string;
  private method?: string;
  private userId?: string;
  private metadata?: Record<string, any>;

  constructor(
    metricType: PerformanceMetric['metric_type'],
    options?: {
      route?: string;
      method?: string;
      userId?: string;
      metadata?: Record<string, any>;
    }
  ) {
    this.startTime = Date.now();
    this.metricType = metricType;
    this.route = options?.route;
    this.method = options?.method;
    this.userId = options?.userId;
    this.metadata = options?.metadata;
  }

  /**
   * End tracking and log the metric
   */
  async end(statusCode?: number, additionalMetadata?: Record<string, any>): Promise<void> {
    const duration = Date.now() - this.startTime;

    await logPerformanceMetric({
      metric_type: this.metricType,
      route: this.route,
      method: this.method,
      duration_ms: duration,
      status_code: statusCode,
      user_id: this.userId,
      metadata: {
        ...this.metadata,
        ...additionalMetadata,
      },
    });
  }

  /**
   * Get the current duration without ending tracking
   */
  getDuration(): number {
    return Date.now() - this.startTime;
  }
}

/**
 * Log a performance metric to the database
 */
export async function logPerformanceMetric(metric: PerformanceMetric): Promise<void> {
  try {
    const supabase = await createClient();

    // Only log if duration is significant (> 10ms) to avoid noise
    if (metric.duration_ms < 10) {
      return;
    }

    await supabase.from('performance_metrics').insert({
      metric_type: metric.metric_type,
      route: metric.route,
      method: metric.method,
      duration_ms: metric.duration_ms,
      status_code: metric.status_code,
      user_id: metric.user_id,
      metadata: metric.metadata,
    });

    // Log slow operations to console in development
    if (process.env.NODE_ENV === 'development' && metric.duration_ms > 1000) {
      console.warn(`[Performance] Slow ${metric.metric_type}:`, {
        route: metric.route,
        duration: `${metric.duration_ms}ms`,
        metadata: metric.metadata,
      });
    }
  } catch (error) {
    // Don't throw on logging errors to avoid disrupting the application
    console.error('Failed to log performance metric:', error);
  }
}

/**
 * Get performance statistics for a time period
 */
export async function getPerformanceStats(
  days: number = 7,
  filters?: {
    metricType?: PerformanceMetric['metric_type'];
    route?: string;
    userId?: string;
  }
): Promise<PerformanceStats> {
  try {
    const supabase = await createClient();

    const since = new Date();
    since.setDate(since.getDate() - days);

    let query = supabase
      .from('performance_metrics')
      .select('*')
      .gte('created_at', since.toISOString());

    if (filters?.metricType) {
      query = query.eq('metric_type', filters.metricType);
    }
    if (filters?.route) {
      query = query.eq('route', filters.route);
    }
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    const { data: metrics, error } = await query;

    if (error) {
      throw error;
    }

    if (!metrics || metrics.length === 0) {
      return {
        avgResponseTime: 0,
        p50ResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        slowestRoutes: [],
        totalRequests: 0,
        errorRate: 0,
      };
    }

    // Calculate statistics
    const durations = metrics.map(m => m.duration_ms).sort((a, b) => a - b);
    const avgResponseTime = durations.reduce((a, b) => a + b, 0) / durations.length;
    const p50ResponseTime = durations[Math.floor(durations.length * 0.5)];
    const p95ResponseTime = durations[Math.floor(durations.length * 0.95)];
    const p99ResponseTime = durations[Math.floor(durations.length * 0.99)];

    // Group by route for slowest routes
    const routeStats = metrics.reduce((acc, metric) => {
      if (!metric.route) return acc;

      if (!acc[metric.route]) {
        acc[metric.route] = {
          route: metric.route,
          totalDuration: 0,
          count: 0,
          errors: 0,
        };
      }

      acc[metric.route].totalDuration += metric.duration_ms;
      acc[metric.route].count += 1;
      if (metric.status_code && metric.status_code >= 400) {
        acc[metric.route].errors += 1;
      }

      return acc;
    }, {} as Record<string, { route: string; totalDuration: number; count: number; errors: number }>);

    const slowestRoutes = Object.values(routeStats)
      .map(stat => ({
        route: stat.route,
        avgDuration: Math.round(stat.totalDuration / stat.count),
        count: stat.count,
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 10);

    // Calculate error rate
    const errorsCount = metrics.filter(m => m.status_code && m.status_code >= 400).length;
    const errorRate = (errorsCount / metrics.length) * 100;

    return {
      avgResponseTime: Math.round(avgResponseTime),
      p50ResponseTime: Math.round(p50ResponseTime),
      p95ResponseTime: Math.round(p95ResponseTime),
      p99ResponseTime: Math.round(p99ResponseTime),
      slowestRoutes,
      totalRequests: metrics.length,
      errorRate: Math.round(errorRate * 100) / 100,
    };
  } catch (error) {
    console.error('Failed to get performance stats:', error);
    throw error;
  }
}

/**
 * Get recent slow operations
 */
export async function getSlowOperations(
  limit: number = 50,
  thresholdMs: number = 1000
): Promise<PerformanceMetric[]> {
  try {
    const supabase = await createClient();

    const { data: metrics, error } = await supabase
      .from('performance_metrics')
      .select('*')
      .gte('duration_ms', thresholdMs)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return metrics || [];
  } catch (error) {
    console.error('Failed to get slow operations:', error);
    throw error;
  }
}

/**
 * Cleanup old performance metrics
 */
export async function cleanupPerformanceMetrics(daysToKeep: number = 30): Promise<number> {
  try {
    const supabase = await createClient();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { error, count } = await supabase
      .from('performance_metrics')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      throw error;
    }

    console.log(`Cleaned up ${count || 0} old performance metrics`);
    return count || 0;
  } catch (error) {
    console.error('Failed to cleanup performance metrics:', error);
    throw error;
  }
}

/**
 * Track an async operation
 */
export async function trackPerformance<T>(
  operation: () => Promise<T>,
  metricType: PerformanceMetric['metric_type'],
  options?: {
    route?: string;
    method?: string;
    userId?: string;
    metadata?: Record<string, any>;
  }
): Promise<T> {
  const tracker = new PerformanceTracker(metricType, options);

  try {
    const result = await operation();
    await tracker.end(200);
    return result;
  } catch (error: any) {
    await tracker.end(error.status || 500, {
      error: error.message,
    });
    throw error;
  }
}

/**
 * Middleware helper for tracking API route performance
 */
export function createPerformanceMiddleware(route: string) {
  return {
    start: (method: string, userId?: string) => {
      return new PerformanceTracker('api_response', {
        route,
        method,
        userId,
      });
    },
  };
}
