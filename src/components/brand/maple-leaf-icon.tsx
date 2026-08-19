import type { ImgHTMLAttributes } from "react"
import { MAPLE_LEAF_SRC } from "@/lib/canada-brand"
import { cn } from "@/lib/utils"

interface MapleLeafIconProps extends ImgHTMLAttributes<HTMLImageElement> {
	title?: string
}

export function MapleLeafIcon({
	className,
	title = "Maple leaf",
	alt,
	...props
}: MapleLeafIconProps) {
	const isDecorative = props["aria-hidden"] === true

	return (
		<img
			src={MAPLE_LEAF_SRC}
			alt={isDecorative ? "" : (alt ?? title)}
			width={24}
			height={24}
			className={cn("shrink-0 object-contain", className)}
			decoding="async"
			{...props}
		/>
	)
}
