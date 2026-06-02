import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/context/auth-context"
import { supabase } from "@/lib/supabase"
import type { UserUsageRow } from "@/types/user-usage"

export function useUserUsage() {
	const { user } = useAuth()

	const {
		data: usage,
		isLoading,
		isError,
		refetch,
	} = useQuery({
		queryKey: ["user-usage", user?.id],
		queryFn: async (): Promise<UserUsageRow | null> => {
			if (!user) return null

			const { data, error } = await supabase
				.from("user_usage")
				.select("*")
				.eq("user_id", user.id)
				.maybeSingle()

			if (error) {
				console.error("Something went wrong loading user usage:", error)
				throw error
			}

			return data as UserUsageRow | null
		},
		staleTime: 60 * 1000,
		enabled: Boolean(user),
	})

	return {
		usage: usage ?? null,
		isLoading,
		isError,
		refetch,
	}
}

export default useUserUsage
