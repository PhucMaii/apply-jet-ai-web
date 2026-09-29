import {
	BLOG_CATEGORY_SLUG,
	type BlogCategory,
	type BlogCategorySlug,
} from "@/lib/blog/types"
import { FEATURES } from "@/lib/features"

export const BLOG_CATEGORIES: readonly BlogCategory[] = [
	{
		slug: BLOG_CATEGORY_SLUG.atsResume,
		name: "ATS Resume",
		shortName: "ATS Resume",
		description:
			"How applicant tracking systems read resumes—and how to write so yours gets through.",
		seoTitle: "ATS Resume Guides for Job Seekers | ApplyJet Blog",
		seoDescription:
			"Practical ATS resume tips: keywords, formatting, and how to beat filters without sounding robotic.",
		icon: "fileSearch",
	},
	{
		slug: BLOG_CATEGORY_SLUG.canadaJobMarket,
		name: "Job Market in Canada",
		shortName: "Canada Jobs",
		description:
			"Hiring trends, industries hiring, and what the Canadian job search actually looks like right now.",
		seoTitle: "Canadian Job Market Insights | ApplyJet Blog",
		seoDescription:
			"Clear takes on the Canada job market—where demand is and how to apply smarter.",
		icon: "briefcase",
	},
	{
		slug: BLOG_CATEGORY_SLUG.pgwpGuide,
		name: "PGWP, Explained Calmly",
		shortName: "PGWP Guide",
		description:
			"Breathable, plain-language PGWP explainers—not legal advice. Timelines, documents, and what to do while you wait.",
		seoTitle: "PGWP Guide in Plain Language | ApplyJet Blog",
		seoDescription:
			"A calmer guide to Post-Graduation Work Permits in Canada: what it is, what to check with IRCC, and how to job hunt while you wait.",
		icon: "timer",
	},
	{
		slug: BLOG_CATEGORY_SLUG.techRecruiters,
		name: "What Canadian Tech Recruiters Want",
		shortName: "Tech Recruiters",
		description:
			"What Toronto, Vancouver, and remote Canadian tech teams actually scan for in the first six seconds.",
		seoTitle: "What Canadian Tech Recruiters Want | ApplyJet Blog",
		seoDescription:
			"How Canadian tech recruiters screen resumes: keywords, impact bullets, Canadian experience myths, and outreach that works.",
		icon: "users",
	},
	{
		slug: BLOG_CATEGORY_SLUG.toolComparison,
		name: "ApplyJet vs Simplify vs Teal",
		shortName: "Tool Comparison",
		description:
			"Honest side-by-sides of resume and job-application tools—so you can pick what fits your search.",
		seoTitle: "ApplyJet vs Simplify vs TealHQ | ApplyJet Blog",
		seoDescription:
			"Compare ApplyJet AI, Simplify, and Teal for resume building, job tracking, and job search workflows.",
		icon: "scale",
	},
] as const

const HIDDEN_WHEN_GENERIC = new Set<BlogCategorySlug>([
	BLOG_CATEGORY_SLUG.pgwpGuide,
	BLOG_CATEGORY_SLUG.canadaJobMarket,
	BLOG_CATEGORY_SLUG.techRecruiters,
])

export function getVisibleBlogCategories(): BlogCategory[] {
	return BLOG_CATEGORIES.filter(
		(category) => FEATURES.pgwp || !HIDDEN_WHEN_GENERIC.has(category.slug),
	)
}

export function getBlogCategory(slug: string): BlogCategory | undefined {
	const category = BLOG_CATEGORIES.find((entry) => entry.slug === slug)
	if (!category) return undefined
	if (!FEATURES.pgwp && HIDDEN_WHEN_GENERIC.has(category.slug)) {
		return undefined
	}
	return category
}

export function isBlogCategorySlug(slug: string): slug is BlogCategorySlug {
	return getVisibleBlogCategories().some(
		(category) => category.slug === slug,
	)
}
