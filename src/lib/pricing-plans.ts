import { ROUTES } from "@/lib/constants"
import { LANDING_COPY } from "@/lib/landing-copy"
import { env } from "@/lib/env"
import type { SubscriptionRow } from "@/types/database"

export type PricingPlanKey = "free" | "jobHuntPack" | "pro"

export interface PricingPlan {
	key: PricingPlanKey
	name: string
	price: string
	period?: string
	desc: string
	features: readonly string[]
	cta?: string
	badge?: string
	ctaSubtext?: string
	highlight?: boolean
}

export interface PricingPlanAction {
	label: string
	onClick?: () => void
	href?: string
	disabled?: boolean
	loading?: boolean
	variant?: "default" | "secondary" | "outline"
}

const { plans } = LANDING_COPY.pricing

export const PRICING_PLAN_ORDER: readonly PricingPlanKey[] = [
	"free",
	"jobHuntPack",
	"pro",
] as const

export const PRICING_PLANS: readonly PricingPlan[] = PRICING_PLAN_ORDER.map(
	(key) => ({
		key,
		...plans[key],
	}),
)

/** Max feature rows across plans — keeps bullet lists aligned in the grid. */
export const PRICING_MAX_FEATURE_ROWS = Math.max(
	...PRICING_PLANS.map((plan) => plan.features.length),
)

export function getPricingPlan(key: PricingPlanKey): PricingPlan {
	return PRICING_PLANS.find((plan) => plan.key === key)!
}

export function resolveCurrentPlanKey(
	plan: SubscriptionRow["plan"] | null | undefined,
): PricingPlanKey {
	return plan === "pro" ? "pro" : "free"
}

interface ProfilePlanActionHandlers {
	onSubscribePro: () => void
	onBuyJobHuntPack: () => void
}

interface ProfilePlanActionOptions {
	billingBusy: boolean
}

export function getProfilePlanAction(
	planKey: PricingPlanKey,
	currentPlanKey: PricingPlanKey,
	handlers: ProfilePlanActionHandlers,
	options: ProfilePlanActionOptions,
): PricingPlanAction | null {
	const { billingBusy } = options
	const plan = getPricingPlan(planKey)

	if (planKey === "free") return null

	if (planKey === "jobHuntPack") {
		if (currentPlanKey === "pro") return null

		return {
			label: plan.cta ?? "Buy Job Hunt Pack",
			onClick: handlers.onBuyJobHuntPack,
			disabled: billingBusy || !env.stripeJobHuntPackPriceId,
			loading: billingBusy,
			variant: plan.highlight ? "default" : "secondary",
		}
	}

	if (currentPlanKey === "pro") return null

	return {
		label: plan.cta ?? "Go Pro",
		onClick: handlers.onSubscribePro,
		disabled: billingBusy || !env.isStripePriceConfigured,
		loading: billingBusy,
		variant: "default",
	}
}

export function getLandingPlanAction(planKey: PricingPlanKey): PricingPlanAction {
	const plan = getPricingPlan(planKey)

	if (planKey === "free") {
		return {
			label: plan.cta ?? "Get started",
			href: ROUTES.signup,
			variant: "default",
		}
	}

	return {
		label: plan.cta ?? "Get started",
		href: ROUTES.signup,
		variant: "outline",
	}
}
