import { useEffect, useRef, useState, type CSSProperties } from "react"
import {
	applyEditableText,
	buildBlockContentFromForm,
	flattenResumeSectionsText,
	getEditableText,
	hasCompleteJobDetails,
	sortSections,
} from "@/components/applications/resume-builder/app-resume-utils"
import { PanelResizeHandle } from "@/components/applications/resume-builder/panel-resize-handle"
import { ResumeJobAside } from "@/components/applications/resume-builder/resume-job-aside"
import { ResumePreviewPanel } from "@/components/applications/resume-builder/resume-preview-panel"
import { ResumeSectionsAside } from "@/components/applications/resume-builder/resume-sections-aside"
import type { ApplicationStatus } from "@/lib/application-status"
import {
	calculateATSScore,
	type ATSScoreResult,
} from "@/lib/atsScoring"
import { buildBlockRewriteDiff, type BlockRewriteDiff } from "@/lib/rewrite-diff"
import { invokeRewriteResumeBlock } from "@/lib/rewrite-resume-block"
import type {
	AppResume,
	AppResumeBlock,
	AppResumeBlockContent,
	AppResumeSection,
} from "@/types/app-resume"
import type { ApplicationDetailForm } from "@/types/application-detail"
import { isRewriteSupportedBlockType } from "@/types/rewrite-resume-block"
import toast from "react-hot-toast"

const LEFT_PANEL_DEFAULT = 400
const LEFT_PANEL_MIN = 260
const LEFT_PANEL_MAX = 560
const RIGHT_PANEL_DEFAULT = 280
const RIGHT_PANEL_MIN = 220
const RIGHT_PANEL_MAX = 480
const PREVIEW_PANEL_MIN = 320

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value))
}

interface ResumeTabProps {
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
	onGenerate: () => void
	onSaveAppResumeBlock: (block: AppResumeBlock) => Promise<void>
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
	onDeleteAppResumeBlock: (blockId: string) => Promise<void>
	refetchApplication: () => void
}

function cloneSections(sections: AppResumeSection[]): AppResumeSection[] {
	return sortSections(structuredClone(sections))
}

export function ResumeTab({
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
	// onGenerate,
	onSaveAppResumeBlock,
	onCreateSkillCategory,
	onCreateSummaryBlock,
	onEnsureSkillsSection,
	onDeleteAppResumeBlock,
	refetchApplication,
}: ResumeTabProps) {
	const seedSections = appResume?.sections ?? []
	const [sections, setSections] = useState(() => cloneSections(seedSections))
	const [expandedId, setExpandedId] = useState<string | null>(
		seedSections[0]?.id ?? null,
	)
	const [activeSectionId, setActiveSectionId] = useState(
		seedSections[0]?.id ?? "",
	)
	const [editingBlockId, setEditingBlockId] = useState<string | null>(null)
	const [editingDraft, setEditingDraft] = useState("")
	const [editingFormData, setEditingFormData] = useState<Record<
		string,
		unknown
	> | null>(null)
	const [keywordsOpen, setKeywordsOpen] = useState(true)
	const [contentOpen, setContentOpen] = useState(true)
	const [isEditingJob, setIsEditingJob] = useState(
		() => !hasCompleteJobDetails(form),
	)
	const [dragId, setDragId] = useState<string | null>(null)
	const [pageCount, setPageCount] = useState(1)
	const [leftPanelWidth, setLeftPanelWidth] = useState(LEFT_PANEL_DEFAULT)
	const [rightPanelWidth, setRightPanelWidth] = useState(RIGHT_PANEL_DEFAULT)
	const layoutRef = useRef<HTMLDivElement | null>(null)
	const [isAddingSkillCategory, setIsAddingSkillCategory] = useState(false)
	const [atsResult, setAtsResult] = useState<ATSScoreResult | null>(null)
	const [isScoringAts, setIsScoringAts] = useState(false)
	const [rewritingBlockId, setRewritingBlockId] = useState<string | null>(null)
	const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
	const [isApplyingRewrite, setIsApplyingRewrite] = useState(false)
	const [rewriteMode, setRewriteMode] = useState<"rewrite" | "generate">(
		"rewrite",
	)
	const [rewriteOriginalBlock, setRewriteOriginalBlock] =
		useState<AppResumeBlock | null>(null)
	const [rewriteDiff, setRewriteDiff] = useState<BlockRewriteDiff | null>(null)
	const [pendingRewriteContent, setPendingRewriteContent] =
		useState<AppResumeBlockContent | null>(null)
	const previewRefs = useRef<Record<string, HTMLElement | null>>({})
	const lastScoreKeyRef = useRef<string | null>(null)

	const issueTotal = sections.reduce(
		(sum, section) => sum + (section.issueCount ?? 0),
		0,
	)
	const jobDetailsComplete = hasCompleteJobDetails(form)
	const showJobForm = isEditingJob || !jobDetailsComplete
	const resumeText = flattenResumeSectionsText(sections)
	const jdText = form.jobDescription.trim()

	async function runAtsScore(force = false) {
		if (!jdText || !resumeText.trim() || !appResume) {
			setAtsResult(null)
			return
		}

		const scoreKey = `${jdText}::${resumeText}`
		if (!force && lastScoreKeyRef.current === scoreKey && atsResult) {
			return
		}

		lastScoreKeyRef.current = scoreKey
		setIsScoringAts(true)
		try {
			const result = await calculateATSScore(jdText, appResume, {
				hasTables: false,
				hasImages: false,
				fileFormat: "pdf-text",
			})
			console.log("result", result)
			setAtsResult(result)
		} catch (error) {
			console.error("Something went wrong calculating ATS score:", error)
			toast.error("Could not calculate ATS score.")
		} finally {
			setIsScoringAts(false)
		}
	}

	// useEffect(() => {
	// 	if (showJobForm) return
	// 	if (!jdText || !resumeText.trim() || !appResume) return

	// 	const scoreKey = `${jdText}::${resumeText}`
	// 	if (lastScoreKeyRef.current === scoreKey) return

	// 	let cancelled = false
	// 	lastScoreKeyRef.current = scoreKey
	// 	setIsScoringAts(true)

	// 	void calculateATSScore(jdText, appResume, {
	// 		hasTables: false,
	// 		hasImages: false,
	// 		fileFormat: "pdf-text",
	// 	})
	// 		.then((result) => {
	// 			if (!cancelled) setAtsResult(result)
	// 		})
	// 		.catch((error) => {
	// 			console.error("Something went wrong calculating ATS score:", error)
	// 			if (!cancelled) {
	// 				toast.error("Could not calculate ATS score.")
	// 			}
	// 		})
	// 		.finally(() => {
	// 			if (!cancelled) setIsScoringAts(false)
	// 		})

	// 	return () => {
	// 		cancelled = true
	// 	}
	// }, [showJobForm, jdText, resumeText, appResume])

	useEffect(() => {
		if (showJobForm) return
		if (!jdText || !resumeText.trim() || !appResume) return

		runAtsScore(true)
	}, [showJobForm, jdText, resumeText, appResume])

	function handleSaveJobDetails() {
		onSaveApplication()
		if (hasCompleteJobDetails(form)) {
			setIsEditingJob(false)
			void runAtsScore(true)
		}
	}

	async function updateBlock(nextBlock: AppResumeBlock) {
		try {
			await onSaveAppResumeBlock(nextBlock)
		} catch (err) {
			console.error("Something went wrong updating block:", err)
			toast.error(
				err instanceof Error ? err.message : "Failed to save block.",
			)
			return
		}
		setSections((prevSections) =>
			prevSections.map((section) => ({
				...section,
				blocks: section.blocks.map((block) =>
					block.id === nextBlock.id ? nextBlock : block,
				),
			})),
		)
		void refetchApplication()
	}

	function handleStartEditBlock(block: AppResumeBlock) {
		setEditingBlockId(block.id)
		setEditingDraft(getEditableText(block))
		setEditingFormData(
			typeof block.content_json === "object" && block.content_json
				? structuredClone(block.content_json as Record<string, unknown>)
				: null,
		)
	}

	function handleCancelEditBlock() {
		setEditingBlockId(null)
		setEditingDraft("")
		setEditingFormData(null)
	}

	function handleApplyEditBlock(block: AppResumeBlock) {
		if (editingFormData) {
			const structuredContent = buildBlockContentFromForm(
				block,
				editingFormData,
			)
			if (structuredContent) {
				void updateBlock({
					...block,
					content_json: structuredContent,
				})
				handleCancelEditBlock()
				return
			}
		}

		void updateBlock({
			...block,
			content_json: applyEditableText(block, editingDraft),
		})
		handleCancelEditBlock()
	}

	function handleSectionClick(sectionId: string) {
		setExpandedId((prev) => (prev === sectionId ? null : sectionId))
		setActiveSectionId(sectionId)
		previewRefs.current[sectionId]?.scrollIntoView({
			behavior: "smooth",
			block: "start",
		})
	}

	function handleDragStart(sectionId: string) {
		setDragId(sectionId)
	}

	function handleDrop(targetId: string) {
		if (!dragId || dragId === targetId) {
			setDragId(null)
			return
		}
		setSections((prev) => {
			const ordered = sortSections(prev)
			const from = ordered.findIndex((section) => section.id === dragId)
			const to = ordered.findIndex((section) => section.id === targetId)
			if (from < 0 || to < 0) return prev
			const next = [...ordered]
			const [moved] = next.splice(from, 1)
			next.splice(to, 0, moved)
			return next.map((section, index) => ({ ...section, sort_key: index }))
		})
		setDragId(null)
	}

	async function handleAddSkillCategory() {
		if (!appResume) {
			toast.error("No resume found for this application.")
			return
		}

		setIsAddingSkillCategory(true)
		try {
			let skillsSection = sections.find(
				(section) => section.section_type === "skills",
			)

			if (!skillsSection) {
				const nextSortKey =
					sections.length === 0
						? 0
						: Math.max(...sections.map((section) => section.sort_key)) + 1
				skillsSection = await onEnsureSkillsSection({
					appResumeId: appResume.id,
					sortKey: nextSortKey,
				})
				setSections((prev) => sortSections([...prev, skillsSection!]))
			}

			const createdBlock = await onCreateSkillCategory({
				appResumeId: appResume.id,
				sectionId: skillsSection.id,
				sortKey: skillsSection.blocks.length,
			})

			setSections((prev) =>
				prev.map((section) =>
					section.id === skillsSection!.id
						? {
								...section,
								blocks: [...section.blocks, createdBlock],
							}
						: section,
				),
			)
			setExpandedId(skillsSection.id)
			setActiveSectionId(skillsSection.id)
			handleStartEditBlock(createdBlock)
			toast.success("Skill category added")
		} finally {
			setIsAddingSkillCategory(false)
		}
	}

	async function handleDeleteSkillCategory(block: AppResumeBlock) {
		await onDeleteAppResumeBlock(block.id)
		setSections((prev) =>
			prev.map((section) => ({
				...section,
				blocks: section.blocks.filter((item) => item.id !== block.id),
			})),
		)
		if (editingBlockId === block.id) {
			handleCancelEditBlock()
		}
	}

	function requireJobDescription() {
		if (!jdText) {
			toast.error("Add a job description before using AI rewrite.")
			return false
		}
		return true
	}

	function clearRewriteReview() {
		setRewriteDiff(null)
		setPendingRewriteContent(null)
		setRewriteOriginalBlock(null)
		setRewriteMode("rewrite")
	}

	async function requestRewriteForBlock(
		block: AppResumeBlock,
		mode: "rewrite" | "generate" = "rewrite",
	) {
		if (!appResume?.id) {
			toast.error("No resume found for this application.")
			return
		}
		if (!requireJobDescription()) return
		if (!isRewriteSupportedBlockType(block.block_type)) {
			toast.error("AI rewrite is only available for summary and experience.")
			return
		}

		setRewritingBlockId(block.id)
		try {
			const suggestion = await invokeRewriteResumeBlock({
				blockId: block.id,
				appResumeId: appResume.id,
				jdText,
			})
			const diff = buildBlockRewriteDiff({
				originalBlock: block,
				suggestion,
				mode,
			})
			setRewriteMode(mode)
			setRewriteOriginalBlock(block)
			setPendingRewriteContent(
				suggestion.content_json as AppResumeBlockContent,
			)
			setRewriteDiff(diff)
			setActiveSectionId(block.section_id)
			setExpandedId(block.section_id)
		} catch (error) {
			console.error("Something went wrong requesting AI rewrite:", error)
			toast.error(
				error instanceof Error ? error.message : "Failed to rewrite with AI.",
			)
		} finally {
			setRewritingBlockId(null)
		}
	}

	async function handleRewriteBlock(block: AppResumeBlock) {
		await requestRewriteForBlock(block, "rewrite")
	}

	async function handleGenerateSummary() {
		if (!appResume?.id) {
			toast.error("No resume found for this application.")
			return
		}
		if (!requireJobDescription()) return

		const summarySection = sections.find(
			(section) => section.section_type === "summary",
		)
		if (!summarySection) {
			toast.error("Summary section is missing from this resume.")
			return
		}

		setIsGeneratingSummary(true)
		try {
			let targetBlock = summarySection.blocks.find(
				(block) => block.block_type === "rich_text",
			)

			if (!targetBlock) {
				targetBlock = await onCreateSummaryBlock({
					appResumeId: appResume.id,
					sectionId: summarySection.id,
					sortKey: summarySection.blocks.length,
				})
				setSections((prev) =>
					prev.map((section) =>
						section.id === summarySection.id
							? {
									...section,
									blocks: [...section.blocks, targetBlock!],
								}
							: section,
					),
				)
			}

			setExpandedId(summarySection.id)
			setActiveSectionId(summarySection.id)
			await requestRewriteForBlock(targetBlock, "generate")
		} catch (error) {
			console.error("Something went wrong generating summary:", error)
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to generate summary.",
			)
		} finally {
			setIsGeneratingSummary(false)
		}
	}

	async function handleApplyRewriteSuggestion() {
		if (!rewriteOriginalBlock || !pendingRewriteContent) return

		setIsApplyingRewrite(true)
		try {
			const nextBlock: AppResumeBlock = {
				...rewriteOriginalBlock,
				content_json: pendingRewriteContent,
			}
			await updateBlock(nextBlock)
			clearRewriteReview()
			toast.success(
				rewriteMode === "generate"
					? "Summary added"
					: "AI changes applied",
			)
		} catch (error) {
			console.error("Something went wrong applying AI rewrite:", error)
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to apply AI changes.",
			)
		} finally {
			setIsApplyingRewrite(false)
		}
	}

	function getLayoutWidth() {
		return layoutRef.current?.clientWidth ?? 0
	}

	function handleResizeLeft(deltaX: number) {
		const layoutWidth = getLayoutWidth()
		setLeftPanelWidth((current) => {
			const maxForPreview =
				layoutWidth > 0
					? layoutWidth - rightPanelWidth - PREVIEW_PANEL_MIN
					: LEFT_PANEL_MAX
			return clamp(
				current + deltaX,
				LEFT_PANEL_MIN,
				Math.min(LEFT_PANEL_MAX, maxForPreview),
			)
		})
	}

	function handleResizeRight(deltaX: number) {
		const layoutWidth = getLayoutWidth()
		setRightPanelWidth((current) => {
			const maxForPreview =
				layoutWidth > 0
					? layoutWidth - leftPanelWidth - PREVIEW_PANEL_MIN
					: RIGHT_PANEL_MAX
			// Dragging the handle right shrinks the right panel.
			return clamp(
				current - deltaX,
				RIGHT_PANEL_MIN,
				Math.min(RIGHT_PANEL_MAX, maxForPreview),
			)
		})
	}

	return (
		<div
			ref={layoutRef}
			className="flex h-full min-h-0 flex-1 flex-col overflow-hidden xl:flex-row"
		>
				<div
					className="flex max-h-72 min-h-0 w-full shrink-0 flex-col overflow-hidden xl:max-h-none xl:h-full xl:w-[var(--left-panel-width)]"
					style={
						{
							"--left-panel-width": `${leftPanelWidth}px`,
						} as CSSProperties
					}
				>
					<ResumeSectionsAside
						sections={sections}
						expandedId={expandedId}
						activeSectionId={activeSectionId}
						dragId={dragId}
						editingBlockId={editingBlockId}
						editingDraft={editingDraft}
						editingFormData={editingFormData}
						isAddingSkillCategory={isAddingSkillCategory}
						rewritingBlockId={rewritingBlockId}
						isGeneratingSummary={isGeneratingSummary}
						onSectionClick={handleSectionClick}
						onDragStart={handleDragStart}
						onDrop={handleDrop}
						onStartEditBlock={handleStartEditBlock}
						onDraftTextChange={setEditingDraft}
						onFieldChange={(field, value) =>
							setEditingFormData((prev) => ({
								...(prev ?? {}),
								[field]: value,
							}))
						}
						onApplyEditBlock={handleApplyEditBlock}
						onCancelEditBlock={handleCancelEditBlock}
						onAddSkillCategory={handleAddSkillCategory}
						onDeleteSkillCategory={handleDeleteSkillCategory}
						onRewriteBlock={handleRewriteBlock}
						onGenerateSummary={handleGenerateSummary}
					/>
				</div>

				<PanelResizeHandle
					label="Resize sections panel"
					onResize={handleResizeLeft}
				/>

				<ResumePreviewPanel
					sections={sections}
					activeSectionId={activeSectionId}
					sectionRefs={previewRefs}
					pageCount={pageCount}
					onPageCountChange={setPageCount}
					rewriteDiff={rewriteDiff}
					isApplyingRewrite={isApplyingRewrite}
					onAcceptRewrite={() => {
						void handleApplyRewriteSuggestion()
					}}
					onRejectRewrite={clearRewriteReview}
				/>

				<PanelResizeHandle
					label="Resize job panel"
					onResize={handleResizeRight}
				/>

				<div
					className="flex max-h-72 min-h-0 w-full shrink-0 flex-col overflow-hidden xl:max-h-none xl:h-full xl:w-[var(--right-panel-width)]"
					style={
						{
							"--right-panel-width": `${rightPanelWidth}px`,
						} as CSSProperties
					}
				>
					<ResumeJobAside
						form={form}
						status={status}
						createdAt={createdAt}
						savingDetails={savingDetails}
						updatingStatus={updatingStatus}
						isDeleting={isDeleting}
						showJobForm={showJobForm}
						issueTotal={issueTotal}
						keywordsOpen={keywordsOpen}
						contentOpen={contentOpen}
						atsResult={atsResult}
						isScoringAts={isScoringAts}
						onToggleKeywords={() => setKeywordsOpen((prev) => !prev)}
						onToggleContent={() => setContentOpen((prev) => !prev)}
						onEditJob={() => setIsEditingJob(true)}
						onDoneEditingJob={() => {
							setIsEditingJob(false)
							void runAtsScore(true)
						}}
						onSaveJobDetails={handleSaveJobDetails}
						onPatchForm={onPatchForm}
						onStatusChange={onStatusChange}
						onDelete={onDelete}
					/>
				</div>
		</div>
	)
}
