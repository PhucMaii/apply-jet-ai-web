import { type ReactNode } from "react"
import { Link } from "react-router-dom"
import { Crown, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PRO_FEATURE_GUARD_COPY } from "@/lib/pro-feature-guard-copy"
import { ROUTES } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface ProFeatureGuardProps {
	children: ReactNode
	isGuard: boolean
	featureName?: string
	description?: string
	className?: string
}

export function ProFeatureGuard({
	children,
	isGuard,
	featureName,
	description = PRO_FEATURE_GUARD_COPY.defaultDescription,
	className,
}: ProFeatureGuardProps) {
	if (!isGuard) {
		return <>{children}</>
	}

	const title = featureName
		? `${featureName} is a Pro feature`
		: PRO_FEATURE_GUARD_COPY.title

	return (
		<div className={cn("relative min-h-[240px]", className)}>
			<div
				className="pointer-events-none select-none blur-[2px] opacity-50"
				aria-hidden
			>
				{children}
			</div>

			<div
				className={cn(
					"absolute inset-0 flex items-center justify-center",
					"rounded-xl bg-white/60 p-4 backdrop-blur-[1px]",
				)}
			>
				<div
					className={cn(
						"w-full max-w-sm rounded-xl border border-neutral-200",
						"bg-white p-5 text-center shadow-sm sm:p-6",
					)}
					role="region"
					aria-label={title}
				>
					<span
						className={cn(
							"mx-auto mb-3 flex size-10 items-center justify-center",
							"rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20",
						)}
					>
						<Crown className="size-5" aria-hidden />
					</span>
					<p className="font-display text-base font-semibold text-neutral-900">
						{title}
					</p>
					<p className="mt-2 text-sm leading-relaxed text-neutral-600">
						{description}
					</p>
					<Button asChild size="sm" className="mt-4 gap-2">
						<Link to={ROUTES.profile}>
							<Sparkles className="size-4" aria-hidden />
							{PRO_FEATURE_GUARD_COPY.upgrade}
						</Link>
					</Button>
				</div>
			</div>
		</div>
	)
}

interface ProFeatureBadgeProps {
	className?: string
}

export function ProFeatureBadge({ className }: ProFeatureBadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 rounded-full border",
				"border-primary/25 bg-primary/10 px-1.5 py-0.5",
				"text-[10px] font-semibold uppercase tracking-wide text-primary",
				className,
			)}
		>
			<Crown className="size-2.5 shrink-0" aria-hidden />
			{PRO_FEATURE_GUARD_COPY.lockedLabel}
		</span>
	)
}

export default ProFeatureGuard
