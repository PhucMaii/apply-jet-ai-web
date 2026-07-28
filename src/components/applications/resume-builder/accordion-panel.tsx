import type { ReactNode } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

export function AccordionPanel({
	title,
	count,
	open,
	onToggle,
	children,
}: {
	title: string
	count: number
	open: boolean
	onToggle: () => void
	children: ReactNode
}) {
	return (
		<div className="rounded-xl border border-neutral-200">
			<button
				type="button"
				className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
				onClick={onToggle}
			>
				<span className="text-sm font-semibold text-neutral-800">{title}</span>
				<span className="flex items-center gap-2">
					<span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold text-neutral-600">
						{count}
					</span>
					{open ? (
						<ChevronDown className="size-4 text-neutral-400" />
					) : (
						<ChevronRight className="size-4 text-neutral-400" />
					)}
				</span>
			</button>
			{open ? <div className="border-t border-neutral-100 px-3 py-3">{children}</div> : null}
		</div>
	)
}