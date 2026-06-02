import { supabase } from "@/lib/supabase"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/context/auth-context"

const useUserUsage = () => {
    const { user } = useAuth()
    const { data: usage, isLoading } = useQuery({
        queryKey: ["user-usage"],
        queryFn: async () => {
            const { data: usage, error } = await supabase
                .from("user_usage")
                .select("*")
                .eq("user_id", user?.id)
                .maybeSingle()
            if (error) {
                console.error("Something went wrong loading user usage:", error)
                throw error
            }
            return usage
        },
        staleTime: 5 * 60 * 1000,
        enabled: Boolean(user),
    })

    return {
        usage: usage ?? null,
        isLoading: isLoading,
    }
}

export default useUserUsage