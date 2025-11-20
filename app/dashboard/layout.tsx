import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/dashboard/sidebar';
import { UserDropdown } from '@/components/dashboard/user-dropdown';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import type { Profile } from '@/types';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) {
    redirect('/auth/login');
  }

  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b-2 border-foreground bg-primary px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-pixel uppercase">Dashboard</h1>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserDropdown profile={profile as Profile} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
