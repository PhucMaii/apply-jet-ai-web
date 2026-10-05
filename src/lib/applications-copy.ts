export const APPLICATIONS_COPY = {
	title: "Applications",
	description: "Every role you’re pursuing, from saved to offer.",
	addApplication: "Add application",
	quickAdd: "Quick add",
	fullForm: "Open full form",
	searchLabel: "Search applications",
	searchPlaceholder: "Search role or company",
	statusFilterLabel: "Filter by status",
	allStatuses: "All statuses",
	sortLabel: "Sort applications",
	viewLabel: "View",
	viewTable: "Table",
	viewBoard: "Board",
	columnRole: "Role",
	columnStatus: "Status",
	columnScore: "Score",
	columnAdded: "Added",
	columnUpdated: "Updated",
	columnActions: "Actions",
	untitledRole: "Untitled role",
	unknownCompany: "Unknown company",
	open: "Open",
	viewPosting: "View posting",
	moreActions: (role: string) => `More actions for ${role}`,
	changeStatus: (role: string) => `Change status for ${role}`,
	statusUpdated: (label: string) => `Moved to ${label}`,
	statusFailed: "Couldn’t update the status. Please try again.",
	noResultsTitle: "No matching applications",
	noResultsBody: "Try a different search or status filter.",
	clearFilters: "Clear filters",
	emptyTitle: "Your pipeline starts here",
	emptyBody:
		"Add a job you’re interested in. ApplyJet scores your resume against it and tailors it in one click.",
	emptyBrowseJobs: "Browse jobs",
	boardEmptyColumn: "Drop here",
	boardDragHint: "Drag cards between columns, or use the status menu on each card.",
	count: (shown: number, total: number) =>
		shown === total
			? `${total} application${total === 1 ? "" : "s"}`
			: `${shown} of ${total} applications`,
	loading: "Loading applications",
	quickAddTitle: "Quick add application",
	quickAddDescription:
		"Just the essentials. We’ll set up a tailored resume and take you to it.",
	quickAddSubmit: "Add and open",
	quickAddSubmitting: "Adding…",
} as const

export const APPLICATIONS_VIEW_STORAGE_KEY = "applyjet:applications-view" as const

export const APPLICATIONS_VIEW = {
	table: "table",
	board: "board",
} as const

export type ApplicationsView =
	(typeof APPLICATIONS_VIEW)[keyof typeof APPLICATIONS_VIEW]
