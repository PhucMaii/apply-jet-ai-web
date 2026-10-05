import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
	title: string
	description?: string
	/** Small icon tile. Ignored when `illustration` is provided. */
	icon?: LucideIcon
	/** Larger artwork, e.g. the beaver mascot for first-run states. */
	illustration?: ReactNode
	actions?: ReactNode
	/** `card` draws its own border; `plain` sits inside an existing surface. */
	variant?: "card" | "plain"
	className?: string
}

export function EmptyState({
	title,
	description,
	icon: Icon,
	illustration,
	actions,
	variant = "card",
	className,
}: EmptyStateProps) {
	return (
		<div
			role="status"
			className={cn(
				"flex flex-col items-center px-6 py-12 text-center sm:py-16",
				variant === "card" &&
					"rounded-xl border border-dashed border-hairline-strong bg-surface",
				className,
			)}
		>
			{illustration ? (
				<div className="mb-5">{illustration}</div>
			) : Icon ? (
				<div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-surface-sunken text-ink-muted">
					<Icon className="size-5" aria-hidden />
				</div>
			) : null}
			<h2 className="font-display text-lg font-semibold text-ink sm:text-xl">
				{title}
			</h2>
			{description ? (
				<p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
					{description}
				</p>
			) : null}
			{actions ? (
				<div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
					{actions}
				</div>
			) : null}
		</div>
	)
}
