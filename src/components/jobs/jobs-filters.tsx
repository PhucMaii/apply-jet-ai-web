import { Search, MapPin, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
	JOBS_COPY,
	JOB_LOCATION_SHORTCUTS,
	JOB_POSTED_WITHIN_OPTIONS,
	JOB_SORT_OPTIONS,
	type JobPostedWithin,
	type JobSort,
} from "@/lib/jobs-copy"
import { JOBS_THEME } from "@/lib/jobs-theme"
import { cn } from "@/lib/utils"

interface JobsFiltersProps {
	titleQuery: string
	locationQuery: string
	postedWithin: JobPostedWithin
	sort: JobSort
	resultCount: number
	hasActiveFilters: boolean
	onTitleChange: (value: string) => void
	onLocationChange: (value: string) => void
	onPostedWithinChange: (value: JobPostedWithin) => void
	onSortChange: (value: JobSort) => void
	onClearFilters: () => void
}

export function JobsFilters({
	titleQuery,
	locationQuery,
	postedWithin,
	sort,
	resultCount,
	hasActiveFilters,
	onTitleChange,
	onLocationChange,
	onPostedWithinChange,
	onSortChange,
	onClearFilters,
}: JobsFiltersProps) {
	return (
		<section className={JOBS_THEME.filters} aria-label="Job filters">
			<div className="grid gap-3 sm:grid-cols-2">
				<div className={JOBS_THEME.filterField}>
					<label htmlFor="jobs-title-search" className={JOBS_THEME.filterLabel}>
						{JOBS_COPY.searchLabel}
					</label>
					<div className="relative">
						<Search
							className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
							aria-hidden
						/>
						<Input
							id="jobs-title-search"
							value={titleQuery}
							onChange={(event) => onTitleChange(event.target.value)}
							placeholder={JOBS_COPY.searchPlaceholder}
							className="h-11 pl-10 pr-10"
							autoComplete="off"
						/>
						{titleQuery ? (
							<button
								type="button"
								onClick={() => onTitleChange("")}
								className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
								aria-label="Clear title search"
							>
								<X className="size-4" aria-hidden />
							</button>
						) : null}
					</div>
				</div>

				<div className={JOBS_THEME.filterField}>
					<label
						htmlFor="jobs-location-search"
						className={JOBS_THEME.filterLabel}
					>
						{JOBS_COPY.locationLabel}
					</label>
					<div className="relative">
						<MapPin
							className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
							aria-hidden
						/>
						<Input
							id="jobs-location-search"
							value={locationQuery}
							onChange={(event) => onLocationChange(event.target.value)}
							placeholder={JOBS_COPY.locationPlaceholder}
							className="h-11 pl-10 pr-10"
							autoComplete="off"
						/>
						{locationQuery ? (
							<button
								type="button"
								onClick={() => onLocationChange("")}
								className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
								aria-label="Clear location filter"
							>
								<X className="size-4" aria-hidden />
							</button>
						) : null}
					</div>
				</div>
			</div>

			<div className="space-y-2">
				<p className={JOBS_THEME.filterLabel}>{JOBS_COPY.sortLabel}</p>
				<div
					className="flex flex-wrap gap-1.5"
					role="tablist"
					aria-label={JOBS_COPY.sortLabel}
				>
					{JOB_SORT_OPTIONS.map((option) => {
						const selected = sort === option.value
						return (
							<button
								key={option.value}
								type="button"
								role="tab"
								aria-selected={selected}
								onClick={() => onSortChange(option.value)}
								className={cn(
									JOBS_THEME.filterChip,
									selected && JOBS_THEME.filterChipActive,
								)}
							>
								{option.label}
							</button>
						)
					})}
				</div>
			</div>

			<div className="space-y-2">
				<p className={JOBS_THEME.filterLabel}>{JOBS_COPY.postedLabel}</p>
				<div
					className="flex flex-wrap gap-1.5"
					role="tablist"
					aria-label={JOBS_COPY.postedLabel}
				>
					{JOB_POSTED_WITHIN_OPTIONS.map((option) => {
						const selected = postedWithin === option.value
						return (
							<button
								key={option.value}
								type="button"
								role="tab"
								aria-selected={selected}
								onClick={() => onPostedWithinChange(option.value)}
								className={cn(
									JOBS_THEME.filterChip,
									selected && JOBS_THEME.filterChipActive,
								)}
							>
								{option.label}
							</button>
						)
					})}
				</div>
			</div>

			<div className="space-y-2">
				<p className={JOBS_THEME.filterLabel}>
					{JOBS_COPY.quickLocationsLabel}
				</p>
				<div className="flex flex-wrap gap-1.5">
					{JOB_LOCATION_SHORTCUTS.map((place) => {
						const selected =
							locationQuery.trim().toLowerCase() === place.toLowerCase()
						return (
							<button
								key={place}
								type="button"
								onClick={() =>
									onLocationChange(selected ? "" : place)
								}
								className={cn(
									JOBS_THEME.filterChip,
									selected && JOBS_THEME.filterChipActive,
								)}
							>
								{place}
							</button>
						)
					})}
				</div>
			</div>

			<div className="flex flex-wrap items-center justify-between gap-3 pt-1">
				<p className="text-sm text-neutral-600">
					{hasActiveFilters
						? JOBS_COPY.resultsFiltered(resultCount)
						: resultCount === 1
							? JOBS_COPY.resultsOne
							: JOBS_COPY.resultsMany(resultCount)}
				</p>
				{hasActiveFilters ? (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={onClearFilters}
						className="text-neutral-600"
					>
						{JOBS_COPY.clearFilters}
					</Button>
				) : null}
			</div>
		</section>
	)
}
