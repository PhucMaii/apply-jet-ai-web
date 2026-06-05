export const APPLICATION_DELETE_COPY = {
	modalTitle: "Delete application",
	modalMessage: (jobTitle: string, companyName: string) =>
		`Remove "${jobTitle}" at ${companyName}? This permanently deletes the application and any generated documents.`,
	successMessage: "Application deleted",
	buttonLabel: "Delete",
	buttonLabelShort: "Delete application",
	confirmLabel: "Delete",
} as const
