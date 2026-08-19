import { useEffect } from "react"
import { LandingPageContent } from "@/components/landing/landing-page-content"
import { RedditAdsPixel } from "@/components/landing/reddit-ads-pixel"
import { MarketingPageShell } from "@/components/layout/marketing-page-shell"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { LandingCopyProvider } from "@/context/landing-copy-context"
import { ADS_LANDING_COPY } from "@/lib/ads-landing-copy"
import { useUser } from "../../hooks/useUser"

/**
 * Paid-ad landing page (`/lp/ads`).
 * Same Canada / PGWP story as the homepage, free-everywhere messaging, no pricing.
 */
export function AdsLandingPage() {
	const { checkAndRegisterVisitor } = useUser()

	useEffect(() => {
		if (checkAndRegisterVisitor) {
			checkAndRegisterVisitor()
		}
	}, [checkAndRegisterVisitor])

	useEffect(() => {
		const previousTitle = document.title
		document.title = ADS_LANDING_COPY.meta.title
		const description = document.querySelector('meta[name="description"]')
		const previousDescription = description?.getAttribute("content") ?? null
		description?.setAttribute("content", ADS_LANDING_COPY.meta.description)

		return () => {
			document.title = previousTitle
			if (description && previousDescription !== null) {
				description.setAttribute("content", previousDescription)
			}
		}
	}, [])

	return (
		<LandingCopyProvider copy={ADS_LANDING_COPY}>
			<RedditAdsPixel />
			<MarketingPageShell className="flex flex-col">
				<SiteHeader />
				<main>
					<LandingPageContent showPricing={false} />
				</main>
				<SiteFooter />
			</MarketingPageShell>
		</LandingCopyProvider>
	)
}
