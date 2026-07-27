import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast"
import {
	createLocalId,
	defaultBlockTypeForSection,
	estimateMatchScore,
	flattenAppResumeText,
	sortByOrder,
} from "@/lib/app-resume"
import { env } from "@/lib/env"
import { supabase } from "@/lib/supabase"
import type {
	AppResume,
	AppResumeBlock,
	AppResumeBlockType,
	AppResumeSection,
	AppResumeSectionType,
	AppResumeVersion,
	TailorAppResumeResponse,
	TailoredBlockPayload,
} from "@/types/app-resume"

interface UseAppResumeOptions {
	applicationId: string
	jobDescription: string
	jobTitle: string
	companyName: string
	seedProfile?: {
		fullName?: string | null
		email?: string | null
		phone?: string | null
		location?: string | null
		summary?: string | null
		experiences?: Array<{
			title: string
			company: string
			bullets: string[]
		}>
		skills?: string[]
	}
}

type SectionRow = Omit<AppResumeSection, "blocks">
type BlockRow = AppResumeBlock

function nestResume(
	resume: Omit<AppResume, "sections">,
	sections: SectionRow[],
	blocks: BlockRow[],
): AppResume {
	const blocksBySection = new Map<string, AppResumeBlock[]>()
	for (const block of blocks) {
		const list = blocksBySection.get(block.app_resume_section_id) ?? []
		list.push(block)
		blocksBySection.set(block.app_resume_section_id, list)
	}

	return {
		...resume,
		sections: sortByOrder(
			sections.map((section) => ({
				...section,
				blocks: sortByOrder(blocksBySection.get(section.id) ?? []),
			})),
		),
	}
}

async function fetchVersionTree(
	applicationId: string,
	version: AppResumeVersion,
): Promise<AppResume | null> {
	const { data: resume, error } = await supabase
		.from("app_resume")
		.select("*")
		.eq("application_id", applicationId)
		.eq("version", version)
		.maybeSingle()

	if (error) {
		console.error("Something went wrong loading app_resume:", error)
		throw error
	}
	if (!resume) return null

	const { data: sections, error: sectionsError } = await supabase
		.from("app_resume_section")
		.select("*")
		.eq("app_resume_id", resume.id)
		.order("order", { ascending: true })

	if (sectionsError) {
		console.error("Something went wrong loading sections:", sectionsError)
		throw sectionsError
	}

	const sectionIds = (sections ?? []).map((section) => section.id)
	let blocks: BlockRow[] = []
	if (sectionIds.length > 0) {
		const { data: blockRows, error: blocksError } = await supabase
			.from("app_resume_block")
			.select("*")
			.in("app_resume_section_id", sectionIds)
			.order("order", { ascending: true })

		if (blocksError) {
			console.error("Something went wrong loading blocks:", blocksError)
			throw blocksError
		}
		blocks = (blockRows ?? []) as BlockRow[]
	}

	return nestResume(
		resume as Omit<AppResume, "sections">,
		(sections ?? []) as SectionRow[],
		blocks,
	)
}

export function useAppResume({
	applicationId,
	jobDescription,
	jobTitle,
	companyName,
	seedProfile,
}: UseAppResumeOptions) {
	const [original, setOriginal] = useState<AppResume | null>(null)
	const [tailored, setTailored] = useState<AppResume | null>(null)
	const [loading, setLoading] = useState(true)
	const [generating, setGenerating] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const originalRef = useRef<AppResume | null>(null)

	useEffect(() => {
		originalRef.current = original
	}, [original])

	const reload = useCallback(async () => {
		if (!applicationId) return
		setError(null)
		setLoading(true)
		try {
			const [nextOriginal, nextTailored] = await Promise.all([
				fetchVersionTree(applicationId, "original"),
				fetchVersionTree(applicationId, "tailored"),
			])
			setOriginal(nextOriginal)
			setTailored(nextTailored)
		} catch (err) {
			console.error("Something went wrong reloading app resumes:", err)
			setError(err instanceof Error ? err.message : "Failed to load resumes")
		} finally {
			setLoading(false)
		}
	}, [applicationId])

	const ensureOriginal = useCallback(async () => {
		if (!applicationId) return null
		const existing = await fetchVersionTree(applicationId, "original")
		if (existing) {
			setOriginal(existing)
			return existing
		}

		const { data: resume, error: resumeError } = await supabase
			.from("app_resume")
			.insert({
				application_id: applicationId,
				version: "original",
				score: null,
			})
			.select("*")
			.single()

		if (resumeError) {
			console.error("Something went wrong creating original resume:", resumeError)
			throw resumeError
		}

		const sectionPayloads: Array<{
			app_resume_id: string
			section_key: string
			type: AppResumeSectionType
			title: string | null
			order: number
			blocks: Array<{
				block_key: string
				type: AppResumeBlockType
				content: string
				order: number
			}>
		}> = []

		const headerKey = createLocalId()
		sectionPayloads.push({
			app_resume_id: resume.id,
			section_key: headerKey,
			type: "header",
			title: "Header",
			order: 0,
			blocks: [
				{
					block_key: createLocalId(),
					type: "contact_line",
					content: seedProfile?.fullName?.trim() || "Your Name",
					order: 0,
				},
				{
					block_key: createLocalId(),
					type: "contact_line",
					content: seedProfile?.email?.trim() || "you@example.com",
					order: 1,
				},
				{
					block_key: createLocalId(),
					type: "contact_line",
					content: seedProfile?.phone?.trim() || "",
					order: 2,
				},
				{
					block_key: createLocalId(),
					type: "contact_line",
					content: seedProfile?.location?.trim() || "",
					order: 3,
				},
			].filter((block) => block.content.length > 0 || block.order < 2),
		})

		const summaryKey = createLocalId()
		sectionPayloads.push({
			app_resume_id: resume.id,
			section_key: summaryKey,
			type: "summary",
			title: "Summary",
			order: 1,
			blocks: [
				{
					block_key: createLocalId(),
					type: "text",
					content:
						seedProfile?.summary?.trim() ||
						"Write a short professional summary tailored to the roles you want.",
					order: 0,
				},
			],
		})

		const experiences = seedProfile?.experiences?.length
			? seedProfile.experiences
			: [
					{
						title: "Role title",
						company: "Company",
						bullets: [
							"Describe a measurable impact you delivered.",
							"Highlight a tool or process you owned.",
							"Add another achievement with concrete detail.",
						],
					},
				]

		experiences.forEach((experience, index) => {
			sectionPayloads.push({
				app_resume_id: resume.id,
				section_key: createLocalId(),
				type: "experience_entry",
				title: `${experience.title} · ${experience.company}`,
				order: 2 + index,
				blocks: [
					{
						block_key: createLocalId(),
						type: "heading",
						content: `${experience.title} · ${experience.company}`,
						order: 0,
					},
					...experience.bullets.map((bullet, bulletIndex) => ({
						block_key: createLocalId(),
						type: "bullet" as const,
						content: bullet,
						order: bulletIndex + 1,
					})),
				],
			})
		})

		const skills = seedProfile?.skills?.length
			? seedProfile.skills
			: ["Communication", "Problem solving", "Collaboration"]

		sectionPayloads.push({
			app_resume_id: resume.id,
			section_key: createLocalId(),
			type: "skills",
			title: "Skills",
			order: 2 + experiences.length,
			blocks: skills.map((skill, index) => ({
				block_key: createLocalId(),
				type: "bullet" as const,
				content: skill,
				order: index,
			})),
		})

		for (const section of sectionPayloads) {
			const { data: sectionRow, error: sectionError } = await supabase
				.from("app_resume_section")
				.insert({
					app_resume_id: section.app_resume_id,
					section_key: section.section_key,
					type: section.type,
					title: section.title,
					order: section.order,
				})
				.select("*")
				.single()

			if (sectionError) {
				console.error("Something went wrong creating section:", sectionError)
				throw sectionError
			}

			const { error: blocksError } = await supabase.from("app_resume_block").insert(
				section.blocks.map((block) => ({
					app_resume_section_id: sectionRow.id,
					block_key: block.block_key,
					type: block.type,
					content: block.content,
					order: block.order,
					is_new: false,
					is_removed: false,
					is_hidden: false,
				})),
			)

			if (blocksError) {
				console.error("Something went wrong creating blocks:", blocksError)
				throw blocksError
			}
		}

		const created = await fetchVersionTree(applicationId, "original")
		if (created && jobDescription.trim()) {
			const score = estimateMatchScore(
				flattenAppResumeText(created),
				jobDescription,
			)
			await supabase
				.from("app_resume")
				.update({ score, updated_at: new Date().toISOString() })
				.eq("id", created.id)
			created.score = score
		}
		setOriginal(created)
		return created
	}, [applicationId, jobDescription, seedProfile])

	useEffect(() => {
		void (async () => {
			setLoading(true)
			try {
				await ensureOriginal()
				const nextTailored = await fetchVersionTree(applicationId, "tailored")
				setTailored(nextTailored)
			} catch (err) {
				console.error("Something went wrong initializing app resume:", err)
				setError(err instanceof Error ? err.message : "Failed to load resume")
			} finally {
				setLoading(false)
			}
		})()
	}, [applicationId, ensureOriginal])

	const updateBlockContent = useCallback(
		async (blockId: string, content: string) => {
			setOriginal((prev) => {
				if (!prev) return prev
				return {
					...prev,
					sections: prev.sections.map((section) => ({
						...section,
						blocks: section.blocks.map((block) =>
							block.id === blockId
								? {
										...block,
										content,
										updated_at: new Date().toISOString(),
									}
								: block,
						),
					})),
				}
			})

			const { error: updateError } = await supabase
				.from("app_resume_block")
				.update({
					content,
					updated_at: new Date().toISOString(),
				})
				.eq("id", blockId)

			if (updateError) {
				console.error("Something went wrong saving block:", updateError)
				toast.error("Could not save block")
				await reload()
			}
		},
		[reload],
	)

	const addBlock = useCallback(
		async (sectionId: string, type?: AppResumeBlockType) => {
			if (!original) return
			const section = original.sections.find((item) => item.id === sectionId)
			if (!section) return
			const nextOrder =
				section.blocks.reduce((max, block) => Math.max(max, block.order), -1) + 1
			const payload = {
				app_resume_section_id: sectionId,
				block_key: createLocalId(),
				type: type ?? defaultBlockTypeForSection(section.type),
				content: "",
				order: nextOrder,
				is_new: false,
				is_removed: false,
				is_hidden: false,
			}
			const { data, error: insertError } = await supabase
				.from("app_resume_block")
				.insert(payload)
				.select("*")
				.single()
			if (insertError) {
				console.error("Something went wrong adding block:", insertError)
				toast.error("Could not add block")
				return
			}
			setOriginal((prev) => {
				if (!prev) return prev
				return {
					...prev,
					sections: prev.sections.map((item) =>
						item.id === sectionId
							? {
									...item,
									blocks: sortByOrder([...item.blocks, data as AppResumeBlock]),
								}
							: item,
					),
				}
			})
		},
		[original],
	)

	const addSection = useCallback(
		async (type: AppResumeSectionType = "custom") => {
			if (!original) return
			const nextOrder =
				original.sections.reduce((max, section) => Math.max(max, section.order), -1) +
				1
			const { data: section, error: sectionError } = await supabase
				.from("app_resume_section")
				.insert({
					app_resume_id: original.id,
					section_key: createLocalId(),
					type,
					title: type === "custom" ? "Custom section" : null,
					order: nextOrder,
				})
				.select("*")
				.single()
			if (sectionError) {
				console.error("Something went wrong adding section:", sectionError)
				toast.error("Could not add section")
				return
			}
			const { data: block, error: blockError } = await supabase
				.from("app_resume_block")
				.insert({
					app_resume_section_id: section.id,
					block_key: createLocalId(),
					type: defaultBlockTypeForSection(type),
					content: "",
					order: 0,
				})
				.select("*")
				.single()
			if (blockError) {
				console.error("Something went wrong seeding section block:", blockError)
				toast.error("Could not add section")
				return
			}
			setOriginal((prev) => {
				if (!prev) return prev
				return {
					...prev,
					sections: sortByOrder([
						...prev.sections,
						{
							...(section as SectionRow),
							blocks: [block as AppResumeBlock],
						},
					]),
				}
			})
		},
		[original],
	)

	const reorderSection = useCallback(
		async (sectionId: string, direction: -1 | 1) => {
			if (!original) return
			const ordered = sortByOrder(original.sections)
			const index = ordered.findIndex((section) => section.id === sectionId)
			const swapIndex = index + direction
			if (index < 0 || swapIndex < 0 || swapIndex >= ordered.length) return
			const next = [...ordered]
			const temp = next[index]
			next[index] = next[swapIndex]
			next[swapIndex] = temp
			const withOrders = next.map((section, order) => ({ ...section, order }))
			setOriginal((prev) => (prev ? { ...prev, sections: withOrders } : prev))
			await Promise.all(
				withOrders.map((section) =>
					supabase
						.from("app_resume_section")
						.update({
							order: section.order,
							updated_at: new Date().toISOString(),
						})
						.eq("id", section.id),
				),
			)
		},
		[original],
	)

	const reorderBlock = useCallback(
		async (sectionId: string, blockId: string, direction: -1 | 1) => {
			if (!original) return
			const section = original.sections.find((item) => item.id === sectionId)
			if (!section) return
			const ordered = sortByOrder(section.blocks)
			const index = ordered.findIndex((block) => block.id === blockId)
			const swapIndex = index + direction
			if (index < 0 || swapIndex < 0 || swapIndex >= ordered.length) return
			const next = [...ordered]
			const temp = next[index]
			next[index] = next[swapIndex]
			next[swapIndex] = temp
			const withOrders = next.map((block, order) => ({ ...block, order }))
			setOriginal((prev) => {
				if (!prev) return prev
				return {
					...prev,
					sections: prev.sections.map((item) =>
						item.id === sectionId ? { ...item, blocks: withOrders } : item,
					),
				}
			})
			await Promise.all(
				withOrders.map((block) =>
					supabase
						.from("app_resume_block")
						.update({
							order: block.order,
							updated_at: new Date().toISOString(),
						})
						.eq("id", block.id),
				),
			)
		},
		[original],
	)

	const applyTailoredBlock = useCallback(
		async (
			blockKey: string,
			options?: { silent?: boolean },
		) => {
			const currentOriginal = originalRef.current
			if (!currentOriginal || !tailored) return
			const tailoredBlock = tailored.sections
				.flatMap((section) =>
					section.blocks.map((block) => ({ section, block })),
				)
				.find((item) => item.block.block_key === blockKey)
			if (!tailoredBlock) return

			const originalBlock = currentOriginal.sections
				.flatMap((section) => section.blocks)
				.find((block) => block.block_key === blockKey)

			if (tailoredBlock.block.is_removed && originalBlock) {
				await supabase
					.from("app_resume_block")
					.update({
						is_hidden: true,
						updated_at: new Date().toISOString(),
					})
					.eq("id", originalBlock.id)
			} else if (originalBlock) {
				await supabase
					.from("app_resume_block")
					.update({
						content: tailoredBlock.block.content,
						is_hidden: false,
						updated_at: new Date().toISOString(),
					})
					.eq("id", originalBlock.id)
			} else {
				let targetSection = currentOriginal.sections.find(
					(section) =>
						section.section_key === tailoredBlock.section.section_key,
				)
				if (!targetSection) {
					const nextOrder =
						currentOriginal.sections.reduce(
							(max, section) => Math.max(max, section.order),
							-1,
						) + 1
					const { data: section, error: sectionError } = await supabase
						.from("app_resume_section")
						.insert({
							app_resume_id: currentOriginal.id,
							section_key: tailoredBlock.section.section_key,
							type: tailoredBlock.section.type,
							title: tailoredBlock.section.title,
							order: nextOrder,
						})
						.select("*")
						.single()
					if (sectionError) {
						console.error(
							"Something went wrong inserting section:",
							sectionError,
						)
						if (!options?.silent) toast.error("Could not apply block")
						return
					}
					targetSection = { ...(section as SectionRow), blocks: [] }
				}
				await supabase.from("app_resume_block").insert({
					app_resume_section_id: targetSection.id,
					block_key: tailoredBlock.block.block_key,
					type: tailoredBlock.block.type,
					content: tailoredBlock.block.content,
					order: tailoredBlock.block.order,
					is_new: false,
					is_removed: false,
					is_hidden: false,
				})
			}

			const refreshed = await fetchVersionTree(applicationId, "original")
			if (!refreshed) return
			originalRef.current = refreshed

			if (options?.silent) {
				setOriginal(refreshed)
				return
			}

			const nextScore = estimateMatchScore(
				flattenAppResumeText(refreshed),
				jobDescription,
			)
			const previousScore = refreshed.score
			await supabase
				.from("app_resume")
				.update({
					score: nextScore,
					updated_at: new Date().toISOString(),
				})
				.eq("id", refreshed.id)
			refreshed.score = nextScore
			originalRef.current = refreshed
			setOriginal(refreshed)
			if (previousScore != null) {
				toast.success(`Score updated: ${previousScore} → ${nextScore}`)
			} else {
				toast.success(`Score updated: ${nextScore}`)
			}
		},
		[applicationId, jobDescription, tailored],
	)

	const replaceBlockFromTailored = useCallback(
		async (blockKey: string) => {
			await applyTailoredBlock(blockKey)
		},
		[applyTailoredBlock],
	)

	const replaceAllFromTailored = useCallback(async () => {
		if (!original || !tailored) return null
		const snapshot = structuredClone(original)
		const tailoredBlocks = tailored.sections.flatMap((section) => section.blocks)
		for (const block of tailoredBlocks) {
			await applyTailoredBlock(block.block_key, { silent: true })
		}
		const refreshed = await fetchVersionTree(applicationId, "original")
		if (refreshed) {
			const nextScore = estimateMatchScore(
				flattenAppResumeText(refreshed),
				jobDescription,
			)
			const previousScore = snapshot.score
			await supabase
				.from("app_resume")
				.update({
					score: nextScore,
					updated_at: new Date().toISOString(),
				})
				.eq("id", refreshed.id)
			refreshed.score = nextScore
			setOriginal(refreshed)
			if (previousScore != null) {
				toast.success(`Score updated: ${previousScore} → ${nextScore}`)
			} else {
				toast.success(`Score updated: ${nextScore}`)
			}
		}
		return snapshot
	}, [applyTailoredBlock, applicationId, jobDescription, original, tailored])

	const restoreOriginalSnapshot = useCallback(
		async (snapshot: AppResume) => {
			for (const section of snapshot.sections) {
				for (const block of section.blocks) {
					await supabase
						.from("app_resume_block")
						.update({
							content: block.content,
							is_hidden: block.is_hidden,
							order: block.order,
							updated_at: new Date().toISOString(),
						})
						.eq("id", block.id)
				}
			}
			await supabase
				.from("app_resume")
				.update({
					score: snapshot.score,
					updated_at: new Date().toISOString(),
				})
				.eq("id", snapshot.id)
			setOriginal(snapshot)
			toast.success("Undo complete — original resume restored")
		},
		[],
	)

	const generateTailored = useCallback(async () => {
		if (!original) {
			toast.error("Create your resume first")
			return false
		}
		if (!jobDescription.trim()) {
			toast.error("Add a job description before generating")
			return false
		}

		setGenerating(true)
		setError(null)
		try {
			const payload = {
				applicationId,
				jobTitle,
				companyName,
				jobDescription,
				original: {
					id: original.id,
					score: original.score,
					sections: original.sections.map((section) => ({
						section_key: section.section_key,
						type: section.type,
						title: section.title,
						order: section.order,
						blocks: section.blocks
							.filter((block) => !block.is_hidden)
							.map((block) => ({
								block_key: block.block_key,
								type: block.type,
								content: block.content,
								order: block.order,
							})),
					})),
				},
			}

			const { data, error: invokeError } = await supabase.functions.invoke(
				"tailor-app-resume",
				{
					body: payload,
					headers: {
						"Content-Type": "application/json",
						"X-Secret-Key": env.xsecretkey!,
					},
				},
			)

			let result: TailorAppResumeResponse | null = null
			if (!invokeError && data && !data.error && Array.isArray(data.blocks)) {
				result = data as TailorAppResumeResponse
			} else {
				console.warn(
					"tailor-app-resume unavailable or invalid; using local tailor fallback",
					invokeError ?? data,
				)
				result = buildLocalTailorFallback(original, jobDescription)
			}

			if (!result?.blocks?.length) {
				throw new Error("Malformed tailored resume response")
			}

			const existingTailored = await fetchVersionTree(applicationId, "tailored")
			if (existingTailored) {
				const { error: deleteError } = await supabase
					.from("app_resume")
					.delete()
					.eq("id", existingTailored.id)
				if (deleteError) {
					console.error("Something went wrong clearing tailored resume:", deleteError)
					throw deleteError
				}
			}

			const { data: tailoredResume, error: insertResumeError } = await supabase
				.from("app_resume")
				.insert({
					application_id: applicationId,
					version: "tailored",
					score: result.score,
				})
				.select("*")
				.single()

			if (insertResumeError) {
				console.error("Something went wrong creating tailored resume:", insertResumeError)
				throw insertResumeError
			}

			await persistTailoredTree(tailoredResume.id, result.blocks)

			const nextTailored = await fetchVersionTree(applicationId, "tailored")
			setTailored(nextTailored)
			toast.success("Tailored resume ready")
			return true
		} catch (err) {
			console.error("Something went wrong generating tailored resume:", err)
			const message =
				err instanceof Error ? err.message : "Failed to generate tailored resume"
			setError(message)
			toast.error(message)
			return false
		} finally {
			setGenerating(false)
		}
	}, [
		applicationId,
		companyName,
		jobDescription,
		jobTitle,
		original,
	])

	return {
		original,
		tailored,
		loading,
		generating,
		error,
		reload,
		updateBlockContent,
		addBlock,
		addSection,
		reorderSection,
		reorderBlock,
		replaceBlockFromTailored,
		replaceAllFromTailored,
		restoreOriginalSnapshot,
		generateTailored,
	}
}

async function persistTailoredTree(
	appResumeId: string,
	blocks: TailoredBlockPayload[],
) {
	const sectionMap = new Map<
		string,
		{
			section_key: string
			type: AppResumeSectionType
			title: string | null
			order: number
			blocks: TailoredBlockPayload[]
		}
	>()

	for (const block of blocks) {
		const existing = sectionMap.get(block.section_key)
		if (existing) {
			existing.blocks.push(block)
			continue
		}
		sectionMap.set(block.section_key, {
			section_key: block.section_key,
			type: block.section_type,
			title: block.section_title ?? null,
			order: block.section_order ?? 0,
			blocks: [block],
		})
	}

	for (const section of [...sectionMap.values()].sort((a, b) => a.order - b.order)) {
		const { data: sectionRow, error: sectionError } = await supabase
			.from("app_resume_section")
			.insert({
				app_resume_id: appResumeId,
				section_key: section.section_key,
				type: section.type,
				title: section.title,
				order: section.order,
			})
			.select("*")
			.single()

		if (sectionError) {
			console.error("Something went wrong saving tailored section:", sectionError)
			throw sectionError
		}

		const { error: blocksError } = await supabase.from("app_resume_block").insert(
			sortByOrder(section.blocks).map((block) => ({
				app_resume_section_id: sectionRow.id,
				block_key: block.block_key,
				type: block.type,
				content: block.content,
				order: block.order,
				is_new: Boolean(block.is_new),
				is_removed: Boolean(block.is_removed),
				is_hidden: false,
			})),
		)

		if (blocksError) {
			console.error("Something went wrong saving tailored blocks:", blocksError)
			throw blocksError
		}
	}
}

function buildLocalTailorFallback(
	original: AppResume,
	jobDescription: string,
): TailorAppResumeResponse {
	const keywords = jobDescription
		.toLowerCase()
		.match(/[a-z][a-z0-9+.#-]{3,}/g)
		?.slice(0, 6) ?? ["impact", "collaboration"]
	const keywordHint = keywords.slice(0, 2).join(" and ")
	const blocks: TailoredBlockPayload[] = []
	let removedOnce = false
	let addedOnce = false

	for (const section of sortByOrder(original.sections)) {
		for (const block of sortByOrder(section.blocks)) {
			if (
				!removedOnce &&
				block.type === "bullet" &&
				block.content.length < 40
			) {
				removedOnce = true
				blocks.push({
					block_key: block.block_key,
					section_key: section.section_key,
					section_type: section.type,
					section_title: section.title,
					section_order: section.order,
					type: block.type,
					content: block.content,
					order: block.order,
					is_removed: true,
				})
				continue
			}

			const rewritten =
				block.type === "bullet" || block.type === "text"
					? `${block.content.replace(/\.$/, "")}, aligned to ${keywordHint}.`
					: block.content

			blocks.push({
				block_key: block.block_key,
				section_key: section.section_key,
				section_type: section.type,
				section_title: section.title,
				section_order: section.order,
				type: block.type,
				content: rewritten,
				order: block.order,
			})
		}

		if (!addedOnce && section.type === "experience_entry") {
			addedOnce = true
			blocks.push({
				block_key: createLocalId(),
				section_key: section.section_key,
				section_type: section.type,
				section_title: section.title,
				section_order: section.order,
				type: "bullet",
				content: `Delivered measurable results connected to ${keywordHint} for stakeholders.`,
				order:
					section.blocks.reduce((max, block) => Math.max(max, block.order), -1) +
					1,
				is_new: true,
			})
		}
	}

	const score = estimateMatchScore(
		blocks
			.filter((block) => !block.is_removed)
			.map((block) => block.content)
			.join("\n"),
		jobDescription,
	)

	return { score, blocks }
}
