import { useDeferredValue, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { JobDetailPanel } from "@/components/jobs/job-detail-panel"
import { JobFeedCard } from "@/components/jobs/job-feed-card"
import { JobsEmptyState } from "@/components/jobs/jobs-empty-state"
import { JobsFilters } from "@/components/jobs/jobs-filters"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { useJobsFeed } from "@/hooks/use-jobs-feed"
import { useUserGeoLocation } from "@/hooks/use-user-geo-location"
import { useUserTargetRole } from "@/hooks/use-user-target-role"
import {
	JOBS_COPY,
	type JobPostedWithin,
	type JobSort,
} from "@/lib/jobs-copy"
import { geoLocationFilterValue } from "@/lib/jobs-geo"
import { JOBS_THEME } from "@/lib/jobs-theme"
import { PAGE_HEADER_COPY } from "@/lib/page-header-copy"
import { cn } from "@/lib/utils"

export function JobsPage() {
	const { user, signOut, isLoading: isAuthLoading } = useAuth()
	const {
		data: targetRole = null,
		isLoading: isLoadingTargetRole,
		isFetched: hasFetchedTargetRole,
	} = useUserTargetRole()
	const {
		data: geoLocation = null,
		isFetched: hasFetchedGeo,
	} = useUserGeoLocation()

	/** `null` means “use profile target role once it loads.” */
	const [titleOverride, setTitleOverride] = useState<string | null>(null)
	/** `null` means “use detected geo city once it loads.” */
	const [locationOverride, setLocationOverride] = useState<string | null>(
		null,
	)
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

	const handleClearFilters = () => {
		setTitleOverride("")
		setLocationOverride("")
		setPostedWithin("any")
		setSort("relevant")
		setSelectedIdOverride(null)
		setMobileShowDetail(false)
	}

	const handleSelectJob = (jobId: number) => {
		setSelectedIdOverride(jobId)
		setMobileShowDetail(true)
	}

	const accountInitials = (
		user?.email?.split("@")[0]?.slice(0, 2) || "?"
	).toUpperCase()

	const showFeedLoading = !filtersReady || loading

	return (
		<div className={JOBS_THEME.page}>
			<PageHeader
				title={PAGE_HEADER_COPY.jobsTitle}
				isAuthenticated={Boolean(user)}
				userEmail={user?.email}
				accountInitials={accountInitials}
				onSignOut={user ? signOut : undefined}
			/>

			<main className={JOBS_THEME.main}>
				<JobsFilters
					titleQuery={titleQuery}
					locationQuery={locationQuery}
					postedWithin={postedWithin}
					sort={sort}
					resultCount={jobs.length}
					hasActiveFilters={hasActiveFilters}
					onTitleChange={(value) => {
						setTitleOverride(value)
						setSelectedIdOverride(null)
						setMobileShowDetail(false)
					}}
					onLocationChange={(value) => {
						setLocationOverride(value)
						setSelectedIdOverride(null)
						setMobileShowDetail(false)
					}}
					onPostedWithinChange={(value) => {
						setPostedWithin(value)
						setSelectedIdOverride(null)
						setMobileShowDetail(false)
					}}
					onSortChange={(value) => {
						setSort(value)
						setSelectedIdOverride(null)
						setMobileShowDetail(false)
					}}
					onClearFilters={handleClearFilters}
				/>

				{loadError ? (
					<p className={JOBS_THEME.error} role="alert">
						{loadError}
					</p>
				) : null}

				{showFeedLoading ? (
					<div
						className="flex flex-col items-center justify-center gap-3 py-20"
						aria-busy="true"
					>
						<Loader2
							className="size-8 animate-spin text-primary"
							aria-hidden
						/>
						<span className={JOBS_THEME.muted}>{JOBS_COPY.loading}</span>
					</div>
				) : jobs.length === 0 ? (
					<JobsEmptyState
						hasActiveFilters={hasActiveFilters}
						onClearFilters={handleClearFilters}
					/>
				) : (
					<section aria-label="Job results" className="space-y-4">
						<div className={JOBS_THEME.board}>
							<div
								className={cn(
									JOBS_THEME.listPane,
									mobileShowDetail && "hidden lg:flex",
									!mobileShowDetail && "flex",
								)}
							>
								<div className={JOBS_THEME.listScroll} role="listbox">
									{jobs.map((job) => (
										<JobFeedCard
											key={job.id}
											job={job}
											isSelected={selectedJob?.id === job.id}
											onSelect={handleSelectJob}
										/>
									))}
								</div>
								{hasMore ? (
									<div className="shrink-0 border-t border-neutral-100 p-3">
										<Button
											type="button"
											variant="outline"
											className="w-full"
											onClick={loadMore}
											disabled={loadingMore}
										>
											{loadingMore ? (
												<>
													<Loader2
														className="size-4 animate-spin"
														aria-hidden
													/>
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
									!mobileShowDetail && "hidden lg:flex",
									mobileShowDetail && "flex",
								)}
							>
								<JobDetailPanel
									job={selectedJob}
									showBack={mobileShowDetail}
									onBack={() => setMobileShowDetail(false)}
								/>
							</div>
						</div>
					</section>
				)}
			</main>
		</div>
	)
}
