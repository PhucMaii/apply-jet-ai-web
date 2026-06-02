import { Link } from "react-router-dom"
import { ROUTES } from "@/lib/constants"
import {
	getPlanDashboardBadgePresentation,
	getPlanHeaderBadgePresentation,
} from "@/lib/profile-presentation"
import type { SubscriptionRow } from "@/types/database"
import { cn } from "@/lib/utils"

interface PlanBadgeProps {
	plan: SubscriptionRow["plan"] | null | undefined
	surface?: "light" | "dark"
	className?: string
}

export function PlanBadge({
	plan,
	surface = "light",
	className,
}: PlanBadgeProps) {
	const presentation =
		surface === "dark"
			? getPlanHeaderBadgePresentation(plan)
			: getPlanDashboardBadgePresentation(plan)
	const PlanIcon = presentation.Icon

	return (
		<Link
			to={ROUTES.profile}
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
				"text-xs font-medium transition-colors",
				presentation.className,
				className,
			)}
			title={`Current plan: ${presentation.label}`}
			aria-label={`Current plan: ${presentation.label}. View profile and billing.`}
		>
			<PlanIcon
				className={cn("size-3.5 shrink-0", presentation.iconClassName)}
				aria-hidden
			/>
			<span>{presentation.label}</span>
		</Link>
	)
}
