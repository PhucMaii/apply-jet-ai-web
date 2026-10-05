import { useQuery } from "@tanstack/react-query"
import { useUserGeoLocation } from "@/hooks/use-user-geo-location"
import {
	buildLocationSearchContext,
	geoLocationFilterValue,
	type JobGeoLocation,
	type JobLocationSearchContext,
} from "@/lib/jobs-geo"
import { supabase } from "@/lib/supabase"
import type { JobFeedItem } from "@/types/database"

const LANDING_JOBS_PREVIEW_LIMIT = 6
const FALLBACK_PER_COUNTRY = 3

const FALLBACK_COUNTRIES = ["Canada", "United States"] as const

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

export type LandingJobsPreviewSource = "geo" | "north-america"

export type LandingJobsPreviewResult = {
	jobs: JobFeedItem[]
	source: LandingJobsPreviewSource
	geoLabel: string | null
}

function mapRow(row: SearchJobsRow): JobFeedItem {
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

function dedupeJobs(jobs: JobFeedItem[]): JobFeedItem[] {
	const seen = new Set<number>()
	const unique: JobFeedItem[] = []
	for (const job of jobs) {
		if (seen.has(job.id)) continue
		seen.add(job.id)
		unique.push(job)
	}
	return unique
}

async function searchJobsPage(input: {
	location: JobLocationSearchContext | null
	limit: number
}): Promise<JobFeedItem[]> {
	const { data, error } = await supabase.rpc("search_jobs", {
		p_title: null,
		p_title_tokens: [],
		p_location: input.location?.locationQuery ?? null,
		p_city: input.location?.city ?? null,
		p_region: input.location?.region ?? null,
		p_country: input.location?.country ?? null,
		p_continent_terms: input.location?.continentTerms ?? [],
		p_posted_since: null,
		p_sort: "recent",
		p_limit: input.limit,
		p_offset: 0,
	})

	if (error) {
		console.error(
			"Something went wrong loading landing jobs preview:",
			error,
		)
		throw error
	}

	return ((data ?? []) as SearchJobsRow[]).map(mapRow)
}

function locationContextForGeo(
	geo: JobGeoLocation,
): JobLocationSearchContext | null {
	const filterValue = geoLocationFilterValue(geo)
	return buildLocationSearchContext(filterValue, geo)
}

function locationContextForCountry(country: string): JobLocationSearchContext {
	return {
		locationQuery: country,
		city: null,
		region: null,
		country,
		continentTerms: [],
	}
}

/**
 * Landing preview: prefer jobs near the visitor; else Canada + USA mix.
 */
export function useLandingJobsPreview() {
	const {
		data: geoLocation = null,
		isFetched: hasFetchedGeo,
	} = useUserGeoLocation()

	return useQuery({
		queryKey: [
			"landing-jobs-preview",
			geoLocation?.city ?? null,
			geoLocation?.country ?? null,
			geoLocation?.countryCode ?? null,
		],
		enabled: hasFetchedGeo,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
		queryFn: async (): Promise<LandingJobsPreviewResult> => {
			if (geoLocation?.city || geoLocation?.country) {
				const location = locationContextForGeo(geoLocation)
				const jobs = await searchJobsPage({
					location,
					limit: LANDING_JOBS_PREVIEW_LIMIT,
				})

				if (jobs.length > 0) {
					return {
						jobs,
						source: "geo",
						geoLabel:
							geoLocation.city?.trim() ||
							geoLocation.country?.trim() ||
							null,
					}
				}
			}

			const countryBatches = await Promise.all(
				FALLBACK_COUNTRIES.map((country) =>
					searchJobsPage({
						location: locationContextForCountry(country),
						limit: FALLBACK_PER_COUNTRY,
					}),
				),
			)

			const jobs = dedupeJobs(countryBatches.flat()).slice(
				0,
				LANDING_JOBS_PREVIEW_LIMIT,
			)

			return {
				jobs,
				source: "north-america",
				geoLabel: null,
			}
		},
	})
}
