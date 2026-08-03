import type { MutableRefObject } from "react"
import { ZoomIn, ZoomOut } from "lucide-react"
import { ResumeDocumentPreview } from "@/components/applications/resume-builder/resume-document-preview"
import { ResumeEmptyState } from "@/components/applications/resume-builder/resume-empty-state"
import { RewriteReviewToolbar } from "@/components/applications/resume-builder/rewrite-review-toolbar"
import { Button } from "@/components/ui/button"
import type { BlockRewriteDiff } from "@/lib/rewrite-diff"
import type { AppResumeSection } from "@/types/app-resume"
import { cn } from "@/lib/utils"

interface ResumePreviewPanelProps {
	sections: AppResumeSection[]
	activeSectionId: string
	sectionRefs: MutableRefObject<Record<string, HTMLElement | null>>
	pageCount: number
	onPageCountChange: (count: number) => void
	rewriteDiff?: BlockRewriteDiff | null
	isApplyingRewrite?: boolean
	onAcceptRewrite?: () => void
	onRejectRewrite?: () => void
}

export function ResumePreviewPanel({
	sections,
	activeSectionId,
	sectionRefs,
	pageCount,
	onPageCountChange,
	rewriteDiff = null,
	isApplyingRewrite = false,
	onAcceptRewrite,
	onRejectRewrite,
}: ResumePreviewPanelProps) {
	const hasContent = sections.some((section) => section.blocks.length > 0)
	const isReviewing = Boolean(rewriteDiff)

	return (
		<section className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-neutral-100/90 xl:h-full">
			<div
				className={cn(
					"min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-6 sm:py-6 lg:px-8",
					isReviewing && "pb-28",
				)}
			>
				{hasContent ? (
					<ResumeDocumentPreview
						sections={sections}
						activeSectionId={activeSectionId}
						sectionRefs={sectionRefs}
						onPageCountChange={onPageCountChange}
						rewriteDiff={rewriteDiff}
					/>
				) : (
					<ResumeEmptyState />
				)}
				{/* Mirror top padding at the end of the scroll content. */}
				<div
					aria-hidden
					className={cn("shrink-0", isReviewing ? "h-28 sm:h-32" : "h-0")}
				/>
			</div>

			{rewriteDiff && onAcceptRewrite && onRejectRewrite ? (
				<RewriteReviewToolbar
					diff={rewriteDiff}
					isApplying={isApplyingRewrite}
					onAccept={onAcceptRewrite}
					onReject={onRejectRewrite}
				/>
			) : null}

			<div className="flex shrink-0 items-center justify-center gap-2 border-t border-neutral-200 bg-white/90 px-4 py-2">
				<Button type="button" size="sm" variant="ghost" disabled>
					<ZoomOut className="size-4" aria-hidden />
				</Button>
				<span className="text-xs font-medium text-neutral-500">100%</span>
				<Button type="button" size="sm" variant="ghost" disabled>
					<ZoomIn className="size-4" aria-hidden />
				</Button>
				<span className="mx-2 h-4 w-px bg-neutral-200" aria-hidden />
				<span className="text-xs font-medium text-neutral-500">
					{pageCount} page{pageCount === 1 ? "" : "s"}
				</span>
			</div>
		</section>
	)
}
