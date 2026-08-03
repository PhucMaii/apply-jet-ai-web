import { Check, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { BlockRewriteDiff } from "@/lib/rewrite-diff"
import { cn } from "@/lib/utils"

interface RewriteReviewToolbarProps {
	diff: BlockRewriteDiff
	isApplying: boolean
	onAccept: () => void
	onReject: () => void
	className?: string
}

export function RewriteReviewToolbar({
	diff,
	isApplying,
	onAccept,
	onReject,
	className,
}: RewriteReviewToolbarProps) {
	const title =
		diff.kind === "bullets"
			? "Experience rewrite ready"
			: diff.mode === "generate"
				? "Summary draft ready"
				: "Summary rewrite ready"

	const addedCount = diff.bulletLines.filter((line) => line.status === "added")
		.length
	const removedCount = diff.bulletLines.filter(
		(line) => line.status === "removed",
	).length
	const hasTextChanges = diff.textSegments.some(
		(segment) => segment.status !== "unchanged",
	)

	return (
		<div
			className={cn(
				"pointer-events-auto absolute inset-x-3 bottom-14 z-20 sm:inset-x-6",
				className,
			)}
		>
			<div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-neutral-200/90 bg-white/95 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur supports-[backdrop-filter]:bg-white/90 sm:flex-row sm:items-center sm:gap-4 sm:p-3.5">
				<div className="min-w-0 flex-1">
					<div className="mb-0.5 flex flex-wrap items-center gap-2">
						<span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
							<Sparkles className="size-3" aria-hidden />
							AI review
						</span>
						{diff.kind === "bullets" ? (
							<span className="text-[11px] font-medium text-neutral-500">
								{addedCount > 0 ? `+${addedCount}` : null}
								{addedCount > 0 && removedCount > 0 ? " · " : null}
								{removedCount > 0 ? `−${removedCount}` : null}
								{addedCount === 0 && removedCount === 0
									? "polished"
									: null}
							</span>
						) : (
							<span className="text-[11px] font-medium text-neutral-500">
								{hasTextChanges ? "inline edits" : "no text changes"}
							</span>
						)}
					</div>
					<p className="truncate text-sm font-semibold text-neutral-900">
						{title}
					</p>
					<p className="line-clamp-2 text-xs leading-relaxed text-neutral-500">
						{diff.summary}
					</p>
				</div>

				<div className="flex shrink-0 items-center gap-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="gap-1.5"
						disabled={isApplying}
						onClick={onReject}
					>
						<X className="size-3.5" aria-hidden />
						Reject
					</Button>
					<Button
						type="button"
						size="sm"
						className="gap-1.5"
						disabled={isApplying}
						onClick={onAccept}
					>
						<Check className="size-3.5" aria-hidden />
						{isApplying ? "Applying…" : "Accept"}
					</Button>
				</div>
			</div>
		</div>
	)
}
