import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/auth-context"
import { APPLICATION_CREATE_VALIDATION } from "@/lib/application-create-copy"
import { applicationDetailPath } from "@/lib/constants"
import { invokeCreateTailoredApplication } from "@/lib/create-tailored-application"
import { supabase } from "@/lib/supabase"
import {
	EMPTY_CREATE_APPLICATION_FORM,
	type CreateApplicationField,
	type CreateApplicationFieldErrors,
	type CreateApplicationForm,
} from "@/types/application-create"
import useEmail from "./use-email"

function validateFormValues(
	values: CreateApplicationForm,
): CreateApplicationFieldErrors {
	const errors: CreateApplicationFieldErrors = {}
	if (!values.companyName.trim()) {
		errors.companyName = APPLICATION_CREATE_VALIDATION.companyNameRequired
	}
	if (!values.jobTitle.trim()) {
		errors.jobTitle = APPLICATION_CREATE_VALIDATION.jobTitleRequired
	}
	if (!values.jobDescription.trim()) {
		errors.jobDescription =
			APPLICATION_CREATE_VALIDATION.jobDescriptionRequired
	}
	return errors
}

export function useCreateApplication() {
	const { user } = useAuth()
	const { sendFirstApplicationEmail } = useEmail()
	const navigate = useNavigate()

	const [form, setForm] = useState<CreateApplicationForm>(
		EMPTY_CREATE_APPLICATION_FORM,
	)
	const [fieldErrors, setFieldErrors] = useState<CreateApplicationFieldErrors>(
		{},
	)
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

	function validateForm(values: CreateApplicationForm = form): boolean {
		const errors = validateFormValues(values)
		setFieldErrors(errors)
		return Object.keys(errors).length === 0
	}

	const checkIsFirstApplication = async (userId: string) => {
		const { count } = await supabase
			.from("applications")
			.select("*", { count: "exact", head: true })
			.eq("user_id", userId)
		return count === 0
	}

	async function submit(options?: {
		noNavigate?: boolean
		formOverride?: CreateApplicationForm
	}) {
		if (!user) return
		setError(null)

		const values = options?.formOverride ?? form
		if (!validateForm(values)) return

		if (options?.formOverride) {
			setForm(options.formOverride)
		}

		setSubmitting(true)
		try {
			const isFirstApplication = await checkIsFirstApplication(user.id)
			if (isFirstApplication) {
				await sendFirstApplicationEmail(user.id)
			}

			const result = await invokeCreateTailoredApplication({
				userId: user.id,
				companyName: values.companyName.trim(),
				jobTitle: values.jobTitle.trim(),
				jobDescription: values.jobDescription.trim(),
				jobUrl: values.jobUrl.trim() || undefined,
			})

			if (!options?.noNavigate) {
				navigate(applicationDetailPath(result.applicationId))
			}

			return result.applicationId
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
