import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { BlogAuthorByline } from "@/components/blog/blog-author-byline"
import { BlogCategoryChip } from "@/components/blog/blog-category-nav"
import { getBlogCategory } from "@/lib/blog/categories"
import { blogPostPath } from "@/lib/constants"
import type { BlogPost } from "@/lib/blog/types"
import { cn } from "@/lib/utils"

function formatBlogDate(isoDate: string): string {
	const [year, month, day] = isoDate.split("-").map(Number)
	return new Date(year, month - 1, day).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	})
}

interface BlogPostCardProps {
	post: BlogPost
	className?: string
}

export function BlogPostCard({ post, className }: BlogPostCardProps) {
	const category = getBlogCategory(post.categorySlug)

	return (
		<article
			className={cn(
				"group flex h-full flex-col overflow-hidden rounded-xl border border-landing-border bg-landing-paper",
				"shadow-[0_1px_2px_rgba(26,26,46,0.04)]",
				"transition-[transform,box-shadow,border-color] duration-300 ease-out",
				"hover:-translate-y-0.5 hover:border-landing-primary/25",
				"hover:shadow-[0_12px_40px_-16px_rgba(26,26,46,0.14)]",
				className,
			)}
		>
			<Link
				to={blogPostPath(post.slug)}
				className="relative block aspect-[16/10] overflow-hidden bg-landing-sand"
			>
				<img
					src={post.coverImage}
					alt={post.coverImageAlt}
					className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
					loading="lazy"
					decoding="async"
				/>
			</Link>

			<div className="flex flex-1 flex-col p-5 sm:p-6">
				<div className="flex flex-wrap items-center gap-2">
					{category ? <BlogCategoryChip category={category} /> : null}
					<span className="text-xs text-landing-muted">
						{formatBlogDate(post.publishedAt)} · {post.readingMinutes} min
					</span>
				</div>
				<h2 className="mt-4 font-display text-xl font-semibold tracking-tight text-landing-ink">
					<Link
						to={blogPostPath(post.slug)}
						className="transition-colors hover:text-landing-primary"
					>
						{post.title}
					</Link>
				</h2>
				<p className="mt-2 flex-1 text-sm leading-relaxed text-landing-muted">
					{post.excerpt}
				</p>
				<BlogAuthorByline size="sm" className="mt-4" />
				<Link
					to={blogPostPath(post.slug)}
					className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-landing-primary underline-offset-4 hover:underline"
				>
					Read article
					<ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
				</Link>
			</div>
		</article>
	)
}
