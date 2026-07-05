import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface MarketingPageShellProps {
	children: ReactNode
	className?: string
}

export function MarketingPageShell({
	children,
	className,
}: MarketingPageShellProps) {
	return (
		<div
			className={cn(
				"landing-page relative z-10 min-h-screen bg-landing-bg text-landing-ink",
				className,
			)}
		>
			{children}
		</div>
	)
}
