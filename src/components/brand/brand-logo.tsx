import { BRAND_LOGO_FULL_SRC, BRAND_LOGO_SRC } from "@/lib/constants"
import { cn } from "@/lib/utils"

type BrandLogoVariant = "mark" | "full"
type BrandLogoSize = "sm" | "md" | "lg"

interface BrandLogoProps {
	variant?: BrandLogoVariant
	size?: BrandLogoSize
	className?: string
}

const markSizeClass: Record<BrandLogoSize, string> = {
	sm: "size-9 rounded-lg",
	md: "size-10 rounded-xl",
	lg: "size-11 rounded-xl",
}

const markDimension: Record<BrandLogoSize, number> = {
	sm: 36,
	md: 40,
	lg: 44,
}

export function BrandLogo({
	variant = "mark",
	size = "md",
	className,
}: BrandLogoProps) {
	if (variant === "full") {
		return (
			<img
				src={BRAND_LOGO_FULL_SRC}
				alt=""
				className={cn(
					"h-9 w-auto max-w-[min(100%,14rem)] shrink-0",
					className,
				)}
				decoding="async"
			/>
		)
	}

	const dimension = markDimension[size]

	return (
		<img
			src={BRAND_LOGO_SRC}
			alt=""
			width={dimension}
			height={dimension}
			className={cn(
				markSizeClass[size],
				"shrink-0 object-cover",
				className,
			)}
			decoding="async"
		/>
	)
}
