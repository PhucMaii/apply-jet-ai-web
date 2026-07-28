import { useCallback, useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/context/auth-context"
import {
	type ApplicationStatus,
	isApplicationStatus,
} from "@/lib/application-status"
import {
	fetchApplicationDetail,
	toApplicationDetailForm,
} from "@/lib/application-detail"
import { supabase } from "@/lib/supabase"
import type { ApplicationDetailForm } from "@/types/application-detail"

export function useApplicationDetail(applicationId: string | undefined) {
	const { user, isLoading: isAuthLoading } = useAuth()
	const [form, setForm] = useState<ApplicationDetailForm | null>(null)
	const [savingDetails, setSavingDetails] = useState(false)
	const [updatingStatus, setUpdatingStatus] = useState(false)
	const [notice, setNotice] = useState<string | null>(null)
	const [mutationError, setMutationError] = useState<string | null>(null)

	const {
		data,
		isLoading,
		isFetching,
		error: queryError,
		refetch,
	} = useQuery({
		queryKey: ["application-detail", applicationId, user?.id],
		enabled: Boolean(applicationId && user?.id),
		queryFn: async () => {
			if (!applicationId || !user?.id) {
				throw new Error("Missing application or user.")
			}
			return fetchApplicationDetail(applicationId, user.id)
		},
	})

	useEffect(() => {
		if (data?.form) {
			setForm(data.form)
		}
		if (!data) {
			setForm(null)
		}
	}, [data])

	const record = data?.record ?? null
	const appResume = data?.appResume ?? null
	const queryErrorMessage =
		queryError instanceof Error ? queryError.message : null
	const error = mutationError ?? queryErrorMessage
	const isLoadingApplication = isAuthLoading || isLoading
	const isNotFound =
		!isLoadingApplication &&
		Boolean(applicationId) &&
		Boolean(user?.id) &&
		!record &&
		Boolean(
			queryErrorMessage?.toLowerCase().includes("not found") ||
				(!queryErrorMessage && !isFetching),
		)

	const saveApplication = useCallback(async () => {
		if (!user || !applicationId || !form) return
		setSavingDetails(true)
		setMutationError(null)
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
				setMutationError(upErr.message)
				return
			}

			setNotice("Application details saved.")
			await refetch()
		} catch (err) {
			console.error("Something went wrong saving application:", err)
			setMutationError(err instanceof Error ? err.message : "Save failed.")
		} finally {
			setSavingDetails(false)
		}
	}, [applicationId, form, refetch, user])

	const updateStatus = useCallback(
		async (next: ApplicationStatus) => {
			if (!user || !applicationId) return
			setUpdatingStatus(true)
			setMutationError(null)
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
					setMutationError(upErr.message)
					return
				}

				await refetch()
			} catch (err) {
				console.error("Something went wrong updating status:", err)
				setMutationError(
					err instanceof Error ? err.message : "Update failed.",
				)
			} finally {
				setUpdatingStatus(false)
			}
		},
		[applicationId, refetch, user],
	)

	function resolveStatus(raw: string): ApplicationStatus {
		return isApplicationStatus(raw) ? raw : "Generated"
	}

	function patchForm(patch: Partial<ApplicationDetailForm>) {
		setForm((prev) => (prev ? { ...prev, ...patch } : prev))
	}

	return {
		record,
		form,
		appResume,
		isLoadingApplication,
		isRefetchingApplication: isFetching && !isLoading,
		isNotFound,
		savingDetails,
		updatingStatus,
		error,
		notice,
		setNotice,
		refetchApplication: refetch,
		saveApplication,
		updateStatus,
		resolveStatus,
		patchForm,
		toForm: toApplicationDetailForm,
	}
}
