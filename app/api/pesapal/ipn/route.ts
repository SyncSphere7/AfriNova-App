/**
 * Pesapal IPN (Instant Payment Notification) Webhook
 * Handles asynchronous payment status updates from Pesapal
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTransactionStatus } from '@/lib/services/pesapal';

// Use service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantReference = searchParams.get('OrderMerchantReference');
    const trackingId = searchParams.get('OrderTrackingId');
    const notificationType = searchParams.get('OrderNotificationType');

    console.log('IPN received:', {
      merchantReference,
      trackingId,
      notificationType,
    });

    if (!merchantReference || !trackingId) {
      return NextResponse.json(
        { status: 'error', message: 'Missing parameters' },
        { status: 400 }
      );
    }

    // Find the purchase
    const { data: purchase, error: purchaseError } = await supabase
      .from('app_purchases')
      .select('*')
      .eq('pesapal_merchant_reference', merchantReference)
      .single();

    if (purchaseError || !purchase) {
      console.error('Purchase not found for IPN:', merchantReference);
      return NextResponse.json(
        { status: 'ok', message: 'Purchase not found' },
        { status: 200 } // Return 200 to acknowledge receipt
      );
    }

    // If already completed, acknowledge and return
    if (purchase.status === 'completed') {
      return NextResponse.json(
        { status: 'ok', message: 'Already completed' },
        { status: 200 }
      );
    }

    // Get payment status from Pesapal
    try {
      const status = await getTransactionStatus(trackingId);

      console.log('Payment status:', {
        merchantReference,
        statusCode: status.status_code || status.payment_status_code,
        description: status.payment_status_description,
      });

      // Update purchase based on status
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
        } else {
          // Increment download count
          await supabase.rpc('increment_downloads', { 
            app_id: purchase.app_id 
          });

          console.log('Purchase completed:', purchase.id);
        }
      } else if (status.payment_status_code === '2' || status.status_code === 2) {
        // Payment failed
        await supabase
          .from('app_purchases')
          .update({
            status: 'failed',
            pesapal_tracking_id: trackingId,
          })
          .eq('id', purchase.id);

        console.log('Purchase failed:', purchase.id);
      } else if (status.payment_status_code === '3' || status.status_code === 3) {
        // Payment invalid
        await supabase
          .from('app_purchases')
          .update({
            status: 'failed',
            pesapal_tracking_id: trackingId,
          })
          .eq('id', purchase.id);

        console.log('Purchase invalid:', purchase.id);
      } else {
        // Payment still pending
        console.log('Payment still pending:', purchase.id);
      }

      // Always return 200 OK to acknowledge receipt
      return NextResponse.json(
        { status: 'ok', message: 'IPN processed' },
        { status: 200 }
      );
    } catch (statusError) {
      console.error('Error getting transaction status:', statusError);
      
      // Still return 200 to acknowledge receipt
      return NextResponse.json(
        { status: 'ok', message: 'IPN received, status check failed' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('IPN processing error:', error);
    
    // Return 200 even on error to prevent Pesapal retries
    return NextResponse.json(
      { status: 'ok', message: 'IPN received with error' },
      { status: 200 }
    );
  }
}

// POST method support (Pesapal may use either GET or POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { OrderMerchantReference, OrderTrackingId, OrderNotificationType } = body;

    console.log('IPN POST received:', body);

    if (!OrderMerchantReference || !OrderTrackingId) {
      return NextResponse.json(
        { status: 'error', message: 'Missing parameters' },
        { status: 400 }
      );
    }

    // Create URL with query params for GET handler
    const url = new URL(request.url);
    url.searchParams.set('OrderMerchantReference', OrderMerchantReference);
    url.searchParams.set('OrderTrackingId', OrderTrackingId);
    if (OrderNotificationType) {
      url.searchParams.set('OrderNotificationType', OrderNotificationType);
    }

    // Reuse GET handler logic
    const modifiedRequest = new Request(url.toString(), { method: 'GET' });
    return GET(modifiedRequest);
  } catch (error) {
    console.error('IPN POST processing error:', error);
    
    return NextResponse.json(
      { status: 'ok', message: 'IPN received with error' },
      { status: 200 }
    );
  }
}
