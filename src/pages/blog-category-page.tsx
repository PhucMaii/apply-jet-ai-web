import { Link, Navigate, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { BlogCategoryNav } from "@/components/blog/blog-category-nav"
import { BlogPageShell } from "@/components/blog/blog-page-shell"
import { BlogPostCard } from "@/components/blog/blog-post-card"
import {
	getBlogCategory,
	getBlogPostsByCategory,
	getVisibleBlogCategories,
	isBlogCategorySlug,
} from "@/lib/blog"
import { ROUTES } from "@/lib/constants"
import { useDocumentMeta } from "@/lib/use-document-meta"
import { cn } from "@/lib/utils"

export function BlogCategoryPage() {
	const { categorySlug = "" } = useParams<{ categorySlug: string }>()
	const isValid = isBlogCategorySlug(categorySlug)
	const category = isValid ? getBlogCategory(categorySlug) : undefined
	const posts = isValid ? getBlogPostsByCategory(categorySlug) : []

	useDocumentMeta({
		title: category?.seoTitle ?? "Blog | ApplyJet",
		description:
			category?.seoDescription ?? "Guides for job seekers.",
	})

	if (!isValid || !category) {
		return <Navigate to={ROUTES.blog} replace />
	}

	return (
		<BlogPageShell>
			<Link
				to={ROUTES.blog}
				className="inline-flex items-center gap-1.5 text-sm font-medium text-landing-muted transition-colors hover:text-landing-primary"
			>
				<ArrowLeft className="size-3.5" aria-hidden />
				All posts
			</Link>

			<header
				className={cn(
					"mt-6 rounded-xl border border-landing-border bg-landing-paper p-6",
					"shadow-[0_1px_3px_rgba(26,26,46,0.06)] sm:p-8",
				)}
			>
				<p className="text-sm font-medium text-landing-primary">Category</p>
				<h1 className="mt-1 font-display text-3xl font-medium tracking-tight text-landing-ink sm:text-4xl">
					{category.name}
				</h1>
				<p className="mt-3 max-w-2xl text-sm leading-relaxed text-landing-muted sm:text-base">
					{category.description}
				</p>
			</header>

			<div className="mt-8">
				<BlogCategoryNav
					categories={getVisibleBlogCategories()}
					activeSlug={category.slug}
				/>
			</div>

			<section className="mt-10" aria-label={`Posts in ${category.name}`}>
				{posts.length === 0 ? (
					<p className="rounded-xl border border-dashed border-landing-border bg-landing-sand/40 px-5 py-10 text-center text-sm text-landing-muted">
						New articles for this topic are coming soon.
					</p>
				) : (
					<div className="grid gap-5 sm:grid-cols-2">
						{posts.map((post) => (
							<BlogPostCard key={post.slug} post={post} />
						))}
					</div>
				)}
			</section>
		</BlogPageShell>
	)
}
