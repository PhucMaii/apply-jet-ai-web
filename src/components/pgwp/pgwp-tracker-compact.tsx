import { useState } from "react"
import { CalendarDays, ChevronDown, ChevronUp } from "lucide-react"
import { PgwpDateField } from "@/components/pgwp/pgwp-date-field"
import { usePgwpTracker } from "@/context/pgwp-tracker-context"
import { PGWP_COPY } from "@/lib/pgwp-copy"
import { PGWP_PHASE_STYLES, PGWP_THEME } from "@/lib/pgwp-theme"
import { cn } from "@/lib/utils"

export function PgwpTrackerCompact() {
	const {
		isLoading,
		isSaving,
		isConfigured,
		daysLabel,
		expiryLabel,
		tracker,
		phase,
		saveExpiryDate,
	} = usePgwpTracker()
	const [isExpanded, setIsExpanded] = useState(false)

	if (isLoading) {
		return (
			<div
				className={cn(PGWP_THEME.compactCard, "animate-pulse")}
				aria-busy="true"
			>
				<div className="h-10 rounded-lg bg-indigo-100/40" />
			</div>
		)
	}

	const phaseStyles = phase ? PGWP_PHASE_STYLES[phase] : PGWP_PHASE_STYLES.healthy

	return (
		<section
			id="pgwp-tracker-compact"
			className={cn(PGWP_THEME.compactCard, phaseStyles.compactBorder)}
		>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex min-w-0 items-start gap-3">
					<span
						className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-900/10 text-indigo-900"
						aria-hidden
					>
						<CalendarDays className="size-4" />
					</span>
					<div className="min-w-0 flex-1">
						<p className={PGWP_THEME.compactTitle}>{PGWP_COPY.compactTitle}</p>
						{isConfigured ? (
							<p className={cn(PGWP_THEME.compactMeta, "mt-0.5")}>
								{daysLabel}
								<span className="text-indigo-900/40"> · </span>
								{PGWP_COPY.expiryPrefix} {expiryLabel}
							</p>
						) : (
							<p className={cn(PGWP_THEME.compactMeta, "mt-0.5")}>
								{PGWP_COPY.compactUnset}
							</p>
						)}
					</div>
				</div>

				<button
					type="button"
					onClick={() => setIsExpanded((open) => !open)}
					className="inline-flex shrink-0 items-center gap-1 self-start rounded-lg px-2.5 py-1.5 text-xs font-semibold text-indigo-800 transition-colors hover:bg-indigo-100/60 sm:self-center"
					aria-expanded={isExpanded}
				>
					{isConfigured ? PGWP_COPY.updateDate : PGWP_COPY.emptyCta}
					{isExpanded ? (
						<ChevronUp className="size-3.5" aria-hidden />
					) : (
						<ChevronDown className="size-3.5" aria-hidden />
					)}
				</button>
			</div>

			{isExpanded ? (
				<div className="border-t border-indigo-200/60 pt-4">
					<PgwpDateField
						initialValue={tracker?.pgwp_expired_at}
						onSave={async (date) => {
							await saveExpiryDate(date)
							setIsExpanded(false)
						}}
						isSaving={isSaving}
						submitLabel={PGWP_COPY.saveDate}
						onCancel={() => setIsExpanded(false)}
					/>
				</div>
			) : null}
		</section>
	)
}
