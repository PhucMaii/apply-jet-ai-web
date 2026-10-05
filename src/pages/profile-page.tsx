import { useCallback, useMemo } from "react"
import { AppPageHeader } from "@/components/layout/app-page-header"
import { ProfileAutofillWorkspace } from "@/components/profile/profile-autofill-workspace"
import { ProfileBillingPanel } from "@/components/profile/profile-billing-panel"
import { ProfileCompletenessCard } from "@/components/profile/profile-completeness-card"
import { ProfilePageAlerts } from "@/components/profile/profile-page-alerts"
import {
	ProfileSectionNav,
	type ProfileNavGroup,
} from "@/components/profile/profile-section-nav"
import { ProfileUsagePanel } from "@/components/profile/usage/profile-usage-panel"
import { Skeleton } from "@/components/ui/skeleton"
import { useProfilePage } from "@/hooks/use-profile-page"
import { hasUploadedResume, useUserResume } from "@/hooks/use-user-resume"
import { APP_PAGE_CONTAINER, PROFILE_TAB } from "@/lib/app-nav"
import {
	getProfileChecklist,
	getProfileCompletion,
} from "@/lib/profile-completeness"
import {
	PROFILE_ACCOUNT_META,
	PROFILE_SECTION,
	PROFILE_SECTION_META,
	isProfileSection,
	type ProfileSection,
} from "@/lib/profile-section"

const PROFILE_PAGE_COPY = {
	title: "Profile & resume",
	description:
		"Everything here feeds your tailored resumes. Fill it once, reuse it for every application.",
	profileGroup: "Profile",
	accountGroup: "Account",
} as const

const ACCOUNT_NAV_KEY = {
	usage: `tab:${PROFILE_TAB.usage}`,
	billing: `tab:${PROFILE_TAB.billing}`,
} as const
function ProfilePageSkeleton() {
	return (
		<div className="mt-8 grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]" aria-busy="true">
			<div className="hidden space-y-3 lg:block">
				<Skeleton className="h-28 rounded-xl" />
				{[0, 1, 2, 3, 4, 5].map((key) => (
					<Skeleton key={key} className="h-8" />
				))}
			</div>
			<div className="space-y-4">
				<Skeleton className="h-6 w-48" />
				<Skeleton className="h-4 w-80 max-w-full" />
				<Skeleton className="h-64 rounded-xl" />
			</div>
		</div>
	)
}

export function ProfilePage() {
	const {
		user,
		tab,
		setTab,
		section,
		setSection,
		loading,
		billingBusy,
		notice,
		error,
		subscription,
		userProfile,
		subscribeToPro,
		buyPack,
		openBillingPortal,
		refetchProfile,
		saveProfile,
		saveExperience,
		saveEducation,
		addWorkExperience,
		removeExperience,
		addEducation,
		addProject,
		saveProject,
		removeProject,
		onSaveAdditionalInfo,
		removeEducation,
		deleteLink,
		addSkill,
		deleteSkill,
		addSkillCategory,
		renameSkillCategory,
		deleteSkillCategory,
		onAddLink,
		onSaveLink,
	} = useProfilePage()
	const { resume } = useUserResume(user?.id)

	const checklist = useMemo(
		() =>
			getProfileChecklist({
				profile: userProfile?.profile ?? null,
				workExperiences: userProfile?.workExperiences ?? [],
				educations: userProfile?.educations ?? [],
				skills: userProfile?.skills ?? [],
				links: userProfile?.links ?? [],
				hasResume: hasUploadedResume(resume),
			}),
		[userProfile, resume],
	)
	const completion = getProfileCompletion(checklist)

	const navGroups = useMemo((): ProfileNavGroup[] => {
		const isSectionDone = (target: ProfileSection) => {
			const items = checklist.filter((item) => item.section === target)
			return items.length > 0 && items.every((item) => item.isDone)
		}
		return [
			{
				key: "profile",
				label: PROFILE_PAGE_COPY.profileGroup,
				items: Object.values(PROFILE_SECTION).map((key) => ({
					key,
					label: PROFILE_SECTION_META[key].label,
					Icon: PROFILE_SECTION_META[key].Icon,
					isDone: isSectionDone(key),
				})),
			},
			{
				key: "account",
				label: PROFILE_PAGE_COPY.accountGroup,
				items: [
					{ key: ACCOUNT_NAV_KEY.usage, ...PROFILE_ACCOUNT_META.usage },
					{ key: ACCOUNT_NAV_KEY.billing, ...PROFILE_ACCOUNT_META.billing },
				],
			},
		]
	}, [checklist])

	const activeKey =
		tab === PROFILE_TAB.usage
			? ACCOUNT_NAV_KEY.usage
			: tab === PROFILE_TAB.billing
				? ACCOUNT_NAV_KEY.billing
				: section

	const activeLabel =
		tab === PROFILE_TAB.usage
			? PROFILE_ACCOUNT_META.usage.label
			: tab === PROFILE_TAB.billing
				? PROFILE_ACCOUNT_META.billing.label
				: PROFILE_SECTION_META[section].label

	const handleSelectNav = useCallback(
		(key: string) => {
			if (key === ACCOUNT_NAV_KEY.usage) {
				setTab(PROFILE_TAB.usage)
			} else if (key === ACCOUNT_NAV_KEY.billing) {
				setTab(PROFILE_TAB.billing)
			} else if (isProfileSection(key)) {
				setSection(key)
			}
		},
		[setTab, setSection],
	)

	const handleOpenBilling = useCallback(() => {
		setTab(PROFILE_TAB.billing)
	}, [setTab])

	const handleSubscribe = useCallback(() => {
		void subscribeToPro()
	}, [subscribeToPro])

	return (
		<div className={APP_PAGE_CONTAINER}>
			<AppPageHeader
				title={PROFILE_PAGE_COPY.title}
				description={PROFILE_PAGE_COPY.description}
			/>

			<div className="mt-6 empty:hidden">
				<ProfilePageAlerts error={error} notice={notice} />
			</div>

			{loading || !userProfile ? (
				<ProfilePageSkeleton />
			) : (
				<div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
					<aside className="space-y-4 lg:sticky lg:top-8 lg:space-y-6 lg:self-start">
						<ProfileCompletenessCard
							percent={completion}
							items={checklist}
							onSelectSection={setSection}
						/>
						<ProfileSectionNav
							groups={navGroups}
							activeKey={activeKey}
							onSelect={handleSelectNav}
						/>
					</aside>

					<section aria-label={activeLabel} className="min-w-0">
						{tab === PROFILE_TAB.usage ? (
							<ProfileUsagePanel
								subscription={subscription ?? null}
								billingBusy={billingBusy}
								onSubscribe={handleSubscribe}
								onOpenBilling={handleOpenBilling}
							/>
						) : tab === PROFILE_TAB.billing ? (
							<ProfileBillingPanel
								subscription={subscription ?? null}
								billingBusy={billingBusy}
								onSubscribePro={handleSubscribe}
								onBuyPack={(packKey) => void buyPack(packKey)}
								onOpenPortal={() => void openBillingPortal()}
							/>
						) : (
							<ProfileAutofillWorkspace
								section={section}
								userId={user?.id ?? null}
								userProfile={userProfile}
								saveProfile={saveProfile}
								saveExperience={saveExperience}
								addWorkExperience={addWorkExperience}
								removeExperience={removeExperience}
								addEducation={addEducation}
								saveEducation={saveEducation}
								removeEducation={removeEducation}
								addProject={addProject}
								saveProject={saveProject}
								removeProject={removeProject}
								onSaveAdditionalInfo={onSaveAdditionalInfo}
								deleteLink={deleteLink}
								addSkill={addSkill}
								deleteSkill={deleteSkill}
								addSkillCategory={addSkillCategory}
								renameSkillCategory={renameSkillCategory}
								deleteSkillCategory={deleteSkillCategory}
								onAddLink={onAddLink}
								onSaveLink={onSaveLink}
								refetchProfile={refetchProfile}
							/>
						)}
					</section>
				</div>
			)}
		</div>
	)
}
