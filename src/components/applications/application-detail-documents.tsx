import {
	FileText,
	Loader2,
	Mail,
	UserSearch,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DASHBOARD_THEME } from "@/lib/dashboard-theme"
import type {
	ApplicationDetailForm,
	GeneratedDocumentRow,
	RecruiterEmail,
} from "@/types/application-detail"
import { cn } from "@/lib/utils"
import GeneratedResumeTab from "./generated-resume-tab"
import GeneratedCoverLetterTab from "./generated-cover-letter-tab"
import FindHRTab from "./find-hr-tab"
import { useProfilePage } from "@/hooks/use-profile-page"
import { useUserSubscription } from "@/hooks/use-user-subscription"
import ProFeatureGuard, { ProFeatureBadge } from "../pro-feature-guard"
import useUserUsage from "@/hooks/use-user-usage"
import { useMemo } from "react"

interface ApplicationDetailDocumentsProps {
	form: ApplicationDetailForm
	generatedResume: GeneratedDocumentRow | null
	generatedCoverLetter: GeneratedDocumentRow | null
	recruiterEmails: RecruiterEmail[]
	refreshingDocuments?: boolean
	refetchApplication: () => void
}

export function ApplicationDetailDocuments({
	form,
	generatedResume,
	generatedCoverLetter,
	recruiterEmails,
	refreshingDocuments = false,
	refetchApplication,
}: ApplicationDetailDocumentsProps) {
	const { resumeText } = useProfilePage()
	const { plan } = useUserSubscription()
	const { usage } = useUserUsage()
	const isPro = plan === "pro"

	const isGuardResume = useMemo(() => {
		if (!usage) return false
		return usage.resume_generations_used >= usage.resume_generations_limit
	}, [usage])
	const isGuardCoverLetter = useMemo(() => {
		if (!usage) return false
		return usage.cover_letters_used >= usage.cover_letters_limit
	}, [usage])

	console.log(isGuardResume, isGuardCoverLetter, "isGuardResume, isGuardCoverLetter")



	return (
		<section
			className={cn(
				"relative rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-opacity duration-200 sm:p-6",
				refreshingDocuments && "opacity-90",
			)}
			aria-busy={refreshingDocuments}
		>
			{refreshingDocuments ? (
				<div
					className="pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center"
					aria-hidden
				>
					<span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/95 px-3 py-1.5 text-xs font-medium text-neutral-600 shadow-sm">
						<Loader2 className="size-3.5 animate-spin text-primary" />
						Updating documents…
					</span>
				</div>
			) : null}
			<Tabs defaultValue="resume" className="w-full">
				<TabsList
					className={cn(
						DASHBOARD_THEME.mainTabsList,
						DASHBOARD_THEME.mainTabsListThree,
					)}
				>
					<TabsTrigger
						value="resume"
						className={DASHBOARD_THEME.mainTabsTrigger}
					>
						<FileText className="size-4 shrink-0 opacity-80" aria-hidden />
						Resume
						{isGuardResume ? <ProFeatureBadge /> : null}
					</TabsTrigger>
					<TabsTrigger
						value="cover"
						className={DASHBOARD_THEME.mainTabsTrigger}
					>
						<Mail className="size-4 shrink-0 opacity-80" aria-hidden />
						<span className="hidden min-[420px]:inline">Cover letter</span>
						{isGuardCoverLetter ? <ProFeatureBadge /> : null}
					</TabsTrigger>
					<TabsTrigger
						value="hr-email"
						className={DASHBOARD_THEME.mainTabsTrigger}
					>
						<UserSearch className="size-4 shrink-0 opacity-80" aria-hidden />
						HR contacts
						{!isPro ? <ProFeatureBadge /> : null}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="resume" className="mt-6 space-y-6 outline-none">
					<ProFeatureGuard isGuard={isGuardResume}>
						<GeneratedResumeTab
							generatedResume={generatedResume ?? null}
							resumeText={resumeText}
							form={form}
							refetchApplication={refetchApplication}
						/>
					</ProFeatureGuard>
				</TabsContent>

				<TabsContent value="cover" className="mt-6 space-y-6 outline-none">
					<ProFeatureGuard isGuard={isGuardCoverLetter}>
						<GeneratedCoverLetterTab
							form={form}
							generatedCoverLetter={generatedCoverLetter ?? null}
							refetchApplication={refetchApplication}
							resumeText={resumeText}
						/>
					</ProFeatureGuard>
				</TabsContent>

				<TabsContent value="hr-email" className="mt-6 space-y-6 outline-none">
					<ProFeatureGuard
						isGuard={!isPro}
						featureName="HR contacts"
						description="Find recruiter and hiring manager emails for this role with a Pro plan."
					>
						<FindHRTab
							recruiterEmails={recruiterEmails}
							form={form}
							refetchApplication={refetchApplication}
						/>
					</ProFeatureGuard>
				</TabsContent>
			</Tabs>
		</section>
	)
}