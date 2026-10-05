import { useCallback, useEffect, useRef, useState } from "react"
import {
	JOBS_COPY,
	JOBS_PAGE_SIZE,
	type JobPostedWithin,
	type JobSort,
} from "@/lib/jobs-copy"
import { postedWithinToIso } from "@/lib/jobs-display"
import {
	buildLocationSearchContext,
	type JobGeoLocation,
} from "@/lib/jobs-geo"
import { tokenizeJobSearch } from "@/lib/jobs-search"
import { supabase } from "@/lib/supabase"
import type { JobFeedItem } from "@/types/database"

interface UseJobsFeedOptions {
	titleQuery: string
	locationQuery: string
	postedWithin: JobPostedWithin
	sort?: JobSort
	/** Used to expand city → country → continent when still on geo seed. */
	geoLocation?: JobGeoLocation | null
	/** Wait for profile defaults (e.g. target role) before the first fetch. */
	enabled?: boolean
}

type SearchJobsRow = {
	id: number
	title: string
	location: string | null
	department: string | null
	apply_url: string
	ats: string
	posted_at: string | null
	first_seen_at: string
	is_seed: boolean
	is_active: boolean
	company_id: number
	description_html: string | null
	company_name: string | null
	company_slug: string | null
	clicks?: number | null
}

function mapSearchRow(row: SearchJobsRow): JobFeedItem {
	return {
		id: row.id,
		title: row.title,
		location: row.location,
		department: row.department,
		apply_url: row.apply_url,
		ats: row.ats,
		posted_at: row.posted_at,
		first_seen_at: row.first_seen_at,
		is_seed: row.is_seed,
		is_active: row.is_active,
		company_id: row.company_id,
		description_html: row.description_html,
		clicks: typeof row.clicks === "number" && Number.isFinite(row.clicks)
			? row.clicks
			: 0,
		companies:
			row.company_id != null
				? {
						id: row.company_id,
						name: row.company_name,
						slug: row.company_slug,
					}
				: null,
	}
}

function appendUniqueJobs(
	prev: JobFeedItem[],
	next: JobFeedItem[],
): JobFeedItem[] {
	const seen = new Set(prev.map((job) => job.id))
	const unique = next.filter((job) => !seen.has(job.id))
	if (unique.length === 0) return prev
	return [...prev, ...unique]
}

function jobsFeedErrorMessage(error: { message?: string } | null): string {
	const message = error?.message?.toLowerCase() ?? ""
	if (
		message.includes("statement timeout") ||
		message.includes("canceling statement") ||
		message.includes("timed out")
	) {
		return JOBS_COPY.loadTimeout
	}
	return error?.message?.trim() || JOBS_COPY.loadError
}

export function useJobsFeed({
	titleQuery,
	locationQuery,
	postedWithin,
	sort = "relevant",
	geoLocation = null,
	enabled = true,
}: UseJobsFeedOptions) {
	const [jobs, setJobs] = useState<JobFeedItem[]>([])
	const [loading, setLoading] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const [loadError, setLoadError] = useState<string | null>(null)
	const [hasMore, setHasMore] = useState(false)
	const pageRef = useRef(0)
	const requestIdRef = useRef(0)
	/** Sync guard — React state alone cannot block double load-more clicks. */
	const loadMoreLockRef = useRef(false)

	const fetchPage = useCallback(
		async (pageIndex: number, replace: boolean) => {
			if (!enabled) return
			if (!replace) {
				if (loadMoreLockRef.current) return
				loadMoreLockRef.current = true
			}

			const requestId = ++requestIdRef.current
			if (replace) {
				loadMoreLockRef.current = false
				pageRef.current = 0
				setLoading(true)
				setLoadError(null)
			} else {
				setLoadingMore(true)
			}

			try {
				const title = titleQuery.trim()
				const location = locationQuery.trim()
				const locationContext = location
					? buildLocationSearchContext(location, geoLocation)
					: null
				const titleTokens = title ? tokenizeJobSearch(title) : []

				const { data, error } = await supabase.rpc("search_jobs", {
					p_title: title || null,
					p_title_tokens: titleTokens,
					p_location: locationContext?.locationQuery ?? null,
					p_city: locationContext?.city ?? null,
					p_region: locationContext?.region ?? null,
					p_country: locationContext?.country ?? null,
					p_continent_terms: locationContext?.continentTerms ?? [],
					p_posted_since: postedWithinToIso(postedWithin),
					p_sort: sort,
					p_limit: JOBS_PAGE_SIZE,
					p_offset: pageIndex * JOBS_PAGE_SIZE,
				})

				if (requestId !== requestIdRef.current) return

				if (error) {
					console.error("Something went wrong loading jobs:", error)
					setLoadError(jobsFeedErrorMessage(error))
					if (replace) setJobs([])
					setHasMore(false)
					return
				}

				const rows = ((data ?? []) as SearchJobsRow[]).map(mapSearchRow)
				setJobs((prev) => (replace ? rows : appendUniqueJobs(prev, rows)))
				setHasMore(rows.length === JOBS_PAGE_SIZE)
				pageRef.current = pageIndex
			} catch (error) {
				if (requestId !== requestIdRef.current) return
				console.error("Something went wrong loading jobs:", error)
				setLoadError(
					jobsFeedErrorMessage(
						error instanceof Error ? error : { message: String(error) },
					),
				)
				if (replace) setJobs([])
				setHasMore(false)
			} finally {
				if (!replace) {
					loadMoreLockRef.current = false
				}
				if (requestId === requestIdRef.current) {
					setLoading(false)
					setLoadingMore(false)
				}
			}
		},
		[
			enabled,
			geoLocation,
			locationQuery,
			postedWithin,
			sort,
			titleQuery,
		],
	)

	useEffect(() => {
		if (!enabled) {
			setLoading(true)
			return
		}
		void fetchPage(0, true)
	}, [enabled, fetchPage])

	const loadMore = useCallback(() => {
		if (loading || loadingMore || !hasMore || loadMoreLockRef.current) {
			return
		}
		void fetchPage(pageRef.current + 1, false)
	}, [fetchPage, hasMore, loading, loadingMore])

	const refresh = useCallback(() => {
		void fetchPage(0, true)
	}, [fetchPage])

	const setJobClicks = useCallback((jobId: number, clicks: number) => {
		setJobs((prev) =>
			prev.map((job) =>
				job.id === jobId
					? { ...job, clicks: Math.max(job.clicks, clicks) }
					: job,
			),
		)
	}, [])

	return {
		jobs,
		loading,
		loadingMore,
		loadError,
		hasMore,
		loadMore,
		refresh,
		setJobClicks,
	}
}
