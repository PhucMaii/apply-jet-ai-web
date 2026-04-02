import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"

import type { ResumeRow } from "../src/types/database"
import { getResume, uploadResume as uploadResumeApi } from "../src/lib/resume"

const TOAST_UPLOAD_SUCCESS = "Resume uploaded successfully"
const TOAST_UPLOAD_ERROR = "Resume upload failed"
const TOAST_LOAD_ERROR = "Failed to load resume"

export function useResume(userId: string | undefined) {
	const [resume, setResume] = useState<ResumeRow | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [uploading, setUploading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const refetch = useCallback(async () => {
		if (!userId) {
			setResume(null)
			setIsLoading(false)
			return
		}
		
		setIsLoading(true)
		setError(null)
		try {
			const row = await getResume(userId)
			setResume(row as unknown as ResumeRow)
		} catch (e) {
			console.error(e)
			const msg = TOAST_LOAD_ERROR
			setError(msg)
			toast.error(msg)
		} finally {
			setIsLoading(false)
		}
	}, [userId])

	useEffect(() => {
		refetch()
	}, [refetch])

	const uploadResume = useCallback(
		async (file: File) => {
			if (!userId) return
			setUploading(true)
			setError(null)

			try {
				const result = await uploadResumeApi(userId, file)
				if (result.resume) {
					setResume(result.resume as unknown as ResumeRow)
					toast.success(TOAST_UPLOAD_SUCCESS)
				}
				if (result.error) {
					setError(result.error)
					toast.error(result.error)
				}
			} catch (e) {
				console.error(e)
				const msg = TOAST_UPLOAD_ERROR
				setError(msg)
				toast.error(msg)
			} finally {
				setUploading(false)
			}
		},
		[userId]
	)

	const clearError = useCallback(() => setError(null), [])

	return { resume, isLoading, uploading, error, uploadResume, refetch, clearError }
}
