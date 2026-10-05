import { cva, type VariantProps } from "class-variance-authority"
import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
	[
		"inline-flex items-center gap-1.5 whitespace-nowrap rounded-full",
		"font-medium leading-none",
	],
	{
		variants: {
			tone: {
				neutral: "bg-surface-sunken text-ink-muted",
				brand: "bg-brand-soft text-brand-ink",
				info: "bg-sky-50 text-sky-800",
				warning: "bg-amber-50 text-amber-800",
				success: "bg-emerald-50 text-emerald-800",
				danger: "bg-rose-50 text-rose-700",
			},
			size: {
				sm: "h-5 px-2 text-[11px]",
				md: "h-6 px-2.5 text-xs",
			},
		},
		defaultVariants: {
			tone: "neutral",
			size: "md",
		},
	},
)

const DOT_TONE_CLASS = {
	neutral: "bg-ink-subtle",
	brand: "bg-brand",
	info: "bg-sky-600",
	warning: "bg-amber-500",
	success: "bg-emerald-600",
	danger: "bg-rose-600",
} as const

export type BadgeTone = keyof typeof DOT_TONE_CLASS

export interface BadgeProps
	extends HTMLAttributes<HTMLSpanElement>,
		VariantProps<typeof badgeVariants> {
	/** Leading status dot — pairs color with text so status never relies on color alone. */
	hasDot?: boolean
}

export function Badge({
	className,
	tone,
	size,
	hasDot = false,
	children,
	...props
}: BadgeProps) {
	return (
		<span className={cn(badgeVariants({ tone, size }), className)} {...props}>
			{hasDot ? (
				<span
					className={cn(
						"size-1.5 shrink-0 rounded-full",
						DOT_TONE_CLASS[tone ?? "neutral"],
					)}
					aria-hidden
				/>
			) : null}
			{children}
		</span>
	)
}
