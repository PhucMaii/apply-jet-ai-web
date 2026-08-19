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
		"ApplyJet — Free Resume Builder for PGWP Holders in Canada",
	description:
		"Track your PGWP expiry, build your resume free, and tailor it for Canadian employers and ATS. Not immigration advice—job application help only.",
} as const
