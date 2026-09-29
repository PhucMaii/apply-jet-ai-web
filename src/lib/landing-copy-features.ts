import { LANDING_SECTION_ID } from "@/lib/landing/landing-section"
import type { LandingCopy } from "@/lib/landing-copy"
import { FEATURES } from "@/lib/features"

const JOBS_HERO = {
	canadaMadeLabel: "Job search, simplified",
	title: "Find jobs. Tailor your resume. Apply with confidence.",
	description:
		"ApplyJet helps you discover roles, score your resume against the posting, and rewrite your real experience so employers and ATS systems can see the fit—then apply.",
	socialProofTagline:
		"Browse jobs, score your resume live, and tailor before you apply.",
	videoDescription:
		"A short tour of job search, free resume building, live job-match scoring, and AI tailoring.",
	noCreditCardNote: "Free builder · Job matching · No credit card",
} as const

function isRegionalMarketing(text: string): boolean {
	return /pgwp|🍁|canada|canadian|toronto|vancouver|ircc|express entry/i.test(
		text,
	)
}

/**
 * When regional/PGWP messaging is disabled, rewrite marketing copy to a
 * generic jobs/apply focus and drop tracker-specific nav and cards.
 */
export function applyLandingFeatureFlags(copy: LandingCopy): LandingCopy {
	if (FEATURES.pgwp) return copy

	const howItWorksSteps = copy.howItWorks.steps.filter(
		(step) =>
			!isRegionalMarketing(step.title) && !isRegionalMarketing(step.body),
	)

	const faqItems = copy.faq.items.filter(
		(item) =>
			!isRegionalMarketing(item.question) &&
			!isRegionalMarketing(item.answer),
	)

	return {
		...copy,
		hero: {
			...copy.hero,
			canadaMadeLabel: JOBS_HERO.canadaMadeLabel,
			title: JOBS_HERO.title,
			description: JOBS_HERO.description,
			noCreditCardNote: JOBS_HERO.noCreditCardNote,
			socialProof: {
				...copy.hero.socialProof,
				tagline: JOBS_HERO.socialProofTagline,
			},
			video: {
				...copy.hero.video,
				description: JOBS_HERO.videoDescription,
			},
		},
		trustStrip: [
			"Free job board — browse without signing up",
			"Free live score vs any job posting",
			"ATS-friendly resume tools",
			"Apply with a stronger packet",
		],
		marketingNav: [
			{ hash: LANDING_SECTION_ID.jobsPreview, label: "Open jobs" },
			...copy.marketingNav.filter(
				(item) =>
					item.hash !== LANDING_SECTION_ID.pgwpTracker &&
					item.hash !== LANDING_SECTION_ID.jobsPreview,
			),
		],
		jobsPreview: {
			...copy.jobsPreview,
			title: "Browse real openings—free, no account required.",
			description:
				"Search live roles by title and location. When one fits, tailor your resume to the posting and apply with a stronger packet.",
		},
		howItWorks: {
			...copy.howItWorks,
			title: "From job search to a tailored application—in four steps.",
			description:
				"Start free. Find roles that fit, build a resume employers can scan, then tailor it to each posting before you apply.",
			steps:
				howItWorksSteps.length >= 3
					? howItWorksSteps
					: [
							{
								title: "Create your free account",
								body: "Sign up with email or Google. Your resume workspace is ready right away—nothing to install.",
							},
							{
								title: "Browse jobs that match you",
								body: "Search roles by title and location, then open postings that fit what you’re looking for.",
							},
							{
								title: "Build and score against the posting",
								body: "Upload a PDF or start from scratch. Paste a job description, see your match score live, and get suggestions on what to strengthen.",
							},
							{
								title: "Rewrite, then apply",
								body: "Use AI that reframes your real experience in the posting’s language, generate a cover letter, and apply with a stronger packet.",
							},
						],
		},
		experienceBullets: {
			...copy.experienceBullets,
			title: "Generic bullets get filtered. Tailored bullets get read.",
			description:
				"Strong applications translate your real experience into the keywords, metrics, and impact a posting is scanning for—without inventing work you didn’t do.",
			jobContext: {
				...copy.experienceBullets.jobContext,
				company: "Northshore Pay · Fintech",
				snippet:
					"Looking for someone with React, Node.js, and PostgreSQL experience. You’ll ship features with product and design, keep production reliable, and communicate clearly with the team.",
			},
			principles: [
				{
					title: "Use the posting’s words",
					body: "If the role asks for React and production reliability, say that—not “various technologies.”",
				},
				{
					title: "Keep the proof, change the framing",
					body: "Your degree, internships, and jobs are real. Rewrite them so an ATS can map them to this role.",
				},
				{
					title: "Lead with impact",
					body: "Start with what changed because of you. That’s how you get past a six-second skim.",
				},
			],
			tiers: copy.experienceBullets.tiers.map((tier) => ({
				...tier,
				subtitle: isRegionalMarketing(tier.subtitle)
					? tier.key === "good"
						? "Honest — but not written for this role"
						: tier.key === "excellent"
							? "Same experience — role-specific language"
							: tier.subtitle
					: tier.subtitle,
				verdict: isRegionalMarketing(tier.verdict)
					? tier.key === "bad"
						? "Vague, missing keywords. Easy for an ATS to skip."
						: tier.key === "good"
							? "Readable and true, but not mapped to this posting’s language."
							: "Your real work, rewritten so employers and ATS can recognize the fit."
					: tier.verdict,
				takeaways: tier.takeaways.map((item) =>
					isRegionalMarketing(item)
						? item
								.replace(/Canadian posting/gi, "posting")
								.replace(/Canadian /gi, "")
								.replace(/any country, any company/gi, "any company")
						: item,
				),
			})),
			footerNote:
				"ApplyJet reads your resume and the job description, then rewrites your experience bullets for that application. We don’t invent jobs you didn’t have—we help ATS systems and recruiters understand the ones you did.",
		},
		builtForCanada: {
			...copy.builtForCanada,
			eyebrow: "Built for job seekers",
			title: "Tools for finding roles and applying with a stronger resume.",
			description:
				"Plain facts about what the product does—no over-claiming.",
			items: [
				{
					title: "ATS-friendly resumes",
					body: "Build a clean resume format that applicant tracking systems can parse without drama.",
				},
				{
					title: "Language the posting recognizes",
					body: "Tailor bullets to the job’s keywords so your experience maps to what employers are scanning for.",
				},
				{
					title: "Live match scoring",
					body: "Paste a job description and see fit, gaps, and suggestions before you apply.",
				},
				{
					title: "Job applications only",
					body: "We help you write, score, and send stronger applications—not immigration or legal advice.",
				},
			],
		},
		features: {
			...copy.features,
			title: "A free resume builder—plus live scoring and job-ready tools.",
			description:
				"Build and edit at no cost. Score against job descriptions, get suggestions, try AI when you want a rewrite, then generate cover letters and apply.",
			items: copy.features.items.filter(
				(item) =>
					!isRegionalMarketing(item.title) &&
					!isRegionalMarketing(item.body),
			),
		},
		why: {
			...copy.why,
			title: "Job hunting is hard. Your resume is the part you can change today.",
			without: {
				...copy.why.without,
				title: "Generic docs, wasted applications, slow feedback",
				items: [
					"One generic resume sent to every posting",
					"Experience buried in vague bullets ATS systems skip",
					"No clear sense of whether you match the role",
					"Paywalls on scoring, downloads, or basic edits",
				],
			},
			with: {
				...copy.why.with,
				title: "Jobs, scoring, and applications written for the role",
				items: [
					"Browse and filter jobs that fit your search",
					"Free live scoring against each job description",
					"Bullets rewritten in language employers and ATS recognize",
					"Builder free forever—upgrade only if you need more AI, letters, or contacts",
				],
			},
		},
		testimonials: {
			...copy.testimonials,
			title: "Stories from job seekers—coming as we collect them",
			summaryLabel:
				"We’re collecting real quotes from people using ApplyJet to apply.",
			items: copy.testimonials.items.map((item, index) => ({
				...item,
				quote:
					"Placeholder for a real quote about using ApplyJet while job hunting.",
				name: `Quote ${index + 1} — coming soon`,
				role: "Job seeker",
			})),
		},
		pricing: {
			...copy.pricing,
		},
		faq: {
			...copy.faq,
			items:
				faqItems.length > 0
					? faqItems
					: [
							{
								question: "Is the resume builder still free?",
								answer:
									"Yes. The builder, live scoring, and core match suggestions stay free. Upgrade only if you need more AI, letters, or contacts.",
							},
							{
								question: "Do you invent experience for me?",
								answer:
									"No. We rewrite and reframe the work you’ve already done so it matches the posting’s language—without inventing jobs you didn’t have.",
							},
						],
		},
		authCta: {
			...copy.authCta,
			badge: "Free forever · Jobs & resume tools",
			title: "Your free resume workspace is waiting.",
			description:
				"Build free, score against job postings, and use AI to tailor before you apply. Cover letters and hiring contacts in one place.",
		},
		finalCta: {
			...copy.finalCta,
			title: "Ready to find roles and apply with a stronger resume?",
			description:
				"Join ApplyJet free. Browse jobs, build your resume, score it live, and tailor with AI—no credit card required.",
		},
		footer: {
			...copy.footer,
			tagline:
				"Free resume builder and job tools—live scoring, AI tailoring, cover letters, and hiring contacts.",
			copyrightNote: "Resume and job-application help only.",
		},
		meta: {
			title: "ApplyJet — Find Jobs, Tailor Your Resume, Apply Faster",
			description:
				"Browse jobs, build an ATS-friendly resume, score it against each posting, and tailor with AI before you apply.",
		},
	}
}
