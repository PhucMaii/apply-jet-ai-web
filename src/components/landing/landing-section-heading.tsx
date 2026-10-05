import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface LandingSectionHeadingProps {
	eyebrow: string
	title: string
	description?: ReactNode
	align?: "left" | "center"
	/** Heading level — sections use h2, nested blocks use h3. */
	as?: "h2" | "h3"
	className?: string
}

export function LandingSectionHeading({
	eyebrow,
	title,
	description,
	align = "left",
	as: Heading = "h2",
	className,
}: LandingSectionHeadingProps) {
	const isCentered = align === "center"

	return (
		<div
			className={cn(
				"max-w-2xl",
				isCentered && "mx-auto text-center",
				className,
			)}
		>
			<p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
				{eyebrow}
			</p>
			<Heading
				className={cn(
					"mt-3 font-display font-medium tracking-tight text-ink text-balance",
					Heading === "h2"
						? "text-3xl leading-[1.15] sm:text-4xl"
						: "text-2xl leading-snug sm:text-[1.75rem]",
				)}
			>
				{title}
			</Heading>
			{description ? (
				<p className="mt-4 text-base leading-relaxed text-ink-muted text-pretty sm:text-lg">
					{description}
				</p>
			) : null}
		</div>
	)
}
