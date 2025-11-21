import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/health
 * 
 * Health check endpoint for monitoring
 * Returns system status and service health
 */
export async function GET() {
  const startTime = Date.now();
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {} as Record<string, any>,
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV,
  };

  try {
    // Check Database
    const supabase = await createClient();
    const dbStart = Date.now();
    const { error: dbError } = await supabase.from('profiles').select('id').limit(1);
    const dbTime = Date.now() - dbStart;

    health.services.database = {
      status: dbError ? 'unhealthy' : 'healthy',
      responseTime: `${dbTime}ms`,
      error: dbError?.message,
    };

    // Check Email Service
    health.services.email = {
      status: process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your_resend_api_key_here' 
        ? 'configured' 
        : 'not_configured',
    };

    // Check Payment Providers
    health.services.payments = {
      pesapal: !!(process.env.PESAPAL_CONSUMER_KEY && process.env.PESAPAL_CONSUMER_SECRET)
        ? 'configured'
        : 'not_configured',
      stripe: !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
        ? 'configured'
        : 'not_configured',
      paypal: !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET)
        ? 'configured'
        : 'not_configured',
    };

    // Check AI Service
    health.services.ai = {
      status: process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'your_openrouter_api_key_here'
        ? 'configured'
        : 'not_configured',
    };

    // Check Monitoring
    health.services.monitoring = {
      sentry: process.env.NEXT_PUBLIC_SENTRY_DSN ? 'configured' : 'not_configured',
      errorLogging: 'enabled',
    };

    // Overall health status
    const hasUnhealthy = Object.values(health.services).some(
      (service: any) => service.status === 'unhealthy'
    );
    
    if (hasUnhealthy) {
      health.status = 'degraded';
    }

    const totalTime = Date.now() - startTime;
    return NextResponse.json({
      ...health,
      responseTime: `${totalTime}ms`,
    }, {
      status: hasUnhealthy ? 503 : 200,
    });

  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      responseTime: `${Date.now() - startTime}ms`,
    }, {
      status: 503,
    });
  }
}
