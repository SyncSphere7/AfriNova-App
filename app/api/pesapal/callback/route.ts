/**
 * Pesapal Payment Callback
 * Handles user redirect after payment completion
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getTransactionStatus } from '@/lib/services/pesapal';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantReference = searchParams.get('merchant_reference') || searchParams.get('OrderTrackingId');
    const trackingId = searchParams.get('OrderTrackingId');

    if (!merchantReference) {
      return NextResponse.redirect(
        new URL('/marketplace?error=invalid_callback', request.url)
      );
    }

    const supabase = await createServerClient();

    // Find the purchase
    const { data: purchase, error: purchaseError } = await supabase
      .from('app_purchases')
      .select('*, marketplace_apps(*)')
      .eq('pesapal_merchant_reference', merchantReference)
      .single();

    if (purchaseError || !purchase) {
      console.error('Purchase not found:', merchantReference);
      return NextResponse.redirect(
        new URL('/marketplace?error=purchase_not_found', request.url)
      );
    }

    // If already completed, redirect to my-purchases
    if (purchase.status === 'completed') {
      return NextResponse.redirect(
        new URL('/marketplace/my-purchases?success=true', request.url)
      );
    }

    // Check payment status with Pesapal
    if (trackingId) {
      try {
        const status = await getTransactionStatus(trackingId);

        if (status.payment_status_code === '1' || status.status_code === 1) {
          // Payment successful
          const { error: updateError } = await supabase
            .from('app_purchases')
            .update({
              status: 'completed',
              pesapal_tracking_id: trackingId,
              completed_at: new Date().toISOString(),
            })
            .eq('id', purchase.id);

          if (updateError) {
            console.error('Failed to update purchase:', updateError);
          }

          // Increment download count
          await supabase.rpc('increment_downloads', { 
            app_id: purchase.app_id 
          });

          return NextResponse.redirect(
            new URL(`/marketplace/my-purchases?success=true&app=${purchase.marketplace_apps.slug}`, request.url)
          );
        } else if (status.payment_status_code === '2' || status.status_code === 2) {
          // Payment failed
          await supabase
            .from('app_purchases')
            .update({
              status: 'failed',
              pesapal_tracking_id: trackingId,
            })
            .eq('id', purchase.id);

          return NextResponse.redirect(
            new URL(`/marketplace/${purchase.marketplace_apps.slug}?error=payment_failed`, request.url)
          );
        } else if (status.payment_status_code === '3' || status.status_code === 3) {
          // Payment invalid
          await supabase
            .from('app_purchases')
            .update({
              status: 'failed',
              pesapal_tracking_id: trackingId,
            })
            .eq('id', purchase.id);

          return NextResponse.redirect(
            new URL(`/marketplace/${purchase.marketplace_apps.slug}?error=payment_invalid`, request.url)
          );
        } else {
          // Payment pending - wait for IPN
          return NextResponse.redirect(
            new URL(`/marketplace/my-purchases?pending=true`, request.url)
          );
        }
      } catch (statusError) {
        console.error('Error checking payment status:', statusError);
        // Redirect to pending state, IPN will update later
        return NextResponse.redirect(
          new URL(`/marketplace/my-purchases?pending=true`, request.url)
        );
      }
    }

    // No tracking ID - redirect to pending
    return NextResponse.redirect(
      new URL(`/marketplace/my-purchases?pending=true`, request.url)
    );
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(
      new URL('/marketplace?error=callback_error', request.url)
    );
  }
}
