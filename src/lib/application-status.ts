export const APPLICATION_STATUSES = [
	"Generated",
	"Applied",
	"Rejected",
	"Accepted",
] as const

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export function isApplicationStatus(v: string): v is ApplicationStatus {
	return (APPLICATION_STATUSES as readonly string[]).includes(v)
}
