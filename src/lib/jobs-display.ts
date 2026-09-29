import { formatDistanceToNowStrict } from "date-fns"
import type { JobPostedWithin } from "@/lib/jobs-copy"
import { JOBS_COPY } from "@/lib/jobs-copy"

export function postedWithinToIso(
	postedWithin: JobPostedWithin,
): string | null {
	if (postedWithin === "any") return null
	const days = Number(postedWithin)
	if (!Number.isFinite(days) || days <= 0) return null
	const since = new Date()
	since.setHours(0, 0, 0, 0)
	if (days === 1) {
		return since.toISOString()
	}
	since.setDate(since.getDate() - (days - 1))
	return since.toISOString()
}

export function formatJobPostedAt(postedAt: string | null): string {
	if (!postedAt) return JOBS_COPY.postedUnknown
	const date = new Date(postedAt)
	if (Number.isNaN(date.getTime())) return JOBS_COPY.postedUnknown
	return `${formatDistanceToNowStrict(date, { addSuffix: true })}`
}

export function isFreshJob(postedAt: string | null, withinDays = 3): boolean {
	if (!postedAt) return false
	const date = new Date(postedAt)
	if (Number.isNaN(date.getTime())) return false
	const ageMs = Date.now() - date.getTime()
	return ageMs >= 0 && ageMs <= withinDays * 24 * 60 * 60 * 1000
}

export function companyInitials(name: string | null | undefined): string {
	const trimmed = name?.trim()
	if (!trimmed) return "?"
	const parts = trimmed.split(/\s+/).filter(Boolean)
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
	return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
}

export function hasJobDescription(html: string | null | undefined): boolean {
	return jobDescriptionPlainText(html).length > 0
}

/** Strip ATS HTML to plain text for storage / AI rewrite prompts. */
export function jobDescriptionPlainText(
	html: string | null | undefined,
): string {
	if (!html) return ""
	return html
		.replace(/<[^>]*>/g, " ")
		.replace(/&nbsp;/gi, " ")
		.replace(/&amp;/gi, "&")
		.replace(/&lt;/gi, "<")
		.replace(/&gt;/gi, ">")
		.replace(/&quot;/gi, '"')
		.replace(/&#39;/gi, "'")
		.replace(/\s+/g, " ")
		.trim()
}

/** Light sanitize for ATS HTML before rendering in the detail pane. */
export function sanitizeJobHtml(html: string): string {
	if (typeof DOMParser === "undefined") return html

	const doc = new DOMParser().parseFromString(html, "text/html")
	doc
		.querySelectorAll("script, iframe, object, embed, form")
		.forEach((el) => el.remove())

	doc.querySelectorAll("*").forEach((el) => {
		for (const attr of [...el.attributes]) {
			const name = attr.name.toLowerCase()
			const value = attr.value.trim()
			if (name.startsWith("on") || name === "srcdoc") {
				el.removeAttribute(attr.name)
				continue
			}
			if (
				(name === "href" || name === "src" || name === "xlink:href") &&
				/^javascript:/i.test(value)
			) {
				el.removeAttribute(attr.name)
			}
		}
	})

	return doc.body.innerHTML
}
