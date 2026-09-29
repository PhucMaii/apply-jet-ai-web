import { getBlogCategory } from "@/lib/blog/categories"
import { ATS_RESUME_KEYWORDS_POST } from "@/lib/blog/posts/ats-resume-keywords-canada"
import { ATS_SCORING_2026_POST } from "@/lib/blog/posts/ats-scoring-2026"
import { CANADA_JOB_MARKET_POST } from "@/lib/blog/posts/canada-job-market-2026"
import { TECH_RECRUITERS_POST } from "@/lib/blog/posts/canadian-tech-recruiters"
import { PGWP_CALM_GUIDE_POST } from "@/lib/blog/posts/pgwp-explained-calmly"
import { TOOL_COMPARISON_POST } from "@/lib/blog/posts/applyjet-vs-simplify-vs-teal"
import {
	BLOG_CATEGORY_SLUG,
	type BlogCategorySlug,
	type BlogPost,
} from "@/lib/blog/types"
import { FEATURES } from "@/lib/features"

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

function isVisibleBlogPost(post: BlogPost): boolean {
	if (FEATURES.pgwp) return true
	if (
		post.categorySlug === BLOG_CATEGORY_SLUG.pgwpGuide ||
		post.categorySlug === BLOG_CATEGORY_SLUG.canadaJobMarket ||
		post.categorySlug === BLOG_CATEGORY_SLUG.techRecruiters
	) {
		return false
	}
	return !/canada|canadian|pgwp/i.test(
		`${post.slug} ${post.title} ${post.tags.join(" ")}`,
	)
}

export function getAllBlogPosts(): BlogPost[] {
	return [...BLOG_POSTS].filter(isVisibleBlogPost).sort(byNewest)
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
	const post = BLOG_POSTS.find((entry) => entry.slug === slug)
	if (!post || !isVisibleBlogPost(post)) return undefined
	return post
}

export function getBlogPostsByCategory(
	categorySlug: BlogCategorySlug,
): BlogPost[] {
	return BLOG_POSTS.filter(
		(post) => post.categorySlug === categorySlug && isVisibleBlogPost(post),
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
	title: "ApplyJet Blog — ATS Resumes & Job Search",
	description:
		"Guides for job seekers: ATS resumes, tool comparisons, and applying smarter.",
} as const
