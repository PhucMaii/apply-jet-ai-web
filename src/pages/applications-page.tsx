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

	return (
		<div className={APP_PAGE_CONTAINER}>
			{FEATURES.pgwp ? (
				<div className="mb-8">
					<PgwpTrackerHero />
				</div>
			) : null}

			<AppPageHeader
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
				<p className="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
					{loadError}
				</p>
			) : null}

			<div className="mt-8">
				{loading ? (
					<ApplicationsSkeleton />
				) : !hasRows ? (
					<ApplicationsEmptyState onQuickAdd={openQuickAdd} />
				) : (
					<div className="space-y-4">
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
							<ApplicationsBoard
								rows={visibleRows}
								updatingId={updatingId}
								resolveStatus={resolveStatus}
								onStatusChange={(id, next) => void handleStatusChange(id, next)}
							/>
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
