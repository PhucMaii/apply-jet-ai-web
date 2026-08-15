export const APP_NAME = "ApplyJet AI"

/** Served from `public/logo.png` */
export const BRAND_LOGO_SRC = "/logo.png"

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
	profile: "/profile",
	privacy: "/privacy",
	terms: "/terms",
	support: "/support",
	adsLanding: "/lp/ads",
} as const

export function applicationDetailPath(applicationId: string) {
	return `/applications/${applicationId}`
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
	title:
		"ApplyJet — Free AI Resume Builder | Live Score vs Job Description",
	description:
		"Build your resume free forever with ApplyJet. Score it live against any job description, get free match suggestions, try AI tailoring, generate cover letters, and find HR contacts.",
} as const
