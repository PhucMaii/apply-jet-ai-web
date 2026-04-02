export const DISCLOSURE_OPTIONS: Record<string, { value: string; label: string }[]> = {
	authorized_to_work: [
		{ value: "yes", label: "Yes" },
		{ value: "no", label: "No" },
	],
	require_sponsorship: [
		{ value: "yes", label: "Yes" },
		{ value: "no", label: "No" },
	],
	willing_to_relocate: [
		{ value: "yes", label: "Yes" },
		{ value: "no", label: "No" },
		{ value: "open", label: "Open to discussion" },
	],
	veteran_status: [
		{ value: "yes", label: "Yes" },
		{ value: "no", label: "No" },
		{ value: "prefer_not", label: "Prefer not to say" }
	],
	disability_status: [
		{ value: "yes", label: "Yes" },
		{ value: "no", label: "No" },
		{ value: "prefer_not", label: "Prefer not to say" }
	],
	gender: [
		{ value: "male", label: "Male" },
		{ value: "female", label: "Female" },
		{ value: "non_binary", label: "Non-binary" },
		{ value: "prefer_not", label: "Prefer not to say" },
		{ value: "other", label: "Other" }
	],
	ethnicity: [
		{ value: "american_indian", label: "American Indian or Alaska Native" },
		{ value: "asian", label: "Asian" },
		{ value: "middle_eastern", label: "Middle Eastern" },
		{ value: "black", label: "Black or African American" },
		{ value: "latino", label: "Latino" },
		{ value: "native_hawaiian", label: "Native Hawaiian or Other Pacific Islander" },
		{ value: "white", label: "White" },
		{ value: "prefer_not", label: "Prefer not to say" },
	]
}

export const EMPLOYMENT_TYPES = [
	"Full-time",
	"Part-time",
	"Contract",
	"Freelance",
	"Internship",
	"Volunteer"
]