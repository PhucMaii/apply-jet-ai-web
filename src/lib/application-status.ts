import type { BadgeTone } from "@/components/ui/badge"

/** Stored values, in pipeline order. Keep in sync with `applications_status_check`. */
export const APPLICATION_STATUSES = [
	"Generated",
	"Applied",
	"Interviewing",
	"Accepted",
	"Rejected",
] as const

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export function isApplicationStatus(v: string): v is ApplicationStatus {
	return (APPLICATION_STATUSES as readonly string[]).includes(v)
}

/** Unknown or legacy values fall back to the first pipeline stage. */
export function resolveApplicationStatus(raw: string): ApplicationStatus {
	return isApplicationStatus(raw) ? raw : "Generated"
}

interface ApplicationStatusMeta {
	/** User-facing label; stored values stay unchanged for existing rows. */
	label: string
	tone: BadgeTone
	/** Tailwind background class for dots and column markers. */
	dotClass: string
}

export const APPLICATION_STATUS_META: Record<
	ApplicationStatus,
	ApplicationStatusMeta
> = {
	Generated: { label: "Saved", tone: "brand", dotClass: "bg-status-saved" },
	Applied: { label: "Applied", tone: "info", dotClass: "bg-status-applied" },
	Interviewing: {
		label: "Interviewing",
		tone: "warning",
		dotClass: "bg-status-interviewing",
	},
	Accepted: { label: "Offer", tone: "success", dotClass: "bg-status-offer" },
	Rejected: { label: "Rejected", tone: "danger", dotClass: "bg-status-rejected" },
}

export function getApplicationStatusLabel(status: ApplicationStatus): string {
	return APPLICATION_STATUS_META[status].label
}
