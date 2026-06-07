import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { LINKS, SUPPORT_EMAIL } from "@/lib/constants"

export function PrivacyPage() {
	return (
		<div className="relative z-10 flex min-h-screen flex-col">
			<SiteHeader />
				<div className="min-h-screen bg-white text-gray-900">
					<div className="mx-auto max-w-4xl px-6 py-12 sm:px-8 lg:px-10">
						<div className="mb-10 border-b border-gray-200 pb-6">
							<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
								Privacy Policy
							</h1>
							<p className="mt-3 text-sm text-gray-600">
								Effective Date: 03/04/2026
							</p>
							<p className="mt-4 text-base leading-7 text-gray-700">
								ApplyJet AI respects your privacy and is committed to protecting
								your personal information. This Privacy Policy explains how we
								collect, use, store, and protect information when you use our
								website, Chrome extension, and related services.
							</p>
						</div>

						<div className="space-y-8">
							<section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
								<h2 className="text-xl font-semibold text-gray-900">
									1. Information We Collect
								</h2>
								<p className="mt-3 text-base leading-7 text-gray-700">
									We may collect the following types of information:
								</p>
								<ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-7 text-gray-700">
									<li>
										Account information such as your name, email address, and login
										credentials
									</li>
									<li>
										Resume content, work experience, education history, skills, and
										other information you choose to provide
									</li>
									<li>
										Job descriptions, application questions, and related job
										application content submitted by you
									</li>
									<li>
										User preferences, settings, and saved responses
									</li>
									<li>
										Payment and subscription information processed through third-party
										payment providers such as Stripe
									</li>
									<li>
										Technical information such as browser type, extension version,
										device data, and basic usage logs necessary to operate and secure
										the service
									</li>
								</ul>
							</section>

							<section className="rounded-2xl border border-gray-200 bg-white p-6">
								<h2 className="text-xl font-semibold text-gray-900">
									2. How We Use Your Information
								</h2>
								<p className="mt-3 text-base leading-7 text-gray-700">
									We use your information to provide and improve ApplyJet AI,
									including to:
								</p>
								<ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-7 text-gray-700">
									<li>Create and manage your account</li>
									<li>
										Autofill job application forms using information you provide
									</li>
									<li>
										Generate tailored resumes, application responses, and other
										AI-assisted content
									</li>
									<li>
										Save your preferences and improve your experience across sessions
									</li>
									<li>Process subscriptions, billing, and account access</li>
									<li>
										Maintain platform security, detect abuse, and troubleshoot issues
									</li>
									<li>
										Communicate with you about service updates, support, and account
										matters
									</li>
								</ul>
							</section>

							<section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
								<h2 className="text-xl font-semibold text-gray-900">
									3. How ApplyJet AI Processes Data
								</h2>
								<p className="mt-3 text-base leading-7 text-gray-700">
									ApplyJet AI processes user-provided content, such as resumes, job
									descriptions, and application questions, in order to deliver core
									features like autofill, resume tailoring, and AI-generated
									responses.
								</p>
								<p className="mt-3 text-base leading-7 text-gray-700">
									Data processing is initiated by the user. ApplyJet AI does not
									collect unrelated browsing activity and does not monitor websites
									unless required to support the extension’s job application
									functionality.
								</p>
							</section>

							<section className="rounded-2xl border border-gray-200 bg-white p-6">
								<h2 className="text-xl font-semibold text-gray-900">
									4. Sharing of Information
								</h2>
								<p className="mt-3 text-base leading-7 text-gray-700">
									We do not sell your personal information. We may share limited
									information only in the following circumstances:
								</p>
								<ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-7 text-gray-700">
									<li>
										With service providers that help us operate the platform, such as
										hosting, authentication, database, AI processing, analytics, and
										payment services
									</li>
									<li>
										When required by law, regulation, legal process, or government
										request
									</li>
									<li>
										To protect the rights, safety, and security of our users, our
										platform, or the public
									</li>
									<li>
										In connection with a merger, acquisition, financing, or sale of
										assets, subject to appropriate safeguards
									</li>
								</ul>
							</section>

							<section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
								<h2 className="text-xl font-semibold text-gray-900">
									5. Data Storage and Security
								</h2>
								<p className="mt-3 text-base leading-7 text-gray-700">
									We use reasonable administrative, technical, and organizational
									safeguards to protect your information. However, no system can be
									guaranteed to be completely secure, and we cannot guarantee
									absolute security.
								</p>
								<p className="mt-3 text-base leading-7 text-gray-700">
									You are responsible for maintaining the confidentiality of your
									account credentials and for reviewing generated content before
									submitting it to employers.
								</p>
							</section>

							<section className="rounded-2xl border border-gray-200 bg-white p-6">
								<h2 className="text-xl font-semibold text-gray-900">
									6. Data Retention
								</h2>
								<p className="mt-3 text-base leading-7 text-gray-700">
									We retain personal information for as long as reasonably necessary
									to provide the service, comply with legal obligations, resolve
									disputes, enforce agreements, and maintain business records.
								</p>
								<p className="mt-3 text-base leading-7 text-gray-700">
									If you delete your account, we will take reasonable steps to
									delete or anonymize your information, except where retention is
									required by law or for legitimate business purposes.
								</p>
							</section>

							<section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
								<h2 className="text-xl font-semibold text-gray-900">
									7. Your Choices and Rights
								</h2>
								<p className="mt-3 text-base leading-7 text-gray-700">
									Depending on your location, you may have rights to access, update,
									correct, or delete your personal information. You may also have
									the right to withdraw consent or request a copy of your data where
									applicable by law.
								</p>
								<p className="mt-3 text-base leading-7 text-gray-700">
									To make a privacy-related request, contact us using the contact
									information below.
								</p>
							</section>

							<section className="rounded-2xl border border-gray-200 bg-white p-6">
								<h2 className="text-xl font-semibold text-gray-900">
									8. Cookies and Similar Technologies
								</h2>
								<p className="mt-3 text-base leading-7 text-gray-700">
									Our website may use cookies or similar technologies to support
									authentication, remember preferences, analyze traffic, and improve
									performance. You can manage cookie settings through your browser
									preferences where available.
								</p>
							</section>

							<section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
								<h2 className="text-xl font-semibold text-gray-900">
									9. Third-Party Services
								</h2>
								<p className="mt-3 text-base leading-7 text-gray-700">
									ApplyJet AI may rely on third-party services such as payment
									processors, hosting providers, authentication providers, and AI
									infrastructure providers. Your use of those third-party services
									may also be subject to their own terms and privacy policies.
								</p>
							</section>

							<section className="rounded-2xl border border-gray-200 bg-white p-6">
								<h2 className="text-xl font-semibold text-gray-900">
									10. Children’s Privacy
								</h2>
								<p className="mt-3 text-base leading-7 text-gray-700">
									ApplyJet AI is not intended for children under the age of 13, or
									under a higher minimum age where required by local law. We do not
									knowingly collect personal information from children.
								</p>
							</section>

							<section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
								<h2 className="text-xl font-semibold text-gray-900">
									11. Changes to This Privacy Policy
								</h2>
								<p className="mt-3 text-base leading-7 text-gray-700">
									We may update this Privacy Policy from time to time. When we do,
									we will revise the effective date above. Continued use of the
									service after the updated policy becomes effective means you accept
									the revised Privacy Policy.
								</p>
							</section>

							<section className="rounded-2xl border border-gray-200 bg-white p-6">
								<h2 className="text-xl font-semibold text-gray-900">
									12. Contact Us
								</h2>
								<p className="mt-3 text-base leading-7 text-gray-700">
									If you have any questions, requests, or concerns about this
									Privacy Policy, please contact us at:
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
