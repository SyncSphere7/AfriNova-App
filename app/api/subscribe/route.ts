import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  createSubscriptionPayment, 
  getAvailableProviders,
  type PaymentProvider,
  type PaymentMethod 
} from '@/lib/services/payment-providers';

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 15,
    annualPrice: 144, // $12/month * 12
    features: ['30 generations per month', '15 projects max', 'Email support (48h)'],
    generationsLimit: 30,
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    monthlyPrice: 35,
    annualPrice: 336, // $28/month * 12
    features: ['100 generations per month', '50 projects max', 'Priority support (4h)'],
    generationsLimit: 100,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 75,
    annualPrice: 720, // $60/month * 12
    features: ['300 generations per month', 'Unlimited projects', '24/7 support'],
    generationsLimit: 300,
  },
};

/**
 * POST /api/subscribe
 * Initiate a new subscription with multi-provider support
 * Currently: Pesapal (active), Stripe & PayPal (coming next week)
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      plan, 
      billingCycle, 
      paymentMethod = 'card',
      provider, // Optional - auto-select if not provided
      phoneNumber 
    } = await request.json();

    // Validate plan
    if (!['starter', 'growth', 'pro'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Validate billing cycle
    if (!['monthly', 'annual'].includes(billingCycle)) {
      return NextResponse.json({ error: 'Invalid billing cycle' }, { status: 400 });
    }

    // Validate phone number for mobile payments
    if (paymentMethod === 'mobile' && !phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number required for mobile money payments' },
        { status: 400 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if user already has an active subscription
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'You already have an active subscription. Please upgrade or cancel first.' },
        { status: 400 }
      );
    }

    // Get plan details
    const planDetails = SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS];
    const amount = billingCycle === 'annual' ? planDetails.annualPrice : planDetails.monthlyPrice;

    // Create subscription record (pending)
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        tier: plan,
        status: 'trialing', // Start with trial
        billing_cycle: billingCycle,
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(
          Date.now() + (billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000
        ).toISOString(),
        generations_limit: planDetails.generationsLimit,
        generations_used: 0,
      })
      .select()
      .single();

    if (subError) {
      console.error('Subscription creation error:', subError);
      return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
    }

    // Update profile tier
    await supabase
      .from('profiles')
      .update({
        subscription_tier: plan,
        subscription_status: 'trialing',
      })
      .eq('id', user.id);

    // Generate callback URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/api/subscribe/callback?subscription_id=${subscription.id}`;
    const cancelUrl = `${baseUrl}/dashboard/settings?tab=billing&payment=cancelled`;

    // Create payment intent with selected provider (or auto-select)
    try {
      const paymentIntent = await createSubscriptionPayment({
        userId: user.id,
        email: user.email!,
        plan: planDetails,
        billingCycle,
        paymentMethod: paymentMethod as PaymentMethod,
        provider: provider as PaymentProvider,
        phoneNumber,
        returnUrl,
        cancelUrl,
      });

      // Update subscription with payment details
      await supabase
        .from('subscriptions')
        .update({
          payment_provider: paymentIntent.provider,
          payment_method: paymentMethod,
          pesapal_merchant_reference: paymentIntent.merchantReference,
          pesapal_tracking_id: paymentIntent.trackingId,
        })
        .eq('id', subscription.id);

      return NextResponse.json({
        success: true,
        subscription: {
          id: subscription.id,
          tier: subscription.tier,
          status: subscription.status,
          trialEndsAt: subscription.trial_ends_at,
        },
        payment: {
          provider: paymentIntent.provider,
          redirectUrl: paymentIntent.redirectUrl,
          clientSecret: paymentIntent.clientSecret, // For Stripe (next week)
          status: paymentIntent.status,
        },
        availableProviders: getAvailableProviders(),
      });
    } catch (paymentError: any) {
      console.error('Payment creation error:', paymentError);

      // If payment fails, still return subscription with trial
      return NextResponse.json({
        success: true,
        subscription: {
          id: subscription.id,
          tier: subscription.tier,
          status: subscription.status,
          trialEndsAt: subscription.trial_ends_at,
        },
        warning: paymentError.message || 'Payment gateway temporarily unavailable. Your trial has started.',
        availableProviders: getAvailableProviders(),
      });
    }
  } catch (error: any) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/subscribe
 * Get available subscription plans and payment providers
 */
export async function GET() {
  try {
    const availableProviders = getAvailableProviders();

    return NextResponse.json({
      plans: SUBSCRIPTION_PLANS,
      providers: availableProviders,
      configured: {
        pesapal: availableProviders.includes('pesapal'),
        stripe: availableProviders.includes('stripe'),
        paypal: availableProviders.includes('paypal'),
      },
    });
  } catch (error: any) {
    console.error('Get plans error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription plans' },
      { status: 500 }
    );
  }
}
