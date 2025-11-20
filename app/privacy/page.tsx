import Link from 'next/link'
import { Code2, Shield } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy | AfriNova',
  description: 'How AfriNova collects, uses, and protects your data.',
};

export default function PrivacyPolicyPage() {
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
          <Shield className="h-16 w-16 mx-auto mb-4" />
          <h1 className="font-pixel text-4xl mb-4">PRIVACY POLICY</h1>
          <p className="text-lg max-w-2xl mx-auto">
            Your privacy matters. Here's how we collect, use, and protect your data.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Last Updated */}
        <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-6 mb-8">
          <p className="text-sm">
            <strong>Last Updated:</strong> November 20, 2024
          </p>
          <p className="text-sm mt-2">
            <strong>Effective Date:</strong> November 20, 2024
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-[#E8E4DC] dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-6 mb-8">
          <h2 className="font-pixel text-lg mb-4">TABLE OF CONTENTS</h2>
          <ol className="space-y-2 text-sm">
            <li><a href="#introduction" className="text-[#FF6B35] hover:underline">1. Introduction</a></li>
            <li><a href="#information-collect" className="text-[#FF6B35] hover:underline">2. Information We Collect</a></li>
            <li><a href="#how-we-use" className="text-[#FF6B35] hover:underline">3. How We Use Your Information</a></li>
            <li><a href="#sharing" className="text-[#FF6B35] hover:underline">4. Information Sharing and Disclosure</a></li>
            <li><a href="#third-party" className="text-[#FF6B35] hover:underline">5. Third-Party Services</a></li>
            <li><a href="#data-security" className="text-[#FF6B35] hover:underline">6. Data Security</a></li>
            <li><a href="#cookies" className="text-[#FF6B35] hover:underline">7. Cookies and Tracking</a></li>
            <li><a href="#your-rights" className="text-[#FF6B35] hover:underline">8. Your Privacy Rights</a></li>
            <li><a href="#data-retention" className="text-[#FF6B35] hover:underline">9. Data Retention</a></li>
            <li><a href="#children" className="text-[#FF6B35] hover:underline">10. Children's Privacy</a></li>
            <li><a href="#international" className="text-[#FF6B35] hover:underline">11. International Data Transfers</a></li>
            <li><a href="#changes" className="text-[#FF6B35] hover:underline">12. Changes to This Policy</a></li>
            <li><a href="#contact" className="text-[#FF6B35] hover:underline">13. Contact Us</a></li>
          </ol>
        </div>

        {/* 1. Introduction */}
        <section id="introduction" className="mb-12 scroll-mt-20">
          <h2 className="font-pixel text-2xl mb-4 border-b-2 border-black dark:border-white pb-2">
            1. INTRODUCTION
          </h2>
          <p className="mb-4">
            Welcome to AfriNova ("we," "our," or "us"). We are committed to protecting your personal 
            information and your right to privacy. This Privacy Policy explains what information we 
            collect, how we use it, and what rights you have in relation to it.
          </p>
          <p className="mb-4">
            AfriNova is an AI-powered full-stack development platform operated by <strong>AfriNova Technologies Ltd.</strong>, 
            a company registered in Uganda, that generates production-ready code. By using our service at{' '}
            <strong>https://afrinova.app</strong> (the "Platform"), you agree to the collection and use of 
            information in accordance with this Privacy Policy.
          </p>
          <p>
            If you have any questions or concerns about this policy, please contact us at{' '}
            <a href="mailto:privacy@afrinova.app" className="text-[#FF6B35] hover:underline">
              privacy@afrinova.app
            </a>.
          </p>
        </section>

        {/* 2. Information We Collect */}
        <section id="information-collect" className="mb-12 scroll-mt-20">
          <h2 className="font-pixel text-2xl mb-4 border-b-2 border-black dark:border-white pb-2">
            2. INFORMATION WE COLLECT
          </h2>
          
          <h3 className="font-pixel text-lg mb-3 mt-6">2.1 Information You Provide</h3>
          <p className="mb-4">We collect information that you voluntarily provide when using AfriNova:</p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>Account Information:</strong> Full name, email address, password (encrypted with bcrypt)</li>
            <li><strong>Profile Information:</strong> Avatar/profile picture, display name, bio, timezone (all optional)</li>
            <li><strong>Project Data:</strong> Project names, descriptions, prompts, tech stack selections, uploaded files (design files, documents, code), generated code</li>
            <li><strong>Payment Information:</strong> Billing name, billing address, payment method details. <strong>Note:</strong> We do NOT store credit card numbers or CVV codes. All payment data is processed securely by Stripe.</li>
            <li><strong>Communications:</strong> Messages you send to our support team, feedback submissions, survey responses, feature requests</li>
          </ul>

          <h3 className="font-pixel text-lg mb-3">2.2 Automatically Collected Information</h3>
          <p className="mb-4">When you use AfriNova, we automatically collect certain information:</p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>Usage Data:</strong> Pages visited, features used, time spent on platform, generation requests, API calls</li>
            <li><strong>Device Information:</strong> Browser type and version, operating system, device type (mobile/desktop), screen resolution</li>
            <li><strong>Log Data:</strong> IP address (anonymized), timestamps, error logs, performance metrics</li>
            <li><strong>Cookies and Similar Technologies:</strong> Session cookies, preference cookies, analytics cookies (see Section 7)</li>
          </ul>

          <h3 className="font-pixel text-lg mb-3">2.3 Information from Third Parties</h3>
          <p className="mb-4">If you sign up using OAuth (Google, GitHub), we receive:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Name and email address from your OAuth provider</li>
            <li>Profile picture (if available and you grant permission)</li>
            <li>Public profile information as allowed by the provider</li>
          </ul>
        </section>

        {/* 3. How We Use Your Information */}
        <section id="how-we-use" className="mb-12 scroll-mt-20">
          <h2 className="font-pixel text-2xl mb-4 border-b-2 border-black dark:border-white pb-2">
            3. HOW WE USE YOUR INFORMATION
          </h2>
          <p className="mb-4">We use the information we collect for the following purposes:</p>
          
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-4">
              <h4 className="font-bold mb-2">🛠️ To Provide and Maintain Our Service</h4>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li>Create and manage your account</li>
                <li>Process your project generation requests</li>
                <li>Store and retrieve your projects and generated code</li>
                <li>Provide customer support and respond to inquiries</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-4">
              <h4 className="font-bold mb-2">💳 To Process Payments</h4>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li>Process subscription payments and renewals</li>
                <li>Send billing receipts and invoices</li>
                <li>Manage subscription upgrades and downgrades</li>
                <li>Detect and prevent payment fraud</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-4">
              <h4 className="font-bold mb-2">📧 To Communicate With You</h4>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li>Send service-related notifications (generation complete, errors, updates)</li>
                <li>Send subscription and billing notifications</li>
                <li>Respond to your support requests</li>
                <li>Send marketing emails (only if you opt in - you can unsubscribe anytime)</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-4">
              <h4 className="font-bold mb-2">📊 To Improve Our Service</h4>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li>Analyze usage patterns to improve features</li>
                <li>Monitor platform performance and fix bugs</li>
                <li>Train and improve our AI models (using anonymized data only)</li>
                <li>Conduct research and development</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-4">
              <h4 className="font-bold mb-2">🔒 For Security and Fraud Prevention</h4>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li>Detect and prevent fraudulent activity</li>
                <li>Enforce our Terms of Service</li>
                <li>Protect against abuse and unauthorized access</li>
                <li>Ensure platform security and integrity</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-4">
              <h4 className="font-bold mb-2">⚖️ For Legal Compliance</h4>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li>Comply with legal obligations and regulations</li>
                <li>Respond to lawful requests from authorities</li>
                <li>Establish, exercise, or defend legal claims</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4. Information Sharing */}
        <section id="sharing" className="mb-12 scroll-mt-20">
          <h2 className="font-pixel text-2xl mb-4 border-b-2 border-black dark:border-white pb-2">
            4. INFORMATION SHARING AND DISCLOSURE
          </h2>
          <p className="mb-4">
            We do NOT sell your personal information to third parties. We only share your information in 
            the following limited circumstances:
          </p>

          <h3 className="font-pixel text-lg mb-3 mt-6">4.1 Service Providers</h3>
          <p className="mb-4">
            We share information with trusted third-party service providers who help us operate our platform:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>Supabase:</strong> Database hosting, authentication, file storage</li>
            <li><strong>Stripe:</strong> Payment processing (they have their own privacy policy)</li>
            <li><strong>OpenRouter:</strong> AI model access for code generation</li>
            <li><strong>Vercel:</strong> Platform hosting and deployment</li>
            <li><strong>Resend:</strong> Transactional email delivery</li>
          </ul>
          <p className="mb-6">
            These providers are contractually obligated to protect your data and only use it to provide 
            services to us.
          </p>

          <h3 className="font-pixel text-lg mb-3">4.2 Legal Requirements</h3>
          <p className="mb-4">
            We may disclose your information if required by law or in response to:
          </p>
          <ul className="list-disc pl-6 space-y-1 mb-6">
            <li>Valid legal requests (subpoenas, court orders)</li>
            <li>Legal processes or government requests</li>
            <li>Protection of our rights, property, or safety</li>
            <li>Enforcement of our Terms of Service</li>
          </ul>

          <h3 className="font-pixel text-lg mb-3">4.3 Business Transfers</h3>
          <p className="mb-4">
            If AfriNova is acquired, merged, or sold, your information may be transferred as part of that 
            transaction. We will notify you via email and/or a prominent notice on our Platform before your 
            information is transferred and becomes subject to a different privacy policy.
          </p>

          <h3 className="font-pixel text-lg mb-3">4.4 With Your Consent</h3>
          <p>
            We may share your information for any other purpose with your explicit consent.
          </p>
        </section>

        {/* 5. Third-Party Services */}
        <section id="third-party" className="mb-12 scroll-mt-20">
          <h2 className="font-pixel text-2xl mb-4 border-b-2 border-black dark:border-white pb-2">
            5. THIRD-PARTY SERVICES
          </h2>
          <p className="mb-4">
            AfriNova integrates with several third-party services. Each has its own privacy policy:
          </p>

          <div className="space-y-3 mb-6">
            <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-4">
              <strong>Supabase (Database & Auth):</strong>{' '}
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#FF6B35] hover:underline">
                https://supabase.com/privacy
              </a>
            </div>
            <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-4">
              <strong>Stripe (Payments):</strong>{' '}
              <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#FF6B35] hover:underline">
                https://stripe.com/privacy
              </a>
            </div>
            <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-4">
              <strong>OpenRouter (AI Models):</strong>{' '}
              <a href="https://openrouter.ai/privacy" target="_blank" rel="noopener noreferrer" className="text-[#FF6B35] hover:underline">
                https://openrouter.ai/privacy
              </a>
            </div>
            <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-4">
              <strong>Vercel (Hosting):</strong>{' '}
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#FF6B35] hover:underline">
                https://vercel.com/legal/privacy-policy
              </a>
            </div>
          </div>

          <div className="bg-[#FFC107] text-black p-4 border-2 border-black">
            <strong>⚠️ Important:</strong> We are not responsible for the privacy practices of these third-party 
            services. We encourage you to read their privacy policies.
          </div>
        </section>

        {/* 6. Data Security */}
        <section id="data-security" className="mb-12 scroll-mt-20">
          <h2 className="font-pixel text-2xl mb-4 border-b-2 border-black dark:border-white pb-2">
            6. DATA SECURITY
          </h2>
          <p className="mb-4">
            We take data security seriously and implement industry-standard measures to protect your information:
          </p>

          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>Encryption:</strong> All data in transit is encrypted using TLS 1.3. Sensitive data at rest is encrypted.</li>
            <li><strong>Password Security:</strong> Passwords are hashed using bcrypt with salt before storage.</li>
            <li><strong>Access Controls:</strong> Strict access controls limit who can access your data internally.</li>
            <li><strong>Regular Audits:</strong> We conduct regular security audits and penetration testing.</li>
            <li><strong>Secure Infrastructure:</strong> Our platform is hosted on secure, SOC 2 compliant infrastructure.</li>
            <li><strong>Database Security:</strong> Row-level security (RLS) ensures users can only access their own data.</li>
          </ul>

          <div className="bg-[#F44336] text-white p-4 border-2 border-black">
            <strong>⚠️ No Method is 100% Secure:</strong> While we strive to protect your data, no method of 
            transmission over the internet or electronic storage is completely secure. We cannot guarantee 
            absolute security.
          </div>
        </section>

        {/* 7. Cookies */}
        <section id="cookies" className="mb-12 scroll-mt-20">
          <h2 className="font-pixel text-2xl mb-4 border-b-2 border-black dark:border-white pb-2">
            7. COOKIES AND TRACKING TECHNOLOGIES
          </h2>
          <p className="mb-4">
            We use cookies and similar tracking technologies to enhance your experience:
          </p>

          <h3 className="font-pixel text-lg mb-3 mt-6">7.1 Essential Cookies (Required)</h3>
          <p className="mb-4">These cookies are necessary for the platform to function:</p>
          <ul className="list-disc pl-6 space-y-1 mb-6">
            <li><strong>Authentication:</strong> Keep you logged in</li>
            <li><strong>Security:</strong> Prevent CSRF attacks</li>
            <li><strong>Session Management:</strong> Maintain your session state</li>
          </ul>

          <h3 className="font-pixel text-lg mb-3">7.2 Preference Cookies (Optional)</h3>
          <p className="mb-4">These cookies remember your preferences:</p>
          <ul className="list-disc pl-6 space-y-1 mb-6">
            <li><strong>Theme:</strong> Remember light/dark mode preference</li>
            <li><strong>Language:</strong> Remember your language selection</li>
            <li><strong>Settings:</strong> Remember your dashboard preferences</li>
          </ul>

          <h3 className="font-pixel text-lg mb-3">7.3 Analytics Cookies (Optional)</h3>
          <p className="mb-4">These help us understand how you use our platform:</p>
          <ul className="list-disc pl-6 space-y-1 mb-6">
            <li><strong>Usage Analytics:</strong> Track feature usage and performance</li>
            <li><strong>Error Tracking:</strong> Help us identify and fix bugs</li>
          </ul>

          <p className="mb-4">
            <strong>You can control cookies</strong> through your browser settings. However, disabling essential 
            cookies may affect platform functionality.
          </p>
        </section>

        {/* 8. Your Privacy Rights */}
        <section id="your-rights" className="mb-12 scroll-mt-20">
          <h2 className="font-pixel text-2xl mb-4 border-b-2 border-black dark:border-white pb-2">
            8. YOUR PRIVACY RIGHTS
          </h2>
          <p className="mb-4">
            Depending on your location, you may have the following rights regarding your personal information:
          </p>

          <div className="space-y-4 mb-6">
            <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-4">
              <h4 className="font-bold mb-2">🔍 Right to Access</h4>
              <p className="text-sm">
                You can request a copy of all personal information we hold about you. Go to Settings → 
                Profile → "Download My Data" or email privacy@afrinova.app.
              </p>
            </div>

            <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-4">
              <h4 className="font-bold mb-2">✏️ Right to Correction</h4>
              <p className="text-sm">
                You can update your account information anytime in Settings → Profile. For other corrections, 
                contact us at privacy@afrinova.app.
              </p>
            </div>

            <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-4">
              <h4 className="font-bold mb-2">🗑️ Right to Deletion</h4>
              <p className="text-sm">
                You can delete your account and all associated data in Settings → Profile → "Delete Account". 
                This action is permanent and cannot be undone.
              </p>
            </div>

            <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-4">
              <h4 className="font-bold mb-2">📦 Right to Data Portability</h4>
              <p className="text-sm">
                You can export your projects and generated code at any time. Go to Settings → Profile → 
                "Export All Projects".
              </p>
            </div>

            <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-4">
              <h4 className="font-bold mb-2">🚫 Right to Object</h4>
              <p className="text-sm">
                You can object to certain data processing (e.g., marketing emails). Unsubscribe links are 
                in all marketing emails, or go to Settings → Preferences.
              </p>
            </div>

            <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-4">
              <h4 className="font-bold mb-2">⏸️ Right to Restriction</h4>
              <p className="text-sm">
                You can request that we restrict processing of your data in certain circumstances. Contact 
                privacy@afrinova.app.
              </p>
            </div>
          </div>

          <div className="bg-[#4CAF50] text-white p-4 border-2 border-black">
            <strong>🇪🇺 GDPR Rights (EU/EEA):</strong> If you're in the EU/EEA, you have additional rights 
            under GDPR, including the right to lodge a complaint with your local data protection authority.
          </div>

          <div className="bg-[#2196F3] text-white p-4 border-2 border-black mt-4">
            <strong>🇺🇸 CCPA Rights (California):</strong> California residents have additional rights under 
            CCPA. We do NOT sell your personal information. You can opt out of analytics by contacting us.
          </div>
        </section>

        {/* 9. Data Retention */}
        <section id="data-retention" className="mb-12 scroll-mt-20">
          <h2 className="font-pixel text-2xl mb-4 border-b-2 border-black dark:border-white pb-2">
            9. DATA RETENTION
          </h2>
          <p className="mb-4">We retain your information for as long as necessary to provide our services:</p>

          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>Active Accounts:</strong> We retain your data while your account is active</li>
            <li><strong>Deleted Accounts:</strong> After account deletion, most data is deleted within 30 days. Some data may be retained for up to 90 days for backup and recovery purposes.</li>
            <li><strong>Legal Requirements:</strong> We may retain certain data longer if required by law (e.g., tax records, transaction history)</li>
            <li><strong>Anonymized Data:</strong> We may retain anonymized, aggregated data indefinitely for analytics and research</li>
          </ul>
        </section>

        {/* 10. Children's Privacy */}
        <section id="children" className="mb-12 scroll-mt-20">
          <h2 className="font-pixel text-2xl mb-4 border-b-2 border-black dark:border-white pb-2">
            10. CHILDREN'S PRIVACY
          </h2>
          <p className="mb-4">
            AfriNova is not intended for users under the age of 13 (or 16 in the EU/EEA). We do not knowingly 
            collect personal information from children.
          </p>
          <p className="mb-4">
            If you are a parent or guardian and believe your child has provided us with personal information, 
            please contact us immediately at privacy@afrinova.app. We will delete the information promptly.
          </p>
        </section>

        {/* 11. International Transfers */}
        <section id="international" className="mb-12 scroll-mt-20">
          <h2 className="font-pixel text-2xl mb-4 border-b-2 border-black dark:border-white pb-2">
            11. INTERNATIONAL DATA TRANSFERS
          </h2>
          <p className="mb-4">
            AfriNova operates globally. Your information may be transferred to, stored, and processed in 
            countries other than your own, including:
          </p>
          <ul className="list-disc pl-6 space-y-1 mb-6">
            <li>Uganda (our headquarters)</li>
            <li>United States (where some of our service providers are located)</li>
            <li>European Union (where some servers are located)</li>
          </ul>
          <p className="mb-4">
            We ensure appropriate safeguards are in place for international transfers, including:
          </p>
          <ul className="list-disc pl-6 space-y-1 mb-4">
            <li>Standard Contractual Clauses approved by the European Commission</li>
            <li>Adequacy decisions where applicable</li>
            <li>Certifications and compliance frameworks (e.g., SOC 2)</li>
          </ul>
        </section>

        {/* 12. Changes to Policy */}
        <section id="changes" className="mb-12 scroll-mt-20">
          <h2 className="font-pixel text-2xl mb-4 border-b-2 border-black dark:border-white pb-2">
            12. CHANGES TO THIS PRIVACY POLICY
          </h2>
          <p className="mb-4">
            We may update this Privacy Policy from time to time to reflect changes in our practices, 
            technology, legal requirements, or other factors.
          </p>
          <p className="mb-4">
            When we make changes:
          </p>
          <ul className="list-disc pl-6 space-y-1 mb-4">
            <li>We will update the "Last Updated" date at the top of this policy</li>
            <li>For material changes, we will notify you by email and/or a prominent notice on our Platform</li>
            <li>Your continued use of AfriNova after changes constitutes acceptance of the updated policy</li>
          </ul>
        </section>

        {/* 13. Contact Us */}
        <section id="contact" className="mb-12 scroll-mt-20">
          <h2 className="font-pixel text-2xl mb-4 border-b-2 border-black dark:border-white pb-2">
            13. CONTACT US
          </h2>
          <p className="mb-4">
            If you have any questions, concerns, or requests regarding this Privacy Policy or our data 
            practices, please contact us:
          </p>
          
          <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-6">
            <p className="mb-2"><strong>AfriNova Technologies Ltd.</strong></p>
            <p className="mb-2">Email: <a href="mailto:privacy@afrinova.app" className="text-[#FF6B35] hover:underline">privacy@afrinova.app</a></p>
            <p className="mb-2">Support: <a href="mailto:support@afrinova.app" className="text-[#FF6B35] hover:underline">support@afrinova.app</a></p>
            <p className="mb-2">Location: Kampala, Uganda</p>
            <p>Website: <a href="https://afrinova.app" className="text-[#FF6B35] hover:underline">https://afrinova.app</a></p>
          </div>

          <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
            We aim to respond to all privacy-related inquiries within 30 days.
          </p>
        </section>

        {/* Back to Top */}
        <div className="text-center">
          <a 
            href="#introduction" 
            className="inline-block px-6 py-3 bg-[#FF6B35] text-white font-pixel border-2 border-black dark:border-white hover:translate-x-1 hover:translate-y-1 transition-transform"
            style={{ boxShadow: '4px 4px 0px rgba(0,0,0,0.25)' }}
          >
            ↑ BACK TO TOP
          </a>
        </div>

      </div>
    </div>
  )
}
