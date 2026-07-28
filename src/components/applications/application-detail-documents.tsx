import {
	FileText,
	Loader2,
	Mail,
	UserSearch,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ApplicationStatus } from "@/lib/application-status"
import type {
	ApplicationDetailForm,
	GeneratedDocumentRow,
	RecruiterEmail,
} from "@/types/application-detail"
import { cn } from "@/lib/utils"
import GeneratedCoverLetterTab from "./generated-cover-letter-tab"
import FindHRTab from "./find-hr-tab"
import { ResumeStudio } from "./resume-builder/resume-studio"
import { useProfilePage } from "@/hooks/use-profile-page"
import { useUserSubscription } from "@/hooks/use-user-subscription"
import ProFeatureGuard, { ProFeatureBadge } from "../pro-feature-guard"
import useUserUsage from "@/hooks/use-user-usage"
import { useMemo } from "react"
import type { AppResume } from "@/types/app-resume"

const DOCUMENT_TAB_TRIGGER = cn(
	"relative h-11 min-w-0 shrink-0 rounded-none border-b-2 border-transparent",
	"bg-transparent px-3 text-sm font-medium text-neutral-500 shadow-none",
	"transition-colors hover:text-neutral-800",
	"focus-visible:ring-0 focus-visible:ring-offset-0",
	"data-[state=active]:border-primary data-[state=active]:bg-transparent",
	"data-[state=active]:text-neutral-900 data-[state=active]:shadow-none",
	"sm:px-4",
)

interface ApplicationDetailDocumentsProps {
	form: ApplicationDetailForm
	status: ApplicationStatus
	createdAt: string
	generatedResume: GeneratedDocumentRow | null
	generatedCoverLetter: GeneratedDocumentRow | null
	recruiterEmails: RecruiterEmail[]
	refreshingDocuments?: boolean
	savingDetails?: boolean
	updatingStatus?: boolean
	isDeleting?: boolean
	appResume: AppResume | null
	onPatchForm: (patch: Partial<ApplicationDetailForm>) => void
	onSaveApplication: () => void
	onStatusChange: (status: ApplicationStatus) => void
	onDelete?: (applicationId: string) => Promise<{
		success: boolean
		message: string
	}>
	refetchApplication: () => void
}

export function ApplicationDetailDocuments({
	form,
	status,
	createdAt,
	generatedCoverLetter,
	recruiterEmails,
	refreshingDocuments = false,
	savingDetails = false,
	updatingStatus = false,
	isDeleting = false,
	appResume,
	onPatchForm,
	onSaveApplication,
	onStatusChange,
	onDelete,
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

	return (
		<section
			className={cn(
				"relative flex min-h-0 flex-1 flex-col",
				refreshingDocuments && "opacity-90",
			)}
			aria-busy={refreshingDocuments}
		>
			{refreshingDocuments ? (
				<div
					className="pointer-events-none absolute inset-x-0 top-2 z-20 flex justify-center"
					aria-hidden
				>
					<span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/95 px-3 py-1.5 text-xs font-medium text-neutral-600 shadow-sm">
						<Loader2 className="size-3.5 animate-spin text-primary" />
						Updating documents…
					</span>
				</div>
			) : null}

			<Tabs
				defaultValue="resume"
				className="flex min-h-0 flex-1 flex-col"
			>
				<div className="shrink-0 border-b border-neutral-200 bg-white px-3 sm:px-4">
					<TabsList
						className={cn(
							"h-auto w-full justify-start gap-0 rounded-none bg-transparent p-0",
							"overflow-x-auto",
						)}
					>
						<TabsTrigger
							value="resume"
							className={DOCUMENT_TAB_TRIGGER}
						>
							<FileText className="size-4 shrink-0 opacity-80" aria-hidden />
							<span className="ml-2">Resume</span>
							{isGuardResume ? <ProFeatureBadge /> : null}
						</TabsTrigger>
						<TabsTrigger
							value="cover"
							className={DOCUMENT_TAB_TRIGGER}
						>
							<Mail className="size-4 shrink-0 opacity-80" aria-hidden />
							<span className="hidden min-[420px]:inline ml-2">Cover letter</span>
							<span className="min-[420px]:hidden">Cover</span>
							{isGuardCoverLetter ? <ProFeatureBadge /> : null}
						</TabsTrigger>
						<TabsTrigger
							value="hr-email"
							className={DOCUMENT_TAB_TRIGGER}
						>
							<UserSearch className="size-4 shrink-0 opacity-80" aria-hidden />
							<span className="hidden min-[420px]:inline ml-2">HR contacts</span>
							<span className="min-[420px]:hidden">HR</span>
							{!isPro ? <ProFeatureBadge /> : null}
						</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent
					value="resume"
					className="mt-0 flex h-full min-h-0 flex-1 flex-col overflow-hidden outline-none data-[state=inactive]:hidden"
				>
					<ProFeatureGuard
						isGuard={isGuardResume}
						className="flex h-full min-h-0 flex-1 flex-col"
					>
						<ResumeStudio
							form={form}
							status={status}
							createdAt={createdAt}
							savingDetails={savingDetails}
							updatingStatus={updatingStatus}
							isDeleting={isDeleting}
							onPatchForm={onPatchForm}
							onSaveApplication={onSaveApplication}
							onStatusChange={onStatusChange}
							onDelete={onDelete}
							appResume={appResume}
						/>
					</ProFeatureGuard>
				</TabsContent>

				<TabsContent
					value="cover"
					className="mt-0 flex-1 overflow-y-auto outline-none data-[state=inactive]:hidden"
				>
					<div className="w-full max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
						<ProFeatureGuard isGuard={isGuardCoverLetter}>
							<GeneratedCoverLetterTab
								form={form}
								generatedCoverLetter={generatedCoverLetter ?? null}
								refetchApplication={refetchApplication}
								resumeText={resumeText}
							/>
						</ProFeatureGuard>
					</div>
				</TabsContent>

				<TabsContent
					value="hr-email"
					className="mt-0 flex-1 overflow-y-auto outline-none data-[state=inactive]:hidden"
				>
					<div className="w-full max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
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
					</div>
				</TabsContent>
			</Tabs>
		</section>
	)
}
