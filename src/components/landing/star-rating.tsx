import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

const STAR_COUNT = 5

interface StarRatingProps {
	rating: number
	size?: "sm" | "md"
	showValue?: boolean
	label?: string
	className?: string
}

function getStarFill(rating: number, index: number) {
	const threshold = index + 1
	if (rating >= threshold) return 1
	if (rating > index) return rating - index
	return 0
}

export function StarRating({
	rating,
	size = "sm",
	showValue = false,
	label,
	className,
}: StarRatingProps) {
	const starSize = size === "md" ? "size-4" : "size-3.5"
	const clampedRating = Math.min(STAR_COUNT, Math.max(0, rating))

	return (
		<div
			className={cn("inline-flex items-center gap-2", className)}
			aria-label={label ?? `${clampedRating} out of ${STAR_COUNT} stars`}
		>
			<div className="inline-flex items-center gap-0.5" aria-hidden>
				{Array.from({ length: STAR_COUNT }, (_, index) => {
					const fill = getStarFill(clampedRating, index)

					return (
						<span key={index} className="relative inline-flex">
							<Star
								className={cn(starSize, "text-landing-border")}
								strokeWidth={1.75}
							/>
							{fill > 0 ? (
								<span
									className="absolute inset-0 overflow-hidden"
									style={{ width: `${fill * 100}%` }}
								>
									<Star
										className={cn(
											starSize,
											"fill-landing-accent text-landing-accent",
										)}
										strokeWidth={1.75}
									/>
								</span>
							) : null}
						</span>
					)
				})}
			</div>
			{showValue ? (
				<span
					className={cn(
						"font-semibold text-landing-ink",
						size === "md" ? "text-sm" : "text-xs",
					)}
				>
					{clampedRating.toFixed(1)}
				</span>
			) : null}
		</div>
	)
}
