import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/context/auth-context"
import { supabase } from "@/lib/supabase"

export function applicationForJobQueryKey(
	userId: string | undefined,
	jobId: number | null | undefined,
) {
	return ["application-for-job", userId, jobId] as const
}

/**
 * Latest application the signed-in user already linked to this job, if any.
 */
export function useApplicationForJob(jobId: number | null | undefined) {
	const { user } = useAuth()
	const userId = user?.id

	return useQuery({
		queryKey: applicationForJobQueryKey(userId, jobId),
		enabled: Boolean(userId && jobId != null),
		staleTime: 60_000,
		queryFn: async (): Promise<string | null> => {
			if (!userId || jobId == null) return null

			const { data, error } = await supabase
				.from("applications")
				.select("id")
				.eq("user_id", userId)
				.eq("job_id", jobId)
				.order("created_at", { ascending: false })
				.limit(1)
				.maybeSingle()

			if (error) {
				console.error(
					"Something went wrong looking up application for job:",
					error,
				)
				throw new Error(error.message)
			}

			return data?.id ?? null
		},
	})
}

export function useRememberApplicationForJob() {
	const queryClient = useQueryClient()
	const { user } = useAuth()

	return (jobId: number, applicationId: string) => {
		if (!user?.id) return
		queryClient.setQueryData(
			applicationForJobQueryKey(user.id, jobId),
			applicationId,
		)
	}
}
