import type { LucideIcon } from "lucide-react"
import {
	FileText,
	Infinity,
	Loader2,
	Mail,
	MessageSquareText,
	ScanText,
	Sparkles,
} from "lucide-react"
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
import type { UsageMetricKey, UsageMetricView } from "@/types/user-usage"
import { cn } from "@/lib/utils"

const USAGE_METRIC_ICONS: Record<UsageMetricKey, LucideIcon> = {
	resumeGenerations: FileText,
	coverLetters: Mail,
	extractText: ScanText,
	applicationAnswers: MessageSquareText,
}

const USAGE_STATUS_THEME = {
	ok: {
		bar: "bg-primary",
		badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
	},
	warning: {
		bar: "bg-amber-500",
		badge: "border-amber-200 bg-amber-50 text-amber-800",
	},
	exhausted: {
		bar: "bg-red-500",
		badge: "border-red-200 bg-red-50 text-red-700",
	},
} as const

interface ProfileUsagePanelProps {
	subscription: SubscriptionRow | null
	onSubscribe: () => void
	onOpenBilling: () => void
	billingBusy: boolean
}

function UsageMetricCard({ metric }: { metric: UsageMetricView }) {
	const Icon = USAGE_METRIC_ICONS[metric.key]
	const statusTheme = USAGE_STATUS_THEME[metric.status]

	return (
		<article
			className={cn(
				"rounded-xl border border-neutral-200 bg-white p-4 shadow-sm",
				"transition-shadow hover:shadow-md",
			)}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="flex min-w-0 items-start gap-3">
					<span
						className={cn(
							"flex size-10 shrink-0 items-center justify-center",
							DASHBOARD_THEME.cardIconWrap,
						)}
					>
						<Icon className="size-5" aria-hidden />
					</span>
					<div className="min-w-0">
						<h3 className="font-medium text-neutral-900">{metric.label}</h3>
						<p className="mt-1 text-sm leading-relaxed text-neutral-600">
							{metric.description}
						</p>
					</div>
				</div>
				{metric.isUnlimited ? (
					<span
						className={cn(
							"inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5",
							"text-xs font-semibold text-emerald-700",
							"border-emerald-200 bg-emerald-50",
						)}
					>
						<Infinity className="size-3.5" aria-hidden />
						{USAGE_COPY.unlimited}
					</span>
				) : (
					<span
						className={cn(
							"inline-flex shrink-0 rounded-full border px-2 py-0.5",
							"text-xs font-semibold",
							statusTheme.badge,
						)}
					>
						{metric.remaining} {USAGE_COPY.remaining}
					</span>
				)}
			</div>

			<div className="mt-4 space-y-2">
				<div className="flex items-baseline justify-between gap-2 text-sm">
					<span className="font-semibold text-neutral-900">
						{metric.used} {USAGE_COPY.used}
					</span>
					{metric.isUnlimited ? null : (
						<span className="text-neutral-500">
							of {metric.limit}
						</span>
					)}
				</div>

				{metric.isUnlimited ? (
					<div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-sm text-emerald-800">
						<Infinity className="size-4 shrink-0" aria-hidden />
						No limit on your Pro plan
					</div>
				) : (
					<div
						className="h-2 overflow-hidden rounded-full bg-neutral-100"
						role="progressbar"
						aria-valuenow={metric.percentUsed ?? 0}
						aria-valuemin={0}
						aria-valuemax={100}
						aria-label={`${metric.label} usage`}
					>
						<div
							className={cn(
								"h-full rounded-full transition-all duration-300",
								statusTheme.bar,
							)}
							style={{ width: `${metric.percentUsed ?? 0}%` }}
						/>
					</div>
				)}
			</div>
		</article>
	)
}

function UsageLoadingState() {
	return (
		<div
			className="flex flex-col items-center justify-center gap-3 py-16"
			aria-busy="true"
		>
			<Loader2 className="size-8 animate-spin text-primary" aria-hidden />
			<p className={DASHBOARD_THEME.muted}>{USAGE_COPY.loading}</p>
		</div>
	)
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
