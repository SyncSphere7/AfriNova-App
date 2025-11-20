'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';

const tiers = [
  {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    period: 'forever',
    description: 'Perfect for trying out AfriNova',
    features: [
      { name: '5 generations/month', included: true },
      { name: '3 projects max', included: true },
      { name: 'Community support', included: true },
      { name: 'Basic templates', included: true },
      { name: 'AfriNova branding visible', included: true },
      { name: 'No integrations', included: false },
      { name: 'No file uploads', included: false },
      { name: 'No API access', included: false },
      { name: 'No team sharing', included: false },
    ],
    cta: 'GET STARTED FREE',
    href: '/auth/signup',
    plan: 'free',
  },
  {
    name: 'Starter',
    monthlyPrice: 15,
    annualPrice: 12,
    period: 'per month',
    description: 'For individual developers',
    popular: true,
    features: [
      { name: '30 generations/month', included: true },
      { name: '15 projects max', included: true },
      { name: 'Email support (48h response)', included: true },
      { name: 'All 20 integrations', included: true },
      { name: 'File uploads (10 files max)', included: true },
      { name: 'No AfriNova branding', included: true },
      { name: 'Priority queue', included: true },
      { name: 'No team sharing', included: false },
      { name: 'No API access', included: false },
      { name: 'No white-label', included: false },
    ],
    cta: 'START FREE TRIAL',
    ctaSubtext: '14 days',
    href: '/dashboard/settings?upgrade=starter',
    plan: 'starter',
  },
  {
    name: 'Growth',
    monthlyPrice: 35,
    annualPrice: 28,
    period: 'per month',
    description: 'For growing teams',
    features: [
      { name: '100 generations/month', included: true },
      { name: '50 projects max', included: true },
      { name: 'Priority support (4h response)', included: true },
      { name: 'Everything in Starter', included: true },
      { name: 'Unlimited file uploads', included: true },
      { name: 'Team sharing (3 seats)', included: true },
      { name: 'White-label option', included: true },
      { name: 'API access', included: true },
      { name: 'No custom AI models', included: false },
      { name: 'No dedicated account manager', included: false },
    ],
    cta: 'START FREE TRIAL',
    ctaSubtext: '14 days',
    href: '/dashboard/settings?upgrade=growth',
    plan: 'growth',
  },
  {
    name: 'Pro',
    monthlyPrice: 75,
    annualPrice: 60,
    period: 'per month',
    description: 'For professional teams',
    features: [
      { name: '300 generations/month', included: true },
      { name: 'Unlimited projects', included: true },
      { name: '24/7 support', included: true },
      { name: 'Everything in Growth', included: true },
      { name: 'Team sharing (10 seats)', included: true },
      { name: 'Custom AI models', included: true },
      { name: 'Dedicated account manager', included: true },
      { name: 'SLA (99.9% uptime)', included: true },
      { name: 'Priority feature requests', included: true },
      { name: 'Custom integrations', included: true },
    ],
    cta: 'CONTACT SALES',
    href: 'mailto:sales@afrinova.com',
    plan: 'pro',
  },
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-pixel uppercase mb-4">
                Pricing Plans
              </h1>
              <p className="text-lg font-sans text-muted-foreground max-w-2xl mx-auto mb-8">
                Choose the perfect plan for your needs. Start with 14 days free.
              </p>

              <div className="flex items-center justify-center gap-4">
                <span className={`text-sm font-sans ${!isAnnual ? 'font-bold' : 'text-muted-foreground'}`}>
                  Monthly
                </span>
                <Switch
                  checked={isAnnual}
                  onCheckedChange={setIsAnnual}
                />
                <span className={`text-sm font-sans ${isAnnual ? 'font-bold' : 'text-muted-foreground'}`}>
                  Annual
                </span>
                {isAnnual && (
                  <span className="bg-success text-white px-3 py-1 text-xs font-pixel uppercase border-2 border-foreground">
                    Save 20%
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tiers.map((tier) => {
                const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
                const savings = isAnnual && tier.monthlyPrice > 0
                  ? ((tier.monthlyPrice - tier.annualPrice) / tier.monthlyPrice * 100).toFixed(0)
                  : 0;

                return (
                  <Card
                    key={tier.name}
                    className={`relative ${
                      tier.popular ? 'border-accent border-4' : ''
                    }`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="bg-accent text-accent-foreground px-4 py-1 text-xs font-pixel uppercase border-2 border-foreground">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <CardHeader>
                      <CardTitle className="text-base mb-2">{tier.name}</CardTitle>
                      <div className="mb-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-pixel">${price}</span>
                          <span className="text-sm font-sans text-muted-foreground">
                            / {tier.name === 'Free' ? tier.period : 'month'}
                          </span>
                        </div>
                        {isAnnual && tier.monthlyPrice > 0 && (
                          <p className="text-xs font-sans text-muted-foreground mt-1">
                            Billed ${tier.annualPrice * 12}/year
                          </p>
                        )}
                      </div>
                      <p className="text-sm font-sans text-muted-foreground">
                        {tier.description}
                      </p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <ul className="space-y-3 min-h-[280px]">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            {feature.included ? (
                              <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                            ) : (
                              <X className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            )}
                            <span
                              className={`text-sm font-sans ${
                                !feature.included ? 'text-muted-foreground line-through' : ''
                              }`}
                            >
                              {feature.name}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <div className="space-y-2">
                        <Link href={tier.href}>
                          <Button
                            className="w-full"
                            variant={tier.popular ? 'default' : 'outline'}
                          >
                            {tier.cta}
                          </Button>
                        </Link>
                        {tier.ctaSubtext && (
                          <p className="text-xs text-center font-sans text-muted-foreground">
                            {tier.ctaSubtext}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="mt-16">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-center">
                    Subscription Rules
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-pixel uppercase mb-2">
                        Free Trial
                      </h3>
                      <ul className="text-sm font-sans text-muted-foreground space-y-1">
                        <li>14 days for Starter & Growth</li>
                        <li>No credit card required</li>
                        <li>Full tier access during trial</li>
                        <li>Auto-downgrade to Free if not converted</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm font-pixel uppercase mb-2">
                        Upgrades
                      </h3>
                      <ul className="text-sm font-sans text-muted-foreground space-y-1">
                        <li>Immediate access to new tier features</li>
                        <li>Prorated credit for remaining time</li>
                        <li>Generations limit increases immediately</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm font-pixel uppercase mb-2">
                        Downgrades
                      </h3>
                      <ul className="text-sm font-sans text-muted-foreground space-y-1">
                        <li>Takes effect at end of billing period</li>
                        <li>Existing projects archived if over new limit</li>
                        <li>Premium features disabled at period end</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm font-pixel uppercase mb-2">
                        Usage Tracking
                      </h3>
                      <ul className="text-sm font-sans text-muted-foreground space-y-1">
                        <li>1 generation = 1 complete project</li>
                        <li>Regeneration counts as new generation</li>
                        <li>Soft warning at 80% usage</li>
                        <li>Hard block at 100% usage</li>
                        <li>Resets on 1st of each month</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-center">
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-pixel uppercase mb-2">
                        What is a generation?
                      </h3>
                      <p className="text-sm font-sans text-muted-foreground">
                        A generation is when you create a new project and our AI generates
                        production-ready code using multiple specialized agents.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-pixel uppercase mb-2">
                        Can I upgrade or downgrade?
                      </h3>
                      <p className="text-sm font-sans text-muted-foreground">
                        Yes! Upgrades are immediate with prorated billing. Downgrades take
                        effect at the end of your current billing period.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-pixel uppercase mb-2">
                        What payment methods do you accept?
                      </h3>
                      <p className="text-sm font-sans text-muted-foreground">
                        We accept Pesapal (M-Pesa, cards), PayPal, and Stripe payments for
                        global coverage.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-pixel uppercase mb-2">
                        What happens after my trial ends?
                      </h3>
                      <p className="text-sm font-sans text-muted-foreground">
                        Your account automatically downgrades to the Free plan. You can upgrade
                        to a paid plan anytime to restore full access.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
