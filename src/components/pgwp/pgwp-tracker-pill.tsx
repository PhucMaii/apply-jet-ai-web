import { Link, useLocation } from "react-router-dom"
import { CalendarDays } from "lucide-react"
import { usePgwpTracker } from "@/context/pgwp-tracker-context"
import { PGWP_COPY } from "@/lib/pgwp-copy"
import { formatPillLabel } from "@/lib/pgwp-display"
import { PGWP_PHASE_STYLES, PGWP_THEME } from "@/lib/pgwp-theme"
import { ROUTES } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function PgwpTrackerPill() {
	const { pathname } = useLocation()
	const { isLoading, isConfigured, daysRemaining, phase } = usePgwpTracker()

	if (isLoading) return null

	const isApplications = pathname === ROUTES.applications
	const isProfile = pathname === ROUTES.profile
	const href = isProfile
		? `${ROUTES.profile}#pgwp-tracker-compact`
		: `${ROUTES.applications}#pgwp-tracker`

	const phaseStyles = phase ? PGWP_PHASE_STYLES[phase] : null

	const label = isConfigured
		? formatPillLabel(daysRemaining ?? 0)
		: PGWP_COPY.pillUnset

	const className = cn(
		PGWP_THEME.pillBase,
		isConfigured && phaseStyles
			? phaseStyles.pill
			: PGWP_THEME.pillUnset,
	)

	if (isApplications || isProfile) {
		return (
			<a href={isProfile ? "#pgwp-tracker-compact" : "#pgwp-tracker"} className={className}>
				<CalendarDays className="size-3" aria-hidden />
				<span>{label}</span>
			</a>
		)
	}

	return (
		<Link to={href} className={className}>
			<CalendarDays className="size-3" aria-hidden />
			<span>{label}</span>
		</Link>
	)
}
