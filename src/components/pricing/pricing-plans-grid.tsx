import { LANDING_COPY } from "@/lib/landing-copy"
import {
	getLandingPlanAction,
	getProfilePlanAction,
	PRICING_PLANS,
	resolveCurrentPlanKey,
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
	onBuyJobHuntPack: () => void
}

export type PricingPlansGridProps =
	| LandingPricingPlansGridProps
	| ProfilePricingPlansGridProps

export function PricingPlansGrid(props: PricingPlansGridProps) {
	const { variant, className } = props
	const currentPlanKey =
		variant === "profile"
			? resolveCurrentPlanKey(props.subscription?.plan)
			: null

	return (
		<div
			className={cn(
				"grid items-stretch gap-5 lg:grid-cols-3",
				className,
			)}
		>
			{PRICING_PLANS.map((plan, index) => {
				const isCurrentPlan =
					variant === "profile" && plan.key === currentPlanKey

				const action =
					variant === "landing"
						? getLandingPlanAction(plan.key)
						: getProfilePlanAction(
								plan.key,
								currentPlanKey!,
								{
									onSubscribePro: props.onSubscribePro,
									onBuyJobHuntPack: props.onBuyJobHuntPack,
								},
								{ billingBusy: props.billingBusy },
							)

				return (
					<PricingPlanCard
						key={plan.key}
						plan={plan}
						variant={variant}
						action={action}
						isCurrentPlan={isCurrentPlan}
						animationIndex={index}
					/>
				)
			})}
		</div>
	)
}

export function PricingSectionHeader({
	variant,
}: {
	variant: PricingPlanCardVariant
}) {
	const { eyebrow, title, description } = LANDING_COPY.pricing
	const isLanding = variant === "landing"

	return (
		<div className={isLanding ? "max-w-2xl" : "max-w-3xl"}>
			<p
				className={cn(
					"text-sm font-semibold uppercase tracking-wider",
					isLanding ? "text-primary" : "text-primary",
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
		</div>
	)
}

export type { PricingPlanKey }
