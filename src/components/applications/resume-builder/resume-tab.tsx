import { useRef, useState } from "react"
import {
	applyEditableText,
	buildBlockContentFromForm,
	getEditableText,
	hasCompleteJobDetails,
	sortSections,
} from "@/components/applications/resume-builder/app-resume-utils"
import { ResumeJobAside } from "@/components/applications/resume-builder/resume-job-aside"
import { ResumePreviewPanel } from "@/components/applications/resume-builder/resume-preview-panel"
import { ResumeSectionsAside } from "@/components/applications/resume-builder/resume-sections-aside"
import type { ApplicationStatus } from "@/lib/application-status"
import type {
	AppResume,
	AppResumeBlock,
	AppResumeSection,
} from "@/types/app-resume"
import type { ApplicationDetailForm } from "@/types/application-detail"

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
	onGenerate,
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
	const previewRefs = useRef<Record<string, HTMLElement | null>>({})

	const issueTotal = sections.reduce(
		(sum, section) => sum + (section.issueCount ?? 0),
		0,
	)
	const jobDetailsComplete = hasCompleteJobDetails(form)
	const showJobForm = isEditingJob || !jobDetailsComplete

	function handleSaveJobDetails() {
		onSaveApplication()
		if (hasCompleteJobDetails(form)) {
			setIsEditingJob(false)
		}
	}

	function updateBlock(nextBlock: AppResumeBlock) {
		setSections((prev) =>
			prev.map((section) => ({
				...section,
				blocks: section.blocks.map((block) =>
					block.id === nextBlock.id ? nextBlock : block,
				),
			})),
		)
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
				updateBlock({
					...block,
					content_json: structuredContent,
				})
				handleCancelEditBlock()
				return
			}
		}

		updateBlock({
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

	return (
		<div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden xl:grid xl:grid-cols-[minmax(0,400px)_minmax(0,1fr)_minmax(0,260px)]">
			<ResumeSectionsAside
				sections={sections}
				expandedId={expandedId}
				activeSectionId={activeSectionId}
				dragId={dragId}
				editingBlockId={editingBlockId}
				editingDraft={editingDraft}
				editingFormData={editingFormData}
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
			/>

			<ResumePreviewPanel
				sections={sections}
				activeSectionId={activeSectionId}
				sectionRefs={previewRefs}
				pageCount={pageCount}
				onPageCountChange={setPageCount}
			/>

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
				onToggleKeywords={() => setKeywordsOpen((prev) => !prev)}
				onToggleContent={() => setContentOpen((prev) => !prev)}
				onEditJob={() => setIsEditingJob(true)}
				onDoneEditingJob={() => setIsEditingJob(false)}
				onSaveJobDetails={handleSaveJobDetails}
				onPatchForm={onPatchForm}
				onStatusChange={onStatusChange}
				onDelete={onDelete}
				onGenerate={onGenerate}
			/>
		</div>
	)
}
