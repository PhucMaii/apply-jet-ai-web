import { Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { useUserUsage } from "@/hooks/use-user-usage"
import { DASHBOARD_THEME } from "@/lib/dashboard-theme"
import { getPlanPresentation } from "@/lib/profile-presentation"
import { USAGE_COPY } from "@/lib/usage-copy"
import {
	buildUsageMetrics,
	getExhaustedMetricCount,
	getLowRemainingMetricCount,
} from "@/lib/user-usage"
import type { SubscriptionRow } from "@/types/database"
import { cn } from "@/lib/utils"
import { UsageLoadingState } from "./usage-loading-state"
import { UsageMetricCard } from "./usage-metric-card"

interface ProfileUsagePanelProps {
	subscription: SubscriptionRow | null
	onSubscribe: () => void
	onOpenBilling: () => void
	billingBusy: boolean
}

export function ProfileUsagePanel({
	subscription,
	onSubscribe,
	onOpenBilling,
	billingBusy,
}: ProfileUsagePanelProps) {
	const { usage, isLoading, isError } = useUserUsage()
	const isPro = subscription?.plan === "pro"
	const planPresentation = getPlanPresentation(subscription?.plan)
	const PlanIcon = planPresentation.Icon
	const metrics = buildUsageMetrics(usage, isPro)
	const exhaustedCount = getExhaustedMetricCount(metrics)
	const warningCount = getLowRemainingMetricCount(metrics)

	return (
		<div className="space-y-6">
			<Card variant="solid" className={DASHBOARD_THEME.card}>
				<CardHeader className="space-y-3 pb-2">
					<CardTitle className="flex items-start gap-3 font-display text-xl text-neutral-900">
						<span
							className={cn(
								"flex size-10 shrink-0 items-center justify-center",
								DASHBOARD_THEME.cardIconWrap,
							)}
						>
							<Sparkles className="size-5" aria-hidden />
						</span>
						<span className="pt-0.5">{USAGE_COPY.pageTitle}</span>
					</CardTitle>
					<CardDescription
						className={cn(
							"pl-[3.25rem] text-pretty leading-relaxed",
							DASHBOARD_THEME.cardDescription,
						)}
					>
						{USAGE_COPY.pageDescription}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div
						className={cn(
							"flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between",
							planPresentation.containerClass,
						)}
					>
						<div className="flex items-center gap-3">
							<span
								className={cn(
									"flex size-10 items-center justify-center rounded-xl",
									DASHBOARD_THEME.cardIconWrap,
								)}
							>
								<PlanIcon className="size-5" aria-hidden />
							</span>
							<div>
								<p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
									Current plan
								</p>
								<p
									className={cn(
										"font-display text-lg font-semibold",
										planPresentation.valueClass,
									)}
								>
									{planPresentation.label}
								</p>
							</div>
						</div>
						<p className="max-w-md text-sm leading-relaxed text-neutral-600">
							{isPro ? USAGE_COPY.proPlanHint : USAGE_COPY.freePlanHint}
						</p>
					</div>

					{!isPro && exhaustedCount > 0 ? (
						<div
							className={cn(
								"rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700",
							)}
							role="status"
						>
							You have reached the limit on {exhaustedCount}{" "}
							{exhaustedCount === 1 ? "feature" : "features"}. Upgrade to
							Pro to keep generating.
						</div>
					) : null}

					{!isPro && warningCount > 0 && exhaustedCount === 0 ? (
						<div
							className={cn(
								"rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900",
							)}
							role="status"
						>
							You are running low on {warningCount}{" "}
							{warningCount === 1 ? "feature" : "features"} this period.
						</div>
					) : null}
				</CardContent>
			</Card>

			{isLoading ? (
				<UsageLoadingState />
			) : isError || !usage ? (
				<Card variant="solid" className={DASHBOARD_THEME.card}>
					<CardContent className="py-10 text-center">
						<p className="font-medium text-neutral-900">
							{USAGE_COPY.noUsageDataTitle}
						</p>
						<p className="mt-2 text-sm text-neutral-600">
							{USAGE_COPY.noUsageDataDescription}
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 sm:grid-cols-2">
					{metrics.map((metric) => (
						<UsageMetricCard key={metric.key} metric={metric} />
					))}
				</div>
			)}

			{!isPro ? (
				<Card variant="solid" className={DASHBOARD_THEME.card}>
					<CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p className="font-display text-lg font-semibold text-neutral-900">
								{USAGE_COPY.upgradeTitle}
							</p>
							<p className="mt-1 max-w-lg text-sm text-neutral-600">
								{USAGE_COPY.upgradeDescription}
							</p>
						</div>
						<div className="flex shrink-0 flex-col gap-2 sm:flex-row">
							<Button
								type="button"
								className="gap-2"
								disabled={billingBusy}
								onClick={onSubscribe}
							>
								{billingBusy ? (
									<Loader2 className="size-4 animate-spin" aria-hidden />
								) : (
									<Sparkles className="size-4" aria-hidden />
								)}
								{USAGE_COPY.upgradeCta}
							</Button>
							<Button variant="outline" type="button" onClick={onOpenBilling}>
								View billing
							</Button>
						</div>
					</CardContent>
				</Card>
			) : null}
		</div>
	)
}
