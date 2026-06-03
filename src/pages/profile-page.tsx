import { CreditCard, Gauge, UserRound } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileAutofillWorkspace } from "@/components/profile/profile-autofill-workspace"
import { ProfileBillingPanel } from "@/components/profile/profile-billing-panel"
import { ProfileUsagePanel } from "@/components/profile/usage/profile-usage-panel"
import { ProfileLoadingState } from "@/components/profile/profile-loading-state"
import { ProfilePageAlerts } from "@/components/profile/profile-page-alerts"
import { PageHeader } from "@/components/page-header"
import { useAuth } from "@/context/auth-context"
import { useProfilePage } from "@/hooks/use-profile-page"
import { DASHBOARD_THEME } from "@/lib/dashboard-theme"
import { PAGE_HEADER_COPY } from "@/lib/page-header-copy"
import { cn } from "@/lib/utils"

export function ProfilePage() {
	const { signOut } = useAuth()
	const {
		user,
		tab,
		setTab,
		loading,
		billingBusy,
		notice,
		error,
		subscription,
		userProfile,
		subscribeToPro,
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
		onSaveDisclosure,
		onAddLink,
		onSaveLink,
	} = useProfilePage()

	const accountInitials = (
		user?.email?.split("@")[0]?.slice(0, 2) || "?"
	).toUpperCase()

	return (
		<div className={DASHBOARD_THEME.page}>
			<PageHeader
				title={PAGE_HEADER_COPY.profileTitle}
				description={PAGE_HEADER_COPY.profileDescription}
				userEmail={user?.email}
				accountInitials={accountInitials}
				onSignOut={signOut}
			/>

			<main className={DASHBOARD_THEME.main}>
				<ProfilePageAlerts error={error} notice={notice} />

				{loading || !userProfile ? (
					<ProfileLoadingState />
				) : (
					<Tabs value={tab} onValueChange={setTab} className="w-full">
						<TabsList
							className={cn(
								DASHBOARD_THEME.mainTabsList,
								DASHBOARD_THEME.mainTabsListThree,
							)}
						>
							<TabsTrigger
								value="profile"
								className={DASHBOARD_THEME.mainTabsTrigger}
							>
								<UserRound className="size-4 shrink-0 opacity-80" aria-hidden />
								Resume
							</TabsTrigger>
							<TabsTrigger
								value="usage"
								className={DASHBOARD_THEME.mainTabsTrigger}
							>
								<Gauge className="size-4 shrink-0 opacity-80" aria-hidden />
								Usage
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
								onSaveDisclosure={onSaveDisclosure}
								onAddLink={onAddLink}
								onSaveLink={onSaveLink}
								refetchProfile={refetchProfile}
							/>
						</TabsContent>

						<TabsContent value="usage" className="mt-6 outline-none">
							<ProfileUsagePanel
								subscription={subscription}
								billingBusy={billingBusy}
								onSubscribe={() => void subscribeToPro()}
								onOpenBilling={() => setTab("billing")}
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
