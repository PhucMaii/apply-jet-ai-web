import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	completeOAuthCallback,
	getOAuthSuccessRedirectPath,
} from "@/lib/auth-oauth"
import { ROUTES } from "@/lib/constants"

export function AuthCallbackPage() {
	const navigate = useNavigate()
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		let cancelled = false

		void (async () => {
			const result = await completeOAuthCallback()

			if (cancelled) return

			if (result.success) {
				navigate(getOAuthSuccessRedirectPath(), { replace: true })
				return
			}

			setError(result.message)
		})()

		return () => {
			cancelled = true
		}
	}, [navigate])

	if (error) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
				<p className="max-w-md text-sm text-red-600" role="alert">
					{error}
				</p>
				<Button asChild variant="secondary">
					<Link to={ROUTES.login}>Back to log in</Link>
				</Button>
			</div>
		)
	}

	return (
		<div
			className="flex min-h-screen flex-col items-center justify-center gap-3"
			aria-busy="true"
			aria-live="polite"
		>
			<Loader2 className="size-8 animate-spin text-primary" aria-hidden />
			<p className="text-sm text-neutral-600">Completing sign-in…</p>
		</div>
	)
}
