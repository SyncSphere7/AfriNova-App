'use client';

import Link from 'next/link';
import { Zap, Code2, Shield, Globe, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { useI18n } from '@/lib/i18n/context';

export default function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-pixel uppercase mb-6 leading-tight">
              {t.common.appName}
            </h1>
            <p className="text-xl sm:text-2xl font-pixel uppercase mb-4 text-accent">
              AI-Powered Full-Stack Developer
            </p>
            <p className="text-lg font-sans mb-8 text-muted-foreground max-w-2xl mx-auto">
              {t.common.tagline}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Building Free
                </Button>
              </Link>
              <Link href="/docs">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  View Documentation
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-pixel uppercase text-center mb-12">
              Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-card">
                <CardHeader>
                  <div className="mb-4">
                    <Zap className="h-8 w-8 text-accent" />
                  </div>
                  <CardTitle className="text-base">10 Specialized AI Agents</CardTitle>
                  <CardDescription>
                    Frontend, Backend, Database, Payments, Security, DevOps, Testing, Analytics, Integrations, and UX/UI agents working together.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card">
                <CardHeader>
                  <div className="mb-4">
                    <Code2 className="h-8 w-8 text-accent" />
                  </div>
                  <CardTitle className="text-base">Production-Ready Code</CardTitle>
                  <CardDescription>
                    TypeScript, React, Node.js, PostgreSQL—enterprise-grade code with tests, documentation, and best practices built in.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card">
                <CardHeader>
                  <div className="mb-4">
                    <Shield className="h-8 w-8 text-accent" />
                  </div>
                  <CardTitle className="text-base">Security First</CardTitle>
                  <CardDescription>
                    PCI-DSS compliant payment integrations, input validation, encryption, and security scanning included by default.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card">
                <CardHeader>
                  <div className="mb-4">
                    <Globe className="h-8 w-8 text-accent" />
                  </div>
                  <CardTitle className="text-base">Global Integrations</CardTitle>
                  <CardDescription>
                    150+ payment gateways including Pesapal, PayPal, Stripe, and integrations for analytics, auth, and more.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-pixel uppercase text-center mb-12">
              Platform Stats
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="border-2 border-foreground bg-card p-6 text-center shadow-pixel">
                <div className="text-3xl font-pixel mb-2 text-accent">1000+</div>
                <div className="text-sm font-sans uppercase">Projects Generated</div>
              </div>
              <div className="border-2 border-foreground bg-card p-6 text-center shadow-pixel">
                <div className="text-3xl font-pixel mb-2 text-accent">500+</div>
                <div className="text-sm font-sans uppercase">Developers</div>
              </div>
              <div className="border-2 border-foreground bg-card p-6 text-center shadow-pixel">
                <div className="text-3xl font-pixel mb-2 text-accent">50+</div>
                <div className="text-sm font-sans uppercase">Countries</div>
              </div>
              <div className="border-2 border-foreground bg-card p-6 text-center shadow-pixel">
                <div className="text-3xl font-pixel mb-2 text-accent">99.9%</div>
                <div className="text-sm font-sans uppercase">Uptime</div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-accent text-accent-foreground">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl sm:text-4xl font-pixel uppercase mb-4">
              Ready to Build Your Next App?
            </h2>
            <p className="text-lg font-sans mb-8">
              Join developers building faster with AI. Start free, upgrade anytime.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline" className="border-foreground bg-background text-foreground hover:bg-secondary">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
