import Link from 'next/link';

export const metadata = {
  title: 'Documentation | AfriNova',
  description: 'Learn how to use AfriNova to generate production-ready applications.',
};

export default function DocsPage() {
  return (
    <main className="min-h-screen px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-pixel uppercase">Documentation</h1>
        <p className="mb-8 text-sm text-muted-foreground font-sans">
          This is a placeholder documentation page. You can replace this content with your full
          product docs, onboarding guides, and API references.
        </p>
        <div className="space-y-4 font-sans text-sm leading-relaxed">
          <section>
            <h2 className="mb-2 font-pixel text-base uppercase">Getting Started</h2>
            <p>
              Create an account, choose your tech stack, describe your project, and let AfriNova
              generate a complete, production-ready codebase.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-pixel text-base uppercase">Core Concepts</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Projects &amp; templates</li>
              <li>AI generations and usage limits</li>
              <li>Integrations and payments</li>
            </ul>
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
