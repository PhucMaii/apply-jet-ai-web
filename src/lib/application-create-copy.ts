export const APPLICATION_CREATE_COPY = {
	pageTitle: "New application",
	pageSubtitle:
		"Paste the role details and we’ll create your application with an AI-tailored resume, same as Tailor with AI on the job board.",
	backLabel: "Back to applications",
	companyNameLabel: "Company name",
	companyNamePlaceholder: "e.g. Acme Corp",
	jobTitleLabel: "Job title",
	jobTitlePlaceholder: "e.g. Senior Software Engineer",
	jobUrlLabel: "Job posting URL",
	jobUrlPlaceholder: "https://…",
	jobUrlHint: "Optional. Link to the listing for quick reference.",
	jobDescriptionLabel: "Job description",
	jobDescriptionPlaceholder:
		"Paste the full job description here. The more detail you add, the better your tailored resume will be.",
	jobDescriptionHint:
		"Used to tailor your resume for this role, then cover letters and HR outreach.",
	submitLabel: "Create & tailor with AI",
	submittingLabel: "Tailoring…",
	requiredHint: "Required fields",
} as const

export const APPLICATION_CREATE_VALIDATION = {
	companyNameRequired: "Company name is required.",
	jobTitleRequired: "Job title is required.",
	jobDescriptionRequired: "Job description is required.",
} as const
