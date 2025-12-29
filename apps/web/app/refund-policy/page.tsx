import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | Jyotishya",
  description: "Cancellation and refund policy for Jyotishya subscriptions and consultations",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="container max-w-4xl py-12 px-4">
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-6">Refund & Cancellation Policy</h1>
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
          <h2 className="text-2xl font-semibold mb-4">1. Overview</h2>
          <p className="mb-4">
            At Jyotishya, we strive to provide high-quality astrological services. This Refund
            Policy explains the terms and conditions for cancellations and refunds for our
            subscription plans and consultation bookings.
          </p>
          <p className="mb-4">
            This policy is designed to be fair to both users and our business, while complying with
            Indian consumer protection laws and Razorpay payment gateway requirements.
          </p>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
            <p className="font-semibold mb-2">Important Note:</p>
            <p>
              All refunds are processed through Razorpay to the original payment method used during
              purchase. Refund processing time is 5-7 business days from the date of approval.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Subscription Refund Policy</h2>

          <h3 className="text-xl font-semibold mb-3 mt-6">2.1 7-Day Money-Back Guarantee</h3>
          <p className="mb-4">
            We offer a <strong>7-day money-back guarantee</strong> for first-time subscribers to
            Premium and Pro plans. You are eligible for a full refund if you cancel within 7 days of
            your initial subscription and meet the following conditions:
          </p>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <h4 className="font-semibold mb-2">✅ Eligible for Refund:</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Service Unavailability:</strong> The Service was unavailable for more than
                50% of the time during your 7-day period
              </li>
              <li>
                <strong>Feature Non-Delivery:</strong> Key features described in your plan (e.g., AI
                interpretations, unlimited charts) did not work as advertised
              </li>
              <li>
                <strong>Technical Issues:</strong> Critical bugs prevented you from using core
                features despite our support efforts to resolve them
              </li>
              <li>
                <strong>First-Time Subscriber:</strong> This is your first paid subscription to
                Jyotishya (upgrading from Free tier)
              </li>
            </ul>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
            <h4 className="font-semibold mb-2">❌ NOT Eligible for Refund:</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Buyer's Remorse:</strong> "I changed my mind" or "I don't need astrology
                anymore"
              </li>
              <li>
                <strong>Dissatisfaction with Predictions:</strong> "The horoscope wasn't accurate"
                or "I didn't like the AI interpretation"
              </li>
              <li>
                <strong>User Error:</strong> Incorrect birth details provided by you resulting in
                inaccurate charts
              </li>
              <li>
                <strong>Used Service Extensively:</strong> Generated more than 10 charts or used the
                Service extensively during the 7-day period
              </li>
              <li>
                <strong>Repeat Subscriber:</strong> You have subscribed, canceled, and re-subscribed
                before
              </li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Cancellation Policy</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Cancel Anytime:</strong> You can cancel your subscription at any time from
              your Account Settings
            </li>
            <li>
              <strong>Access Until Period End:</strong> After cancellation, you retain full access
              to premium features until the end of your current billing period
            </li>
            <li>
              <strong>No Partial Refunds:</strong> Canceling mid-cycle does not entitle you to a
              prorated refund for unused days
            </li>
            <li>
              <strong>Auto-Renewal Stops:</strong> Your subscription will not renew for the next
              billing cycle
            </li>
            <li>
              <strong>Downgrade to Free:</strong> After your paid period ends, your account
              automatically downgrades to the Free tier
            </li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">2.3 How to Cancel Your Subscription</h3>
          <ol className="list-decimal pl-6 mb-4 space-y-2">
            <li>Log in to your Jyotishya account</li>
            <li>
              Go to <strong>Settings</strong> → <strong>Subscription</strong>
            </li>
            <li>
              Click <strong>"Cancel Subscription"</strong>
            </li>
            <li>Select a reason for cancellation (optional feedback)</li>
            <li>Confirm cancellation</li>
            <li>You will receive a confirmation email within 5 minutes</li>
          </ol>

          <h3 className="text-xl font-semibold mb-3 mt-6">
            2.4 How to Request a Refund (7-Day Window)
          </h3>
          <ol className="list-decimal pl-6 mb-4 space-y-2">
            <li>
              Email{" "}
              <a href="mailto:refunds@jyotishya.com" className="text-blue-600 hover:underline">
                refunds@jyotishya.com
              </a>{" "}
              within 7 days of purchase
            </li>
            <li>Include your account email, subscription plan, and reason for refund request</li>
            <li>
              Provide evidence if claiming service unavailability or feature non-delivery
              (screenshots, error messages)
            </li>
            <li>Our team will review your request within 48 hours</li>
            <li>If approved, refund will be processed within 5-7 business days</li>
          </ol>

          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm">
              <strong>Refund Processing Time:</strong> Razorpay processes refunds within 5-7
              business days. The exact time for the refund to reflect in your account depends on
              your bank or payment provider (typically 7-10 business days total).
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Consultation Refund Policy</h2>

          <h3 className="text-xl font-semibold mb-3 mt-6">
            3.1 Cancellation by User (Before Session)
          </h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>24+ Hours Before:</strong> Full refund (100%) if you cancel at least 24 hours
              before the scheduled session
            </li>
            <li>
              <strong>12-24 Hours Before:</strong> 50% refund (50% cancellation fee applies)
            </li>
            <li>
              <strong>Less than 12 Hours:</strong> No refund (100% cancellation fee applies)
            </li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Astrologer No-Show</h3>
          <p className="mb-4">
            If the astrologer does not show up for your scheduled consultation:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Full Refund:</strong> 100% refund of the consultation fee
            </li>
            <li>
              <strong>Bonus Credit:</strong> Additional ₹200 account credit for the inconvenience
            </li>
            <li>
              <strong>Priority Rebooking:</strong> Priority access to rebook with another verified
              astrologer
            </li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">3.3 User No-Show</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>No Refund:</strong> If you miss your scheduled consultation without prior
              cancellation, no refund is provided
            </li>
            <li>
              <strong>Grace Period:</strong> Astrologers will wait up to 10 minutes for you to join
            </li>
            <li>
              <strong>Rescheduling:</strong> If you notify us within 1 hour of the scheduled time,
              we may offer a one-time reschedule (subject to astrologer availability)
            </li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">3.4 Dissatisfaction with Consultation</h3>
          <p className="mb-4">
            We carefully vet all astrologers on our platform. However, if you are dissatisfied with
            your consultation quality:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Report Issue:</strong> Contact{" "}
              <a href="mailto:support@jyotishya.com" className="text-blue-600 hover:underline">
                support@jyotishya.com
              </a>{" "}
              within 24 hours of the session
            </li>
            <li>
              <strong>Valid Complaints:</strong> Astrologer was rude, session ended early, or
              significant technical issues disrupted the session
            </li>
            <li>
              <strong>Refund Discretion:</strong> Refunds for quality issues are reviewed
              case-by-case at our sole discretion
            </li>
            <li>
              <strong>Not Eligible:</strong> "I didn't like the prediction" or "The astrologer's
              style didn't match my preference" are not valid refund reasons
            </li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">3.5 How to Cancel a Consultation</h3>
          <ol className="list-decimal pl-6 mb-4 space-y-2">
            <li>
              Go to <strong>My Consultations</strong>
            </li>
            <li>Find the upcoming consultation</li>
            <li>
              Click <strong>"Cancel Booking"</strong>
            </li>
            <li>Select a reason (optional)</li>
            <li>Confirm cancellation</li>
            <li>
              Refund (if applicable) will be processed automatically based on the timing of your
              cancellation
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Refund Process & Timeline</h2>

          <h3 className="text-xl font-semibold mb-3 mt-6">4.1 Automatic Refunds</h3>
          <p className="mb-4">
            The following refunds are processed automatically without requiring manual approval:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Consultation canceled 24+ hours before session</li>
            <li>Astrologer no-show (after verification)</li>
            <li>Duplicate payment (technical error)</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Manual Review Required</h3>
          <p className="mb-4">
            The following refund requests require manual review by our team (48-hour response time):
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>7-day money-back guarantee claims</li>
            <li>Consultation quality complaints</li>
            <li>Service unavailability claims</li>
            <li>Disputed charges</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">4.3 Refund Timeline</h3>

          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border border-gray-300 dark:border-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">
                    Step
                  </th>
                  <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">
                    Timeframe
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                    Request submission
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                    Immediate (email confirmation sent)
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                    Review & approval
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                    24-48 hours (business days)
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                    Razorpay processing
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                    5-7 business days
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                    Bank credit
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                    2-3 business days (depends on bank)
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 font-semibold">
                    Total time
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 font-semibold">
                    7-14 business days
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-semibold mb-3 mt-6">4.4 Refund Methods</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Original Payment Method:</strong> Refunds are issued to the original payment
              method used (credit card, debit card, UPI, net banking)
            </li>
            <li>
              <strong>No Cash Refunds:</strong> We do not provide cash refunds or bank transfers
            </li>
            <li>
              <strong>Account Credit Option:</strong> For consultation refunds, you may opt for
              instant account credit instead of a refund (credited immediately)
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Chargebacks & Disputed Charges</h2>

          <h3 className="text-xl font-semibold mb-3 mt-6">5.1 Contact Us First</h3>
          <p className="mb-4">
            Before initiating a chargeback with your bank, please contact us at{" "}
            <a href="mailto:refunds@jyotishya.com" className="text-blue-600 hover:underline">
              refunds@jyotishya.com
            </a>
            . We are committed to resolving billing issues quickly and fairly.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Chargeback Consequences</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Account Suspension:</strong> Initiating a chargeback may result in immediate
              account suspension
            </li>
            <li>
              <strong>Evidence Submission:</strong> We will submit evidence to your bank showing
              that the charge was legitimate and services were delivered
            </li>
            <li>
              <strong>Fees:</strong> If the chargeback is found to be invalid, you may be liable for
              chargeback processing fees (₹500-₹1,000)
            </li>
            <li>
              <strong>Future Access:</strong> Accounts with invalid chargebacks may be permanently
              banned from using Jyotishya
            </li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">5.3 Valid Chargeback Scenarios</h3>
          <p className="mb-4">
            We understand that chargebacks may be necessary in the following situations:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Unauthorized Charges:</strong> Your credit card was used without your
              permission
            </li>
            <li>
              <strong>No Response:</strong> We failed to respond to your refund request within 7
              business days
            </li>
            <li>
              <strong>Service Not Delivered:</strong> You paid for a subscription but never received
              access to premium features
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Exceptions & Special Cases</h2>

          <h3 className="text-xl font-semibold mb-3 mt-6">6.1 Extended Service Outages</h3>
          <p className="mb-4">
            If the Service experiences an outage lasting more than 72 consecutive hours:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Premium subscribers will receive a prorated account credit for the downtime</li>
            <li>Active consultation bookings will be rescheduled at no additional charge</li>
            <li>
              Users may request a full refund of their current billing period if the outage persists
              beyond 7 days
            </li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">6.2 Account Termination by Jyotishya</h3>
          <p className="mb-4">If we terminate your account for violating our Terms of Service:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>No Refund:</strong> Subscription fees are non-refundable in case of
              termination due to policy violations
            </li>
            <li>
              <strong>Unused Consultations:</strong> Prepaid consultations that have not occurred
              will be refunded
            </li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">6.3 Death or Serious Illness</h3>
          <p className="mb-4">
            In cases of user death or serious illness preventing use of the Service:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              Family members or legal representatives may contact us with supporting documentation
              (death certificate, medical records)
            </li>
            <li>We will provide a prorated refund for the unused portion of the subscription</li>
            <li>Consultation refunds will be processed in full</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Non-Refundable Items</h2>
          <p className="mb-4">
            The following are <strong>strictly non-refundable</strong>:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Completed Consultations:</strong> Live consultations that have already
              occurred
            </li>
            <li>
              <strong>Downloaded Content:</strong> Birth charts you have saved or downloaded
            </li>
            <li>
              <strong>Account Credits:</strong> Promotional credits or bonus credits cannot be
              refunded for cash
            </li>
            <li>
              <strong>Third-Party Purchases:</strong> Payments made to third-party astrologers
              outside our platform
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Contact for Refund Requests</h2>
          <p className="mb-4">
            For refund requests, questions, or concerns about this policy, please contact:
          </p>
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <p className="mb-2">
              <strong>Refund Support</strong>
            </p>
            <p className="mb-2">
              Email:{" "}
              <a href="mailto:refunds@jyotishya.com" className="text-blue-600 hover:underline">
                refunds@jyotishya.com
              </a>
            </p>
            <p className="mb-2">
              Support:{" "}
              <a href="mailto:support@jyotishya.com" className="text-blue-600 hover:underline">
                support@jyotishya.com
              </a>
            </p>
            <p className="mb-2">Phone: [To be added]</p>
            <p>Response Time: 48 hours for refund requests, 24 hours for urgent issues</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Changes to This Policy</h2>
          <p className="mb-4">
            We reserve the right to modify this Refund Policy at any time. Material changes will be
            communicated via:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Email notification to active subscribers</li>
            <li>Prominent notice on the homepage for 30 days</li>
            <li>Update to the "Last Updated" date at the top of this page</li>
          </ul>
          <p className="mb-4">
            The updated policy will apply to all purchases made after the effective date of the
            change. Purchases made before the change will be governed by the policy in effect at the
            time of purchase.
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-gray-300 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This Refund Policy was last updated on{" "}
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
