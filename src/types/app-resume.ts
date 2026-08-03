export type AppResumeStatus = "draft" | "downloaded"

export type AppResumeSectionType =
	| "header"
	| "summary"
	| "experience"
	| "education"
	| "skills"
	| "projects"
	| "custom"

export type AppResumeBlockType =
	| "rich_text"
	| "group_text"
	| "job_entry"
	| "project_entry"
	| "education_entry"
	| "skill_entry"
	| "skill_category_entry"

export interface AppResumeBlockStyle {
	bold?: boolean
	color?: string
	fontSize?: number
}

export interface GroupTextItem {
	text: string
	style_json?: AppResumeBlockStyle
}

export type AppResumeBlockContent =
	| { text: string, style_json?: AppResumeBlockStyle }
	| { texts: GroupTextItem[], style_json?: AppResumeBlockStyle }
	| {
			title: string
			company: string
			start_date: string | null
			end_date: string | null
			description: string[]
			style_json?: AppResumeBlockStyle
	  }
	| {
			name: string
			description: string[]
			start_date?: string | null
			end_date?: string | null
			style_json?: AppResumeBlockStyle
	  }
	| {
			school: string
			degree: string
			start_date: string | null
			end_date: string | null
			style_json?: AppResumeBlockStyle
	  }
	| {
			name: string
			categoryId: number
			categoryName: string
			style_json?: AppResumeBlockStyle
	  }
	| {
			category_id: string
			name: string
			skills: string[]
			style_json?: AppResumeBlockStyle
	  }

export interface AppResumeBlock {
	id: string
	app_resume_id: string
	section_id: string
	block_type: AppResumeBlockType
	sort_key: number
	content_json: AppResumeBlockContent
	style_json: AppResumeBlockStyle
	created_at: string 
	updated_at: string
}

export interface AppResumeSection {
	id: string
	app_resume_id: string
	generated_resume_id: string | null
	display_name: string
	section_type: AppResumeSectionType
	sort_key: number
	style_json: Record<string, unknown>
	created_at: string
	updated_at: string
	blocks: AppResumeBlock[]
	issueCount?: number
}

export interface AppResume {
	id: string
	application_id: string
	user_id: string
	status: AppResumeStatus
	created_at: string
	updated_at: string
	sections: AppResumeSection[]
}

export interface TailoredBlockPayload {
	id: string
	section_id: string
	block_type: AppResumeBlockType
	sort_key: number
	content_json: AppResumeBlockContent
	style_json: AppResumeBlockStyle
	is_new?: boolean
	is_removed?: boolean
}
