import Link from 'next/link';

export const metadata = {
  title: 'Terms & Conditions | AfriNova',
  description: 'Terms and conditions for using the AfriNova platform.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-pixel uppercase">Terms &amp; Conditions</h1>
        <p className="mb-4 text-sm text-muted-foreground font-sans">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        <div className="space-y-6 font-sans text-sm leading-relaxed">
          <p>
            This is a placeholder terms &amp; conditions page. Replace this content with
            your official legal terms.
          </p>
          <section>
            <h2 className="mb-2 font-pixel text-base uppercase">Use of the Service</h2>
            <p>
              Example: By using AfriNova, you agree to use the platform lawfully and responsibly
              and to review any generated code before deploying it to production.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-pixel text-base uppercase">Subscriptions</h2>
            <p>
              Example: Subscriptions renew automatically unless canceled, and usage limits
              apply per your selected plan.
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
