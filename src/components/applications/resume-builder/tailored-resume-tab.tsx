import { useMemo, useState } from "react"
import { Check, ChevronDown, ChevronRight, Sparkles } from "lucide-react"
import {
	formatDateRange,
	getBlockPreviewText,
	sortBlocks,
	sortSections,
} from "@/components/applications/resume-builder/app-resume-utils"
import { mockAppResume } from "@/components/applications/resume-builder/mock-app-resume"
import { Button } from "@/components/ui/button"
import type { AppResumeBlock, AppResumeSection } from "@/types/app-resume"
import { cn } from "@/lib/utils"

type TailoredBlock = AppResumeBlock & {
	is_new?: boolean
	is_removed?: boolean
}

type TailoredSection = Omit<AppResumeSection, "blocks"> & {
	blocks: TailoredBlock[]
}

const mockTailoredResume: TailoredSection[] = structuredClone(
	mockAppResume.sections,
).map((section) => {
	if (section.section_type === "summary") {
		return {
			...section,
			blocks: section.blocks.map((block) =>
				block.block_type === "rich_text" && "text" in block.content_json
					? {
							...block,
							content_json: {
								text: "Full-stack TypeScript developer with strong React, REST API, and PostgreSQL experience building production web apps for fast-moving product teams.",
							},
						}
					: block,
			),
		}
	}

	if (section.section_type === "experience") {
		return {
			...section,
			blocks: [
				...section.blocks.map((block, index) => {
					if (
						index === 1 &&
						block.block_type === "job_entry" &&
						"description" in block.content_json
					) {
						return {
							...block,
							content_json: {
								...block.content_json,
								description: [
									...block.content_json.description,
									"Shipped CI/CD improvements that cut release friction across the product team",
								],
							},
						}
					}
					return block
				}),
				{
					id: "tailored-exp-aws",
					app_resume_id: mockAppResume.id,
					section_id: section.id,
					block_type: "job_entry",
					sort_key: section.blocks.length,
					is_new: true,
					content_json: {
						title: "Platform Engineer (Contract)",
						company: "CloudOps Studio",
						start_date: "2024-06-01",
						end_date: "2024-12-01",
						description: [
							"Implemented AWS deployment workflows and GraphQL services for internal tooling",
						],
					},
					style_json: {},
					created_at: "2026-07-27T18:10:08.900000+00:00",
					updated_at: "2026-07-27T18:10:08.900000+00:00",
				},
			],
		}
	}

	if (section.section_type === "skills") {
		return {
			...section,
			blocks: [
				...section.blocks,
				{
					id: "tailored-skill-graphql",
					app_resume_id: mockAppResume.id,
					section_id: section.id,
					block_type: "skill_entry",
					sort_key: section.blocks.length,
					is_new: true,
					content_json: {
						name: "GraphQL",
						categoryId: 0,
						categoryName: "",
					},
					style_json: {},
					created_at: "2026-07-27T18:10:08.910000+00:00",
					updated_at: "2026-07-27T18:10:08.910000+00:00",
				},
				{
					id: "tailored-skill-aws",
					app_resume_id: mockAppResume.id,
					section_id: section.id,
					block_type: "skill_entry",
					sort_key: section.blocks.length + 1,
					is_new: true,
					content_json: {
						name: "AWS",
						categoryId: 0,
						categoryName: "",
					},
					style_json: {},
					created_at: "2026-07-27T18:10:08.920000+00:00",
					updated_at: "2026-07-27T18:10:08.920000+00:00",
				},
			],
		}
	}

	return section
})

interface TailoredResumeTabProps {
	appliedBlockKeys: string[]
	onAppliedKeysChange: (keys: string[]) => void
}

export function TailoredResumeTab({
	appliedBlockKeys,
	onAppliedKeysChange,
}: TailoredResumeTabProps) {
	const [workingResume, setWorkingResume] = useState(() =>
		structuredClone(mockAppResume.sections),
	)
	const [keywordsOpen, setKeywordsOpen] = useState(true)
	const score = 61 + Math.min(23, appliedBlockKeys.length * 8)

	const originalById = useMemo(() => {
		const map = new Map<string, AppResumeBlock>()
		for (const section of mockAppResume.sections) {
			for (const block of section.blocks) map.set(block.id, block)
		}
		return map
	}, [])

	const actionableKeys = useMemo(() => {
		const keys: string[] = []
		for (const section of mockTailoredResume) {
			for (const block of section.blocks) {
				const original = originalById.get(block.id)
				const changed =
					block.is_new ||
					block.is_removed ||
					(original &&
						JSON.stringify(original.content_json) !==
							JSON.stringify(block.content_json))
				if (changed) keys.push(block.id)
			}
		}
		return keys
	}, [originalById])

	function applyBlock(blockId: string) {
		const tailoredBlock = mockTailoredResume
			.flatMap((section) => section.blocks)
			.find((block) => block.id === blockId)
		if (!tailoredBlock) return

		setWorkingResume((prev) =>
			prev.map((section) => {
				if (section.id !== tailoredBlock.section_id) return section

				if (tailoredBlock.is_removed) {
					return {
						...section,
						blocks: section.blocks.filter((block) => block.id !== blockId),
					}
				}

				const exists = section.blocks.some((block) => block.id === blockId)
				if (exists) {
					return {
						...section,
						blocks: section.blocks.map((block) =>
							block.id === blockId
								? {
										...tailoredBlock,
										is_new: false,
										is_removed: false,
									}
								: block,
						),
					}
				}

				return {
					...section,
					blocks: [
						...section.blocks,
						{
							...tailoredBlock,
							is_new: false,
							is_removed: false,
						},
					],
				}
			}),
		)

		if (!appliedBlockKeys.includes(blockId)) {
			onAppliedKeysChange([...appliedBlockKeys, blockId])
		}
	}

	function handleReplaceAll() {
		const confirmed = window.confirm(
			"Replace all tailored suggestions into your working resume?",
		)
		if (!confirmed) return
		for (const key of actionableKeys) applyBlock(key)
		onAppliedKeysChange([...actionableKeys])
	}

	return (
		<div className="flex min-h-0 flex-1 flex-col xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,260px)]">
			<section className="relative flex min-h-[min(480px,60dvh)] min-w-0 flex-1 flex-col bg-neutral-100/90 xl:min-h-0">
				<div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 bg-white px-3 py-2.5 sm:gap-3 sm:px-4">
					<p className="text-sm font-medium text-neutral-600">
						Review AI changes, then replace what you want to keep.
					</p>
					<Button
						type="button"
						size="sm"
						className="gap-2"
						onClick={handleReplaceAll}
					>
						<Sparkles className="size-3.5" aria-hidden />
						Replace All
					</Button>
				</div>
				<div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
					<article className="mx-auto min-h-[640px] w-full max-w-[720px] rounded-sm bg-white px-6 py-8 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_12px_40px_rgba(0,0,0,0.08)] sm:px-8 sm:py-10 lg:px-10">
						{sortSections(mockTailoredResume).map((section) => (
							<div key={section.id} className="mb-6">
								{section.section_type !== "header" ? (
									<h2 className="mb-2 border-b border-neutral-300 pb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-neutral-700">
										{section.display_name}
									</h2>
								) : null}
								{sortBlocks(section.blocks).map((block) => {
									const original = originalById.get(block.id)
									const changed =
										block.is_new ||
										block.is_removed ||
										(original &&
											JSON.stringify(original.content_json) !==
												JSON.stringify(block.content_json))
									const applied = appliedBlockKeys.includes(block.id)
									return (
										<div key={block.id} className="mb-3">
											{changed && original && !block.is_new ? (
												<p className="mb-1 px-1 text-[13px] leading-relaxed text-neutral-400 line-through">
													{getBlockPreviewText(original)}
												</p>
											) : null}
											{!block.is_removed ? (
												<div
													className={cn(
														"rounded px-1 py-0.5",
														changed && !applied && "bg-emerald-50",
													)}
												>
													<TailoredBlockPreview block={block} />
												</div>
											) : null}
											{changed ? (
												<div className="mt-1 mb-2 flex flex-wrap items-center gap-2 px-1">
													{block.is_new ? (
														<span className="rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-800">
															AI added
														</span>
													) : null}
													{block.is_removed ? (
														<span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
															AI suggests removing
														</span>
													) : null}
													{applied ? (
														<span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
															<Check className="size-3" aria-hidden />
															Applied
														</span>
													) : (
														<Button
															type="button"
															size="sm"
															variant="outline"
															onClick={() => applyBlock(block.id)}
														>
															Replace
														</Button>
													)}
												</div>
											) : null}
										</div>
									)
								})}
							</div>
						))}
					</article>
				</div>
			</section>

			<aside className="shrink-0 overflow-y-auto border-t border-neutral-200 bg-white xl:max-h-none xl:border-t-0 xl:border-l">
				<div className="space-y-4 p-4">
					<div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-4 text-center">
						<p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
							Resume Score
						</p>
						<p className="mt-3 font-display text-4xl font-semibold tabular-nums text-neutral-900">
							{score}
							<span className="text-base text-neutral-500"> / 100</span>
						</p>
						<p className="mt-2 text-sm text-neutral-600">
							{actionableKeys.length -
								appliedBlockKeys.filter((key) =>
									actionableKeys.includes(key),
								).length}{" "}
							suggestions left
						</p>
					</div>
					<Button type="button" className="w-full gap-2" onClick={handleReplaceAll}>
						<Sparkles className="size-4" aria-hidden />
						Replace All
					</Button>
					<div className="rounded-xl border border-neutral-200">
						<button
							type="button"
							className="flex w-full items-center justify-between px-3 py-2.5 text-left"
							onClick={() => setKeywordsOpen((prev) => !prev)}
						>
							<span className="text-sm font-semibold text-neutral-800">
								Working resume snapshot
							</span>
							{keywordsOpen ? (
								<ChevronDown className="size-4 text-neutral-400" />
							) : (
								<ChevronRight className="size-4 text-neutral-400" />
							)}
						</button>
						{keywordsOpen ? (
							<div className="border-t border-neutral-100 px-3 py-3 text-xs leading-relaxed text-neutral-600">
								Your working resume now has{" "}
								{workingResume.reduce(
									(sum, section) => sum + section.blocks.length,
									0,
								)}{" "}
								blocks after applied replacements.
							</div>
						) : null}
					</div>
				</div>
			</aside>
		</div>
	)
}

function TailoredBlockPreview({ block }: { block: TailoredBlock }) {
	const content = block.content_json

	if (block.block_type === "rich_text" && "text" in content) {
		return (
			<p
				className={cn(
					"text-[13.5px] leading-relaxed text-neutral-800",
					block.sort_key === 0 &&
						block.style_json.fontSize &&
						block.style_json.fontSize >= 16 &&
						"font-display text-3xl font-semibold tracking-tight text-neutral-900",
					block.style_json.bold && block.style_json.fontSize === 12 &&
						"text-sm font-semibold text-neutral-700",
				)}
			>
				{content.text}
			</p>
		)
	}

	if (block.block_type === "group_text" && "texts" in content) {
		return (
			<p className="text-sm text-neutral-600">
				{content.texts.map((item) => item.text).join(" ")}
			</p>
		)
	}

	if (block.block_type === "job_entry" && "title" in content) {
		return (
			<div className="space-y-1">
				<div className="flex flex-wrap items-baseline justify-between gap-2">
					<p className="text-sm font-semibold text-neutral-900">
						{content.title}
						<span className="font-normal text-neutral-600">
							{" "}
							— {content.company}
						</span>
					</p>
					<p className="text-xs text-neutral-500">
						{formatDateRange(content.start_date, content.end_date)}
					</p>
				</div>
				<ul className="space-y-0.5">
					{content.description.map((line) => (
						<li
							key={line}
							className="flex gap-2 text-[13px] leading-relaxed text-neutral-800"
						>
							<span aria-hidden>•</span>
							<span>{line}</span>
						</li>
					))}
				</ul>
			</div>
		)
	}

	if (block.block_type === "education_entry" && "school" in content) {
		return (
			<div className="flex flex-wrap items-baseline justify-between gap-2">
				<div>
					<p className="text-sm font-semibold text-neutral-900">
						{content.degree}
					</p>
					<p className="text-sm text-neutral-600">{content.school}</p>
				</div>
				<p className="text-xs text-neutral-500">
					{formatDateRange(content.start_date, content.end_date)}
				</p>
			</div>
		)
	}

	if (block.block_type === "skill_entry" && "name" in content) {
		return (
			<span className="mr-1.5 inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-800">
				{content.name}
			</span>
		)
	}

	return (
		<p className="text-sm text-neutral-500">{getBlockPreviewText(block)}</p>
	)
}
