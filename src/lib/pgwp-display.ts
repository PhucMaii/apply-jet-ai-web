export type PgwpPhase = "healthy" | "focus" | "urgent" | "expired"

const MS_PER_DAY = 86_400_000

export function parsePgwpDate(isoDate: string): Date {
	const [year, month, day] = isoDate.split("T")[0].split("-").map(Number)
	return new Date(year, month - 1, day)
}

export function startOfLocalDay(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/** Calendar days until `pgwp_expired_at` (negative = already expired). */
export function getDaysRemaining(pgwpExpiredAt: string): number {
	const expiry = startOfLocalDay(parsePgwpDate(pgwpExpiredAt))
	const today = startOfLocalDay(new Date())
	return Math.round((expiry.getTime() - today.getTime()) / MS_PER_DAY)
}

export function getPgwpPhase(daysRemaining: number): PgwpPhase {
	if (daysRemaining <= 0) return "expired"
	if (daysRemaining <= 90) return "urgent"
	if (daysRemaining <= 180) return "focus"
	return "healthy"
}

export function formatPgwpExpiry(pgwpExpiredAt: string): string {
	return parsePgwpDate(pgwpExpiredAt).toLocaleDateString(undefined, {
		month: "long",
		day: "numeric",
		year: "numeric",
	})
}

export function formatDaysRemaining(daysRemaining: number): string {
	if (daysRemaining > 1) return `${daysRemaining} days left`
	if (daysRemaining === 1) return "1 day left"
	if (daysRemaining === 0) return "Expires today"
	const daysAgo = Math.abs(daysRemaining)
	if (daysAgo === 1) return "Expired 1 day ago"
	return `Expired ${daysAgo} days ago`
}

export function formatHeroDaysValue(daysRemaining: number): string {
	if (daysRemaining <= 0) return String(Math.abs(daysRemaining))
	return String(daysRemaining)
}

export function formatHeroDaysLabel(daysRemaining: number): string {
	if (daysRemaining < 0) return "days since your PGWP expired"
	if (daysRemaining === 0) return "your PGWP expires today"
	return "days left on your PGWP"
}

export function formatPillLabel(daysRemaining: number): string {
	if (daysRemaining <= 0) return "Expired"
	if (daysRemaining === 1) return "1d left"
	return `${daysRemaining}d left`
}

/** `YYYY-MM-DD` for `<input type="date" />` */
export function toDateInputValue(pgwpExpiredAt: string): string {
	return pgwpExpiredAt.split("T")[0]
}

export function isValidDateInput(value: string): boolean {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
	const parsed = parsePgwpDate(value)
	return !Number.isNaN(parsed.getTime())
}
