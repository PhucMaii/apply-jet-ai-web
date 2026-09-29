import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/auth-context"
import { useCreateApplication } from "@/hooks/use-create-application"
import { applicationDetailPath } from "@/lib/constants"
import { JOBS_COPY } from "@/lib/jobs-copy"
import { jobDescriptionPlainText } from "@/lib/jobs-display"
import { invokeRewriteResumeBlock } from "@/lib/rewrite-resume-block"
import { supabase } from "@/lib/supabase"
import type { CreateApplicationForm } from "@/types/application-create"
import type { JobFeedItem } from "@/types/database"

const SECTION_SUMMARY = "summary"
const SECTION_EXPERIENCE = "experience"

export interface CreateTailoredApplicationResult {
	success: boolean
	msg: string
	applicationId?: string
}

function buildFormFromJob(job: JobFeedItem): CreateApplicationForm | null {
	const jobDescription = jobDescriptionPlainText(job.description_html)
	if (!jobDescription) return null

	return {
		companyName:
			job.companies?.name?.trim() || JOBS_COPY.companyFallback,
		jobTitle: job.title.trim(),
		jobUrl: job.apply_url?.trim() || "",
		jobDescription,
	}
}

async function loadResumeBlocksForRewrite(applicationId: string) {
	const { data: appResume, error: appResumeError } = await supabase
		.from("app_resumes")
		.select("id")
		.eq("application_id", applicationId)
		.single()

	if (appResumeError) {
		console.error(
			"Something went wrong loading app resume:",
			appResumeError,
		)
		throw new Error("Failed to find app resume")
	}

	const { data: sections, error: sectionError } = await supabase
		.from("app_resume_sections")
		.select("id, section_type")
		.eq("app_resume_id", appResume.id)
		.in("section_type", [SECTION_SUMMARY, SECTION_EXPERIENCE])

	if (sectionError) {
		console.error(
			"Something went wrong loading resume sections:",
			sectionError,
		)
		throw new Error("Failed to find resume sections")
	}


	const summarySection = sections?.find(
		(section) => section.section_type === SECTION_SUMMARY,
	)
	const experienceSection = sections?.find(
		(section) => section.section_type === SECTION_EXPERIENCE,
	)

	if (!summarySection || !experienceSection) {
		throw new Error("Summary or experience section not found")
	}

	const [{ data: summaryBlocks, error: summaryError }, { data: experienceBlocks, error: experienceError }] =
		await Promise.all([
			supabase
				.from("app_resume_blocks")
				.select("id")
				.eq("section_id", summarySection.id),
			supabase
				.from("app_resume_blocks")
				.select("id")
				.eq("section_id", experienceSection.id),
		])

	if (summaryError) {
		console.error(
			"Something went wrong loading summary blocks:",
			summaryError,
		)
		throw new Error("Failed to find summary block")
	}
	if (experienceError) {
		console.error(
			"Something went wrong loading experience blocks:",
			experienceError,
		)
		throw new Error("Failed to find experience blocks")
	}

	const summaryBlockId = summaryBlocks?.[0]?.id
	if (!summaryBlockId) {
		throw new Error("Summary block not found")
	}

	return {
		appResumeId: appResume.id,
		summaryBlockId,
		experienceBlockIds: (experienceBlocks ?? []).map((block) => block.id),
	}
}

export function useCreateTailoredApplication(job: JobFeedItem | null) {
	const { user } = useAuth()
	const navigate = useNavigate()
	const { submit, submitting } = useCreateApplication()
	const [isTailoring, setIsTailoring] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const createTailoredApplication =
		async (): Promise<CreateTailoredApplicationResult> => {
			setError(null)

			if (!user) {
				const msg = "You must be signed in to tailor an application"
				setError(msg)
				return { success: false, msg }
			}

			if (!job) {
				const msg = "Select a job first"
				setError(msg)
				return { success: false, msg }
			}

			const formValues = buildFormFromJob(job)
			if (!formValues) {
				const msg = JOBS_COPY.tailorNeedsDescription
				setError(msg)
				return { success: false, msg }
			}

			setIsTailoring(true)
			try {
				const applicationId = await submit({
					noNavigate: true,
					formOverride: formValues,
				})

				if (!applicationId) {
					const msg = "Failed to create application"
					setError(msg)
					return { success: false, msg }
				}

				// Application exists — always land on detail, even if AI rewrite fails.
				try {
					const {
						appResumeId,
						summaryBlockId,
						experienceBlockIds,
					} = await loadResumeBlocksForRewrite(applicationId)

					const jdText = formValues.jobDescription

					await invokeRewriteResumeBlock({
						blockId: summaryBlockId,
						appResumeId,
						jdText,
						userId: user.id,
					})

					if (experienceBlockIds.length > 0) {
						const experienceResults = await Promise.allSettled(
							experienceBlockIds.map((blockId) =>
								invokeRewriteResumeBlock({
									blockId,
									appResumeId,
									jdText,
									userId: user.id,
								}),
							),
						)

						for (const result of experienceResults) {
							if (result.status === "rejected") {
								console.error(
									"Something went wrong rewriting experience:",
									result.reason,
								)
							}
						}
					}
				} catch (rewriteError) {
					console.error(
						"Something went wrong tailoring resume blocks:",
						rewriteError,
					)
				}

				navigate(applicationDetailPath(applicationId))
				return {
					success: true,
					msg: JOBS_COPY.tailorSuccess,
					applicationId,
				}
			} catch (err) {
				console.error(
					"Something went wrong creating tailored application:",
					err,
				)
				const msg =
					err instanceof Error
						? err.message
						: "Failed to create tailored application"
				setError(msg)
				return { success: false, msg }
			} finally {
				setIsTailoring(false)
			}
		}

	return {
		createTailoredApplication,
		isCreating: isTailoring || submitting,
		error,
	}
}
