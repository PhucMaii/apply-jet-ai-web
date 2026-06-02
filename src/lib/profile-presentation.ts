import type { LucideIcon } from "lucide-react"
import {
	AlertTriangle,
	CheckCircle2,
	CircleDashed,
	CircleOff,
	Crown,
	Info,
	Sparkles,
	XCircle,
} from "lucide-react"
import type { SubscriptionRow } from "@/types/database"
import { EMPTY_DISPLAY } from "@/lib/profile-defaults"

export function getSubscriptionStatusPresentation(
	statusRaw: string | null | undefined,
): {
	Icon: LucideIcon
	label: string
	containerClass: string
	textClass: string
} {
	const normalized = (statusRaw ?? "").trim().toLowerCase().replace(/\s+/g, "_")
	if (!normalized) {
		return {
			Icon: CircleOff,
			label: EMPTY_DISPLAY,
			containerClass: "border-neutral-200 bg-neutral-50",
			textClass: "text-neutral-500",
		}
	}
	const prettyLabel = normalized
		.split("_")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ")

	switch (normalized) {
		case "active":
			return {
				Icon: CheckCircle2,
				label: prettyLabel,
				containerClass: "border-emerald-200 bg-emerald-50",
				textClass: "font-medium text-emerald-700",
			}
		case "trialing":
			return {
				Icon: Sparkles,
				label: prettyLabel,
				containerClass: "border-sky-200 bg-sky-50",
				textClass: "font-medium text-sky-700",
			}
		case "past_due":
		case "unpaid":
			return {
				Icon: AlertTriangle,
				label: prettyLabel,
				containerClass: "border-red-200 bg-red-50",
				textClass: "font-medium text-red-700",
			}
		case "canceled":
		case "cancelled":
			return {
				Icon: XCircle,
				label: prettyLabel,
				containerClass: "border-neutral-200 bg-neutral-50",
				textClass: "font-medium text-neutral-600",
			}
		case "incomplete":
		case "incomplete_expired":
			return {
				Icon: AlertTriangle,
				label: prettyLabel,
				containerClass: "border-amber-200 bg-amber-50",
				textClass: "font-medium text-amber-800",
			}
		default:
			return {
				Icon: Info,
				label: prettyLabel,
				containerClass: "border-neutral-200 bg-neutral-50",
				textClass: "font-medium text-neutral-800",
			}
	}
}

export function getPlanPresentation(plan: SubscriptionRow["plan"] | null | undefined) {
	const isPro = plan === "pro"
	return {
		Icon: isPro ? Crown : CircleDashed,
		label: isPro ? "Pro" : "Free",
		containerClass: isPro
			? "border-emerald-200 bg-emerald-50"
			: "border-neutral-200 bg-neutral-50",
		valueClass: isPro ? "text-emerald-700" : "text-neutral-600",
	}
}

export function getPlanHeaderBadgePresentation(
	plan: SubscriptionRow["plan"] | null | undefined,
) {
	const isPro = plan === "pro"
	return {
		Icon: isPro ? Crown : CircleDashed,
		label: isPro ? "Pro" : "Free",
		className: isPro
			? "border-primary/35 bg-primary/10 text-primary hover:border-primary/50 hover:bg-primary/15"
			: "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:bg-white/10",
		iconClassName: isPro ? "text-primary" : "opacity-70",
	}
}

export function getPlanDashboardBadgePresentation(
	plan: SubscriptionRow["plan"] | null | undefined,
) {
	const isPro = plan === "pro"
	return {
		Icon: isPro ? Crown : CircleDashed,
		label: isPro ? "Pro" : "Free",
		className: isPro
			? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100"
			: "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-100",
		iconClassName: isPro ? "text-emerald-600" : "text-neutral-500",
	}
}
