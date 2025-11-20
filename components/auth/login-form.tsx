'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (searchParams.get('reset') === 'success') {
      setSuccessMessage('Password reset successful! Please log in with your new password.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="SIGNING IN..." />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {successMessage && (
        <div className="border-2 border-green-500 bg-green-500/10 p-4 text-sm font-sans">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="border-2 border-destructive bg-destructive/10 p-4 text-sm font-sans">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="font-pixel text-xs uppercase">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="font-pixel text-xs uppercase">
            Password
          </Label>
          <Link
            href="/auth/forgot-password"
            className="text-xs font-sans hover:text-accent transition-colors"
          >
            Forgot Password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        Sign In
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t-2 border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground font-pixel">Or</span>
        </div>
      </div>

      <div className="text-center text-sm font-sans">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="font-pixel text-xs hover:text-accent transition-colors uppercase">
          Sign Up
        </Link>
      </div>
    </form>
  );
}
