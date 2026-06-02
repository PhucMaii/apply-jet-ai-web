import { CreditCard, Gauge, UserRound } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileAutofillWorkspace } from "@/components/profile/profile-autofill-workspace"
import { ProfileBillingPanel } from "@/components/profile/profile-billing-panel"
import { ProfileUsagePanel } from "@/components/profile/profile-usage-panel"
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
		
		refetchProfile,
		saveProfile,
		saveExperience,
		addWorkExperience,
		removeExperience,
		addEducation,
		saveEducation,
		removeEducation,
		onSaveAdditionalInfo,
		onSaveDisclosure,
		deleteLink,
		onAddLink,
		addSkill,
		deleteSkill,
		subscribeToPro,
		openBillingPortal,
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
								Autofill profile
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
								userEmail={user?.email}
								userProfile={userProfile}
								onSaveProfile={saveProfile}
								onAddWorkExperience={addWorkExperience}
								onSaveExperience={saveExperience}
								onRemoveWorkExperience={removeExperience}
								onAddEducation={addEducation}
								onSaveEducation={saveEducation}
								onRemoveEducation={removeEducation}
								onAddLink={onAddLink}
								onDeleteLink={deleteLink}
								onSaveAdditionalInfo={onSaveAdditionalInfo}
								onSaveLink={onSaveLink}
								onSaveDisclosure={onSaveDisclosure}
								onAddSkill={addSkill}
								onDeleteSkill={deleteSkill}
								onRefetchProfile={refetchProfile}
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
