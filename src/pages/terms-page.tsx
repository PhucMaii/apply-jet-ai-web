import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { APP_NAME } from "@/lib/constants"

export function TermsPage() {
	return (
		<div className="relative z-10 flex min-h-screen flex-col">
			<SiteHeader />
			<main className="mx-auto max-w-3xl flex-1 px-4 py-16 sm:px-6">
				<h1 className="font-display text-3xl font-bold">Terms of service</h1>
				<p className="mt-4 text-sm leading-relaxed text-muted-foreground">
					Placeholder terms for {APP_NAME}. Replace with a version reviewed by
					legal counsel. Cover acceptable use, subscription billing, beta
					features, limitation of liability, and dispute resolution.
				</p>
				<ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
					<li>Pro accounts bill monthly until cancelled.</li>
					<li>The Chrome extension is provided as-is while in active development.</li>
					<li>Users must not misuse automation on third-party career sites.</li>
				</ul>
			</main>
			<SiteFooter />
		</div>
	)
}
