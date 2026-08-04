import type { ApplicationStatus } from "@/lib/application-status"
import type { ApplicationWithDocuments } from "@/types/database"

export function getApplicationCompanyInitials(
	companyName: string | null | undefined,
): string {
	const cleaned = companyName?.trim() ?? ""
	if (!cleaned) return "?"
	const parts = cleaned.split(/\s+/).filter(Boolean)
	if (parts.length === 1) {
		return parts[0]!.slice(0, 2).toUpperCase()
	}
	return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase()
}

export function formatApplicationAddedLabel(createdAt: string): string {
	const date = new Date(createdAt)
	if (Number.isNaN(date.getTime())) return "Unknown date"

	return date.toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	})
}

export function formatApplicationAddedRelative(createdAt: string): string {
	const date = new Date(createdAt)
	if (Number.isNaN(date.getTime())) return "Unknown"

	const diffMs = Date.now() - date.getTime()
	const dayMs = 24 * 60 * 60 * 1000
	const days = Math.floor(diffMs / dayMs)

	if (days < 0) return formatApplicationAddedLabel(createdAt)
	if (days === 0) return "Today"
	if (days === 1) return "Yesterday"
	if (days < 7) return `${days} days ago`
	if (days < 30) {
		const weeks = Math.floor(days / 7)
		return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`
	}
	return formatApplicationAddedLabel(createdAt)
}

export function getApplicationDocumentFlags(app: ApplicationWithDocuments) {
	const hasResume = Boolean(app.generated_resume || app.generated_resume_id)
	const hasCover = Boolean(
		app.generated_cover_letter || app.generated_cover_letter_id,
	)
	return { hasResume, hasCover }
}

export function filterApplicationsByStatus(
	rows: ApplicationWithDocuments[],
	statusFilter: ApplicationStatus | "all",
	resolveStatus: (raw: string) => ApplicationStatus,
): ApplicationWithDocuments[] {
	if (statusFilter === "all") return rows
	return rows.filter((row) => resolveStatus(row.status) === statusFilter)
}

export function countApplicationsByStatus(
	rows: ApplicationWithDocuments[],
	resolveStatus: (raw: string) => ApplicationStatus,
): Record<ApplicationStatus | "all", number> {
	const counts: Record<ApplicationStatus | "all", number> = {
		all: rows.length,
		Generated: 0,
		Applied: 0,
		Rejected: 0,
		Accepted: 0,
	}

	for (const row of rows) {
		const status = resolveStatus(row.status)
		counts[status] += 1
	}

	return counts
}

export function getJobDescriptionPreview(
	jobDescription: string | null | undefined,
	maxLength = 140,
): string | null {
	const text = jobDescription?.replace(/\s+/g, " ").trim()
	if (!text) return null
	if (text.length <= maxLength) return text
	return `${text.slice(0, maxLength).trimEnd()}…`
}
