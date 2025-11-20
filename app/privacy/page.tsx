import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | AfriNova',
  description: 'How AfriNova collects, uses, and protects your data.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-pixel uppercase">Privacy Policy</h1>
        <p className="mb-4 text-sm text-muted-foreground font-sans">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        <div className="space-y-6 font-sans text-sm leading-relaxed">
          <p>
            This is a placeholder privacy policy. Replace this content with your actual legal
            policy describing how you collect, use, store, and protect user data.
          </p>
          <section>
            <h2 className="mb-2 font-pixel text-base uppercase">Data We Collect</h2>
            <p>
              Example: account information, usage data, and technical logs required to operate
              the service.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-pixel text-base uppercase">How We Use Data</h2>
            <p>
              Example: to provide and improve the service, secure accounts, and communicate
              important updates.
            </p>
          </section>
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
