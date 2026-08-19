import { useEffect } from "react"
import { LandingPageContent } from "@/components/landing/landing-page-content"
import { MarketingPageShell } from "@/components/layout/marketing-page-shell"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { useUser } from "../../hooks/useUser"

export function HomePage() {
	const { checkAndRegisterVisitor } = useUser()

	useEffect(() => {
		if (checkAndRegisterVisitor) {
			checkAndRegisterVisitor()
		}
	}, [checkAndRegisterVisitor])

	return (
		<MarketingPageShell className="flex flex-col">
			<SiteHeader />
			<main>
				<LandingPageContent showPricing />
			</main>
			<SiteFooter />
		</MarketingPageShell>
	)
}
