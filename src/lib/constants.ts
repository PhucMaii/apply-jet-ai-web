export const APP_NAME = "ApplyJet AI"

/** Brand mark (icon only) — `public/applyjet-mark.svg` */
export const BRAND_LOGO_SRC = "/applyjet-mark.svg"

/** Full wordmark with tagline — `public/applyjet-logo-full.svg` */
export const BRAND_LOGO_FULL_SRC = "/applyjet-logo-full.svg"

/** Hero illustration — person celebrating a job offer */
export const HERO_OFFER_IMAGE_SRC = "/hero-offer-celebration.png"

/** Reddit Ads pixel ID used on `/lp/ads`. */
export const REDDIT_ADS_PIXEL_ID = "a2_j4v4yl9cxm2u" as const

export const ROUTES = {
	home: "/",
	login: "/login",
	signup: "/signup",
	authCallback: "/auth/callback",
	applications: "/applications",
	applicationCreate: "/applications/new",
	applicationDetail: "/applications/:applicationId",
	jobs: "/jobs",
	profile: "/profile",
	privacy: "/privacy",
	terms: "/terms",
	support: "/support",
	adsLanding: "/lp/ads",
	blog: "/blog",
	blogCategory: "/blog/category/:categorySlug",
	blogPost: "/blog/:slug",
} as const

export function applicationDetailPath(applicationId: string) {
	return `/applications/${applicationId}`
}

export function blogPostPath(slug: string) {
	return `/blog/${slug}`
}

export function blogCategoryPath(categorySlug: string) {
	return `/blog/category/${categorySlug}`
}

/** Supabase Edge Function names for Stripe billing */
export const EDGE_FUNCTIONS = {
	stripeCheckout: "stripe-checkout",
	stripeCustomerPortal: "stripe-customer-portal",
} as const

export const SUPPORT_EMAIL = "support@applyjetai.com"

export const LINKS = {
	extensionDownload: "https://chromewebstore.google.com/detail/applyjet-ai/epeoejbbnmghpbafefmjdjdeilngnnbg",
	contactMail: `mailto:${SUPPORT_EMAIL}`,
} as const

export const META = {
	title: "ApplyJet — Find Jobs, Tailor Your Resume, Apply Faster",
	description:
		"Browse jobs, build an ATS-friendly resume, score it against each posting, and tailor with AI before you apply.",
} as const
