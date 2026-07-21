import type { ApplicationRow } from "@/types/database"

/** Generated document row (schema may include file_url in production). */
export interface GeneratedDocumentRow {
	id: string
	application_id: string
	user_id: string
	content: string
	created_at: string
	file_url?: string | null
	status?: string | null
	old_score?: number | null
	new_score?: number | null
}

export interface ApplicationDetailRecord extends ApplicationRow {
	generatedResume: GeneratedDocumentRow | null
	generatedCoverLetter: GeneratedDocumentRow | null
	recruiterEmails: RecruiterEmail[]
}

export interface ApplicationDetailForm {
	id: string
	jobTitle: string
	companyName: string
	jobUrl: string
	jobDescription: string
}

export interface RecruiterEmail {
	id: string
	email: string
	type: string | null
	source: string | null
	source_url: string | null
}