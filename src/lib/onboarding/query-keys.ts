export const ONBOARDING_QUERY_KEY = "onboarding-state"

export function onboardingStateQueryKey(userId: string | undefined) {
	return [ONBOARDING_QUERY_KEY, userId] as const
}
