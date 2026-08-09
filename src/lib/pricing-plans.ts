import { ROUTES } from "@/lib/constants"
import { LANDING_COPY } from "@/lib/landing-copy"
import { env } from "@/lib/env"
import type { SubscriptionRow } from "@/types/database"

export type PricingPlanKey =
	| "starter"
	| "pro"
	| "internPack"
	| "juniorPack"
	| "advancedPack"

export type OneTimePackKey = "internPack" | "juniorPack" | "advancedPack"

export type PricingBillingType = "monthly" | "one_time"

export interface PricingPlan {
	key: PricingPlanKey
	billingType: PricingBillingType
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

export const MONTHLY_PRICING_PLAN_ORDER = ["starter", "pro"] as const satisfies readonly PricingPlanKey[]

export const ONE_TIME_PRICING_PLAN_ORDER = [
	"internPack",
	"juniorPack",
	"advancedPack",
] as const satisfies readonly OneTimePackKey[]

export const PRICING_PLAN_ORDER: readonly PricingPlanKey[] = [
	...MONTHLY_PRICING_PLAN_ORDER,
	...ONE_TIME_PRICING_PLAN_ORDER,
]

function planBillingType(key: PricingPlanKey): PricingBillingType {
	return key === "starter" || key === "pro" ? "monthly" : "one_time"
}

function buildPlan(key: PricingPlanKey): PricingPlan {
	return {
		key,
		billingType: planBillingType(key),
		...plans[key],
	}
}

export const MONTHLY_PRICING_PLANS: readonly PricingPlan[] =
	MONTHLY_PRICING_PLAN_ORDER.map(buildPlan)

export const ONE_TIME_PRICING_PLANS: readonly PricingPlan[] =
	ONE_TIME_PRICING_PLAN_ORDER.map(buildPlan)

export const PRICING_PLANS: readonly PricingPlan[] = [
	...MONTHLY_PRICING_PLANS,
	...ONE_TIME_PRICING_PLANS,
]

/** Max feature rows across plans — keeps bullet lists aligned in the grid. */
export const PRICING_MAX_FEATURE_ROWS = Math.max(
	...PRICING_PLANS.map((plan) => plan.features.length),
)

export const MONTHLY_MAX_FEATURE_ROWS = Math.max(
	...MONTHLY_PRICING_PLANS.map((plan) => plan.features.length),
)

export const ONE_TIME_MAX_FEATURE_ROWS = Math.max(
	...ONE_TIME_PRICING_PLANS.map((plan) => plan.features.length),
)

export function getPricingPlan(key: PricingPlanKey): PricingPlan {
	return PRICING_PLANS.find((plan) => plan.key === key)!
}

export function resolveCurrentPlanKey(
	plan: SubscriptionRow["plan"] | null | undefined,
): PricingPlanKey {
	return plan === "pro" ? "pro" : "starter"
}

export function isOneTimePackKey(key: PricingPlanKey): key is OneTimePackKey {
	return (
		key === "internPack" ||
		key === "juniorPack" ||
		key === "advancedPack"
	)
}

function packPriceId(packKey: OneTimePackKey): string {
	switch (packKey) {
		case "internPack":
			return env.stripeInternPackPriceId
		case "juniorPack":
			return env.stripeJuniorPackPriceId
		case "advancedPack":
			return env.stripeAdvancedPackPriceId
	}
}

interface ProfilePlanActionHandlers {
	onSubscribePro: () => void
	onBuyPack: (packKey: OneTimePackKey) => void
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

	if (planKey === "starter") return null

	if (isOneTimePackKey(planKey)) {
		if (currentPlanKey === "pro") return null

		return {
			label: plan.cta ?? `Buy ${plan.name}`,
			onClick: () => handlers.onBuyPack(planKey),
			disabled: billingBusy || !packPriceId(planKey),
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

	if (planKey === "starter") {
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
