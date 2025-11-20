'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase/client';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { SubscriptionCard } from '@/components/payments/subscription-card';
import { TransactionHistory } from '@/components/payments/transaction-history';
import type { Profile } from '@/types';

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    loadProfile();

    const upgrade = searchParams.get('upgrade');
    const payment = searchParams.get('payment');

    if (upgrade || payment) {
      setActiveTab('billing');
    }

    if (payment === 'success') {
      setSuccess('Payment successful! Your subscription has been activated.');
    } else if (payment === 'cancelled') {
      setError('Payment was cancelled.');
    }
  }, [searchParams]);

  const loadProfile = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProfile(data as Profile);
        setFullName(data.full_name || '');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (error) throw error;

      setSuccess('Profile updated successfully');
      await loadProfile();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner text="LOADING SETTINGS..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-pixel uppercase mb-2">Settings</h1>
        <p className="text-muted-foreground font-sans">
          Manage your account settings and preferences.
        </p>
      </div>

      {error && (
        <div className="border-2 border-destructive bg-destructive/10 p-4 text-sm font-sans">
          {error}
        </div>
      )}

      {success && (
        <div className="border-2 border-success bg-success/10 p-4 text-sm font-sans">
          {success}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="border-2 border-foreground">
          <TabsTrigger value="profile" className="font-pixel text-xs uppercase">
            Profile
          </TabsTrigger>
          <TabsTrigger value="billing" className="font-pixel text-xs uppercase">
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="font-pixel text-xs uppercase">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-pixel text-xs uppercase">Subscription Tier</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-pixel uppercase px-3 py-2 border-2 border-foreground bg-muted">
                      {profile?.subscription_tier || 'free'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-pixel text-xs uppercase">Usage</Label>
                  <p className="text-sm font-sans">
                    {profile?.generations_used || 0} / {profile?.generations_limit || 5} generations used
                  </p>
                </div>

                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Current Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-sans mb-2">
                      Current Plan: <span className="font-pixel uppercase text-lg">{profile?.subscription_tier || 'free'}</span>
                    </p>
                    <p className="text-sm text-muted-foreground font-sans">
                      {profile?.generations_used || 0} / {profile?.generations_limit || 5} generations used this month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <h3 className="text-lg font-pixel uppercase mb-4">Available Plans</h3>
              <SubscriptionCard
                currentTier={profile?.subscription_tier || 'free'}
                onUpgrade={loadProfile}
              />
            </div>

            <TransactionHistory />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
