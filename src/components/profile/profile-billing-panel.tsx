import {
	AlertTriangle,
	CalendarDays,
	CreditCard,
	Info,
	Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	PricingPlansGrid,
} from "@/components/pricing/pricing-plans-grid"
import { DASHBOARD_THEME } from "@/lib/dashboard-theme"
import { env } from "@/lib/env"
import { EMPTY_DISPLAY } from "@/lib/profile-defaults"
import {
	getPlanPresentation,
	getSubscriptionStatusPresentation,
} from "@/lib/profile-presentation"
import type { SubscriptionRow } from "@/types/database"
import { cn } from "@/lib/utils"

interface ProfileBillingPanelProps {
	subscription: SubscriptionRow | null
	billingBusy: boolean
	onSubscribePro: () => void
	onBuyJobHuntPack: () => void
	onOpenPortal: () => void
}

export function ProfileBillingPanel({
	subscription,
	billingBusy,
	onSubscribePro,
	onBuyJobHuntPack,
	onOpenPortal,
}: ProfileBillingPanelProps) {
	const isPro = subscription?.plan === "pro"
	const periodEnd = subscription?.current_period_end
		? new Date(subscription.current_period_end).toLocaleDateString(undefined, {
				year: "numeric",
				month: "short",
				day: "numeric",
			})
		: null

	const planPresentation = getPlanPresentation(subscription?.plan)
	const statusPresentation = getSubscriptionStatusPresentation(
		subscription?.status,
	)
	const PlanIcon = planPresentation.Icon
	const StatusIcon = statusPresentation.Icon

	const stripeConfigWarning = !env.isStripePriceConfigured
		|| !env.stripeJobHuntPackPriceId

	return (
		<div className="space-y-6">
			<Card variant="solid" className={DASHBOARD_THEME.card}>
				<CardHeader className="space-y-3 pb-2">
					<CardTitle className="flex items-start gap-3 font-display text-xl text-neutral-900">
						<span
							className={cn(
								"flex size-10 shrink-0 items-center justify-center",
								DASHBOARD_THEME.billingIconWrap,
							)}
						>
							<CreditCard className="size-5" aria-hidden />
						</span>
						<span className="pt-0.5">Plan &amp; billing</span>
					</CardTitle>
					<CardDescription
						className={cn(
							"pl-[3.25rem] text-pretty leading-relaxed",
							DASHBOARD_THEME.cardDescription,
						)}
					>
						Compare plans below. Pro is billed monthly through{" "}
						<a
							href="https://docs.stripe.com/payments/checkout"
							className={DASHBOARD_THEME.link}
							target="_blank"
							rel="noreferrer"
						>
							Stripe Checkout
						</a>
						. Job Hunt Pack is a one-time purchase with no subscription.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<dl className="grid gap-3 sm:grid-cols-2">
						<div
							className={cn(
								"rounded-xl border p-4",
								planPresentation.containerClass,
							)}
						>
							<dt
								className={cn(
									"flex items-center gap-2 text-xs font-semibold uppercase",
									"tracking-wide text-neutral-500",
								)}
							>
								<PlanIcon className="size-3.5 shrink-0" aria-hidden />
								Current plan
							</dt>
							<dd
								className={cn(
									"mt-2 font-display text-lg font-semibold",
									planPresentation.valueClass,
								)}
							>
								{planPresentation.label}
							</dd>
						</div>
						<div
							className={cn(
								"rounded-xl border p-4",
								statusPresentation.containerClass,
							)}
						>
							<dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
								Status
							</dt>
							<dd
								className={cn(
									"mt-2 flex items-center gap-2 text-sm",
									statusPresentation.textClass,
								)}
							>
								<StatusIcon className="size-4 shrink-0" aria-hidden />
								{statusPresentation.label}
							</dd>
						</div>
						{isPro ? (
							<div
								className={cn(
									"rounded-xl border p-4 sm:col-span-2",
									periodEnd
										? "border-sky-200 bg-sky-50"
										: "border-neutral-200 bg-neutral-50",
								)}
							>
								<dt
									className={cn(
										"flex items-center gap-2 text-xs font-semibold uppercase",
										"tracking-wide text-neutral-500",
									)}
								>
									<CalendarDays
										className={cn(
											"size-3.5 shrink-0",
											periodEnd ? "text-sky-600" : "opacity-60",
										)}
										aria-hidden
									/>
									Current period ends
								</dt>
								<dd
									className={cn(
										"mt-2 text-sm font-medium",
										periodEnd ? "text-neutral-900" : "text-neutral-500",
									)}
								>
									{periodEnd ?? EMPTY_DISPLAY}
								</dd>
							</div>
						) : null}
					</dl>

					{stripeConfigWarning ? (
						<div
							className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
							role="status"
						>
							<AlertTriangle
								className="mt-0.5 size-5 shrink-0 text-amber-600"
								aria-hidden
							/>
							<p className="min-w-0 leading-relaxed">
								Set{" "}
								<code className={DASHBOARD_THEME.code}>
									VITE_STRIPE_PRICE_PRO
								</code>{" "}
								and{" "}
								<code className={DASHBOARD_THEME.code}>
									VITE_STRIPE_PRICE_JOB_HUNT_PACK
								</code>{" "}
								in your app env to enable checkout.
							</p>
						</div>
					) : null}
				</CardContent>
			</Card>

			<Card variant="solid" className={DASHBOARD_THEME.card}>
				<CardHeader className="pb-4">
					<CardTitle className="font-display text-lg text-neutral-900">
						Choose a plan
					</CardTitle>
					<CardDescription className={DASHBOARD_THEME.cardDescription}>
						Start free, try Job Hunt Pack with a one-time payment, or go Pro
						for unlimited access.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<PricingPlansGrid
						variant="profile"
						subscription={subscription}
						billingBusy={billingBusy}
						onSubscribePro={onSubscribePro}
						onBuyJobHuntPack={onBuyJobHuntPack}
					/>

					{isPro ? (
						<div className="flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-6">
							<Button
								type="button"
								variant="outline"
								disabled={billingBusy || !subscription?.stripe_customer_id}
								onClick={onOpenPortal}
								className="gap-2"
							>
								{billingBusy ? (
									<Loader2 className="size-4 animate-spin" aria-hidden />
								) : (
									<CreditCard className="size-4" aria-hidden />
								)}
								Manage billing
							</Button>
							<p className="text-sm text-neutral-500">
								Update payment method, view invoices, or cancel your
								subscription in the Stripe Customer Portal.
							</p>
						</div>
					) : null}

					<div
						className={cn(
							"flex gap-2.5 rounded-lg border border-sky-100",
							"bg-sky-50/50 px-3 py-2.5 text-xs leading-relaxed text-neutral-600",
						)}
					>
						<Info
							className="mt-0.5 size-3.5 shrink-0 text-sky-600"
							aria-hidden
						/>
						<p>
							Billing changes may take a moment to reflect after checkout or
							portal updates.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
