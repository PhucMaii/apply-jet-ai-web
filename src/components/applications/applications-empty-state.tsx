import { FileText } from "lucide-react"
import { APPLICATIONS_THEME } from "@/lib/applications-theme"

export function ApplicationsEmptyState() {
	return (
		<div className={APPLICATIONS_THEME.empty} role="status">
			<div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
				<FileText className="size-6" aria-hidden />
			</div>
			<h2 className="mt-4 text-lg font-semibold text-neutral-900">
				No applications yet
			</h2>
			<p className={`mt-2 text-sm ${APPLICATIONS_THEME.muted}`}>
				Applications you save from the extension will appear here in a
				table for quick review and downloads.
			</p>
		</div>
	)
}
