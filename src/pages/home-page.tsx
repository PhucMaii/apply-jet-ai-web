import { HeroSection } from "@/components/landing/hero-section"
// import { TryItNowSection } from "@/components/landing/try-it-now-section"
import { TrustStrip } from "@/components/landing/trust-strip"
import { HowItWorks } from "@/components/landing/how-it-works"
import { ExperienceBulletsSection } from "@/components/landing/experience-bullets-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { WhySection } from "@/components/landing/why-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { AuthCtaSection } from "@/components/landing/auth-cta-section"
import { FinalCta } from "@/components/landing/final-cta"
import { MarketingPageShell } from "@/components/layout/marketing-page-shell"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { useUser } from "../../hooks/useUser"
import { useEffect } from "react"

export function HomePage() {
	const { checkAndRegisterVisitor } = useUser();

	useEffect(() => {
		if (checkAndRegisterVisitor) {
			checkAndRegisterVisitor();
		}
	}, [checkAndRegisterVisitor]);

	return (
		<MarketingPageShell className="flex flex-col">
			<SiteHeader />
			<main>
				<HeroSection />
				{/* <TryItNowSection /> */}
				<TrustStrip />
				<HowItWorks />
				<ExperienceBulletsSection />
				<FeaturesSection />
				<WhySection />
				<TestimonialsSection />
				<PricingSection />
				<AuthCtaSection />
				<FinalCta />
			</main>
			<SiteFooter />
		</MarketingPageShell>
	)
}
