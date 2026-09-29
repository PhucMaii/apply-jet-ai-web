import { BookOpen } from "lucide-react"
import { BlogCategoryNav } from "@/components/blog/blog-category-nav"
import { BlogPageShell } from "@/components/blog/blog-page-shell"
import { BlogPostCard } from "@/components/blog/blog-post-card"
import {
	BLOG_INDEX_META,
	getAllBlogPosts,
	getVisibleBlogCategories,
} from "@/lib/blog"
import { useDocumentMeta } from "@/lib/use-document-meta"
import { cn } from "@/lib/utils"

export function BlogPage() {
	const posts = getAllBlogPosts()
	const categories = getVisibleBlogCategories()
	useDocumentMeta(BLOG_INDEX_META)

	return (
		<BlogPageShell>
			<header
				className={cn(
					"rounded-xl border border-landing-border bg-landing-paper p-6",
					"shadow-[0_1px_3px_rgba(26,26,46,0.06),0_12px_40px_-12px_rgba(26,26,46,0.08)]",
					"sm:p-8",
				)}
			>
				<div className="flex gap-4">
					<span
						className={cn(
							"flex size-14 shrink-0 items-center justify-center rounded-xl",
							"border border-landing-border bg-landing-sand text-landing-primary",
						)}
					>
						<BookOpen className="size-7" aria-hidden />
					</span>
					<div>
						<p className="text-sm font-medium text-landing-primary">
							Resources
						</p>
						<h1 className="mt-1 font-display text-3xl font-medium tracking-tight text-landing-ink sm:text-4xl">
							ApplyJet Blog
						</h1>
						<p className="mt-3 max-w-2xl text-sm leading-relaxed text-landing-muted sm:text-base">
							Straight-talk guides on ATS resumes, job search tools, and applying smarter.
						</p>
					</div>
				</div>
			</header>

			<section className="mt-10" aria-labelledby="blog-categories-heading">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<h2
							id="blog-categories-heading"
							className="font-display text-xl font-semibold text-landing-ink"
						>
							Browse by topic
						</h2>
						<p className="mt-1 text-sm text-landing-muted">
							Pick what you need this week.
						</p>
					</div>
				</div>
				<div className="mt-4">
					<BlogCategoryNav categories={categories} />
				</div>
			</section>

			<section className="mt-14" aria-labelledby="latest-posts-heading">
				<h2
					id="latest-posts-heading"
					className="font-display text-xl font-semibold text-landing-ink"
				>
					Latest articles
				</h2>
				<div className="mt-6 grid gap-5 sm:grid-cols-2">
					{posts.map((post) => (
						<BlogPostCard key={post.slug} post={post} />
					))}
				</div>
			</section>
		</BlogPageShell>
	)
}
