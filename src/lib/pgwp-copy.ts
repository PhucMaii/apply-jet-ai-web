import type { PgwpPhase } from "@/lib/pgwp-display"

export const PGWP_LEAF = "🍁"

export function withPgwpLeaf(text: string): string {
	if (text.startsWith(PGWP_LEAF)) return text
	return `${PGWP_LEAF} ${text}`
}

export const PGWP_COPY = {
	leaf: PGWP_LEAF,
	emptyTitle: `${PGWP_LEAF} Know your PGWP timeline`,
	emptyDescription:
		"Add your expiry date once — we’ll keep it visible while you apply. Most of us only check when panic hits.",
	emptyCta: "Save expiry date",
	emptyHint: "Find this on your PGWP letter or IRCC account.",
	expiryDateLabel: `${PGWP_LEAF} PGWP expiry date`,
	expiryPrefix: "Expires",
	updateDate: "Update date",
	cancelEdit: "Cancel",
	saveDate: "Save",
	saving: "Saving…",
	pillUnset: "Set PGWP date",
	compactUnset: `${PGWP_LEAF} Add your PGWP expiry date`,
	compactTitle: `${PGWP_LEAF} PGWP timeline`,
	watermark: "ApplyJet",
} as const

export const PGWP_PHASE_MESSAGE: Record<PgwpPhase, string> = {
	healthy: "Steady pace wins. One strong application at a time.",
	focus: "Your window is open — keep building momentum.",
	urgent: "The clock is getting real. Keep sending strong applications.",
	critical: "Last stretch. Apply today — you’ve got this.",
	expired:
		"Your PGWP date has passed. Update it if you renewed — we’re still here for your search.",
}
