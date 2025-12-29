import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Jyotishya",
  description:
    "How we collect, use, and protect your personal data in compliance with IT Act 2000 and GDPR",
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-4xl py-12 px-4">
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          <strong>Effective Date:</strong> January 1, 2025
          <br />
          <strong>Last Updated:</strong>{" "}
          {new Date().toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="mb-4">
            Welcome to Jyotishya ("we," "our," or "us"). We are committed to protecting your
            personal information and your right to privacy. This Privacy Policy explains how we
            collect, use, disclose, and safeguard your information when you use our website and
            mobile application (collectively, the "Service").
          </p>
          <p className="mb-4">
            This Privacy Policy is designed to comply with the Information Technology Act, 2000 and
            the Information Technology (Reasonable Security Practices and Procedures and Sensitive
            Personal Data or Information) Rules, 2011, as well as the General Data Protection
            Regulation (GDPR) for users in the European Economic Area.
          </p>
          <p>
            By using our Service, you agree to the collection and use of information in accordance
            with this Privacy Policy. If you do not agree with our policies and practices, please do
            not use our Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>

          <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Personal Information You Provide</h3>
          <p className="mb-3">
            We collect the following personal information that you voluntarily provide:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Account Information:</strong> Name, email address, phone number, password
            </li>
            <li>
              <strong>Birth Details:</strong> Date of birth, time of birth, place of birth (city,
              state, country, coordinates)
            </li>
            <li>
              <strong>Profile Information:</strong> Gender, preferred language, timezone
            </li>
            <li>
              <strong>Payment Information:</strong> Processed securely by Razorpay (we do not store
              complete card details)
            </li>
            <li>
              <strong>Communication Data:</strong> Messages you send through our consultation
              booking system
            </li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">
            2.2 Information Collected Automatically
          </h3>
          <p className="mb-3">When you access our Service, we automatically collect:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Usage Data:</strong> Pages viewed, features used, time spent on Service, click
              patterns
            </li>
            <li>
              <strong>Device Information:</strong> IP address, browser type, operating system,
              device identifiers
            </li>
            <li>
              <strong>Location Data:</strong> Approximate location based on IP address (for timezone
              and regional content)
            </li>
            <li>
              <strong>Cookies and Tracking:</strong> Session cookies, analytics cookies (see Section
              7 for details)
            </li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">2.3 Information from Third Parties</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>OAuth Providers:</strong> If you sign in with Google, we receive your name,
              email, and profile photo
            </li>
            <li>
              <strong>Payment Gateway:</strong> Razorpay shares transaction status and payment IDs
              with us
            </li>
            <li>
              <strong>Analytics Services:</strong> Vercel Analytics, Sentry (error monitoring)
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
          <p className="mb-3">We use your information for the following purposes:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Service Delivery:</strong> Generate birth charts, calculate astrological
              predictions, provide daily horoscopes
            </li>
            <li>
              <strong>Personalization:</strong> Customize AI interpretations based on your birth
              details and preferences
            </li>
            <li>
              <strong>Account Management:</strong> Create and manage your account, authenticate
              users, handle subscriptions
            </li>
            <li>
              <strong>Payment Processing:</strong> Process payments, prevent fraud, issue refunds
              via Razorpay
            </li>
            <li>
              <strong>Communication:</strong> Send transactional emails (welcome, subscription
              confirmations, booking updates)
            </li>
            <li>
              <strong>Improvement:</strong> Analyze usage patterns to improve features, fix bugs,
              optimize performance
            </li>
            <li>
              <strong>Legal Compliance:</strong> Comply with applicable laws, respond to legal
              requests, enforce our Terms of Service
            </li>
            <li>
              <strong>Security:</strong> Monitor for suspicious activity, prevent unauthorized
              access, protect user data
            </li>
          </ul>
          <p className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
            <strong>Marketing Communications:</strong> We will NOT send marketing emails or
            promotional content unless you explicitly opt-in. You can unsubscribe from marketing
            emails at any time by clicking the "unsubscribe" link.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Third-Party Services & Data Sharing</h2>
          <p className="mb-3">
            We share your information with the following trusted third-party service providers:
          </p>

          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border border-gray-300 dark:border-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">
                    Service
                  </th>
                  <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">
                    Purpose
                  </th>
                  <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">
                    Privacy Policy
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                    Supabase
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                    Database & Authentication
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                    <a
                      href="https://supabase.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      supabase.com/privacy
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">OpenAI</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                    AI-powered interpretations
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                    <a
                      href="https://openai.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      openai.com/privacy
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                    Razorpay
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                    Payment processing
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                    <a
                      href="https://razorpay.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      razorpay.com/privacy
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">Vercel</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                    Hosting & Analytics
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                    <a
                      href="https://vercel.com/legal/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      vercel.com/legal/privacy-policy
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">Sentry</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                    Error monitoring
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                    <a
                      href="https://sentry.io/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      sentry.io/privacy
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mb-4">
            <strong>We will NEVER:</strong>
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Sell your personal information to third parties</li>
            <li>Share your birth chart data with advertisers</li>
            <li>Use your data for purposes other than those stated in this policy</li>
            <li>Transfer your data outside of secure, compliant service providers</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Your Privacy Rights</h2>
          <p className="mb-3">
            Under Indian law (IT Act 2000) and GDPR (for EU users), you have the following rights:
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">5.1 Access & Portability</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Right to Access:</strong> Request a copy of all personal data we hold about
              you
            </li>
            <li>
              <strong>Data Export:</strong> Download your birth charts, consultation history, and
              account data in JSON format
            </li>
            <li>
              <strong>How to Exercise:</strong> Go to Settings → Export My Data or email{" "}
              <a href="mailto:privacy@jyotishya.com" className="text-blue-600 hover:underline">
                privacy@jyotishya.com
              </a>
            </li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Correction & Update</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Right to Rectification:</strong> Correct inaccurate or incomplete data
            </li>
            <li>
              <strong>How to Exercise:</strong> Update your profile in Settings or contact support
            </li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">5.3 Deletion & Erasure</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Right to be Forgotten:</strong> Request deletion of your account and all
              associated data
            </li>
            <li>
              <strong>Data Retention:</strong> We will delete your data within 30 days of your
              request, except where retention is required by law
            </li>
            <li>
              <strong>How to Exercise:</strong> Go to Settings → Delete Account or email{" "}
              <a href="mailto:privacy@jyotishya.com" className="text-blue-600 hover:underline">
                privacy@jyotishya.com
              </a>
            </li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">5.4 Withdraw Consent</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Marketing Communications:</strong> Unsubscribe from emails at any time
            </li>
            <li>
              <strong>Cookies:</strong> Disable cookies in your browser settings (may affect Service
              functionality)
            </li>
            <li>
              <strong>Analytics:</strong> Opt out of analytics tracking by disabling cookies
            </li>
          </ul>

          <p className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
            <strong>Response Time:</strong> We will respond to all privacy requests within 30 days.
            For urgent requests, please mention "URGENT" in your email subject line.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
          <p className="mb-3">
            We implement industry-standard security measures to protect your data:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Encryption in Transit:</strong> All data transmitted using TLS 1.3 encryption
              (HTTPS)
            </li>
            <li>
              <strong>Encryption at Rest:</strong> Database encrypted using AES-256 (Supabase)
            </li>
            <li>
              <strong>Authentication:</strong> Passwords hashed using bcrypt, support for OAuth 2.0
            </li>
            <li>
              <strong>Access Controls:</strong> Role-based access control (RBAC) for admin functions
            </li>
            <li>
              <strong>Regular Audits:</strong> Quarterly security reviews, vulnerability scanning
            </li>
            <li>
              <strong>Incident Response:</strong> 24-hour breach notification policy via email
            </li>
          </ul>
          <p className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded">
            <strong>Data Breach Notification:</strong> In the unlikely event of a data breach
            affecting your personal information, we will notify you within 72 hours via email and
            display a prominent notice on our Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Cookies & Tracking Technologies</h2>

          <h3 className="text-xl font-semibold mb-3 mt-6">7.1 Types of Cookies We Use</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Essential Cookies:</strong> Required for authentication, session management
              (cannot be disabled)
            </li>
            <li>
              <strong>Analytics Cookies:</strong> Vercel Analytics to understand usage patterns (can
              be disabled)
            </li>
            <li>
              <strong>Preference Cookies:</strong> Remember your language, theme, and settings
            </li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">7.2 Cookie Management</h3>
          <p className="mb-3">You can control cookies through:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Our cookie consent banner (shown on first visit)</li>
            <li>Your browser settings (Chrome: Settings → Privacy → Cookies)</li>
            <li>
              Third-party opt-out:{" "}
              <a
                href="https://www.youronlinechoices.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                youronlinechoices.com
              </a>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
          <p className="mb-4">
            Our Service is NOT intended for users under 18 years of age. We do not knowingly collect
            personal information from children under 18. If you are a parent or guardian and believe
            your child has provided us with personal information, please contact us immediately at{" "}
            <a href="mailto:privacy@jyotishya.com" className="text-blue-600 hover:underline">
              privacy@jyotishya.com
            </a>
            .
          </p>
          <p>
            If we discover that we have collected data from a child under 18 without parental
            consent, we will delete such information within 48 hours.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Data Retention</h2>
          <p className="mb-3">We retain your data for the following periods:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Active Accounts:</strong> Data retained while your account is active
            </li>
            <li>
              <strong>Deleted Accounts:</strong> 30-day grace period, then permanently deleted
            </li>
            <li>
              <strong>Payment Records:</strong> 7 years (as required by Indian tax law)
            </li>
            <li>
              <strong>Usage Logs:</strong> 90 days, then anonymized or deleted
            </li>
            <li>
              <strong>Marketing Emails:</strong> Deleted immediately upon unsubscribe
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. International Data Transfers</h2>
          <p className="mb-4">
            Your data may be transferred to and processed in countries other than India, including
            the United States (Vercel, OpenAI) and Europe (Supabase). These countries may have
            different data protection laws than India.
          </p>
          <p className="mb-4">
            We ensure that all data transfers comply with applicable laws through:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Standard Contractual Clauses (SCCs) with third-party processors</li>
            <li>Privacy Shield certification (where applicable)</li>
            <li>Adequate data protection safeguards as per GDPR Article 46</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Changes to This Privacy Policy</h2>
          <p className="mb-4">
            We may update this Privacy Policy from time to time to reflect changes in our practices,
            technology, legal requirements, or for other operational reasons.
          </p>
          <p className="mb-4">
            <strong>Notification of Changes:</strong>
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Material changes: Email notification + prominent notice on homepage for 30 days</li>
            <li>Minor changes: Updated "Last Updated" date at the top of this page</li>
          </ul>
          <p>
            Continued use of the Service after changes constitutes acceptance of the updated Privacy
            Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
          <p className="mb-4">
            If you have any questions, concerns, or requests regarding this Privacy Policy or our
            data practices, please contact us:
          </p>
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <p className="mb-2">
              <strong>Jyotishya</strong>
            </p>
            <p className="mb-2">
              Email:{" "}
              <a href="mailto:privacy@jyotishya.com" className="text-blue-600 hover:underline">
                privacy@jyotishya.com
              </a>
            </p>
            <p className="mb-2">
              Data Protection Officer:{" "}
              <a href="mailto:dpo@jyotishya.com" className="text-blue-600 hover:underline">
                dpo@jyotishya.com
              </a>
            </p>
            <p className="mb-2">
              Support:{" "}
              <a href="mailto:support@jyotishya.com" className="text-blue-600 hover:underline">
                support@jyotishya.com
              </a>
            </p>
            <p>
              Response Time: Within 48 hours for urgent privacy requests, 7 days for general
              inquiries
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">13. Grievance Redressal (India)</h2>
          <p className="mb-4">
            In accordance with the Information Technology Act, 2000 and rules made thereunder, if
            you have any grievances regarding the processing of your personal data, please contact
            our Grievance Officer:
          </p>
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <p className="mb-2">
              <strong>Grievance Officer</strong>
            </p>
            <p className="mb-2">Name: [To be appointed]</p>
            <p className="mb-2">
              Email:{" "}
              <a href="mailto:grievance@jyotishya.com" className="text-blue-600 hover:underline">
                grievance@jyotishya.com
              </a>
            </p>
            <p>
              Resolution Time: Grievances will be acknowledged within 48 hours and resolved within
              30 days
            </p>
          </div>
        </section>

        <div className="mt-12 pt-8 border-t border-gray-300 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This Privacy Policy was last updated on{" "}
            {new Date().toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            and is effective from January 1, 2025.
          </p>
        </div>
      </div>
    </div>
  );
}
