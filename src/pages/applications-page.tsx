import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ChevronDown, Plus, SearchX, Zap } from "lucide-react"
import toast from "react-hot-toast"
import { ApplicationsBoard } from "@/components/applications/applications-board"
import { ApplicationsEmptyState } from "@/components/applications/applications-empty-state"
import { ApplicationsSkeleton } from "@/components/applications/applications-skeleton"
import { ApplicationsTable } from "@/components/applications/applications-table"
import { ApplicationsToolbar } from "@/components/applications/applications-toolbar"
import { QuickAddApplicationModal } from "@/components/applications/quick-add-application-modal"
import { AppPageHeader } from "@/components/layout/app-page-header"
import { PgwpTrackerHero } from "@/components/pgwp/pgwp-tracker-hero"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/ui/empty-state"
import { useApplications } from "@/hooks/use-applications"
import { APP_PAGE_CONTAINER } from "@/lib/app-nav"
import { cn } from "@/lib/utils"
import {
	APPLICATION_SORT,
	countApplicationsByStatus,
	queryApplications,
	type ApplicationSort,
	type ApplicationStatusFilter,
} from "@/lib/application-display"
import {
	APPLICATION_STATUS_META,
	type ApplicationStatus,
} from "@/lib/application-status"
import {
	APPLICATIONS_COPY,
	APPLICATIONS_VIEW,
	APPLICATIONS_VIEW_STORAGE_KEY,
	type ApplicationsView,
} from "@/lib/applications-copy"
import { ROUTES } from "@/lib/constants"
import { FEATURES } from "@/lib/features"

function readStoredView(): ApplicationsView {
	try {
		const stored = window.localStorage.getItem(APPLICATIONS_VIEW_STORAGE_KEY)
		return stored === APPLICATIONS_VIEW.board ? APPLICATIONS_VIEW.board : APPLICATIONS_VIEW.table
	} catch {
		return APPLICATIONS_VIEW.table
	}
}

export function ApplicationsPage() {
	const {
		rows,
		loadError,
		loading,
		updatingId,
		updateStatus,
		resolveStatus,
		deleteApplication,
	} = useApplications()

	const [search, setSearch] = useState("")
	const [statusFilter, setStatusFilter] = useState<ApplicationStatusFilter>("all")
	const [sort, setSort] = useState<ApplicationSort>(APPLICATION_SORT.newest)
	const [view, setView] = useState<ApplicationsView>(readStoredView)
	const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)

	const isBoard = view === APPLICATIONS_VIEW.board
	const effectiveStatus = isBoard ? "all" : statusFilter

	const statusCounts = useMemo(
		() => countApplicationsByStatus(rows, resolveStatus),
		[rows, resolveStatus],
	)

	const visibleRows = useMemo(
		() =>
			queryApplications(rows, {
				search,
				status: effectiveStatus,
				sort,
				resolveStatus,
			}),
		[rows, search, effectiveStatus, sort, resolveStatus],
	)

	const handleViewChange = (next: ApplicationsView) => {
		setView(next)
		try {
			window.localStorage.setItem(APPLICATIONS_VIEW_STORAGE_KEY, next)
		} catch (error) {
			console.error("Something went wrong saving the applications view:", error)
		}
	}

	const handleStatusChange = async (id: string, next: ApplicationStatus) => {
		const isSaved = await updateStatus(id, next)
		if (isSaved) {
			toast.success(APPLICATIONS_COPY.statusUpdated(APPLICATION_STATUS_META[next].label))
		} else {
			toast.error(APPLICATIONS_COPY.statusFailed)
		}
	}

	const clearFilters = () => {
		setSearch("")
		setStatusFilter("all")
	}

	const openQuickAdd = () => setIsQuickAddOpen(true)
	const hasRows = rows.length > 0
	const isFullBoard =
		isBoard && hasRows && !loading && visibleRows.length > 0

	return (
		<div
			className={cn(
				APP_PAGE_CONTAINER,
				isFullBoard &&
					"flex max-w-[100rem] flex-col lg:h-dvh lg:max-h-dvh lg:overflow-hidden lg:py-5",
			)}
		>
			{FEATURES.pgwp && !isFullBoard ? (
				<div className="mb-8 shrink-0">
					<PgwpTrackerHero />
				</div>
			) : null}

			<AppPageHeader
				className="shrink-0"
				title={APPLICATIONS_COPY.title}
				description={
					hasRows
						? APPLICATIONS_COPY.count(visibleRows.length, rows.length)
						: APPLICATIONS_COPY.description
				}
				actions={
					hasRows ? (
						<div className="inline-flex">
							<Button className="rounded-r-none" asChild>
								<Link to={ROUTES.applicationCreate}>
									<Plus aria-hidden />
									{APPLICATIONS_COPY.addApplication}
								</Link>
							</Button>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										className="rounded-l-none border-l border-white/20 px-2.5"
										aria-label={APPLICATIONS_COPY.quickAdd}
									>
										<ChevronDown aria-hidden />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onSelect={openQuickAdd}>
										<Zap aria-hidden />
										{APPLICATIONS_COPY.quickAdd}
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					) : null
				}
			/>

			{loadError ? (
				<p className="mt-6 shrink-0 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
					{loadError}
				</p>
			) : null}

			<div
				className={cn(
					"mt-6 sm:mt-8",
					isFullBoard && "flex min-h-0 flex-1 flex-col lg:mt-5",
				)}
			>
				{loading ? (
					<ApplicationsSkeleton />
				) : !hasRows ? (
					<ApplicationsEmptyState onQuickAdd={openQuickAdd} />
				) : (
					<div
						className={cn(
							"space-y-4",
							isFullBoard && "flex min-h-0 flex-1 flex-col space-y-3 lg:space-y-3",
						)}
					>
						<div className="shrink-0">
							<ApplicationsToolbar
								search={search}
								onSearchChange={setSearch}
								status={statusFilter}
								onStatusChange={setStatusFilter}
								statusCounts={statusCounts}
								sort={sort}
								onSortChange={setSort}
								view={view}
								onViewChange={handleViewChange}
							/>
						</div>

						{visibleRows.length === 0 ? (
							<EmptyState
								icon={SearchX}
								title={APPLICATIONS_COPY.noResultsTitle}
								description={APPLICATIONS_COPY.noResultsBody}
								actions={
									<Button variant="secondary" size="sm" onClick={clearFilters}>
										{APPLICATIONS_COPY.clearFilters}
									</Button>
								}
							/>
						) : isBoard ? (
							<div
								className={cn(
									"flex min-h-[24rem] flex-col",
									isFullBoard &&
										"min-h-0 flex-1 lg:min-h-0",
								)}
							>
								<ApplicationsBoard
									rows={visibleRows}
									updatingId={updatingId}
									resolveStatus={resolveStatus}
									onStatusChange={(id, next) => void handleStatusChange(id, next)}
								/>
							</div>
						) : (
							<ApplicationsTable
								rows={visibleRows}
								updatingId={updatingId}
								resolveStatus={resolveStatus}
								onStatusChange={(id, next) => void handleStatusChange(id, next)}
								onDelete={deleteApplication}
							/>
						)}
					</div>
				)}
			</div>

			<QuickAddApplicationModal
				isOpen={isQuickAddOpen}
				onClose={() => setIsQuickAddOpen(false)}
			/>
		</div>
	)
}
