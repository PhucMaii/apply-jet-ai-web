import { HeroSection } from "@/components/landing/hero-section"
import { ExperienceBulletsSection } from "@/components/landing/experience-bullets-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { FinalCta } from "@/components/landing/final-cta"
import { MarketingPageShell } from "@/components/layout/marketing-page-shell"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"

/**
 * Condensed landing page for paid ad traffic.
 * Point ad campaigns to `/lp/ads` instead of the full homepage.
 */
export function AdsLandingPage() {
	return (
		<MarketingPageShell className="flex flex-col">
			<SiteHeader />
			<main>
				<HeroSection />
				<ExperienceBulletsSection variant="condensed" />
				<TestimonialsSection />
				<PricingSection />
				<FinalCta />
			</main>
			<SiteFooter />
		</MarketingPageShell>
	)
}
