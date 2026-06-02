export const APP_NAME = "ApplyJet AI"

/** Served from `public/logo.png` */
export const BRAND_LOGO_SRC = "/logo.png"

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
} as const

export function applicationDetailPath(applicationId: string) {
	return `/applications/${applicationId}`
}

/** Supabase Edge Function names for Stripe billing */
export const EDGE_FUNCTIONS = {
	stripeCheckout: "stripe-checkout",
	stripeCustomerPortal: "stripe-customer-portal",
} as const

export const LINKS = {
	extensionDownload: "https://chromewebstore.google.com/detail/applyjet-ai/epeoejbbnmghpbafefmjdjdeilngnnbg",
	contactMail: "mailto:maithienphuc0102@gmail.com",
} as const

export const META = {
	title: "ApplyJet AI — Tailored applications that get past ATS",
	description:
		"ApplyJet AI is a Chrome extension that reads each job post and helps you generate ATS-aligned resumes, cover letters, and long-form answers—so you are not stopped before a human sees you.",
} as const
