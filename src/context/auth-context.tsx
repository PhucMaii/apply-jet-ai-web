import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { env } from "@/lib/env"
import { useUser } from "../../hooks/useUser"

interface AuthContextValue {
	session: Session | null
	user: User | null
	isLoading: boolean
	isConfigured: boolean
	signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function buildInitialPayload(u: User) {
	return {
		id: u.id,
		email: u.email ?? "",
		full_name:
			(u.user_metadata?.full_name as string | undefined) ??
			(u.user_metadata?.name as string | undefined) ??
			null,
		first_name: (u.user_metadata?.first_name as string | undefined) ?? null,
		last_name: (u.user_metadata?.last_name as string | undefined) ?? null,
	}
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [session, setSession] = useState<Session | null>(null)
	const [isLoading, setIsLoading] = useState(
		() => env.isSupabaseConfigured,
	)
	const { initialUserSetup } = useUser()

	useEffect(() => {
		if (!env.isSupabaseConfigured) return

		let mounted = true

		const syncUserRow = (next: Session | null) => {
			const u = next?.user
			if (!u?.id) return
			void initialUserSetup(buildInitialPayload(u)).catch((err) => {
				console.error("Something went wrong syncing user row:", err)
			})
		}

		void supabase.auth.getSession().then(({ data }) => {
			if (!mounted) return
			syncUserRow(data.session ?? null)
			setSession(data.session ?? null)
			setIsLoading(false)
		})

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, nextSession) => {
			syncUserRow(nextSession)
			setSession(nextSession)
		})

		return () => {
			mounted = false
			subscription.unsubscribe()
		}
	}, [initialUserSetup])

	const signOut = useCallback(async () => {
		if (!env.isSupabaseConfigured) return
		await supabase.auth.signOut()
	}, [])

	const value = useMemo<AuthContextValue>(
		() => ({
			session,
			user: session?.user ?? null,
			isLoading,
			isConfigured: env.isSupabaseConfigured,
			signOut,
		}),
		[session, isLoading, signOut],
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/* eslint-disable react-refresh/only-export-components -- paired hook + provider */
/** Auth consumer for routes and layout. */
export function useAuth() {
	const ctx = useContext(AuthContext)
	if (!ctx) {
		throw new Error("useAuth must be used within AuthProvider")
	}
	return ctx
}
