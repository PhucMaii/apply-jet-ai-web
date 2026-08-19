import { LANDING_SECTION_ID } from "@/lib/landing/landing-section"
import {
	LANDING_COPY,
	LANDING_LOGIN_LINK,
	LANDING_PRIMARY_CTA,
	type LandingCopy,
} from "@/lib/landing-copy"

const ADS_NO_CREDIT_CARD_NOTE =
	"100% free · PGWP tracker included · No credit card" as const

/**
 * Paid-ad landing copy.
 * Same Canada / PGWP story as the homepage, free-everywhere messaging, no pricing nav.
 */
export const ADS_LANDING_COPY: LandingCopy = {
	...LANDING_COPY,
	hero: {
		...LANDING_COPY.hero,
		canadaMadeLabel: "Built by Canadians, for Canadians",
		title: "Your PGWP has a clock. Your resume shouldn’t waste it.",
		description:
			"ApplyJet is free for international grads and PGWP holders in Canada. Track your expiry date, build your resume, score it against Canadian job postings, and rewrite your real experience so employers and ATS systems here can see it. Cover letters and hiring contacts included. Not immigration advice—job-application help only.",
		noCreditCardNote: ADS_NO_CREDIT_CARD_NOTE,
		socialProof: {
			...LANDING_COPY.hero.socialProof,
			tagline:
				"Free PGWP tracker, live scoring, and match suggestions—no paywall waiting after signup",
		},
		video: {
			...LANDING_COPY.hero.video,
			eyebrow: "Free product walkthrough",
			title: "See how ApplyJet works—free",
			caption: "Watch free — then build your resume free",
		},
	},
	trustStrip: [
		"PGWP countdown—free on your dashboard",
		"Written for Canadian employers and ATS",
		"Free live score vs any job posting",
		"Resume help only — not immigration advice",
	],
	marketingNav: [
		{ hash: LANDING_SECTION_ID.howItWorks, label: "How it works" },
		{ hash: LANDING_SECTION_ID.pgwpTracker, label: "PGWP tracker" },
		{ hash: LANDING_SECTION_ID.whyWording, label: "AI tailoring" },
		{ hash: LANDING_SECTION_ID.features, label: "What you get" },
		{ hash: LANDING_SECTION_ID.faq, label: "FAQ" },
	],
	howItWorks: {
		...LANDING_COPY.howItWorks,
		title: "From PGWP pressure to a job-ready resume—free in four steps.",
		description:
			"Everything you need to apply stronger is free. Track your window, build, score, and tailor—no credit card on this path.",
		steps: [
			{
				title: "Create your free account",
				body: "Sign up with email or Google. Your free resume workspace is ready right away—nothing to install, nothing to buy.",
			},
			{
				title: "Add your PGWP expiry date",
				body: "Enter it once, free. You’ll see days remaining while you apply—so the window stays visible.",
			},
			{
				title: "Build and score against the posting—free",
				body: "Upload a PDF or start from scratch. Paste a Canadian job description and see your match score update live.",
			},
			{
				title: "Free AI, cover letter, and reach out",
				body: "Use free AI that reframes your experience for the posting, generate a cover letter, and find hiring contacts.",
			},
		],
	},
	experienceBullets: {
		...LANDING_COPY.experienceBullets,
		footerNote:
			"ApplyJet reads your resume and the job description, then rewrites your bullets for that application—free for you. We don’t invent Canadian jobs. We help Canadian ATS systems read the work you already have.",
	},
	features: {
		...LANDING_COPY.features,
		eyebrow: "What you get—free",
		title: "Every core tool is free. Including the PGWP tracker.",
		description:
			"We built ApplyJet so people on a PGWP can apply stronger without paying. Tracker, live scoring, match suggestions, AI tailoring, cover letters, and hiring contacts—yours to use.",
	},
	why: {
		...LANDING_COPY.why,
		title: "You get the tools. We take the cost.",
		with: {
			title: "Free for you—built for this search in Canada",
			items: [
				"PGWP tracker free on the page you use every day",
				"Free live scoring against each job description",
				"Free suggestions and free AI to match Canadian postings",
				"Cover letters and hiring contacts included so you can apply smarter",
			],
		},
	},
	faq: {
		...LANDING_COPY.faq,
		items: [
			...LANDING_COPY.faq.items.slice(0, 4),
			{
				question: "Is the resume builder still free?",
				answer:
					"Yes. On this path the builder, PGWP tracker, live scoring, match suggestions, AI, cover letters, and hiring contacts are free for you. No credit card.",
			},
		],
	},
	authCta: {
		badge: "Free forever · PGWP tracker included",
		title: "Your free resume workspace is waiting.",
		description:
			"Build free, track your PGWP, score free, and use free AI for Canadian job postings. Cover letters and hiring contacts in one place. The upside is yours.",
		primaryCta: LANDING_PRIMARY_CTA,
		loginLink: LANDING_LOGIN_LINK,
	},
	finalCta: {
		title: "Ready for a free edge before the clock runs down?",
		description:
			"Join ApplyJet free. Track your PGWP, build your resume, score it live, and tailor with free AI—no credit card, no paid pitch. Job applications only—not immigration advice.",
		primaryCta: LANDING_PRIMARY_CTA,
		loginLink: LANDING_LOGIN_LINK,
	},
	footer: {
		...LANDING_COPY.footer,
		tagline:
			"Free resume builder for PGWP holders in Canada—tracker, live scoring, AI tailoring, cover letters, and hiring contacts. Not immigration advice.",
		copyrightNote:
			"Built by Canadians, for Canadians. Resume help only. We cover the cost on this path.",
	},
	meta: {
		title: "ApplyJet — Free Resume Builder for PGWP Holders in Canada",
		description:
			"Free PGWP tracker, resume builder, live scoring, and AI tailoring for international grads job hunting in Canada. Not immigration advice.",
	},
}
