import { useState } from "react"
import { UserRound } from "lucide-react"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileContactEditor } from "@/components/profile/contact-editor"
import { WorkExperienceEditor } from "@/components/profile/work-experience-editor"
import { EducationEditor } from "@/components/profile/education-editor"
import { LinksAdditionalEditor } from "@/components/profile/links-additional-editor"
import { DisclosureEditor } from "@/components/profile/disclosure-editor"
import { SkillsEditor } from "@/components/profile/skills-editor"
import { ResumeSection } from "@/components/profile/resume-section"
import { DASHBOARD_THEME } from "@/lib/dashboard-theme"
import {
	PROFILE_SECTION,
	type ProfileSection,
	PROFILE_SECTION_META,
} from "@/lib/profile-section"
import type {
	UserAdditionalInfoRow,
	UserDisclosureRow,
	UserEducationRow,
	UserLinkRow,
	UserProfileRow,
	UserSkillRow,
	UserWorkExperienceRow,
} from "@/types/database"
import { cn } from "@/lib/utils"
import type { AsyncResultMsg } from "@/types/types"

interface UserProfile {
	profile: UserProfileRow
	workExperiences: UserWorkExperienceRow[]
	educations: UserEducationRow[]
	links: UserLinkRow[]
	additionalInfo: UserAdditionalInfoRow | null
	disclosure: UserDisclosureRow | null
	skills: UserSkillRow[]
}

interface ProfileAutofillWorkspaceProps {
	userId: string | null
	userEmail: string | undefined
	userProfile: UserProfile

	onSaveProfile: (updatedProfile: UserProfileRow) => Promise<AsyncResultMsg>
	onAddWorkExperience: (newExperience: UserWorkExperienceRow) => Promise<AsyncResultMsg>
	onRemoveWorkExperience: (experienceId: string) => Promise<AsyncResultMsg>
	onSaveExperience: (
		id: string,
		patch: Partial<UserWorkExperienceRow>,
	) => Promise<AsyncResultMsg>
	onAddEducation: (newEducation: UserEducationRow) => Promise<AsyncResultMsg>
	onSaveEducation: (
		id: string,
		patch: Partial<UserEducationRow>,
	) => Promise<AsyncResultMsg>
	onRemoveEducation: (educationId: string) => Promise<AsyncResultMsg>
	onDeleteLink: (linkId: string) => Promise<AsyncResultMsg>
	onSaveAdditionalInfo: (additionalInfo: UserAdditionalInfoRow) => Promise<AsyncResultMsg>
	onAddSkill: (name: string) => Promise<AsyncResultMsg>
	onDeleteSkill: (skillId: string) => Promise<AsyncResultMsg>
	onRefetchProfile: () => void
	onSaveLink: (link: UserLinkRow) => Promise<AsyncResultMsg>
	onAddLink: (newLink: UserLinkRow) => Promise<AsyncResultMsg>
	onSaveDisclosure: (disclosure: UserDisclosureRow) => Promise<AsyncResultMsg>
}

export function ProfileAutofillWorkspace({
	userId,
	userEmail,
	userProfile,

	onSaveProfile,
	onAddWorkExperience,
	onRemoveWorkExperience,
	onSaveExperience,
	onAddEducation,
	onSaveEducation,
	onRemoveEducation,
	onDeleteLink,
	onSaveAdditionalInfo,
	onAddSkill,
	onDeleteSkill,
	onRefetchProfile,
	onSaveLink,
	onAddLink,
	onSaveDisclosure,
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
					refetchProfile={onRefetchProfile}
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
								userEmail={userEmail}
								profile={userProfile.profile}
								onSave={onSaveProfile}
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
						onAdd={onAddWorkExperience}
						onSave={onSaveExperience}
						onRemove={onRemoveWorkExperience}
					/>
				</TabsContent>

				<TabsContent
					value={PROFILE_SECTION.education}
					className="mt-6 space-y-4 focus-visible:outline-none"
				>
					<EducationEditor
						items={userProfile.educations}
						onAdd={onAddEducation}
						onSave={onSaveEducation}
						onRemove={onRemoveEducation}
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
						onDeleteLink={onDeleteLink}
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
						onAddSkill={onAddSkill}
						onDeleteSkill={onDeleteSkill}
					/>
				</TabsContent>
			</div>
		</Tabs>
	)
}
