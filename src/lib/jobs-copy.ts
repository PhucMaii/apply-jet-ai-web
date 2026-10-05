export const JOBS_COPY = {
	pageTitle: "Find jobs",
	pageDescription: "Search open roles and tailor a resume for the ones you want.",
	searchLabel: "Title",
	searchPlaceholder: "Job title",
	locationLabel: "Location",
	locationPlaceholder: "City or Remote",
	postedLabel: "Posted",
	sortLabel: "Sort",
	quickLocationsLabel: "Locations",
	clearFilters: "Clear filters",
	clearShort: "Clear",
	clearTitle: "Clear title",
	clearLocation: "Clear location",
	updating: "Updating results",
	emptyDescription: "Try a broader title, another city, or clear the filters.",
	emptyCatalogDescription: "New roles show up here as they are posted.",
	newBadge: "New",
	logIn: "Log in",
	signUp: "Sign up",
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
	openExternal: "Opens the employer application page",
	postedUnknown: "Date unknown",
	companyFallback: "Company",
	descriptionMissing: "Description on company site",
	descriptionMissingBody:
		"The full posting lives on the company site. You can still apply from here.",
	backToResults: "Back",
	selectJob: "Select a job",
	clicksFewerThan25: "Fewer than 25 people clicked apply",
	clicksFewerThan50: "Fewer than 50 people clicked apply",
	clicksFewerThan100: "Fewer than 100 people clicked apply",
	clicksOver100: "Over 100 people clicked apply",
	clicksOver200: "Over 200 people clicked apply",
	clicksOver500: "Over 500 people clicked apply",
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

export function isJobPostedWithin(value: string): value is JobPostedWithin {
	return JOB_POSTED_WITHIN_OPTIONS.some((option) => option.value === value)
}

export const JOB_SORT_OPTIONS = [
	{ value: "relevant", label: "Most relevant" },
	{ value: "recent", label: "Most recent" },
] as const

export type JobSort = (typeof JOB_SORT_OPTIONS)[number]["value"]

export function isJobSort(value: string): value is JobSort {
	return JOB_SORT_OPTIONS.some((option) => option.value === value)
}

export const JOB_LOCATION_SHORTCUTS = [
	"Remote",
	"Toronto",
	"Vancouver",
	"Montreal",
	"Calgary",
	"Ottawa",
	"Waterloo",
] as const
