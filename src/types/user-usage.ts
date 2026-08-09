export interface UserUsageRow {
	user_id: string
	ai_generations_used?: number | null
	ai_generations_limit?: number | null
	resume_generations_used: number
	resume_generations_limit: number
	cover_letters_used: number
	cover_letters_limit: number
	extract_text_used?: number | null
	extract_text_limit?: number | null
	application_answers_used?: number | null
	application_answers_limit?: number | null
	files_download_used?: number | null
	files_download_limit?: number | null
	find_hr_used?: number | null
	find_hr_usage?: number | null
	find_hr_limit?: number | null
	plan_key?: string | null
	updated_at?: string | null
}

export type UsageMetricKey =
	| "aiGenerations"
	| "coverLetters"
	| "filesDownload"
	| "findHr"

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
