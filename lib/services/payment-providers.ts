/**
 * Payment Provider Abstraction Layer
 * 
 * Supports multiple payment providers:
 * - Pesapal (Active - for African markets)
 * - Stripe (Coming Next Week)
 * - PayPal (Coming Next Week)
 * 
 * This abstraction allows seamless switching between providers
 * and supports multiple providers simultaneously.
 */

import { submitOrder as pesapalSubmitOrder, getTransactionStatus } from './pesapal';

// ==================== TYPES ====================

export type PaymentProvider = 'pesapal' | 'stripe' | 'paypal';

export type PaymentMethod = 'mobile' | 'card' | 'paypal' | 'crypto';

export interface SubscriptionPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  generationsLimit: number;
}

export interface PaymentIntent {
  provider: PaymentProvider;
  redirectUrl?: string;
  clientSecret?: string; // For Stripe
  orderId?: string; // For PayPal
  merchantReference?: string;
  trackingId?: string;
  status: 'pending' | 'requires_action' | 'succeeded' | 'failed';
}

export interface SubscriptionPaymentRequest {
  userId: string;
  email: string;
  plan: SubscriptionPlan;
  billingCycle: 'monthly' | 'annual';
  paymentMethod: PaymentMethod;
  provider?: PaymentProvider; // Optional - auto-select if not provided
  phoneNumber?: string; // For mobile money
  returnUrl: string;
  cancelUrl: string;
}

export interface RefundRequest {
  provider: PaymentProvider;
  transactionId: string;
  amount: number;
  reason: string;
}

export interface PaymentVerification {
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  transactionId: string;
  amount: number;
  currency: string;
  paidAt?: Date;
}

// ==================== PROVIDER SELECTION ====================

/**
 * Auto-select best payment provider based on user preferences and availability
 */
export function selectProvider(
  paymentMethod: PaymentMethod,
  preferredProvider?: PaymentProvider
): PaymentProvider {
  // If provider explicitly requested and configured, use it
  if (preferredProvider) {
    if (isProviderConfigured(preferredProvider)) {
      return preferredProvider;
    }
  }

  // Auto-select based on payment method
  switch (paymentMethod) {
    case 'mobile':
      // Pesapal best for mobile money in Africa
      return 'pesapal';
    
    case 'card':
      // Prefer Stripe for cards (when configured), fallback to Pesapal
      return isProviderConfigured('stripe') ? 'stripe' : 'pesapal';
    
    case 'paypal':
      return 'paypal';
    
    case 'crypto':
      // Future: Coinbase Commerce or similar
      throw new Error('Crypto payments not yet supported');
    
    default:
      return 'pesapal'; // Default fallback
  }
}

/**
 * Check if a payment provider is configured
 */
export function isProviderConfigured(provider: PaymentProvider): boolean {
  switch (provider) {
    case 'pesapal':
      return !!(
        process.env.PESAPAL_CONSUMER_KEY &&
        process.env.PESAPAL_CONSUMER_SECRET
      );
    
    case 'stripe':
      return !!(
        process.env.STRIPE_SECRET_KEY &&
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      );
    
    case 'paypal':
      return !!(
        process.env.PAYPAL_CLIENT_ID &&
        process.env.PAYPAL_CLIENT_SECRET
      );
    
    default:
      return false;
  }
}

/**
 * Get list of available payment providers
 */
export function getAvailableProviders(): PaymentProvider[] {
  const providers: PaymentProvider[] = [];
  
  if (isProviderConfigured('pesapal')) providers.push('pesapal');
  if (isProviderConfigured('stripe')) providers.push('stripe');
  if (isProviderConfigured('paypal')) providers.push('paypal');
  
  return providers;
}

// ==================== PESAPAL IMPLEMENTATION ====================

async function createPesapalSubscription(
  request: SubscriptionPaymentRequest
): Promise<PaymentIntent> {
  const amount = request.billingCycle === 'annual'
    ? request.plan.annualPrice
    : request.plan.monthlyPrice;

  const description = `${request.plan.name} Plan - ${request.billingCycle === 'annual' ? 'Annual' : 'Monthly'} Subscription`;

  const result = await pesapalSubmitOrder({
    id: `SUB-${request.userId.slice(0, 8)}-${Date.now()}`,
    amount,
    currency: 'USD',
    description,
    callback_url: request.returnUrl,
    notification_id: process.env.PESAPAL_IPN_ID!,
    billing_address: {
      email_address: request.email,
      phone_number: request.phoneNumber,
    },
  });

  return {
    provider: 'pesapal',
    redirectUrl: result.redirect_url,
    merchantReference: result.merchant_reference,
    trackingId: result.order_tracking_id,
    status: 'requires_action',
  };
}

async function verifyPesapalPayment(trackingId: string): Promise<PaymentVerification> {
  const transactionStatus = await getTransactionStatus(trackingId);
  
  // Pesapal returns payment_status_description as a string
  // Common values: "Completed", "Pending", "Failed", "Reversed"
  const statusDescription = transactionStatus.payment_status_description.toLowerCase();
  
  let status: 'completed' | 'pending' | 'failed' | 'refunded' = 'pending';
  
  if (statusDescription.includes('completed') || statusDescription.includes('success')) {
    status = 'completed';
  } else if (statusDescription.includes('failed') || statusDescription.includes('cancel')) {
    status = 'failed';
  } else if (statusDescription.includes('refund') || statusDescription.includes('reversed')) {
    status = 'refunded';
  }
  
  return {
    status,
    transactionId: trackingId,
    amount: transactionStatus.amount,
    currency: transactionStatus.currency,
    paidAt: status === 'completed' ? new Date(transactionStatus.created_date) : undefined,
  };
}

// ==================== STRIPE IMPLEMENTATION (READY FOR NEXT WEEK) ====================

async function createStripeSubscription(
  request: SubscriptionPaymentRequest
): Promise<PaymentIntent> {
  // Check if Stripe is configured
  if (!isProviderConfigured('stripe')) {
    throw new Error('Stripe is not configured yet. Please use Pesapal or wait for Stripe setup.');
  }

  // NOTE: Implement this next week when Stripe keys are added
  // For now, throw helpful error
  throw new Error('Stripe integration coming next week! Please use Pesapal for now.');

  /* IMPLEMENTATION NEXT WEEK:
  
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  // Create or get customer
  const customer = await stripe.customers.create({
    email: request.email,
    metadata: {
      userId: request.userId,
    },
  });

  // Create subscription
  const priceId = request.billingCycle === 'annual'
    ? request.plan.stripePriceIdAnnual
    : request.plan.stripePriceIdMonthly;

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });

  const paymentIntent = subscription.latest_invoice.payment_intent;

  return {
    provider: 'stripe',
    clientSecret: paymentIntent.client_secret,
    status: 'requires_action',
  };
  
  */
}

async function verifyStripePayment(paymentIntentId: string): Promise<PaymentVerification> {
  if (!isProviderConfigured('stripe')) {
    throw new Error('Stripe is not configured yet');
  }

  throw new Error('Stripe verification coming next week!');

  /* IMPLEMENTATION NEXT WEEK:
  
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  return {
    status: paymentIntent.status === 'succeeded' ? 'completed' : 'pending',
    transactionId: paymentIntent.id,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency.toUpperCase(),
    paidAt: paymentIntent.status === 'succeeded' ? new Date(paymentIntent.created * 1000) : undefined,
  };
  
  */
}

// ==================== PAYPAL IMPLEMENTATION (READY FOR NEXT WEEK) ====================

async function createPayPalSubscription(
  request: SubscriptionPaymentRequest
): Promise<PaymentIntent> {
  if (!isProviderConfigured('paypal')) {
    throw new Error('PayPal is not configured yet. Please use Pesapal or wait for PayPal setup.');
  }

  throw new Error('PayPal integration coming next week! Please use Pesapal for now.');

  /* IMPLEMENTATION NEXT WEEK:
  
  // Get PayPal access token
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const tokenResponse = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const { access_token } = await tokenResponse.json();

  // Create subscription
  const planId = request.billingCycle === 'annual'
    ? request.plan.paypalPlanIdAnnual
    : request.plan.paypalPlanIdMonthly;

  const subscriptionResponse = await fetch('https://api-m.paypal.com/v1/billing/subscriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      plan_id: planId,
      subscriber: {
        email_address: request.email,
      },
      application_context: {
        return_url: request.returnUrl,
        cancel_url: request.cancelUrl,
      },
    }),
  });

  const subscription = await subscriptionResponse.json();

  return {
    provider: 'paypal',
    orderId: subscription.id,
    redirectUrl: subscription.links.find((l: any) => l.rel === 'approve')?.href,
    status: 'requires_action',
  };
  
  */
}

async function verifyPayPalPayment(subscriptionId: string): Promise<PaymentVerification> {
  if (!isProviderConfigured('paypal')) {
    throw new Error('PayPal is not configured yet');
  }

  throw new Error('PayPal verification coming next week!');

  /* IMPLEMENTATION NEXT WEEK:
  
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const tokenResponse = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const { access_token } = await tokenResponse.json();

  const subscriptionResponse = await fetch(
    `https://api-m.paypal.com/v1/billing/subscriptions/${subscriptionId}`,
    {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    }
  );

  const subscription = await subscriptionResponse.json();

  return {
    status: subscription.status === 'ACTIVE' ? 'completed' : 'pending',
    transactionId: subscriptionId,
    amount: parseFloat(subscription.billing_info.last_payment.amount.value),
    currency: subscription.billing_info.last_payment.amount.currency_code,
    paidAt: new Date(subscription.start_time),
  };
  
  */
}

// ==================== PUBLIC API ====================

/**
 * Create a subscription payment intent
 * Automatically selects best provider or uses specified one
 */
export async function createSubscriptionPayment(
  request: SubscriptionPaymentRequest
): Promise<PaymentIntent> {
  // Select provider
  const provider = request.provider || selectProvider(request.paymentMethod);

  // Verify provider is configured
  if (!isProviderConfigured(provider)) {
    const available = getAvailableProviders();
    throw new Error(
      `${provider} is not configured. Available providers: ${available.join(', ')}`
    );
  }

  // Route to appropriate provider
  switch (provider) {
    case 'pesapal':
      return await createPesapalSubscription(request);
    
    case 'stripe':
      return await createStripeSubscription(request);
    
    case 'paypal':
      return await createPayPalSubscription(request);
    
    default:
      throw new Error(`Unsupported payment provider: ${provider}`);
  }
}

/**
 * Verify a payment using the appropriate provider
 */
export async function verifyPayment(
  provider: PaymentProvider,
  transactionId: string
): Promise<PaymentVerification> {
  switch (provider) {
    case 'pesapal':
      return await verifyPesapalPayment(transactionId);
    
    case 'stripe':
      return await verifyStripePayment(transactionId);
    
    case 'paypal':
      return await verifyPayPalPayment(transactionId);
    
    default:
      throw new Error(`Unsupported payment provider: ${provider}`);
  }
}

/**
 * Process a refund through the appropriate provider
 */
export async function processRefund(request: RefundRequest): Promise<boolean> {
  if (!isProviderConfigured(request.provider)) {
    throw new Error(`${request.provider} is not configured`);
  }

  // TODO: Implement refund logic for each provider
  // For now, return placeholder
  throw new Error('Refund processing coming soon');

  /* IMPLEMENTATION LATER:
  
  switch (request.provider) {
    case 'pesapal':
      // Pesapal refund API
      break;
    case 'stripe':
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      await stripe.refunds.create({
        payment_intent: request.transactionId,
        amount: request.amount * 100,
        reason: 'requested_by_customer',
      });
      return true;
    case 'paypal':
      // PayPal refund API
      break;
  }
  
  */
}

/**
 * Cancel a subscription through the appropriate provider
 */
export async function cancelSubscription(
  provider: PaymentProvider,
  subscriptionId: string
): Promise<boolean> {
  if (!isProviderConfigured(provider)) {
    throw new Error(`${provider} is not configured`);
  }

  // TODO: Implement cancellation for each provider
  throw new Error('Subscription cancellation coming soon');

  /* IMPLEMENTATION LATER:
  
  switch (provider) {
    case 'stripe':
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      await stripe.subscriptions.cancel(subscriptionId);
      return true;
    case 'paypal':
      // PayPal cancel API
      break;
    case 'pesapal':
      // Pesapal doesn't support automatic recurring yet
      // Manual cancellation in database
      break;
  }
  
  */
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get provider-specific configuration for frontend
 */
export function getProviderConfig(provider: PaymentProvider) {
  switch (provider) {
    case 'stripe':
      return {
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      };
    case 'paypal':
      return {
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
      };
    case 'pesapal':
      return {
        environment: process.env.PESAPAL_ENVIRONMENT || 'sandbox',
      };
    default:
      return {};
  }
}

/**
 * Format amount for display based on provider
 */
export function formatAmount(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}
