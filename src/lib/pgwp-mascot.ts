import type { PgwpPhase } from "@/lib/pgwp-display"

export type PgwpMascotKey = "healthy" | "focus" | "critical"

export const PGWP_MASCOT_SRC: Record<PgwpMascotKey, string> = {
	healthy: "/mascots/beaver-healthy.png",
	focus: "/mascots/beaver-focus.png",
	critical: "/mascots/beaver-critical.png",
}

export const PGWP_MASCOT_ALT: Record<PgwpMascotKey, string> = {
	healthy: "Canadian beaver mascot, calm and ready",
	focus: "Canadian beaver mascot picking up the pace",
	critical: "Canadian beaver mascot sprinting against the clock",
}

export const PGWP_MASCOT_LEGEND = [
	{
		key: "healthy" as const,
		label: "180+ days",
		caption: "Steady search",
	},
	{
		key: "focus" as const,
		label: "90–180 days",
		caption: "Keep moving",
	},
	{
		key: "critical" as const,
		label: "Last 30 days",
		caption: "Sprint time",
	},
] as const

export function getPgwpMascotKey(
	phase: PgwpPhase | null,
): PgwpMascotKey {
	if (phase === "critical" || phase === "expired") return "critical"
	if (phase === "focus" || phase === "urgent") return "focus"
	return "healthy"
}
