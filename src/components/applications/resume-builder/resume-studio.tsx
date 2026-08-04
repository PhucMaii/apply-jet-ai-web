import { useState } from "react"
import {
	Download,
	Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { TailoredResumeTab } from "@/components/applications/resume-builder/tailored-resume-tab"
import type { ApplicationStatus } from "@/lib/application-status"
import { cn } from "@/lib/utils"
import type { ApplicationDetailForm } from "@/types/application-detail"
import type { AppResume, AppResumeBlock, AppResumeSection, CustomSectionBlockType } from "@/types/app-resume"
import { ResumeTab } from "./resume-tab"

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
	const [view, setView] = useState<StudioView>("editor")
	const [hasGenerated, setHasGenerated] = useState(false)
	const [isGenerating, setIsGenerating] = useState(false)
	const [appliedBlockKeys, setAppliedBlockKeys] = useState<string[]>([])

	function handleGenerate() {
		setIsGenerating(true)
		window.setTimeout(() => {
			setHasGenerated(true)
			setIsGenerating(false)
			setView("tailored")
		}, 900)
	}

	const showStudioToolbar = hasGenerated

	return (
		<div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-neutral-100">
			{showStudioToolbar ? (
				<header className="shrink-0 border-b border-neutral-200 bg-white">
					<div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-4">
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

						<Button
							type="button"
							variant="outline"
							size="sm"
							className="hidden shrink-0 gap-2 sm:inline-flex"
							disabled
						>
							<Download className="size-4" aria-hidden />
							Export
						</Button>
					</div>
				</header>
			) : null}

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
