import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyPayment, type PaymentProvider } from '@/lib/services/payment-providers';
import { sendSubscriptionConfirmationEmail } from '@/lib/services/email-sender';

/**
 * GET /api/subscribe/callback
 * Handle payment redirect after user completes payment
 * Supports: Pesapal, Stripe (next week), PayPal (next week)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const subscriptionId = searchParams.get('subscription_id');
    const trackingId = searchParams.get('OrderTrackingId'); // Pesapal
    const merchantReference = searchParams.get('OrderMerchantReference'); // Pesapal
    const paymentIntent = searchParams.get('payment_intent'); // Stripe (next week)
    const paypalOrderId = searchParams.get('token'); // PayPal (next week)

    if (!subscriptionId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing&error=missing_subscription_id`
      );
    }

    const supabase = await createClient();

    // Get subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (subError || !subscription) {
      console.error('Subscription not found:', subError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing&error=subscription_not_found`
      );
    }

    // Determine payment provider and transaction ID
    let provider: PaymentProvider = subscription.payment_provider || 'pesapal';
    let transactionId: string | null = null;

    if (trackingId) {
      // Pesapal payment
      provider = 'pesapal';
      transactionId = trackingId;
    } else if (paymentIntent) {
      // Stripe payment (next week)
      provider = 'stripe';
      transactionId = paymentIntent;
    } else if (paypalOrderId) {
      // PayPal payment (next week)
      provider = 'paypal';
      transactionId = paypalOrderId;
    }

    if (!transactionId) {
      console.error('No transaction ID found in callback');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing&error=no_transaction_id`
      );
    }

    try {
      // Verify payment with the provider
      const verification = await verifyPayment(provider, transactionId);

      if (verification.status === 'completed') {
        // Payment successful - activate subscription
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            payment_provider: provider,
            pesapal_tracking_id: provider === 'pesapal' ? transactionId : null,
            stripe_subscription_id: provider === 'stripe' ? transactionId : null,
            paypal_subscription_id: provider === 'paypal' ? transactionId : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscriptionId);

        if (updateError) {
          console.error('Failed to update subscription:', updateError);
          throw updateError;
        }

        // Update profile status
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'active',
          })
          .eq('id', subscription.user_id);

        // Get user email and profile for confirmation email
        const { data: { user } } = await supabase.auth.admin.getUserById(subscription.user_id);
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', subscription.user_id)
          .single();

        // Send confirmation email (async, don't wait)
        if (user?.email) {
          const amount = verification.amount || 0;
          sendSubscriptionConfirmationEmail(
            user.email,
            profile?.full_name || 'there',
            subscription.tier,
            subscription.billing_cycle || 'monthly',
            amount
          ).catch(err => console.error('Failed to send confirmation email:', err));
        }

        console.log(`✅ Subscription ${subscriptionId} activated for user ${subscription.user_id}`);

        // Redirect to success page
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing&payment=success&subscription=${subscriptionId}`
        );
      } else if (verification.status === 'pending') {
        // Payment still processing
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing&payment=pending&subscription=${subscriptionId}`
        );
      } else {
        // Payment failed
        await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscriptionId);

        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing&payment=failed&subscription=${subscriptionId}`
        );
      }
    } catch (verifyError: any) {
      console.error('Payment verification error:', verifyError);
      
      // If verification fails, keep subscription in trialing status
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing&error=verification_failed&subscription=${subscriptionId}`
      );
    }
  } catch (error: any) {
    console.error('Callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing&error=callback_failed`
    );
  }
}
