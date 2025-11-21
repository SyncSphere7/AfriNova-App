/**
 * Marketplace Purchase API
 * Handles app purchase initiation with Pesapal payment integration
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { submitOrder } from '@/lib/services/pesapal';
import { convertToUSD } from '@/lib/utils/currency';
import { rateLimit, getIdentifier, RATE_LIMITS } from '@/lib/utils/rate-limit';

export async function POST(request: Request) {
  try {
    // Apply rate limiting
    const identifier = getIdentifier(request);
    rateLimit(identifier, RATE_LIMITS.PAYMENT);
    
    const supabase = await createServerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      appId,
      amount,
      currency,
      paymentMethod,
      phoneNumber
    } = body;

    // Validate request
    if (!appId || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: appId, amount' },
        { status: 400 }
      );
    }

    // Get app details
    const { data: app, error: appError } = await supabase
      .from('marketplace_apps')
      .select('*')
      .eq('id', appId)
      .single();

    if (appError || !app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    // Check if user already owns this app
    const { data: existingPurchase } = await supabase
      .from('app_purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('app_id', appId)
      .eq('status', 'completed')
      .single();

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'You already own this app' },
        { status: 400 }
      );
    }

    // Handle free apps
    if (app.is_free || amount === 0) {
      const { data: purchase, error: purchaseError } = await supabase
        .from('app_purchases')
        .insert({
          user_id: user.id,
          app_id: appId,
          amount: 0,
          currency: 'USD',
          payment_method: 'free',
          status: 'completed',
        })
        .select()
        .single();

      if (purchaseError) {
        console.error('Purchase error:', purchaseError);
        return NextResponse.json(
          { error: 'Failed to complete purchase' },
          { status: 500 }
        );
      }

      // Update download count
      await supabase.rpc('increment_downloads', { app_id: appId });

      return NextResponse.json({
        success: true,
        purchase,
        message: 'App added to your library',
      });
    }

    // Handle paid apps with Pesapal
    // Generate unique merchant reference
    const merchantReference = `APP-${appId}-${user.id}-${Date.now()}`;

    // Convert amount to USD for storage (if in different currency)
    const amountUSD = currency && currency !== 'USD' 
      ? convertToUSD(amount, currency)
      : amount;

    // Create pending purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from('app_purchases')
      .insert({
        user_id: user.id,
        app_id: appId,
        amount: amountUSD,
        currency: 'USD',
        payment_method: paymentMethod || 'pesapal',
        status: 'pending',
        pesapal_merchant_reference: merchantReference,
      })
      .select()
      .single();

    if (purchaseError) {
      console.error('Purchase creation error:', purchaseError);
      return NextResponse.json(
        { error: 'Failed to create purchase' },
        { status: 500 }
      );
    }

    // Get user email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    const userEmail = profile?.email || user.email || '';

    // Get callback URL
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const callbackUrl = `${origin}/api/pesapal/callback?merchant_reference=${merchantReference}`;

    // Submit order to Pesapal
    try {
      const pesapalOrder = await submitOrder({
        id: merchantReference,
        currency: currency || 'USD',
        amount: amount,
        description: `Purchase: ${app.name}`,
        callback_url: callbackUrl,
        notification_id: process.env.PESAPAL_IPN_ID || '',
        billing_address: {
          email_address: userEmail,
          phone_number: phoneNumber,
          first_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        },
      });

      // Update purchase with Pesapal tracking ID
      await supabase
        .from('app_purchases')
        .update({
          pesapal_tracking_id: pesapalOrder.order_tracking_id,
        })
        .eq('id', purchase.id);

      return NextResponse.json({
        success: true,
        redirectUrl: pesapalOrder.redirect_url,
        merchantReference,
        trackingId: pesapalOrder.order_tracking_id,
      });
    } catch (pesapalError) {
      console.error('Pesapal error:', pesapalError);
      
      // Mark purchase as failed
      await supabase
        .from('app_purchases')
        .update({ status: 'failed' })
        .eq('id', purchase.id);

      return NextResponse.json(
        { error: 'Payment gateway error. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Purchase API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
