/** Tour lifecycle stored on `public.users.onboarding_tour_status`. */
export const ONBOARDING_TOUR_STATUS = {
	pending: "pending",
	active: "active",
	idle: "idle",
} as const

export type OnboardingTourStatus =
	(typeof ONBOARDING_TOUR_STATUS)[keyof typeof ONBOARDING_TOUR_STATUS]

/** Ordered steps for the guided first-run tour. */
export const ONBOARDING_STEP = {
	welcome: "welcome",
	uploadResume: "upload_resume",
	autofillProfile: "autofill_profile",
	reviewContact: "review_contact",
	reviewWork: "review_work",
	reviewEducation: "review_education",
	reviewProjects: "review_projects",
	reviewLinks: "review_links",
	reviewSkills: "review_skills",
	navigateApplications: "navigate_applications",
	createApplication: "create_application",
	resumeStudioEditor: "resume_studio_editor",
	resumeStudioPreview: "resume_studio_preview",
	resumeStudioJobPanel: "resume_studio_job_panel",
	completed: "completed",
} as const

export type OnboardingStepId =
	(typeof ONBOARDING_STEP)[keyof typeof ONBOARDING_STEP]

/** Legacy step ids from earlier tour versions. */
const LEGACY_GENERATE_RESUME_STEP = "generate_resume"
const LEGACY_REVIEW_DISCLOSURE_STEP = "review_disclosure"

export interface OnboardingState {
	onboarding_tour_status: OnboardingTourStatus | null
	onboarding_current_step: string | null
}

export function parseOnboardingStep(
	raw: string | null | undefined,
): OnboardingStepId | null {
	if (!raw) return null
	if (raw === LEGACY_GENERATE_RESUME_STEP) {
		return ONBOARDING_STEP.resumeStudioEditor
	}
	if (raw === LEGACY_REVIEW_DISCLOSURE_STEP) {
		return ONBOARDING_STEP.navigateApplications
	}
	const values = Object.values(ONBOARDING_STEP) as string[]
	if (!values.includes(raw)) return null
	return raw as OnboardingStepId
}

/** How the user advances away from a step. */
export type OnboardingAdvanceMode =
	| "manual"
	| "action"
	| "route"

export interface OnboardingStepDefinition {
	id: OnboardingStepId
	target: string
	title: string
	description: string
	advanceMode: OnboardingAdvanceMode
	showNextButton: boolean
}
