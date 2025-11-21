import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendTrialEndingSoonEmail } from '@/lib/services/email-sender';

/**
 * POST /api/cron/check-trial-endings
 * 
 * Check for trials ending soon and send reminder emails
 * 
 * This endpoint should be called by a cron job once daily
 * 
 * Vercel Cron config (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/check-trial-endings",
 *     "schedule": "0 10 * * *"  // Every day at 10 AM
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

    const supabase = await createClient();
    let emailsSent = 0;

    // Check for trials ending in 7 days, 3 days, or 1 day
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*, profiles(full_name)')
      .eq('status', 'trialing')
      .not('trial_ends_at', 'is', null)
      .gte('trial_ends_at', new Date().toISOString())
      .lte('trial_ends_at', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('Failed to fetch subscriptions:', error);
      throw error;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        emailsSent: 0,
        message: 'No trials ending soon',
      });
    }

    // Process each subscription
    for (const subscription of subscriptions) {
      const trialEndsAt = new Date(subscription.trial_ends_at);
      const now = new Date();
      const daysRemaining = Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Only send at 7, 3, and 1 day marks
      if ([7, 3, 1].includes(daysRemaining)) {
        // Check if we already sent this notification today
        const { data: existingEmail } = await supabase
          .from('email_queue')
          .select('id')
          .eq('user_id', subscription.user_id)
          .eq('email_type', `trial_ending_${daysRemaining}`)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .single();

        if (existingEmail) {
          continue; // Already sent today
        }

        // Get user email
        const { data: { user } } = await supabase.auth.admin.getUserById(subscription.user_id);

        if (user?.email) {
          const fullName = (subscription.profiles as any)?.full_name || 'there';
          
          // Send email
          await sendTrialEndingSoonEmail(
            user.email,
            fullName,
            daysRemaining,
            subscription.tier
          );

          emailsSent++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent,
      subscriptionsChecked: subscriptions.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Check trial endings cron error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check trial endings' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/check-trial-endings
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    service: 'Trial Endings Checker',
    status: 'healthy',
  });
}
