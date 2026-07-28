import { supabase } from "@/lib/supabase"
import type {
	ApplicationDetailForm,
	ApplicationDetailRecord,
	GeneratedDocumentRow,
	RecruiterEmail,
} from "@/types/application-detail"
import type { AppResume, AppResumeBlock, AppResumeSection } from "@/types/app-resume"
import type { ApplicationRow } from "@/types/database"

export function toApplicationDetailForm(
	row: ApplicationRow,
): ApplicationDetailForm {
	return {
		id: row.id,
		jobTitle: row.job_title,
		companyName: row.company_name,
		jobUrl: row.job_url ?? "",
		jobDescription: row.job_description ?? "",
	}
}

export interface ApplicationDetailPayload {
	record: ApplicationDetailRecord
	form: ApplicationDetailForm
	appResume: AppResume | null
}

export async function fetchApplicationDetail(
	applicationId: string,
	userId: string,
): Promise<ApplicationDetailPayload> {
	const { data: appRow, error: appErr } = await supabase
		.from("applications")
		.select("*")
		.eq("id", applicationId)
		.eq("user_id", userId)
		.maybeSingle()

	if (appErr) {
		console.error("Something went wrong loading application:", appErr)
		throw new Error(appErr.message)
	}

	if (!appRow) {
		throw new Error("Application not found.")
	}

	const application = appRow as ApplicationRow

	const [{ data: resumeRow }, { data: coverRow }, { data: recruiterEmailsData }] =
		await Promise.all([
			supabase
				.from("generated_resumes")
				.select("*")
				.eq("application_id", applicationId)
				.maybeSingle(),
			supabase
				.from("generated_cover_letters")
				.select("*")
				.eq("application_id", applicationId)
				.maybeSingle(),
			supabase
				.from("recruiter_emails")
				.select("*")
				.eq("application_id", applicationId),
		])

	const record: ApplicationDetailRecord = {
		...application,
		generatedResume: (resumeRow as GeneratedDocumentRow | null) ?? null,
		generatedCoverLetter: (coverRow as GeneratedDocumentRow | null) ?? null,
		recruiterEmails: (recruiterEmailsData as RecruiterEmail[] | null) ?? [],
	}

	const appResume = await fetchAppResumeTree(applicationId)

	return {
		record,
		form: toApplicationDetailForm(application),
		appResume,
	}
}

async function fetchAppResumeTree(
	applicationId: string,
): Promise<AppResume | null> {
	const { data: resumeRow, error: resumeError } = await supabase
		.from("app_resumes")
		.select("*")
		.eq("application_id", applicationId)
		.maybeSingle()

	if (resumeError) {
		console.error("Something went wrong fetching app resume:", resumeError)
		throw new Error(resumeError.message)
	}

	if (!resumeRow) return null

	const [{ data: sectionRows, error: sectionsError }, { data: blockRows, error: blocksError }] =
		await Promise.all([
			supabase
				.from("app_resume_sections")
				.select("*")
				.eq("app_resume_id", resumeRow.id)
				.order("sort_key", { ascending: true }),
			supabase
				.from("app_resume_blocks")
				.select("*")
				.eq("app_resume_id", resumeRow.id)
				.order("sort_key", { ascending: true }),
		])

	if (sectionsError) {
		console.error(
			"Something went wrong fetching app resume sections:",
			sectionsError,
		)
		throw new Error(sectionsError.message)
	}

	if (blocksError) {
		console.error(
			"Something went wrong fetching app resume blocks:",
			blocksError,
		)
		throw new Error(blocksError.message)
	}

	const blocks = (blockRows as AppResumeBlock[] | null) ?? []
	const sections = ((sectionRows as AppResumeSection[] | null) ?? []).map(
		(section) => ({
			...section,
			blocks: blocks
				.filter((block) => block.section_id === section.id)
				.sort((a, b) => a.sort_key - b.sort_key),
		}),
	)

	return {
		...(resumeRow as Omit<AppResume, "sections">),
		sections,
	}
}
