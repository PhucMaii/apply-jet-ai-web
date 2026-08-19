import { MapleLeafIcon } from "@/components/brand/maple-leaf-icon"
import { CANADA_RED, CANADA_RED_INK } from "@/lib/canada-brand"
import { cn } from "@/lib/utils"

interface CanadaMadeBadgeProps {
	label: string
	className?: string
}

export function CanadaMadeBadge({ label, className }: CanadaMadeBadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-2 rounded-full",
				"border px-3 py-1.5 text-xs font-semibold tracking-wide",
				className,
			)}
			style={{
				borderColor: `${CANADA_RED}33`,
				backgroundColor: `${CANADA_RED}14`,
				color: CANADA_RED_INK,
			}}
		>
			<MapleLeafIcon className="size-4" />
			{label}
		</span>
	)
}
