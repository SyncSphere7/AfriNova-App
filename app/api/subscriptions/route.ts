import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/subscriptions
 * Get current user's subscription
 */
export async function GET(request: Request) {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!subscription) {
      return NextResponse.json({
        subscription: null,
        message: 'No subscription found',
      });
    }

    // Get profile for additional context
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status, generations_used, generations_limit')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      subscription,
      profile: profile || {},
    });
  } catch (error: any) {
    console.error('Get subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/subscriptions
 * Update subscription (upgrade/downgrade/cancel)
 */
export async function PATCH(request: Request) {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, newTier } = await request.json();

    // Get current subscription
    const { data: currentSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!currentSub) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    // Handle different actions
    if (action === 'cancel') {
      // Cancel at period end
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentSub.id);

      if (updateError) {
        throw updateError;
      }

      return NextResponse.json({
        success: true,
        message: 'Subscription will be canceled at the end of the current period',
        subscription: {
          ...currentSub,
          cancel_at_period_end: true,
        },
      });
    } else if (action === 'reactivate') {
      // Reactivate canceled subscription
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentSub.id);

      if (updateError) {
        throw updateError;
      }

      return NextResponse.json({
        success: true,
        message: 'Subscription reactivated',
        subscription: {
          ...currentSub,
          cancel_at_period_end: false,
        },
      });
    } else if (action === 'upgrade' || action === 'downgrade') {
      // Change tier
      if (!newTier || !['starter', 'growth', 'pro'].includes(newTier)) {
        return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
      }

      // Update subscription tier
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          tier: newTier,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentSub.id);

      if (updateError) {
        throw updateError;
      }

      // Update profile
      await supabase
        .from('profiles')
        .update({
          subscription_tier: newTier,
        })
        .eq('id', user.id);

      // Update generations limit based on tier
      const limitsMap: Record<string, number> = {
        starter: 30,
        growth: 100,
        pro: 300,
      };

      await supabase
        .from('profiles')
        .update({
          generations_limit: limitsMap[newTier] || 30,
        })
        .eq('id', user.id);

      return NextResponse.json({
        success: true,
        message: `Subscription ${action}d to ${newTier}`,
        subscription: {
          ...currentSub,
          tier: newTier,
        },
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Update subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/subscriptions
 * Immediately cancel subscription
 */
export async function DELETE(request: Request) {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current subscription
    const { data: currentSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!currentSub) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    // Cancel immediately
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentSub.id);

    if (updateError) {
      throw updateError;
    }

    // Downgrade to free tier
    await supabase
      .from('profiles')
      .update({
        subscription_tier: 'free',
        subscription_status: 'canceled',
        generations_limit: 5,
      })
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      message: 'Subscription canceled immediately',
    });
  } catch (error: any) {
    console.error('Delete subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
