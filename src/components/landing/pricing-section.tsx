import {
	PricingPlansGrid,
	PricingSectionHeader,
} from "@/components/pricing/pricing-plans-grid"
import { PrivacyTrustLine } from "@/components/landing/privacy-trust-line"

export function PricingSection() {
	return (
		<section id="pricing" className="scroll-mt-24 py-20 sm:py-24">
			<div className="mx-auto max-w-6xl px-4 sm:px-6">
				<PricingSectionHeader variant="landing" />
				<div className="mt-12">
					<PricingPlansGrid variant="landing" />
				</div>
				<PrivacyTrustLine />
			</div>
		</section>
	)
}
