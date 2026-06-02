export interface UserUsageRow {
	user_id: string
	resume_generations_used: number
	resume_generations_limit: number
	cover_letters_used: number
	cover_letters_limit: number
	extract_text_used?: number | null
	extract_text_limit?: number | null
	application_answers_used?: number | null
	application_answers_limit?: number | null
	plan_key?: string | null
	updated_at?: string | null
}

export type UsageMetricKey =
	| "resumeGenerations"
	| "coverLetters"
	| "extractText"
	| "applicationAnswers"

export type UsageMetricStatus = "ok" | "warning" | "exhausted"

export interface UsageMetricView {
	key: UsageMetricKey
	label: string
	description: string
	used: number
	limit: number | null
	remaining: number | null
	percentUsed: number | null
	status: UsageMetricStatus
	isUnlimited: boolean
}
