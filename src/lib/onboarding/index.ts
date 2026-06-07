/**
 * Guided onboarding module — architecture overview
 *
 * Flow:
 *   Signup → /profile → WelcomeModal → (optional) driver.js tour
 *
 * Layers:
 *   lib/onboarding/*     Step definitions, copy, selectors, Supabase prefs (users table)
 *   context/onboarding   State machine + event handlers (resume uploaded, etc.)
 *   hooks/use-onboarding-tour   driver.js adapter
 *   components/onboarding/*     WelcomeModal + Provider shell
 *
 * DOM hooks:
 *   `data-tour={TOUR_TARGET.*}` on profile, header, and application UI
 *
 * Integration:
 *   ProtectedRoute → OnboardingProvider
 *   signup-page → auto sign-in → profile + beginOnboarding()
 *   resume-section / profile-autofill-workspace / page-header / etc. → tour targets
 */

export * from "@/lib/onboarding/types"
export * from "@/lib/onboarding/selectors"
export * from "@/lib/onboarding/copy"
export * from "@/lib/onboarding/steps"
export * from "@/lib/onboarding/preferences"
export * from "@/lib/onboarding/query-keys"

export const ONBOARDING_DEBUG =
	import.meta.env.DEV && import.meta.env.VITE_ONBOARDING_DEBUG !== "false"

export function logOnboarding(message: string, data?: unknown) {
	if (!ONBOARDING_DEBUG) return
	if (data !== undefined) {
		console.debug(`[onboarding] ${message}`, data)
		return
	}
	console.debug(`[onboarding] ${message}`)
}
