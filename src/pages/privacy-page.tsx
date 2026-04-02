import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { APP_NAME } from "@/lib/constants"

export function PrivacyPage() {
	return (
		<div className="relative z-10 flex min-h-screen flex-col">
			<SiteHeader />
			<main className="mx-auto max-w-3xl flex-1 px-4 py-16 sm:px-6">
				<h1 className="font-display text-3xl font-bold">Privacy policy</h1>
				<p className="mt-4 text-sm leading-relaxed text-muted-foreground">
					This placeholder outlines how {APP_NAME} intends to treat user data.
					Replace with counsel-reviewed legal copy before launch. Resume files,
					authentication metadata, and application telemetry should be described
					here with retention windows, subprocessors, and user rights.
				</p>
				<ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
					<li>Data stored in Supabase (Postgres + Storage) under your project.</li>
					<li>Edge functions should log minimally and avoid PII in plaintext.</li>
					<li>Users can request export/delete via your support channel.</li>
				</ul>
			</main>
			<SiteFooter />
		</div>
	)
}
