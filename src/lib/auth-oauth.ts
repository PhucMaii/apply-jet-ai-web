import { ROUTES } from "@/lib/constants"
import { supabase } from "@/lib/supabase"

const OAUTH_RETURN_STORAGE_KEY = "applyjet_oauth_return"

export function clearOAuthReturnPath(): void {
	sessionStorage.removeItem(OAUTH_RETURN_STORAGE_KEY)
}

export function getOAuthRedirectUrl(): string {
	return `${window.location.origin}${ROUTES.authCallback}`
}

export function markOAuthSignInPending(
	returnPath: string = ROUTES.applications,
): void {
	sessionStorage.setItem(OAUTH_RETURN_STORAGE_KEY, returnPath)
}

export function consumeOAuthReturnPath(): string | null {
	const returnPath = sessionStorage.getItem(OAUTH_RETURN_STORAGE_KEY)
	if (returnPath) {
		sessionStorage.removeItem(OAUTH_RETURN_STORAGE_KEY)
	}
	return returnPath
}

export function peekOAuthReturnPath(): string | null {
	return sessionStorage.getItem(OAUTH_RETURN_STORAGE_KEY)
}

export function hasOAuthCallbackParams(): boolean {
	const url = new URL(window.location.href)
	if (url.searchParams.has("code")) return true
	if (url.searchParams.has("error") || url.searchParams.has("error_description")) {
		return true
	}

	const hash = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash
	if (!hash) return false

	const hashParams = new URLSearchParams(hash)
	return (
		hashParams.has("access_token") ||
		hashParams.has("code") ||
		hashParams.has("error")
	)
}

export function getOAuthSuccessRedirectPath(): string {
	return consumeOAuthReturnPath() ?? ROUTES.applications
}

export type OAuthCallbackResult =
	| { success: true }
	| { success: false; message: string }

export async function completeOAuthCallback(): Promise<OAuthCallbackResult> {
	const url = new URL(window.location.href)
	const oauthError =
		url.searchParams.get("error_description") ??
		url.searchParams.get("error")

	if (oauthError) {
		console.error("Something went wrong during OAuth callback:", oauthError)
		return { success: false, message: oauthError }
	}

	const code = url.searchParams.get("code")

	try {
		if (code) {
			const { error } = await supabase.auth.exchangeCodeForSession(code)
			if (error) {
				console.error(
					"Something went wrong exchanging OAuth code for session:",
					error,
				)
				return { success: false, message: error.message }
			}
		}

		const {
			data: { session },
			error: sessionError,
		} = await supabase.auth.getSession()

		if (sessionError) {
			console.error(
				"Something went wrong loading session after OAuth:",
				sessionError,
			)
			return { success: false, message: sessionError.message }
		}

		if (!session) {
			return {
				success: false,
				message: "Sign-in could not be completed. Please try again.",
			}
		}

		return { success: true }
	} catch (err) {
		console.error("Something went wrong during OAuth callback:", err)
		return {
			success: false,
			message: err instanceof Error ? err.message : "Sign-in failed.",
		}
	}
}
