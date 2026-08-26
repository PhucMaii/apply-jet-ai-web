import { BLOG_AUTHOR } from "@/lib/blog/author"
import { cn } from "@/lib/utils"

interface BlogAuthorBylineProps {
	className?: string
	/** Compact row for cards; full for article header */
	size?: "sm" | "md"
}

export function BlogAuthorByline({
	className,
	size = "md",
}: BlogAuthorBylineProps) {
	const isCompact = size === "sm"
	const avatarClass = isCompact ? "size-8" : "size-11"
	const nameClass = isCompact ? "text-xs" : "text-sm"
	const roleClass = isCompact ? "text-[11px]" : "text-xs"

	return (
		<div className={cn("flex items-center gap-3", className)}>
			<img
				src={BLOG_AUTHOR.avatarSrc}
				alt={BLOG_AUTHOR.avatarAlt}
				className={cn(
					"shrink-0 rounded-full object-cover ring-1 ring-landing-border",
					avatarClass,
				)}
				loading="lazy"
				decoding="async"
			/>
			<div className="min-w-0">
				<a
					href={BLOG_AUTHOR.linkedinUrl}
					target="_blank"
					rel="noopener noreferrer"
					className={cn(
						"font-semibold text-landing-ink underline-offset-2 transition-colors",
						"hover:text-landing-primary hover:underline",
						nameClass,
					)}
				>
					{BLOG_AUTHOR.name}
				</a>
				<p className={cn("text-landing-muted", roleClass)}>
					{BLOG_AUTHOR.role}
				</p>
			</div>
		</div>
	)
}
