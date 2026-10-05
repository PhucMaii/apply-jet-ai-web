import type {
	SubscriptionRow,
	UserAdditionalInfoRow,
	UserEducationRow,
	UserLinkRow,
	UserProfileRow,
	UserProjectRow,
	UserSkillCategoryRow,
	UserSkillRow,
	UserWorkExperienceRow,
} from "@/types/database"

/** Shape returned by `useProfilePage().userProfile`. */
export interface ProfilePageData {
	profile: UserProfileRow
	subscription: SubscriptionRow | null
	workExperiences: UserWorkExperienceRow[]
	educations: UserEducationRow[]
	projects: UserProjectRow[]
	links: UserLinkRow[]
	additionalInfo: UserAdditionalInfoRow | null
	skills: UserSkillRow[]
	skillCategories: UserSkillCategoryRow[]
	resumeText: string | null
}
