import { Badge } from "@/components/ui/badge"
import {
	APPLICATION_STATUS_META,
	type ApplicationStatus,
} from "@/lib/application-status"

interface ApplicationsStatusBadgeProps {
	status: ApplicationStatus
	className?: string
}

export function ApplicationsStatusBadge({
	status,
	className,
}: ApplicationsStatusBadgeProps) {
	const meta = APPLICATION_STATUS_META[status]

	return (
		<Badge tone={meta.tone} hasDot className={className}>
			{meta.label}
		</Badge>
	)
}
