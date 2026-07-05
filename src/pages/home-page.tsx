import { HeroSection } from "@/components/landing/hero-section"
import { TrustStrip } from "@/components/landing/trust-strip"
import { HowItWorks } from "@/components/landing/how-it-works"
import { ExperienceBulletsSection } from "@/components/landing/experience-bullets-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { WhySection } from "@/components/landing/why-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { AuthCtaSection } from "@/components/landing/auth-cta-section"
import { FinalCta } from "@/components/landing/final-cta"
import { MarketingPageShell } from "@/components/layout/marketing-page-shell"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"

export function HomePage() {
	return (
		<MarketingPageShell className="flex flex-col">
			<SiteHeader />
			<main>
				<HeroSection />
				<TrustStrip />
				<HowItWorks />
				<ExperienceBulletsSection />
				<FeaturesSection />
				<WhySection />
				<PricingSection />
				<AuthCtaSection />
				<FinalCta />
			</main>
			<SiteFooter />
		</MarketingPageShell>
	)
}
