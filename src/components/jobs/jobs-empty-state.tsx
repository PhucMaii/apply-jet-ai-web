import { BriefcaseBusiness, SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { JOBS_COPY } from "@/lib/jobs-copy"
import { JOBS_THEME } from "@/lib/jobs-theme"

interface JobsEmptyStateProps {
	hasActiveFilters: boolean
	onClearFilters: () => void
}

export function JobsEmptyState({
	hasActiveFilters,
	onClearFilters,
}: JobsEmptyStateProps) {
	return (
		<div className={JOBS_THEME.empty} role="status">
			<div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200">
				{hasActiveFilters ? (
					<SearchX className="size-6" aria-hidden />
				) : (
					<BriefcaseBusiness className="size-6" aria-hidden />
				)}
			</div>
			<h2 className="mt-4 font-display text-xl font-semibold text-neutral-900">
				{hasActiveFilters
					? JOBS_COPY.emptyTitle
					: JOBS_COPY.emptyCatalogTitle}
			</h2>
			{hasActiveFilters ? (
				<Button
					type="button"
					variant="outline"
					className="mt-5"
					onClick={onClearFilters}
				>
					{JOBS_COPY.clearFilters}
				</Button>
			) : null}
		</div>
	)
}
