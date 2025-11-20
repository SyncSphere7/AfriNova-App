import Link from 'next/link';

export const metadata = {
  title: 'Contact | AfriNova',
  description: 'Get in touch with the AfriNova team.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-pixel uppercase">Contact</h1>
        <div className="space-y-6 font-sans text-sm leading-relaxed">
          <p>
            Have questions, feedback, or partnership ideas? We&apos;d love to hear from you.
          </p>
          <p>
            You can reach us at{' '}
            <span className="font-mono">support@afrinova.app</span> or via the in-app support
            channel once you&apos;re signed in.
          </p>
          <p className="pt-4 text-xs">
            <Link href="/" className="underline hover:text-accent">
              Back to Home
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
