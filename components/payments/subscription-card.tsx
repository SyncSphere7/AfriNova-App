'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, CreditCard } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Plan {
  id: string;
  name: string;
  price: string;
  priceValue: number;
  features: string[];
  generationsLimit: number;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$15',
    priceValue: 15,
    generationsLimit: 30,
    features: [
      '30 generations per month',
      '15 projects max',
      'Email support (48h)',
      'All 20 integrations',
      'File uploads (10 files)',
      'Priority queue',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '$35',
    priceValue: 35,
    generationsLimit: 100,
    features: [
      '100 generations per month',
      '50 projects max',
      'Priority support (4h)',
      'Unlimited file uploads',
      'Team sharing (3 seats)',
      'White-label & API access',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$75',
    priceValue: 75,
    generationsLimit: 300,
    features: [
      '300 generations per month',
      'Unlimited projects',
      '24/7 support',
      'Team sharing (10 seats)',
      'Custom AI models',
      'Dedicated account manager',
    ],
  },
];

interface SubscriptionCardProps {
  currentTier: string;
  onUpgrade?: () => void;
}

export function SubscriptionCard({ currentTier, onUpgrade }: SubscriptionCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isAnnual, setIsAnnual] = useState(false);

  const handleSubscribe = async (planId: string) => {
    setLoading(planId);
    setError('');

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Call the new subscribe API endpoint
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: planId,
          billingCycle: isAnnual ? 'annual' : 'monthly',
          paymentMethod: 'card', // Default to card, can add selector later
          // provider: 'pesapal', // Optional - will auto-select
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate subscription');
      }

      // Check if payment requires action (redirect)
      if (data.payment?.redirectUrl) {
        // Redirect to payment gateway (Pesapal, Stripe, PayPal)
        window.location.href = data.payment.redirectUrl;
      } else if (data.payment?.clientSecret) {
        // Stripe payment (next week) - use Stripe Elements
        // TODO: Implement Stripe payment flow
        console.log('Stripe payment:', data.payment.clientSecret);
      } else if (data.subscription) {
        // Trial started without payment
        router.push('/dashboard/settings?tab=billing&payment=trial');
      }
    } catch (err: any) {
      console.error('Subscription error:', err);
      setError(err.message || 'Failed to process subscription');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="border-2 border-destructive bg-destructive/10 p-4 text-sm font-pixel">
          {error}
        </div>
      )}

      <div className="flex items-center justify-center gap-4 mb-6">
        <span className={`text-sm font-pixel ${!isAnnual ? 'font-bold' : 'text-muted-foreground'}`}>
          Monthly
        </span>
        <Switch
          checked={isAnnual}
          onCheckedChange={setIsAnnual}
        />
        <span className={`text-sm font-pixel ${isAnnual ? 'font-bold' : 'text-muted-foreground'}`}>
          Annual
        </span>
        {isAnnual && (
          <Badge variant="default">Save 20%</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentTier === plan.id;
          const isPlanDowngrade =
            currentTier === 'pro' && (plan.id === 'starter' || plan.id === 'growth') ||
            currentTier === 'growth' && plan.id === 'starter';

          const displayPrice = isAnnual ? (plan.priceValue * 12 * 0.8).toFixed(0) : plan.priceValue;
          const monthlyEquivalent = isAnnual ? (plan.priceValue * 0.8).toFixed(0) : plan.priceValue;

          return (
            <Card key={plan.id} className={isCurrentPlan ? 'border-accent border-4' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  {isCurrentPlan && (
                    <Badge variant="default">Current</Badge>
                  )}
                </div>
                <CardDescription>
                  <div>
                    <span className="text-3xl font-pixel text-foreground">${monthlyEquivalent}</span>
                    <span className="text-sm"> / month</span>
                  </div>
                  {isAnnual && (
                    <p className="text-xs text-muted-foreground mt-1">Billed ${displayPrice}/year</p>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-pixel">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrentPlan || loading !== null || isPlanDowngrade}
                  className="w-full"
                  variant={isCurrentPlan ? 'outline' : 'default'}
                >
                  {loading === plan.id ? (
                    'Processing...'
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : isPlanDowngrade ? (
                    'Contact Support'
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Subscribe
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
