import {
	BLOG_CATEGORY_SLUG,
	type BlogCategory,
	type BlogCategorySlug,
} from "@/lib/blog/types"

export const BLOG_CATEGORIES: readonly BlogCategory[] = [
	{
		slug: BLOG_CATEGORY_SLUG.atsResume,
		name: "ATS Resume",
		shortName: "ATS Resume",
		description:
			"How applicant tracking systems read resumes in Canada—and how to write so yours gets through.",
		seoTitle: "ATS Resume Guides for Canadian Job Seekers | ApplyJet Blog",
		seoDescription:
			"Practical ATS resume tips for Canada: keywords, formatting, and how to beat filters without sounding robotic.",
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
			"Clear takes on the Canada job market for international grads and PGWP holders—where demand is and how to apply smarter.",
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
			"Honest side-by-sides of resume and job-application tools—so you can pick what fits a Canadian PGWP search.",
		seoTitle: "ApplyJet vs Simplify vs TealHQ | ApplyJet Blog",
		seoDescription:
			"Compare ApplyJet AI, Simplify, and Teal for resume building, job tracking, and Canadian PGWP-focused job search workflows.",
		icon: "scale",
	},
] as const

export function getBlogCategory(
	slug: string,
): BlogCategory | undefined {
	return BLOG_CATEGORIES.find((category) => category.slug === slug)
}

export function isBlogCategorySlug(slug: string): slug is BlogCategorySlug {
	return BLOG_CATEGORIES.some((category) => category.slug === slug)
}
