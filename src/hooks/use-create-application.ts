import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/auth-context"
import { APPLICATION_CREATE_VALIDATION } from "@/lib/application-create-copy"
import { applicationDetailPath } from "@/lib/constants"
import { supabase } from "@/lib/supabase"
import {
	EMPTY_CREATE_APPLICATION_FORM,
	type CreateApplicationField,
	type CreateApplicationFieldErrors,
	type CreateApplicationForm,
} from "@/types/application-create"

export function useCreateApplication() {
	const { user } = useAuth()
	const navigate = useNavigate()

	const [form, setForm] = useState<CreateApplicationForm>(
		EMPTY_CREATE_APPLICATION_FORM,
	)
	const [fieldErrors, setFieldErrors] =
		useState<CreateApplicationFieldErrors>({})
	const [error, setError] = useState<string | null>(null)
	const [submitting, setSubmitting] = useState(false)

	function patchForm(patch: Partial<CreateApplicationForm>) {
		setForm((prev) => ({ ...prev, ...patch }))
		const clearedKeys = Object.keys(patch) as CreateApplicationField[]
		if (clearedKeys.length === 0) return
		setFieldErrors((prev) => {
			const next = { ...prev }
			for (const key of clearedKeys) {
				delete next[key]
			}
			return next
		})
	}

	function validateForm(): boolean {
		const errors: CreateApplicationFieldErrors = {}
		if (!form.companyName.trim()) {
			errors.companyName =
				APPLICATION_CREATE_VALIDATION.companyNameRequired
		}
		if (!form.jobTitle.trim()) {
			errors.jobTitle = APPLICATION_CREATE_VALIDATION.jobTitleRequired
		}
		if (!form.jobDescription.trim()) {
			errors.jobDescription =
				APPLICATION_CREATE_VALIDATION.jobDescriptionRequired
		}
		setFieldErrors(errors)
		return Object.keys(errors).length === 0
	}

	async function submit() {
		if (!user) return
		setError(null)
		if (!validateForm()) return

		setSubmitting(true)
		try {
			const { data, error: insertError } = await supabase
				.from("applications")
				.insert({
					user_id: user.id,
					company_name: form.companyName.trim(),
					job_title: form.jobTitle.trim(),
					job_url: form.jobUrl.trim() || null,
					job_description: form.jobDescription.trim() || null,
					status: "Generated",
				})
				.select("id")
				.single()

			if (insertError) {
				console.error(
					"Something went wrong creating application:",
					insertError,
				)
				setError(insertError.message)
				return
			}

			if (!data?.id) {
				setError("Application was created but no id was returned.")
				return
			}

			navigate(applicationDetailPath(data.id))
		} catch (err) {
			console.error("Something went wrong creating application:", err)
			setError(
				err instanceof Error ? err.message : "Failed to create application.",
			)
		} finally {
			setSubmitting(false)
		}
	}

	return {
		form,
		patchForm,
		fieldErrors,
		error,
		submitting,
		submit,
	}
}
