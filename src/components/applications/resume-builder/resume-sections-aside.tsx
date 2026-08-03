import { useState, type DragEvent } from "react"
import {
	AlertCircle,
	ChevronDown,
	ChevronRight,
	GripVertical,
	Loader2,
	Pencil,
	Plus,
	Sparkles,
	Trash2,
} from "lucide-react"
import {
	getBlockPreviewText,
	sortBlocks,
	sortSections,
} from "@/components/applications/resume-builder/app-resume-utils"
import { ResumeBlockEditor } from "@/components/applications/resume-builder/resume-block-editor"
import { ResumeStylePanel } from "@/components/applications/resume-builder/resume-style-panel"
import { getSectionIcon } from "@/components/applications/resume-builder/section-icon"
import ConfirmModal from "@/components/ui/confirm-modal"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type {
	AppResumeBlock,
	AppResumeBlockStyle,
	AppResumeSection,
} from "@/types/app-resume"
import { isRewriteSupportedBlockType } from "@/types/rewrite-resume-block"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

const ASIDE_TAB = {
	content: "content",
	style: "style",
} as const

type AsideTab = (typeof ASIDE_TAB)[keyof typeof ASIDE_TAB]

interface ResumeSectionsAsideProps {
	sections: AppResumeSection[]
	expandedId: string | null
	activeSectionId: string
	dragId: string | null
	editingBlockId: string | null
	editingDraft: string
	editingFormData: Record<string, unknown> | null
	isAddingSkillCategory?: boolean
	rewritingBlockId?: string | null
	isGeneratingSummary?: boolean
	savingStyleGroupId?: string | null
	onSectionClick: (sectionId: string) => void
	onStyleSectionFocus?: (sectionId: string) => void
	onDragStart: (sectionId: string) => void
	onDrop: (targetId: string) => void
	onStartEditBlock: (block: AppResumeBlock) => void
	onDraftTextChange: (value: string) => void
	onFieldChange: (field: string, value: unknown) => void
	onApplyEditBlock: (block: AppResumeBlock) => void
	onCancelEditBlock: () => void
	onAddSkillCategory: () => Promise<void> | void
	onDeleteSkillCategory: (block: AppResumeBlock) => Promise<void>
	onRewriteBlock: (block: AppResumeBlock) => Promise<void> | void
	onGenerateSummary: () => Promise<void> | void
	onStyleChange: (
		groupId: string,
		blockIds: string[],
		patch: Partial<AppResumeBlockStyle>,
	) => void
}

function isEmptySummaryBlock(block: AppResumeBlock) {
	if (block.block_type !== "rich_text") return false
	const content = block.content_json
	if (!("text" in content) || typeof content.text !== "string") return true
	return content.text.trim().length === 0
}

export function ResumeSectionsAside({
	sections,
	expandedId,
	activeSectionId,
	dragId,
	editingBlockId,
	editingDraft,
	editingFormData,
	isAddingSkillCategory = false,
	rewritingBlockId = null,
	isGeneratingSummary = false,
	savingStyleGroupId = null,
	onSectionClick,
	onStyleSectionFocus,
	onDragStart,
	onDrop,
	onStartEditBlock,
	onDraftTextChange,
	onFieldChange,
	onApplyEditBlock,
	onCancelEditBlock,
	onAddSkillCategory,
	onDeleteSkillCategory,
	onRewriteBlock,
	onGenerateSummary,
	onStyleChange,
}: ResumeSectionsAsideProps) {
	const hasSections = sections.length > 0
	const [pendingDeleteBlock, setPendingDeleteBlock] =
		useState<AppResumeBlock | null>(null)
	const [asideTab, setAsideTab] = useState<AsideTab>(ASIDE_TAB.content)

	const summarySection = sections.find(
		(section) => section.section_type === "summary",
	)
	const summaryBlocks = summarySection
		? sortBlocks(summarySection.blocks).filter(
				(block) => block.block_type === "rich_text",
			)
		: []
	const hasUsableSummary = summaryBlocks.some(
		(block) => !isEmptySummaryBlock(block),
	)
	const showGenerateSummaryCta = Boolean(summarySection) && !hasUsableSummary

	async function handleConfirmDelete() {
		if (!pendingDeleteBlock) return
		await onDeleteSkillCategory(pendingDeleteBlock)
	}

	function getCategoryLabel(block: AppResumeBlock) {
		const content = block.content_json
		if ("name" in content && typeof content.name === "string") {
			return content.name
		}
		return "this skill category"
	}

	return (
		<aside className="flex h-full max-h-72 min-h-0 w-full shrink-0 flex-col overflow-hidden border-b border-neutral-200 bg-white xl:max-h-none xl:border-b-0">
			<Tabs
				value={asideTab}
				onValueChange={(value) => setAsideTab(value as AsideTab)}
				className="flex min-h-0 flex-1 flex-col"
			>
				<div className="shrink-0 space-y-2 border-b border-neutral-100 px-3 py-3">
					<p className="px-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
						Editor
					</p>
					<TabsList className="grid h-9 w-full grid-cols-2 bg-neutral-100/80">
						<TabsTrigger value={ASIDE_TAB.content} className="text-xs">
							Content
						</TabsTrigger>
						<TabsTrigger value={ASIDE_TAB.style} className="text-xs">
							Style
						</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent
					value={ASIDE_TAB.content}
					className="mt-0 min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 data-[state=inactive]:hidden"
				>
					<div className="space-y-2">
						{!hasSections ? (
							<p className="px-1 py-6 text-center text-sm text-neutral-500">
								No sections available.
							</p>
						) : null}

						{showGenerateSummaryCta ? (
							<div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3">
								<p className="text-sm font-medium text-neutral-800">
									No professional summary yet
								</p>
								<p className="mt-1 text-xs leading-relaxed text-neutral-500">
									Generate one from your resume and this job description.
								</p>
								<Button
									type="button"
									size="sm"
									className="mt-3 h-8 gap-1.5"
									disabled={isGeneratingSummary}
									onClick={() => {
										onGenerateSummary()?.catch((error) => {
											console.error(
												"Something went wrong generating summary:",
												error,
											)
											toast.error(
												error instanceof Error
													? error.message
													: "Failed to generate summary.",
											)
										})
									}}
								>
									{isGeneratingSummary ? (
										<Loader2 className="size-3.5 animate-spin" aria-hidden />
									) : (
										<Sparkles className="size-3.5" aria-hidden />
									)}
									{isGeneratingSummary ? "Generating…" : "Generate with AI"}
								</Button>
							</div>
						) : null}

						{sortSections(sections).map((section) => {
							const Icon = getSectionIcon(section.section_type)
							const expanded = expandedId === section.id
							const isSkillsSection = section.section_type === "skills"
							return (
								<div
									key={section.id}
									className="rounded-xl border border-neutral-200/80"
								>
									<div
										onClick={() => onSectionClick(section.id)}
										draggable
										onDragStart={() => onDragStart(section.id)}
										onDragOver={(event: DragEvent) => event.preventDefault()}
										onDrop={() => onDrop(section.id)}
										className={cn(
											"flex items-center gap-1 rounded-lg border px-1.5 py-1.5 transition-colors",
											activeSectionId === section.id
												? "border-primary/30 bg-primary/5"
												: "border-transparent hover:bg-neutral-50",
											dragId === section.id && "opacity-60",
										)}
									>
										<span
											className="cursor-grab px-1 text-neutral-400 active:cursor-grabbing"
											aria-hidden
										>
											<GripVertical className="size-3.5" />
										</span>
										<button
											type="button"
											className="flex min-w-0 flex-1 items-center gap-2 text-left"
										>
											<Icon
												className="size-3.5 shrink-0 text-neutral-500"
												aria-hidden
											/>
											<span className="truncate text-sm font-medium text-neutral-800">
												{section.display_name}
											</span>
											{section.issueCount ? (
												<span className="inline-flex items-center gap-0.5 rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
													<AlertCircle className="size-2.5" aria-hidden />
													{section.issueCount}
												</span>
											) : null}
										</button>
										{expanded ? (
											<ChevronDown className="size-3.5 text-neutral-400" />
										) : (
											<ChevronRight className="size-3.5 text-neutral-400" />
										)}
									</div>
									{expanded ? (
										<div className="space-y-2 border-t border-neutral-100 px-3 pb-3 pt-2">
											{sortBlocks(section.blocks).map((block) => {
												const isEditing = editingBlockId === block.id
												const canDeleteCategory =
													block.block_type === "skill_category_entry"
												const canRewrite =
													isRewriteSupportedBlockType(block.block_type) &&
													!(
														section.section_type === "summary" &&
														isEmptySummaryBlock(block)
													) &&
													!(
														block.block_type === "rich_text" &&
														section.section_type !== "summary"
													)
												const isRewriting = rewritingBlockId === block.id
												return (
													<div
														key={block.id}
														className={cn(
															"rounded-lg border p-2 transition-colors",
															isEditing
																? "border-primary/40 bg-primary/5"
																: "border-neutral-200 bg-white",
														)}
													>
														<div className="mb-1 flex items-center justify-between gap-2">
															<p className="truncate text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
																{block.block_type === "skill_category_entry"
																	? "Skill category"
																	: block.block_type.replaceAll("_", " ")}
															</p>
															<div className="flex items-center gap-1">
																{canDeleteCategory ? (
																	<Button
																		type="button"
																		size="sm"
																		variant="ghost"
																		className="h-7 gap-1 px-2 text-xs text-neutral-500 hover:bg-red-50 hover:text-red-600"
																		onClick={() => setPendingDeleteBlock(block)}
																		aria-label="Remove skill category"
																	>
																		<Trash2 className="size-3.5" aria-hidden />
																	</Button>
																) : null}
																{canRewrite ? (
																	<Button
																		type="button"
																		size="sm"
																		variant="ghost"
																		className="h-7 gap-1 px-2 text-xs text-primary hover:bg-primary/10"
																		disabled={isRewriting || isGeneratingSummary}
																		onClick={() => {
																			onRewriteBlock(block)?.catch((error) => {
																				console.error(
																					"Something went wrong rewriting block:",
																					error,
																				)
																				toast.error(
																					error instanceof Error
																						? error.message
																						: "Failed to rewrite with AI.",
																				)
																			})
																		}}
																	>
																		{isRewriting ? (
																			<Loader2
																				className="size-3.5 animate-spin"
																				aria-hidden
																			/>
																		) : (
																			<Sparkles className="size-3.5" aria-hidden />
																		)}
																		AI
																	</Button>
																) : null}
																<Button
																	type="button"
																	size="sm"
																	variant={isEditing ? "default" : "ghost"}
																	className="h-7 gap-1.5 px-2 text-xs"
																	onClick={() => onStartEditBlock(block)}
																>
																	<Pencil className="size-3.5" aria-hidden />
																	Edit
																</Button>
															</div>
														</div>
														{isEditing ? (
															<ResumeBlockEditor
																block={block}
																draftText={editingDraft}
																formData={editingFormData ?? {}}
																onDraftTextChange={onDraftTextChange}
																onFieldChange={onFieldChange}
																onApply={() => onApplyEditBlock(block)}
																onCancel={onCancelEditBlock}
															/>
														) : (
															<p className="line-clamp-2 text-xs leading-relaxed text-neutral-600">
																{getBlockPreviewText(block)}
															</p>
														)}
													</div>
												)
											})}

											{isSkillsSection ? (
												<Button
													type="button"
													size="sm"
													variant="outline"
													className="h-8 w-full gap-1.5 border-dashed text-xs"
													disabled={isAddingSkillCategory}
													onClick={() => {
														onAddSkillCategory()?.catch((error) => {
															console.error(
																"Something went wrong adding skill category:",
																error,
															)
															toast.error(
																error instanceof Error
																	? error.message
																	: "Failed to add skill category.",
															)
														})
													}}
												>
													{isAddingSkillCategory ? (
														<Loader2
															className="size-3.5 animate-spin"
															aria-hidden
														/>
													) : (
														<Plus className="size-3.5" aria-hidden />
													)}
													Add skill category
												</Button>
											) : null}
										</div>
									) : null}
								</div>
							)
						})}

						{!sections.some((section) => section.section_type === "skills") ? (
							<Button
								type="button"
								variant="outline"
								className="mt-2 h-9 w-full gap-2 border-dashed text-sm"
								disabled={isAddingSkillCategory}
								onClick={() => {
									onAddSkillCategory()?.catch((error) => {
										console.error(
											"Something went wrong adding skill category:",
											error,
										)
										toast.error(
											error instanceof Error
												? error.message
												: "Failed to add skill category.",
										)
									})
								}}
							>
								{isAddingSkillCategory ? (
									<Loader2 className="size-4 animate-spin" aria-hidden />
								) : (
									<Plus className="size-4" aria-hidden />
								)}
								Add skill category
							</Button>
						) : null}
					</div>
				</TabsContent>

				<TabsContent
					value={ASIDE_TAB.style}
					className="mt-0 min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 data-[state=inactive]:hidden"
				>
					<ResumeStylePanel
						sections={sections}
						activeSectionId={activeSectionId}
						savingGroupId={savingStyleGroupId}
						onSectionFocus={onStyleSectionFocus ?? onSectionClick}
						onStyleChange={onStyleChange}
					/>
				</TabsContent>
			</Tabs>

			<ConfirmModal
				isOpen={Boolean(pendingDeleteBlock)}
				onClose={() => setPendingDeleteBlock(null)}
				onConfirm={handleConfirmDelete}
				title="Remove skill category"
				message={
					pendingDeleteBlock
						? `Remove "${getCategoryLabel(pendingDeleteBlock)}" from this resume? This cannot be undone.`
						: "Remove this skill category from the resume?"
				}
				successMessage="Skill category removed"
			/>
		</aside>
	)
}
