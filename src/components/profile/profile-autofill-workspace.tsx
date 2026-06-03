import { useState } from "react"
import { Tabs } from "@/components/ui/tabs"
import { ResumeSection } from "@/components/profile/resume-section"
import { DASHBOARD_THEME } from "@/lib/dashboard-theme"
import {
	PROFILE_SECTION,
	PROFILE_SECTION_META,
	type ProfileSection,
} from "@/lib/profile-section"
import { TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card"
import { cn } from "@/lib/utils"
import { UserRound } from "lucide-react"
import { ProfileContactEditor } from "./contact-editor"
import { WorkExperienceEditor } from "./work-experience-editor"
import { EducationEditor } from "./education-editor"
import { ProjectsEditor } from "./projects-editor"
import { LinksAdditionalEditor } from "./links-additional-editor"
import { DisclosureEditor } from "./disclosure-editor"
import { SkillsEditor } from "./skills-editor"
import type {
	UserLinkRow,
	UserDisclosureRow,
	UserAdditionalInfoRow,
	UserEducationRow,
	UserProfileRow,
	UserProjectRow,
	UserWorkExperienceRow,
} from "@/types/database"
import type { AsyncResultMsg } from "@/types/types"

interface ProfileAutofillWorkspaceProps {
	userId: string | null
	userProfile: any;
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
	addSkill: (skill: string) => Promise<AsyncResultMsg>
	deleteSkill: (skillId: string) => Promise<AsyncResultMsg>
	onSaveDisclosure: (disclosure: UserDisclosureRow) => Promise<AsyncResultMsg>
	onAddLink: (link: UserLinkRow) => Promise<AsyncResultMsg>
	onSaveLink: (link: UserLinkRow) => Promise<AsyncResultMsg>
	refetchProfile: () => void
}

export function ProfileAutofillWorkspace({
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
	onSaveDisclosure,
	onAddLink,
	onSaveLink,
	refetchProfile,

}: ProfileAutofillWorkspaceProps) {
	const [profileSection, setProfileSection] = useState<ProfileSection>(
		PROFILE_SECTION.contact,
	)

	return (
		<Tabs
			value={profileSection}
			onValueChange={(value) => setProfileSection(value as ProfileSection)}
			className="w-full"
		>
			<TabsList className={DASHBOARD_THEME.sectionTabsList}>
				{(Object.keys(PROFILE_SECTION) as ProfileSection[]).map((key) => {
					const meta = PROFILE_SECTION_META[key]
					const SectionIcon = meta.Icon
					return (
						<TabsTrigger
							key={key}
							value={key}
							className={DASHBOARD_THEME.sectionTabsTrigger}
						>
							<SectionIcon
								className="size-3.5 shrink-0 opacity-80"
								aria-hidden
							/>
							{meta.label}
						</TabsTrigger>
					)
				})}
			</TabsList>

			<div className={DASHBOARD_THEME.contentPanel}>
				<ResumeSection
					userId={userId}
					refetchProfile={refetchProfile}
				/>

				<TabsContent
					value={PROFILE_SECTION.contact}
					className="mt-6 space-y-4 focus-visible:outline-none"
				>
					<Card variant="solid" className={DASHBOARD_THEME.card}>
						<CardHeader className="space-y-3 bg-white pb-2">
							<CardTitle className="flex items-start gap-3 font-display text-xl text-neutral-900">
								<span
									className={cn(
										"flex size-10 shrink-0 items-center justify-center",
										DASHBOARD_THEME.cardIconWrap,
									)}
								>
									<UserRound className="size-5" aria-hidden />
								</span>
								<span className="pt-0.5">
									Contact &amp; application details
								</span>
							</CardTitle>
							<CardDescription
								className={cn(
									"pl-[3.25rem] text-pretty leading-relaxed",
									DASHBOARD_THEME.cardDescription,
								)}
							>
								We use this information for autofill in job applications.
								Your login email is managed by your auth provider; you can
								store a different contact email below if needed.
							</CardDescription>
						</CardHeader>
						<CardContent className="bg-white">
							<ProfileContactEditor
								userEmail={userProfile.profile.email}
								profile={userProfile.profile}
								onSave={saveProfile}
							/>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent
					value={PROFILE_SECTION.work}
					className="mt-6 space-y-4 focus-visible:outline-none"
				>
					<WorkExperienceEditor
						items={userProfile.workExperiences}
						onAdd={addWorkExperience}
						onSave={saveExperience}
						onRemove={removeExperience}
					/>
				</TabsContent>

				<TabsContent
					value={PROFILE_SECTION.education}
					className="mt-6 space-y-4 focus-visible:outline-none"
				>
					<EducationEditor
						items={userProfile.educations}
						onAdd={addEducation}
						onSave={saveEducation}
						onRemove={removeEducation}
					/>
				</TabsContent>

				<TabsContent
					value={PROFILE_SECTION.projects}
					className="mt-6 space-y-4 focus-visible:outline-none"
				>
					<ProjectsEditor
						items={userProfile.projects}
						onAdd={addProject}
						onSave={saveProject}
						onRemove={removeProject}
					/>
				</TabsContent>

				<TabsContent
					value={PROFILE_SECTION.links}
					className="mt-6 space-y-4 focus-visible:outline-none"
				>
					<LinksAdditionalEditor
						links={userProfile.links}
						additionalInfo={userProfile.additionalInfo}
						onAddLink={onAddLink}
						onDeleteLink={deleteLink}
						onSaveLink={onSaveLink}
						onSaveAdditionalInfo={onSaveAdditionalInfo}
					/>
				</TabsContent>

				<TabsContent
					value={PROFILE_SECTION.disclosure}
					className="mt-6 space-y-4 focus-visible:outline-none"
				>
					<DisclosureEditor
						disclosure={userProfile.disclosure}
						onSave={onSaveDisclosure}
					/>
				</TabsContent>

				<TabsContent
					value={PROFILE_SECTION.skills}
					className="mt-6 space-y-4 focus-visible:outline-none"
				>
					<SkillsEditor
						items={userProfile.skills}
						onAddSkill={addSkill}
						onDeleteSkill={deleteSkill}
					/>
				</TabsContent>
			</div>
		</Tabs>
	)
}
