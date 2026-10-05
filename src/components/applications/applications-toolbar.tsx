import { useId } from "react"
import { Columns3, Rows3, Search } from "lucide-react"
import { Select } from "@/components/ui/select"
import {
	APPLICATION_STATUSES,
	APPLICATION_STATUS_META,
	isApplicationStatus,
} from "@/lib/application-status"
import {
	APPLICATION_SORT_OPTIONS,
	isApplicationSort,
	type ApplicationSort,
	type ApplicationStatusFilter,
} from "@/lib/application-display"
import {
	APPLICATIONS_COPY,
	APPLICATIONS_VIEW,
	type ApplicationsView,
} from "@/lib/applications-copy"
import { cn } from "@/lib/utils"

interface ApplicationsToolbarProps {
	search: string
	onSearchChange: (value: string) => void
	status: ApplicationStatusFilter
	onStatusChange: (value: ApplicationStatusFilter) => void
	statusCounts: Record<ApplicationStatusFilter, number>
	sort: ApplicationSort
	onSortChange: (value: ApplicationSort) => void
	view: ApplicationsView
	onViewChange: (value: ApplicationsView) => void
}

const VIEW_OPTIONS = [
	{ value: APPLICATIONS_VIEW.table, label: APPLICATIONS_COPY.viewTable, icon: Rows3 },
	{ value: APPLICATIONS_VIEW.board, label: APPLICATIONS_COPY.viewBoard, icon: Columns3 },
] as const

export function ApplicationsToolbar({
	search,
	onSearchChange,
	status,
	onStatusChange,
	statusCounts,
	sort,
	onSortChange,
	view,
	onViewChange,
}: ApplicationsToolbarProps) {
	const searchId = useId()
	const isBoard = view === APPLICATIONS_VIEW.board

	const statusOptions = [
		{ value: "all", label: `${APPLICATIONS_COPY.allStatuses} (${statusCounts.all})` },
		...APPLICATION_STATUSES.map((value) => ({
			value,
			label: `${APPLICATION_STATUS_META[value].label} (${statusCounts[value]})`,
		})),
	]

	return (
		<div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
			<div className="relative min-w-0 flex-1 sm:max-w-xs">
				<label htmlFor={searchId} className="sr-only">
					{APPLICATIONS_COPY.searchLabel}
				</label>
				<Search
					className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-subtle"
					aria-hidden
				/>
				<input
					id={searchId}
					type="search"
					value={search}
					onChange={(event) => onSearchChange(event.target.value)}
					placeholder={APPLICATIONS_COPY.searchPlaceholder}
					className="h-9 w-full rounded-md border border-hairline-strong bg-surface pr-3 pl-9 text-sm text-ink placeholder:text-ink-subtle transition-[border-color,box-shadow] hover:border-ink-subtle/60 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/12"
				/>
			</div>

			<div className="flex flex-wrap items-center gap-2.5">
				{!isBoard ? (
					<Select
						size="sm"
						aria-label={APPLICATIONS_COPY.statusFilterLabel}
						value={status}
						options={statusOptions}
						onChange={(event) => {
							const value = event.target.value
							onStatusChange(isApplicationStatus(value) ? value : "all")
						}}
					/>
				) : null}
				<Select
					size="sm"
					aria-label={APPLICATIONS_COPY.sortLabel}
					value={sort}
					options={APPLICATION_SORT_OPTIONS}
					onChange={(event) => {
						const value = event.target.value
						if (isApplicationSort(value)) onSortChange(value)
					}}
				/>

				<div
					role="radiogroup"
					aria-label={APPLICATIONS_COPY.viewLabel}
					className="ml-auto inline-flex h-9 items-center rounded-md border border-hairline-strong bg-surface p-0.5 sm:ml-0"
				>
					{VIEW_OPTIONS.map((option) => {
						const Icon = option.icon
						const isSelected = view === option.value
						return (
							<button
								key={option.value}
								type="button"
								role="radio"
								aria-checked={isSelected}
								onClick={() => onViewChange(option.value)}
								className={cn(
									"inline-flex h-full items-center gap-1.5 rounded-[5px] px-2.5 text-sm font-medium transition-colors",
									"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
									isSelected
										? "bg-surface-sunken text-ink"
										: "text-ink-subtle hover:text-ink",
								)}
							>
								<Icon className="size-4" aria-hidden />
								{option.label}
							</button>
						)
					})}
				</div>
			</div>
		</div>
	)
}
