import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useRememberApplicationForJob } from "@/hooks/use-application-for-job"
import { applicationDetailPath } from "@/lib/constants"
import {
	invokeCreateTailoredApplication,
	type TailorStatus,
} from "@/lib/create-tailored-application"
import { JOBS_COPY } from "@/lib/jobs-copy"
import { hasJobDescription } from "@/lib/jobs-display"
import type { JobFeedItem } from "@/types/database"

export interface CreateTailoredApplicationResult {
	success: boolean
	msg: string
	applicationId?: string
	tailorStatus?: TailorStatus
}

function messageForTailorStatus(
	status: TailorStatus,
	isAsync: boolean,
): string {
	if (isAsync || status === "tailoring" || status === "pending") {
		return JOBS_COPY.tailorInProgress
	}
	if (status === "ready") return JOBS_COPY.tailorSuccess
	if (status === "partial") return JOBS_COPY.tailorPartial
	if (status === "failed") return JOBS_COPY.tailorCreatedOnly
	return JOBS_COPY.tailorSuccess
}

export function useCreateTailoredApplication(job: JobFeedItem | null) {
	const { user } = useAuth()
	const rememberApplicationForJob = useRememberApplicationForJob()
	const [isCreating, setIsCreating] = useState(false)
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

			if (!hasJobDescription(job.description_html)) {
				const msg = JOBS_COPY.tailorNeedsDescription
				setError(msg)
				return { success: false, msg }
			}

			setIsCreating(true)
			try {
				const result = await invokeCreateTailoredApplication({
					userId: user.id,
					jobId: job.id,
				})

				const tailorStatus = result.tailorStatus ?? "tailoring"
				const msg = messageForTailorStatus(
					tailorStatus,
					result.async === true,
				)

				rememberApplicationForJob(job.id, result.applicationId)

				window.open(
					applicationDetailPath(result.applicationId),
					"_blank",
					"noopener,noreferrer",
				)

				return {
					success: true,
					msg,
					applicationId: result.applicationId,
					tailorStatus,
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
				setIsCreating(false)
			}
		}

	return {
		createTailoredApplication,
		isCreating,
		error,
	}
}
