import { HeroSection } from "@/components/landing/hero-section"
import { TrustStrip } from "@/components/landing/trust-strip"
import { HowItWorks } from "@/components/landing/how-it-works"
import { ProductDemo } from "@/components/landing/product-demo"
import { FeaturesSection } from "@/components/landing/features-section"
import { WhySection } from "@/components/landing/why-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { AuthCtaSection } from "@/components/landing/auth-cta-section"
import { FinalCta } from "@/components/landing/final-cta"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"

export function HomePage() {
	return (
		<div className="relative z-10 flex min-h-screen flex-col">
			<SiteHeader />
			<main>
				<HeroSection />
				<TrustStrip />
				<HowItWorks />
				<ProductDemo />
				<FeaturesSection />
				<WhySection />
				<PricingSection />
				<AuthCtaSection />
				<FinalCta />
			</main>
			<SiteFooter />
		</div>
	)
}
