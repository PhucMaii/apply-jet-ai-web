import { UserRound } from "lucide-react"
import { PgwpTrackerCompact } from "@/components/pgwp/pgwp-tracker-compact"
import { ResumeSection } from "@/components/profile/resume-section"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FEATURES } from "@/lib/features"
import { PROFILE_SECTION, type ProfileSection } from "@/lib/profile-section"
import { PROFILE_SURFACE } from "@/lib/profile-surface"
import { DASHBOARD_THEME } from "@/lib/dashboard-theme"
import { ProfileContactEditor } from "./contact-editor"
import { WorkExperienceEditor } from "./work-experience-editor"
import { EducationEditor } from "./education-editor"
import { ProjectsEditor } from "./projects-editor"
import { LinksAdditionalEditor } from "./links-additional-editor"
import { SkillsEditor } from "./skills-editor"
import type {
	UserLinkRow,
	UserAdditionalInfoRow,
	UserEducationRow,
	UserProfileRow,
	UserProjectRow,
	UserWorkExperienceRow,
} from "@/types/database"
import type { ProfilePageData } from "@/types/profile-page"
import type { AsyncResultMsg } from "@/types/types"

const CONTACT_CARD_COPY = {
	title: "Personal info",
	description: "Name, contact details, target role, and a short summary.",
} as const

interface ProfileAutofillWorkspaceProps {
	section: ProfileSection
	userId: string | null
	userProfile: ProfilePageData
	saveProfile: (profile: UserProfileRow) => Promise<AsyncResultMsg>
	saveExperience: (experienceId: string, patch: Partial<UserWorkExperienceRow>) => Promise<AsyncResultMsg>
	addWorkExperience: (experience: UserWorkExperienceRow) => Promise<AsyncResultMsg>
	removeExperience: (experienceId: string) => Promise<AsyncResultMsg>
	addEducation: (education: UserEducationRow) => Promise<AsyncResultMsg>
	saveEducation: (educationId: string, patch: Partial<UserEducationRow>) => Promise<AsyncResultMsg>
	removeEducation: (educationId: string) => Promise<AsyncResultMsg>
	addProject: (project: UserProjectRow) => Promise<AsyncResultMsg>
	saveProject: (projectId: string, patch: Partial<UserProjectRow>) => Promise<AsyncResultMsg>
	removeProject: (projectId: string) => Promise<AsyncResultMsg>
	onSaveAdditionalInfo: (additionalInfo: UserAdditionalInfoRow) => Promise<AsyncResultMsg>
	deleteLink: (linkId: string) => Promise<AsyncResultMsg>
	addSkill: (
		name: string,
		categoryId: string | null,
	) => Promise<AsyncResultMsg>
	deleteSkill: (skillId: string) => Promise<AsyncResultMsg>
	addSkillCategory: (name: string) => Promise<AsyncResultMsg>
	renameSkillCategory: (
		categoryId: string,
		name: string,
	) => Promise<AsyncResultMsg>
	deleteSkillCategory: (categoryId: string) => Promise<AsyncResultMsg>
	onAddLink: (link: UserLinkRow) => Promise<AsyncResultMsg>
	onSaveLink: (link: UserLinkRow) => Promise<AsyncResultMsg>
	refetchProfile: () => void
}

export function ProfileAutofillWorkspace({
	section,
	userId,
	userProfile,
	saveProfile,
	saveExperience,
	addWorkExperience,
	removeExperience,
	addEducation,
	saveEducation,
	removeEducation,
	addProject,
	saveProject,
	removeProject,
	onSaveAdditionalInfo,
	deleteLink,
	addSkill,
	deleteSkill,
	addSkillCategory,
	renameSkillCategory,
	deleteSkillCategory,
	onAddLink,
	onSaveLink,
	refetchProfile,
}: ProfileAutofillWorkspaceProps) {
	switch (section) {
		case PROFILE_SECTION.resume:
			return (
				<div className="space-y-6">
					{FEATURES.pgwp ? <PgwpTrackerCompact /> : null}
					<ResumeSection userId={userId} refetchProfile={refetchProfile} />
				</div>
			)
		case PROFILE_SECTION.contact:
			return (
				<Card variant="solid" className={DASHBOARD_THEME.card}>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 font-display">
							<UserRound className={PROFILE_SURFACE.sectionIcon} aria-hidden />
							{CONTACT_CARD_COPY.title}
						</CardTitle>
						<CardDescription>{CONTACT_CARD_COPY.description}</CardDescription>
					</CardHeader>
					<CardContent>
						<ProfileContactEditor
							userEmail={userProfile.profile.email}
							profile={userProfile.profile}
							onSave={saveProfile}
						/>
					</CardContent>
				</Card>
			)
		case PROFILE_SECTION.work:
			return (
				<WorkExperienceEditor
					items={userProfile.workExperiences}
					onAdd={addWorkExperience}
					onSave={saveExperience}
					onRemove={removeExperience}
				/>
			)
		case PROFILE_SECTION.education:
			return (
				<EducationEditor
					items={userProfile.educations}
					onAdd={addEducation}
					onSave={saveEducation}
					onRemove={removeEducation}
				/>
			)
		case PROFILE_SECTION.projects:
			return (
				<ProjectsEditor
					items={userProfile.projects}
					onAdd={addProject}
					onSave={saveProject}
					onRemove={removeProject}
				/>
			)
		case PROFILE_SECTION.links:
			return (
				<LinksAdditionalEditor
					links={userProfile.links}
					additionalInfo={userProfile.additionalInfo}
					onAddLink={onAddLink}
					onDeleteLink={deleteLink}
					onSaveLink={onSaveLink}
					onSaveAdditionalInfo={onSaveAdditionalInfo}
				/>
			)
		case PROFILE_SECTION.skills:
			return (
				<SkillsEditor
					categories={userProfile.skillCategories ?? []}
					skills={userProfile.skills ?? []}
					onAddCategory={addSkillCategory}
					onRenameCategory={renameSkillCategory}
					onDeleteCategory={deleteSkillCategory}
					onAddSkill={addSkill}
					onDeleteSkill={deleteSkill}
				/>
			)
	}
}
