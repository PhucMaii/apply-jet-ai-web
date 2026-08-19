import {
	getPgwpMascotKey,
	PGWP_MASCOT_ALT,
	PGWP_MASCOT_SRC,
	type PgwpMascotKey,
} from "@/lib/pgwp-mascot"
import type { PgwpPhase } from "@/lib/pgwp-display"
import { cn } from "@/lib/utils"

type PgwpMascotSize = "sm" | "md" | "lg" | "hero"

interface PgwpMascotProps {
	phase?: PgwpPhase | null
	mascotKey?: PgwpMascotKey
	size?: PgwpMascotSize
	className?: string
	decorative?: boolean
}

const sizeClass: Record<PgwpMascotSize, string> = {
	sm: "h-8 w-8",
	md: "h-14 w-14",
	lg: "h-28 w-28 sm:h-36 sm:w-36",
	hero: "h-32 w-32 sm:h-44 sm:w-44 lg:h-52 lg:w-52",
}

export function PgwpMascot({
	phase = null,
	mascotKey,
	size = "lg",
	className,
	decorative = false,
}: PgwpMascotProps) {
	const key = mascotKey ?? getPgwpMascotKey(phase)

	return (
		<img
			src={PGWP_MASCOT_SRC[key]}
			alt={decorative ? "" : PGWP_MASCOT_ALT[key]}
			className={cn(
				"pointer-events-none select-none object-contain",
				sizeClass[size],
				className,
			)}
			decoding="async"
		/>
	)
}
