import { Link } from "react-router-dom"
import { FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { APPLICATIONS_THEME } from "@/lib/applications-theme"
import { ROUTES } from "@/lib/constants"

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
				Create your first application manually, or save roles from the
				Chrome extension—they will all appear here.
			</p>
			<Button className="mt-6 gap-2" asChild>
				<Link to={ROUTES.applicationCreate}>
					<Plus className="size-4" aria-hidden />
					New application
				</Link>
			</Button>
		</div>
	)
}
