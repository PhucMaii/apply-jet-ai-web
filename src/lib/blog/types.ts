export const BLOG_CATEGORY_SLUG = {
	atsResume: "ats-resume",
	canadaJobMarket: "canada-job-market",
	pgwpGuide: "pgwp-guide",
	techRecruiters: "canadian-tech-recruiters",
	toolComparison: "tool-comparison",
} as const

export type BlogCategorySlug =
	(typeof BLOG_CATEGORY_SLUG)[keyof typeof BLOG_CATEGORY_SLUG]

export type BlogBlock =
	| { type: "paragraph"; text: string }
	| { type: "heading"; level: 2 | 3; text: string }
	| { type: "list"; ordered?: boolean; items: string[] }
	| { type: "callout"; title?: string; text: string }
	| { type: "quote"; text: string; attribution?: string }

export interface BlogCategory {
	slug: BlogCategorySlug
	name: string
	shortName: string
	description: string
	seoTitle: string
	seoDescription: string
	/** Lucide icon key resolved in UI */
	icon: "fileSearch" | "briefcase" | "timer" | "users" | "scale"
}

export interface BlogPost {
	slug: string
	categorySlug: BlogCategorySlug
	title: string
	excerpt: string
	seoTitle: string
	seoDescription: string
	publishedAt: string
	updatedAt?: string
	readingMinutes: number
	tags: string[]
	/** One cover image per post — `public/blog/...` */
	coverImage: string
	coverImageAlt: string
	/** For related posts / internal linking */
	relatedSlugs?: string[]
	blocks: BlogBlock[]
}
