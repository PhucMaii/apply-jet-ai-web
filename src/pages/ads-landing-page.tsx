import { useEffect } from "react"
import { HeroSection } from "@/components/landing/hero-section"
import { TrustStrip } from "@/components/landing/trust-strip"
import { HowItWorks } from "@/components/landing/how-it-works"
import { ExperienceBulletsSection } from "@/components/landing/experience-bullets-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { WhySection } from "@/components/landing/why-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { AuthCtaSection } from "@/components/landing/auth-cta-section"
import { FinalCta } from "@/components/landing/final-cta"
import { RedditAdsPixel } from "@/components/landing/reddit-ads-pixel"
import { MarketingPageShell } from "@/components/layout/marketing-page-shell"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { LandingCopyProvider } from "@/context/landing-copy-context"
import { ADS_LANDING_COPY } from "@/lib/ads-landing-copy"
import { useUser } from "../../hooks/useUser"

/**
 * Paid-ad landing page (`/lp/ads`).
 * Same product story as the homepage, free-everywhere messaging, no pricing.
 * Includes Reddit Ads pixel for campaign attribution.
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
					<HeroSection />
					<TrustStrip />
					<HowItWorks />
					<ExperienceBulletsSection />
					<FeaturesSection />
					<WhySection />
					<TestimonialsSection />
					<AuthCtaSection />
					<FinalCta />
				</main>
				<SiteFooter />
			</MarketingPageShell>
		</LandingCopyProvider>
	)
}
