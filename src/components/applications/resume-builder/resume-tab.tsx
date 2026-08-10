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
import { TOUR_TARGET } from "@/lib/onboarding/selectors"
import type {
	AppResume,
	AppResumeBlock,
	AppResumeBlockContent,
	AppResumeBlockStyle,
	AppResumeSection,
	CustomSectionBlockType,
} from "@/types/app-resume"
import type { ApplicationDetailForm } from "@/types/application-detail"
import { isRewriteSupportedBlockType } from "@/types/rewrite-resume-block"
import { applyStylePatchToBlocks } from "@/lib/resume-block-style"
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
	const [isCreatingCustomSection, setIsCreatingCustomSection] = useState(false)
	const [isAddingCustomBlock, setIsAddingCustomBlock] = useState(false)
	const [atsResult, setAtsResult] = useState<ATSScoreResult | null>(null)
	const [isScoringAts, setIsScoringAts] = useState(false)
	const [rewritingBlockId, setRewritingBlockId] = useState<string | null>(null)
	const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
	const [isApplyingRewrite, setIsApplyingRewrite] = useState(false)
	const [savingStyleGroupId, setSavingStyleGroupId] = useState<string | null>(
		null,
	)
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

	async function handleStyleChange(
		groupId: string,
		blockIds: string[],
		patch: Partial<AppResumeBlockStyle>,
	) {
		const previousSections = sections
		const { nextSections, updatedBlocks } = applyStylePatchToBlocks(
			sections,
			blockIds,
			patch,
		)

		// Optimistic preview update so style changes feel instant.
		setSections(nextSections)
		const sectionId =
			previousSections.find((section) =>
				section.blocks.some((block) => blockIds.includes(block.id)),
			)?.id ?? activeSectionId
		setActiveSectionId(sectionId)
		previewRefs.current[sectionId]?.scrollIntoView({
			behavior: "smooth",
			block: "nearest",
		})
		setSavingStyleGroupId(groupId)

		try {
			await Promise.all(
				updatedBlocks.map((block) => onSaveAppResumeBlock(block)),
			)
			void refetchApplication()
		} catch (err) {
			console.error("Something went wrong saving section style:", err)
			toast.error(
				err instanceof Error ? err.message : "Failed to save style.",
			)
			setSections(previousSections)
		} finally {
			setSavingStyleGroupId(null)
		}
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

	function handleStyleSectionFocus(sectionId: string) {
		setActiveSectionId(sectionId)
		previewRefs.current[sectionId]?.scrollIntoView({
			behavior: "smooth",
			block: "start",
		})
	}

	function handleDragStart(sectionId: string) {
		setDragId(sectionId)
	}

	async function handleDrop(targetId: string) {
		if (!dragId || dragId === targetId) {
			setDragId(null)
			return
		}

		const previousSections = sections
		const ordered = sortSections(sections)
		const from = ordered.findIndex((section) => section.id === dragId)
		const to = ordered.findIndex((section) => section.id === targetId)
		setDragId(null)
		if (from < 0 || to < 0) return

		const next = [...ordered]
		const [moved] = next.splice(from, 1)
		next.splice(to, 0, moved)
		const reordered = next.map((section, index) => ({
			...section,
			sort_key: index,
		}))

		setSections(reordered)

		try {
			await onSaveAppResumeSectionOrder(
				reordered.map((section) => ({
					sectionId: section.id,
					sortKey: section.sort_key,
				})),
			)
			void refetchApplication()
		} catch (error) {
			console.error("Something went wrong saving section order:", error)
			setSections(previousSections)
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to save section order.",
			)
		}
	}

	async function handleRenameSection(sectionId: string, displayName: string) {
		const trimmed = displayName.trim()
		if (!trimmed) {
			toast.error("Section name cannot be empty.")
			throw new Error("Section name cannot be empty.")
		}

		const previousSections = sections
		const target = sections.find((section) => section.id === sectionId)
		if (!target) {
			toast.error("Section not found.")
			throw new Error("Section not found.")
		}
		if (target.display_name === trimmed) return

		setSections((prev) =>
			prev.map((section) =>
				section.id === sectionId
					? { ...section, display_name: trimmed }
					: section,
			),
		)
		setActiveSectionId(sectionId)

		try {
			await onSaveAppResumeSectionDisplayName({
				sectionId,
				displayName: trimmed,
			})
			void refetchApplication()
		} catch (error) {
			console.error("Something went wrong renaming section:", error)
			setSections(previousSections)
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to rename section.",
			)
			throw error
		}
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

	async function handleDeleteSection(section: AppResumeSection) {
		if (section.section_type === "header") {
			toast.error("The header section cannot be removed.")
			throw new Error("The header section cannot be removed.")
		}

		await onDeleteAppResumeSection(section.id)

		const remaining = sortSections(
			sections.filter((item) => item.id !== section.id),
		)
		setSections(remaining)

		if (editingBlockId) {
			const wasEditingInSection = section.blocks.some(
				(block) => block.id === editingBlockId,
			)
			if (wasEditingInSection) {
				handleCancelEditBlock()
			}
		}

		if (expandedId === section.id) {
			setExpandedId(remaining[0]?.id ?? null)
		}
		if (activeSectionId === section.id) {
			setActiveSectionId(remaining[0]?.id ?? "")
		}

		void refetchApplication()
	}

	async function handleCreateCustomSection(input: {
		title: string
		blockType: CustomSectionBlockType
	}) {
		if (!appResume) {
			toast.error("No resume found for this application.")
			return
		}

		setIsCreatingCustomSection(true)
		try {
			const nextSortKey =
				sections.length === 0
					? 0
					: Math.max(...sections.map((section) => section.sort_key)) + 1
			const createdSection = await onCreateCustomSection({
				appResumeId: appResume.id,
				displayName: input.title,
				sortKey: nextSortKey,
				blockType: input.blockType,
			})

			setSections((prev) => sortSections([...prev, createdSection]))
			setExpandedId(createdSection.id)
			setActiveSectionId(createdSection.id)
			const firstBlock = createdSection.blocks[0]
			if (firstBlock) {
				handleStartEditBlock(firstBlock)
			}
			toast.success("Custom section added")
			void refetchApplication()
		} catch (error) {
			console.error("Something went wrong creating custom section:", error)
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to create custom section.",
			)
			throw error
		} finally {
			setIsCreatingCustomSection(false)
		}
	}

	async function handleAddCustomBlock(input: {
		sectionId: string
		blockType: CustomSectionBlockType
	}) {
		if (!appResume) {
			toast.error("No resume found for this application.")
			return
		}

		const targetSection = sections.find(
			(section) => section.id === input.sectionId,
		)
		if (!targetSection || targetSection.section_type !== "custom") {
			toast.error("Custom section not found.")
			return
		}

		setIsAddingCustomBlock(true)
		try {
			const createdBlock = await onCreateCustomBlock({
				appResumeId: appResume.id,
				sectionId: targetSection.id,
				sortKey: targetSection.blocks.length,
				blockType: input.blockType,
			})

			setSections((prev) =>
				prev.map((section) =>
					section.id === targetSection.id
						? {
								...section,
								blocks: [...section.blocks, createdBlock],
							}
						: section,
				),
			)
			setExpandedId(targetSection.id)
			setActiveSectionId(targetSection.id)
			handleStartEditBlock(createdBlock)
			toast.success("Block added")
			void refetchApplication()
		} catch (error) {
			console.error("Something went wrong adding custom block:", error)
			toast.error(
				error instanceof Error ? error.message : "Failed to add block.",
			)
			throw error
		} finally {
			setIsAddingCustomBlock(false)
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
				userId: appResume.user_id,
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
					data-tour={TOUR_TARGET.resumeStudioEditor}
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
						isCreatingCustomSection={isCreatingCustomSection}
						isAddingCustomBlock={isAddingCustomBlock}
						rewritingBlockId={rewritingBlockId}
						isGeneratingSummary={isGeneratingSummary}
						savingStyleGroupId={savingStyleGroupId}
						onSectionClick={handleSectionClick}
						onStyleSectionFocus={handleStyleSectionFocus}
						onDragStart={handleDragStart}
						onDrop={(targetId) => {
							void handleDrop(targetId)
						}}
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
						onDeleteBlock={handleDeleteSkillCategory}
						onRenameSection={handleRenameSection}
						onDeleteSection={handleDeleteSection}
						onCreateCustomSection={handleCreateCustomSection}
						onAddCustomBlock={handleAddCustomBlock}
						onRewriteBlock={handleRewriteBlock}
						onGenerateSummary={handleGenerateSummary}
						onStyleChange={(groupId, blockIds, patch) => {
							void handleStyleChange(groupId, blockIds, patch)
						}}
					/>
				</div>

				<PanelResizeHandle
					label="Resize sections panel"
					onResize={handleResizeLeft}
				/>

				<div
					className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
					data-tour={TOUR_TARGET.resumeStudioPreview}
				>
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
				</div>

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
					data-tour={TOUR_TARGET.resumeStudioJobPanel}
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
