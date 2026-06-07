import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { LINKS, SUPPORT_EMAIL } from "@/lib/constants"

export function TermsPage() {
	return (
		<div className="relative z-10 flex min-h-screen flex-col">
			<SiteHeader />
			<div className="min-h-screen bg-white text-gray-900">
  <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8 lg:px-10">
    <div className="mb-10 border-b border-gray-200 pb-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Terms of Service</h1>
      <p className="mt-3 text-sm text-gray-600">Effective Date: 03/04/2026</p>
      <p className="mt-4 text-base leading-7 text-gray-700">
        Welcome to ApplyJet AI. By accessing or using our services, you agree to the following terms. Please read them carefully.
      </p>
    </div>

    <div className="space-y-8">
      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <h2 className="text-xl font-semibold text-gray-900">1. Overview</h2>
        <p className="mt-3 text-base leading-7 text-gray-700">
          ApplyJet AI is a software tool designed to assist users in completing job applications more efficiently through automation and AI-generated content.
          The service helps users autofill application forms, tailor resumes, and generate responses based on user-provided information.
        </p>
        <p className="mt-3 text-base leading-7 text-gray-700">
          ApplyJet AI does not guarantee job offers, interviews, or employment outcomes.
        </p>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-gray-900">2. Eligibility</h2>
        <p className="mt-3 text-base leading-7 text-gray-700">
          You must be at least 18 years old, or the age of majority in your jurisdiction, to use ApplyJet AI. By using the service, you confirm that the
          information you provide is accurate and that you are legally able to enter into this agreement.
        </p>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <h2 className="text-xl font-semibold text-gray-900">3. User Responsibilities</h2>
        <p className="mt-3 text-base leading-7 text-gray-700">You are responsible for:</p>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-7 text-gray-700">
          <li>Providing accurate and truthful information in your resume and applications</li>
          <li>Reviewing all AI-generated content before submission</li>
          <li>Ensuring that submitted applications comply with employer requirements</li>
        </ul>
        <p className="mt-4 text-base leading-7 text-gray-700">
          ApplyJet AI is a tool to assist you. You are solely responsible for the content you submit to employers.
        </p>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-gray-900">4. AI-Generated Content</h2>
        <p className="mt-3 text-base leading-7 text-gray-700">
          ApplyJet AI generates content based on user inputs and job descriptions. While we aim to provide helpful and relevant suggestions:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-7 text-gray-700">
          <li>Outputs may not always be accurate, complete, or appropriate</li>
          <li>Users must review and edit content before use</li>
          <li>We do not take responsibility for outcomes resulting from generated content</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <h2 className="text-xl font-semibold text-gray-900">5. Data Usage &amp; Privacy</h2>
        <p className="mt-3 text-base leading-7 text-gray-700">
          ApplyJet AI processes user-provided data, such as resume content and job descriptions, solely to provide core functionality, including autofill
          and content generation.
        </p>
        <p className="mt-3 text-base leading-7 text-gray-700">
          We do not sell personal data. Data is only processed when initiated by the user.
        </p>
        <p className="mt-3 text-base leading-7 text-gray-700">
          For more details, please refer to our Privacy Policy.
        </p>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-gray-900">6. Subscription &amp; Billing</h2>
        <p className="mt-3 text-base leading-7 text-gray-700">
          ApplyJet AI offers paid subscription plans that provide access to premium features.
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-7 text-gray-700">
          <li>Subscriptions may be billed on a recurring basis, such as monthly or yearly</li>
          <li>You may cancel your subscription at any time</li>
          <li>Access will continue until the end of the current billing period</li>
        </ul>
        <p className="mt-4 text-base leading-7 text-gray-700">
          Fees are non-refundable unless required by law.
        </p>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <h2 className="text-xl font-semibold text-gray-900">7. Acceptable Use</h2>
        <p className="mt-3 text-base leading-7 text-gray-700">You agree not to:</p>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-7 text-gray-700">
          <li>Use the service for fraudulent, misleading, or unlawful job applications</li>
          <li>Misrepresent your identity, qualifications, or experience</li>
          <li>Attempt to reverse engineer, exploit, or disrupt the service</li>
        </ul>
        <p className="mt-4 text-base leading-7 text-gray-700">
          We reserve the right to suspend or terminate accounts that violate these terms.
        </p>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-gray-900">8. Limitation of Liability</h2>
        <p className="mt-3 text-base leading-7 text-gray-700">
          ApplyJet AI is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind, whether express or implied.
        </p>
        <p className="mt-3 text-base leading-7 text-gray-700">We are not responsible for:</p>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-7 text-gray-700">
          <li>Job application outcomes</li>
          <li>Employment decisions made by third parties</li>
          <li>Errors, delays, interruptions, or unavailability of the service</li>
        </ul>
        <p className="mt-4 text-base leading-7 text-gray-700">
          To the fullest extent permitted by law, ApplyJet AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
        </p>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <h2 className="text-xl font-semibold text-gray-900">9. Termination</h2>
        <p className="mt-3 text-base leading-7 text-gray-700">
          We may suspend or terminate access to the service at any time if users violate these terms or misuse the platform.
        </p>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-gray-900">10. Changes to Terms</h2>
        <p className="mt-3 text-base leading-7 text-gray-700">
          We may update these Terms from time to time. Continued use of the service after changes become effective means you accept the updated terms.
        </p>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <h2 className="text-xl font-semibold text-gray-900">11. Contact</h2>
        <p className="mt-3 text-base leading-7 text-gray-700">
          If you have any questions about these Terms, please contact us at:
        </p>
        <a
          href={LINKS.contactMail}
          className="mt-3 inline-block text-base font-medium text-gray-900 underline-offset-4 hover:underline"
        >
          {SUPPORT_EMAIL}
        </a>
      </section>
    </div>
  </div>
</div>
			<SiteFooter />
		</div>
	)
}
