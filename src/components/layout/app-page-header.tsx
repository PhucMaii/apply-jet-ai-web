import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface AppPageHeaderProps {
	title: string
	description?: ReactNode
	/** Breadcrumb or eyebrow rendered above the title. */
	eyebrow?: ReactNode
	/** Right-aligned actions — keep to one primary action. */
	actions?: ReactNode
	className?: string
}

export function AppPageHeader({
	title,
	description,
	eyebrow,
	actions,
	className,
}: AppPageHeaderProps) {
	return (
		<header
			className={cn(
				"flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
				className,
			)}
		>
			<div className="min-w-0">
				{eyebrow ? <div className="mb-2">{eyebrow}</div> : null}
				<h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">
					{title}
				</h1>
				{description ? (
					<p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-muted">
						{description}
					</p>
				) : null}
			</div>
			{actions ? (
				<div className="flex shrink-0 flex-wrap items-center gap-2">
					{actions}
				</div>
			) : null}
		</header>
	)
}