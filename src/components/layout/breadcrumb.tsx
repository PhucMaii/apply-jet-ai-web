import { Fragment } from "react"
import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
	label: string
	/** Omit for the current page. */
	href?: string
}

interface BreadcrumbProps {
	items: readonly BreadcrumbItem[]
	className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
	return (
		<nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
			<ol className="flex min-w-0 items-center gap-1.5 text-sm">
				{items.map((item, index) => {
					const isLast = index === items.length - 1
					return (
						<Fragment key={`${item.label}-${index}`}>
							<li className={cn("min-w-0", isLast ? "truncate" : "shrink-0")}>
								{item.href && !isLast ? (
									<Link
										to={item.href}
										className="rounded-sm text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
									>
										{item.label}
									</Link>
								) : (
									<span
										className="font-medium text-ink"
										aria-current={isLast ? "page" : undefined}
									>
										{item.label}
									</span>
								)}
							</li>
							{!isLast ? (
								<li aria-hidden className="shrink-0 text-ink-subtle">
									<ChevronRight className="size-3.5" />
								</li>
							) : null}
						</Fragment>
					)
				})}
			</ol>
		</nav>
	)
}
