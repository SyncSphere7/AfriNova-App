import Link from 'next/link'
import { Code2, Mail, MessageSquare, Globe, MapPin, Clock, Twitter, Linkedin, Github } from 'lucide-react'

export const metadata = {
  title: 'Contact | AfriNova',
  description: 'Get in touch with the AfriNova team.',
};

export default function ContactPage() {
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
          <h1 className="font-pixel text-4xl mb-4">CONTACT US</h1>
          <p className="text-lg max-w-2xl mx-auto">
            Have questions? We're here to help. Reach out and we'll get back to you as soon as possible.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Contact Information */}
          <div>
            <h2 className="font-pixel text-2xl mb-6">GET IN TOUCH</h2>
            
            <div className="space-y-6">
              {/* Email */}
              <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-6">
                <div className="flex items-start gap-4">
                  <Mail className="h-6 w-6 text-[#FF6B35] mt-1" />
                  <div>
                    <h3 className="font-pixel text-lg mb-2">EMAIL</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      For general inquiries and support
                    </p>
                    <a 
                      href="mailto:support@afrinova.app" 
                      className="text-[#FF6B35] hover:underline block mb-1"
                    >
                      support@afrinova.app
                    </a>
                    <a 
                      href="mailto:hello@afrinova.app" 
                      className="text-[#FF6B35] hover:underline block mb-1"
                    >
                      hello@afrinova.app
                    </a>
                    <p className="text-xs text-gray-500 mt-2">
                      Response time: 24-48 hours
                    </p>
                  </div>
                </div>
              </div>

              {/* Business Inquiries */}
              <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-6">
                <div className="flex items-start gap-4">
                  <Mail className="h-6 w-6 text-[#FF6B35] mt-1" />
                  <div>
                    <h3 className="font-pixel text-lg mb-2">BUSINESS</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Partnerships, press, and enterprise
                    </p>
                    <a 
                      href="mailto:business@afrinova.app" 
                      className="text-[#FF6B35] hover:underline block mb-1"
                    >
                      business@afrinova.app
                    </a>
                    <a 
                      href="mailto:press@afrinova.app" 
                      className="text-[#FF6B35] hover:underline block"
                    >
                      press@afrinova.app
                    </a>
                  </div>
                </div>
              </div>

              {/* Discord */}
              <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-6">
                <div className="flex items-start gap-4">
                  <MessageSquare className="h-6 w-6 text-[#FF6B35] mt-1" />
                  <div>
                    <h3 className="font-pixel text-lg mb-2">DISCORD COMMUNITY</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Join our community for instant help and discussions
                    </p>
                    <a 
                      href="https://discord.gg/afrinova" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FF6B35] hover:underline"
                    >
                      discord.gg/afrinova
                    </a>
                    <p className="text-xs text-gray-500 mt-2">
                      Active community of 500+ developers
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-6">
                <div className="flex items-start gap-4">
                  <Globe className="h-6 w-6 text-[#FF6B35] mt-1" />
                  <div>
                    <h3 className="font-pixel text-lg mb-2">SOCIAL MEDIA</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Follow us for updates, tips, and announcements
                    </p>
                    <div className="space-y-2">
                      <a 
                        href="https://twitter.com/afrinova" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[#FF6B35] hover:underline"
                      >
                        <Twitter className="h-4 w-4" />
                        <span>@afrinova</span>
                      </a>
                      <a 
                        href="https://linkedin.com/company/afrinova" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[#FF6B35] hover:underline"
                      >
                        <Linkedin className="h-4 w-4" />
                        <span>linkedin.com/company/afrinova</span>
                      </a>
                      <a 
                        href="https://github.com/afrinova" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[#FF6B35] hover:underline"
                      >
                        <Github className="h-4 w-4" />
                        <span>github.com/afrinova</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-6">
                <div className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-[#FF6B35] mt-1" />
                  <div>
                    <h3 className="font-pixel text-lg mb-2">LOCATION</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      AfriNova Technologies Ltd.
                      <br />
                      Kampala, Uganda
                      <br />
                      East Africa
                    </p>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-6">
                <div className="flex items-start gap-4">
                  <Clock className="h-6 w-6 text-[#FF6B35] mt-1" />
                  <div>
                    <h3 className="font-pixel text-lg mb-2">SUPPORT HOURS</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Email Support (All Plans):
                    </p>
                    <p className="text-sm mb-2">
                      Monday - Friday: 9:00 AM - 6:00 PM EAT
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      24/7 Support (Pro Plan Only):
                    </p>
                    <p className="text-sm">
                      Available around the clock
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="font-pixel text-2xl mb-6">SEND US A MESSAGE</h2>
            
            <form className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-6">
              {/* Name */}
              <div className="mb-4">
                <label htmlFor="name" className="block font-pixel text-sm mb-2">
                  NAME *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 bg-[#E8E4DC] dark:bg-[#1A1A1A] border-2 border-black dark:border-white focus:outline-none focus:border-[#FF6B35]"
                  placeholder="Your full name"
                />
              </div>

              {/* Email */}
              <div className="mb-4">
                <label htmlFor="email" className="block font-pixel text-sm mb-2">
                  EMAIL *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 bg-[#E8E4DC] dark:bg-[#1A1A1A] border-2 border-black dark:border-white focus:outline-none focus:border-[#FF6B35]"
                  placeholder="your@email.com"
                />
              </div>

              {/* Subject */}
              <div className="mb-4">
                <label htmlFor="subject" className="block font-pixel text-sm mb-2">
                  SUBJECT *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-3 bg-[#E8E4DC] dark:bg-[#1A1A1A] border-2 border-black dark:border-white focus:outline-none focus:border-[#FF6B35]"
                >
                  <option value="">Select a topic</option>
                  <option value="support">Technical Support</option>
                  <option value="billing">Billing & Payments</option>
                  <option value="feature">Feature Request</option>
                  <option value="bug">Bug Report</option>
                  <option value="partnership">Partnership Inquiry</option>
                  <option value="press">Press & Media</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Message */}
              <div className="mb-6">
                <label htmlFor="message" className="block font-pixel text-sm mb-2">
                  MESSAGE *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-[#E8E4DC] dark:bg-[#1A1A1A] border-2 border-black dark:border-white focus:outline-none focus:border-[#FF6B35] resize-none"
                  placeholder="Tell us how we can help..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Please be as detailed as possible
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full px-6 py-4 bg-[#FF6B35] text-white font-pixel border-2 border-black dark:border-white hover:translate-x-1 hover:translate-y-1 transition-transform"
                style={{ boxShadow: '4px 4px 0px rgba(0,0,0,0.25)' }}
              >
                SEND MESSAGE
              </button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                We typically respond within 24-48 hours
              </p>
            </form>
          </div>

        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="font-pixel text-2xl mb-6 text-center">FREQUENTLY ASKED QUESTIONS</h2>
          <div className="grid md:grid-cols-2 gap-6">
            
            <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-6">
              <h3 className="font-pixel text-lg mb-3">How fast do you respond?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Email: 24-48 hours for all plans. Discord: Usually within 1-2 hours during business hours. 
                Pro plans get 24/7 priority support with 4-hour response time.
              </p>
            </div>

            <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-6">
              <h3 className="font-pixel text-lg mb-3">Can I schedule a call?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Yes! Pro plan members can book 1-on-1 calls with our team. Growth plan members can request 
                calls for technical issues. Email us at business@afrinova.app to schedule.
              </p>
            </div>

            <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-6">
              <h3 className="font-pixel text-lg mb-3">What about technical issues?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                For technical problems, email support@afrinova.app with your project ID, error messages, 
                and screenshots. Our team will investigate and respond within 24 hours.
              </p>
            </div>

            <div className="bg-white dark:bg-[#2A2A2A] border-2 border-black dark:border-white p-6">
              <h3 className="font-pixel text-lg mb-3">Do you have a phone number?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We primarily support through email and Discord for better tracking and documentation. 
                Pro plan members receive a dedicated phone line for urgent issues.
              </p>
            </div>

          </div>
        </div>

        {/* Emergency Support */}
        <div className="mt-8 bg-[#F44336] text-white p-6 border-2 border-black dark:border-white text-center">
          <h3 className="font-pixel text-xl mb-3">🚨 CRITICAL ISSUES?</h3>
          <p className="mb-4">
            If you're experiencing a service outage or critical bug affecting your business, 
            email us immediately at <strong>urgent@afrinova.app</strong> with "URGENT" in the subject line.
          </p>
          <p className="text-sm">
            Pro plan members: Use your dedicated support line for immediate assistance.
          </p>
        </div>

      </div>
    </div>
  )
}
