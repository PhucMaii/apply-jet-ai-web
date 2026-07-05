import { ROUTES } from "@/lib/constants"

/** Single source of truth for marketing / landing page copy. */
export const LANDING_COPY = {
	hero: {
		title: "Your resume, written for this job.",
		description:
			"Upload once. Paste the posting. Walk away with a tailored resume and cover letter—built for that exact role.",
		primaryCta: "Start tailoring for free",
	},
	trustStrip: [
		"Works entirely in your browser—no extension required",
		"Resume upload fills your profile automatically",
		"Tailored resume + cover letter for every job",
		"Find HR contacts for each application",
	],
	howItWorks: {
		eyebrow: "How it works",
		title: "Four steps from sign-up to application-ready.",
		description:
			"Everything happens on this site. Upload once, paste a job description, and let ApplyJet handle the heavy lifting.",
		steps: [
			{
				title: "Create your account",
				body: "Sign up in seconds with email or Google. Your workspace is ready immediately—nothing to install.",
			},
			{
				title: "Upload your resume",
				body: "Drop in your PDF or DOCX. We read it and pre-fill your profile—contact info, experience, skills, and education.",
			},
			{
				title: "Add a job application",
				body: "Paste the job title, company, and full job description. That posting becomes the source for everything we generate.",
			},
			{
				title: "Generate & reach out",
				body: "Get a tailored resume, a role-specific cover letter, and suggested HR contacts—built from your profile and that job.",
			},
		],
	},
	experienceBullets: {
		sectionId: "why-wording",
		eyebrow: "Why wording matters",
		title: "Recruiters skim for 6 seconds. Your bullets decide if they keep reading.",
		description:
			"Most people list what they did. Strong applicants show how they matched the role—with the same keywords, metrics, and impact the job description asks for.",
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
				subtitle: "ApplyJet generated",
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
			"ApplyJet reads your resume and the job description, then rewrites your experience bullets for each application—your real work, phrased the way this role asks for it.",
	},
	features: {
		eyebrow: "What you get",
		title: "One workspace for every job you apply to.",
		description:
			"Upload your resume once. For each application, paste the job description and generate the documents and contacts you need.",
		items: [
			{
				title: "Resume upload → instant profile",
				body: "Upload your resume and we extract your details into your profile—so you never retype work history from scratch.",
				className: "md:col-span-2",
			},
			{
				title: "Tailored resume per job",
				body: "Each application gets its own resume version—keywords, scope, and proof points aligned to that job description.",
				className: "md:col-span-2",
			},
			{
				title: "Cover letters that cite the role",
				body: "Generate a letter grounded in this posting and your matched experience—not a one-size-fits-all opener.",
				className: "",
			},
			{
				title: "HR contact finder",
				body: "Discover recruiters and hiring contacts at the company so you know who to reach out to after you apply.",
				className: "",
			},
			{
				title: "Match score before you generate",
				body: "See skill overlap and gaps against the job description so you know what to emphasize in your materials.",
				className: "md:col-span-2",
			},
			{
				title: "Everything saved to your account",
				body: "Applications, generated docs, and contact lists stay in one place—pick up any role where you left off.",
				className: "md:col-span-2",
			},
		],
	},
	why: {
		eyebrow: "Why ApplyJet",
		title: "Stop sending the same resume to every job.",
		without: {
			label: "Manual applications",
			title: "Generic docs, slow setup, no contacts",
			items: [
				"Retype your work history for every new platform",
				"One resume blasted at dozens of different roles",
				"Cover letters copied from a template with a new company name",
				"No idea who to follow up with after you hit submit",
			],
		},
		with: {
			title: "Upload once, tailor every application",
			items: [
				"Resume upload fills your profile automatically",
				"Each job gets its own resume and cover letter",
				"Job description drives every generation—not guesswork",
				"HR contacts surfaced for every application you create",
			],
		},
	},
	pricing: {
		eyebrow: "Pricing",
		title: "Start free. Upgrade when you're applying seriously.",
		description:
			"Free lets you try the full workflow. Pro removes limits on generations and HR contact search.",
		plans: {
			free: {
				name: "Free",
				price: "$0",
				desc: "Try the workflow with lighter weekly limits.",
				features: [
					"Resume upload and profile pre-fill",
					"10 resume generations",
					"10 cover letter generations",
					"10 HR contact searches",
					"All docs saved to your account",
				],
				cta: "Create free account",
			},
			jobHuntPack: {
				name: "Job Hunt Pack",
				price: "$3.99",
				desc: "A one-time pack to try ApplyJet without committing to a subscription.",
				features: [
					"50 resume generations",
					"50 cover letter generations",
					"50 HR contact searches",
					"All docs saved to your account",
				],
				cta: "Buy Job Hunt Pack",
				badge: 'Most Popular',
				highlight: true,
			},
			pro: {
				name: "Pro",
				price: "$9.99",
				period: "/month",
				desc: "For active job seekers applying every week.",
				features: [
					"Unlimited tailored resume generation",
					"Unlimited cover letter generation",
					"Unlimited HR contact search",
					"Priority updates as we ship new features",
				],
				cta: "Go Pro",
				highlight: true,
				badge: 'Best Value',
			},
		},
	},
	authCta: {
		badge: "Free account · works in your browser",
		title: "Your profile, applications, and generated docs—one place.",
		description:
			"Upload your resume once. Every application you create keeps its tailored resume, cover letter, and contacts tied to your account.",
		primaryCta: "Create account",
		secondaryCta: "I already have an account",
	},
	finalCta: {
		title: "Ready to apply smarter?",
		description:
			"Create your account, upload your resume, and generate your first tailored application in minutes—all on this site.",
		primaryCta: "Create free account",
		secondaryCta: "Log in",
	},
	footer: {
		tagline:
			"Upload your resume, paste the job description, and generate tailored resumes, cover letters, and HR contacts—right in your browser.",
		copyrightNote: "Built for job seekers who want less busywork and better applications.",
		productLinks: {
			features: { label: "Features", to: `${ROUTES.home}#features` },
			wording: { label: "Why wording matters", to: `${ROUTES.home}#why-wording` },
		},
	},
	meta: {
		title: "ApplyJet AI — Tailored job applications in your browser",
		description:
			"Create an account, upload your resume, and paste any job description. ApplyJet pre-fills your profile and generates tailored resumes, cover letters, and HR contacts.",
	},
} as const

export type ExperienceBulletTierKey = "bad" | "good" | "excellent"
