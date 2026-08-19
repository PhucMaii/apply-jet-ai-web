import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import type { PgwpTrackerRow } from "@/types/database"

export const PGWP_TRACKER_QUERY_KEY = "pgwp-tracker"

export function usePgwpTrackerQuery(userId: string | undefined) {
	return useQuery({
		queryKey: [PGWP_TRACKER_QUERY_KEY, userId],
		queryFn: async (): Promise<PgwpTrackerRow | null> => {
			if (!userId) return null

			const { data, error } = await supabase
				.from("pgwp_tracker")
				.select("*")
				.eq("user_id", userId)
				.maybeSingle()

			if (error) {
				console.error("Something went wrong loading PGWP tracker:", error)
				throw error
			}

			return data
		},
		enabled: Boolean(userId),
		staleTime: 60_000,
	})
}

export function usePgwpTrackerSave(userId: string | undefined) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (pgwpExpiredAt: string): Promise<PgwpTrackerRow> => {
			if (!userId) {
				throw new Error("You must be signed in to save your PGWP date.")
			}

			const { data, error } = await supabase
				.from("pgwp_tracker")
				.upsert(
					{ user_id: userId, pgwp_expired_at: pgwpExpiredAt },
					{ onConflict: "user_id" },
				)
				.select("*")
				.single()

			if (error) {
				console.error("Something went wrong saving PGWP tracker:", error)
				throw error
			}

			return data
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: [PGWP_TRACKER_QUERY_KEY, userId],
			})
		},
	})
}
