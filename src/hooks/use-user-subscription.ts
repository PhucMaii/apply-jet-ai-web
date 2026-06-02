import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/context/auth-context"
import { supabase } from "@/lib/supabase"
import type { SubscriptionRow } from "@/types/database"

type UserSubscriptionPlan = Pick<SubscriptionRow, "plan" | "status">

export function useUserSubscription() {
	const { user } = useAuth()

	const { data, isLoading } = useQuery({
		queryKey: ["user-subscription", user?.id],
		queryFn: async (): Promise<UserSubscriptionPlan | null> => {
			if (!user) return null

			const { data: subscription, error } = await supabase
				.from("user_subscriptions")
				.select("plan, status")
				.eq("user_id", user.id)
				.maybeSingle()

			if (error) {
				console.error("Something went wrong loading subscription:", error)
				throw error
			}

			return subscription
		},
		enabled: Boolean(user),
		staleTime: 5 * 60 * 1000,
	})

	return {
		plan: data?.plan ?? null,
		status: data?.status ?? null,
		isLoading,
	}
}
