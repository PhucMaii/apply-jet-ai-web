import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/context/auth-context"
import {
	activateGuidedTour,
	completeOnboarding,
	fetchOnboardingState,
	setOnboardingStep,
	skipOnboarding,
} from "@/lib/onboarding/preferences"
import { onboardingStateQueryKey } from "@/lib/onboarding/query-keys"
import {
	ONBOARDING_STEP,
	ONBOARDING_TOUR_STATUS,
	type OnboardingState,
	type OnboardingStepId,
} from "@/lib/onboarding/types"

const USER_ROW_RETRY_ATTEMPTS = 8
const USER_ROW_RETRY_DELAY_MS = 250

function delay(ms: number) {
	return new Promise((resolve) => {
		window.setTimeout(resolve, ms)
	})
}

/**
 * First-sign-in race: auth session can exist before the `users` row
 * (trigger / initialUserSetup) is readable. Retry briefly so we don't
 * cache a permanent `null` and skip the welcome modal.
 */
async function fetchOnboardingStateWhenReady(
	userId: string,
): Promise<OnboardingState | null> {
	for (let attempt = 0; attempt < USER_ROW_RETRY_ATTEMPTS; attempt++) {
		const state = await fetchOnboardingState(userId)
		if (state) return state
		if (attempt < USER_ROW_RETRY_ATTEMPTS - 1) {
			await delay(USER_ROW_RETRY_DELAY_MS)
		}
	}
	return null
}

function patchCachedOnboardingState(
	queryClient: ReturnType<typeof useQueryClient>,
	userId: string,
	patch: Partial<OnboardingState>,
) {
	queryClient.setQueryData<OnboardingState | null>(
		onboardingStateQueryKey(userId),
		(old) => {
			if (old) return { ...old, ...patch }
			return {
				onboarding_tour_status:
					patch.onboarding_tour_status ?? ONBOARDING_TOUR_STATUS.idle,
				onboarding_current_step: patch.onboarding_current_step ?? null,
			}
		},
	)
}

export function useOnboardingState() {
	const { user } = useAuth()
	const queryClient = useQueryClient()
	const userId = user?.id

	const query = useQuery({
		queryKey: onboardingStateQueryKey(userId),
		queryFn: async (): Promise<OnboardingState | null> => {
			if (!userId) return null
			return fetchOnboardingStateWhenReady(userId)
		},
		enabled: Boolean(userId),
		staleTime: 30 * 1000,
		refetchOnMount: "always",
	})

	const invalidate = () => {
		if (!userId) return
		void queryClient.invalidateQueries({
			queryKey: onboardingStateQueryKey(userId),
		})
	}

	const activateMutation = useMutation({
		mutationFn: async (step: OnboardingStepId = ONBOARDING_STEP.uploadResume) => {
			if (!userId) return
			await activateGuidedTour(userId, step)
		},
		onMutate: async (step) => {
			if (!userId) return
			await queryClient.cancelQueries({
				queryKey: onboardingStateQueryKey(userId),
			})
			const previous = queryClient.getQueryData<OnboardingState | null>(
				onboardingStateQueryKey(userId),
			)
			patchCachedOnboardingState(queryClient, userId, {
				onboarding_tour_status: ONBOARDING_TOUR_STATUS.active,
				onboarding_current_step: step,
			})
			return { previous }
		},
		onError: (_error, _step, context) => {
			if (!userId || !context?.previous) return
			queryClient.setQueryData(
				onboardingStateQueryKey(userId),
				context.previous,
			)
		},
	})

	const skipMutation = useMutation({
		mutationFn: async () => {
			if (!userId) return
			await skipOnboarding(userId)
		},
		onSuccess: invalidate,
	})

	const stepMutation = useMutation({
		mutationFn: async (step: OnboardingStepId) => {
			if (!userId) return
			await setOnboardingStep(userId, step)
		},
		onMutate: async (step) => {
			if (!userId) return
			await queryClient.cancelQueries({
				queryKey: onboardingStateQueryKey(userId),
			})
			const previous = queryClient.getQueryData<OnboardingState | null>(
				onboardingStateQueryKey(userId),
			)
			patchCachedOnboardingState(queryClient, userId, {
				onboarding_current_step: step,
			})
			return { previous }
		},
		onError: (_error, _step, context) => {
			if (!userId || !context?.previous) return
			queryClient.setQueryData(
				onboardingStateQueryKey(userId),
				context.previous,
			)
		},
	})

	const completeMutation = useMutation({
		mutationFn: async () => {
			if (!userId) return
			await completeOnboarding(userId)
		},
		onSuccess: invalidate,
	})

	return {
		state: query.data ?? null,
		isLoading: query.isLoading,
		isUpdating:
			activateMutation.isPending ||
			skipMutation.isPending ||
			stepMutation.isPending ||
			completeMutation.isPending,
		activateGuidedTour: activateMutation.mutateAsync,
		skipOnboarding: skipMutation.mutateAsync,
		setStep: stepMutation.mutateAsync,
		completeOnboarding: completeMutation.mutateAsync,
		invalidate,
	}
}
