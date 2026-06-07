/**
 * Stable DOM hooks for driver.js.
 * Attach as `data-tour={TOUR_TARGET.uploadResume}` on UI elements.
 */
export const TOUR_TARGET = {
	uploadResume: "upload-resume",
	autofillProfile: "autofill-profile",
	profileSection: (section: string) => `profile-section-${section}`,
	navApplications: "nav-applications",
	newApplication: "new-application",
	createApplicationSubmit: "create-application-submit",
	generateResume: "generate-resume",
} as const

export function tourSelector(target: string): string {
	return `[data-tour="${target}"]`
}
