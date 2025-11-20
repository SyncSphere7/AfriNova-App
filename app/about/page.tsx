import Link from 'next/link';

export const metadata = {
  title: 'About | AfriNova',
  description: 'Learn more about the AfriNova mission and team.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-pixel uppercase">About AfriNova</h1>
        <div className="space-y-6 font-sans text-sm leading-relaxed">
          <p>
            AfriNova is an AI-powered application generator designed to help founders, developers,
            and agencies build production-ready software 10x faster.
          </p>
          <p>
            Our mission is to make world-class software development accessible across Africa and
            beyond by combining modern cloud infrastructure, AI models, and battle-tested
            templates.
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
