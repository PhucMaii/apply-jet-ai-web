import {
	PricingPlansGrid,
	PricingSectionHeader,
} from "@/components/pricing/pricing-plans-grid"
import { PrivacyTrustLine } from "@/components/landing/privacy-trust-line"
import { LANDING_SECTION_ID } from "@/lib/landing/landing-section"

export function PricingSection() {
	return (
		<section
			id={LANDING_SECTION_ID.pricing}
			className="scroll-mt-20 border-t border-hairline bg-surface py-20 sm:py-28"
		>
			<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
				<PricingSectionHeader variant="landing" />
				<div className="mt-12">
					<PricingPlansGrid variant="landing" />
				</div>
				<PrivacyTrustLine />
			</div>
		</section>
	)
}
