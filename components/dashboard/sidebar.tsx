'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Folder, Plus, Settings, CreditCard, Zap, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Projects', href: '/dashboard/projects', icon: Folder },
  { name: 'Templates', href: '/dashboard/templates', icon: Sparkles },
  { name: 'New Project', href: '/dashboard/new', icon: Plus },
  { name: 'Integrations', href: '/dashboard/integrations', icon: Zap },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r-2 border-foreground bg-primary">
      <div className="flex h-16 items-center gap-2 border-b-2 border-foreground px-6">
        <Image
          src="/AfriNova_new_logo-transparent.png"
          alt="AfriNova"
          width={32}
          height={32}
          className="h-8 w-auto"
        />
        <span className="text-base font-pixel uppercase">AfriNova</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 text-sm font-pixel uppercase transition-colors border-2',
                isActive
                  ? 'bg-accent text-accent-foreground border-foreground shadow-pixel'
                  : 'border-transparent hover:bg-secondary hover:border-border'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
