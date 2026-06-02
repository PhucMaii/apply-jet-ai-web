export interface CreateApplicationForm {
	companyName: string
	jobTitle: string
	jobUrl: string
	jobDescription: string
}

export const EMPTY_CREATE_APPLICATION_FORM: CreateApplicationForm = {
	companyName: "",
	jobTitle: "",
	jobUrl: "",
	jobDescription: "",
}

export type CreateApplicationField = keyof CreateApplicationForm

export type CreateApplicationFieldErrors = Partial<
	Record<CreateApplicationField, string>
>
