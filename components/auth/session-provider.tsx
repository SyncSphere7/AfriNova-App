'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        router.refresh();
      }

      if (event === 'SIGNED_OUT') {
        router.push('/auth/login');
        router.refresh();
      }

      if (event === 'TOKEN_REFRESHED') {
        router.refresh();
      }

      if (event === 'PASSWORD_RECOVERY') {
        router.push('/auth/reset-password');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return <>{children}</>;
}
