import Link from 'next/link'
import { Code2, FileText } from 'lucide-react'

export const metadata = {
  title: 'Terms & Conditions | AfriNova',
  description: 'Terms and conditions for using the AfriNova platform.',
};

export default function TermsPage() {
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
          <FileText className="h-16 w-16 mx-auto mb-4" />
          <h1 className="font-pixel text-4xl mb-4">TERMS & CONDITIONS</h1>
          <p className="text-lg max-w-2xl mx-auto">
            The rules and guidelines for using AfriNova
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
            <li><a href="#acceptance" className="text-[#FF6B35] hover:underline">1. Acceptance of Terms</a></li>
            <li><a href="#description" className="text-[#FF6B35] hover:underline">2. Description of Service</a></li>
            <li><a href="#accounts" className="text-[#FF6B35] hover:underline">3. User Accounts</a></li>
            <li><a href="#subscriptions" className="text-[#FF6B35] hover:underline">4. Subscriptions and Billing</a></li>
            <li><a href="#refunds" className="text-[#FF6B35] hover:underline">5. Refunds and Cancellations</a></li>
            <li><a href="#ip-rights" className="text-[#FF6B35] hover:underline">6. Intellectual Property Rights</a></li>
            <li><a href="#user-responsibilities" className="text-[#FF6B35] hover:underline">7. User Responsibilities</a></li>
            <li><a href="#prohibited" className="text-[#FF6B35] hover:underline">8. Prohibited Uses</a></li>
            <li><a href="#generated-code" className="text-[#FF6B35] hover:underline">9. Generated Code Ownership</a></li>
            <li><a href="#service-availability" className="text-[#FF6B35] hover:underline">10. Service Availability</a></li>
            <li><a href="#disclaimers" className="text-[#FF6B35] hover:underline">11. Disclaimers and Warranties</a></li>
            <li><a href="#limitation" className="text-[#FF6B35] hover:underline">12. Limitation of Liability</a></li>
            <li><a href="#indemnification" className="text-[#FF6B35] hover:underline">13. Indemnification</a></li>
            <li><a href="#termination" className="text-[#FF6B35] hover:underline">14. Termination</a></li>
            <li><a href="#dispute" className="text-[#FF6B35] hover:underline">15. Dispute Resolution</a></li>
            <li><a href="#governing-law" className="text-[#FF6B35] hover:underline">16. Governing Law</a></li>
            <li><a href="#changes-terms" className="text-[#FF6B35] hover:underline">17. Changes to Terms</a></li>
            <li><a href="#contact-terms" className="text-[#FF6B35] hover:underline">18. Contact Information</a></li>
          </ol>
        </div>

        {/* 1. Acceptance */}
        <section id="acceptance" className="mb-12 scroll-mt-20">
          <h2 className="font-pixel text-2xl mb-4 border-b-2 border-black dark:border-white pb-2">
            1. ACCEPTANCE OF TERMS
          </h2>
          <p className="mb-4">
            Welcome to AfriNova. These Terms and Conditions ("Terms", "Agreement") govern your access to and 
            use of the AfriNova platform, website (https://afrinova.app), and services (collectively, the "Service") 
            operated by <strong>AfriNova Technologies Ltd.</strong> ("AfriNova", "we", "us", or "our"), a company 
            registered in Uganda.
          </p>
          <p className="mb-4">
            By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any 
            part of these Terms, you may not access the Service.
          </p>
          <div className="bg-[#FF6B35] text-white p-4 border-2 border-black">
            <strong>⚠️ Important:</strong> Please read these Terms carefully before using AfriNova. By creating 
            an account or using our Service, you acknowledge that you have read, understood, and agree to be 
            bound by these Terms and our Privacy Policy.
          </div>
        </section>

        {/* 2. Description of Service */}
        <section id="description" className="mb-12 scroll-mt-20">
          <h2 className="font-pixel text-2xl mb-4 border-b-2 border-black dark:border-white pb-2">
            2. DESCRIPTION OF SERVICE
          </h2>
          <p className="mb-4">
            AfriNova is an AI-powered full-stack development platform that generates production-ready code based 
            on user specifications. Our Service includes:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Code Generation:</strong> AI-powered generation of frontend, backend, database, and full-stack applications</li>
            <li><strong>Project Management:</strong> Tools to create, manage, and organize your generated projects</li>
            <li><strong>File Handling:</strong> Upload design files, documents, and other materials to enhance generation</li>
            <li><strong>Integrations:</strong> Support for 20+ third-party services including payment gateways, authentication providers, and analytics tools</li>
            <li><strong>Code Download:</strong> Export your generated code as downloadable ZIP files</li>
          </ul>
          <p>
            We reserve the right to modify, suspend, or discontinue any part of the Service at any time, with 
            or without notice.
          </p>
        </section>

        {/* 3. User Accounts */}
        <section id="accounts" className="mb-12 scroll-mt-20">
          <h2 className="font-pixel text-2xl mb-4 border-b-2 border-black dark:border-white pb-2">
            3. USER ACCOUNTS
          </h2>
          
          <h3 className="font-pixel text-lg mb-3 mt-6">3.1 Account Creation</h3>
          <p className="mb-4">
            To use AfriNova, you must create an account by providing:
          </p>
          <ul className="list-disc pl-6 space-y-1 mb-4">
            <li>A valid email address</li>
            <li>Your full name</li>
            <li>A secure password</li>
          </ul>
          <p className="mb-6">
            You may also register using OAuth providers (Google, GitHub).
          </p>

          <h3 className="font-pixel text-lg mb-3">3.2 Account Security</h3>
          <p className="mb-4">You are responsible for:</p>
          <ul className="list-disc pl-6 space-y-1 mb-4">
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized access or security breach</li>
          </ul>

          <h3 className="font-pixel text-lg mb-3">3.3 Eligibility</h3>
          <p className="mb-4">
            You must be at least 13 years old (or 16 in the EU/EEA) to use AfriNova. By creating an account, 
            you represent and warrant that you meet this age requirement.
          </p>

          <h3 className="font-pixel text-lg mb-3">3.4 Account Termination</h3>
          <p className="mb-4">
            We reserve the right to terminate or suspend your account at any time if you:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Violate these Terms</li>
            <li>Engage in fraudulent or illegal activity</li>
            <li>Abuse the Service or cause harm to other users</li>
            <li>Fail to pay subscription fees</li>
          </ul>
        </section>

        {/* 4. Subscriptions and Billing */}
        <section id="subscriptions" className="mb-12 scroll-mt-20">
          <h2 className="font-pixel text-2xl mb-4 border-b-2 border-black dark:border-white pb-2">
            4. SUBSCRIPTIONS AND BILLING
          </h2>
          
          <h3 className="font-pixel text-lg mb-3 mt-6">4.1 Subscription Plans</h3>
          <p className="mb-4">AfriNova offers the following subscription tiers:</p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>Free:</strong> $0/month - 5 generations, 3 projects, community support</li>
            <li><strong>Starter:</strong> $15/month - 30 generations, 15 projects, email support</li>
            <li><strong>Growth:</strong> $35/month - 100 generations, 50 projects, priority support</li>
            <li><strong>Pro:</strong> $75/month - 300 generations, unlimited projects, 24/7 support</li>
          </ul>

          <h3 className="font-pixel text-lg mb-3">4.2 Billing</h3>
          <p className="mb-4">
            Paid subscriptions are billed on a monthly basis unless you choose annual billing (which includes 
            a 20% discount). Billing occurs on the same day each month as your initial subscription date.
          </p>
          <p className="mb-6">
            All payments are processed securely through Stripe. We do NOT store your credit card information.
          </p>

          <h3 className="font-pixel text-lg mb-3">4.3 Automatic Renewal</h3>
          <p className="mb-4">
            Your subscription will automatically renew at the end of each billing period unless you cancel 
            before the renewal date. You will be charged the then-current subscription rate.
          </p>

          <h3 className="font-pixel text-lg mb-3">4.4 Failed Payments</h3>
          <p className="mb-4">
            If a payment fails:
          </p>
          <ul className="list-disc pl-6 space-y-1 mb-4">
            <li>We will attempt to charge your payment method multiple times over 7 days</li>
            <li>You will receive email notifications about the failed payment</li>
            <li>If payment is not received within 7 days, your subscription will be downgraded to the Free plan</li>
            <li>Your projects and data will NOT be deleted, but generation limits will apply</li>
          </ul>

          <h3 className="font-pixel text-lg mb-3">4.5 Price Changes</h3>
          <p className="mb-4">
            We reserve the right to change subscription prices at any time. Price changes will:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Take effect at your next renewal date</li>
            <li>Be communicated to you at least 30 days in advance via email</li>
            <li>Give you the option to cancel before the price increase takes effect</li>
          </ul>
        </section>

        {/* 5. Refunds and Cancellations */}
        <section id="refunds" className="mb-12 scroll-mt-20">
          <h2 className="font-pixel text-2xl mb-4 border-b-2 border-black dark:border-white pb-2">
            5. REFUNDS AND CANCELLATIONS
          </h2>
          
          <h3 className="font-pixel text-lg mb-3 mt-6">5.1 Cancellation Policy</h3>
          <p className="mb-4">
            You may cancel your subscription at any time through Settings → Billing → "Cancel Subscription". 
            Cancellations take effect at the end of your current billing period.
          </p>
          <p className="mb-6">
            After cancellation:
          </p>
          <ul className="list-disc pl-6 space-y-1 mb-6">
            <li>You retain access to paid features until the end of your billing period</li>
            <li>Your account will automatically downgrade to the Free plan</li>
            <li>All your projects and data will be preserved</li>
            <li>You can resubscribe at any time</li>
          </ul>

          <h3 className="font-pixel text-lg mb-3">5.2 Refund Policy</h3>
          <p className="mb-4">
            We offer a <strong>14-day money-back guarantee</strong> for first-time subscribers:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>If you're not satisfied within 14 days of your first subscription, contact support@afrinova.app for a full refund</li>
            <li>This applies only to your first subscription payment</li>
            <li>Refunds are not available for renewal payments</li>
            <li>Annual subscriptions are refundable within 14 days of initial payment only</li>
          </ul>

          <div className="bg-[#FFC107] text-black p-4 border-2 border-black mb-6">
            <strong>⚠️ No Refunds After 14 Days:</strong> After the 14-day guarantee period, all payments 
            are final and non-refundable. Please cancel before your next billing date if you don't wish to continue.
          </div>

          <h3 className="font-pixel text-lg mb-3">5.3 Usage-Based Refunds</h3>
          <p className="mb-4">
            We do NOT provide pro-rated refunds based on usage. If you use 10 out of 30 generations and 
            cancel, you will NOT receive a partial refund.
          </p>
        </section>

        {/* 6. Intellectual Property */}
        <section id="ip-rights" className="mb-12 scroll-mt-20">
          <h2 className="font-pixel text-2xl mb-4 border-b-2 border-black dark:border-white pb-2">
            6. INTELLECTUAL PROPERTY RIGHTS
          </h2>
          
          <h3 className="font-pixel text-lg mb-3 mt-6">6.1 Our IP</h3>
          <p className="mb-4">
            The AfriNova platform, including all software, algorithms, design, logos, trademarks, and content 
            (excluding user-generated content), is owned by AfriNova Technologies Ltd. and is protected by 
            copyright, trademark, and other intellectual property laws.
          </p>
          <p className="mb-6">
            You may NOT:
          </p>
          <ul className="list-disc pl-6 space-y-1 mb-6">
            <li>Copy, modify, or reverse engineer any part of the AfriNova platform</li>
            <li>Use our trademarks, logos, or branding without written permission</li>
            <li>Create derivative works based on our Service</li>
            <li>Attempt to extract our AI models or algorithms</li>
          </ul>

          <h3 className="font-pixel text-lg mb-3">6.2 Your IP</h3>
          <p className="mb-4">
            You retain all rights to any content you upload to AfriNova, including:
          </p>
          <ul className="list-disc pl-6 space-y-1 mb-4">
            <li>Design files (Figma, Sketch, Adobe XD, images)</li>
            <li>Documents and specifications</li>
            <li>Project descriptions and prompts</li>
          </ul>
          <p className="mb-6">
            By uploading content, you grant AfriNova a limited license to use, process, and display your 
            content solely for the purpose of providing the Service to you.
          </p>

          <h3 className="font-pixel text-lg mb-3">6.3 Feedback and Suggestions</h3>
          <p className="mb-4">
            If you provide feedback, suggestions, or ideas to AfriNova, you grant us a perpetual, royalty-free, 
            worldwide license to use, modify, and incorporate that feedback into our Service without any 
            obligation to compensate you.
          </p>
        </section>

        {/* 9. Generated Code Ownership */}
        <section id="generated-code" className="mb-12 scroll-mt-20">
          <h2 className="font-pixel text-2xl mb-4 border-b-2 border-black dark:border-white pb-2">
            9. GENERATED CODE OWNERSHIP
          </h2>
          <div className="bg-[#4CAF50] text-white p-6 border-2 border-black mb-6">
            <h3 className="font-pixel text-lg mb-3">✅ YOU OWN 100% OF YOUR GENERATED CODE</h3>
            <p className="mb-3">
              All code generated by AfriNova for your projects belongs entirely to YOU. We make NO claims to 
              ownership of your generated code.
            </p>
            <p>
              You are free to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Use the code commercially or personally</li>
              <li>Modify, distribute, or sell the code</li>
              <li>License the code under any terms you choose</li>
              <li>Copyright or trademark the code</li>
            </ul>
          </div>

          <h3 className="font-pixel text-lg mb-3 mt-6">9.1 No Guarantees</h3>
          <p className="mb-4">
            While you own the generated code, AfriNova makes NO guarantees that:
          </p>
          <ul className="list-disc pl-6 space-y-1 mb-6">
            <li>The code is free from bugs or errors</li>
            <li>The code will meet your specific requirements</li>
            <li>The code is free from security vulnerabilities</li>
            <li>The code does not infringe on third-party intellectual property</li>
          </ul>

          <h3 className="font-pixel text-lg mb-3">9.2 Third-Party Code and Libraries</h3>
          <p className="mb-4">
            Generated code may include references to or use of third-party libraries and frameworks (e.g., 
            React, Express, Tailwind CSS). These libraries have their own licenses (typically MIT, Apache 2.0, 
            or similar open-source licenses).
          </p>
          <p className="mb-6">
            <strong>You are responsible for:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Reviewing and complying with third-party library licenses</li>
            <li>Ensuring your use of generated code complies with all applicable licenses</li>
            <li>Updating dependencies and libraries as needed</li>
          </ul>
        </section>

        {/* 7. User Responsibilities */}
        <section id="user-responsibilities" className="mb-12 scroll-mt-20">
          <h2 className="font-pixel text-2xl mb-4 border-b-2 border-black dark:border-white pb-2">
            7. USER RESPONSIBILITIES
          </h2>
          <p className="mb-4">As a user of AfriNova, you agree to:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Provide Accurate Information:</strong> Ensure all account and billing information is accurate and up-to-date</li>
            <li><strong>Use the Service Legally:</strong> Comply with all applicable laws and regulations</li>
            <li><strong>Respect Usage Limits:</strong> Stay within your plan's generation and project limits</li>
            <li><strong>Secure Your Account:</strong> Use a strong password and keep your credentials confidential</li>
            <li><strong>Test Generated Code:</strong> Thoroughly test any generated code before deploying to production</li>
            <li><strong>Review Licenses:</strong> Ensure compliance with all third-party library licenses in generated code</li>
            <li><strong>Report Issues:</strong> Notify us promptly of any bugs, errors, or security vulnerabilities you discover</li>
          </ul>
        </section>

        {/* 8. Prohibited Uses */}
        <section id="prohibited" className="mb-12 scroll-mt-20">
          <h2 className="font-pixel text-2xl mb-4 border-b-2 border-black dark:border-white pb-2">
            8. PROHIBITED USES
          </h2>
          <p className="mb-4">You may NOT use AfriNova to:</p>
          
          <div className="space-y-3">
            <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-4">
              <h4 className="font-bold mb-2">🚫 Generate Illegal or Harmful Content</h4>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li>Create malware, viruses, or malicious code</li>
                <li>Generate code for illegal activities (hacking, fraud, etc.)</li>
                <li>Build applications that violate laws or regulations</li>
                <li>Create content that infringes on intellectual property rights</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-4">
              <h4 className="font-bold mb-2">🚫 Abuse the Service</h4>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li>Attempt to reverse engineer, decompile, or extract our AI models</li>
                <li>Use automated tools to scrape or extract data from our platform</li>
                <li>Overload our servers or attempt denial-of-service attacks</li>
                <li>Create multiple accounts to bypass usage limits</li>
                <li>Share accounts or API keys with others</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-4">
              <h4 className="font-bold mb-2">🚫 Violate Third-Party Rights</h4>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li>Generate code that infringes on patents, copyrights, or trademarks</li>
                <li>Upload files you don't have rights to use</li>
                <li>Create clones or copies of existing commercial software without authorization</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-4">
              <h4 className="font-bold mb-2">🚫 Resell or Compete</h4>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li>Resell, sublicense, or redistribute access to AfriNova without authorization</li>
                <li>Use AfriNova to build a competing AI code generation service</li>
                <li>Frame or mirror the AfriNova platform</li>
              </ul>
            </div>
          </div>

          <div className="bg-[#F44336] text-white p-4 border-2 border-black mt-6">
            <strong>⚠️ Violation Consequences:</strong> Violation of these prohibitions may result in 
            immediate account termination, legal action, and liability for damages.
          </div>
        </section>

        {/* 10. Service Availability */}
        <section id="service-availability" className="mb-12 scroll-mt-20">
          <h2 className="font-pixel text-2xl mb-4 border-b-2 border-black dark:border-white pb-2">
            10. SERVICE AVAILABILITY
          </h2>
          <p className="mb-4">
            We strive to maintain 99.9% uptime (Pro plan SLA), but we cannot guarantee uninterrupted service:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Scheduled Maintenance:</strong> We may perform maintenance that temporarily interrupts service. We'll provide advance notice when possible.</li>
            <li><strong>Unplanned Downtime:</strong> Technical issues, server failures, or third-party service outages may cause temporary unavailability</li>
            <li><strong>Service Modifications:</strong> We may modify, suspend, or discontinue features at any time</li>
          </ul>
          <p className="mb-4">
            <strong>Pro Plan SLA:</strong> Pro subscribers are entitled to a 99.9% uptime guarantee. If we fail 
            to meet this, you may be eligible for service credits. Contact support@afrinova.app for claims.
          </p>
        </section>

        {/* 11. Disclaimers */}
        <section id="disclaimers" className="mb-12 scroll-mt-20">
          <h2 className="font-pixel text-2xl mb-4 border-b-2 border-black dark:border-white pb-2">
            11. DISCLAIMERS AND WARRANTIES
          </h2>
          <div className="bg-[#FFC107] text-black p-6 border-2 border-black mb-6">
            <h3 className="font-pixel text-lg mb-3">⚠️ "AS IS" SERVICE</h3>
            <p className="mb-3">
              THE AFRINOVA SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, 
              WHETHER EXPRESS OR IMPLIED.
            </p>
            <p>
              WE MAKE NO WARRANTIES THAT:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>The Service will meet your requirements</li>
              <li>Generated code will be error-free, secure, or production-ready</li>
              <li>The Service will be uninterrupted or bug-free</li>
              <li>Generated code does not infringe third-party rights</li>
              <li>AI-generated results will be accurate or reliable</li>
            </ul>
          </div>

          <p className="mb-4">
            <strong>You acknowledge that:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>AI-generated code may contain errors, bugs, or security vulnerabilities</li>
            <li>You are solely responsible for testing, reviewing, and validating generated code before use</li>
            <li>Generated code may not be suitable for all purposes or comply with all regulations</li>
            <li>We are not responsible for any damages resulting from use of generated code</li>
          </ul>
        </section>

        {/* 12. Limitation of Liability */}
        <section id="limitation" className="mb-12 scroll-mt-20">
          <h2 className="font-pixel text-2xl mb-4 border-b-2 border-black dark:border-white pb-2">
            12. LIMITATION OF LIABILITY
          </h2>
          <div className="bg-[#F44336] text-white p-6 border-2 border-black mb-6">
            <h3 className="font-pixel text-lg mb-3">🚨 MAXIMUM LIABILITY</h3>
            <p className="mb-3">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, AFRINOVA'S TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING 
              OUT OF OR RELATING TO THESE TERMS OR YOUR USE OF THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID 
              TO AFRINOVA IN THE 12 MONTHS PRECEDING THE EVENT GIVING RISE TO LIABILITY.
            </p>
            <p>
              IF YOU ARE ON THE FREE PLAN, OUR LIABILITY IS LIMITED TO $100 USD.
            </p>
          </div>

          <p className="mb-4">
            <strong>We are NOT liable for:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Loss of profits, revenue, data, or business opportunities</li>
            <li>Indirect, incidental, special, consequential, or punitive damages</li>
            <li>Damages resulting from errors, bugs, or security vulnerabilities in generated code</li>
            <li>Damages from deployment of generated code to production environments</li>
            <li>Third-party claims arising from your use of generated code</li>
            <li>Service interruptions, downtime, or data loss</li>
            <li>Actions of third-party service providers (Stripe, Supabase, etc.)</li>
          </ul>

          <p className="mb-4">
            Some jurisdictions do not allow limitations on liability, so these limitations may not apply to you.
          </p>
        </section>

        {/* 13. Indemnification */}
        <section id="indemnification" className="mb-12 scroll-mt-20">
          <h2 className="font-pixel text-2xl mb-4 border-b-2 border-black dark:border-white pb-2">
            13. INDEMNIFICATION
          </h2>
          <p className="mb-4">
            You agree to indemnify, defend, and hold harmless AfriNova Technologies Ltd., its officers, 
            directors, employees, agents, and affiliates from and against any and all claims, damages, 
            obligations, losses, liabilities, costs, or debt, and expenses (including attorney's fees) 
            arising from:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your use of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any third-party rights (including intellectual property rights)</li>
            <li>Your generated code and any use or deployment thereof</li>
            <li>Any content you upload to the platform</li>
            <li>Your breach of any representations or warranties made herein</li>
          </ul>
        </section>

        {/* 14. Termination */}
        <section id="termination" className="mb-12 scroll-mt-20">
          <h2 className="font-pixel text-2xl mb-4 border-b-2 border-black dark:border-white pb-2">
            14. TERMINATION
          </h2>
          
          <h3 className="font-pixel text-lg mb-3 mt-6">14.1 Termination by You</h3>
          <p className="mb-4">
            You may terminate your account at any time through Settings → Profile → "Delete Account". Upon 
            deletion:
          </p>
          <ul className="list-disc pl-6 space-y-1 mb-6">
            <li>Your subscription will be cancelled (no refund for remaining time)</li>
            <li>Your account data will be permanently deleted within 30 days</li>
            <li>You will lose access to all projects and generated code (download them first!)</li>
          </ul>

          <h3 className="font-pixel text-lg mb-3">14.2 Termination by AfriNova</h3>
          <p className="mb-4">
            We may terminate or suspend your account immediately, without prior notice, if you:
          </p>
          <ul className="list-disc pl-6 space-y-1 mb-4">
            <li>Violate these Terms</li>
            <li>Engage in fraudulent or illegal activity</li>
            <li>Abuse the Service or harm other users</li>
            <li>Fail to pay subscription fees</li>
          </ul>
          <p className="mb-6">
            We will attempt to provide notice when reasonable, but immediate termination may occur for severe 
            violations.
          </p>

          <h3 className="font-pixel text-lg mb-3">14.3 Effect of Termination</h3>
          <p className="mb-4">
            Upon termination:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Your right to use the Service immediately ceases</li>
            <li>You must cease all use of AfriNova's intellectual property</li>
            <li>Sections that by their nature should survive (e.g., IP ownership, liability limitations) will continue to apply</li>
            <li>Generated code you've already downloaded remains yours to keep and use</li>
          </ul>
        </section>

        {/* 15. Dispute Resolution */}
        <section id="dispute" className="mb-12 scroll-mt-20">
          <h2 className="font-pixel text-2xl mb-4 border-b-2 border-black dark:border-white pb-2">
            15. DISPUTE RESOLUTION
          </h2>
          
          <h3 className="font-pixel text-lg mb-3 mt-6">15.1 Informal Resolution</h3>
          <p className="mb-6">
            If you have a dispute with AfriNova, please contact us first at legal@afrinova.app. We'll work 
            with you in good faith to resolve the issue informally.
          </p>

          <h3 className="font-pixel text-lg mb-3">15.2 Arbitration</h3>
          <p className="mb-4">
            If informal resolution fails, disputes shall be resolved through binding arbitration in accordance 
            with the laws of Uganda, unless your local laws require otherwise.
          </p>

          <h3 className="font-pixel text-lg mb-3">15.3 Class Action Waiver</h3>
          <p className="mb-4">
            You agree that disputes will be resolved on an individual basis. You waive any right to participate 
            in a class action lawsuit or class-wide arbitration.
          </p>
        </section>

        {/* 16. Governing Law */}
        <section id="governing-law" className="mb-12 scroll-mt-20">
          <h2 className="font-pixel text-2xl mb-4 border-b-2 border-black dark:border-white pb-2">
            16. GOVERNING LAW
          </h2>
          <p className="mb-4">
            These Terms shall be governed by and construed in accordance with the laws of <strong>Uganda</strong>, 
            without regard to its conflict of law provisions.
          </p>
          <p className="mb-4">
            For users in the European Union, you may also have rights under EU consumer protection laws.
          </p>
        </section>

        {/* 17. Changes to Terms */}
        <section id="changes-terms" className="mb-12 scroll-mt-20">
          <h2 className="font-pixel text-2xl mb-4 border-b-2 border-black dark:border-white pb-2">
            17. CHANGES TO THESE TERMS
          </h2>
          <p className="mb-4">
            We may modify these Terms at any time. When we do:
          </p>
          <ul className="list-disc pl-6 space-y-1 mb-4">
            <li>We'll update the "Last Updated" date at the top</li>
            <li>For material changes, we'll notify you by email and/or a prominent notice on the platform</li>
            <li>Changes take effect 30 days after notification (or immediately for legal compliance)</li>
            <li>Your continued use after changes constitutes acceptance of the new Terms</li>
          </ul>
          <p>
            If you don't agree with changes, you must stop using the Service and delete your account.
          </p>
        </section>

        {/* 18. Contact */}
        <section id="contact-terms" className="mb-12 scroll-mt-20">
          <h2 className="font-pixel text-2xl mb-4 border-b-2 border-black dark:border-white pb-2">
            18. CONTACT INFORMATION
          </h2>
          <p className="mb-4">
            If you have questions about these Terms, please contact us:
          </p>
          
          <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-6">
            <p className="mb-2"><strong>AfriNova Technologies Ltd.</strong></p>
            <p className="mb-2">Legal: <a href="mailto:legal@afrinova.app" className="text-[#FF6B35] hover:underline">legal@afrinova.app</a></p>
            <p className="mb-2">Support: <a href="mailto:support@afrinova.app" className="text-[#FF6B35] hover:underline">support@afrinova.app</a></p>
            <p className="mb-2">Location: Kampala, Uganda</p>
            <p>Website: <a href="https://afrinova.app" className="text-[#FF6B35] hover:underline">https://afrinova.app</a></p>
          </div>
        </section>

        {/* Back to Top */}
        <div className="text-center">
          <a 
            href="#acceptance" 
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
