import { PROFILE_SECTION } from "@/lib/profile-section"
import { ONBOARDING_STEP_COPY } from "@/lib/onboarding/copy"
import { TOUR_TARGET, tourSelector } from "@/lib/onboarding/selectors"
import {
	ONBOARDING_STEP,
	type OnboardingAdvanceMode,
	type OnboardingStepDefinition,
	type OnboardingStepId,
} from "@/lib/onboarding/types"

/** Canonical step order — single source of truth for the state machine. */
export const ONBOARDING_STEP_ORDER: OnboardingStepId[] = [
	ONBOARDING_STEP.welcome,
	ONBOARDING_STEP.uploadResume,
	ONBOARDING_STEP.autofillProfile,
	ONBOARDING_STEP.reviewContact,
	ONBOARDING_STEP.reviewWork,
	ONBOARDING_STEP.reviewEducation,
	ONBOARDING_STEP.reviewProjects,
	ONBOARDING_STEP.reviewLinks,
	ONBOARDING_STEP.reviewSkills,
	ONBOARDING_STEP.reviewDisclosure,
	ONBOARDING_STEP.navigateApplications,
	ONBOARDING_STEP.createApplication,
	ONBOARDING_STEP.generateResume,
	ONBOARDING_STEP.completed,
]

const REVIEW_SECTION_BY_STEP: Partial<
	Record<OnboardingStepId, (typeof PROFILE_SECTION)[keyof typeof PROFILE_SECTION]>
> = {
	[ONBOARDING_STEP.reviewContact]: PROFILE_SECTION.contact,
	[ONBOARDING_STEP.reviewWork]: PROFILE_SECTION.work,
	[ONBOARDING_STEP.reviewEducation]: PROFILE_SECTION.education,
	[ONBOARDING_STEP.reviewProjects]: PROFILE_SECTION.projects,
	[ONBOARDING_STEP.reviewLinks]: PROFILE_SECTION.links,
	[ONBOARDING_STEP.reviewSkills]: PROFILE_SECTION.skills,
	[ONBOARDING_STEP.reviewDisclosure]: PROFILE_SECTION.disclosure,
}

function buildStep(
	id: Exclude<OnboardingStepId, "welcome" | "completed">,
	target: string,
	advanceMode: OnboardingAdvanceMode,
	showNextButton: boolean,
): OnboardingStepDefinition {
	const copy = ONBOARDING_STEP_COPY[id]
	return {
		id,
		target: tourSelector(target),
		title: copy.title,
		description: copy.description,
		advanceMode,
		showNextButton,
	}
}

/** Tour definitions keyed by step id (excluding welcome/completed modal-only steps). */
export const ONBOARDING_TOUR_STEPS: Partial<
	Record<OnboardingStepId, OnboardingStepDefinition>
> = {
	[ONBOARDING_STEP.uploadResume]: buildStep(
		ONBOARDING_STEP.uploadResume,
		TOUR_TARGET.uploadResume,
		"action",
		false,
	),
	[ONBOARDING_STEP.autofillProfile]: buildStep(
		ONBOARDING_STEP.autofillProfile,
		TOUR_TARGET.autofillProfile,
		"action",
		false,
	),
	[ONBOARDING_STEP.reviewContact]: buildStep(
		ONBOARDING_STEP.reviewContact,
		TOUR_TARGET.profileSection(PROFILE_SECTION.contact),
		"manual",
		true,
	),
	[ONBOARDING_STEP.reviewWork]: buildStep(
		ONBOARDING_STEP.reviewWork,
		TOUR_TARGET.profileSection(PROFILE_SECTION.work),
		"manual",
		true,
	),
	[ONBOARDING_STEP.reviewEducation]: buildStep(
		ONBOARDING_STEP.reviewEducation,
		TOUR_TARGET.profileSection(PROFILE_SECTION.education),
		"manual",
		true,
	),
	[ONBOARDING_STEP.reviewProjects]: buildStep(
		ONBOARDING_STEP.reviewProjects,
		TOUR_TARGET.profileSection(PROFILE_SECTION.projects),
		"manual",
		true,
	),
	[ONBOARDING_STEP.reviewLinks]: buildStep(
		ONBOARDING_STEP.reviewLinks,
		TOUR_TARGET.profileSection(PROFILE_SECTION.links),
		"manual",
		true,
	),
	[ONBOARDING_STEP.reviewSkills]: buildStep(
		ONBOARDING_STEP.reviewSkills,
		TOUR_TARGET.profileSection(PROFILE_SECTION.skills),
		"manual",
		true,
	),
	[ONBOARDING_STEP.reviewDisclosure]: buildStep(
		ONBOARDING_STEP.reviewDisclosure,
		TOUR_TARGET.profileSection(PROFILE_SECTION.disclosure),
		"manual",
		true,
	),
	[ONBOARDING_STEP.navigateApplications]: buildStep(
		ONBOARDING_STEP.navigateApplications,
		TOUR_TARGET.navApplications,
		"route",
		false,
	),
	[ONBOARDING_STEP.createApplication]: buildStep(
		ONBOARDING_STEP.createApplication,
		TOUR_TARGET.newApplication,
		"route",
		false,
	),
	[ONBOARDING_STEP.generateResume]: buildStep(
		ONBOARDING_STEP.generateResume,
		TOUR_TARGET.generateResume,
		"action",
		false,
	),
}

export function getNextStep(
	current: OnboardingStepId,
): OnboardingStepId | null {
	const index = ONBOARDING_STEP_ORDER.indexOf(current)
	if (index === -1 || index >= ONBOARDING_STEP_ORDER.length - 1) return null
	return ONBOARDING_STEP_ORDER[index + 1] ?? null
}

export function isReviewStep(step: OnboardingStepId): boolean {
	return step in REVIEW_SECTION_BY_STEP
}

export function getReviewSectionForStep(
	step: OnboardingStepId,
): string | null {
	return REVIEW_SECTION_BY_STEP[step] ?? null
}

export function resolveCreateApplicationTarget(pathname: string): string {
	if (pathname.endsWith("/new")) {
		return tourSelector(TOUR_TARGET.createApplicationSubmit)
	}
	return tourSelector(TOUR_TARGET.newApplication)
}
