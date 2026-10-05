import {
	APPLICATION_STATUSES,
	type ApplicationStatus,
} from "@/lib/application-status"
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

export type ApplicationStatusFilter = ApplicationStatus | "all"

export function countApplicationsByStatus(
	rows: ApplicationWithDocuments[],
	resolveStatus: (raw: string) => ApplicationStatus,
): Record<ApplicationStatusFilter, number> {
	const counts = Object.fromEntries([
		["all", rows.length],
		...APPLICATION_STATUSES.map((status) => [status, 0]),
	]) as Record<ApplicationStatusFilter, number>

	for (const row of rows) {
		counts[resolveStatus(row.status || "")] += 1
	}

	return counts
}

/** Prefer the builder preview score; fall back to a generated resume score. */
export function getApplicationScore(
	app: ApplicationWithDocuments,
): number | null {
	const fromBuilder = app.app_resume?.score
	if (typeof fromBuilder === "number" && Number.isFinite(fromBuilder)) {
		return fromBuilder
	}
	const fromGenerated =
		app.generated_resume?.new_score ?? app.generated_resume?.old_score
	return typeof fromGenerated === "number" && Number.isFinite(fromGenerated)
		? fromGenerated
		: null
}

export const APPLICATION_SORT = {
	newest: "newest",
	oldest: "oldest",
	company: "company",
	score: "score",
} as const

export type ApplicationSort =
	(typeof APPLICATION_SORT)[keyof typeof APPLICATION_SORT]

export const APPLICATION_SORT_OPTIONS: ReadonlyArray<{
	value: ApplicationSort
	label: string
}> = [
	{ value: APPLICATION_SORT.newest, label: "Newest first" },
	{ value: APPLICATION_SORT.oldest, label: "Oldest first" },
	{ value: APPLICATION_SORT.company, label: "Company A–Z" },
	{ value: APPLICATION_SORT.score, label: "Highest score" },
]

export function isApplicationSort(value: string): value is ApplicationSort {
	return Object.values(APPLICATION_SORT).includes(value as ApplicationSort)
}

function toTime(value: string | null | undefined): number {
	const time = value ? new Date(value).getTime() : 0
	return Number.isNaN(time) ? 0 : time
}

interface ApplicationQuery {
	search: string
	status: ApplicationStatusFilter
	sort: ApplicationSort
	resolveStatus: (raw: string) => ApplicationStatus
}

export function queryApplications(
	rows: ApplicationWithDocuments[],
	{ search, status, sort, resolveStatus }: ApplicationQuery,
): ApplicationWithDocuments[] {
	const needle = search.trim().toLowerCase()

	const filtered = rows.filter((row) => {
		if (status !== "all" && resolveStatus(row.status || "") !== status) {
			return false
		}
		if (!needle) return true
		return (
			(row.job_title ?? "").toLowerCase().includes(needle) ||
			(row.company_name ?? "").toLowerCase().includes(needle)
		)
	})

	return [...filtered].sort((a, b) => {
		switch (sort) {
			case APPLICATION_SORT.oldest:
				return toTime(a.created_at) - toTime(b.created_at)
			case APPLICATION_SORT.company:
				return (a.company_name ?? "").localeCompare(b.company_name ?? "")
			case APPLICATION_SORT.score:
				return (getApplicationScore(b) ?? -1) - (getApplicationScore(a) ?? -1)
			default:
				return toTime(b.created_at) - toTime(a.created_at)
		}
	})
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
