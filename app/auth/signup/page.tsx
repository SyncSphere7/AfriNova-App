import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { SignupForm } from '@/components/auth/signup-form';
import { ThemeToggle } from '@/components/shared/theme-toggle';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <Image
                src="/AfriNova_new_logo-transparent.png"
                alt="AfriNova"
                width={48}
                height={48}
                className="h-12 w-auto"
              />
              <span className="text-2xl font-pixel uppercase">AfriNova</span>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create Account</CardTitle>
              <CardDescription>
                Get started with AfriNova today. Start building in minutes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignupForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
