import { AuthCtaSection } from "@/components/landing/auth-cta-section"
import { BuiltForCanadaSection } from "@/components/landing/built-for-canada-section"
import { ExperienceBulletsSection } from "@/components/landing/experience-bullets-section"
import { FaqSection } from "@/components/landing/faq-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { FinalCta } from "@/components/landing/final-cta"
import { HeroSection } from "@/components/landing/hero-section"
import { HowItWorks } from "@/components/landing/how-it-works"
import { PgwpFeatureSection } from "@/components/landing/pgwp-feature-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { TrustStrip } from "@/components/landing/trust-strip"
import { WhySection } from "@/components/landing/why-section"

interface LandingPageContentProps {
	showPricing?: boolean
}

export function LandingPageContent({
	showPricing = true,
}: LandingPageContentProps) {
	return (
		<>
			<HeroSection />
			<TrustStrip />
			<PgwpFeatureSection />
			<HowItWorks />
			<ExperienceBulletsSection />
			<BuiltForCanadaSection />
			<FeaturesSection />
			<WhySection />
			<TestimonialsSection />
			{showPricing ? <PricingSection /> : null}
			<FaqSection />
			<AuthCtaSection />
			<FinalCta />
		</>
	)
}
