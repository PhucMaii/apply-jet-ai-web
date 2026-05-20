import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
	/** `solid` = white dashboard cards; `glass` = marketing dark panels */
	variant?: "glass" | "solid"
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
	({ className, variant = "glass", ...props }, ref) => (
		<div
			ref={ref}
			className={cn(
				"rounded-xl",
				variant === "solid"
					? "border border-neutral-200 bg-white text-neutral-900 shadow-sm"
					: "glass-panel text-card-foreground shadow-glow",
				className,
			)}
			{...props}
		/>
	),
)
Card.displayName = "Card"

export const CardHeader = forwardRef<
	HTMLDivElement,
	HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("flex flex-col gap-1.5 p-6 pb-0", className)}
		{...props}
	/>
))
CardHeader.displayName = "CardHeader"

export const CardTitle = forwardRef<
	HTMLParagraphElement,
	HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
	<h3
		ref={ref}
		className={cn(
			"font-display text-lg font-semibold leading-tight tracking-tight",
			className,
		)}
		{...props}
	/>
))
CardTitle.displayName = "CardTitle"

export const CardDescription = forwardRef<
	HTMLParagraphElement,
	HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<p
		ref={ref}
		className={cn("text-sm text-muted-foreground", className)}
		{...props}
	/>
))
CardDescription.displayName = "CardDescription"

export const CardContent = forwardRef<
	HTMLDivElement,
	HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div ref={ref} className={cn("p-6 pt-4", className)} {...props} />
))
CardContent.displayName = "CardContent"
