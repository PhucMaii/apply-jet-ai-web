export const LANDING_SECTION_ID = {
	howItWorks: "how-it-works",
	jobsPreview: "open-jobs",
	pgwpTracker: "pgwp-tracker",
	whyWording: "why-wording",
	builtForCanada: "built-for-canada",
	features: "features",
	pricing: "pricing",
	faq: "faq",
} as const

export type LandingSectionId =
	(typeof LANDING_SECTION_ID)[keyof typeof LANDING_SECTION_ID]

export type ExperienceBulletTierKey = "bad" | "good" | "excellent"

export interface LandingNavItem {
	hash: LandingSectionId
	label: string
}

export interface LandingFaqItem {
	question: string
	answer: string
}