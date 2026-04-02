import { useCallback } from "react"
import { supabase } from "../src/lib/supabase"

export type InitialUserPayload = {
	id: string
	email: string
	full_name?: string | null
	first_name?: string | null
	last_name?: string | null
}

export const useUser = () => {
	const initialUserSetup = useCallback(async (userData: InitialUserPayload) => {
		if (!userData.id) return

		try {
			const { data: existingUser } = await supabase
				.from("users")
				.select("id")
				.eq("id", userData.id)
				.maybeSingle()

			let dbUserId = existingUser?.id

			if (!existingUser) {
				const { data: newUser, error } = await supabase
					.from("users")
					.insert({
						id: userData.id,
						full_name: userData.full_name ?? null,
						email: userData.email || null,
						first_name: userData.first_name ?? null,
						last_name: userData.last_name ?? null,
					})
					.select("id")
					.single()

				if (error) {
					console.error(
						"Something went wrong, initial user setup failed:",
						error,
					)
					throw error
				}

				dbUserId = newUser.id
			}

			const { data: subRow } = await supabase
				.from("user_subscriptions")
				.select("user_id")
				.eq("user_id", userData.id)
				.maybeSingle()

			if (!subRow) {
				const { error: subErr } = await supabase
					.from("user_subscriptions")
					.insert({
						user_id: userData.id,
						plan: "free",
					})

				if (subErr) {
					console.error(
						"Something went wrong creating subscription row:",
						subErr,
					)
				}
			}

			const { data: userUsage, error: usageSelectErr } = await supabase
				.from("user_usage")
				.select("user_id")
				.eq("user_id", dbUserId!)
				.maybeSingle()

			if (usageSelectErr) {
				console.warn(
					"user_usage not available (add table or ignore):",
					usageSelectErr.message,
				)
			} else if (!userUsage) {
				const { error: usageErr } = await supabase
					.from("user_usage")
					.insert({ user_id: dbUserId! })

				if (usageErr) {
					console.warn(
						"user_usage insert skipped:",
						usageErr.message,
					)
				}
			}
		} catch (error) {
			console.error("Something went wrong, initial user setup failed:", error)
			throw error
		}
	}, [])

	return { initialUserSetup }
}
