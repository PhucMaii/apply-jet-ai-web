import { ROUTES } from "@/lib/constants"
import {
	LANDING_COPY,
	LANDING_LOGIN_LINK,
	LANDING_PRIMARY_CTA,
} from "@/lib/landing-copy"

const ADS_NO_CREDIT_CARD_NOTE =
	"100% free · No credit card · No paid plans on this offer" as const

/**
 * Ad-traffic landing copy — free everywhere, no pricing / paid upsell language.
 * Keep structural parity with LANDING_COPY so shared sections keep working.
 */
export const ADS_LANDING_COPY: any = {
	...LANDING_COPY,
	hero: {
		title: "Free resume builder. Free AI for every job.",
		description:
			"ApplyJet is free for you—build your resume, score it live against any job description, get free match suggestions, and use free AI to tailor your bullets. Cover letters and HR contacts included. You keep the benefits; we cover the cost.",
		primaryCta: LANDING_PRIMARY_CTA,
		noCreditCardNote: ADS_NO_CREDIT_CARD_NOTE,
		socialProof: {
			rating: 4.9,
			label: "from early users",
			tagline:
				"Free tools that help you win interviews—no paywall waiting after signup",
		},
		video: {
			youtubeId: "7QBcWjdO8iA",
			eyebrow: "Free product walkthrough",
			title: "See how ApplyJet works—free",
			description:
				"A short tour of the free resume builder, live scoring, and free AI tailoring.",
			playLabel: "Play free product walkthrough video",
			caption: "Watch free — then build your resume free",
		},
	},
	trustStrip: [
		"Resume builder—free forever",
		"Free live score vs any job description",
		"Free match suggestions to improve your resume",
		"Free AI, cover letters & HR contacts for you",
	],
	howItWorks: {
		eyebrow: "How it works",
		title: "From blank page to job-ready—free in four steps.",
		description:
			"Everything you need to apply stronger is free. Build, score, improve, and tailor—no credit card, no paid upsell on this path.",
		steps: [
			{
				title: "Create your free account",
				body: "Sign up in seconds with email or Google. Your free resume workspace is ready right away—nothing to install, nothing to buy.",
			},
			{
				title: "Build your resume free",
				body: "Upload a PDF or DOCX, or start from scratch. Edit sections, polish your story, and save a resume you'll reuse—on us.",
			},
			{
				title: "Score live & improve—free",
				body: "Paste the job description. See your match score update live, with free suggestions on what to strengthen so you fit the role better.",
			},
			{
				title: "Free AI, cover letter & reach out",
				body: "Use free AI that rewrites experience for the posting, generate a cover letter, and discover HR contacts—so you apply with an unfair advantage.",
			},
		],
	},
	experienceBullets: {
		...LANDING_COPY.experienceBullets,
		footerNote:
			"ApplyJet reads your resume and the job description, then rewrites your experience bullets for each application—free for you. Your real work, phrased the way this role asks for it.",
	},
	features: {
		eyebrow: "What you get—free",
		title: "Every core tool is free. You only gain.",
		description:
			"We built ApplyJet so job seekers get the advantage without paying. Live scoring, match suggestions, AI tailoring, cover letters, and HR contacts—yours to use.",
		items: [
			{
				title: "Resume builder—free forever",
				body: "Create, edit, and download your resume at no cost. No credit card. No trial that turns into a bill. The builder stays free for you.",
				className: "md:col-span-2",
			},
			{
				title: "Free live score vs the job",
				body: "Paste a job description and see your resume match score update live—keywords, gaps, and fit. Always free.",
				className: "md:col-span-2",
			},
			{
				title: "Free match suggestions",
				body: "Get clear, actionable suggestions so you know what to strengthen to match the job description better—included for free.",
				className: "md:col-span-2",
			},
			{
				title: "Free AI that fits the job",
				body: "Use AI that rewrites your experience to match the role's keywords, scope, and priorities—so you look like the hire they want.",
				className: "",
			},
			{
				title: "Free cover letter generator",
				body: "Generate a letter grounded in this posting and your matched experience—not a one-size-fits-all opener.",
				className: "",
			},
			{
				title: "Free HR contact finder",
				body: "Discover recruiters and hiring contacts at the company so you know who to reach out to after you apply.",
				className: "md:col-span-2",
			},
		],
	},
	why: {
		eyebrow: "Why ApplyJet",
		title: "You get the tools. We take the cost.",
		without: {
			label: "Typical tools",
			title: "Paywalls right when you need help",
			items: [
				"Resume builders that lock edits or downloads behind a paywall",
				"One generic resume sent to every different role",
				"Match scores and tips locked until you subscribe",
				"No idea who to follow up with after you hit submit",
			],
		},
		with: {
			title: "Free for you—built to help you win",
			items: [
				"Resume builder free forever—build and edit without pressure",
				"Free live scoring against every job description",
				"Free suggestions and free AI to match the role better",
				"Cover letters and HR contacts included so you can apply smarter",
			],
		},
	},
	testimonials: {
		...LANDING_COPY.testimonials,
		items: [
			{
				quote:
					"I finally have a resume builder I can actually use for free—and the AI drafts for each job saved me so much time.",
				name: "Sarah M.",
				role: "Product designer",
				rating: 5,
			},
			{
				quote:
					"Free live scoring against the job description changed how I edit. I knew exactly what to fix before I applied.",
				name: "James K.",
				role: "Software engineer",
				rating: 5,
			},
			{
				quote:
					"Cover letters plus finding who to email—for free. That's what I was missing with every other resume tool.",
				name: "Priya R.",
				role: "Job seeker",
				rating: 4.5,
			},
		],
	},
	authCta: {
		badge: "Free forever · built for job seekers",
		title: "Your free resume workspace is waiting.",
		description:
			"Build free, score free, get free suggestions, and use free AI for every job—cover letters and HR contacts in one place. The upside is yours.",
		primaryCta: LANDING_PRIMARY_CTA,
		loginLink: LANDING_LOGIN_LINK,
	},
	finalCta: {
		title: "Ready for a free edge on every application?",
		description:
			"Join ApplyJet free. Build your resume, score it live, get free suggestions, and tailor with free AI—no credit card, no paid pitch. You benefit; we invest in you.",
		primaryCta: LANDING_PRIMARY_CTA,
		loginLink: LANDING_LOGIN_LINK,
	},
	footer: {
		tagline:
			"Free resume builder with free live scoring, free match suggestions, free AI tailoring, cover letters, and HR contacts—made for job seekers.",
		copyrightNote:
			"Built so you get the advantage. We cover the cost of helping you apply smarter.",
		productLinks: {
			features: { label: "Features", to: `${ROUTES.adsLanding}#features` },
			wording: {
				label: "Why AI tailoring",
				to: `${ROUTES.adsLanding}#why-wording`,
			},
		},
	},
	meta: {
		title: "ApplyJet — Free AI Resume Builder for Job Seekers",
		description:
			"Build your resume free forever. Free live scoring against any job description, free match suggestions, free AI tailoring, cover letters, and HR contacts—no credit card required.",
	},
} as any
