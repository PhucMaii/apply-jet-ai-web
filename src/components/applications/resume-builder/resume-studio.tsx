import { useState } from "react"
import {
	Download,
	Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { TailoredResumeTab } from "@/components/applications/resume-builder/tailored-resume-tab"
import type { ApplicationStatus } from "@/lib/application-status"
import { exportResumePreviewAsPdf } from "@/lib/resume-export"
import { cn } from "@/lib/utils"
import type { ApplicationDetailForm } from "@/types/application-detail"
import type { AppResume, AppResumeBlock, AppResumeSection, CustomSectionBlockType } from "@/types/app-resume"
import { ResumeTab } from "./resume-tab"
import toast from "react-hot-toast"
import useUserUsage from "@/hooks/use-user-usage"
import { supabase } from "@/lib/supabase"
import { env } from "@/lib/env"

type StudioView = "editor" | "tailored"

interface ResumeStudioProps {
	appResume: AppResume | null
	form: ApplicationDetailForm
	status: ApplicationStatus
	createdAt: string
	savingDetails: boolean
	updatingStatus: boolean
	isDeleting: boolean
	onPatchForm: (patch: Partial<ApplicationDetailForm>) => void
	onSaveApplication: () => void
	onStatusChange: (status: ApplicationStatus) => void
	onDelete?: (applicationId: string) => Promise<{
		success: boolean
		message: string
	}>
	onSaveAppResumeBlock: (block: AppResumeBlock) => Promise<void>
	onSaveAppResumeSectionDisplayName: (input: {
		sectionId: string
		displayName: string
	}) => Promise<void>
	onSaveAppResumeSectionOrder: (
		orderedSections: Array<{ sectionId: string; sortKey: number }>,
	) => Promise<void>
	onCreateSkillCategory: (input: {
		appResumeId: string
		sectionId: string
		sortKey: number
		name?: string
	}) => Promise<AppResumeBlock>
	onCreateSummaryBlock: (input: {
		appResumeId: string
		sectionId: string
		sortKey?: number
	}) => Promise<AppResumeBlock>
	onEnsureSkillsSection: (input: {
		appResumeId: string
		sortKey: number
	}) => Promise<AppResumeSection>
	onCreateCustomSection: (input: {
		appResumeId: string
		displayName: string
		sortKey: number
		blockType: CustomSectionBlockType
	}) => Promise<AppResumeSection>
	onCreateCustomBlock: (input: {
		appResumeId: string
		sectionId: string
		sortKey: number
		blockType: CustomSectionBlockType
	}) => Promise<AppResumeBlock>
	onDeleteAppResumeBlock: (blockId: string) => Promise<void>
	onDeleteAppResumeSection: (sectionId: string) => Promise<void>
	refetchApplication: () => void
}

export function ResumeStudio({
	appResume,
	form,
	status,
	createdAt,
	savingDetails,
	updatingStatus,
	isDeleting,
	onPatchForm,
	onSaveApplication,
	onStatusChange,
	onDelete,
	onSaveAppResumeBlock,
	onSaveAppResumeSectionDisplayName,
	onSaveAppResumeSectionOrder,
	onCreateSkillCategory,
	onCreateSummaryBlock,
	onEnsureSkillsSection,
	onCreateCustomSection,
	onCreateCustomBlock,
	onDeleteAppResumeBlock,
	onDeleteAppResumeSection,
	refetchApplication,
}: ResumeStudioProps) {
	const { usage, refetch: refetchUsage } = useUserUsage()

	const [view, setView] = useState<StudioView>("editor")
	const [hasGenerated, setHasGenerated] = useState(false)
	const [isGenerating, setIsGenerating] = useState(false)
	const [appliedBlockKeys, setAppliedBlockKeys] = useState<string[]>([])
	const [isExportingPdf, setIsExportingPdf] = useState(false)

	function handleGenerate() {
		setIsGenerating(true)
		window.setTimeout(() => {
			setHasGenerated(true)
			setIsGenerating(false)
			setView("tailored")
		}, 900)
	}

	async function handleExportPdf() {
		console.log("usage", usage)
		// Check if user has reached their usage limit
		if (usage?.files_download_used && usage?.files_download_limit && usage.files_download_used >= usage.files_download_limit) {
			toast.error("You have reached your usage limit.")
			return
		}

		setIsExportingPdf(true)
		try {
			const jobPart = form.jobTitle.trim() || "resume"
			const companyPart = form.companyName.trim()
			const fileName = companyPart
				? `${jobPart} - ${companyPart}`
				: jobPart
			await exportResumePreviewAsPdf({ fileName })
			// Increment usage
			const { error: incrementUsageError } = await supabase.functions.invoke("increment-usage", {
				body: {
					userId: usage?.user_id,
					guardType: "files_download",
				},
				headers: {
					"X-Secret-Key": env.xsecretkey,
				},
			})
			if (incrementUsageError) {
				console.error("Something went wrong incrementing usage:", incrementUsageError)
				toast.error("Something went wrong incrementing usage.")
				return
			}
			await refetchUsage()
		} catch (error) {
			console.error("Something went wrong exporting resume PDF:", error)
			toast.error(
				error instanceof Error ? error.message : "Failed to export PDF.",
			)
		} finally {
			setIsExportingPdf(false)
		}
	}

	return (
		<div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-neutral-100">
			<header className="shrink-0 border-b border-neutral-200 bg-white">
				<div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-4">
					{hasGenerated ? (
						<nav
							className="flex items-center gap-1 overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-50 p-1"
							aria-label="Resume views"
						>
							{(
								[
									["editor", "Resume"],
									["tailored", "Tailored Resume"],
								] as const
							).map(([value, label]) => (
								<button
									key={value}
									type="button"
									onClick={() => setView(value)}
									className={cn(
										"shrink-0 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors sm:px-3 sm:text-sm",
										view === value
											? "bg-white text-neutral-900 shadow-sm"
											: "text-neutral-500 hover:text-neutral-800",
									)}
								>
									{label}
								</button>
							))}
						</nav>
					) : (
						<p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
							Resume studio
						</p>
					)}

					<Button
						type="button"
						variant="default"
						size="sm"
						className="hidden shrink-0 gap-2 sm:inline-flex"
						disabled={view !== "editor" || isGenerating || isExportingPdf}
						onClick={() => {
							void handleExportPdf()
						}}
					>
						{isExportingPdf ? (
							<Loader2 className="size-4 animate-spin" aria-hidden />
						) : (
							<Download className="size-4" aria-hidden />
						)}
						Export PDF
					</Button>
				</div>
			</header>

			{isGenerating ? (
				<div
					className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3"
					aria-busy
				>
					<Loader2 className="size-8 animate-spin text-primary" aria-hidden />
					<p className="text-sm text-neutral-600">
						Generating tailored resume…
					</p>
				</div>
			) : null}

			{!isGenerating && view === "editor" ? (
				<ResumeTab
					key={appResume?.id ?? "empty-resume"}
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
					onGenerate={handleGenerate}
					appResume={appResume}
					onSaveAppResumeBlock={onSaveAppResumeBlock}
					onSaveAppResumeSectionDisplayName={
						onSaveAppResumeSectionDisplayName
					}
					onSaveAppResumeSectionOrder={onSaveAppResumeSectionOrder}
					onCreateSkillCategory={onCreateSkillCategory}
					onCreateSummaryBlock={onCreateSummaryBlock}
					onEnsureSkillsSection={onEnsureSkillsSection}
					onCreateCustomSection={onCreateCustomSection}
					onCreateCustomBlock={onCreateCustomBlock}
					onDeleteAppResumeBlock={onDeleteAppResumeBlock}
					onDeleteAppResumeSection={onDeleteAppResumeSection}
					refetchApplication={refetchApplication}
				/>
			) : null}
			{!isGenerating && view === "tailored" && hasGenerated ? (
				<TailoredResumeTab
					key={`tailored-${appResume?.id ?? "empty"}`}
					appResume={appResume}
					appliedBlockKeys={appliedBlockKeys}
					onAppliedKeysChange={setAppliedBlockKeys}
				/>
			) : null}
		</div>
	)
}
