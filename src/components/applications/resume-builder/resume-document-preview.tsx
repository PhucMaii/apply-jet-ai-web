import {
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
	type MutableRefObject,
} from "react"
import {
	formatDateRange,
	getBlockPreviewText,
	sortBlocks,
	sortSections,
	stringListValue,
} from "@/components/applications/resume-builder/app-resume-utils"
import type { AppResumeBlock, AppResumeSection } from "@/types/app-resume"
import { cn } from "@/lib/utils"

/** US Letter at 96dpi — keep print/export ratio stable. */
const RESUME_PAGE = {
	width: 816,
	height: 1056,
	paddingX: 40,
	paddingY: 40,
} as const

const PAGE_CONTENT_HEIGHT =
	RESUME_PAGE.height - RESUME_PAGE.paddingY * 2

type FlowItem =
	| {
		key: string
		kind: "heading"
		sectionId: string
		title: string
	}
	| {
		key: string
		kind: "block"
		sectionId: string
		block: AppResumeBlock
		isName?: boolean
	}
	| {
		key: string
		kind: "skills"
		sectionId: string
		blocks: AppResumeBlock[]
	}

interface ResumeDocumentPreviewProps {
	sections: AppResumeSection[]
	activeSectionId: string
	sectionRefs: MutableRefObject<Record<string, HTMLElement | null>>
	onPageCountChange?: (pageCount: number) => void
}

export function ResumeDocumentPreview({
	sections,
	activeSectionId,
	sectionRefs,
	onPageCountChange,
}: ResumeDocumentPreviewProps) {
	const sortedSections = useMemo(() => sortSections(sections), [sections])
	const flowItems = useMemo(
		() => buildFlowItems(sortedSections),
		[sortedSections],
	)

	const measureRefs = useRef<Record<string, HTMLDivElement | null>>({})
	const [pages, setPages] = useState<FlowItem[][]>([flowItems])

	useLayoutEffect(() => {
		function measureAndPaginate() {
			const heights = new Map<string, number>()
			for (const item of flowItems) {
				const node = measureRefs.current[item.key]
				heights.set(item.key, node?.offsetHeight ?? 0)
			}

			const nextPages: FlowItem[][] = []
			let currentPage: FlowItem[] = []
			let usedHeight = 0

			for (const item of flowItems) {
				const itemHeight = heights.get(item.key) ?? 0
				const nextHeight = usedHeight + itemHeight

				if (
					currentPage.length > 0 &&
					nextHeight > PAGE_CONTENT_HEIGHT
				) {
					const last = currentPage[currentPage.length - 1]
					const shouldCarryHeading =
						last?.kind === "heading" &&
						item.kind !== "heading" &&
						last.sectionId === item.sectionId

					if (shouldCarryHeading) {
						currentPage.pop()
						if (currentPage.length > 0) {
							nextPages.push(currentPage)
						}
						currentPage = [last, item]
						usedHeight =
							(heights.get(last.key) ?? 0) + itemHeight
					} else {
						nextPages.push(currentPage)
						currentPage = [item]
						usedHeight = itemHeight
					}
					continue
				}

				currentPage.push(item)
				usedHeight = nextHeight
			}

			if (currentPage.length > 0) {
				nextPages.push(currentPage)
			}

			const resolved = nextPages.length > 0 ? nextPages : [[]]
			setPages(resolved)
			onPageCountChange?.(resolved.length)
		}

		measureAndPaginate()

		const observer = new ResizeObserver(() => {
			measureAndPaginate()
		})
		for (const item of flowItems) {
			const node = measureRefs.current[item.key]
			if (node) observer.observe(node)
		}
		return () => observer.disconnect()
	}, [flowItems, onPageCountChange])

	return (
		<div className="mx-auto flex w-[816px] flex-col items-center gap-5">
			{/* Hidden measurement layer — same width/typography as printable pages */}
			<div
				aria-hidden
				className="pointer-events-none absolute left-[-10000px] top-0 w-[816px] opacity-0"
			>
				<div
					className="bg-white"
					style={{
						width: RESUME_PAGE.width,
						paddingLeft: RESUME_PAGE.paddingX,
						paddingRight: RESUME_PAGE.paddingX,
						paddingTop: RESUME_PAGE.paddingY,
						paddingBottom: RESUME_PAGE.paddingY,
					}}
				>
					{flowItems.map((item) => (
						<div
							key={`measure-${item.key}`}
							ref={(node) => {
								measureRefs.current[item.key] = node
							}}
						>
							<FlowItemView item={item} />
						</div>
					))}
				</div>
			</div>

			{pages.map((pageItems, pageIndex) => (
				<div key={`page-${pageIndex}`} className="w-[816px] shrink-0">
					<article
						className="overflow-hidden rounded-sm bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06),0_12px_40px_rgba(0,0,0,0.08)]"
						style={{
							width: RESUME_PAGE.width,
							height: RESUME_PAGE.height,
							paddingLeft: RESUME_PAGE.paddingX,
							paddingRight: RESUME_PAGE.paddingX,
							paddingTop: RESUME_PAGE.paddingY,
							paddingBottom: RESUME_PAGE.paddingY,
						}}
					>
						{groupPageItemsBySection(pageItems).map((group) => (
							<div
								key={`${pageIndex}-${group.sectionId}-${group.items[0]?.key}`}
								ref={(node) => {
									if (pageIndex === firstPageIndexForSection(pages, group.sectionId)) {
										sectionRefs.current[group.sectionId] = node
									}
								}}
								className={cn(
									"scroll-mt-8 rounded-md transition-shadow",
									activeSectionId === group.sectionId &&
									"ring-2 ring-primary/20 ring-offset-2",
								)}
							>
								{group.items.map((item) => (
									<FlowItemView key={item.key} item={item} />
								))}
							</div>
						))}
					</article>
					<p className="mt-2 text-center text-xs font-medium text-neutral-500">
						Page {pageIndex + 1} of {pages.length}
					</p>
				</div>
			))}
		</div>
	)
}

function buildFlowItems(sections: AppResumeSection[]): FlowItem[] {
	const items: FlowItem[] = []

	for (const section of sections) {
		if (section.section_type !== "header") {
			items.push({
				key: `heading-${section.id}`,
				kind: "heading",
				sectionId: section.id,
				title: section.display_name,
			})
		}

		const blocks = sortBlocks(section.blocks)

		if (section.section_type === "skills") {
			const categoryBlocks = blocks.filter(
				(block) => block.block_type === "skill_category_entry",
			)
			const legacySkillBlocks = blocks.filter(
				(block) => block.block_type === "skill_entry",
			)

			for (const block of categoryBlocks) {
				items.push({
					key: `block-${block.id}`,
					kind: "block",
					sectionId: section.id,
					block,
				})
			}

			if (legacySkillBlocks.length > 0) {
				items.push({
					key: `skills-${section.id}`,
					kind: "skills",
					sectionId: section.id,
					blocks: legacySkillBlocks,
				})
			}
			continue
		}

		for (const block of blocks) {
			items.push({
				key: `block-${block.id}`,
				kind: "block",
				sectionId: section.id,
				block,
				isName:
					section.section_type === "header" &&
					block.block_type === "rich_text" &&
					block.sort_key === 0,
			})
		}
	}

	return items
}

function groupPageItemsBySection(items: FlowItem[]) {
	const groups: Array<{ sectionId: string; items: FlowItem[] }> = []
	for (const item of items) {
		const last = groups[groups.length - 1]
		if (last && last.sectionId === item.sectionId) {
			last.items.push(item)
		} else {
			groups.push({ sectionId: item.sectionId, items: [item] })
		}
	}
	return groups
}

function firstPageIndexForSection(pages: FlowItem[][], sectionId: string) {
	return pages.findIndex((page) =>
		page.some((item) => item.sectionId === sectionId),
	)
}

function FlowItemView({ item }: { item: FlowItem }) {
	if (item.kind === "heading") {
		return (
			<h2 className="mb-2 border-b border-neutral-300 pb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-neutral-700">
				{item.title}
			</h2>
		)
	}

	if (item.kind === "skills") {
		return (
			<div className="mb-4 flex flex-wrap gap-1.5">
				{item.blocks.map((block) => (
					<ReadOnlyBlockPreview key={block.id} block={block} />
				))}
			</div>
		)
	}

	return (
		<ReadOnlyBlockPreview block={item.block} isName={item.isName} />
	)
}

function ReadOnlyBlockPreview({
	block,
	isName,
}: {
	block: AppResumeBlock
	isName?: boolean
}) {
	const content = block.content_json
	const fontSize = block.style_json.fontSize
	const isBold = block.style_json.bold

	if (block.block_type === "rich_text" && "text" in content) {
		return (
			<p
				className={cn(
					"mb-1 leading-relaxed text-neutral-800",
					isName &&
					"font-display text-3xl font-semibold tracking-tight text-neutral-900",
					!isName && isBold && "font-semibold",
					!isName && fontSize && fontSize <= 12 && "text-sm text-neutral-700",
				)}
			>
				{content.text}
			</p>
		)
	}

	if (block.block_type === "group_text" && "texts" in content) {
		return (
			<p className="mb-1 text-sm text-neutral-600">
				{content.texts.map((textItem) => textItem.text).join(" ")}
			</p>
		)
	}

	if (block.block_type === "job_entry" && "title" in content) {
		return (
			<div className="mb-3 space-y-1">
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
					{stringListValue(content.description).map((line) => (
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
			<div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
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

	if (block.block_type === "project_entry" && "name" in content) {
		return (
			<div className="mb-3 space-y-1">
				<div className="flex flex-wrap items-baseline justify-between gap-2">
					<p className="text-sm font-semibold text-neutral-900">
						{content.name}
					</p>
					{"start_date" in content || "end_date" in content ? (
						<p className="text-xs text-neutral-500">
							{formatDateRange(
								content.start_date ?? null,
								content.end_date ?? null,
							)}
						</p>
					) : null}
				</div>
				<ul className="space-y-0.5">
					{stringListValue(content.description).map((line) => (
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

	if (block.block_type === "skill_category_entry" && "skills" in content) {
		const skills = stringListValue(content.skills)
		return (
			<div className="mb-2.5">
				<p className="text-[13px] leading-relaxed text-neutral-800">
					<span className="font-semibold text-neutral-900">
						{content.name}
					</span>
					{skills.length > 0 ? (
						<>
							<span className="font-semibold text-neutral-900">: </span>
							<span>{skills.join(", ")}</span>
						</>
					) : null}
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
		<p className="mb-1 text-sm text-neutral-500">{getBlockPreviewText(block)}</p>
	)
}
