import { MapPin, Search, X } from "lucide-react"
import { Select } from "@/components/ui/select"
import {
	JOBS_COPY,
	JOB_LOCATION_SHORTCUTS,
	JOB_POSTED_WITHIN_OPTIONS,
	JOB_SORT_OPTIONS,
	isJobPostedWithin,
	isJobSort,
	type JobPostedWithin,
	type JobSort,
} from "@/lib/jobs-copy"
import { cn } from "@/lib/utils"

interface JobsFiltersProps {
	titleQuery: string
	locationQuery: string
	postedWithin: JobPostedWithin
	sort: JobSort
	resultCount: number
	hasActiveFilters: boolean
	isSearching: boolean
	isUpdating: boolean
	onTitleChange: (value: string) => void
	onLocationChange: (value: string) => void
	onPostedWithinChange: (value: JobPostedWithin) => void
	onSortChange: (value: JobSort) => void
	onClearFilters: () => void
}

const FIELD_CLASS = [
	"h-9 w-full rounded-md border border-hairline-strong bg-surface",
	"text-sm text-ink placeholder:text-ink-subtle",
	"transition-[border-color,box-shadow] hover:border-ink-subtle/60",
	"focus-visible:border-brand focus-visible:outline-none",
	"focus-visible:ring-4 focus-visible:ring-brand/12",
].join(" ")

function resultsLabel(
	resultCount: number,
	hasActiveFilters: boolean,
	isSearching: boolean,
	isUpdating: boolean,
): string {
	if (isSearching) return JOBS_COPY.loading
	if (isUpdating) return JOBS_COPY.updating
	if (hasActiveFilters) return JOBS_COPY.resultsFiltered(resultCount)
	if (resultCount === 1) return JOBS_COPY.resultsOne
	return JOBS_COPY.resultsMany(resultCount)
}

export function JobsFilters({
	titleQuery,
	locationQuery,
	postedWithin,
	sort,
	resultCount,
	hasActiveFilters,
	isSearching,
	isUpdating,
	onTitleChange,
	onLocationChange,
	onPostedWithinChange,
	onSortChange,
	onClearFilters,
}: JobsFiltersProps) {
	const status = resultsLabel(
		resultCount,
		hasActiveFilters,
		isSearching,
		isUpdating,
	)

	return (
		<section aria-label="Job filters" className="flex flex-col gap-3">
			<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]">
				<div className="relative">
					<label htmlFor="jobs-title-search" className="sr-only">
						{JOBS_COPY.searchLabel}
					</label>
					<Search
						className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-subtle"
						aria-hidden
					/>
					<input
						id="jobs-title-search"
						type="text"
						value={titleQuery}
						onChange={(event) => onTitleChange(event.target.value)}
						placeholder={JOBS_COPY.searchPlaceholder}
						className={cn(FIELD_CLASS, "pr-9 pl-9")}
						autoComplete="off"
					/>
					{titleQuery ? (
						<button
							type="button"
							onClick={() => onTitleChange("")}
							className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-ink-subtle hover:bg-surface-sunken hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
							aria-label={JOBS_COPY.clearTitle}
						>
							<X className="size-3.5" aria-hidden />
						</button>
					) : null}
				</div>

				<div className="relative">
					<label htmlFor="jobs-location-search" className="sr-only">
						{JOBS_COPY.locationLabel}
					</label>
					<MapPin
						className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-subtle"
						aria-hidden
					/>
					<input
						id="jobs-location-search"
						type="text"
						value={locationQuery}
						onChange={(event) => onLocationChange(event.target.value)}
						placeholder={JOBS_COPY.locationPlaceholder}
						className={cn(FIELD_CLASS, "pr-9 pl-9")}
						autoComplete="off"
					/>
					{locationQuery ? (
						<button
							type="button"
							onClick={() => onLocationChange("")}
							className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-ink-subtle hover:bg-surface-sunken hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
							aria-label={JOBS_COPY.clearLocation}
						>
							<X className="size-3.5" aria-hidden />
						</button>
					) : null}
				</div>

				<Select
					size="sm"
					aria-label={JOBS_COPY.postedLabel}
					wrapperClassName="w-full lg:w-40"
					options={JOB_POSTED_WITHIN_OPTIONS}
					value={postedWithin}
					onChange={(event) => {
						const value = event.target.value
						if (isJobPostedWithin(value)) onPostedWithinChange(value)
					}}
				/>
				<Select
					size="sm"
					aria-label={JOBS_COPY.sortLabel}
					wrapperClassName="w-full lg:w-40"
					options={JOB_SORT_OPTIONS}
					value={sort}
					onChange={(event) => {
						const value = event.target.value
						if (isJobSort(value)) onSortChange(value)
					}}
				/>
			</div>

			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
				<div
					role="group"
					className="-my-1 flex min-w-0 gap-1.5 overflow-x-auto py-1 sm:flex-1"
					aria-label={JOBS_COPY.quickLocationsLabel}
				>
					{JOB_LOCATION_SHORTCUTS.map((place) => {
						const selected =
							locationQuery.trim().toLowerCase() === place.toLowerCase()
						return (
							<button
								key={place}
								type="button"
								aria-pressed={selected}
								onClick={() => onLocationChange(selected ? "" : place)}
								className={cn(
									"h-8 shrink-0 rounded-full border px-3 text-sm font-medium transition-colors",
									"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
									selected
										? "border-brand bg-brand-soft text-brand-ink"
										: "border-hairline bg-surface text-ink-muted hover:border-hairline-strong hover:text-ink",
								)}
							>
								{place}
							</button>
						)
					})}
				</div>
				<div className="flex shrink-0 items-center gap-2">
					<p
						className="text-sm tabular-nums text-ink-muted"
						aria-live="polite"
					>
						{status}
					</p>
					{hasActiveFilters ? (
						<button
							type="button"
							onClick={onClearFilters}
							className="text-sm font-medium text-brand hover:text-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
						>
							{JOBS_COPY.clearShort}
						</button>
					) : null}
				</div>
			</div>
		</section>
	)
}
