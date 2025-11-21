'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { CurrencySwitcher } from '@/components/shared/currency-switcher';
import { useI18n } from '@/lib/i18n/context';

export function Navbar() {
	const { t } = useI18n();

	return (
		<nav className="sticky top-0 z-50 border-b-2 border-foreground bg-primary">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					<div className="flex items-center gap-8">
						{/* Logo and brand */}
						<Link href="/" className="flex items-center gap-2">
							<Image
								src="/AfriNova_new_logo-transparent.png"
								alt="AfriNova Logo"
								width={40}
								height={40}
								className="h-10 w-auto"
							/>
							<span className="text-lg font-pixel uppercase">
								{t.common.appName}
							</span>
						</Link>

						{/* Main nav links (desktop) */}
						<div className="hidden md:flex items-center gap-6">
							<Link
								href="/"
								className="text-sm font-pixel uppercase tracking-wide hover:text-accent transition-colors"
							>
								{t.nav.home}
							</Link>
							<Link
								href="/pricing"
								className="text-sm font-pixel uppercase tracking-wide hover:text-accent transition-colors"
							>
								{t.nav.pricing}
							</Link>
							<Link
								href="/docs"
								className="text-sm font-pixel uppercase tracking-wide hover:text-accent transition-colors"
							>
								{t.nav.docs}
							</Link>
						</div>
					</div>

					{/* Right-side controls */}
					<div className="flex items-center gap-2">
						<CurrencySwitcher />
						<LanguageSwitcher />
						<ThemeToggle />
						<Link href="/auth/login" className="hidden sm:block">
							<Button variant="ghost" size="sm">
								{t.nav.signIn}
							</Button>
						</Link>
						<Link href="/auth/signup">
							<Button size="sm">{t.nav.getStarted}</Button>
						</Link>
					</div>
				</div>
			</div>
		</nav>
	);
}
