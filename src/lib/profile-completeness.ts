import { PROFILE_SECTION, type ProfileSection } from "@/lib/profile-section"
import type { UserProfileRow } from "@/types/database"

export interface ProfileCompletenessInput {
	profile: Pick<
		UserProfileRow,
		"first_name" | "last_name" | "phone" | "summary" | "target_role"
	> | null
	workExperiences: readonly unknown[]
	educations: readonly unknown[]
	skills: readonly unknown[]
	links: readonly unknown[]
	hasResume: boolean
}

export interface ProfileChecklistItem {
	key: string
	label: string
	section: ProfileSection
	isDone: boolean
}

const MIN_SKILLS = 5

function hasText(value: string | null | undefined): boolean {
	return Boolean(value?.trim())
}

export function getProfileChecklist(
	input: ProfileCompletenessInput,
): ProfileChecklistItem[] {
	const { profile } = input

	return [
		{
			key: "resume",
			label: "Upload your resume",
			section: PROFILE_SECTION.resume,
			isDone: input.hasResume,
		},
		{
			key: "contact",
			label: "Add your name and phone",
			section: PROFILE_SECTION.contact,
			isDone:
				hasText(profile?.first_name) &&
				hasText(profile?.last_name) &&
				hasText(profile?.phone),
		},
		{
			key: "target-role",
			label: "Set a target role",
			section: PROFILE_SECTION.contact,
			isDone: hasText(profile?.target_role),
		},
		{
			key: "summary",
			label: "Write a short summary",
			section: PROFILE_SECTION.contact,
			isDone: hasText(profile?.summary),
		},
		{
			key: "work",
			label: "Add work experience",
			section: PROFILE_SECTION.work,
			isDone: input.workExperiences.length > 0,
		},
		{
			key: "education",
			label: "Add education",
			section: PROFILE_SECTION.education,
			isDone: input.educations.length > 0,
		},
		{
			key: "skills",
			label: `Add at least ${MIN_SKILLS} skills`,
			section: PROFILE_SECTION.skills,
			isDone: input.skills.length >= MIN_SKILLS,
		},
		{
			key: "links",
			label: "Add a LinkedIn or portfolio link",
			section: PROFILE_SECTION.links,
			isDone: input.links.length > 0,
		},
	]
}

export function getProfileCompletion(items: readonly ProfileChecklistItem[]): number {
	if (items.length === 0) return 0
	const done = items.filter((item) => item.isDone).length
	return Math.round((done / items.length) * 100)
}
