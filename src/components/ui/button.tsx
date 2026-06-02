import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

/**
 * `surface="light"` — dashboards, forms, white backgrounds (default).
 * `surface="dark"` — marketing site, dark hero sections.
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
		"active:scale-[0.98]",
		"[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	],
	{
		variants: {
			variant: {
				default: [
					"bg-primary text-primary-foreground shadow-sm",
					"hover:bg-indigo-600 hover:shadow-md",
					"focus-visible:ring-offset-white",
				],
				accent: [
					"bg-accent text-accent-foreground shadow-sm",
					"hover:brightness-105 hover:shadow-md",
					"focus-visible:ring-offset-white",
				],
				destructive: [
					"bg-destructive text-destructive-foreground shadow-sm",
					"hover:bg-rose-600 hover:shadow-md",
					"focus-visible:ring-offset-white",
				],
				link: [
					"text-primary underline-offset-4 shadow-none",
					"hover:text-indigo-600 hover:underline",
					"active:scale-100 focus-visible:ring-offset-white",
				],
				secondary: "",
				ghost: "",
				outline: [
					"border border-neutral-300 bg-white text-neutral-800 shadow-sm",
					"hover:border-primary/45 hover:bg-primary/5 hover:text-neutral-900",
				],
			},
			surface: {
				light: "focus-visible:ring-offset-white",
				dark: "focus-visible:ring-offset-background",
			},
			size: {
				default: "h-11 px-5 py-2",
				sm: "h-9 px-3.5 text-sm",
				lg: "h-12 px-8 text-base",
				icon: "h-10 w-10",
			},
		},
		compoundVariants: [
			{
				variant: "secondary",
				surface: "light",
				class: [
					"border border-neutral-200 bg-white text-neutral-800 shadow-sm",
					"hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900",
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
					"text-neutral-600 shadow-none",
					"hover:bg-neutral-100 hover:text-neutral-900",
				],
			},
			{
				variant: "ghost",
				surface: "dark",
				class: [
					"text-muted-foreground shadow-none",
					"hover:bg-white/10 hover:text-foreground",
				],
			},
			{
				variant: "outline",
				surface: "light",
				class: [
					"border border-neutral-300 bg-white text-neutral-800 shadow-sm",
					"hover:border-primary/45 hover:bg-primary/5 hover:text-neutral-900",
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