import type { ApplicationStatus } from "@/lib/application-status"
import { cn } from "@/lib/utils"

const STATUS_BADGE_CLASS: Record<ApplicationStatus, string> = {
	Generated: "bg-primary/10 text-primary ring-1 ring-primary/25",
	Applied: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
	Rejected: "bg-red-50 text-red-700 ring-1 ring-red-200",
	Accepted: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
}

interface ApplicationsStatusBadgeProps {
	status: ApplicationStatus
}

export function ApplicationsStatusBadge({
	status,
}: ApplicationsStatusBadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
				STATUS_BADGE_CLASS[status],
			)}
		>
			{status}
		</span>
	)
}
