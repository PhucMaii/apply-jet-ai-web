import { useLandingCopy } from "@/context/landing-copy-context"
import {
	getLandingPlanAction,
	getProfilePlanAction,
	MONTHLY_PRICING_PLANS,
	ONE_TIME_PRICING_PLANS,
	resolveCurrentPlanKey,
	type OneTimePackKey,
	type PricingPlan,
	type PricingPlanKey,
} from "@/lib/pricing-plans"
import type { SubscriptionRow } from "@/types/database"
import { cn } from "@/lib/utils"
import {
	PricingPlanCard,
	type PricingPlanCardVariant,
} from "./pricing-plan-card"

interface PricingPlansGridBaseProps {
	variant: PricingPlanCardVariant
	className?: string
}

interface LandingPricingPlansGridProps extends PricingPlansGridBaseProps {
	variant: "landing"
}

interface ProfilePricingPlansGridProps extends PricingPlansGridBaseProps {
	variant: "profile"
	subscription: SubscriptionRow | null
	billingBusy: boolean
	onSubscribePro: () => void
	onBuyPack: (packKey: OneTimePackKey) => void
}

export type PricingPlansGridProps =
	| LandingPricingPlansGridProps
	| ProfilePricingPlansGridProps

function PlanGroup({
	title,
	plans,
	variant,
	gridClassName,
	currentPlanKey,
	getAction,
}: {
	title: string
	plans: readonly PricingPlan[]
	variant: PricingPlanCardVariant
	gridClassName: string
	currentPlanKey: PricingPlanKey | null
	getAction: (planKey: PricingPlanKey) => ReturnType<
		typeof getLandingPlanAction
	> | null
}) {
	return (
		<div className="space-y-4">
			<h3
				className={cn(
					"text-sm font-semibold uppercase tracking-wider",
					variant === "landing" ? "text-primary" : "text-neutral-500",
				)}
			>
				{title}
			</h3>
			<div className={cn("grid items-stretch gap-5", gridClassName)}>
				{plans.map((plan, index) => {
					const isCurrentPlan =
						variant === "profile" && plan.key === currentPlanKey

					return (
						<PricingPlanCard
							key={plan.key}
							plan={plan}
							variant={variant}
							action={getAction(plan.key)}
							isCurrentPlan={isCurrentPlan}
							animationIndex={index}
						/>
					)
				})}
			</div>
		</div>
	)
}

export function PricingPlansGrid(props: PricingPlansGridProps) {
	const { variant, className } = props
	const { pricing } = useLandingCopy()
	const currentPlanKey =
		variant === "profile"
			? resolveCurrentPlanKey(props.subscription?.plan)
			: null

	const getAction = (planKey: PricingPlanKey) => {
		if (variant === "landing") {
			return getLandingPlanAction(planKey)
		}

		return getProfilePlanAction(
			planKey,
			currentPlanKey!,
			{
				onSubscribePro: props.onSubscribePro,
				onBuyPack: props.onBuyPack,
			},
			{ billingBusy: props.billingBusy },
		)
	}

	return (
		<div className={cn("space-y-10", className)}>
			<PlanGroup
				title={pricing.monthlyLabel}
				plans={MONTHLY_PRICING_PLANS}
				variant={variant}
				gridClassName="lg:grid-cols-2"
				currentPlanKey={currentPlanKey}
				getAction={getAction}
			/>
			<PlanGroup
				title={pricing.oneTimeLabel}
				plans={ONE_TIME_PRICING_PLANS}
				variant={variant}
				gridClassName="lg:grid-cols-3"
				currentPlanKey={currentPlanKey}
				getAction={getAction}
			/>
		</div>
	)
}

export function PricingSectionHeader({
	variant,
}: {
	variant: PricingPlanCardVariant
}) {
	const { pricing } = useLandingCopy()
	const { eyebrow, title, description, currencyNote } = pricing
	const isLanding = variant === "landing"

	return (
		<div className={isLanding ? "max-w-2xl" : "max-w-3xl"}>
			<p
				className={cn(
					"text-sm font-semibold uppercase tracking-wider",
					"text-primary",
				)}
			>
				{eyebrow}
			</p>
			<h2
				className={cn(
					"mt-2 font-display font-bold tracking-tight",
					isLanding
						? "text-3xl sm:text-4xl"
						: "text-2xl text-neutral-900 sm:text-3xl",
				)}
			>
				{title}
			</h2>
			<p
				className={cn(
					"mt-3 text-pretty leading-relaxed",
					isLanding ? "text-muted-foreground" : "text-neutral-600",
				)}
			>
				{description}
			</p>
			{isLanding && currencyNote ? (
				<p className="mt-2 text-sm text-landing-muted">{currencyNote}</p>
			) : null}
		</div>
	)
}

export type { PricingPlanKey, OneTimePackKey }
