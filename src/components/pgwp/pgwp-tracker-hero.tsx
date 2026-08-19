import { useState } from "react"
import { CalendarDays, Loader2 } from "lucide-react"
import { BrandLogo } from "@/components/brand/brand-logo"
import { PgwpDateField } from "@/components/pgwp/pgwp-date-field"
import { PgwpMascot } from "@/components/pgwp/pgwp-mascot"
import { usePgwpTracker } from "@/context/pgwp-tracker-context"
import { PGWP_COPY } from "@/lib/pgwp-copy"
import { PGWP_PHASE_STYLES, PGWP_THEME } from "@/lib/pgwp-theme"
import { cn } from "@/lib/utils"

export function PgwpTrackerHero() {
	const {
		isLoading,
		isSaving,
		isConfigured,
		heroDaysValue,
		heroDaysLabel,
		expiryLabel,
		message,
		phase,
		tracker,
		saveExpiryDate,
	} = usePgwpTracker()
	const [isEditing, setIsEditing] = useState(false)

	if (isLoading) {
		return (
			<div
				className={cn(PGWP_THEME.heroCard, "animate-pulse")}
				aria-busy="true"
				aria-label="Loading PGWP tracker"
			>
				<div className="h-32 rounded-xl bg-indigo-100/50" />
			</div>
		)
	}

	const phaseStyles = phase ? PGWP_PHASE_STYLES[phase] : PGWP_PHASE_STYLES.healthy
	const showSetup = !isConfigured || isEditing

	return (
		<section
			id="pgwp-tracker"
			className={cn(PGWP_THEME.heroCard, phaseStyles.compactBorder)}
			aria-label="PGWP timeline"
		>
			<div className="flex items-center gap-4 sm:gap-6">
				<div className="min-w-0 flex-1">
					<div className="flex items-start gap-3">
						<span className={PGWP_THEME.heroIcon} aria-hidden>
							<CalendarDays className="size-5" />
						</span>
						<div className="min-w-0 flex-1">
							{showSetup ? (
								<div className="space-y-4">
									<div>
										<h2 className="font-display text-lg font-semibold text-indigo-950 sm:text-xl">
											{PGWP_COPY.emptyTitle}
										</h2>
										<p className="mt-2 max-w-xl text-sm leading-relaxed text-indigo-950/70">
											{PGWP_COPY.emptyDescription}
										</p>
									</div>
									<PgwpDateField
										initialValue={tracker?.pgwp_expired_at}
										onSave={async (date) => {
											await saveExpiryDate(date)
											setIsEditing(false)
										}}
										isSaving={isSaving}
										onCancel={
											isConfigured ? () => setIsEditing(false) : undefined
										}
									/>
								</div>
							) : (
								<>
									<p
										className={cn(
											PGWP_THEME.heroNumber,
											phaseStyles.heroAccent,
										)}
									>
										{heroDaysValue}
									</p>
									<p className={PGWP_THEME.heroLabel}>{heroDaysLabel}</p>
									<div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
										<p className={PGWP_THEME.heroExpiry}>
											{PGWP_COPY.expiryPrefix} {expiryLabel}
										</p>
										<button
											type="button"
											onClick={() => setIsEditing(true)}
											className="text-sm font-medium text-indigo-700 underline-offset-2 hover:underline"
										>
											{PGWP_COPY.updateDate}
										</button>
									</div>
									{message ? (
										<p className={PGWP_THEME.heroMessage}>{message}</p>
									) : null}
								</>
							)}
						</div>
					</div>
				</div>

				<div className={PGWP_THEME.mascotWrap} aria-hidden>
					<PgwpMascot
						phase={phase}
						size="hero"
						decorative
						className="-mb-2 -mr-2 sm:-mb-4 sm:-mr-4"
					/>
				</div>
			</div>

			{isSaving && isConfigured && !isEditing ? (
				<div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/40">
					<Loader2
						className="size-6 animate-spin text-indigo-700"
						aria-hidden
					/>
				</div>
			) : null}

			<div className={PGWP_THEME.watermark} aria-hidden>
				<BrandLogo size="sm" className="size-6 rounded-md" />
				<span className={PGWP_THEME.watermarkText}>{PGWP_COPY.watermark}</span>
			</div>
		</section>
	)
}
