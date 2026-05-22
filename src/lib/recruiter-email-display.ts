export const RECRUITER_EMAIL_DISPLAY = {
	sectionTitle: (count: number) =>
		count === 1 ? "1 contact found" : `${count} contacts found`,
	typeLabel: "Type",
	sourceLabel: "Source",
	viewSource: "View source",
	emptyType: "Contact",
} as const

export function normalizeOptionalString(
	value: string | null | undefined,
): string {
	if (value == null) return ""
	return value.trim()
}

export function formatRecruiterEmailType(
	type: string | null | undefined,
): string {
	const trimmed = normalizeOptionalString(type)
	if (!trimmed) return RECRUITER_EMAIL_DISPLAY.emptyType
	return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

export function toExternalHref(url: string | null | undefined): string | null {
	const trimmed = normalizeOptionalString(url)
	if (!trimmed) return null
	try {
		const href = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`
		return new URL(href).href
	} catch {
		return null
	}
}
