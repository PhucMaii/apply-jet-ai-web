import type { CSSProperties } from "react"
import type {
	RewriteBulletLine,
	RewriteDiffStatus,
	RewriteTextSegment,
} from "@/lib/rewrite-diff"
import { cn } from "@/lib/utils"

const DIFF_STATUS_CLASS: Record<RewriteDiffStatus, string> = {
	unchanged: "text-neutral-800",
	added: "rounded-sm bg-emerald-500/15 text-emerald-950",
	removed: "rounded-sm bg-red-500/15 text-red-800 line-through decoration-red-500/70",
}

const BULLET_ROW_CLASS: Record<RewriteDiffStatus, string> = {
	unchanged: "text-neutral-800",
	added:
		"rounded-md bg-emerald-500/10 text-emerald-950 ring-1 ring-inset ring-emerald-500/20",
	removed:
		"rounded-md bg-red-500/10 text-red-800/90 ring-1 ring-inset ring-red-500/20",
}

export function RewriteDiffText({
	segments,
	className,
	style,
}: {
	segments: RewriteTextSegment[]
	className?: string
	style?: CSSProperties
}) {
	if (segments.length === 0) {
		return (
			<p
				className={cn("text-sm italic text-neutral-400", className)}
				style={style}
			>
				No summary yet.
			</p>
		)
	}

	return (
		<p className={cn("leading-snug", className)} style={style}>
			{segments.map((segment) => (
				<span
					key={segment.id}
					className={cn(
						"transition-colors",
						DIFF_STATUS_CLASS[segment.status],
					)}
				>
					{segment.text}
				</span>
			))}
		</p>
	)
}

export function RewriteDiffBulletList({
	lines,
}: {
	lines: RewriteBulletLine[]
}) {
	return (
		<ul className="space-y-1">
			{lines.map((line) => (
				<li
					key={line.id}
					className={cn(
						"flex gap-2 px-1.5 py-1 text-[13px] leading-relaxed",
						BULLET_ROW_CLASS[line.status],
						line.status === "removed" && "line-through decoration-red-500/70",
					)}
				>
					<span
						aria-hidden
						className={cn(
							"mt-0.5 shrink-0 font-semibold",
							line.status === "added" && "text-emerald-700",
							line.status === "removed" && "text-red-600",
							line.status === "unchanged" && "text-neutral-500",
						)}
					>
						{line.status === "added"
							? "+"
							: line.status === "removed"
								? "−"
								: "•"}
					</span>
					<span>{line.text}</span>
				</li>
			))}
		</ul>
	)
}
