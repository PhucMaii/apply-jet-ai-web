import {
	PricingPlansGrid,
	PricingSectionHeader,
} from "@/components/pricing/pricing-plans-grid"

export function PricingSection() {
	return (
		<section id="pricing" className="scroll-mt-24 py-20 sm:py-24">
			<div className="mx-auto max-w-6xl px-4 sm:px-6">
				<PricingSectionHeader variant="landing" />
				<div className="mt-12">
					<PricingPlansGrid variant="landing" />
				</div>
			</div>
		</section>
	)
}
