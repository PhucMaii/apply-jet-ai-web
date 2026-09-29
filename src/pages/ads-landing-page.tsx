import { useEffect } from "react"
import { LandingPageContent } from "@/components/landing/landing-page-content"
import { RedditAdsPixel } from "@/components/landing/reddit-ads-pixel"
import { MarketingPageShell } from "@/components/layout/marketing-page-shell"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { LandingCopyProvider } from "@/context/landing-copy-context"
import { ADS_LANDING_COPY } from "@/lib/ads-landing-copy"
import { applyLandingFeatureFlags } from "@/lib/landing-copy-features"
import { useUser } from "../../hooks/useUser"

/**
 * Paid-ad landing page (`/lp/ads`).
 * Free-everywhere messaging, jobs-focused when PGWP is disabled.
 */
export function AdsLandingPage() {
	const { checkAndRegisterVisitor } = useUser()
	const landingCopy = applyLandingFeatureFlags(ADS_LANDING_COPY)

	useEffect(() => {
		if (checkAndRegisterVisitor) {
			checkAndRegisterVisitor()
		}
	}, [checkAndRegisterVisitor])

	useEffect(() => {
		const previousTitle = document.title
		document.title = landingCopy.meta.title
		const description = document.querySelector('meta[name="description"]')
		const previousDescription = description?.getAttribute("content") ?? null
		description?.setAttribute("content", landingCopy.meta.description)

		return () => {
			document.title = previousTitle
			if (description && previousDescription !== null) {
				description.setAttribute("content", previousDescription)
			}
		}
	}, [landingCopy.meta.description, landingCopy.meta.title])

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
