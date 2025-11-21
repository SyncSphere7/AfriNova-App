import { NextResponse } from 'next/server';
import { processEmailQueue, cleanupEmailQueue } from '@/lib/services/email-sender';

/**
 * POST /api/cron/process-emails
 * 
 * Process pending emails from the queue
 * 
 * This endpoint should be called by a cron job (e.g., Vercel Cron, GitHub Actions)
 * every 5-10 minutes to send queued emails.
 * 
 * Vercel Cron config (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/process-emails",
 *     "schedule": "*/10 * * * *"  // Every 10 minutes
 *   }]
 * }
 */
export async function POST(request: Request) {
  try {
    // Verify cron secret (security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Process emails
    const sentCount = await processEmailQueue(20); // Process 20 emails per run

    // Cleanup old emails (once per day)
    const now = new Date();
    if (now.getHours() === 2) { // Run at 2 AM
      await cleanupEmailQueue(30); // Delete emails older than 30 days
    }

    return NextResponse.json({
      success: true,
      emailsSent: sentCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Process emails cron error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process emails' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/process-emails
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    service: 'Email Queue Processor',
    status: 'healthy',
    configured: !!(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your_resend_api_key_here'),
  });
}
