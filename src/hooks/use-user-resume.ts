import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/context/auth-context"
import { getResume, type ResumeRow } from "@/lib/resume"

export const USER_RESUME_QUERY_KEY = "user-resume"

export function userResumeQueryKey(userId: string | undefined) {
	return [USER_RESUME_QUERY_KEY, userId] as const
}

export function hasUploadedResume(
	resume: ResumeRow | null | undefined,
): boolean {
	return Boolean(resume?.original_file_url)
}

export function useUserResume(userId?: string | null) {
	const { user } = useAuth()
	const resolvedUserId = userId ?? user?.id

	const query = useQuery({
		queryKey: userResumeQueryKey(resolvedUserId),
		queryFn: async (): Promise<ResumeRow | null> => {
			if (!resolvedUserId) return null
			return getResume(resolvedUserId)
		},
		enabled: Boolean(resolvedUserId),
		staleTime: 30 * 1000,
	})

	return {
		resume: query.data ?? null,
		isLoading: query.isLoading,
		isError: query.isError,
		refetch: query.refetch,
	}
}
