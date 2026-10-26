import { LANDING_SECTION_ID } from "@/lib/landing/landing-section"
import {
	LANDING_COPY,
	LANDING_LOGIN_LINK,
	LANDING_PRIMARY_CTA,
	type LandingCopy,
} from "@/lib/landing-copy"
import { withPgwpLeaf } from "@/lib/pgwp-copy"

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
	},
	trustStrip: [
		withPgwpLeaf("PGWP countdown—free on your dashboard"),
		"Tailor from the job board — one button",
		"Kanban board — drag to track applications",
		"Resume help only — not immigration advice",
	],
	marketingNav: [
		{ hash: LANDING_SECTION_ID.jobsPreview, label: "Open jobs" },
		{ hash: LANDING_SECTION_ID.howItWorks, label: "How it works" },
		{ hash: LANDING_SECTION_ID.pgwpTracker, label: withPgwpLeaf("PGWP tracker") },
		{ hash: LANDING_SECTION_ID.whyWording, label: "AI tailoring" },
		// { hash: LANDING_SECTION_ID.features, label: "What you get" },
		// { hash: LANDING_SECTION_ID.faq, label: "FAQ" },
	],
	howItWorks: {
		...LANDING_COPY.howItWorks,
		title: "From PGWP pressure to a job-ready resume—free in four steps.",
		description:
			"Everything you need to apply stronger is free. Track your window, tailor from the job board, and manage applications on a Kanban—no credit card on this path.",
		steps: [
			{
				title: "Create your free account",
				body: "Sign up with email or Google. Your free resume workspace is ready right away—nothing to install, nothing to buy.",
			},
			{
				title: withPgwpLeaf("Add your PGWP expiry date"),
				body: "Enter it once, free. You’ll see days remaining while you apply—so the window stays visible.",
			},
			{
				title: "Tailor from the job board—free",
				body: "Browse openings and press Tailor with AI. One button opens an application with your resume rewritten for that posting.",
			},
			{
				title: "Track on a Kanban board",
				body: "Drag cards as you hear back. Keep tailored resumes, cover letters, and hiring contacts on every application.",
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
		title: "Tailor from the job board. Track on a Kanban. Free.",
		description:
			"One-click tailor from open jobs, drag-and-drop application tracking, PGWP countdown, live scoring, and cover letters—yours to use without paying.",
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
	finalCta: {
		title: "Ready for a free edge before the clock runs down?",
		description:
			"Join ApplyJet free. Track your PGWP, tailor from the job board in one click, and drag applications across a Kanban board—no credit card, no paid pitch. Job applications only—not immigration advice.",
		primaryCta: LANDING_PRIMARY_CTA,
		loginLink: LANDING_LOGIN_LINK,
	},
	footer: {
		...LANDING_COPY.footer,
		tagline:
			"Free resume builder for PGWP holders in Canada—one-click job-board tailor, Kanban tracking, and a PGWP countdown. Not immigration advice.",
		copyrightNote:
			"Built by Canadians, for Canadians. Resume help only. We cover the cost on this path.",
	},
	meta: {
		title: "ApplyJet — Free Resume Builder for PGWP Holders in Canada",
		description:
			"Free PGWP tracker, one-click tailor from the job board, and Kanban application tracking for international grads in Canada. Not immigration advice.",
	},
}
