/**
 * Create an application from a jobs row, clone the user's profile resume,
 * then run a bounded AI tailor (summary + top experiences + skills) with apply.
 *
 * Body: { userId, jobId }
 * Returns: { applicationId, appResumeId, tailorStatus, tailoredCount, failedCount }
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { jsonResponse } from "../_shared/stripe-cors.ts"
import { initializeAppResumeFromProfile } from "../_shared/initialize-app-resume.ts"
import {
	dedupeSkillsAcrossResume,
	generateTailorFeedback,
} from "../_shared/resume-tailor-feedback.ts"

declare const Deno: {
	serve: (handler: (req: Request) => Response | Promise<Response>) => void
	env: { get: (name: string) => string | undefined }
}

declare const EdgeRuntime: {
	waitUntil: (promise: Promise<unknown>) => void
}

const MAX_EXPERIENCE_BLOCKS = 4
const MAX_SKILL_BLOCKS = 3

type TailorStatus = "pending" | "tailoring" | "ready" | "partial" | "failed"

interface CreateTailoredApplicationBody {
	userId: string
	jobId: number | string
}

interface TailorTargets {
	summaryBlockId: string | null
	experienceBlockIds: string[]
	skillBlockIds: string[]
}

function jobDescriptionPlainText(html: string | null | undefined): string {
	if (!html) return ""
	return html
		.replace(/<[^>]*>/g, " ")
		.replace(/&nbsp;/gi, " ")
		.replace(/&amp;/gi, "&")
		.replace(/&lt;/gi, "<")
		.replace(/&gt;/gi, ">")
		.replace(/&quot;/gi, '"')
		.replace(/&#39;/gi, "'")
		.replace(/\s+/g, " ")
		.trim()
}

function scheduleBackground(task: Promise<unknown>) {
	try {
		if (typeof EdgeRuntime !== "undefined" && EdgeRuntime?.waitUntil) {
			EdgeRuntime.waitUntil(task)
			return true
		}
	} catch (error) {
		console.error(
			"Something went wrong scheduling EdgeRuntime.waitUntil:",
			error,
		)
	}
	return false
}

async function loadTailorTargets(
	// deno-lint-ignore no-explicit-any
	supabase: any,
	appResumeId: string,
): Promise<TailorTargets> {
	const { data: sections, error: sectionError } = await supabase
		.from("app_resume_sections")
		.select("id, section_type")
		.eq("app_resume_id", appResumeId)
		.in("section_type", ["summary", "experience", "skills"])

	if (sectionError) {
		console.error(
			"Something went wrong loading sections for tailor:",
			sectionError,
		)
		throw new Error("Failed to load resume sections")
	}

	const summarySection = (sections ?? []).find(
		(section: { section_type: string }) => section.section_type === "summary",
	)
	const experienceSection = (sections ?? []).find(
		(section: { section_type: string }) =>
			section.section_type === "experience",
	)
	const skillsSection = (sections ?? []).find(
		(section: { section_type: string }) => section.section_type === "skills",
	)

	const [summaryResult, experienceResult, skillsResult] = await Promise.all([
		summarySection
			? supabase
					.from("app_resume_blocks")
					.select("id")
					.eq("section_id", summarySection.id)
					.order("sort_key", { ascending: true })
					.limit(1)
			: Promise.resolve({ data: [], error: null }),
		experienceSection
			? supabase
					.from("app_resume_blocks")
					.select("id")
					.eq("section_id", experienceSection.id)
					.eq("block_type", "job_entry")
					.order("sort_key", { ascending: true })
					.limit(MAX_EXPERIENCE_BLOCKS)
			: Promise.resolve({ data: [], error: null }),
		skillsSection
			? supabase
					.from("app_resume_blocks")
					.select("id")
					.eq("section_id", skillsSection.id)
					.eq("block_type", "skill_category_entry")
					.order("sort_key", { ascending: true })
					.limit(MAX_SKILL_BLOCKS)
			: Promise.resolve({ data: [], error: null }),
	])

	if (summaryResult.error || experienceResult.error || skillsResult.error) {
		throw new Error("Failed to load resume blocks for tailor")
	}

	return {
		summaryBlockId: summaryResult.data?.[0]?.id ?? null,
		experienceBlockIds: (experienceResult.data ?? []).map(
			(block: { id: string }) => block.id,
		),
		skillBlockIds: (skillsResult.data ?? []).map(
			(block: { id: string }) => block.id,
		),
	}
}

async function invokeRewriteApply(input: {
	supabaseUrl: string
	secretKey: string
	serviceRoleKey: string
	userId: string
	blockId: string
	appResumeId: string
	jdText: string
}): Promise<void> {
	const response = await fetch(
		`${input.supabaseUrl}/functions/v1/rewrite-resume-block`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${input.serviceRoleKey}`,
				"X-Secret-Key": input.secretKey,
			},
			body: JSON.stringify({
				userId: input.userId,
				blockId: input.blockId,
				appResumeId: input.appResumeId,
				jdText: input.jdText,
				apply: true,
			}),
		},
	)

	if (!response.ok) {
		const details = await response.text()
		throw new Error(
			`rewrite-resume-block failed (${response.status}): ${details}`,
		)
	}
}

async function runBoundedTailor(input: {
	// deno-lint-ignore no-explicit-any
	supabase: any
	supabaseUrl: string
	secretKey: string
	serviceRoleKey: string
	userId: string
	applicationId: string
	appResumeId: string
	jdText: string
}): Promise<{ tailoredCount: number; failedCount: number; status: TailorStatus }> {
	const targets = await loadTailorTargets(input.supabase, input.appResumeId)
	const blockIds = [
		...(targets.summaryBlockId ? [targets.summaryBlockId] : []),
		...targets.experienceBlockIds,
		...targets.skillBlockIds,
	]

	if (blockIds.length === 0) {
		await input.supabase
			.from("applications")
			.update({
				tailor_status: "ready",
				updated_at: new Date().toISOString(),
			})
			.eq("id", input.applicationId)
		return { tailoredCount: 0, failedCount: 0, status: "ready" }
	}

	let tailoredCount = 0
	let failedCount = 0

	if (targets.summaryBlockId) {
		try {
			await invokeRewriteApply({
				supabaseUrl: input.supabaseUrl,
				secretKey: input.secretKey,
				serviceRoleKey: input.serviceRoleKey,
				userId: input.userId,
				blockId: targets.summaryBlockId,
				appResumeId: input.appResumeId,
				jdText: input.jdText,
			})
			tailoredCount += 1
		} catch (error) {
			failedCount += 1
			console.error("Something went wrong rewriting summary:", error)
		}
	}

	const parallelIds = [
		...targets.experienceBlockIds,
		...targets.skillBlockIds,
	]
	if (parallelIds.length > 0) {
		const results = await Promise.allSettled(
			parallelIds.map((blockId) =>
				invokeRewriteApply({
					supabaseUrl: input.supabaseUrl,
					secretKey: input.secretKey,
					serviceRoleKey: input.serviceRoleKey,
					userId: input.userId,
					blockId,
					appResumeId: input.appResumeId,
					jdText: input.jdText,
				}),
			),
		)
		for (const result of results) {
			if (result.status === "fulfilled") {
				tailoredCount += 1
			} else {
				failedCount += 1
				console.error(
					"Something went wrong rewriting resume block:",
					result.reason,
				)
			}
		}
	}

	try {
		await dedupeSkillsAcrossResume(input.supabase, input.appResumeId)
	} catch (dedupeError) {
		console.error(
			"Something went wrong deduping skills after tailor:",
			dedupeError,
		)
	}

	let tailorFeedback: unknown = null
	const geminiApiKey = Deno.env.get("GEMINI_API_KEY")
	if (geminiApiKey && tailoredCount > 0) {
		try {
			tailorFeedback = await generateTailorFeedback({
				supabase: input.supabase,
				appResumeId: input.appResumeId,
				jdText: input.jdText,
				apiKey: geminiApiKey,
			})
		} catch (feedbackError) {
			console.error(
				"Something went wrong generating tailor feedback:",
				feedbackError,
			)
		}
	}

	const status: TailorStatus =
		tailoredCount === 0 && failedCount > 0
			? "failed"
			: failedCount > 0
				? "partial"
				: "ready"

	const { error: statusError } = await input.supabase
		.from("applications")
		.update({
			tailor_status: status,
			...(tailorFeedback ? { tailor_feedback: tailorFeedback } : {}),
			updated_at: new Date().toISOString(),
		})
		.eq("id", input.applicationId)

	if (statusError) {
		console.error(
			"Something went wrong updating tailor_status:",
			statusError,
		)
	}

	return { tailoredCount, failedCount, status }
}

Deno.serve(async (req) => {
	if (req.method === "OPTIONS") {
		return jsonResponse({ message: "OK" }, 200)
	}

	if (req.method !== "POST") {
		return jsonResponse({ error: "Method not allowed" }, 405)
	}

	const secretKey = Deno.env.get("X-SECRET-KEY")
	const xsecretkey = req.headers.get("X-Secret-Key")
	if (!secretKey || xsecretkey !== secretKey) {
		return jsonResponse({ error: "Unauthorized" }, 401)
	}

	try {
		let body: CreateTailoredApplicationBody
		try {
			body = await req.json()
		} catch {
			return jsonResponse({ error: "Invalid JSON body" }, 400)
		}

		const userId = typeof body?.userId === "string" ? body.userId.trim() : ""
		const jobIdRaw = body?.jobId
		const jobId =
			typeof jobIdRaw === "number"
				? jobIdRaw
				: typeof jobIdRaw === "string"
					? Number(jobIdRaw)
					: NaN

		if (!userId || !Number.isFinite(jobId)) {
			return jsonResponse(
				{ error: "Missing required fields: userId, jobId" },
				400,
			)
		}

		const supabaseUrl = Deno.env.get("SUPABASE_URL")
		const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
		if (!supabaseUrl || !serviceRoleKey) {
			console.error(
				"Something went wrong: Supabase env is not configured for create-tailored-application",
			)
			return jsonResponse({ error: "Supabase env is not configured" }, 500)
		}

		const supabase = createClient(supabaseUrl, serviceRoleKey)

		const { data: job, error: jobError } = await supabase
			.from("jobs")
			.select("id, title, apply_url, description_html, companies(name)")
			.eq("id", jobId)
			.maybeSingle()

		if (jobError || !job) {
			console.error("Something went wrong loading job:", jobError)
			return jsonResponse({ error: "Job not found" }, 404)
		}

		const jdText = jobDescriptionPlainText(job.description_html)
		if (!jdText) {
			return jsonResponse(
				{ error: "This job needs a description to tailor" },
				400,
			)
		}

		const companyRelation = job.companies as
			| { name?: string | null }
			| { name?: string | null }[]
			| null
		const companyName = Array.isArray(companyRelation)
			? companyRelation[0]?.name?.trim()
			: companyRelation?.name?.trim()

		const { data: application, error: insertError } = await supabase
			.from("applications")
			.insert({
				user_id: userId,
				company_name: companyName || "Company",
				job_title: (job.title ?? "").trim() || "Role",
				job_url: job.apply_url?.trim() || null,
				job_description: jdText,
				job_id: job.id,
				status: "Generated",
				tailor_status: "tailoring" satisfies TailorStatus,
			})
			.select("id")
			.single()

		if (insertError || !application?.id) {
			console.error(
				"Something went wrong creating application:",
				insertError,
			)
			return jsonResponse(
				{ error: insertError?.message ?? "Failed to create application" },
				500,
			)
		}

		const applicationId = application.id as string

		let appResumeId: string
		try {
			const initialized = await initializeAppResumeFromProfile(
				supabase,
				userId,
				applicationId,
				(job.title ?? "").trim() || "Role",
			)
			appResumeId = initialized.appResumeId
		} catch (initError) {
			console.error(
				"Something went wrong initializing app resume:",
				initError,
			)
			await supabase
				.from("applications")
				.update({
					tailor_status: "failed",
					updated_at: new Date().toISOString(),
				})
				.eq("id", applicationId)
			return jsonResponse(
				{
					error:
						initError instanceof Error
							? initError.message
							: "Failed to initialize resume",
					applicationId,
					tailorStatus: "failed",
				},
				500,
			)
		}

		const tailorTask = runBoundedTailor({
			supabase,
			supabaseUrl,
			secretKey,
			serviceRoleKey,
			userId,
			applicationId,
			appResumeId,
			jdText,
		})

		const scheduled = scheduleBackground(
			tailorTask.catch((error) => {
				console.error(
					"Something went wrong in background tailor:",
					error,
				)
			}),
		)

		if (scheduled) {
			return jsonResponse(
				{
					applicationId,
					appResumeId,
					tailorStatus: "tailoring",
					async: true,
				},
				200,
			)
		}

		const result = await tailorTask
		return jsonResponse(
			{
				applicationId,
				appResumeId,
				tailorStatus: result.status,
				tailoredCount: result.tailoredCount,
				failedCount: result.failedCount,
				async: false,
			},
			200,
		)
	} catch (error) {
		console.error("Something went wrong: create-tailored-application call", {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		})
		return jsonResponse({ error: "Internal Server Error" }, 500)
	}
})
