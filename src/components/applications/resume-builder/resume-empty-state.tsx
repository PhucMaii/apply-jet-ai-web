import { FileText } from "lucide-react"
import { APPLICATIONS_THEME } from "@/lib/applications-theme"

interface ResumeEmptyStateProps {
	title?: string
	description?: string
}

export function ResumeEmptyState({
	title = "No resume data found",
	description = "This application does not have a resume yet. Generate or seed a resume to start editing.",
}: ResumeEmptyStateProps) {
	return (
		<div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
			<div className="flex size-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
				<FileText className="size-5" aria-hidden />
			</div>
			<div className="space-y-1">
				<p className="text-sm font-semibold text-neutral-900">{title}</p>
				<p className={`max-w-sm text-sm ${APPLICATIONS_THEME.muted}`}>
					{description}
				</p>
			</div>
		</div>
	)
}
