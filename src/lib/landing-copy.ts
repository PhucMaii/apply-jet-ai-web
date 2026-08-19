import { LANDING_SECTION_ID } from "@/lib/landing/landing-section"
import type { ExperienceBulletTierKey } from "@/lib/landing/landing-section"

export type { ExperienceBulletTierKey } from "@/lib/landing/landing-section"

/** Primary conversion CTA — one label everywhere on the marketing site. */
export const LANDING_PRIMARY_CTA = "Build your resume free" as const

/** Returning-user link copy for secondary auth moments. */
export const LANDING_LOGIN_LINK = "Already have an account? Log in" as const

/** Shared Tailwind classes for the dominant landing primary button. */
export const LANDING_PRIMARY_CTA_BUTTON_CLASS =
	"gap-2 bg-landing-primary text-white hover:bg-landing-primary-hover hover:scale-[1.02] hover:shadow-none active:scale-[0.98]"

/** Reassurance copy shown under free-entry CTAs. */
export const LANDING_NO_CREDIT_CARD_NOTE =
	"Free builder · PGWP tracker included · No credit card" as const

/**
 * Marketing copy for the homepage and shared landing variants.
 * Audience: international students and immigrants in Canada on a PGWP.
 */
export const LANDING_COPY = {
	hero: {
		canadaMadeLabel: "Built by Canadians, for Canadians",
		title: "Your PGWP has a clock. Your resume shouldn’t waste it.",
		description:
			"If you’re an international student or recent grad in Canada, you already know the pressure: a PGWP with a real expiry date, and job posts that still say “Canadian experience required.” ApplyJet is a free resume builder that helps you reframe the work you’ve already done—so Canadian employers and ATS systems can actually see it. This is job-application help, not immigration advice.",
		primaryCta: LANDING_PRIMARY_CTA as string,
		noCreditCardNote: LANDING_NO_CREDIT_CARD_NOTE as string,
		socialProof: {
			rating: 4.9,
			label: "from early users",
			tagline:
				"Track your PGWP window. Score your resume against Canadian job postings. Improve before you apply.",
		},
		video: {
			youtubeId: "7QBcWjdO8iA",
			eyebrow: "Product walkthrough",
			title: "See how ApplyJet works",
			description:
				"A short tour of the PGWP tracker, free resume builder, live job-match scoring, and AI tailoring.",
			playLabel: "Play product walkthrough video",
			caption: "Watch the walkthrough — then build your resume free",
		},
	},
	tryItNow: {
		sectionId: "try-it-now",
		eyebrow: "Try it now",
		title: "Add your resume. Paste the job. See what changes.",
		description:
			"Get a feel for ApplyJet before you sign up—upload or paste your resume, then add the posting you're targeting.",
		resume: {
			label: "Your resume",
			modes: {
				upload: "Upload file",
				paste: "Paste text",
			},
			dropzoneDefault: "Drop your resume here or click to browse",
			dropzoneDragHover: "Release to upload your resume",
			acceptedTypes: "PDF or DOCX",
			removeFile: "Remove file",
			replaceFile: "Replace",
			paste: {
				label: "Resume text",
				placeholder: "Paste your resume text here…",
				charCountLabel: "{count} characters",
				clear: "Clear text",
			},
		},
		jobDescription: {
			label: "Job description",
			placeholder: "Paste the job description here…",
			charCountLabel: "{count} characters",
		},
		cta: "Tailor My Resume",
		loading: "Tailoring your resume…",
		results: {
			lockMessage: "Sign up to keep building and tailoring resumes",
			signupCta: LANDING_PRIMARY_CTA,
			downloadTitle: "Your tailored resume is ready",
			downloadDescription:
				"Download the PDF below. Create a free account to save it and keep building.",
			downloadCta: "Download resume",
			downloadLastCta: "Download tailored resume",
			downloadLoading: "Downloading…",
			downloadFilename: "tailored-resume.pdf",
			scoreHeading: "Match score vs job description",
			scoreBefore: "Before",
			scoreAfter: "After",
		},
	},
	trustStrip: [
		"PGWP countdown on your dashboard",
		"Written for Canadian employers and ATS",
		"Free live score vs any job posting",
		"Resume help only — not immigration advice",
	],
	marketingNav: [
		{ hash: LANDING_SECTION_ID.howItWorks, label: "How it works" },
		{ hash: LANDING_SECTION_ID.pgwpTracker, label: "PGWP tracker" },
		{ hash: LANDING_SECTION_ID.whyWording, label: "AI tailoring" },
		{ hash: LANDING_SECTION_ID.features, label: "What you get" },
		{ hash: LANDING_SECTION_ID.pricing, label: "Pricing" },
		{ hash: LANDING_SECTION_ID.faq, label: "FAQ" },
	],
	pgwpFeature: {
		sectionId: LANDING_SECTION_ID.pgwpTracker,
		eyebrow: "PGWP tracker",
		title: "See your days left every time you sit down to apply.",
		description:
			"Add your PGWP expiry date once. We keep it visible on your applications page—and as a small reminder in the header—so the clock stays honest without taking over your day. The beaver beside your countdown picks up speed as the window gets shorter. It’s a planning aid, not a status check with IRCC.",
		preview: {
			daysValue: "142",
			daysLabel: "days left on your PGWP",
			expiryLabel: "Expires August 18, 2027",
			message: "Your window is open — keep building momentum.",
			mascotPhase: "focus" as const,
		},
		mascotLegendTitle: "Your beaver keeps pace with your window",
		mascotLegend: [
			{
				key: "healthy" as const,
				label: "180+ days left",
				caption: "Calm and ready",
			},
			{
				key: "focus" as const,
				label: "90–180 days left",
				caption: "Time to pick up speed",
			},
			{
				key: "critical" as const,
				label: "Last 30 days",
				caption: "Sprint for interviews",
			},
		],
		disclaimer:
			"Your expiry date is stored for you only. Verify dates with IRCC. ApplyJet does not provide immigration or legal advice.",
	},
	howItWorks: {
		eyebrow: "How it works",
		title: "From PGWP pressure to a job-ready resume—in four steps.",
		description:
			"Start free. Add your expiry date, build a resume Canadian employers can scan, then tailor it to each posting before you apply.",
		steps: [
			{
				title: "Create your free account",
				body: "Sign up with email or Google. Your resume workspace is ready right away—nothing to install.",
			},
			{
				title: "Add your PGWP expiry date",
				body: "Enter it once. You’ll see days remaining while you apply—so the window stays visible, not something you check in a panic.",
			},
			{
				title: "Build and score against the posting",
				body: "Upload a PDF or start from scratch. Paste a Canadian job description, see your match score live, and get free suggestions on what to strengthen.",
			},
			{
				title: "Rewrite for this employer, then reach out",
				body: "Try AI that reframes your real experience in the posting’s language, generate a cover letter, and find hiring contacts when you’re ready to apply.",
			},
		],
	},
	experienceBullets: {
		sectionId: LANDING_SECTION_ID.whyWording,
		eyebrow: "Why AI tailoring helps",
		title:
			"“No Canadian experience” is a real filter. Your bullets are how you answer it.",
		description:
			"That line isn’t a verdict on your skills. It’s often an ATS and recruiter shortcut. Strong applications don’t invent a Canadian past—they translate international education and work into the keywords, metrics, and impact a Canadian posting is actually scanning for.",
		jobContext: {
			label: "The job you're applying to",
			role: "Full Stack Developer",
			company: "Northshore Pay · Fintech · Toronto",
			snippet:
				"Looking for someone with React, Node.js, and PostgreSQL experience. You’ll ship features with product and design, keep production reliable, and communicate clearly with a Canadian team.",
			keywords: [
				"React",
				"Node.js",
				"PostgreSQL",
				"cross-functional",
				"production",
			],
		},
		principles: [
			{
				title: "Use the posting’s words",
				body: "If a Canadian employer asks for React and production reliability, say that—not “various technologies overseas.”",
			},
			{
				title: "Keep the proof, change the framing",
				body: "Your degree, internships, and jobs are real. Rewrite them so a Toronto ATS can map them to this role.",
			},
			{
				title: "Lead with impact",
				body: "Start with what changed because of you. That’s how you get past a six-second skim.",
			},
		],
		tiers: [
			{
				key: "bad" as ExperienceBulletTierKey,
				label: "Filtered out",
				subtitle: "Hides international experience",
				verdict:
					"Vague, no Canadian posting keywords. Easy for an ATS to skip as “not a local fit.”",
				bullets: [
					"Worked on web development projects using various technologies",
					"Helped the team with backend tasks and fixed bugs when needed",
					"Participated in meetings and communicated with other departments",
				],
				takeaways: [
					"No React, Node.js, or PostgreSQL mentioned",
					"International work is invisible, not translated",
					"Zero metrics or outcomes",
				],
			},
			{
				key: "good" as ExperienceBulletTierKey,
				label: "Clear",
				subtitle: "Honest — but not written for Canada",
				verdict:
					"Readable and true, but not mapped to this Toronto posting’s language.",
				bullets: [
					"Built React and Node.js features for the customer dashboard",
					"Improved API response time by optimizing slow database queries",
					"Collaborated with designers and product managers on new features",
				],
				takeaways: [
					"Mentions some relevant stack",
					"Still doesn’t echo production reliability or team language",
					"Could belong to any country, any company",
				],
			},
			{
				key: "excellent" as ExperienceBulletTierKey,
				label: "Tailored",
				subtitle: "Same experience — Canadian posting language",
				verdict:
					"Your real work, rewritten so a Canadian employer and ATS can recognize the fit.",
				bullets: [
					"Shipped React + Node.js dashboard features for 12K daily users; cut API latency 40% via query caching and connection pooling",
					"Worked cross-functionally with product and design—delivered 6 major features ahead of quarterly roadmap",
					"Hardened REST endpoints for production reliability; reduced incidents 30% quarter-over-quarter",
				],
				takeaways: [
					"Keywords from the Canadian posting, used honestly",
					"Metrics on users, latency, delivery, and reliability",
					"International background stays true—just readable here",
				],
				isGenerated: true,
			},
		],
		footerNote:
			"ApplyJet reads your resume and the job description, then rewrites your experience bullets for that application. We don’t invent Canadian jobs you didn’t have. We help Canadian ATS systems and recruiters understand the ones you did.",
	},
	builtForCanada: {
		sectionId: LANDING_SECTION_ID.builtForCanada,
		eyebrow: "Built by Canadians, for Canadians",
		title: "Made for people job hunting here—not a US playbook with the names swapped.",
		description:
			"We’re a Canadian team. These are plain facts about what the product does—no over-claiming, no immigration promises.",
		items: [
			{
				title: "Canadian resume conventions",
				body: "Build a clean, ATS-friendly resume in the format Canadian employers actually scan—not a US-only template with different visa jargon.",
			},
			{
				title: "Language Canadian ATS systems recognize",
				body: "Tailor bullets to the posting’s keywords so your international education and work can show up in the same language the job uses.",
			},
			{
				title: "A PGWP window you can see",
				body: "The countdown lives in your dashboard because time is part of this search. It does not replace IRCC, a lawyer, or an immigration consultant.",
			},
			{
				title: "Job applications only",
				body: "We help you write, score, and send stronger applications. We do not file Express Entry, advise on PGWP eligibility, or offer legal advice.",
			},
		],
	},
	features: {
		eyebrow: "What you get",
		title: "A free resume builder—plus a PGWP tracker, live scoring, and suggestions.",
		description:
			"Build and edit at no cost. Keep your PGWP date in view. Score against Canadian job descriptions, get free suggestions, try AI when you want a rewrite, then generate cover letters and find hiring contacts.",
		items: [
			{
				title: "PGWP tracker in your dashboard",
				body: "Save your expiry date once. See days remaining on Applications and a compact reminder in the header while you apply.",
				className: "md:col-span-2",
				icon: "calendar" as const,
			},
			{
				title: "Resume builder—free forever",
				body: "Create, edit, and download without a subscription. Your core builder stays free—no credit card, no trial cliff.",
				className: "md:col-span-2",
				icon: "fileText" as const,
			},
			{
				title: "Free live score vs the job",
				body: "Paste a Canadian job description and see your match score update live—keywords, gaps, and fit—always free in the core app.",
				className: "md:col-span-2",
				icon: "gauge" as const,
			},
			{
				title: "AI that fits this posting",
				body: "Try AI that rewrites your real experience to match the role’s keywords and priorities—without inventing a Canadian work history.",
				className: "",
				icon: "sparkles" as const,
			},
			{
				title: "Cover letter generator",
				body: "Generate a letter grounded in this posting and your matched experience—not a one-size-fits-all opener.",
				className: "",
				icon: "list" as const,
			},
			{
				title: "Hiring contact finder",
				body: "Discover recruiters and hiring contacts at the company so you know who to reach out to after you apply.",
				className: "md:col-span-2",
				icon: "users" as const,
			},
		],
	},
	why: {
		eyebrow: "Why ApplyJet",
		title: "The clock is real. So is the bias. Your resume is the part you can change today.",
		without: {
			label: "The usual grind",
			title: "Time pressure, generic docs, “no Canadian experience”",
			items: [
				"A PGWP expiry date you only remember when you’re already anxious",
				"One generic resume sent to every Canadian posting",
				"International experience buried in vague bullets ATS systems skip",
				"Paywalls on scoring, downloads, or basic edits",
			],
		},
		with: {
			title: "A window you can see—and applications written for here",
			items: [
				"PGWP tracker on the page you use every day",
				"Free live scoring against each job description",
				"Bullets rewritten in language Canadian employers and ATS recognize",
				"Builder free forever—upgrade only if you need more AI, letters, or contacts",
			],
		},
	},
	testimonials: {
		eyebrow: "From people in the same boat",
		title: "Stories from PGWP holders—coming as we collect them",
		summaryRating: 0,
		summaryLabel: "We’re collecting real quotes from international grads in Canada.",
		showSummaryRating: false,
		items: [
			{
				quote:
					"Placeholder for a real quote from a PGWP holder about using ApplyJet while job hunting in Canada.",
				name: "Quote 1 — coming soon",
				role: "International grad · PGWP · Canada",
				rating: 5,
				isPlaceholder: true,
			},
			{
				quote:
					"Placeholder for a real quote about rewriting international experience for Canadian employers.",
				name: "Quote 2 — coming soon",
				role: "International grad · PGWP · Canada",
				rating: 5,
				isPlaceholder: true,
			},
			{
				quote:
					"Placeholder for a real quote about keeping the PGWP window visible while applying.",
				name: "Quote 3 — coming soon",
				role: "International grad · PGWP · Canada",
				rating: 5,
				isPlaceholder: true,
			},
		],
	},
	privacyTrust: {
		statement: "Your resume stays private. We never sell your data.",
	},
	pricing: {
		eyebrow: "Pricing",
		title: "Free forever to build. Flexible options when you need more.",
		description:
			"The resume builder, PGWP tracker, live job-match scoring, and core suggestions stay free. Try AI at no cost, then pick monthly Pro or one-time credit packs when you need more.",
		currencyNote:
			"Prices are charged in USD. CAD is shown for reference for people living in Canada.",
		monthlyLabel: "Monthly",
		oneTimeLabel: "One-time packs",
		plans: {
			starter: {
				name: "Starter",
				price: "US$0",
				priceCad: "CA$0",
				period: "/month",
				desc: "Free forever builder—plus PGWP tracker, free live scoring, match suggestions, and AI tries to start.",
				features: [
					"PGWP tracker",
					"Resume builder—free forever",
					"Free live score vs job description",
					"Free core match suggestions",
					"10 free AI tries to start",
					"5 cover letters",
					"5 resume downloads",
				],
				cta: LANDING_PRIMARY_CTA as string,
				badge: "Free forever",
				ctaSubtext: LANDING_NO_CREDIT_CARD_NOTE as string,
			},
			pro: {
				name: "Pro",
				price: "US$19.99",
				priceCad: "CA$27.99",
				period: "/month",
				desc: "Unlimited AI, cover letters, and hiring contacts for an active search.",
				features: [
					"Unlimited AI resume tailoring",
					"Unlimited cover letters",
					"Unlimited resume downloads",
					"Hiring contacts finding",
					"Everything in Starter",
				],
				cta: "Go Pro",
				highlight: true,
				badge: "Best Value",
			},
			internPack: {
				name: "Intern Pack",
				price: "US$5.99",
				priceCad: "CA$8.49",
				period: "one-time",
				desc: "A small credit boost—no subscription required.",
				features: [
					"10 AI generations",
					"10 cover letters",
					"10 resume downloads",
				],
				cta: "Buy Intern Pack",
			},
			juniorPack: {
				name: "Junior Pack",
				price: "US$9.99",
				priceCad: "CA$13.99",
				period: "one-time",
				desc: "More AI generations plus hiring contact searches.",
				features: [
					"50 AI generations",
					"50 cover letters",
					"50 resume downloads",
					"25 hiring contacts",
				],
				cta: "Buy Junior Pack",
				badge: "Most Popular",
				highlight: true,
			},
			advancedPack: {
				name: "Advanced Pack",
				price: "US$14.99",
				priceCad: "CA$20.99",
				period: "one-time",
				desc: "The largest one-time pack for a busy application season.",
				features: [
					"100 AI generations",
					"100 cover letters",
					"100 resume downloads",
					"50 hiring contacts",
				],
				cta: "Buy Advanced Pack",
			},
		},
	},
	faq: {
		sectionId: LANDING_SECTION_ID.faq,
		eyebrow: "FAQ",
		title: "Straight answers—especially the immigration ones.",
		items: [
			{
				question: "Does this help with visa or PR applications?",
				answer:
					"No. ApplyJet is a resume and job-application tool. We do not prepare Express Entry profiles, advise on PGWP eligibility, or file anything with IRCC. If you need immigration help, talk to IRCC or a licensed professional.",
			},
			{
				question: "Is the PGWP tracker legal or immigration advice?",
				answer:
					"No. It’s a personal countdown based on the expiry date you enter. Always confirm dates and status with IRCC. We don’t track your legal status.",
			},
			{
				question: "Will this get me a job before my PGWP expires?",
				answer:
					"We can’t promise that. What we can do is help you apply with a clearer resume, a live match score, and language Canadian employers and ATS systems are more likely to recognize—while keeping your remaining time in view.",
			},
			{
				question: "I keep hearing “no Canadian experience.” Does this fix that?",
				answer:
					"It doesn’t invent Canadian jobs you didn’t have. It helps you describe real international education and work in the words a Canadian posting uses, so you’re less likely to be filtered out for sounding “generic” or “from elsewhere.”",
			},
			{
				question: "Is the resume builder still free?",
				answer:
					"Yes. The builder, PGWP tracker, live scoring, and core match suggestions stay free. You can try AI, then upgrade to Pro or a one-time pack only if you need more.",
			},
		],
	},
	authCta: {
		badge: "Free forever · PGWP tracker included",
		title: "Your window is real. Your resume can start working today.",
		description:
			"Build free, keep your PGWP date in view, score against Canadian job descriptions, and rewrite your real experience so employers here can read it. Cover letters and hiring contacts stay in one place.",
		primaryCta: LANDING_PRIMARY_CTA as string,
		loginLink: LANDING_LOGIN_LINK as string,
	},
	finalCta: {
		title: "Ready to stop wasting days on a resume that doesn’t travel?",
		description:
			"Join ApplyJet free. Track your PGWP, build forever at no cost, score live against the posting, and upgrade only when you need more. Job applications only—not immigration advice.",
		primaryCta: LANDING_PRIMARY_CTA as string,
		loginLink: LANDING_LOGIN_LINK as string,
	},
	footer: {
		tagline:
			"Free resume builder for international grads and PGWP holders in Canada—live scoring, AI tailoring, and a PGWP tracker. Not immigration advice.",
		copyrightNote:
			"Built by Canadians, for Canadians. Resume help only.",
		productLinks: {
			features: {
				label: "Features",
				hash: LANDING_SECTION_ID.features,
			},
			wording: {
				label: "Why AI tailoring",
				hash: LANDING_SECTION_ID.whyWording,
			},
			pgwp: {
				label: "PGWP tracker",
				hash: LANDING_SECTION_ID.pgwpTracker,
			},
			faq: {
				label: "FAQ",
				hash: LANDING_SECTION_ID.faq,
			},
		},
	},
	meta: {
		title:
			"ApplyJet — Free Resume Builder for PGWP Holders in Canada",
		description:
			"Track your PGWP expiry, build your resume free, and tailor it for Canadian employers and ATS. Not immigration advice—job application help only.",
	},
}

export type LandingCopy = typeof LANDING_COPY

