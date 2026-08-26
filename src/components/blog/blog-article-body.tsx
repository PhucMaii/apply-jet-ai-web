import type { BlogBlock } from "@/lib/blog/types"
import { cn } from "@/lib/utils"

interface BlogArticleBodyProps {
	blocks: readonly BlogBlock[]
	className?: string
}

export function BlogArticleBody({ blocks, className }: BlogArticleBodyProps) {
	return (
		<div className={cn("space-y-6", className)}>
			{blocks.map((block, index) => {
				const key = `${block.type}-${index}`

				if (block.type === "paragraph") {
					return (
						<p
							key={key}
							className="text-base leading-relaxed text-landing-ink/90 sm:text-[1.05rem] sm:leading-relaxed"
						>
							{block.text}
						</p>
					)
				}

				if (block.type === "heading") {
					if (block.level === 2) {
						return (
							<h2
								key={key}
								className="scroll-mt-24 pt-2 font-display text-2xl font-semibold tracking-tight text-landing-ink"
							>
								{block.text}
							</h2>
						)
					}
					return (
						<h3
							key={key}
							className="scroll-mt-24 pt-1 font-display text-xl font-semibold text-landing-ink"
						>
							{block.text}
						</h3>
					)
				}

				if (block.type === "list") {
					const ListTag = block.ordered ? "ol" : "ul"
					return (
						<ListTag
							key={key}
							className={cn(
								"space-y-2 pl-5 text-base leading-relaxed text-landing-ink/90",
								block.ordered ? "list-decimal" : "list-disc",
							)}
						>
							{block.items.map((item) => (
								<li key={item} className="pl-1">
									{item}
								</li>
							))}
						</ListTag>
					)
				}

				if (block.type === "callout") {
					return (
						<aside
							key={key}
							className="rounded-xl border border-landing-primary/20 bg-landing-primary/[0.06] px-4 py-3 sm:px-5 sm:py-4"
						>
							{block.title ? (
								<p className="text-sm font-semibold text-landing-primary">
									{block.title}
								</p>
							) : null}
							<p
								className={cn(
									"text-sm leading-relaxed text-landing-ink/85",
									block.title && "mt-1.5",
								)}
							>
								{block.text}
							</p>
						</aside>
					)
				}

				return (
					<blockquote
						key={key}
						className="border-l-4 border-landing-primary/40 pl-4 italic text-landing-muted"
					>
						<p>{block.text}</p>
						{block.attribution ? (
							<footer className="mt-2 text-sm not-italic text-landing-muted/80">
								— {block.attribution}
							</footer>
						) : null}
					</blockquote>
				)
			})}
		</div>
	)
}
