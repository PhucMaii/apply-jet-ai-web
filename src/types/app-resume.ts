export type AppResumeVersion = "original" | "tailored"

export type AppResumeSectionType =
	| "header"
	| "summary"
	| "experience_entry"
	| "education_entry"
	| "skills"
	| "projects"
	| "custom"

export type AppResumeBlockType =
	| "heading"
	| "subheading"
	| "bullet"
	| "text"
	| "date_range"
	| "contact_line"

export interface AppResumeBlock {
	id: string
	app_resume_section_id: string
	block_key: string
	type: AppResumeBlockType
	content: string
	order: number
	is_new: boolean
	is_removed: boolean
	is_hidden: boolean
	created_at: string
	updated_at: string
}

export interface AppResumeSection {
	id?: string
	app_resume_id: string
	section_type: AppResumeSectionType
	display_name: string
	sort_key: number
	created_at?: string
	updated_at?: string
	blocks?: AppResumeBlock[]
}

export interface AppResume {
	id: string
	application_id: string
	version: AppResumeVersion
	score: number | null
	created_at: string
	updated_at: string
	sections: AppResumeSection[]
}

export interface TailoredBlockPayload {
	block_key: string
	section_key: string
	type: AppResumeBlockType
	content: string
	order: number
	is_new?: boolean
	is_removed?: boolean
	section_type: AppResumeSectionType
	section_title?: string | null
	section_order?: number
}

export interface TailorAppResumeResponse {
	score: number
	blocks: TailoredBlockPayload[]
}
