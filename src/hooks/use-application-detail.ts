import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import {
	type ApplicationStatus,
	isApplicationStatus,
} from "@/lib/application-status"
import { supabase } from "@/lib/supabase"
import type { ApplicationDetailForm, ApplicationDetailRecord, GeneratedDocumentRow } from "@/types/application-detail"
import type { ApplicationRow } from "@/types/database"

function toForm(row: ApplicationRow): ApplicationDetailForm {
	return {
		jobTitle: row.job_title,
		companyName: row.company_name,
		jobUrl: row.job_url ?? "",
		jobDescription: row.job_description ?? "",
	}
}

export function useApplicationDetail(applicationId: string | undefined) {
	const { user } = useAuth()
	const [record, setRecord] = useState<ApplicationDetailRecord | null>(null)
	const [form, setForm] = useState<ApplicationDetailForm | null>(null)
	const [loading, setLoading] = useState(true)
	const [savingDetails, setSavingDetails] = useState(false)
	const [updatingStatus, setUpdatingStatus] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [notice, setNotice] = useState<string | null>(null)

	const loadApplication = useCallback(async (options?: { silent?: boolean }) => {
		if (!user || !applicationId) return
		setError(null)
		if (!options?.silent) {
			setLoading(true)
		}
		try {
			const { data: appRow, error: appErr } = await supabase
				.from("applications")
				.select("*")
				.eq("id", applicationId)
				.eq("user_id", user.id)
				.maybeSingle()

			if (appErr) {
				console.error("Something went wrong loading application:", appErr)
				setError(appErr.message)
				setRecord(null)
				setForm(null)
				return
			}

			if (!appRow) {
				setError("Application not found.")
				setRecord(null)
				setForm(null)
				return
			}

			const application = appRow as ApplicationRow

			const [{ data: resumeRow }, { data: coverRow }] = await Promise.all([
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
			])

			const detail: ApplicationDetailRecord = {
				...application,
				generatedResume: (resumeRow as GeneratedDocumentRow | null) ?? null,
				generatedCoverLetter:
					(coverRow as GeneratedDocumentRow | null) ?? null,
			}

			setRecord(detail)
			setForm(toForm(application))
		} catch (err) {
			console.error("Something went wrong loading application:", err)
			setError(err instanceof Error ? err.message : "Load failed.")
			setRecord(null)
			setForm(null)
		} finally {
			setLoading(false)
		}
	}, [applicationId, user])

	const [refreshingDocuments, setRefreshingDocuments] = useState(false)

	const refreshDocuments = useCallback(async () => {
		if (!user || !applicationId) return
		setRefreshingDocuments(true)
		try {
			const [{ data: resumeRow }, { data: coverRow }] = await Promise.all([
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
			])

			setRecord((prev) => {
				if (!prev) return prev
				return {
					...prev,
					generatedResume:
						(resumeRow as GeneratedDocumentRow | null) ?? null,
					generatedCoverLetter:
						(coverRow as GeneratedDocumentRow | null) ?? null,
				}
			})
		} catch (err) {
			console.error("Something went wrong refreshing documents:", err)
			setError(
				err instanceof Error ? err.message : "Failed to refresh documents.",
			)
		} finally {
			setRefreshingDocuments(false)
		}
	}, [applicationId, user])

	useEffect(() => {
		void loadApplication()
	}, [loadApplication])

	async function saveDetails() {
		if (!user || !applicationId || !form) return
		setSavingDetails(true)
		setError(null)
		setNotice(null)
		try {
			const { error: upErr } = await supabase
				.from("applications")
				.update({
					job_title: form.jobTitle.trim(),
					company_name: form.companyName.trim(),
					job_url: form.jobUrl.trim() || null,
					job_description: form.jobDescription.trim() || null,
					updated_at: new Date().toISOString(),
				})
				.eq("id", applicationId)
				.eq("user_id", user.id)

			if (upErr) {
				console.error("Something went wrong saving application:", upErr)
				setError(upErr.message)
				return
			}

			setNotice("Application details saved.")
			await loadApplication({ silent: true })
		} catch (err) {
			console.error("Something went wrong saving application:", err)
			setError(err instanceof Error ? err.message : "Save failed.")
		} finally {
			setSavingDetails(false)
		}
	}

	async function updateStatus(next: ApplicationStatus) {
		if (!user || !applicationId) return
		setUpdatingStatus(true)
		setError(null)
		try {
			const { error: upErr } = await supabase
				.from("applications")
				.update({
					status: next,
					updated_at: new Date().toISOString(),
				})
				.eq("id", applicationId)
				.eq("user_id", user.id)

			if (upErr) {
				console.error("Something went wrong updating status:", upErr)
				setError(upErr.message)
				return
			}

			setRecord((prev) => (prev ? { ...prev, status: next } : prev))
		} catch (err) {
			console.error("Something went wrong updating status:", err)
			setError(err instanceof Error ? err.message : "Update failed.")
		} finally {
			setUpdatingStatus(false)
		}
	}

	function resolveStatus(raw: string): ApplicationStatus {
		return isApplicationStatus(raw) ? raw : "Generated"
	}

	function patchForm(patch: Partial<ApplicationDetailForm>) {
		setForm((prev) => (prev ? { ...prev, ...patch } : prev))
	}

	return {
		record,
		form,
		loading,
		savingDetails,
		updatingStatus,
		error,
		notice,
		setNotice,
		loadApplication,
		refreshDocuments,
		refreshingDocuments,
		saveDetails,
		updateStatus,
		resolveStatus,
		patchForm,
	}
}
