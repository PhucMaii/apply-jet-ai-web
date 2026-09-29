export const JOBS_COPY = {
	searchLabel: "Title",
	searchPlaceholder: "Job title",
	locationLabel: "Location",
	locationPlaceholder: "City or Remote",
	postedLabel: "Posted",
	sortLabel: "Sort",
	quickLocationsLabel: "Locations",
	clearFilters: "Clear",
	resultsOne: "1 job",
	resultsMany: (count: number) => `${count} jobs`,
	resultsFiltered: (shown: number) =>
		shown === 1 ? "1 job" : `${shown} jobs`,
	emptyTitle: "No matching jobs",
	emptyCatalogTitle: "No jobs yet",
	loadError: "Could not load the job feed. Please try again.",
	loadTimeout:
		"Search took too long. Try a more specific title or location.",
	loadMore: "Load more",
	loading: "Loading…",
	loadingMore: "Loading…",
	apply: "Apply",
	tailorWithAi: "Tailor with AI",
	tailoring: "Tailoring…",
	tailorSuccess: "Tailored application ready",
	tailorNeedsDescription: "This job needs a description to tailor",
	signupTitle: "Create an account to tailor",
	signupMessage:
		"Sign up free to generate a resume tailored to this job posting.",
	signupCta: "Create account",
	signupLogin: "Log in",
	viewPosting: "View posting",
	openExternal: "Opens the employer application page",
	postedUnknown: "Date unknown",
	departmentFallback: "General",
	companyFallback: "Company",
	descriptionMissing: "Description on company site",
	backToResults: "Back",
	selectJob: "Select a job",
} as const

export const JOBS_PAGE_SIZE = 24

export const JOB_POSTED_WITHIN_OPTIONS = [
	{ value: "any", label: "Any time" },
	{ value: "1", label: "Today" },
	{ value: "3", label: "Last 3 days" },
	{ value: "7", label: "Last 7 days" },
	{ value: "30", label: "Last 30 days" },
] as const

export type JobPostedWithin =
	(typeof JOB_POSTED_WITHIN_OPTIONS)[number]["value"]

export const JOB_SORT_OPTIONS = [
	{ value: "relevant", label: "Most relevant" },
	{ value: "recent", label: "Most recent" },
] as const

export type JobSort = (typeof JOB_SORT_OPTIONS)[number]["value"]

export const JOB_LOCATION_SHORTCUTS = [
	"Remote",
	"Toronto",
	"Vancouver",
	"Montreal",
	"Calgary",
	"Ottawa",
	"Waterloo",
] as const
