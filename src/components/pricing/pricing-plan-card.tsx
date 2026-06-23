import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DASHBOARD_THEME } from "@/lib/dashboard-theme"
import {
	PRICING_MAX_FEATURE_ROWS,
	type PricingPlan,
	type PricingPlanAction,
} from "@/lib/pricing-plans"
import { cn } from "@/lib/utils"

export type PricingPlanCardVariant = "landing" | "profile"

interface PricingPlanCardProps {
	plan: PricingPlan
	variant: PricingPlanCardVariant
	action?: PricingPlanAction | null
	isCurrentPlan?: boolean
	animationIndex?: number
}

const CARD_LAYOUT = {
	badge: "h-6",
	title: "min-h-8",
	description: "min-h-[4.5rem]",
	price: "h-10",
	featureRow: "min-h-[2.75rem]",
	cta: "h-11",
} as const

function padFeatureRows(features: readonly string[]): (string | null)[] {
	const rows: (string | null)[] = [...features]
	while (rows.length < PRICING_MAX_FEATURE_ROWS) {
		rows.push(null)
	}
	return rows
}

function PlanBadge({
	label,
	variant,
}: {
	label: string
	variant: PricingPlanCardVariant
}) {
	const isLanding = variant === "landing"

	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full px-2.5 py-0.5",
				"text-[10px] font-bold uppercase tracking-wide",
				isLanding
					? "bg-primary text-primary-foreground"
					: "border border-emerald-200 bg-emerald-50 text-emerald-700",
			)}
		>
			{label}
		</span>
	)
}

export function PricingPlanCard({
	plan,
	variant,
	action,
	isCurrentPlan = false,
	animationIndex = 0,
}: PricingPlanCardProps) {
	const isLanding = variant === "landing"
	const isHighlighted = isLanding ? plan.highlight : isCurrentPlan
	const featureRows = padFeatureRows(plan.features)
	const badgeLabel =
		isCurrentPlan && !isLanding
			? "Current plan"
			: isLanding && plan.badge
				? plan.badge
				: null

	const cardClassName = cn(
		"relative grid h-full grid-rows-[auto_auto_auto_auto_1fr_auto]",
		"rounded-2xl border p-6 sm:p-7",
		isLanding
			? isHighlighted
				? "border-primary/50 bg-gradient-to-b from-primary/15 via-card/80 to-background shadow-glow"
				: "border-border/70 bg-card/40"
			: isHighlighted
				? "border-emerald-300 bg-gradient-to-b from-emerald-50 via-white to-white shadow-md ring-1 ring-emerald-200"
				: cn(DASHBOARD_THEME.card, "bg-white"),
	)

	const content = (
		<>
			<div className={cn("flex items-center justify-end", CARD_LAYOUT.badge)}>
				{badgeLabel ? (
					<PlanBadge label={badgeLabel} variant={variant} />
				) : null}
			</div>

			<h3
				className={cn(
					"font-display text-xl font-bold leading-tight sm:text-2xl",
					CARD_LAYOUT.title,
					!isLanding && "text-neutral-900",
				)}
			>
				{plan.name}
			</h3>

			<p
				className={cn(
					"text-sm leading-relaxed",
					CARD_LAYOUT.description,
					isLanding ? "text-muted-foreground" : "text-neutral-600",
				)}
			>
				{plan.desc}
			</p>

			<div
				className={cn(
					"flex items-baseline gap-1",
					CARD_LAYOUT.price,
				)}
			>
				<span
					className={cn(
						"font-display text-3xl font-extrabold leading-none tracking-tight sm:text-4xl",
						!isLanding && "text-neutral-900",
					)}
				>
					{plan.price}
				</span>
				<span
					className={cn(
						"text-sm leading-none",
						isLanding ? "text-muted-foreground" : "text-neutral-500",
						!plan.period && "invisible",
					)}
					aria-hidden={!plan.period}
				>
					{plan.period ?? "/month"}
				</span>
			</div>

			<ul
				className={cn(
					"space-y-0 text-sm",
					isLanding ? "text-muted-foreground" : "text-neutral-600",
				)}
			>
				{featureRows.map((feature, index) => (
					<li
						key={feature ?? `spacer-${plan.key}-${index}`}
						className={cn(
							"grid grid-cols-[1rem_1fr] items-start gap-x-2.5",
							CARD_LAYOUT.featureRow,
							!feature && "invisible",
						)}
						aria-hidden={!feature}
					>
						<Check
							className={cn(
								"size-4 shrink-0",
								isLanding ? "text-primary" : "text-emerald-600",
							)}
							aria-hidden
						/>
						<span className="leading-snug">{feature ?? "—"}</span>
					</li>
				))}
			</ul>

			<div className={cn("mt-7", CARD_LAYOUT.cta)}>
				{action ? (
					action.href ? (
						<Button
							size="lg"
							surface={isLanding ? "dark" : undefined}
							className="h-full w-full"
							variant={action.variant ?? "secondary"}
							asChild
						>
							<Link to={action.href}>{action.label}</Link>
						</Button>
					) : (
						<Button
							type="button"
							size="lg"
							surface={isLanding ? "dark" : undefined}
							className="h-full w-full"
							variant={action.variant ?? "secondary"}
							disabled={action.disabled}
							onClick={action.onClick}
						>
							{action.loading ? (
								<Loader2 className="size-4 animate-spin" aria-hidden />
							) : null}
							{action.label}
						</Button>
					)
				) : null}
			</div>
		</>
	)

	if (isLanding) {
		return (
			<motion.div
				className={cardClassName}
				initial={{ opacity: 0, y: 18 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ delay: 0.06 * animationIndex, duration: 0.45 }}
			>
				{content}
			</motion.div>
		)
	}

	return <article className={cardClassName}>{content}</article>
}
