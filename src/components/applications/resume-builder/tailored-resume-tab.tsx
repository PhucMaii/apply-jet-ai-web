import { useMemo, useState } from "react"
import { Check, ChevronDown, ChevronRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type BlockType =
	| "heading"
	| "subheading"
	| "bullet"
	| "text"
	| "date_range"
	| "contact_line"

interface MockBlock {
	id: string
	blockKey: string
	type: BlockType
	content: string
	order: number
	isNew?: boolean
	isRemoved?: boolean
}

interface MockSection {
	id: string
	sectionKey: string
	type:
		| "header"
		| "summary"
		| "experience_entry"
		| "education_entry"
		| "skills"
		| "projects"
	title: string
	order: number
	blocks: MockBlock[]
}

const mockOriginalResume: MockSection[] = [
	{
		id: "sec-1",
		sectionKey: "key-header",
		type: "header",
		title: "Resume Header",
		order: 0,
		blocks: [
			{
				id: "b-1",
				blockKey: "k-name",
				type: "heading",
				content: "Phuc Mai",
				order: 0,
			},
			{
				id: "b-2",
				blockKey: "k-contact",
				type: "contact_line",
				content:
					"New Westminster, BC | (431) 289-0132 | maithienphuc0102@gmail.com",
				order: 1,
			},
		],
	},
	{
		id: "sec-2",
		sectionKey: "key-summary",
		type: "summary",
		title: "Professional Summary",
		order: 1,
		blocks: [
			{
				id: "b-3",
				blockKey: "k-summary",
				type: "text",
				content:
					"Full-stack developer with 3 years of experience building scalable web applications, from internal ERP tooling to customer-facing e-commerce systems.",
				order: 0,
			},
		],
	},
	{
		id: "sec-3",
		sectionKey: "key-exp-1",
		type: "experience_entry",
		title: "Supreme Sprouts Ltd. — Software Developer",
		order: 2,
		blocks: [
			{
				id: "b-4",
				blockKey: "k-exp1-date",
				type: "date_range",
				content: "January 2023 - January 2026",
				order: 0,
			},
			{
				id: "b-5",
				blockKey: "k-exp1-b1",
				type: "bullet",
				content:
					"Developed a full-stack system consolidating order processing, inventory tracking, payment handling, and delivery logistics.",
				order: 1,
			},
			{
				id: "b-6",
				blockKey: "k-exp1-b2",
				type: "bullet",
				content:
					"Revamped the order page from a multi-input form to a visual grid, converting 55% of users from phone orders to in-app orders.",
				order: 2,
			},
			{
				id: "b-7",
				blockKey: "k-exp1-b3",
				type: "bullet",
				content:
					"Integrated payment and inventory systems into a single app, saving the team 6+ hours per week.",
				order: 3,
			},
			{
				id: "b-8",
				blockKey: "k-exp1-b4",
				type: "bullet",
				content:
					"Built automated order reminders via cron job, reducing missed orders by 88%.",
				order: 4,
			},
		],
	},
	{
		id: "sec-4",
		sectionKey: "key-exp-2",
		type: "experience_entry",
		title: "Trade and Track — Intern Full Stack Developer",
		order: 3,
		blocks: [
			{
				id: "b-9",
				blockKey: "k-exp2-date",
				type: "date_range",
				content: "December 2023 - February 2024",
				order: 0,
			},
			{
				id: "b-10",
				blockKey: "k-exp2-b1",
				type: "bullet",
				content:
					"Designed dark/light theme mode using MUI theme config with React.js.",
				order: 1,
			},
			{
				id: "b-11",
				blockKey: "k-exp2-b2",
				type: "bullet",
				content:
					"Built a month-view calendar using the full-calendar library, integrated with a custom trade-results API.",
				order: 2,
			},
			{
				id: "b-12",
				blockKey: "k-exp2-b3",
				type: "bullet",
				content:
					"Optimized and restructured API code with Next.js and Prisma.",
				order: 3,
			},
		],
	},
	{
		id: "sec-5",
		sectionKey: "key-skills",
		type: "skills",
		title: "Skills",
		order: 4,
		blocks: [
			{
				id: "b-13",
				blockKey: "k-skills",
				type: "text",
				content:
					"React, TypeScript, Node.js, Next.js, Prisma, PostgreSQL, Supabase, PocketBase",
				order: 0,
			},
		],
	},
]

const mockTailoredResume: MockSection[] = [
	{
		id: "t-sec-1",
		sectionKey: "key-header",
		type: "header",
		title: "Resume Header",
		order: 0,
		blocks: [
			{
				id: "t-b-1",
				blockKey: "k-name",
				type: "heading",
				content: "Phuc Mai",
				order: 0,
			},
			{
				id: "t-b-2",
				blockKey: "k-contact",
				type: "contact_line",
				content:
					"New Westminster, BC | (431) 289-0132 | maithienphuc0102@gmail.com",
				order: 1,
			},
		],
	},
	{
		id: "t-sec-2",
		sectionKey: "key-summary",
		type: "summary",
		title: "Professional Summary",
		order: 1,
		blocks: [
			{
				id: "t-b-3",
				blockKey: "k-summary",
				type: "text",
				content:
					"Full-stack Software Developer with 3 years of React, TypeScript, and REST API experience building scalable product systems for fast-moving teams.",
				order: 0,
			},
		],
	},
	{
		id: "t-sec-3",
		sectionKey: "key-exp-1",
		type: "experience_entry",
		title: "Supreme Sprouts Ltd. — Software Developer",
		order: 2,
		blocks: [
			{
				id: "t-b-4",
				blockKey: "k-exp1-date",
				type: "date_range",
				content: "January 2023 - January 2026",
				order: 0,
			},
			{
				id: "t-b-5",
				blockKey: "k-exp1-b1",
				type: "bullet",
				content:
					"Built a React + TypeScript full-stack system consolidating order processing, inventory, payments, and delivery logistics behind clean REST APIs.",
				order: 1,
			},
			{
				id: "t-b-6",
				blockKey: "k-exp1-b2",
				type: "bullet",
				content:
					"Redesigned the order experience into a visual grid UI that converted 55% of phone-order customers to in-app ordering.",
				order: 2,
			},
			{
				id: "t-b-7",
				blockKey: "k-exp1-b3",
				type: "bullet",
				content:
					"Integrated payment and inventory systems into one PostgreSQL-backed app, saving the team 6+ hours every week.",
				order: 3,
			},
			{
				id: "t-b-8",
				blockKey: "k-exp1-b4",
				type: "bullet",
				content:
					"Built automated order reminders via cron job, reducing missed orders by 88%.",
				order: 4,
			},
			{
				id: "t-b-new",
				blockKey: "k-exp1-new",
				type: "bullet",
				content:
					"Designed and documented REST API contracts that helped product and engineering ship features with fewer handoff bugs.",
				order: 5,
				isNew: true,
			},
		],
	},
	{
		id: "t-sec-4",
		sectionKey: "key-exp-2",
		type: "experience_entry",
		title: "Trade and Track — Intern Full Stack Developer",
		order: 3,
		blocks: [
			{
				id: "t-b-9",
				blockKey: "k-exp2-date",
				type: "date_range",
				content: "December 2023 - February 2024",
				order: 0,
			},
			{
				id: "t-b-10",
				blockKey: "k-exp2-b1",
				type: "bullet",
				content:
					"Shipped dark/light theme support in React using a shared theme config for consistent product UI.",
				order: 1,
			},
			{
				id: "t-b-11",
				blockKey: "k-exp2-b2",
				type: "bullet",
				content:
					"Built a month-view calendar using the full-calendar library, integrated with a custom trade-results API.",
				order: 2,
				isRemoved: true,
			},
			{
				id: "t-b-12",
				blockKey: "k-exp2-b3",
				type: "bullet",
				content:
					"Optimized and restructured API layers with Next.js, Prisma, and PostgreSQL for clearer data access.",
				order: 3,
			},
		],
	},
	{
		id: "t-sec-5",
		sectionKey: "key-skills",
		type: "skills",
		title: "Skills",
		order: 4,
		blocks: [
			{
				id: "t-b-13",
				blockKey: "k-skills",
				type: "text",
				content:
					"React, TypeScript, Node.js, Next.js, Prisma, PostgreSQL, REST APIs, Supabase",
				order: 0,
			},
		],
	},
]

const mockScores = {
	original: 61,
	tailored: 84,
}

interface TailoredResumeTabProps {
	appliedBlockKeys: string[]
	onAppliedKeysChange: (keys: string[]) => void
}

export function TailoredResumeTab({
	appliedBlockKeys,
	onAppliedKeysChange,
}: TailoredResumeTabProps) {
	const [workingResume, setWorkingResume] = useState(() =>
		structuredClone(mockOriginalResume),
	)
	const [keywordsOpen, setKeywordsOpen] = useState(true)

	const originalByKey = useMemo(() => {
		const map = new Map<string, MockBlock>()
		for (const section of mockOriginalResume) {
			for (const block of section.blocks) map.set(block.blockKey, block)
		}
		return map
	}, [])

	const actionableKeys = useMemo(() => {
		return mockTailoredResume
			.flatMap((section) => section.blocks)
			.filter((block) => {
				const original = originalByKey.get(block.blockKey)
				if (block.isNew || block.isRemoved) return true
				return original && original.content !== block.content
			})
			.map((block) => block.blockKey)
	}, [originalByKey])

	const score = useMemo(() => {
		if (actionableKeys.length === 0) return mockScores.original
		const appliedCount = actionableKeys.filter((key) =>
			appliedBlockKeys.includes(key),
		).length
		const ratio = appliedCount / actionableKeys.length
		return Math.round(
			mockScores.original +
				(mockScores.tailored - mockScores.original) * ratio,
		)
	}, [actionableKeys, appliedBlockKeys])

	function applyBlock(blockKey: string) {
		const tailoredBlock = mockTailoredResume
			.flatMap((section) => section.blocks)
			.find((block) => block.blockKey === blockKey)
		if (!tailoredBlock) return

		setWorkingResume((prev) =>
			prev.map((section) => {
				const hasBlock = section.blocks.some(
					(block) => block.blockKey === blockKey,
				)
				if (tailoredBlock.isRemoved && hasBlock) {
					return {
						...section,
						blocks: section.blocks.filter(
							(block) => block.blockKey !== blockKey,
						),
					}
				}
				if (hasBlock) {
					return {
						...section,
						blocks: section.blocks.map((block) =>
							block.blockKey === blockKey
								? { ...block, content: tailoredBlock.content }
								: block,
						),
					}
				}
				if (
					tailoredBlock.isNew &&
					section.sectionKey ===
						mockTailoredResume.find((item) =>
							item.blocks.some((block) => block.blockKey === blockKey),
						)?.sectionKey
				) {
					return {
						...section,
						blocks: [
							...section.blocks,
							{
								...tailoredBlock,
								id: `applied-${tailoredBlock.id}`,
								isNew: false,
							},
						],
					}
				}
				return section
			}),
		)

		if (!appliedBlockKeys.includes(blockKey)) {
			onAppliedKeysChange([...appliedBlockKeys, blockKey])
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
						{[...mockTailoredResume]
							.sort((a, b) => a.order - b.order)
							.map((section) => (
								<div key={section.id} className="mb-6">
									{section.type !== "header" ? (
										<h2 className="mb-2 border-b border-neutral-300 pb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-neutral-700">
											{section.title}
										</h2>
									) : null}
									{[...section.blocks]
										.sort((a, b) => a.order - b.order)
										.map((block) => {
											const original = originalByKey.get(block.blockKey)
											const changed =
												block.isNew ||
												block.isRemoved ||
												(original && original.content !== block.content)
											const applied = appliedBlockKeys.includes(block.blockKey)
											return (
												<div key={block.id} className="mb-2">
													{changed && original && !block.isNew ? (
														<p
															className={cn(
																"mb-1 px-1 text-[13px] leading-relaxed text-neutral-400 line-through",
																block.type === "heading" &&
																	"font-display text-2xl",
															)}
														>
															{block.type === "bullet" ? `• ${original.content}` : original.content}
														</p>
													) : null}
													{!block.isRemoved ? (
														<div
															className={cn(
																"rounded px-1 py-0.5",
																changed && !applied && "bg-emerald-50",
																block.type === "heading" &&
																	"font-display text-3xl font-semibold tracking-tight text-neutral-900",
																(
																	block.type === "contact_line" ||
																	block.type === "date_range"
																)
																	? "text-sm text-neutral-600"
																	: block.type === "heading"
																		? null
																		: "text-[13.5px] leading-relaxed text-neutral-800",
															)}
														>
															{block.type === "bullet"
																? `• ${block.content}`
																: block.content}
														</div>
													) : null}
													{changed ? (
														<div className="mt-1 mb-2 flex flex-wrap items-center gap-2 px-1">
															{block.isNew ? (
																<span className="rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-800">
																	AI added
																</span>
															) : null}
															{block.isRemoved ? (
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
																	onClick={() => applyBlock(block.blockKey)}
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
							{actionableKeys.length - appliedBlockKeys.filter((key) =>
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
