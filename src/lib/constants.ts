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
	title: "ApplyJet AI — Tailored job applications in your browser",
	description:
		"Create an account, upload your resume, and paste any job description. ApplyJet pre-fills your profile and generates tailored resumes, cover letters, and HR contacts.",
} as const
