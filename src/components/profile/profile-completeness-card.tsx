import { ArrowRight, CircleCheck } from "lucide-react"
import type { ProfileChecklistItem } from "@/lib/profile-completeness"
import type { ProfileSection } from "@/lib/profile-section"
import { cn } from "@/lib/utils"

const COMPLETENESS_COPY = {
	title: "Profile strength",
	complete: "Your profile is complete. Tailored resumes will use all of it.",
	nextSteps: "Next steps",
	progressLabel: "Profile completion",
} as const

const MAX_VISIBLE_STEPS = 3

interface ProfileCompletenessCardProps {
	percent: number
	items: readonly ProfileChecklistItem[]
	onSelectSection: (section: ProfileSection) => void
	className?: string
}

export function ProfileCompletenessCard({
	percent,
	items,
	onSelectSection,
	className,
}: ProfileCompletenessCardProps) {
	const pending = items.filter((item) => !item.isDone)
	const isComplete = pending.length === 0

	return (
		<section
			aria-label={COMPLETENESS_COPY.title}
			className={cn("rounded-xl border border-hairline bg-surface p-4", className)}
		>
			<div className="flex items-baseline justify-between">
				<h2 className="text-sm font-semibold text-ink">{COMPLETENESS_COPY.title}</h2>
				<span className="text-sm font-semibold tabular-nums text-brand">{percent}%</span>
			</div>
			<div
				className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-sunken"
				role="progressbar"
				aria-label={COMPLETENESS_COPY.progressLabel}
				aria-valuenow={percent}
				aria-valuemin={0}
				aria-valuemax={100}
			>
				<div
					className={cn(
						"h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none",
						isComplete ? "bg-emerald-500" : "bg-brand",
					)}
					style={{ width: `${percent}%` }}
				/>
			</div>

			{isComplete ? (
				<p className="mt-3 flex gap-2 text-xs leading-relaxed text-ink-muted">
					<CircleCheck className="size-4 shrink-0 text-emerald-600" aria-hidden />
					{COMPLETENESS_COPY.complete}
				</p>
			) : (
				<div className="mt-4">
					<p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-subtle">
						{COMPLETENESS_COPY.nextSteps}
					</p>
					<ul className="mt-1.5 -mx-1.5">
						{pending.slice(0, MAX_VISIBLE_STEPS).map((item) => (
							<li key={item.key}>
								<button
									type="button"
									onClick={() => onSelectSection(item.section)}
									className="group flex w-full items-center justify-between gap-2 rounded-md px-1.5 py-1.5 text-left text-sm text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
								>
									{item.label}
									<ArrowRight
										className="size-3.5 shrink-0 text-ink-subtle transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
										aria-hidden
									/>
								</button>
							</li>
						))}
					</ul>
				</div>
			)}
		</section>
	)
}
