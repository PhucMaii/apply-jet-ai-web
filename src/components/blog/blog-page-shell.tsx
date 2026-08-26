import type { ReactNode } from "react"
import { MarketingPageShell } from "@/components/layout/marketing-page-shell"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { cn } from "@/lib/utils"

interface BlogPageShellProps {
	children: ReactNode
	/** Wider for index grids; narrower for article reading */
	width?: "index" | "article"
}

export function BlogPageShell({
	children,
	width = "index",
}: BlogPageShellProps) {
	return (
		<MarketingPageShell className="flex flex-col">
			<SiteHeader />
			<main
				className={cn(
					"mx-auto w-full flex-1 px-4 py-12 sm:px-6 sm:py-16",
					width === "article" ? "max-w-3xl" : "max-w-6xl",
				)}
			>
				{children}
			</main>
			<SiteFooter />
		</MarketingPageShell>
	)
}
