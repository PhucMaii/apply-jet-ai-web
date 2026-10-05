import { Link } from "react-router-dom"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { APPLICATIONS_COPY } from "@/lib/applications-copy"
import { ROUTES } from "@/lib/constants"
import { PGWP_MASCOT_SRC } from "@/lib/pgwp-mascot"

const EMPTY_MASCOT_ALT = "ApplyJet beaver mascot, ready to help" as const

interface ApplicationsEmptyStateProps {
	onQuickAdd: () => void
}

export function ApplicationsEmptyState({ onQuickAdd }: ApplicationsEmptyStateProps) {
	return (
		<EmptyState
			title={APPLICATIONS_COPY.emptyTitle}
			description={APPLICATIONS_COPY.emptyBody}
			illustration={
				<img
					src={PGWP_MASCOT_SRC.healthy}
					alt={EMPTY_MASCOT_ALT}
					width={112}
					height={112}
					className="size-28 object-contain"
					decoding="async"
				/>
			}
			actions={
				<>
					<Button onClick={onQuickAdd}>
						<Plus aria-hidden />
						{APPLICATIONS_COPY.addApplication}
					</Button>
					<Button variant="ghost" asChild>
						<Link to={ROUTES.jobs}>{APPLICATIONS_COPY.emptyBrowseJobs}</Link>
					</Button>
				</>
			}
		/>
	)
}
