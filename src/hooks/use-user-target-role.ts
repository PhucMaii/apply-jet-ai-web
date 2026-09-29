import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/context/auth-context"
import { supabase } from "@/lib/supabase"

/**
 * Loads the signed-in user's target role for personalized job filtering.
 */
export function useUserTargetRole() {
	const { user } = useAuth()

	return useQuery({
		queryKey: ["user-target-role", user?.id],
		enabled: Boolean(user?.id),
		staleTime: 60_000,
		queryFn: async (): Promise<string | null> => {
			if (!user?.id) return null

			const { data, error } = await supabase
				.from("users")
				.select("target_role")
				.eq("id", user.id)
				.maybeSingle()

			if (error) {
				console.error("Something went wrong loading target role:", error)
				throw error
			}

			const role = data?.target_role?.trim()
			return role ? role : null
		},
	})
}
