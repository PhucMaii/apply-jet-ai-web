import type { DragEvent } from "react"
import {
	AlertCircle,
	ChevronDown,
	ChevronRight,
	GripVertical,
	Pencil,
	Plus,
} from "lucide-react"
import {
	getBlockPreviewText,
	sortBlocks,
	sortSections,
} from "@/components/applications/resume-builder/app-resume-utils"
import { ResumeBlockEditor } from "@/components/applications/resume-builder/resume-block-editor"
import { getSectionIcon } from "@/components/applications/resume-builder/section-icon"
import { Button } from "@/components/ui/button"
import type { AppResumeBlock, AppResumeSection } from "@/types/app-resume"
import { cn } from "@/lib/utils"

interface ResumeSectionsAsideProps {
	sections: AppResumeSection[]
	expandedId: string | null
	activeSectionId: string
	dragId: string | null
	editingBlockId: string | null
	editingDraft: string
	editingFormData: Record<string, unknown> | null
	onSectionClick: (sectionId: string) => void
	onDragStart: (sectionId: string) => void
	onDrop: (targetId: string) => void
	onStartEditBlock: (block: AppResumeBlock) => void
	onDraftTextChange: (value: string) => void
	onFieldChange: (field: string, value: unknown) => void
	onApplyEditBlock: (block: AppResumeBlock) => void
	onCancelEditBlock: () => void
}

export function ResumeSectionsAside({
	sections,
	expandedId,
	activeSectionId,
	dragId,
	editingBlockId,
	editingDraft,
	editingFormData,
	onSectionClick,
	onDragStart,
	onDrop,
	onStartEditBlock,
	onDraftTextChange,
	onFieldChange,
	onApplyEditBlock,
	onCancelEditBlock,
}: ResumeSectionsAsideProps) {
	const hasSections = sections.length > 0

	return (
		<aside className="flex max-h-72 min-h-0 shrink-0 flex-col overflow-hidden border-b border-neutral-200 bg-white xl:max-h-none xl:h-full xl:border-b-0 xl:border-r">
			<div className="shrink-0 border-b border-neutral-100 px-4 py-3">
				<p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
					Sections
				</p>
			</div>
			<div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-3">
				{!hasSections ? (
					<p className="px-1 py-6 text-center text-sm text-neutral-500">
						No sections available.
					</p>
				) : null}

				{sortSections(sections).map((section) => {
					const Icon = getSectionIcon(section.section_type)
					const expanded = expandedId === section.id
					return (
						<div
							key={section.id}
							className="rounded-xl border border-neutral-200/80"
						>
							<div
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
									onClick={() => onSectionClick(section.id)}
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
														{block.block_type.replaceAll("_", " ")}
													</p>
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
								</div>
							) : null}
						</div>
					)
				})}

				<button
					type="button"
					className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 px-3 py-2.5 text-sm font-medium text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50"
				>
					<Plus className="size-4" aria-hidden />
					Add Custom Section
				</button>
			</div>
		</aside>
	)
}
