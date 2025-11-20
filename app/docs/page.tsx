import Link from 'next/link'
import { Code2, Book, Zap, Shield, Settings } from 'lucide-react'

export const metadata = {
  title: 'Documentation | AfriNova',
  description: 'Learn how to use AfriNova to generate production-ready applications.',
};

export default function DocsPage() {
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
          <h1 className="font-pixel text-4xl mb-4">DOCUMENTATION</h1>
          <p className="text-lg max-w-2xl mx-auto">
            Everything you need to know about building production-ready apps with AfriNova
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Getting Started */}
          <DocCard
            icon={<Book className="h-8 w-8" />}
            title="GETTING STARTED"
            description="Learn the basics and create your first project in minutes"
            sections={[
              { title: "Quick Start Guide", id: "quickstart" },
              { title: "Creating Your First Project", id: "first-project" },
              { title: "Understanding Tech Stacks", id: "tech-stacks" },
              { title: "Project Structure", id: "project-structure" }
            ]}
          />

          {/* Writing Prompts */}
          <DocCard
            icon={<Zap className="h-8 w-8" />}
            title="WRITING PROMPTS"
            description="Best practices for getting perfect code every time"
            sections={[
              { title: "Prompt Engineering Basics", id: "prompt-basics" },
              { title: "Example Prompts", id: "examples" },
              { title: "Common Mistakes", id: "mistakes" },
              { title: "Advanced Techniques", id: "advanced" }
            ]}
          />

          {/* Integrations */}
          <DocCard
            icon={<Settings className="h-8 w-8" />}
            title="INTEGRATIONS"
            description="Connect with 20+ services and payment gateways"
            sections={[
              { title: "Payment Gateways", id: "payments" },
              { title: "Authentication", id: "auth" },
              { title: "Email Services", id: "email" },
              { title: "Analytics", id: "analytics" }
            ]}
          />

          {/* Tech Stacks */}
          <DocCard
            icon={<Code2 className="h-8 w-8" />}
            title="TECH STACKS"
            description="Supported frameworks and technologies"
            sections={[
              { title: "Frontend Frameworks", id: "frontend" },
              { title: "Backend Options", id: "backend" },
              { title: "Databases", id: "databases" },
              { title: "Styling Solutions", id: "styling" }
            ]}
          />

          {/* Security */}
          <DocCard
            icon={<Shield className="h-8 w-8" />}
            title="SECURITY & COMPLIANCE"
            description="How we keep your projects secure"
            sections={[
              { title: "PCI-DSS Compliance", id: "pci-dss" },
              { title: "Data Protection", id: "data-protection" },
              { title: "Code Security", id: "code-security" },
              { title: "Best Practices", id: "security-practices" }
            ]}
          />

          {/* API Reference */}
          <DocCard
            icon={<Code2 className="h-8 w-8" />}
            title="API REFERENCE"
            description="Build custom integrations (Growth & Pro)"
            sections={[
              { title: "Authentication", id: "api-auth" },
              { title: "Projects API", id: "api-projects" },
              { title: "Generations API", id: "api-generations" },
              { title: "Webhooks", id: "api-webhooks" }
            ]}
            badge="GROWTH+"
          />

        </div>

        {/* Detailed Sections */}
        <div className="mt-16 space-y-16">
          
          {/* Quick Start */}
          <DocSection
            id="quickstart"
            title="QUICK START GUIDE"
            content={
              <>
                <h3 className="font-pixel text-xl mb-4">1. SIGN UP</h3>
                <p className="mb-4">
                  Create your free account at AfriNova. No credit card required. You get 5 free generations per month to try the platform.
                </p>

                <h3 className="font-pixel text-xl mb-4 mt-8">2. CREATE A PROJECT</h3>
                <p className="mb-4">
                  Click "NEW PROJECT" in your dashboard. You'll go through 4 simple steps:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Project Info:</strong> Name and describe your project</li>
                  <li><strong>Tech Stack:</strong> Choose your preferred technologies</li>
                  <li><strong>Describe Your App:</strong> Tell us what you want to build</li>
                  <li><strong>Upload Files:</strong> Optional design files or documentation</li>
                </ul>

                <h3 className="font-pixel text-xl mb-4 mt-8">3. GENERATE</h3>
                <p className="mb-4">
                  Review your inputs and click "GENERATE PROJECT". Our 10 AI agents will:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Design your UI/UX</li>
                  <li>Generate frontend components</li>
                  <li>Build backend APIs</li>
                  <li>Create database schema</li>
                  <li>Integrate payment gateways</li>
                  <li>Add security measures</li>
                  <li>Write comprehensive tests</li>
                  <li>Set up deployment configs</li>
                </ul>

                <h3 className="font-pixel text-xl mb-4 mt-8">4. DOWNLOAD & DEPLOY</h3>
                <p className="mb-4">
                  Once generation is complete (typically 3-5 minutes), download your project as a ZIP file. The code is production-ready and includes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Complete source code</li>
                  <li>README with setup instructions</li>
                  <li>Environment variables template</li>
                  <li>Database migration files</li>
                  <li>Deployment configurations</li>
                  <li>Comprehensive tests</li>
                </ul>
              </>
            }
          />

          {/* Writing Prompts */}
          <DocSection
            id="prompt-basics"
            title="WRITING EFFECTIVE PROMPTS"
            content={
              <>
                <h3 className="font-pixel text-xl mb-4">BE SPECIFIC</h3>
                <p className="mb-4">
                  The more details you provide, the better your results. Include:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-6">
                  <li><strong>User roles:</strong> Who will use this app? (Admin, users, guests)</li>
                  <li><strong>Key features:</strong> What can users do?</li>
                  <li><strong>Data structure:</strong> What data will you store?</li>
                  <li><strong>Workflows:</strong> How do users accomplish tasks?</li>
                  <li><strong>UI preferences:</strong> Any specific design requirements?</li>
                </ul>

                <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-6 mb-6">
                  <h4 className="font-pixel text-lg mb-3">❌ BAD EXAMPLE:</h4>
                  <p className="font-mono text-sm text-red-600 dark:text-red-400">
                    "Build me a task management app"
                  </p>
                </div>

                <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-6">
                  <h4 className="font-pixel text-lg mb-3">✅ GOOD EXAMPLE:</h4>
                  <p className="font-mono text-sm text-green-600 dark:text-green-400">
                    "Build a task management app for teams with the following features:
                    <br/><br/>
                    USER ROLES:
                    <br/>- Admins can create projects and invite team members
                    <br/>- Team members can create, assign, and complete tasks
                    <br/>- Guests can view tasks but not edit
                    <br/><br/>
                    FEATURES:
                    <br/>- Project boards with drag-and-drop task columns (To Do, In Progress, Done)
                    <br/>- Real-time updates when tasks change
                    <br/>- Task details: title, description, assignee, due date, priority, tags
                    <br/>- File attachments for tasks (images, PDFs)
                    <br/>- Comment threads on each task
                    <br/>- Email notifications for task assignments and due dates
                    <br/>- Activity log showing all changes
                    <br/><br/>
                    TECH PREFERENCES:
                    <br/>- Clean, minimal UI similar to Linear or Asana
                    <br/>- Mobile-responsive design
                    <br/>- Dark mode support"
                  </p>
                </div>

                <h3 className="font-pixel text-xl mb-4 mt-8">USE THE PROMPT ENHANCER</h3>
                <p className="mb-4">
                  Not sure how to structure your prompt? Click the "✨ ENHANCE PROMPT" button. Our AI will:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Expand vague descriptions into detailed specifications</li>
                  <li>Suggest additional features you might have missed</li>
                  <li>Add technical implementation details</li>
                  <li>Structure your prompt for optimal results</li>
                </ul>
              </>
            }
          />

          {/* Payment Integrations */}
          <DocSection
            id="payments"
            title="PAYMENT GATEWAY INTEGRATIONS"
            content={
              <>
                <p className="mb-6">
                  AfriNova supports 7 payment gateways with complete PCI-DSS compliant implementations:
                </p>

                <div className="space-y-6">
                  <PaymentGatewayDoc
                    name="PESAPAL"
                    regions="Kenya, Tanzania, Uganda, Rwanda"
                    currencies="KES, TZS, UGX, RWF, USD"
                    features={[
                      "Mobile money (M-Pesa, Airtel Money, Tigo Pesa)",
                      "Card payments (Visa, Mastercard)",
                      "Bank transfers",
                      "Instant payment notifications"
                    ]}
                  />

                  <PaymentGatewayDoc
                    name="PAYPAL"
                    regions="Global (190+ countries)"
                    currencies="25+ currencies"
                    features={[
                      "PayPal account payments",
                      "Card payments without PayPal account",
                      "One-click checkout",
                      "Buyer protection"
                    ]}
                  />

                  <PaymentGatewayDoc
                    name="STRIPE"
                    regions="Global (45+ countries)"
                    currencies="135+ currencies"
                    features={[
                      "Card payments (all major cards)",
                      "Digital wallets (Apple Pay, Google Pay)",
                      "Bank transfers",
                      "Subscriptions and recurring billing"
                    ]}
                  />

                  <PaymentGatewayDoc
                    name="FLUTTERWAVE"
                    regions="Africa (20+ countries)"
                    currencies="150+ currencies"
                    features={[
                      "Mobile money",
                      "Bank transfers",
                      "Card payments",
                      "USSD payments"
                    ]}
                  />

                  <PaymentGatewayDoc
                    name="M-PESA"
                    regions="Kenya, Tanzania, South Africa, etc."
                    currencies="Local currencies"
                    features={[
                      "Direct M-Pesa integration",
                      "STK Push (prompt payment on user's phone)",
                      "Instant confirmation",
                      "No card required"
                    ]}
                  />

                  <PaymentGatewayDoc
                    name="PAYSTACK"
                    regions="Nigeria, Ghana, South Africa"
                    currencies="NGN, GHS, ZAR, USD"
                    features={[
                      "Card payments",
                      "Bank transfers",
                      "Mobile money",
                      "USSD payments"
                    ]}
                  />

                  <PaymentGatewayDoc
                    name="SQUARE"
                    regions="US, Canada, UK, Australia, Japan"
                    currencies="USD, CAD, GBP, AUD, JPY"
                    features={[
                      "Card payments",
                      "Digital wallets",
                      "Buy now, pay later",
                      "In-person payments"
                    ]}
                  />
                </div>

                <div className="bg-[#FF6B35] text-white p-6 mt-8 border-2 border-black dark:border-white">
                  <h4 className="font-pixel text-lg mb-3">🔒 SECURITY FIRST</h4>
                  <p className="mb-2">
                    All payment integrations generated by AfriNova are:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>PCI-DSS compliant (we never store card data)</li>
                    <li>Use tokenization (secure payment tokens only)</li>
                    <li>Include webhook verification (prevent fraud)</li>
                    <li>Implement idempotency (prevent duplicate charges)</li>
                    <li>Have comprehensive error handling</li>
                  </ul>
                </div>
              </>
            }
          />

          {/* Tech Stacks */}
          <DocSection
            id="tech-stacks"
            title="SUPPORTED TECH STACKS"
            content={
              <>
                <h3 className="font-pixel text-xl mb-4">FRONTEND FRAMEWORKS</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <TechStackCard
                    name="REACT"
                    description="Most popular. Component-based. Huge ecosystem."
                    recommended={true}
                  />
                  <TechStackCard
                    name="VUE"
                    description="Beginner-friendly. Progressive framework. Great docs."
                  />
                  <TechStackCard
                    name="ANGULAR"
                    description="Enterprise-grade. Full-featured. TypeScript native."
                  />
                  <TechStackCard
                    name="SVELTE"
                    description="Fastest performance. Compile-time framework. Growing ecosystem."
                  />
                </div>

                <h3 className="font-pixel text-xl mb-4 mt-8">BACKEND FRAMEWORKS</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <TechStackCard
                    name="NODE.JS (EXPRESS)"
                    description="JavaScript on server. Huge package ecosystem. Fast development."
                    recommended={true}
                  />
                  <TechStackCard
                    name="PYTHON (FASTAPI)"
                    description="Modern Python. Auto API docs. Great for data/AI projects."
                  />
                  <TechStackCard
                    name="GO"
                    description="High performance. Great concurrency. Small binaries."
                  />
                  <TechStackCard
                    name="RUST"
                    description="Maximum performance. Memory safe. Best for systems."
                  />
                </div>

                <h3 className="font-pixel text-xl mb-4 mt-8">DATABASES</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <TechStackCard
                    name="POSTGRESQL"
                    description="Most powerful SQL. ACID compliant. JSON support."
                    recommended={true}
                  />
                  <TechStackCard
                    name="MYSQL"
                    description="Popular SQL. Fast reads. Wide hosting support."
                  />
                  <TechStackCard
                    name="MONGODB"
                    description="NoSQL. Flexible schema. Great for rapid prototyping."
                  />
                  <TechStackCard
                    name="SUPABASE"
                    description="PostgreSQL + Auth + Storage. Open source Firebase alternative."
                  />
                </div>

                <h3 className="font-pixel text-xl mb-4 mt-8">STYLING</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <TechStackCard
                    name="TAILWIND CSS"
                    description="Utility-first. Fast development. Highly customizable."
                    recommended={true}
                  />
                  <TechStackCard
                    name="STYLED COMPONENTS"
                    description="CSS-in-JS. Component-scoped styles. Dynamic styling."
                  />
                  <TechStackCard
                    name="SASS"
                    description="CSS preprocessor. Variables and mixins. Mature ecosystem."
                  />
                  <TechStackCard
                    name="CSS MODULES"
                    description="Scoped CSS. No build config needed. Simple and effective."
                  />
                </div>
              </>
            }
          />

          {/* Security */}
          <DocSection
            id="code-security"
            title="CODE SECURITY & BEST PRACTICES"
            content={
              <>
                <p className="mb-6">
                  Every project generated by AfriNova includes enterprise-grade security measures:
                </p>

                <h3 className="font-pixel text-xl mb-4">INPUT VALIDATION</h3>
                <ul className="list-disc pl-6 space-y-2 mb-6">
                  <li>Server-side validation on all inputs (never trust client)</li>
                  <li>Type checking with TypeScript</li>
                  <li>Schema validation with Zod or Joi</li>
                  <li>SQL injection prevention (parameterized queries)</li>
                  <li>XSS attack prevention (input sanitization)</li>
                </ul>

                <h3 className="font-pixel text-xl mb-4">AUTHENTICATION & AUTHORIZATION</h3>
                <ul className="list-disc pl-6 space-y-2 mb-6">
                  <li>Secure password hashing (bcrypt with salt)</li>
                  <li>JWT tokens with expiration</li>
                  <li>Role-based access control (RBAC)</li>
                  <li>Session management with HttpOnly cookies</li>
                  <li>OAuth 2.0 for third-party login</li>
                </ul>

                <h3 className="font-pixel text-xl mb-4">DATA PROTECTION</h3>
                <ul className="list-disc pl-6 space-y-2 mb-6">
                  <li>Encryption at rest and in transit (TLS 1.3)</li>
                  <li>Environment variables for sensitive data</li>
                  <li>No secrets in code or version control</li>
                  <li>Database row-level security (RLS)</li>
                  <li>Regular security updates</li>
                </ul>

                <h3 className="font-pixel text-xl mb-4">API SECURITY</h3>
                <ul className="list-disc pl-6 space-y-2 mb-6">
                  <li>Rate limiting to prevent abuse</li>
                  <li>CORS configuration (whitelist only)</li>
                  <li>API key authentication</li>
                  <li>Request signing for webhooks</li>
                  <li>Idempotency keys for critical operations</li>
                </ul>

                <div className="bg-[#4CAF50] text-white p-6 border-2 border-black dark:border-white">
                  <h4 className="font-pixel text-lg mb-3">✅ SECURITY GUARANTEE</h4>
                  <p>
                    All code generated by AfriNova passes automated security scans and follows OWASP Top 10 best practices. 
                    Payment integrations are PCI-DSS Level 1 compliant.
                  </p>
                </div>
              </>
            }
          />

        </div>

        {/* Contact Support */}
        <div className="mt-16 bg-[#E8E4DC] dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-8 text-center">
          <h2 className="font-pixel text-2xl mb-4">NEED MORE HELP?</h2>
          <p className="mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/contact"
              className="inline-block px-6 py-3 bg-[#FF6B35] text-white font-pixel border-2 border-black dark:border-white hover:translate-x-1 hover:translate-y-1 transition-transform"
              style={{ boxShadow: '4px 4px 0px rgba(0,0,0,0.25)' }}
            >
              CONTACT SUPPORT
            </Link>
            <Link
              href="https://discord.gg/afrinova"
              className="inline-block px-6 py-3 bg-white dark:bg-[#1A1A1A] font-pixel border-2 border-black dark:border-white hover:translate-x-1 hover:translate-y-1 transition-transform"
              style={{ boxShadow: '4px 4px 0px rgba(0,0,0,0.25)' }}
            >
              JOIN DISCORD
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

// Helper Components
function DocCard({ icon, title, description, sections, badge }: {
  icon: React.ReactNode
  title: string
  description: string
  sections: { title: string; id: string }[]
  badge?: string
}) {
  return (
    <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-6 relative">
      {badge && (
        <span className="absolute top-2 right-2 bg-[#FF6B35] text-white text-xs font-pixel px-2 py-1">
          {badge}
        </span>
      )}
      <div className="text-[#FF6B35] mb-4">{icon}</div>
      <h3 className="font-pixel text-lg mb-2">{title}</h3>
      <p className="text-sm mb-4 text-gray-600 dark:text-gray-400">{description}</p>
      <ul className="space-y-2">
        {sections.map((section) => (
          <li key={section.id}>
            <Link
              href={`#${section.id}`}
              className="text-sm hover:text-[#FF6B35] underline"
            >
              {section.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function DocSection({ id, title, content }: {
  id: string
  title: string
  content: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="font-pixel text-3xl mb-6 border-b-2 border-black dark:border-white pb-4">
        {title}
      </h2>
      <div className="prose prose-lg max-w-none dark:prose-invert">
        {content}
      </div>
    </section>
  )
}

function PaymentGatewayDoc({ name, regions, currencies, features }: {
  name: string
  regions: string
  currencies: string
  features: string[]
}) {
  return (
    <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-6">
      <h4 className="font-pixel text-lg mb-3">{name}</h4>
      <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <strong>Regions:</strong> {regions}
        </div>
        <div>
          <strong>Currencies:</strong> {currencies}
        </div>
      </div>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        {features.map((feature, i) => (
          <li key={i}>{feature}</li>
        ))}
      </ul>
    </div>
  )
}

function TechStackCard({ name, description, recommended }: {
  name: string
  description: string
  recommended?: boolean
}) {
  return (
    <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-4 relative">
      {recommended && (
        <span className="absolute top-2 right-2 bg-[#4CAF50] text-white text-xs font-pixel px-2 py-1">
          RECOMMENDED
        </span>
      )}
      <h4 className="font-pixel text-base mb-2">{name}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  )
}
