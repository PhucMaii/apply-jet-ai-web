import { ROUTES } from "@/lib/constants"

/** Primary conversion CTA — one label everywhere on the marketing site. */
export const LANDING_PRIMARY_CTA = "Build your resume free" as const

/** Returning-user link copy for secondary auth moments. */
export const LANDING_LOGIN_LINK = "Already have an account? Log in" as const

/** Shared Tailwind classes for the dominant landing primary button. */
export const LANDING_PRIMARY_CTA_BUTTON_CLASS =
	"gap-2 bg-landing-primary text-white hover:bg-landing-primary-hover hover:scale-[1.02] hover:shadow-none active:scale-[0.98]"

/** Reassurance copy shown under free-entry CTAs. */
export const LANDING_NO_CREDIT_CARD_NOTE =
	"Free builder · Free live scoring · No credit card" as const

/** Single source of truth for marketing / landing page copy. */
export const LANDING_COPY = {
	hero: {
		title: "Free resume builder. AI that fits every job.",
		description:
			"Welcome to ApplyJet—the resume builder that's free forever. Build a polished resume, score it live against any job description, and get free suggestions to match the role better. Try AI that tailors your content—plus cover letters and HR contacts when you're ready to apply.",
		primaryCta: LANDING_PRIMARY_CTA,
		noCreditCardNote: LANDING_NO_CREDIT_CARD_NOTE,
		socialProof: {
			rating: 4.9,
			label: "from early users",
			tagline:
				"Free live scoring and match suggestions—built so you can improve before you apply",
		},
		video: {
			youtubeId: "7QBcWjdO8iA",
			eyebrow: "Product walkthrough",
			title: "See how ApplyJet works",
			description:
				"A short tour of the free resume builder, live job-match scoring, and AI tailoring.",
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
		"Resume builder—free forever",
		"Free live score vs any job description",
		"Free match suggestions to improve your resume",
		"Free AI tries, cover letters & HR contacts",
	],
	howItWorks: {
		eyebrow: "How it works",
		title: "From blank page to job-ready—in four simple steps.",
		description:
			"Start with a free resume builder. Paste a job description to score your resume live, get free suggestions to match better, and try AI when you want a rewrite.",
		steps: [
			{
				title: "Create your free account",
				body: "Sign up in seconds with email or Google. Your resume workspace is ready right away—nothing to install.",
			},
			{
				title: "Build your resume",
				body: "Upload a PDF or DOCX, or start from scratch. Edit sections, polish your story, and save a resume you'll actually reuse.",
			},
			{
				title: "Score live & improve for free",
				body: "Paste the job description. See your match score update live, with free core suggestions on what to strengthen so you fit the role better.",
			},
			{
				title: "AI, cover letter & reach out",
				body: "Try AI that rewrites experience for the posting, generate a cover letter, and discover HR contacts—when you're ready to apply.",
			},
		],
	},
	experienceBullets: {
		sectionId: "why-wording",
		eyebrow: "Why AI tailoring helps",
		title: "Recruiters skim for 6 seconds. Your bullets decide if they keep reading.",
		description:
			"Most resumes list what you did. Strong applications show how you match the role—with the same keywords, metrics, and impact the job description asks for.",
		jobContext: {
			label: "The job you're applying to",
			role: "Senior Full Stack Developer",
			company: "Meridian Pay · Fintech",
			snippet:
				"Looking for someone with React, Node.js, and PostgreSQL experience. You'll optimize API performance, ship features cross-functionally, and improve reliability in production.",
			keywords: ["React", "Node.js", "PostgreSQL", "API performance", "cross-functional"],
		},
		principles: [
			{
				title: "Use the job's words",
				body: "If the posting says React and API performance, your bullets should too—not \"various technologies.\"",
			},
			{
				title: "Show numbers",
				body: "Latency cut 40%, 12K users, 6 features shipped—proof beats vague claims.",
			},
			{
				title: "Lead with impact",
				body: "Start with what changed because of you, not just what you were assigned.",
			},
		],
		tiers: [
			{
				key: "bad",
				label: "Bad",
				subtitle: "Generic — easy to ignore",
				verdict: "Could be anyone. No keywords from the job. Filtered out fast.",
				bullets: [
					"Worked on web development projects using various technologies",
					"Helped the team with backend tasks and fixed bugs when needed",
					"Participated in meetings and communicated with other departments",
				],
				takeaways: [
					"No React, Node.js, or PostgreSQL mentioned",
					"Weak verbs: \"worked on,\" \"helped,\" \"participated\"",
					"Zero metrics or outcomes",
				],
			},
			{
				key: "good",
				label: "Good",
				subtitle: "Clear — but not tailored",
				verdict: "Readable and honest, but not written for this specific posting.",
				bullets: [
					"Built React and Node.js features for the customer dashboard",
					"Improved API response time by optimizing slow database queries",
					"Collaborated with designers and product managers on new features",
				],
				takeaways: [
					"Mentions some relevant stack",
					"One improvement, but no scale",
					"Doesn't reference fintech or production reliability",
				],
			},
			{
				key: "excellent",
				label: "Excellent",
				subtitle: "ApplyJet AI tailored",
				verdict: "Same real experience—rewritten to mirror the job and prove impact.",
				bullets: [
					"Architected React + Node.js dashboard for 12K daily users; cut API latency 40% via query caching and connection pooling",
					"Led cross-functional delivery with product and design—shipped 6 major features ahead of quarterly roadmap",
					"Refactored legacy REST endpoints for fintech compliance; reduced production incidents 30% quarter-over-quarter",
				],
				takeaways: [
					"Every keyword from the job description woven in",
					"Metrics on users, latency, features, and reliability",
					"Strong verbs: architected, led, refactored",
				],
				isGenerated: true,
			},
		],
		footerNote:
			"ApplyJet reads your resume and the job description, then rewrites your experience bullets for each application—your real work, phrased the way this role asks for it. Try AI free when you start.",
	},
	features: {
		eyebrow: "What you get",
		title: "A free resume builder—plus live scoring and suggestions.",
		description:
			"Build and edit your resume at no cost. Score it live against any job description, get free suggestions to match better, try AI when you want a rewrite, then generate cover letters and find HR contacts.",
		items: [
			{
				title: "Resume builder—free forever",
				body: "Create, edit, and download your resume without a subscription. Your core builder stays free—no credit card, no trial cliff.",
				className: "md:col-span-2",
			},
			{
				title: "Free live score vs the job",
				body: "Paste a job description and see your resume match score update live—keywords, gaps, and fit—always free in the core app.",
				className: "md:col-span-2",
			},
			{
				title: "Free match suggestions",
				body: "Get clear, actionable suggestions in the app so you know what to strengthen to match the job description better—no paywall on the basics.",
				className: "md:col-span-2",
			},
			{
				title: "AI that fits the job description",
				body: "Try AI that rewrites your experience to match the role's keywords, scope, and priorities.",
				className: "",
			},
			{
				title: "Cover letter generator",
				body: "Generate a letter grounded in this posting and your matched experience—not a one-size-fits-all opener.",
				className: "",
			},
			{
				title: "HR contact finder",
				body: "Discover recruiters and hiring contacts at the company so you know who to reach out to after you apply.",
				className: "md:col-span-2",
			},
		],
	},
	why: {
		eyebrow: "Why ApplyJet",
		title: "A better resume—without paying just to begin.",
		without: {
			label: "Typical tools",
			title: "Paywalls, generic docs, no outreach help",
			items: [
				"Resume builders that lock edits or downloads behind a paywall",
				"One generic resume sent to every different role",
				"Match scores and tips locked behind a subscription",
				"No idea who to follow up with after you hit submit",
			],
		},
		with: {
			title: "Free builder, free scoring, flexible plans",
			items: [
				"Resume builder free forever—build and edit without pressure",
				"Free live scoring against every job description",
				"Free core suggestions to match the role better",
				"AI tries, cover letters, HR contacts—plus Pro or one-time packs when you need more",
			],
		},
	},
	testimonials: {
		eyebrow: "Early feedback",
		title: "What job seekers are saying",
		summaryRating: 4.9,
		summaryLabel: "average from early users",
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
					"Pasting the job description and seeing my bullets rewritten with the right keywords felt like a real advantage.",
				name: "James K.",
				role: "Software engineer",
				rating: 5,
			},
			{
				quote:
					"Cover letters plus finding who to email—that's what I was missing with every other resume tool.",
				name: "Priya R.",
				role: "Job seeker",
				rating: 4.5,
			},
		],
		// TODO: replace with real testimonials and attribution once collected
	},
	privacyTrust: {
		statement: "Your resume stays private. We never sell your data.",
	},
	pricing: {
		eyebrow: "Pricing",
		title: "Free forever to build. Flexible options when you need more.",
		description:
			"The resume builder, live job-match scoring, and core suggestions stay free. Try AI at no cost, then pick monthly Pro or one-time credit packs when you need more.",
		monthlyLabel: "Monthly",
		oneTimeLabel: "One-time packs",
		plans: {
			starter: {
				name: "Starter",
				price: "$0",
				period: "/month",
				desc: "Free forever builder—plus free live scoring, match suggestions, and AI tries to start.",
				features: [
					"Resume builder—free forever",
					"Free live score vs job description",
					"Free core match suggestions",
					"10 free AI tries to start",
					"5 cover letters",
					"5 resume downloads",
				],
				cta: LANDING_PRIMARY_CTA,
				badge: "Free forever",
				ctaSubtext: LANDING_NO_CREDIT_CARD_NOTE,
			},
			pro: {
				name: "Pro",
				price: "$19.99",
				period: "/month",
				desc: "Unlimited AI, cover letters, and HR contacts for an active search.",
				features: [
					"Unlimited AI resume tailoring",
					"Unlimited cover letters",
					"Unlimited resume downloads",
					"HR contacts finding",
					"Everything in Starter",
				],
				cta: "Go Pro",
				highlight: true,
				badge: "Best Value",
			},
			internPack: {
				name: "Intern Pack",
				price: "$5.99",
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
				price: "$9.99",
				period: "one-time",
				desc: "More AI generations plus HR contact searches.",
				features: [
					"50 AI generations",
					"50 cover letters",
					"50 resume downloads",
					"25 HR contacts",
				],
				cta: "Buy Junior Pack",
				badge: "Most Popular",
				highlight: true,
			},
			advancedPack: {
				name: "Advanced Pack",
				price: "$14.99",
				period: "one-time",
				desc: "The largest one-time pack for a busy application season.",
				features: [
					"100 AI generations",
					"100 cover letters",
					"100 resume downloads",
					"50 HR contacts",
				],
				cta: "Buy Advanced Pack",
			},
		},
	},
	authCta: {
		badge: "Free forever · live scoring included",
		title: "Welcome—your resume workspace is waiting.",
		description:
			"Build your resume free, score it live against any job description, get free match suggestions, and try AI when you want a rewrite—cover letters and HR contacts stay in one place.",
		primaryCta: LANDING_PRIMARY_CTA,
		loginLink: LANDING_LOGIN_LINK,
	},
	finalCta: {
		title: "Ready to build a resume that fits the job?",
		description:
			"Join ApplyJet free. Build forever at no cost, score your resume live against the job description, get free suggestions to match better, and upgrade only when you need more.",
		primaryCta: LANDING_PRIMARY_CTA,
		loginLink: LANDING_LOGIN_LINK,
	},
	footer: {
		tagline:
			"Free resume builder with live job-match scoring and free suggestions—plus AI tailoring, cover letters, and HR contacts.",
		copyrightNote: "Built for job seekers who want a better resume without the paywall.",
		productLinks: {
			features: { label: "Features", to: `${ROUTES.home}#features` },
			wording: { label: "Why AI tailoring", to: `${ROUTES.home}#why-wording` },
		},
	},
	meta: {
		title:
			"ApplyJet — Free AI Resume Builder | Live Score vs Job Description",
		description:
			"Build your resume free forever with ApplyJet. Score it live against any job description, get free match suggestions, try AI tailoring, generate cover letters, and find HR contacts.",
	},
} as const

export type ExperienceBulletTierKey = "bad" | "good" | "excellent"
