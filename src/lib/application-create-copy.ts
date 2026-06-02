export const APPLICATION_CREATE_COPY = {
	pageTitle: "New application",
	pageSubtitle:
		"Add the role details once—use them to generate resumes, cover letters, and find HR contacts.",
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
		"Paste the full job description here. The more detail you add, the better your tailored documents will be.",
	jobDescriptionHint:
		"Used to tailor resumes, cover letters, and HR outreach for this role.",
	submitLabel: "Create application",
	submittingLabel: "Creating…",
	requiredHint: "Required fields",
} as const

export const APPLICATION_CREATE_VALIDATION = {
	companyNameRequired: "Company name is required.",
	jobTitleRequired: "Job title is required.",
	jobDescriptionRequired: "Job description is required.",
} as const
