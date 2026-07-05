import { motion, useReducedMotion } from "framer-motion"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { LANDING_EASE_OUT } from "@/lib/landing-motion"

interface AuthFormCardProps {
	eyebrow: string
	title: string
	description: string
	children: ReactNode
	footer?: ReactNode
	className?: string
}

export function AuthFormCard({
	eyebrow,
	title,
	description,
	children,
	footer,
	className,
}: AuthFormCardProps) {
	const reduceMotion = useReducedMotion()

	return (
		<motion.div
			initial={reduceMotion ? false : { opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.45, ease: LANDING_EASE_OUT }}
			className={cn(
				"rounded-xl border border-landing-border bg-landing-paper p-6",
				"shadow-[0_1px_3px_rgba(26,26,46,0.06),0_12px_40px_-12px_rgba(26,26,46,0.08)]",
				"sm:p-8",
				className,
			)}
		>
			<p className="text-sm font-medium text-landing-primary">{eyebrow}</p>
			<h1 className="mt-2 font-display text-2xl font-medium tracking-tight text-landing-ink sm:text-3xl">
				{title}
			</h1>
			<p className="mt-2 text-sm leading-relaxed text-landing-muted sm:text-base">
				{description}
			</p>
			{children}
			{footer}
		</motion.div>
	)
}

export function AuthFormDivider() {
	return (
		<div className="my-6 flex items-center gap-3">
			<div className="h-px flex-1 bg-landing-border" />
			<span className="text-xs tracking-wide text-landing-muted">
				or continue with
			</span>
			<div className="h-px flex-1 bg-landing-border" />
		</div>
	)
}
