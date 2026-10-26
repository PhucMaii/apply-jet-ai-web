import { env } from "@/lib/env"
import { supabase } from "@/lib/supabase"

export type TailorStatus =
	| "pending"
	| "tailoring"
	| "ready"
	| "partial"
	| "failed"

export interface CreateTailoredApplicationResponse {
	applicationId: string
	appResumeId?: string
	tailorStatus: TailorStatus
	tailoredCount?: number
	failedCount?: number
	async?: boolean
	error?: string
}

export async function invokeCreateTailoredApplication(input: {
	userId: string
	jobId: number
}): Promise<CreateTailoredApplicationResponse> {
	const { data, error } = await supabase.functions.invoke(
		"create-tailored-application",
		{
			body: {
				userId: input.userId,
				jobId: input.jobId,
			},
			headers: {
				"X-Secret-Key": env.xsecretkey,
			},
		},
	)

	if (error) {
		let message = "Failed to create tailored application."
		try {
			const payload = (await error.context?.json()) as {
				error?: string
				applicationId?: string
			}
			if (payload?.error) message = payload.error
			if (payload?.applicationId) {
				return {
					applicationId: payload.applicationId,
					tailorStatus: "failed",
					error: message,
				}
			}
		} catch {
			// ignore parse failures
		}
		console.error(
			"Something went wrong invoking create-tailored-application:",
			error,
		)
		throw new Error(message)
	}

	if (!data || typeof data !== "object") {
		throw new Error("Empty create-tailored-application response.")
	}

	const result = data as CreateTailoredApplicationResponse
	if ("error" in result && result.error && !result.applicationId) {
		throw new Error(
			typeof result.error === "string"
				? result.error
				: "Failed to create tailored application.",
		)
	}

	if (!result.applicationId) {
		throw new Error("Malformed create-tailored-application response.")
	}

	return result
}
