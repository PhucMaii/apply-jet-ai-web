import { BriefcaseBusiness, SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { JOBS_COPY } from "@/lib/jobs-copy"

interface JobsEmptyStateProps {
	hasActiveFilters: boolean
	onClearFilters: () => void
	message?: string | null
}

export function JobsEmptyState({
	hasActiveFilters,
	onClearFilters,
	message,
}: JobsEmptyStateProps) {
	const title = message
		? JOBS_COPY.loadError
		: hasActiveFilters
			? JOBS_COPY.emptyTitle
			: JOBS_COPY.emptyCatalogTitle
	const description = message
		? message === JOBS_COPY.loadError
			? undefined
			: message
		: hasActiveFilters
			? JOBS_COPY.emptyDescription
			: JOBS_COPY.emptyCatalogDescription

	return (
		<EmptyState
			icon={hasActiveFilters || message ? SearchX : BriefcaseBusiness}
			title={title}
			description={description}
			actions={
				hasActiveFilters && !message ? (
					<Button type="button" variant="outline" onClick={onClearFilters}>
						{JOBS_COPY.clearFilters}
					</Button>
				) : null
			}
		/>
	)
}
