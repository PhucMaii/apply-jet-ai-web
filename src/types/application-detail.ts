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
}

export interface ApplicationDetailRecord extends ApplicationRow {
	generatedResume: GeneratedDocumentRow | null
	generatedCoverLetter: GeneratedDocumentRow | null
}

export interface ApplicationDetailForm {
	jobTitle: string
	companyName: string
	jobUrl: string
	jobDescription: string
}
