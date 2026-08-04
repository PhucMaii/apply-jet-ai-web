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
import {
	defaultContentForCustomBlock,
	defaultStyleForCustomBlock,
} from "@/lib/custom-resume-section"
import { supabase } from "@/lib/supabase"
import type { ApplicationDetailForm } from "@/types/application-detail"
import type {
	AppResumeBlock,
	AppResumeSection,
	CustomSectionBlockType,
} from "@/types/app-resume"

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

	const saveAppResumeBlock = useCallback(async (block: AppResumeBlock) => {
		if (!user || !applicationId) return

		const { error: upErr } = await supabase
			.from("app_resume_blocks")
			.update({
				content_json: block.content_json,
				style_json: block.style_json,
				updated_at: new Date().toISOString(),
			})
			.eq("id", block.id)

		if (upErr) {
			console.error("Something went wrong saving app resume block:", upErr)
			throw new Error(upErr.message)
		}
	}, [user, applicationId])

	const saveAppResumeSectionDisplayName = useCallback(
		async (input: { sectionId: string; displayName: string }) => {
			if (!user || !applicationId) {
				throw new Error("Missing application or user.")
			}

			const displayName = input.displayName.trim()
			if (!displayName) {
				throw new Error("Section name cannot be empty.")
			}

			const { error: upErr } = await supabase
				.from("app_resume_sections")
				.update({
					display_name: displayName,
					updated_at: new Date().toISOString(),
				})
				.eq("id", input.sectionId)

			if (upErr) {
				console.error(
					"Something went wrong saving section display name:",
					upErr,
				)
				throw new Error(upErr.message)
			}
		},
		[user, applicationId],
	)

	const saveAppResumeSectionOrder = useCallback(
		async (
			orderedSections: Array<{ sectionId: string; sortKey: number }>,
		) => {
			if (!user || !applicationId) {
				throw new Error("Missing application or user.")
			}

			const now = new Date().toISOString()
			const results = await Promise.all(
				orderedSections.map(async ({ sectionId, sortKey }) => {
					const { error: upErr } = await supabase
						.from("app_resume_sections")
						.update({
							sort_key: sortKey,
							updated_at: now,
						})
						.eq("id", sectionId)

					if (upErr) {
						console.error(
							"Something went wrong saving section order:",
							upErr,
						)
						return upErr
					}
					return null
				}),
			)

			const firstError = results.find((error) => error !== null)
			if (firstError) {
				throw new Error(firstError.message)
			}
		},
		[user, applicationId],
	)

	const createAppResumeSkillCategory = useCallback(
		async (input: {
			appResumeId: string
			sectionId: string
			sortKey: number
			name?: string
		}): Promise<AppResumeBlock> => {
			if (!user || !applicationId) {
				throw new Error("Missing application or user.")
			}

			const now = new Date().toISOString()
			const contentJson = {
				category_id: crypto.randomUUID(),
				name: input.name?.trim() || "New category",
				skills: [] as string[],
			}

			const { data, error: insertError } = await supabase
				.from("app_resume_blocks")
				.insert({
					app_resume_id: input.appResumeId,
					section_id: input.sectionId,
					block_type: "skill_category_entry",
					sort_key: input.sortKey,
					content_json: contentJson,
					style_json: {},
					created_at: now,
					updated_at: now,
				})
				.select("*")
				.single()

			if (insertError || !data) {
				console.error(
					"Something went wrong creating skill category block:",
					insertError,
				)
				throw new Error(
					insertError?.message ?? "Failed to create skill category.",
				)
			}

			return data as AppResumeBlock
		},
		[user, applicationId],
	)

	const createAppResumeSummaryBlock = useCallback(
		async (input: {
			appResumeId: string
			sectionId: string
			sortKey?: number
		}): Promise<AppResumeBlock> => {
			if (!user || !applicationId) {
				throw new Error("Missing application or user.")
			}

			const now = new Date().toISOString()
			const { data, error: insertError } = await supabase
				.from("app_resume_blocks")
				.insert({
					app_resume_id: input.appResumeId,
					section_id: input.sectionId,
					block_type: "rich_text",
					sort_key: input.sortKey ?? 0,
					content_json: { text: "" },
					style_json: {
						color: "black",
						fontSize: 12,
					},
					created_at: now,
					updated_at: now,
				})
				.select("*")
				.single()

			if (insertError || !data) {
				console.error(
					"Something went wrong creating summary block:",
					insertError,
				)
				throw new Error(
					insertError?.message ?? "Failed to create summary block.",
				)
			}

			return data as AppResumeBlock
		},
		[user, applicationId],
	)

	const ensureAppResumeSkillsSection = useCallback(
		async (input: {
			appResumeId: string
			sortKey: number
		}): Promise<AppResumeSection> => {
			if (!user || !applicationId) {
				throw new Error("Missing application or user.")
			}

			const now = new Date().toISOString()
			const { data, error: insertError } = await supabase
				.from("app_resume_sections")
				.insert({
					app_resume_id: input.appResumeId,
					section_type: "skills",
					display_name: "Skills",
					sort_key: input.sortKey,
					style_json: {},
					generated_resume_id: null,
					created_at: now,
					updated_at: now,
				})
				.select("*")
				.single()

			if (insertError || !data) {
				console.error(
					"Something went wrong creating skills section:",
					insertError,
				)
				throw new Error(
					insertError?.message ?? "Failed to create skills section.",
				)
			}

			return {
				...(data as Omit<AppResumeSection, "blocks">),
				blocks: [],
			}
		},
		[user, applicationId],
	)

	const createAppResumeCustomSection = useCallback(
		async (input: {
			appResumeId: string
			displayName: string
			sortKey: number
			blockType: CustomSectionBlockType
		}): Promise<AppResumeSection> => {
			if (!user || !applicationId) {
				throw new Error("Missing application or user.")
			}

			const now = new Date().toISOString()
			const displayName = input.displayName.trim() || "Custom section"

			const { data: sectionData, error: sectionError } = await supabase
				.from("app_resume_sections")
				.insert({
					app_resume_id: input.appResumeId,
					section_type: "custom",
					display_name: displayName,
					sort_key: input.sortKey,
					style_json: {},
					generated_resume_id: null,
					created_at: now,
					updated_at: now,
				})
				.select("*")
				.single()

			if (sectionError || !sectionData) {
				console.error(
					"Something went wrong creating custom section:",
					sectionError,
				)
				throw new Error(
					sectionError?.message ?? "Failed to create custom section.",
				)
			}

			const { data: blockData, error: blockError } = await supabase
				.from("app_resume_blocks")
				.insert({
					app_resume_id: input.appResumeId,
					section_id: sectionData.id,
					block_type: input.blockType,
					sort_key: 0,
					content_json: defaultContentForCustomBlock(input.blockType),
					style_json: defaultStyleForCustomBlock(input.blockType),
					created_at: now,
					updated_at: now,
				})
				.select("*")
				.single()

			if (blockError || !blockData) {
				console.error(
					"Something went wrong creating custom section block:",
					blockError,
				)
				await supabase
					.from("app_resume_sections")
					.delete()
					.eq("id", sectionData.id)
				throw new Error(
					blockError?.message ?? "Failed to create custom section block.",
				)
			}

			return {
				...(sectionData as Omit<AppResumeSection, "blocks">),
				blocks: [blockData as AppResumeBlock],
			}
		},
		[user, applicationId],
	)

	const createAppResumeCustomBlock = useCallback(
		async (input: {
			appResumeId: string
			sectionId: string
			sortKey: number
			blockType: CustomSectionBlockType
		}): Promise<AppResumeBlock> => {
			if (!user || !applicationId) {
				throw new Error("Missing application or user.")
			}

			const now = new Date().toISOString()
			const { data, error: insertError } = await supabase
				.from("app_resume_blocks")
				.insert({
					app_resume_id: input.appResumeId,
					section_id: input.sectionId,
					block_type: input.blockType,
					sort_key: input.sortKey,
					content_json: defaultContentForCustomBlock(input.blockType),
					style_json: defaultStyleForCustomBlock(input.blockType),
					created_at: now,
					updated_at: now,
				})
				.select("*")
				.single()

			if (insertError || !data) {
				console.error(
					"Something went wrong creating custom block:",
					insertError,
				)
				throw new Error(
					insertError?.message ?? "Failed to create custom block.",
				)
			}

			return data as AppResumeBlock
		},
		[user, applicationId],
	)

	const deleteAppResumeBlock = useCallback(
		async (blockId: string) => {
			if (!user || !applicationId) {
				throw new Error("Missing application or user.")
			}

			const { error: deleteError } = await supabase
				.from("app_resume_blocks")
				.delete()
				.eq("id", blockId)

			if (deleteError) {
				console.error(
					"Something went wrong deleting app resume block:",
					deleteError,
				)
				throw new Error(deleteError.message)
			}
		},
		[user, applicationId],
	)

	const deleteAppResumeSection = useCallback(
		async (sectionId: string) => {
			if (!user || !applicationId) {
				throw new Error("Missing application or user.")
			}

			const { error: blocksError } = await supabase
				.from("app_resume_blocks")
				.delete()
				.eq("section_id", sectionId)

			if (blocksError) {
				console.error(
					"Something went wrong deleting section blocks:",
					blocksError,
				)
				throw new Error(blocksError.message)
			}

			const { error: sectionError } = await supabase
				.from("app_resume_sections")
				.delete()
				.eq("id", sectionId)

			if (sectionError) {
				console.error(
					"Something went wrong deleting app resume section:",
					sectionError,
				)
				throw new Error(sectionError.message)
			}
		},
		[user, applicationId],
	)

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
		saveAppResumeBlock,
		saveAppResumeSectionDisplayName,
		saveAppResumeSectionOrder,
		createAppResumeSkillCategory,
		createAppResumeSummaryBlock,
		ensureAppResumeSkillsSection,
		createAppResumeCustomSection,
		createAppResumeCustomBlock,
		deleteAppResumeBlock,
		deleteAppResumeSection,
		toForm: toApplicationDetailForm,
	}
}
