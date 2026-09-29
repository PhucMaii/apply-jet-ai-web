import { Link, Navigate, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { BlogArticleBody } from "@/components/blog/blog-article-body"
import { BlogAuthorByline } from "@/components/blog/blog-author-byline"
import { BlogCategoryChip } from "@/components/blog/blog-category-nav"
import { BlogPageShell } from "@/components/blog/blog-page-shell"
import { BlogPostCard } from "@/components/blog/blog-post-card"
import { LandingSignupLink } from "@/components/landing/landing-signup-link"
import { Button } from "@/components/ui/button"
import {
	getBlogPostBySlug,
	getBlogPostCategory,
	getRelatedBlogPosts,
} from "@/lib/blog"
import { ROUTES, blogCategoryPath } from "@/lib/constants"
import { LANDING_PRIMARY_CTA_BUTTON_CLASS } from "@/lib/landing-copy"
import { useDocumentMeta } from "@/lib/use-document-meta"
import { cn } from "@/lib/utils"

function formatBlogDate(isoDate: string): string {
	const [year, month, day] = isoDate.split("-").map(Number)
	return new Date(year, month - 1, day).toLocaleDateString(undefined, {
		month: "long",
		day: "numeric",
		year: "numeric",
	})
}

export function BlogPostPage() {
	const { slug = "" } = useParams<{ slug: string }>()
	const post = getBlogPostBySlug(slug)
	const category = post ? getBlogPostCategory(post) : undefined
	const related = post ? getRelatedBlogPosts(post) : []

	useDocumentMeta({
		title: post?.seoTitle ?? "Blog | ApplyJet",
		description:
			post?.seoDescription ?? "Guides for job seekers.",
	})

	if (!post) {
		return <Navigate to={ROUTES.blog} replace />
	}

	return (
		<BlogPageShell width="article">
			<nav className="flex flex-wrap items-center gap-2 text-sm text-landing-muted">
				<Link
					to={ROUTES.blog}
					className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-landing-primary"
				>
					<ArrowLeft className="size-3.5" aria-hidden />
					Blog
				</Link>
				{category ? (
					<>
						<span aria-hidden>/</span>
						<Link
							to={blogCategoryPath(category.slug)}
							className="font-medium transition-colors hover:text-landing-primary"
						>
							{category.shortName}
						</Link>
					</>
				) : null}
			</nav>

			<article className="mt-8">
				<header>
					<div className="flex flex-wrap items-center gap-2">
						{category ? <BlogCategoryChip category={category} /> : null}
						<span className="text-xs text-landing-muted">
							{formatBlogDate(post.publishedAt)} · {post.readingMinutes} min
							read
						</span>
					</div>
					<h1 className="mt-4 font-display text-3xl font-medium tracking-tight text-landing-ink sm:text-4xl sm:leading-tight">
						{post.title}
					</h1>
					<p className="mt-4 text-base leading-relaxed text-landing-muted sm:text-lg">
						{post.excerpt}
					</p>
					<BlogAuthorByline className="mt-6" />
					<figure className="mt-8 overflow-hidden rounded-xl border border-landing-border">
						<img
							src={post.coverImage}
							alt={post.coverImageAlt}
							className="aspect-[16/9] w-full object-cover"
							decoding="async"
						/>
					</figure>
				</header>

				<div className="mt-10 border-t border-landing-border pt-10">
					<BlogArticleBody blocks={post.blocks} />
				</div>

				{post.tags.length > 0 ? (
					<ul className="mt-10 flex flex-wrap gap-2" aria-label="Tags">
						{post.tags.map((tag) => (
							<li
								key={tag}
								className="rounded-full border border-landing-border bg-landing-sand/60 px-2.5 py-1 text-xs text-landing-muted"
							>
								{tag}
							</li>
						))}
					</ul>
				) : null}
			</article>

			<aside
				className={cn(
					"mt-14 rounded-xl border border-landing-primary/25 bg-gradient-to-br",
					"from-landing-primary/10 via-landing-paper to-landing-sand/50 p-6 sm:p-8",
				)}
			>
				<p className="text-sm font-semibold uppercase tracking-wider text-landing-primary">
					Next step
				</p>
				<h2 className="mt-2 font-display text-2xl font-semibold text-landing-ink">
					Build a resume that fits the job—free
				</h2>
				<p className="mt-2 max-w-xl text-sm leading-relaxed text-landing-muted">
					Score your resume live against a job description, tailor your
					bullets, and apply with a stronger packet.
				</p>
				<Button
					size="lg"
					surface="light"
					className={cn("mt-5", LANDING_PRIMARY_CTA_BUTTON_CLASS)}
					asChild
				>
					<LandingSignupLink
						location="blog_post"
						label="Build your resume free"
					>
						Build your resume free
					</LandingSignupLink>
				</Button>
			</aside>

			{related.length > 0 ? (
				<section className="mt-14" aria-labelledby="related-heading">
					<h2
						id="related-heading"
						className="font-display text-xl font-semibold text-landing-ink"
					>
						Keep reading
					</h2>
					<div className="mt-5 grid gap-4 sm:grid-cols-2">
						{related.map((item) => (
							<BlogPostCard key={item.slug} post={item} />
						))}
					</div>
				</section>
			) : null}
		</BlogPageShell>
	)
}
