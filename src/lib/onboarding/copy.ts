import { ONBOARDING_STEP, type OnboardingStepId } from "@/lib/onboarding/types"

export const ONBOARDING_WELCOME_COPY = {
	eyebrow: "Welcome to ApplyJet",
	title: "Let's set up your profile first",
	description:
		"Upload your resume and we'll pre-fill your profile. Then you can create your first tailored application in minutes.",
	startTour: "Guide me step by step",
	skip: "I'll explore on my own",
} as const

export const ONBOARDING_STEP_COPY: Record<
	Exclude<OnboardingStepId, "welcome" | "completed">,
	{ title: string; description: string }
> = {
	[ONBOARDING_STEP.uploadResume]: {
		title: "Upload your resume",
		description:
			"Drop a PDF or Word file here. We use it to pre-fill your profile and generate tailored documents.",
	},
	[ONBOARDING_STEP.autofillProfile]: {
		title: "Auto-fill your profile",
		description:
			"Click this button to pull contact info, experience, skills, and education from your resume.",
	},
	[ONBOARDING_STEP.reviewContact]: {
		title: "Review contact details",
		description:
			"Double-check your name, email, phone, and address — we use these for job application autofill.",
	},
	[ONBOARDING_STEP.reviewWork]: {
		title: "Review work experience",
		description:
			"Make sure your roles, companies, and bullet points look correct.",
	},
	[ONBOARDING_STEP.reviewEducation]: {
		title: "Review education",
		description: "Confirm schools, degrees, and dates are accurate.",
	},
	[ONBOARDING_STEP.reviewProjects]: {
		title: "Review projects",
		description: "Add or edit personal or professional projects if needed.",
	},
	[ONBOARDING_STEP.reviewLinks]: {
		title: "Review links & extras",
		description:
			"Check LinkedIn, portfolio links, and any additional info.",
	},
	[ONBOARDING_STEP.reviewSkills]: {
		title: "Review skills",
		description: "Verify the skills we extracted match what you want to highlight.",
	},
	[ONBOARDING_STEP.reviewDisclosure]: {
		title: "Review disclosure",
		description:
			"Set work authorization and other standard application answers.",
	},
	[ONBOARDING_STEP.navigateApplications]: {
		title: "Open Applications",
		description:
			"You're ready to apply. Click Applications to create your first job entry.",
	},
	[ONBOARDING_STEP.createApplication]: {
		title: "Create your first application",
		description:
			"Paste the job title, company, and full job description — we'll tailor your resume to it.",
	},
	[ONBOARDING_STEP.generateResume]: {
		title: "Generate a tailored resume",
		description:
			"Hit generate to create a resume matched to this job description.",
	},
}

export const ONBOARDING_COMPLETE_COPY = {
	title: "You're all set!",
	description:
		"Your profile is ready and you've generated your first tailored resume. Explore cover letters and HR contacts anytime.",
} as const
