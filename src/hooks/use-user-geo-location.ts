import { useQuery } from "@tanstack/react-query"
import {
	resolveUserGeoLocation,
	type JobGeoLocation,
} from "@/lib/jobs-geo"

const GEO_QUERY_KEY = ["user-geo-location"] as const
const GEO_STALE_MS = 60 * 60 * 1000
const GEO_RESOLVE_TIMEOUT_MS = 8_000

/**
 * Resolves the user's current city via browser geolocation, then IP fallback.
 * Always settles quickly (permission denied / timeout → IP or null).
 */
export function useUserGeoLocation() {
	return useQuery({
		queryKey: GEO_QUERY_KEY,
		staleTime: GEO_STALE_MS,
		gcTime: GEO_STALE_MS,
		retry: false,
		refetchOnWindowFocus: false,
		queryFn: async (): Promise<JobGeoLocation | null> => {
			const controller = new AbortController()
			const timer = window.setTimeout(
				() => controller.abort(),
				GEO_RESOLVE_TIMEOUT_MS,
			)

			try {
				return await resolveUserGeoLocation(controller.signal)
			} catch (error) {
				console.error("Something went wrong resolving location:", error)
				return null
			} finally {
				window.clearTimeout(timer)
			}
		},
	})
}
