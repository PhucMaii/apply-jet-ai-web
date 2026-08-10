import { ONBOARDING_STEP, type OnboardingStepId } from "@/lib/onboarding/types"

export const ONBOARDING_WELCOME_COPY = {
	eyebrow: "Welcome to ApplyJet",
	title: "Let's set up your profile first",
	description:
		"Upload your resume and we'll pre-fill your profile. Then create your first application and explore the free resume builder.",
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
			"Drop a PDF or Word file here. We use it to pre-fill your profile for the resume builder.",
	},
	[ONBOARDING_STEP.autofillProfile]: {
		title: "Auto-fill your profile",
		description:
			"Click this button to pull contact info, experience, skills, and education from your resume.",
	},
	[ONBOARDING_STEP.reviewContact]: {
		title: "Review contact details",
		description:
			"Double-check your name, email, phone, and address — these appear on your resume and applications.",
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
			"Your profile is ready. Click Applications to add your first job and open the resume builder.",
	},
	[ONBOARDING_STEP.createApplication]: {
		title: "Create your first application",
		description:
			"Add the job title, company, and job description. We'll open the resume builder with your profile filled in.",
	},
	[ONBOARDING_STEP.resumeStudioEditor]: {
		title: "Edit content and style",
		description:
			"This left panel is your resume editor. Update section content, reorder blocks, and switch to Style to adjust how things look.",
	},
	[ONBOARDING_STEP.resumeStudioPreview]: {
		title: "Live print preview",
		description:
			"The middle panel shows how your resume will print. It starts with your profile information—edit on the left and watch it update here.",
	},
	[ONBOARDING_STEP.resumeStudioJobPanel]: {
		title: "Score, job details & suggestions",
		description:
			"On the right, score your resume against the job description, edit the posting, and review suggestions to improve your match.",
	},
}

export const ONBOARDING_COMPLETE_COPY = {
	title: "You're all set!",
	description:
		"Your profile is ready and you know the resume builder: edit on the left, preview in the middle, score and refine on the right. Try AI, cover letters, and HR contacts anytime.",
} as const
