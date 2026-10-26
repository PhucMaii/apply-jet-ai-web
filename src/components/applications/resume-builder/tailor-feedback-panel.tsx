import { useMemo, useState } from "react"
import { Check, Loader2, MessageSquareText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { JOBS_COPY } from "@/lib/jobs-copy"
import {
	applySuggestionToFeedbackItem,
	dismissTailorFeedbackItem,
} from "@/lib/tailor-feedback-actions"
import {
	getInsertableSuggestion,
	type TailorFeedbackItem,
	type TailorFeedbackPayload,
} from "@/types/tailor-feedback"
import type { AppResumeBlock } from "@/types/app-resume"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

interface TailorFeedbackPanelProps {
	applicationId: string
	userId: string
	feedback: TailorFeedbackPayload | null
	onFeedbackChange: (feedback: TailorFeedbackPayload) => void
	onFocusBlock: (blockId: string) => void
	onBlockUpdated: (block: AppResumeBlock) => void
}

function kindLabel(kind: TailorFeedbackItem["kind"]): string {
	switch (kind) {
		case "add_metric":
			return "Add a metric"
		case "replace_claim":
			return "Replace claim"
		case "strengthen_summary":
			return "Strengthen summary"
		case "add_missing_proof":
			return "Add proof"
		case "writing_tip":
			return "Writing tip"
		default:
			return "Note"
	}
}

export function TailorFeedbackPanel({
	applicationId,
	userId,
	feedback,
	onFeedbackChange,
	onFocusBlock,
	onBlockUpdated,
}: TailorFeedbackPanelProps) {
	const [busyId, setBusyId] = useState<string | null>(null)

	const openItems = useMemo(
		() => (feedback?.items ?? []).filter((item) => item.status === "open"),
		[feedback],
	)

	if (!feedback) return null

	async function handleDismiss(itemId: string) {
		if (!feedback) return
		setBusyId(itemId)
		try {
			const next = await dismissTailorFeedbackItem({
				itemId,
				userId,
				applicationId,
				feedback,
			})
			onFeedbackChange(next)
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Could not dismiss note.",
			)
		} finally {
			setBusyId(null)
		}
	}

	async function handleInsertSuggestion(item: TailorFeedbackItem) {
		if (!feedback) return
		if (!getInsertableSuggestion(item) || !item.blockId) {
			toast.error("This note has no insertable suggestion.")
			return
		}

		setBusyId(item.id)
		try {
			const result = await applySuggestionToFeedbackItem({
				item,
				userId,
				applicationId,
				feedback,
			})
			onBlockUpdated(result.block)
			onFeedbackChange(result.feedback)
			toast.success(JOBS_COPY.tailorFeedbackApplied)
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not insert that suggestion.",
			)
		} finally {
			setBusyId(null)
		}
	}

	return (
		<div className="space-y-3">
			<div className="flex items-start gap-2">
				<MessageSquareText
					className="mt-0.5 size-4 shrink-0 text-brand"
					aria-hidden
				/>
				<div>
					<p className="text-sm font-semibold text-neutral-900">
						{JOBS_COPY.tailorFeedbackTitle}
					</p>
					<p className="mt-0.5 text-xs text-neutral-500">
						One tap inserts the suggestion into the right place on your resume.
					</p>
				</div>
			</div>

			{openItems.length === 0 ? (
				<p className="text-sm text-neutral-500">
					{JOBS_COPY.tailorFeedbackEmpty}
				</p>
			) : (
				<ul className="space-y-3">
					{openItems.map((item) => {
						const isBusy = busyId === item.id
						const suggestion = getInsertableSuggestion(item)
						const canInsert = Boolean(item.blockId && suggestion)

						return (
							<li
								key={item.id}
								className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm"
							>
								<div className="flex flex-wrap items-center gap-1.5">
									<span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-600">
										{kindLabel(item.kind)}
									</span>
									<span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
										{item.sectionType}
									</span>
								</div>
								<p className="mt-2 text-sm font-semibold text-neutral-900">
									{item.title}
								</p>
								<p className="mt-1 text-sm leading-relaxed text-neutral-600">
									{item.message}
								</p>
								{item.quote ? (
									<blockquote className="mt-2 rounded-md border border-amber-100 bg-amber-50/70 px-2.5 py-1.5 text-xs italic text-amber-950">
										“{item.quote}”
									</blockquote>
								) : null}
								{suggestion ? (
									<div className="mt-2 rounded-md border border-emerald-100 bg-emerald-50/70 px-2.5 py-1.5">
										<p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
											Suggestion
										</p>
										<p className="mt-1 text-xs leading-relaxed text-emerald-950">
											{suggestion}
										</p>
									</div>
								) : null}

								{canInsert ? (
									<Button
										type="button"
										size="sm"
										className="mt-3 w-full"
										disabled={isBusy}
										onClick={() => void handleInsertSuggestion(item)}
									>
										{isBusy ? (
											<Loader2
												className="size-3.5 animate-spin"
												aria-hidden
											/>
										) : (
											<Check className="size-3.5" aria-hidden />
										)}
										{JOBS_COPY.tailorFeedbackInsertSuggestion}
									</Button>
								) : null}

								<div
									className={cn(
										"mt-3 flex flex-wrap gap-2",
										canInsert && "border-t border-neutral-100 pt-3",
									)}
								>
									{item.blockId ? (
										<Button
											type="button"
											size="sm"
											variant="outline"
											disabled={isBusy}
											onClick={() => onFocusBlock(item.blockId!)}
										>
											{JOBS_COPY.tailorFeedbackOpenSection}
										</Button>
									) : null}
									<Button
										type="button"
										size="sm"
										variant="ghost"
										disabled={isBusy}
										onClick={() => void handleDismiss(item.id)}
									>
										{JOBS_COPY.tailorFeedbackDismiss}
									</Button>
								</div>
							</li>
						)
					})}
				</ul>
			)}
		</div>
	)
}
