import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

/**
 * `surface="light"` — dashboards, forms, white backgrounds (default).
 * `surface="dark"` — dark panels and legacy glass sections.
 */
const buttonVariants = cva(
	[
		"inline-flex items-center justify-center gap-2 whitespace-nowrap",
		"rounded-lg text-sm font-semibold",
		"transition-[color,background-color,border-color,box-shadow,transform]",
		"duration-150 ease-out",
		"focus-visible:outline-none focus-visible:ring-2",
		"focus-visible:ring-primary/45 focus-visible:ring-offset-2",
		"disabled:pointer-events-none disabled:opacity-50",
		"active:scale-[0.98] motion-reduce:active:scale-100",
		"[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	],
	{
		variants: {
			variant: {
				default: [
					"bg-primary text-primary-foreground",
					"hover:bg-brand-hover",
				],
				accent: [
					"bg-accent text-accent-foreground",
					"hover:brightness-105",
				],
				destructive: [
					"bg-destructive text-destructive-foreground",
					"hover:bg-rose-600",
				],
				link: [
					"h-auto px-0 text-primary underline-offset-4",
					"hover:text-brand-hover hover:underline",
					"active:scale-100",
				],
				secondary: "",
				ghost: "",
				outline: "",
			},
			surface: {
				light: "focus-visible:ring-offset-white",
				dark: "focus-visible:ring-offset-background",
			},
			size: {
				default: "h-11 px-5 py-2",
				sm: "h-9 px-3.5 text-sm",
				lg: "h-12 px-7 text-base",
				icon: "size-10",
				"icon-sm": "size-8 rounded-md",
			},
		},
		compoundVariants: [
			{
				variant: "secondary",
				surface: "light",
				class: [
					"border border-hairline-strong bg-surface text-ink",
					"hover:border-ink-subtle/50 hover:bg-surface-sunken",
				],
			},
			{
				variant: "secondary",
				surface: "dark",
				class: [
					"glass-panel border border-border/60 text-foreground shadow-glow-sm",
					"hover:border-primary/35 hover:bg-card/80",
				],
			},
			{
				variant: "ghost",
				surface: "light",
				class: [
					"text-ink-muted",
					"hover:bg-surface-sunken hover:text-ink",
				],
			},
			{
				variant: "ghost",
				surface: "dark",
				class: [
					"text-muted-foreground",
					"hover:bg-white/10 hover:text-foreground",
				],
			},
			{
				variant: "outline",
				surface: "light",
				class: [
					"border border-hairline-strong bg-surface text-ink",
					"hover:border-brand/40 hover:bg-brand-soft hover:text-brand-ink",
				],
			},
			{
				variant: "outline",
				surface: "dark",
				class: [
					"border border-border/70 bg-transparent text-foreground",
					"hover:border-primary/40 hover:bg-white/5",
				],
			},
		],
		defaultVariants: {
			variant: "default",
			surface: "light",
			size: "default",
		},
	},
)

export interface ButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, surface, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button"
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, surface, className }))}
				ref={ref}
				{...props}
			/>
		)
	},
)
Button.displayName = "Button"
