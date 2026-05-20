import { CreditCard, UserRound } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileAutofillWorkspace } from "@/components/profile/profile-autofill-workspace"
import { ProfileBillingPanel } from "@/components/profile/profile-billing-panel"
import { ProfileLoadingState } from "@/components/profile/profile-loading-state"
import { ProfilePageAlerts } from "@/components/profile/profile-page-alerts"
import { ProfilePageHeader } from "@/components/profile/profile-page-header"
import { useAuth } from "@/context/auth-context"
import { useProfilePage } from "@/hooks/use-profile-page"
import { DASHBOARD_THEME } from "@/lib/dashboard-theme"

export function ProfilePage() {
	const { signOut } = useAuth()
	const {
		user,
		tab,
		setTab,
		loading,
		saving,
		billingBusy,
		notice,
		error,
		profile,
		setProfile,
		subscription,
		workExperiences,
		setWorkExperiences,
		educations,
		setEducations,
		disclosure,
		setDisclosure,
		links,
		setLinks,
		additionalInfo,
		setAdditionalInfo,
		skills,
		setSkills,
		loadData,
		saveProfile,
		saveExperience,
		saveEducation,
		addWorkExperience,
		addEducation,
		saveLinksAndAdditionalInfo,
		deleteLink,
		addLink,
		addSkill,
		deleteSkill,
		subscribeToPro,
		openBillingPortal,
	} = useProfilePage()

	const accountInitials = (
		user?.email?.split("@")[0]?.slice(0, 2) || "?"
	).toUpperCase()

	return (
		<div className={DASHBOARD_THEME.page}>
			<ProfilePageHeader
				userEmail={user?.email}
				accountInitials={accountInitials}
				onSignOut={signOut}
			/>

			<main className={DASHBOARD_THEME.main}>
				<ProfilePageAlerts error={error} notice={notice} />

				{loading || !profile ? (
					<ProfileLoadingState />
				) : (
					<Tabs value={tab} onValueChange={setTab} className="w-full">
						<TabsList className={DASHBOARD_THEME.mainTabsList}>
							<TabsTrigger
								value="profile"
								className={DASHBOARD_THEME.mainTabsTrigger}
							>
								<UserRound className="size-4 shrink-0 opacity-80" aria-hidden />
								Autofill profile
							</TabsTrigger>
							<TabsTrigger
								value="billing"
								className={DASHBOARD_THEME.mainTabsTrigger}
							>
								<CreditCard className="size-4 shrink-0 opacity-80" aria-hidden />
								Billing
							</TabsTrigger>
						</TabsList>

						<TabsContent value="profile" className="mt-6 outline-none">
							<ProfileAutofillWorkspace
								userId={user?.id ?? null}
								userEmail={user?.email}
								profile={profile}
								setProfile={setProfile}
								saving={saving}
								onSaveProfile={(e) => void saveProfile(e)}
								workExperiences={workExperiences}
								setWorkExperiences={setWorkExperiences}
								onAddWorkExperience={addWorkExperience}
								onSaveExperience={saveExperience}
								educations={educations}
								setEducations={setEducations}
								onAddEducation={addEducation}
								onSaveEducation={saveEducation}
								links={links}
								setLinks={setLinks}
								additionalInfo={additionalInfo}
								setAdditionalInfo={setAdditionalInfo}
								onAddLink={addLink}
								onDeleteLink={deleteLink}
								onSaveLinksAndAdditional={() =>
									saveLinksAndAdditionalInfo()
								}
								disclosure={disclosure}
								setDisclosure={setDisclosure}
								skills={skills}
								setSkills={setSkills}
								onCreateSkill={addSkill}
								onDeleteSkill={deleteSkill}
								onRefetchProfile={() => loadData()}
							/>
						</TabsContent>

						<TabsContent value="billing" className="mt-6 outline-none">
							<ProfileBillingPanel
								subscription={subscription}
								billingBusy={billingBusy}
								onSubscribe={() => void subscribeToPro()}
								onOpenPortal={() => void openBillingPortal()}
							/>
						</TabsContent>
					</Tabs>
				)}
			</main>
		</div>
	)
}
