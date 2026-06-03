import { useCallback, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"

import type { ResumeRow } from "../src/lib/resume"
import { uploadResume as uploadResumeApi } from "../src/lib/resume"
import {
	useUserResume,
	userResumeQueryKey,
} from "../src/hooks/use-user-resume"

const TOAST_UPLOAD_SUCCESS = "Resume uploaded successfully"
const TOAST_UPLOAD_ERROR = "Resume upload failed"

export function useResume(userId: string | undefined) {
	const queryClient = useQueryClient()
	const { resume, isLoading, refetch } = useUserResume(userId)
	const [uploading, setUploading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const uploadResume = useCallback(
		async (file: File) => {
			if (!userId) return
			setUploading(true)
			setError(null)

			try {
				const result = await uploadResumeApi(userId, file)
				if (result.resume) {
					queryClient.setQueryData<ResumeRow | null>(
						userResumeQueryKey(userId),
						result.resume,
					)
					await Promise.all([
						queryClient.invalidateQueries({
							queryKey: userResumeQueryKey(userId),
						}),
						queryClient.invalidateQueries({
							queryKey: ["user-profile"],
						}),
					])
					toast.success(TOAST_UPLOAD_SUCCESS)
				}
				if (result.error) {
					setError(result.error)
					toast.error(result.error)
				}
			} catch (err) {
				console.error("Something went wrong uploading resume:", err)
				const msg = TOAST_UPLOAD_ERROR
				setError(msg)
				toast.error(msg)
			} finally {
				setUploading(false)
			}
		},
		[queryClient, userId],
	)

	const clearError = useCallback(() => setError(null), [])

	return {
		resume,
		isLoading,
		uploading,
		error,
		uploadResume,
		refetch,
		clearError,
	}
}
