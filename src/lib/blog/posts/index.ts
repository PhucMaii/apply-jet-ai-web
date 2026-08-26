import { getBlogCategory } from "@/lib/blog/categories"
import { ATS_RESUME_KEYWORDS_POST } from "@/lib/blog/posts/ats-resume-keywords-canada"
import { ATS_SCORING_2026_POST } from "@/lib/blog/posts/ats-scoring-2026"
import { CANADA_JOB_MARKET_POST } from "@/lib/blog/posts/canada-job-market-2026"
import { TECH_RECRUITERS_POST } from "@/lib/blog/posts/canadian-tech-recruiters"
import { PGWP_CALM_GUIDE_POST } from "@/lib/blog/posts/pgwp-explained-calmly"
import { TOOL_COMPARISON_POST } from "@/lib/blog/posts/applyjet-vs-simplify-vs-teal"
import type { BlogCategorySlug, BlogPost } from "@/lib/blog/types"

/** Single registry — add new posts here to publish. */
export const BLOG_POSTS: readonly BlogPost[] = [
	ATS_SCORING_2026_POST,
	TOOL_COMPARISON_POST,
	TECH_RECRUITERS_POST,
	CANADA_JOB_MARKET_POST,
	ATS_RESUME_KEYWORDS_POST,
	PGWP_CALM_GUIDE_POST,
]

function byNewest(a: BlogPost, b: BlogPost): number {
	return b.publishedAt.localeCompare(a.publishedAt)
}

export function getAllBlogPosts(): BlogPost[] {
	return [...BLOG_POSTS].sort(byNewest)
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
	return BLOG_POSTS.find((post) => post.slug === slug)
}

export function getBlogPostsByCategory(
	categorySlug: BlogCategorySlug,
): BlogPost[] {
	return BLOG_POSTS.filter(
		(post) => post.categorySlug === categorySlug,
	).sort(byNewest)
}

export function getRelatedBlogPosts(post: BlogPost, limit = 3): BlogPost[] {
	const fromSlugs = (post.relatedSlugs ?? [])
		.map((slug) => getBlogPostBySlug(slug))
		.filter((related): related is BlogPost => Boolean(related))

	if (fromSlugs.length >= limit) {
		return fromSlugs.slice(0, limit)
	}

	const fillers = getBlogPostsByCategory(post.categorySlug).filter(
		(candidate) =>
			candidate.slug !== post.slug &&
			!fromSlugs.some((related) => related.slug === candidate.slug),
	)

	return [...fromSlugs, ...fillers].slice(0, limit)
}

export function getBlogPostCategory(post: BlogPost) {
	return getBlogCategory(post.categorySlug)
}

export const BLOG_INDEX_META = {
	title: "ApplyJet Blog — ATS Resumes, PGWP & Canadian Job Search",
	description:
		"Guides for international grads and PGWP holders in Canada: ATS resumes, the job market, calm PGWP explainers, tech recruiting, and tool comparisons.",
} as const
