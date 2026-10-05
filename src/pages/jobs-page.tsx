import {
	useCallback,
	useDeferredValue,
	useEffect,
	useMemo,
	useState,
} from "react"
import type { KeyboardEvent } from "react"
import { Loader2 } from "lucide-react"
import { JobDetailPanel } from "@/components/jobs/job-detail-panel"
import { JobFeedCard } from "@/components/jobs/job-feed-card"
import { JobsEmptyState } from "@/components/jobs/jobs-empty-state"
import { JobsFilters } from "@/components/jobs/jobs-filters"
import { JobsGuestBar } from "@/components/jobs/jobs-guest-bar"
import {
	JobDetailSkeleton,
	JobsListSkeleton,
} from "@/components/jobs/jobs-list-skeleton"
import { AppPageHeader } from "@/components/layout/app-page-header"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { useJobsFeed } from "@/hooks/use-jobs-feed"
import { useUserGeoLocation } from "@/hooks/use-user-geo-location"
import { useUserTargetRole } from "@/hooks/use-user-target-role"
import { APP_PAGE_CONTAINER } from "@/lib/app-nav"
import {
	JOBS_COPY,
	type JobPostedWithin,
	type JobSort,
} from "@/lib/jobs-copy"
import { geoLocationFilterValue } from "@/lib/jobs-geo"
import { JOBS_THEME } from "@/lib/jobs-theme"
import { cn } from "@/lib/utils"

export function JobsPage() {
	const { user, isLoading: isAuthLoading } = useAuth()
	const {
		data: targetRole = null,
		isLoading: isLoadingTargetRole,
		isFetched: hasFetchedTargetRole,
	} = useUserTargetRole()
	const { data: geoLocation = null, isFetched: hasFetchedGeo } =
		useUserGeoLocation()

	/** `null` means “use profile target role once it loads.” */
	const [titleOverride, setTitleOverride] = useState<string | null>(null)
	/** `null` means “use detected geo city once it loads.” */
	const [locationOverride, setLocationOverride] = useState<string | null>(null)
	const [postedWithin, setPostedWithin] = useState<JobPostedWithin>("any")
	const [sort, setSort] = useState<JobSort>("relevant")
	const [selectedIdOverride, setSelectedIdOverride] = useState<number | null>(
		null,
	)
	const [mobileShowDetail, setMobileShowDetail] = useState(false)

	const filtersReady =
		!isAuthLoading &&
		(user
			? hasFetchedTargetRole && !isLoadingTargetRole && hasFetchedGeo
			: hasFetchedGeo)

	const titleQuery = titleOverride ?? targetRole ?? ""
	const locationQuery =
		locationOverride ??
		(geoLocation ? geoLocationFilterValue(geoLocation) : "")

	const deferredTitle = useDeferredValue(titleQuery.trim())
	const deferredLocation = useDeferredValue(locationQuery.trim())

	const {
		jobs,
		loading,
		loadingMore,
		loadError,
		hasMore,
		loadMore,
		setJobClicks,
	} = useJobsFeed({
		titleQuery: deferredTitle,
		locationQuery: deferredLocation,
		postedWithin,
		sort,
		geoLocation,
		enabled: filtersReady,
	})

	const selectedJob = useMemo(() => {
		if (!jobs.length) return null
		if (
			selectedIdOverride != null &&
			jobs.some((job) => job.id === selectedIdOverride)
		) {
			return jobs.find((job) => job.id === selectedIdOverride) ?? null
		}
		return jobs[0] ?? null
	}, [jobs, selectedIdOverride])

	const hasActiveFilters = useMemo(
		() =>
			Boolean(titleQuery.trim()) ||
			Boolean(locationQuery.trim()) ||
			postedWithin !== "any" ||
			sort !== "relevant",
		[locationQuery, postedWithin, sort, titleQuery],
	)

	const resetSelection = useCallback(() => {
		setSelectedIdOverride(null)
		setMobileShowDetail(false)
	}, [])

	const handleTitleChange = useCallback(
		(value: string) => {
			setTitleOverride(value)
			resetSelection()
		},
		[resetSelection],
	)

	const handleLocationChange = useCallback(
		(value: string) => {
			setLocationOverride(value)
			resetSelection()
		},
		[resetSelection],
	)

	const handlePostedWithinChange = useCallback(
		(value: JobPostedWithin) => {
			setPostedWithin(value)
			resetSelection()
		},
		[resetSelection],
	)

	const handleSortChange = useCallback(
		(value: JobSort) => {
			setSort(value)
			resetSelection()
		},
		[resetSelection],
	)

	const handleClearFilters = useCallback(() => {
		setTitleOverride("")
		setLocationOverride("")
		setPostedWithin("any")
		setSort("relevant")
		resetSelection()
	}, [resetSelection])

	const handleSelectJob = useCallback((jobId: number) => {
		setSelectedIdOverride(jobId)
		setMobileShowDetail(true)
	}, [])

	const handleBack = useCallback(() => {
		setMobileShowDetail(false)
		const jobId = selectedJob?.id
		if (jobId == null) return
		requestAnimationFrame(() => {
			document.getElementById(`job-option-${jobId}`)?.focus()
		})
	}, [selectedJob?.id])

	const handleListKeyDown = useCallback(
		(event: KeyboardEvent<HTMLDivElement>) => {
			if (!jobs.length) return
			const isNext = event.key === "ArrowDown" || event.key === "End"
			const isPrev = event.key === "ArrowUp" || event.key === "Home"
			if (!isNext && !isPrev) return
			event.preventDefault()

			const currentIndex = jobs.findIndex((job) => job.id === selectedJob?.id)
			let nextIndex = currentIndex < 0 ? 0 : currentIndex
			if (event.key === "ArrowDown") {
				nextIndex = Math.min(jobs.length - 1, currentIndex + 1)
			} else if (event.key === "ArrowUp") {
				nextIndex = Math.max(0, currentIndex - 1)
			} else if (event.key === "Home") {
				nextIndex = 0
			} else {
				nextIndex = jobs.length - 1
			}

			const next = jobs[nextIndex]
			if (!next) return
			setSelectedIdOverride(next.id)
			const option = document.getElementById(`job-option-${next.id}`)
			option?.scrollIntoView({ block: "nearest" })
			if (option instanceof HTMLElement) option.focus()
		},
		[jobs, selectedJob?.id],
	)

	useEffect(() => {
		if (!mobileShowDetail) return
		if (window.matchMedia("(min-width: 1024px)").matches) return
		document.getElementById("job-detail-back")?.focus()
	}, [mobileShowDetail, selectedJob?.id])

	const isSignedIn = Boolean(user)
	const isInitialLoading = jobs.length === 0 && (!filtersReady || loading)
	const isUpdating = loading && jobs.length > 0
	const showEmpty = !isInitialLoading && jobs.length === 0

	const feed = (
		<div className="mt-5 flex flex-col gap-4">
			<div className={cn(mobileShowDetail && "max-lg:hidden")}>
				<JobsFilters
					titleQuery={titleQuery}
					locationQuery={locationQuery}
					postedWithin={postedWithin}
					sort={sort}
					resultCount={jobs.length}
					hasActiveFilters={hasActiveFilters}
					isSearching={isInitialLoading}
					isUpdating={isUpdating}
					onTitleChange={handleTitleChange}
					onLocationChange={handleLocationChange}
					onPostedWithinChange={handlePostedWithinChange}
					onSortChange={handleSortChange}
					onClearFilters={handleClearFilters}
				/>
			</div>

			{showEmpty ? (
				<JobsEmptyState
					hasActiveFilters={hasActiveFilters}
					onClearFilters={handleClearFilters}
					message={loadError}
				/>
			) : (
				<section
					aria-label="Job results"
					aria-busy={loading || undefined}
					className={cn(
						JOBS_THEME.board,
						!isSignedIn && "lg:h-[calc(100dvh-22rem)]",
					)}
				>
					<div
						className={cn(
							JOBS_THEME.listPane,
							mobileShowDetail && "max-lg:hidden",
						)}
					>
						{isUpdating ? (
							<div
								className="h-0.5 shrink-0 overflow-hidden bg-brand-soft"
								aria-hidden
							>
								<div className="skeleton-shimmer h-full w-full" />
							</div>
						) : null}
						<div
							className={cn(
								JOBS_THEME.listScroll,
								"outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40",
							)}
							aria-label="Job list"
							tabIndex={0}
							onKeyDown={handleListKeyDown}
						>
							{isInitialLoading ? (
								<JobsListSkeleton />
							) : (
								jobs.map((job) => (
									<JobFeedCard
										key={job.id}
										job={job}
										isSelected={selectedJob?.id === job.id}
										onSelect={handleSelectJob}
									/>
								))
							)}
						</div>
						{hasMore && !isInitialLoading ? (
							<div className="shrink-0 border-t border-hairline p-3">
								<Button
									type="button"
									variant="outline"
									className="w-full"
									onClick={loadMore}
									disabled={loadingMore || loading}
								>
									{loadingMore ? (
										<>
											<Loader2 className="animate-spin" aria-hidden />
											{JOBS_COPY.loadingMore}
										</>
									) : (
										JOBS_COPY.loadMore
									)}
								</Button>
							</div>
						) : null}
					</div>

					<div
						className={cn(
							JOBS_THEME.detailPane,
							!mobileShowDetail && "max-lg:hidden",
						)}
					>
						{isInitialLoading ? (
							<JobDetailSkeleton />
						) : (
							<JobDetailPanel
								job={selectedJob}
								showBack={mobileShowDetail}
								onBack={handleBack}
								reserveBottomNav={isSignedIn}
								onClicksChange={setJobClicks}
							/>
						)}
					</div>
				</section>
			)}
		</div>
	)

	if (!isSignedIn) {
		return (
			<div className="app-theme min-h-dvh bg-canvas text-ink">
				<JobsGuestBar />
				<div className={APP_PAGE_CONTAINER}>
					<AppPageHeader
						title={JOBS_COPY.pageTitle}
						description={JOBS_COPY.pageDescription}
					/>
					{feed}
				</div>
			</div>
		)
	}

	return (
		<div className={APP_PAGE_CONTAINER}>
			<AppPageHeader
				title={JOBS_COPY.pageTitle}
				description={JOBS_COPY.pageDescription}
			/>
			{feed}
		</div>
	)
}
