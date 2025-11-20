import Link from 'next/link'
import { Code2, Target, Users, Globe, Zap } from 'lucide-react'

export const metadata = {
  title: 'About | AfriNova',
  description: 'Learn more about the AfriNova mission and team.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#D4D0C8] dark:bg-[#1A1A1A]">
      {/* Navigation */}
      <nav className="border-b-2 border-black dark:border-white bg-[#E8E4DC] dark:bg-[#2A2A2A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Code2 className="h-6 w-6" />
              <span className="font-pixel text-lg">AFRINOVA</span>
            </Link>
            <Link href="/" className="text-sm hover:text-[#FF6B35]">
              ← BACK TO HOME
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-[#FF6B35] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-pixel text-4xl mb-4">ABOUT AFRINOVA</h1>
          <p className="text-lg max-w-2xl mx-auto">
            Democratizing software development through AI-powered innovation
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Mission */}
        <section className="mb-16">
          <h2 className="font-pixel text-3xl mb-6 border-b-2 border-black dark:border-white pb-4">
            OUR MISSION
          </h2>
          <p className="text-lg mb-4">
            At AfriNova, we believe that <strong>every developer deserves access to world-class tools</strong>, 
            regardless of their location or budget. We're building the most advanced AI-powered development 
            platform that transforms ideas into production-ready applications in minutes, not months.
          </p>
          <p className="text-lg">
            While our roots are in supporting African developers who face geographical limitations in accessing 
            premium development tools, our vision is truly global. We're here to empower developers everywhere 
            to build faster, ship sooner, and compete with anyone.
          </p>
        </section>

        {/* The Problem */}
        <section className="mb-16">
          <h2 className="font-pixel text-3xl mb-6 border-b-2 border-black dark:border-white pb-4">
            THE PROBLEM WE'RE SOLVING
          </h2>
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-6">
              <h3 className="font-pixel text-lg mb-3">⏰ TIME</h3>
              <p>
                Traditional development takes weeks or months. Setting up boilerplate, configuring databases, 
                implementing authentication, integrating payments—it's repetitive and time-consuming.
              </p>
            </div>
            <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-6">
              <h3 className="font-pixel text-lg mb-3">💰 COST</h3>
              <p>
                Premium tools like Cursor, Replit, and GitHub Copilot charge $20-40/month. For developers in 
                emerging markets, that's a significant barrier to entry.
              </p>
            </div>
            <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-6">
              <h3 className="font-pixel text-lg mb-3">🔒 QUALITY</h3>
              <p>
                Existing AI tools generate incomplete code, miss security best practices, or create projects 
                that aren't production-ready. Developers still spend hours fixing and refining.
              </p>
            </div>
            <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-6">
              <h3 className="font-pixel text-lg mb-3">🌍 ACCESS</h3>
              <p>
                Many premium tools don't support African payment methods (M-Pesa, Pesapal) or require credit 
                cards that aren't accessible to everyone.
              </p>
            </div>
          </div>
        </section>

        {/* Our Solution */}
        <section className="mb-16">
          <h2 className="font-pixel text-3xl mb-6 border-b-2 border-black dark:border-white pb-4">
            OUR SOLUTION
          </h2>
          <p className="text-lg mb-6">
            AfriNova isn't just another code generator. We've built a sophisticated multi-agent system where 
            10 specialized AI agents collaborate to create complete, production-ready applications:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <AgentCard icon={<Code2 className="h-6 w-6" />} title="FRONTEND AGENT" description="React, Vue, Angular, Svelte" />
            <AgentCard icon={<Code2 className="h-6 w-6" />} title="BACKEND AGENT" description="Node.js, Python, Go, Rust" />
            <AgentCard icon={<Code2 className="h-6 w-6" />} title="DATABASE AGENT" description="Schema design & migrations" />
            <AgentCard icon={<Users className="h-6 w-6" />} title="UX/UI AGENT" description="Modern, accessible design" />
            <AgentCard icon={<Zap className="h-6 w-6" />} title="PAYMENT AGENT" description="7 payment gateways" />
            <AgentCard icon={<Globe className="h-6 w-6" />} title="SECURITY AGENT" description="PCI-DSS compliant" />
            <AgentCard icon={<Code2 className="h-6 w-6" />} title="TESTING AGENT" description="Unit, integration, E2E tests" />
            <AgentCard icon={<Target className="h-6 w-6" />} title="DEVOPS AGENT" description="Docker, Kubernetes configs" />
            <AgentCard icon={<Globe className="h-6 w-6" />} title="ANALYTICS AGENT" description="Tracking & insights" />
            <AgentCard icon={<Zap className="h-6 w-6" />} title="INTEGRATIONS AGENT" description="150+ third-party services" />
          </div>
        </section>

        {/* Our Story */}
        <section className="mb-16">
          <h2 className="font-pixel text-3xl mb-6 border-b-2 border-black dark:border-white pb-4">
            OUR STORY
          </h2>
          <p className="text-lg mb-4">
            AfriNova was born from a simple frustration: <strong>building software takes too long</strong>. 
            As developers ourselves, we spent countless hours writing the same boilerplate code, setting up 
            authentication systems, and integrating payment gateways—work that could be automated.
          </p>
          <p className="text-lg mb-4">
            When AI coding assistants emerged, we were excited. But we quickly realized they had limitations: 
            they generated partial code, required constant prompting, and couldn't handle full-stack complexity. 
            They were helpers, not builders.
          </p>
          <p className="text-lg mb-4">
            We asked ourselves: <strong>What if AI could do the entire job?</strong> Not just suggest code, but 
            actually architect, build, test, and deploy complete applications? What if it understood security, 
            performance, accessibility, and best practices by default?
          </p>
          <p className="text-lg">
            That's AfriNova. We're not building a code editor or a copilot. We're building a <strong>
            full-stack development team powered by AI</strong>—one that works 10x faster than traditional 
            development and costs a fraction of hiring engineers.
          </p>
        </section>

        {/* Values */}
        <section className="mb-16">
          <h2 className="font-pixel text-3xl mb-6 border-b-2 border-black dark:border-white pb-4">
            OUR VALUES
          </h2>
          <div className="space-y-6">
            <ValueCard
              title="ACCESSIBILITY FIRST"
              description="Premium tools shouldn't be a luxury. We're committed to making world-class development accessible to everyone, starting at just $15/month."
            />
            <ValueCard
              title="QUALITY OVER SPEED"
              description="Fast is good, but correct is better. Every line of code we generate is production-ready, secure, and follows industry best practices."
            />
            <ValueCard
              title="GLOBAL REACH"
              description="While we're proud to support African developers, our platform is built for the world. We support 50+ languages and 20+ payment methods."
            />
            <ValueCard
              title="TRANSPARENCY"
              description="No black boxes. We show you exactly what's being generated, why, and how. You own 100% of the code we create."
            />
            <ValueCard
              title="CONTINUOUS IMPROVEMENT"
              description="AI is evolving fast, and so are we. We're constantly upgrading our models, adding features, and listening to our community."
            />
          </div>
        </section>

        {/* Team */}
        <section className="mb-16">
          <h2 className="font-pixel text-3xl mb-6 border-b-2 border-black dark:border-white pb-4">
            THE TEAM
          </h2>
          <p className="text-lg mb-6">
            AfriNova is built by a small, dedicated team of developers, designers, and AI engineers who believe 
            in the power of technology to level the playing field.
          </p>
          <div className="bg-[#E8E4DC] dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-6 text-center">
            <p className="text-lg">
              <strong>We're hiring!</strong> If you're passionate about AI, development tools, or making technology 
              accessible, we'd love to hear from you.
            </p>
            <Link
              href="mailto:careers@afrinova.app"
              className="inline-block mt-4 px-6 py-3 bg-[#FF6B35] text-white font-pixel border-2 border-black dark:border-white hover:translate-x-1 hover:translate-y-1 transition-transform"
              style={{ boxShadow: '4px 4px 0px rgba(0,0,0,0.25)' }}
            >
              CAREERS@AFRINOVA.APP
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="font-pixel text-3xl mb-6">JOIN US</h2>
          <p className="text-lg mb-8">
            We're just getting started. Be part of the revolution in software development.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/auth/signup"
              className="inline-block px-8 py-4 bg-[#FF6B35] text-white font-pixel border-2 border-black dark:border-white hover:translate-x-1 hover:translate-y-1 transition-transform"
              style={{ boxShadow: '4px 4px 0px rgba(0,0,0,0.25)' }}
            >
              GET STARTED FREE
            </Link>
            <Link
              href="/contact"
              className="inline-block px-8 py-4 bg-white dark:bg-[#2A2A2A] font-pixel border-2 border-black dark:border-white hover:translate-x-1 hover:translate-y-1 transition-transform"
              style={{ boxShadow: '4px 4px 0px rgba(0,0,0,0.25)' }}
            >
              CONTACT US
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}

// Helper Components
function AgentCard({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-4">
      <div className="flex items-start gap-3">
        <div className="text-[#FF6B35] mt-1">{icon}</div>
        <div>
          <h4 className="font-pixel text-sm mb-1">{title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  )
}

function ValueCard({ title, description }: {
  title: string
  description: string
}) {
  return (
    <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-6">
      <h3 className="font-pixel text-lg mb-3">{title}</h3>
      <p className="text-gray-700 dark:text-gray-300">{description}</p>
    </div>
  )
}
