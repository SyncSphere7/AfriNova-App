import { NextResponse } from 'next/server';
import { checkSystemHealth, initializeAlertRules } from '@/lib/services/alert-system';

/**
 * POST /api/cron/check-system-health
 * 
 * Cron job to monitor system health and create alerts
 * Runs every 15 minutes
 * 
 * Checks:
 * - Error rates (> 10% triggers critical alert)
 * - Critical errors (500s)
 * - Slow API responses (P95 > 3s)
 * - Service availability
 */
export async function POST(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Cron] Starting system health check...');

    // Initialize alert rules if needed (first run)
    await initializeAlertRules();

    // Check system health and create alerts if needed
    await checkSystemHealth();

    console.log('[Cron] System health check completed');

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: 'System health check completed',
    });
  } catch (error: any) {
    console.error('[Cron] System health check failed:', error);
    return NextResponse.json(
      { error: error.message || 'System health check failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/check-system-health
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/cron/check-system-health',
    description: 'Monitors system health and creates alerts',
    schedule: 'Every 15 minutes',
  });
}
