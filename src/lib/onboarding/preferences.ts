import { supabase } from "@/lib/supabase"
import {
	ONBOARDING_STEP,
	ONBOARDING_TOUR_STATUS,
	type OnboardingState,
	type OnboardingStepId,
	type OnboardingTourStatus,
} from "@/lib/onboarding/types"

const STATE_SELECT = "onboarding_tour_status, onboarding_current_step"

export async function fetchOnboardingState(
	userId: string,
): Promise<OnboardingState | null> {
	const { data, error } = await supabase
		.from("users")
		.select(STATE_SELECT)
		.eq("id", userId)
		.maybeSingle()

	if (error) {
		console.error("Something went wrong fetching onboarding state:", error)
		throw error
	}

	return data as OnboardingState | null
}

interface UpdateOnboardingPatch {
	onboarding_tour_status?: OnboardingTourStatus
	onboarding_current_step?: OnboardingStepId | null
}

async function patchOnboardingState(
	userId: string,
	patch: UpdateOnboardingPatch,
): Promise<void> {
	const { error } = await supabase.from("users").update(patch).eq("id", userId)

	if (error) {
		console.error("Something went wrong updating onboarding state:", error)
		throw error
	}
}

export async function activateGuidedTour(
	userId: string,
	step: OnboardingStepId = ONBOARDING_STEP.uploadResume,
): Promise<void> {
	await patchOnboardingState(userId, {
		onboarding_tour_status: ONBOARDING_TOUR_STATUS.active,
		onboarding_current_step: step,
	})
}

export async function skipOnboarding(userId: string): Promise<void> {
	await patchOnboardingState(userId, {
		onboarding_tour_status: ONBOARDING_TOUR_STATUS.idle,
		onboarding_current_step: ONBOARDING_STEP.completed,
	})
}

export async function setOnboardingStep(
	userId: string,
	step: OnboardingStepId,
): Promise<void> {
	await patchOnboardingState(userId, {
		onboarding_current_step: step,
	})
}

export async function completeOnboarding(userId: string): Promise<void> {
	await patchOnboardingState(userId, {
		onboarding_tour_status: ONBOARDING_TOUR_STATUS.idle,
		onboarding_current_step: ONBOARDING_STEP.completed,
	})
}
