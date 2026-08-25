import { PGWP_LEAF } from "@/lib/pgwp-copy"
import type { PgwpPhase } from "@/lib/pgwp-display"
import { PGWP_PHASE_STYLES, PGWP_THEME } from "@/lib/pgwp-theme"
import { cn } from "@/lib/utils"

type PgwpDaysBadgeSize = "sm" | "md"

interface PgwpDaysBadgeProps {
	label: string
	phase?: PgwpPhase | null
	size?: PgwpDaysBadgeSize
	className?: string
}

const sizeClass: Record<PgwpDaysBadgeSize, string> = {
	sm: "px-2 py-0.5 text-[11px]",
	md: "px-2.5 py-1 text-xs",
}

export function PgwpDaysBadge({
	label,
	phase = null,
	size = "sm",
	className,
}: PgwpDaysBadgeProps) {
	const phaseStyles = phase ? PGWP_PHASE_STYLES[phase] : null

	return (
		<span
			className={cn(
				PGWP_THEME.pillBase,
				sizeClass[size],
				phaseStyles ? phaseStyles.pill : PGWP_THEME.pillUnset,
				"pointer-events-none",
				className,
			)}
		>
			<span aria-hidden>{PGWP_LEAF}</span>
			<span>{label}</span>
		</span>
	)
}
