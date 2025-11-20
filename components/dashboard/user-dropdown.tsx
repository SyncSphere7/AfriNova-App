'use client';

import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types';

interface UserDropdownProps {
  profile: Profile;
}

export function UserDropdown({ profile }: UserDropdownProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  const initials = profile.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <Avatar className="h-8 w-8 border-2 border-foreground">
            <AvatarFallback className="bg-accent text-accent-foreground font-pixel text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block text-left">
            <div className="text-sm font-pixel">{profile.full_name || 'User'}</div>
            <div className="text-xs text-muted-foreground uppercase font-pixel">
              {profile.subscription_tier}
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 border-2 border-foreground shadow-pixel">
        <DropdownMenuLabel className="font-pixel text-xs uppercase">
          My Account
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border h-0.5" />
        <DropdownMenuItem
          onClick={() => router.push('/dashboard/settings')}
          className="font-pixel cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border h-0.5" />
        <DropdownMenuItem onClick={handleSignOut} className="font-pixel cursor-pointer text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
