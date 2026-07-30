import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Loader2 } from "lucide-react"
import { ApplicationDetailDocuments } from "@/components/applications/application-detail-documents"
import { APPLICATIONS_THEME } from "@/lib/applications-theme"
import { ROUTES } from "@/lib/constants"
import { useApplicationDetail } from "@/hooks/use-application-detail"
import { useApplications } from "@/hooks/use-applications"
import { cn } from "@/lib/utils"

export function ApplicationDetailPage() {
	const { applicationId } = useParams<{ applicationId: string }>()
	const {
		isLoadingApplication,
		isNotFound,
		record,
		form,
		isRefetchingApplication,
		savingDetails,
		updatingStatus,
		error,
		notice,
		appResume,
		refetchApplication,
		saveApplication,
		updateStatus,
		resolveStatus,
		patchForm,
		saveAppResumeBlock,
		createAppResumeSkillCategory,
		ensureAppResumeSkillsSection,
		deleteAppResumeBlock,
	} = useApplicationDetail(applicationId)

	const { deleteApplication, deletingId } = useApplications()

	if (isLoadingApplication) {
		return (
			<div className="flex h-dvh flex-col overflow-hidden bg-neutral-50">
				<div
					className="flex flex-1 flex-col items-center justify-center gap-3"
					aria-busy="true"
				>
					<Loader2
						className="size-8 animate-spin text-primary"
						aria-hidden
					/>
					<span className={APPLICATIONS_THEME.muted}>
						Loading application…
					</span>
				</div>
			</div>
		)
	}

	if (isNotFound || !record || !form) {
		return (
			<div className="flex h-dvh flex-col overflow-hidden bg-neutral-50">
				{error && !isNotFound ? (
					<div className="shrink-0 border-b border-red-200 bg-red-50 px-4 py-2">
						<p className="text-sm text-red-700" role="alert">
							{error}
						</p>
					</div>
				) : null}
				<div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
					<p className={APPLICATIONS_THEME.muted}>
						{isNotFound || !record
							? "Application not found."
							: "No data found."}
					</p>
					<Link
						to={ROUTES.applications}
						className={cn(
							"inline-flex items-center gap-1.5 text-sm font-medium",
							APPLICATIONS_THEME.link,
						)}
					>
						<ArrowLeft className="size-4" aria-hidden />
						Back to applications
					</Link>
				</div>
			</div>
		)
	}

	return (
		<div className="flex h-dvh flex-col overflow-hidden bg-neutral-50">
			{error ? (
				<div className="shrink-0 border-b border-red-200 bg-red-50 px-4 py-2">
					<p className="text-sm text-red-700" role="alert">
						{error}
					</p>
				</div>
			) : null}
			{notice ? (
				<div className="shrink-0 border-b border-emerald-200 bg-emerald-50 px-4 py-2">
					<p className="text-sm text-emerald-800" role="status">
						{notice}
					</p>
				</div>
			) : null}

			<main className="flex min-h-0 flex-1 flex-col">
				<ApplicationDetailDocuments
					form={form}
					status={resolveStatus(record.status)}
					createdAt={record.created_at}
					generatedResume={record.generatedResume}
					generatedCoverLetter={record.generatedCoverLetter}
					recruiterEmails={record.recruiterEmails}
					refreshingDocuments={isRefetchingApplication}
					savingDetails={savingDetails}
					updatingStatus={updatingStatus}
					isDeleting={deletingId === record.id}
					onPatchForm={patchForm}
					onSaveApplication={() => void saveApplication()}
					onStatusChange={(next) => void updateStatus(next)}
					onDelete={deleteApplication}
					refetchApplication={() => void refetchApplication()}
					appResume={appResume}
					onSaveAppResumeBlock={saveAppResumeBlock}
					onCreateSkillCategory={createAppResumeSkillCategory}
					onEnsureSkillsSection={ensureAppResumeSkillsSection}
					onDeleteAppResumeBlock={deleteAppResumeBlock}
				/>
			</main>
		</div>
	)
}
