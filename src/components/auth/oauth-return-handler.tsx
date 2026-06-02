import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/auth-context"
import {
	completeOAuthCallback,
	getOAuthSuccessRedirectPath,
	hasOAuthCallbackParams,
	clearOAuthReturnPath,
	peekOAuthReturnPath,
} from "@/lib/auth-oauth"
import { ROUTES } from "@/lib/constants"

/**
 * Completes OAuth on unexpected landing routes and redirects authenticated
 * users to their post-sign-in destination (usually /applications).
 */
export function OAuthReturnHandler() {
	const navigate = useNavigate()
	const location = useLocation()
	const { user, isLoading } = useAuth()

	useEffect(() => {
		const isHomeWithOAuthParams =
			location.pathname === ROUTES.home && hasOAuthCallbackParams()

		if (!isHomeWithOAuthParams) return

		let cancelled = false

		void (async () => {
			const result = await completeOAuthCallback()
			if (cancelled || !result.success) return

			navigate(getOAuthSuccessRedirectPath(), { replace: true })
		})()

		return () => {
			cancelled = true
		}
	}, [location.pathname, location.search, location.hash, navigate])

	useEffect(() => {
		if (isLoading || !user) return
		if (location.pathname === ROUTES.applications) return

		const pendingReturn = peekOAuthReturnPath()
		if (!pendingReturn) return

		clearOAuthReturnPath()
		navigate(pendingReturn, { replace: true })
	}, [user, isLoading, location.pathname, navigate])

	return null
}
