import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="border-t-2 border-foreground bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/AfriNova_new_logo-transparent.png"
                alt="AfriNova"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <span className="text-base font-pixel uppercase">AfriNova</span>
            </div>
            <p className="text-sm text-muted-foreground font-sans">
              AI-powered full-stack development platform. Build production-ready apps 10x faster.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-pixel uppercase mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/pricing" className="text-sm font-pixel hover:text-accent transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-sm font-pixel hover:text-accent transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/#features" className="text-sm font-pixel hover:text-accent transition-colors">
                  Features
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-pixel uppercase mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm font-sans hover:text-accent transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm font-sans hover:text-accent transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-pixel uppercase mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm font-sans hover:text-accent transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm font-sans hover:text-accent transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-sm font-sans hover:text-accent transition-colors">
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t-2 border-border">
          <p className="text-center text-xs font-pixel uppercase text-muted-foreground">
            © 2025 AfriNova. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
