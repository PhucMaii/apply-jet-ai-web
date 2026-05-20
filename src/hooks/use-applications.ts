import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { supabase } from "@/lib/supabase"
import {
	type ApplicationStatus,
	isApplicationStatus,
} from "@/lib/application-status"
import type { ApplicationWithDocuments } from "@/types/database"
import { useGeneratedResume } from "../../hooks/useGeneratedResume"
import { useGeneratedCoverLetter } from "../../hooks/useGeneratedCoverLetter"

export function useApplications() {
	const { user } = useAuth()
	const { getResumeDownloadUrl } = useGeneratedResume()
	const { getCoverLetterDownloadUrl } = useGeneratedCoverLetter()

	const [rows, setRows] = useState<ApplicationWithDocuments[]>([])
	const [loadError, setLoadError] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)
	const [updatingId, setUpdatingId] = useState<string | null>(null)
	const [downloading, setDownloading] = useState<string | null>(null)

	const loadApplications = useCallback(async () => {
		if (!user) return
		setLoadError(null)
		setLoading(true)
		try {
			const { data, error } = await supabase
				.from("applications")
				.select("*")
				.eq("user_id", user.id)
				.order("created_at", { ascending: false })

			if (error) {
				console.error("Something went wrong loading applications:", error)
				setLoadError(error.message)
				setRows([])
				return
			}

			setRows(data as unknown as ApplicationWithDocuments[])
		} catch (err) {
			console.error("Something went wrong loading applications:", err)
			setLoadError(err instanceof Error ? err.message : "Load failed.")
			setRows([])
		} finally {
			setLoading(false)
		}
	}, [user])

	useEffect(() => {
		void loadApplications()
	}, [loadApplications])

	async function updateStatus(
		applicationId: string,
		next: ApplicationStatus,
	) {
		if (!user) return
		setUpdatingId(applicationId)
		setLoadError(null)
		try {
			const { error } = await supabase
				.from("applications")
				.update({
					status: next,
					updated_at: new Date().toISOString(),
				})
				.eq("id", applicationId)
				.eq("user_id", user.id)

			if (error) {
				console.error("Something went wrong updating status:", error)
				setLoadError(error.message)
				return
			}

			setRows((prev) =>
				prev.map((r) =>
					r.id === applicationId ? { ...r, status: next } : r,
				),
			)
		} catch (err) {
			console.error("Something went wrong updating status:", err)
			setLoadError(err instanceof Error ? err.message : "Update failed.")
		} finally {
			setUpdatingId(null)
		}
	}

	async function downloadResume(
		applicationId: string,
		generatedResumeId: string,
	) {
		setLoadError(null)
		setDownloading(`resume-${applicationId}`)
		try {
			const url = await getResumeDownloadUrl(generatedResumeId)
			window.open(url, "_blank", "noopener,noreferrer")
		} catch (err) {
			console.error("Something went wrong downloading generated resume:", err)
			setLoadError(
				err instanceof Error ? err.message : "Failed to download resume.",
			)
		} finally {
			setDownloading(null)
		}
	}

	async function downloadCoverLetter(
		applicationId: string,
		generatedCoverLetterId: string,
	) {
		setLoadError(null)
		setDownloading(`cover-${applicationId}`)
		try {
			const url = await getCoverLetterDownloadUrl(generatedCoverLetterId)
			window.open(url, "_blank", "noopener,noreferrer")
		} catch (err) {
			console.error("Something went wrong downloading cover letter:", err)
			setLoadError(
				err instanceof Error
					? err.message
					: "Failed to download cover letter.",
			)
		} finally {
			setDownloading(null)
		}
	}

	function resolveStatus(raw: string): ApplicationStatus {
		return isApplicationStatus(raw) ? raw : "Generated"
	}

	return {
		rows,
		loadError,
		loading,
		updatingId,
		downloading,
		loadApplications,
		updateStatus,
		downloadResume,
		downloadCoverLetter,
		resolveStatus,
	}
}
