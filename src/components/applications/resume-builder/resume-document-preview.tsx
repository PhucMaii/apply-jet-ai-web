import {
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
	type CSSProperties,
	type MutableRefObject,
	type ReactNode,
} from "react"
import {
	formatDateRange,
	formatEducationDates,
	getBlockPreviewText,
	sortBlocks,
	sortSections,
	stringListValue,
} from "@/components/applications/resume-builder/app-resume-utils"
import { RewriteDiffText } from "@/components/applications/resume-builder/rewrite-diff-view"
import type {
	BlockRewriteDiff,
	RewriteDiffStatus,
	RewriteTextSegment,
} from "@/lib/rewrite-diff"
import {
	getEntryHeadlineParts,
	getHeaderLayout,
	getPrimaryBold,
	getSecondaryBold,
	type EntryHeadlineParts,
	type ResumeHeaderLayout,
} from "@/lib/resume-block-style"
import type {
	AppResumeBlock,
	AppResumeBlockStyle,
	AppResumeSection,
} from "@/types/app-resume"
import { cn } from "@/lib/utils"

/** US Letter at 96dpi — keep print/export ratio stable. */
const RESUME_PAGE = {
	width: 816,
	height: 1056,
	paddingX: 40,
	paddingTop: 40,
	paddingBottom: 40,
} as const

/**
 * Usable content height inside each page.
 * Top + bottom page padding are reserved so lines never sit in the margin.
 */
const PAGE_CONTENT_HEIGHT =
	RESUME_PAGE.height - RESUME_PAGE.paddingTop - RESUME_PAGE.paddingBottom

const CONTENT_WIDTH = RESUME_PAGE.width - RESUME_PAGE.paddingX * 2

/** Fallback when a block has no style_json.fontSize. */
const DEFAULT_FONT_SIZE_PX = 12
const DEFAULT_LINE_HEIGHT = 1.35

function resolveStyleColor(
	color: string | undefined,
	tone: "default" | "muted" | "subtle" = "default",
): string {
	if (tone === "subtle") return "#737373"
	if (tone === "muted") {
		if (!color || color === "black") return "#525252"
	}
	if (!color || color === "black") return "#171717"
	if (color === "white") return "#ffffff"
	return color
}

function resolveTextAlign(
	style?: AppResumeBlockStyle | null,
): NonNullable<AppResumeBlockStyle["textAlign"]> {
	const align = style?.textAlign
	if (align === "center" || align === "right" || align === "left") {
		return align
	}
	return "left"
}

/** Map block style_json onto inline CSS used by the preview. */
function blockTextStyle(
	style?: AppResumeBlockStyle | null,
	tone: "default" | "muted" | "subtle" = "default",
): CSSProperties {
	const fontSize = style?.fontSize ?? DEFAULT_FONT_SIZE_PX
	const lineHeight = style?.lineHeight ?? DEFAULT_LINE_HEIGHT
	return {
		fontSize: `${fontSize}px`,
		lineHeight,
		fontWeight: style?.bold ? 600 : undefined,
		fontStyle: style?.italic ? "italic" : undefined,
		textAlign: resolveTextAlign(style),
		color: resolveStyleColor(style?.color, tone),
	}
}

function sectionTextAlign(
	blocks: AppResumeBlock[],
): NonNullable<AppResumeBlockStyle["textAlign"]> {
	const first = blocks[0]
	return resolveTextAlign(first?.style_json)
}

function isDisplayNameStyle(style?: AppResumeBlockStyle | null): boolean {
	return Boolean(style?.fontSize && style.fontSize >= 16)
}

/** Minimum space needed before we try to keep a few lines on the current page. */
const MIN_SPLIT_HEIGHT = 18

function measureNodeHeight(node: HTMLElement): number {
	// Margins on the flow item (mb-1 / mb-3) sit outside offsetHeight unless
	// we add them explicitly — otherwise content eats into bottom page padding.
	const target =
		(node.firstElementChild as HTMLElement | null) ?? node
	const style = window.getComputedStyle(target)
	const marginTop = Number.parseFloat(style.marginTop) || 0
	const marginBottom = Number.parseFloat(style.marginBottom) || 0
	return target.offsetHeight + marginTop + marginBottom
}

type FlowItem =
	| {
			key: string
			kind: "heading"
			sectionId: string
			title: string
			textAlign: NonNullable<AppResumeBlockStyle["textAlign"]>
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
			kind: "entry_header"
			sectionId: string
			block: AppResumeBlock
			isReviewing: boolean
	  }
	| {
			key: string
			kind: "entry_bullet"
			sectionId: string
			blockId: string
			text: string
			status: RewriteDiffStatus
			isLastInEntry: boolean
			style: AppResumeBlockStyle
	  }
	| {
			key: string
			kind: "text_chunk"
			sectionId: string
			blockId: string
			segments: RewriteTextSegment[]
			plainText: string
			style: AppResumeBlockStyle
			isReviewing: boolean
			isFirstChunk: boolean
			isLastChunk: boolean
	  }
	| {
			key: string
			kind: "skills"
			sectionId: string
			blocks: AppResumeBlock[]
			textAlign: NonNullable<AppResumeBlockStyle["textAlign"]>
	  }

interface ResumeDocumentPreviewProps {
	sections: AppResumeSection[]
	activeSectionId: string
	sectionRefs: MutableRefObject<Record<string, HTMLElement | null>>
	onPageCountChange?: (pageCount: number) => void
	rewriteDiff?: BlockRewriteDiff | null
}

export function ResumeDocumentPreview({
	sections,
	activeSectionId,
	sectionRefs,
	onPageCountChange,
	rewriteDiff = null,
}: ResumeDocumentPreviewProps) {
	const sortedSections = useMemo(() => sortSections(sections), [sections])
	const flowItems = useMemo(
		() => buildFlowItems(sortedSections, rewriteDiff),
		[sortedSections, rewriteDiff],
	)

	const measureRefs = useRef<Record<string, HTMLDivElement | null>>({})
	const [pages, setPages] = useState<FlowItem[][]>([flowItems])

	useLayoutEffect(() => {
		const measureHost = document.createElement("div")
		measureHost.setAttribute("aria-hidden", "true")
		measureHost.style.cssText = [
			"position:absolute",
			"left:-10000px",
			"top:0",
			"visibility:hidden",
			`width:${CONTENT_WIDTH}px`,
			"pointer-events:none",
		].join(";")
		document.body.appendChild(measureHost)

		function heightOf(item: FlowItem): number {
			const cachedNode = measureRefs.current[item.key]
			if (
				cachedNode &&
				cachedNode.offsetHeight > 0 &&
				!item.key.includes("__split__")
			) {
				return measureNodeHeight(cachedNode)
			}
			measureHost.replaceChildren()
			const probe = document.createElement("div")
			measureHost.appendChild(probe)
			fillMeasureProbe(probe, item)
			return measureNodeHeight(probe)
		}

		function measureAndPaginate() {
			const queue = [...flowItems]
			const nextPages: FlowItem[][] = []
			let currentPage: FlowItem[] = []
			let usedHeight = 0

			function commitPage() {
				if (currentPage.length === 0) return
				nextPages.push(currentPage)
				currentPage = []
				usedHeight = 0
			}

			function takeOrphanLeaders(nextItem: FlowItem): FlowItem[] {
				const carried: FlowItem[] = []

				const maybeHeader = currentPage[currentPage.length - 1]
				if (
					maybeHeader?.kind === "entry_header" &&
					nextItem.kind === "entry_bullet" &&
					maybeHeader.block.id === nextItem.blockId
				) {
					carried.unshift(currentPage.pop()!)
				}

				const maybeHeading = currentPage[currentPage.length - 1]
				if (
					maybeHeading?.kind === "heading" &&
					nextItem.kind !== "heading" &&
					maybeHeading.sectionId === nextItem.sectionId
				) {
					carried.unshift(currentPage.pop()!)
				}

				return carried
			}

			while (queue.length > 0) {
				const item = queue.shift()!
				const itemHeight = heightOf(item)
				const remaining =
					currentPage.length === 0
						? PAGE_CONTENT_HEIGHT
						: PAGE_CONTENT_HEIGHT - usedHeight

				if (itemHeight <= remaining) {
					currentPage.push(item)
					usedHeight += itemHeight
					continue
				}

				// Keep as many lines as fit; push the overflow to the next page.
				if (
					currentPage.length > 0 &&
					remaining >= MIN_SPLIT_HEIGHT &&
					canSplitFlowItem(item)
				) {
					const split = splitFlowItemToHeight(item, remaining, heightOf)
					if (split) {
						currentPage.push(split.head)
						usedHeight += heightOf(split.head)
						queue.unshift(split.tail)
						commitPage()
						continue
					}
				}

				if (currentPage.length > 0) {
					const carried = takeOrphanLeaders(item)
					commitPage()
					for (const leader of carried) {
						currentPage.push(leader)
						usedHeight += heightOf(leader)
					}
					queue.unshift(item)
					continue
				}

				// Item taller than a full page: keep fitting lines, overflow next.
				if (canSplitFlowItem(item)) {
					const split = splitFlowItemToHeight(
						item,
						PAGE_CONTENT_HEIGHT,
						heightOf,
					)
					if (split) {
						currentPage.push(split.head)
						commitPage()
						queue.unshift(split.tail)
						continue
					}
				}

				currentPage.push(item)
				commitPage()
			}

			commitPage()

			const resolved = nextPages.length > 0 ? nextPages : [[]]
			setPages(resolved)
			onPageCountChange?.(resolved.length)
		}

		const frame = window.requestAnimationFrame(() => {
			measureAndPaginate()
		})

		const observer = new ResizeObserver(() => {
			measureAndPaginate()
		})
		for (const item of flowItems) {
			const node = measureRefs.current[item.key]
			if (node) observer.observe(node)
		}

		return () => {
			window.cancelAnimationFrame(frame)
			observer.disconnect()
			measureHost.remove()
		}
	}, [flowItems, onPageCountChange])

	useLayoutEffect(() => {
		if (!rewriteDiff?.blockId) return
		const target = document.getElementById(
			`resume-block-${rewriteDiff.blockId}`,
		)
		target?.scrollIntoView({ behavior: "smooth", block: "center" })
	}, [rewriteDiff?.blockId])

	return (
		<div
			className="mx-auto flex w-[816px] flex-col items-center gap-5"
			data-resume-preview-export-root
		>
			{/* Hidden measurement layer — same content width as printable pages */}
			<div
				aria-hidden
				className="pointer-events-none absolute left-[-10000px] top-0 opacity-0"
			>
				<div className="bg-white" style={{ width: CONTENT_WIDTH }}>
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
				<div
					key={`page-${pageIndex}`}
					className="w-[816px] shrink-0"
					data-resume-preview-page
				>
					<article
						className="overflow-hidden rounded-sm bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06),0_12px_40px_rgba(0,0,0,0.08)]"
						style={{
							width: RESUME_PAGE.width,
							height: RESUME_PAGE.height,
							paddingTop: RESUME_PAGE.paddingTop,
							paddingBottom: RESUME_PAGE.paddingBottom,
							paddingLeft: RESUME_PAGE.paddingX,
							paddingRight: RESUME_PAGE.paddingX,
							boxSizing: "border-box",
						}}
					>
						{/* Fixed content box — top/bottom padding stay outside this height. */}
						<div
							className="overflow-hidden"
							style={{ height: PAGE_CONTENT_HEIGHT }}
						>
							{groupPageItemsBySection(pageItems).map((group) => (
								<div
									key={`${pageIndex}-${group.sectionId}-${group.items[0]?.key}`}
									ref={(node) => {
										if (
											pageIndex ===
											firstPageIndexForSection(pages, group.sectionId)
										) {
											sectionRefs.current[group.sectionId] = node
										}
									}}
									className={cn(
										"relative scroll-mt-8 rounded-sm pl-2.5 transition-colors",
										activeSectionId === group.sectionId
											? "resume-preview-section-active border-l-[3px] border-primary bg-primary/[0.06]"
											: "border-l-[3px] border-transparent",
									)}
								>
									{group.items.map((item) => (
										<FlowItemView key={item.key} item={item} />
									))}
								</div>
							))}
						</div>
					</article>
					<p className="mt-2 text-center text-xs font-medium text-neutral-500">
						Page {pageIndex + 1} of {pages.length}
					</p>
				</div>
			))}
		</div>
	)
}

function buildFlowItems(
	sections: AppResumeSection[],
	rewriteDiff: BlockRewriteDiff | null,
): FlowItem[] {
	const items: FlowItem[] = []

	for (const section of sections) {
		const blocks = sortBlocks(section.blocks)
		const textAlign = sectionTextAlign(blocks)

		if (section.section_type !== "header") {
			items.push({
				key: `heading-${section.id}`,
				kind: "heading",
				sectionId: section.id,
				title: section.display_name,
				textAlign,
			})
		}

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
					textAlign,
				})
			}
			continue
		}

		for (const block of blocks) {
			if (
				block.block_type === "job_entry" ||
				block.block_type === "project_entry"
			) {
				items.push(...buildEntryFlowItems(section.id, block, rewriteDiff))
				continue
			}

			if (block.block_type === "bullet_list") {
				items.push(...buildBulletListFlowItems(section.id, block))
				continue
			}

			if (block.block_type === "rich_text") {
				items.push(
					...buildRichTextFlowItems(
						section.id,
						block,
						section.section_type === "header" && block.sort_key === 0,
						rewriteDiff,
					),
				)
				continue
			}

			items.push({
				key: `block-${block.id}`,
				kind: "block",
				sectionId: section.id,
				block,
			})
		}
	}

	return items
}

function buildEntryFlowItems(
	sectionId: string,
	block: AppResumeBlock,
	rewriteDiff: BlockRewriteDiff | null,
): FlowItem[] {
	const isReviewing = rewriteDiff?.blockId === block.id
	const items: FlowItem[] = [
		{
			key: `entry-header-${block.id}`,
			kind: "entry_header",
			sectionId,
			block,
			isReviewing,
		},
	]

	const bullets =
		isReviewing && rewriteDiff?.kind === "bullets"
			? rewriteDiff.bulletLines.map((line) => ({
					text: line.text,
					status: line.status,
					id: line.id,
				}))
			: getEntryBullets(block).map((text, index) => ({
					text,
					status: "unchanged" as const,
					id: `bullet-${index}`,
				}))

	bullets.forEach((bullet, index) => {
		items.push({
			key: `entry-bullet-${block.id}-${bullet.id}`,
			kind: "entry_bullet",
			sectionId,
			blockId: block.id,
			text: bullet.text,
			status: bullet.status,
			isLastInEntry: index === bullets.length - 1,
			style: block.style_json ?? {},
		})
	})

	return items
}

function buildBulletListFlowItems(
	sectionId: string,
	block: AppResumeBlock,
): FlowItem[] {
	const content = block.content_json
	const bullets =
		block.block_type === "bullet_list" && "items" in content
			? stringListValue(content.items).filter((item) => item.trim().length > 0)
			: []

	if (bullets.length === 0) {
		return [
			{
				key: `entry-bullet-${block.id}-empty`,
				kind: "entry_bullet",
				sectionId,
				blockId: block.id,
				text: "",
				status: "unchanged",
				isLastInEntry: true,
				style: block.style_json ?? {},
			},
		]
	}

	return bullets.map((text, index) => ({
		key: `entry-bullet-${block.id}-${index}`,
		kind: "entry_bullet" as const,
		sectionId,
		blockId: block.id,
		text,
		status: "unchanged" as const,
		isLastInEntry: index === bullets.length - 1,
		style: block.style_json ?? {},
	}))
}

function buildRichTextFlowItems(
	sectionId: string,
	block: AppResumeBlock,
	_isName: boolean,
	rewriteDiff: BlockRewriteDiff | null,
): FlowItem[] {
	const isReviewing = rewriteDiff?.blockId === block.id
	const content = block.content_json
	const plainText =
		"text" in content && typeof content.text === "string" ? content.text : ""
	const style = block.style_json ?? {}

	if (isReviewing && rewriteDiff?.kind === "text") {
		const chunks = chunkTextSegments(rewriteDiff.textSegments)
		if (chunks.length === 0) {
			return [
				{
					key: `text-chunk-${block.id}-0`,
					kind: "text_chunk",
					sectionId,
					blockId: block.id,
					segments: [],
					plainText: "",
					style,
					isReviewing,
					isFirstChunk: true,
					isLastChunk: true,
				},
			]
		}
		return chunks.map((segments, index) => ({
			key: `text-chunk-${block.id}-${index}`,
			kind: "text_chunk" as const,
			sectionId,
			blockId: block.id,
			segments,
			plainText: segments.map((segment) => segment.text).join(""),
			style,
			isReviewing,
			isFirstChunk: index === 0,
			isLastChunk: index === chunks.length - 1,
		}))
	}

	const paragraphs = splitPlainTextChunks(plainText)
	return paragraphs.map((paragraph, index) => ({
		key: `text-chunk-${block.id}-${index}`,
		kind: "text_chunk" as const,
		sectionId,
		blockId: block.id,
		segments: [
			{
				id: `plain-${index}`,
				text: paragraph,
				status: "unchanged" as const,
			},
		],
		plainText: paragraph,
		style,
		isReviewing: false,
		isFirstChunk: index === 0,
		isLastChunk: index === paragraphs.length - 1,
	}))
}

/**
 * Keep summary/body as paragraph text. Do not break after every sentence —
 * page overflow is handled later by word-level splitting.
 */
function splitPlainTextChunks(text: string): string[] {
	const trimmed = text.trim()
	if (!trimmed) return [""]
	return [trimmed]
}

function chunkTextSegments(
	segments: RewriteTextSegment[],
): RewriteTextSegment[][] {
	if (segments.length === 0) return []

	const plain = segments.map((segment) => segment.text).join("")
	const chunks = splitPlainTextChunks(plain)
	if (chunks.length <= 1) return [segments]

	const result: RewriteTextSegment[][] = []
	let cursor = 0
	let segmentIndex = 0
	let segmentOffset = 0

	for (const chunk of chunks) {
		const chunkSegments: RewriteTextSegment[] = []
		let remaining = chunk.length

		// Account for whitespace skipped between chunks in the joined plain text.
		while (
			cursor < plain.length &&
			/\s/.test(plain[cursor] ?? "") &&
			remaining > 0
		) {
			cursor += 1
			advanceSegmentCursor()
		}

		while (remaining > 0 && segmentIndex < segments.length) {
			const segment = segments[segmentIndex]!
			const available = segment.text.length - segmentOffset
			const take = Math.min(available, remaining)
			const text = segment.text.slice(segmentOffset, segmentOffset + take)
			chunkSegments.push({
				id: `${segment.id}-${result.length}-${chunkSegments.length}`,
				text,
				status: segment.status,
			})
			remaining -= take
			segmentOffset += take
			cursor += take
			if (segmentOffset >= segment.text.length) {
				segmentIndex += 1
				segmentOffset = 0
			}
		}

		if (chunkSegments.length > 0) result.push(chunkSegments)
	}

	function advanceSegmentCursor() {
		while (segmentIndex < segments.length) {
			const segment = segments[segmentIndex]!
			if (segmentOffset < segment.text.length) {
				segmentOffset += 1
				if (segmentOffset >= segment.text.length) {
					segmentIndex += 1
					segmentOffset = 0
				}
				return
			}
			segmentIndex += 1
			segmentOffset = 0
		}
	}

	return result.length > 0 ? result : [segments]
}

function getEntryBullets(block: AppResumeBlock): string[] {
	const content = block.content_json
	if ("description" in content) {
		return stringListValue(content.description)
	}
	return []
}

function canSplitFlowItem(item: FlowItem): boolean {
	if (item.kind === "entry_bullet") {
		return item.text.trim().split(/\s+/).length > 1
	}
	if (item.kind === "text_chunk") {
		return item.plainText.trim().split(/\s+/).length > 1
	}
	return false
}

function splitFlowItemToHeight(
	item: FlowItem,
	maxHeight: number,
	measure: (item: FlowItem) => number,
): { head: FlowItem; tail: FlowItem } | null {
	if (item.kind === "entry_bullet") {
		return splitBulletToHeight(item, maxHeight, measure)
	}
	if (item.kind === "text_chunk") {
		return splitTextChunkToHeight(item, maxHeight, measure)
	}
	return null
}

let splitSequence = 0

function nextSplitKey(baseKey: string, part: "h" | "t" | "probe"): string {
	splitSequence += 1
	return `${baseKey}__split__${part}-${splitSequence}`
}

function splitBulletToHeight(
	item: Extract<FlowItem, { kind: "entry_bullet" }>,
	maxHeight: number,
	measure: (item: FlowItem) => number,
): { head: FlowItem; tail: FlowItem } | null {
	const words = item.text.trim().split(/\s+/).filter(Boolean)
	if (words.length < 2) return null

	let low = 1
	let high = words.length - 1
	let best = 0

	while (low <= high) {
		const mid = Math.floor((low + high) / 2)
		const candidate: FlowItem = {
			...item,
			key: nextSplitKey(item.key, "probe"),
			text: words.slice(0, mid).join(" "),
			isLastInEntry: false,
		}
		if (measure(candidate) <= maxHeight) {
			best = mid
			low = mid + 1
		} else {
			high = mid - 1
		}
	}

	if (best <= 0 || best >= words.length) return null

	const headText = words.slice(0, best).join(" ")
	const tailText = words.slice(best).join(" ")

	return {
		head: {
			...item,
			key: nextSplitKey(item.key, "h"),
			text: headText,
			isLastInEntry: false,
		},
		tail: {
			...item,
			key: nextSplitKey(item.key, "t"),
			text: tailText,
			isLastInEntry: item.isLastInEntry,
		},
	}
}

function splitTextChunkToHeight(
	item: Extract<FlowItem, { kind: "text_chunk" }>,
	maxHeight: number,
	measure: (item: FlowItem) => number,
): { head: FlowItem; tail: FlowItem } | null {
	const words = item.plainText.trim().split(/\s+/).filter(Boolean)
	if (words.length < 2) return null

	let low = 1
	let high = words.length - 1
	let best = 0

	while (low <= high) {
		const mid = Math.floor((low + high) / 2)
		const text = words.slice(0, mid).join(" ")
		const candidate: FlowItem = {
			...item,
			key: nextSplitKey(item.key, "probe"),
			plainText: text,
			segments: [{ id: "probe", text, status: "unchanged" }],
			isLastChunk: false,
		}
		if (measure(candidate) <= maxHeight) {
			best = mid
			low = mid + 1
		} else {
			high = mid - 1
		}
	}

	if (best <= 0 || best >= words.length) return null

	const headText = words.slice(0, best).join(" ")
	const tailText = words.slice(best).join(" ")
	const { headSegments, tailSegments } = splitSegmentsByWordCount(
		item.segments,
		best,
	)

	return {
		head: {
			...item,
			key: nextSplitKey(item.key, "h"),
			plainText: headText,
			segments: headSegments,
			isLastChunk: false,
		},
		tail: {
			...item,
			key: nextSplitKey(item.key, "t"),
			plainText: tailText,
			segments: tailSegments,
			isFirstChunk: false,
			isLastChunk: item.isLastChunk,
		},
	}
}

function splitSegmentsByWordCount(
	segments: RewriteTextSegment[],
	headWordCount: number,
): {
	headSegments: RewriteTextSegment[]
	tailSegments: RewriteTextSegment[]
} {
	const headSegments: RewriteTextSegment[] = []
	const tailSegments: RewriteTextSegment[] = []
	let wordsTaken = 0

	for (const segment of segments) {
		const words = segment.text.split(/(\s+)/)
		let headText = ""
		let tailText = ""

		for (const part of words) {
			if (!part) continue
			const isSpace = /^\s+$/.test(part)
			if (isSpace) {
				if (wordsTaken < headWordCount && headText) headText += part
				else if (wordsTaken >= headWordCount) tailText += part
				continue
			}
			if (wordsTaken < headWordCount) {
				headText += part
				wordsTaken += 1
			} else {
				tailText += part
			}
		}

		if (headText) {
			headSegments.push({
				id: `${segment.id}-h`,
				text: headText,
				status: segment.status,
			})
		}
		if (tailText) {
			tailSegments.push({
				id: `${segment.id}-t`,
				text: tailText,
				status: segment.status,
			})
		}
	}

	return { headSegments, tailSegments }
}

function fillMeasureProbe(probe: HTMLElement, item: FlowItem) {
	if (item.kind === "entry_bullet") {
		const wrap = document.createElement("div")
		wrap.style.marginBottom = item.isLastInEntry ? "6px" : "0"

		const row = document.createElement("div")
		row.style.display = "flex"
		row.style.gap = "6px"
		row.style.padding = "0"
		Object.assign(row.style, blockTextStyle(item.style))

		const marker = document.createElement("span")
		marker.textContent = "•"
		marker.style.flexShrink = "0"
		marker.style.fontWeight = "600"

		const text = document.createElement("span")
		text.textContent = item.text

		row.append(marker, text)
		wrap.appendChild(row)
		probe.appendChild(wrap)
		return
	}

	if (item.kind === "text_chunk") {
		const paragraph = document.createElement("p")
		paragraph.style.margin = "0 0 2px"
		Object.assign(paragraph.style, blockTextStyle(item.style))
		if (item.style.bold || isDisplayNameStyle(item.style)) {
			paragraph.style.fontWeight = "600"
		}
		if (item.style.italic) {
			paragraph.style.fontStyle = "italic"
		}
		paragraph.textContent = item.plainText
		probe.appendChild(paragraph)
	}
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
			<h2
				className="mt-4 mb-1.5 border-b border-neutral-300 pb-0.5 text-[12px] font-bold uppercase tracking-[0.08em] text-neutral-700"
				style={{ textAlign: item.textAlign }}
			>
				{item.title}
			</h2>
		)
	}

	if (item.kind === "skills") {
		return (
			<div
				className={cn(
					"mb-2 flex flex-wrap gap-1",
					item.textAlign === "center" && "justify-center",
					item.textAlign === "right" && "justify-end",
				)}
			>
				{item.blocks.map((block) => (
					<ReadOnlyBlockPreview key={block.id} block={block} />
				))}
			</div>
		)
	}

	if (item.kind === "entry_header") {
		return (
			<EntryHeaderView block={item.block} isReviewing={item.isReviewing} />
		)
	}

	if (item.kind === "entry_bullet") {
		return (
			<EntryBulletView
				text={item.text}
				status={item.status}
				isLastInEntry={item.isLastInEntry}
				style={item.style}
			/>
		)
	}

	if (item.kind === "text_chunk") {
		const textStyle = blockTextStyle(item.style)
		const isName = isDisplayNameStyle(item.style)
		return (
			<div
				id={item.isFirstChunk ? `resume-block-${item.blockId}` : undefined}
				className={cn(
					"mb-0.5 scroll-mt-24",
					item.isReviewing &&
						item.isFirstChunk &&
						"rounded-md ring-2 ring-primary/25 ring-offset-2 ring-offset-white",
				)}
			>
				{item.isReviewing ? (
					<RewriteDiffText
						segments={item.segments}
						className={cn(
							isName && "font-display tracking-tight",
							item.style.bold && "font-semibold",
							item.style.italic && "italic",
						)}
						style={textStyle}
					/>
				) : (
					<p
						className={cn(
							isName && "font-display tracking-tight",
							item.style.bold && "font-semibold",
							item.style.italic && "italic",
						)}
						style={textStyle}
					>
						{item.plainText}
					</p>
				)}
			</div>
		)
	}

	return <ReadOnlyBlockPreview block={item.block} isName={item.isName} />
}

function EntryHeaderView({
	block,
	isReviewing,
}: {
	block: AppResumeBlock
	isReviewing: boolean
}) {
	const content = block.content_json
	const style = block.style_json
	const primaryStyle = blockTextStyle({
		...style,
		bold: getPrimaryBold(style),
	})
	const metaStyle = blockTextStyle(style, "subtle")
	const secondaryStyle = blockTextStyle(
		{ ...style, bold: getSecondaryBold(style) },
		"muted",
	)
	const align = resolveTextAlign(style)
	const sectionType =
		block.block_type === "job_entry"
			? "experience"
			: block.block_type === "project_entry"
				? "projects"
				: "education"
	const layout = getHeaderLayout(style, sectionType)

	if (block.block_type === "job_entry" && "title" in content) {
		const parts = getEntryHeadlineParts(block)
		if (!parts) return null
		return (
			<div
				id={`resume-block-${block.id}`}
				className={cn(
					"scroll-mt-24",
					isReviewing &&
						"rounded-t-md px-1 pt-1 ring-2 ring-primary/25 ring-offset-2 ring-offset-white",
				)}
			>
				<AlignedTitleDateRow
					align={align}
					primary={
						<EntryHeadline
							parts={parts}
							layout={layout}
							primaryStyle={primaryStyle}
							secondaryStyle={secondaryStyle}
						/>
					}
					date={
						<p style={metaStyle}>
							{formatDateRange(content.start_date, content.end_date)}
						</p>
					}
				/>
			</div>
		)
	}

	if (block.block_type === "project_entry" && "name" in content) {
		const parts = getEntryHeadlineParts(block)
		if (!parts) return null
		const hasDates =
			"start_date" in content || "end_date" in content
		return (
			<div
				id={`resume-block-${block.id}`}
				className={cn(
					"scroll-mt-24",
					isReviewing &&
						"rounded-t-md px-1 pt-1 ring-2 ring-primary/25 ring-offset-2 ring-offset-white",
				)}
			>
				<AlignedTitleDateRow
					align={align}
					primary={
						<EntryHeadline
							parts={parts}
							layout={layout}
							primaryStyle={primaryStyle}
							secondaryStyle={secondaryStyle}
						/>
					}
					date={
						hasDates ? (
							<p style={metaStyle}>
								{formatDateRange(
									"start_date" in content
										? (content.start_date ?? null)
										: null,
									"end_date" in content
										? (content.end_date ?? null)
										: null,
								)}
							</p>
						) : null
					}
				/>
			</div>
		)
	}

	return null
}

function EntryHeadline({
	parts,
	layout,
	primaryStyle,
	secondaryStyle,
}: {
	parts: EntryHeadlineParts
	layout: ResumeHeaderLayout
	primaryStyle: CSSProperties
	secondaryStyle: CSSProperties
}) {
	if (layout === "inline") {
		return (
			<p>
				<span style={primaryStyle}>{parts.primary}</span>
				{parts.secondary ? (
					<span style={secondaryStyle}>
						{" "}
						— {parts.secondary}
					</span>
				) : null}
			</p>
		)
	}

	if (layout === "inverted" && parts.secondary) {
		return (
			<div>
				<p style={secondaryStyle}>{parts.secondary}</p>
				<p style={primaryStyle}>{parts.primary}</p>
			</div>
		)
	}

	return (
		<div>
			<p style={primaryStyle}>{parts.primary}</p>
			{parts.secondary ? (
				<p style={secondaryStyle}>{parts.secondary}</p>
			) : null}
		</div>
	)
}

/**
 * Left: title … date
 * Center: title above date (stacked)
 * Right: date … title (reversed from left)
 */
function AlignedTitleDateRow({
	align,
	primary,
	date,
}: {
	align: NonNullable<AppResumeBlockStyle["textAlign"]>
	primary: ReactNode
	date: ReactNode
}) {
	if (align === "center") {
		return (
			<div className="mb-0.5 flex flex-col items-center gap-0.5 text-center">
				{primary}
				{date}
			</div>
		)
	}

	if (!date) {
		return <div className="mb-0.5">{primary}</div>
	}

	if (align === "right") {
		return (
			<div className="mb-0.5 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0 text-right">
				{date}
				{primary}
			</div>
		)
	}

	return (
		<div className="mb-0.5 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0">
			{primary}
			{date}
		</div>
	)
}

const BULLET_STATUS_CLASS: Record<RewriteDiffStatus, string> = {
	unchanged: "",
	added:
		"rounded-md bg-emerald-500/10 text-emerald-950 ring-1 ring-inset ring-emerald-500/20",
	removed:
		"rounded-md bg-red-500/10 text-red-800/90 line-through decoration-red-500/70 ring-1 ring-inset ring-red-500/20",
}

function EntryBulletView({
	text,
	status,
	isLastInEntry,
	style,
}: {
	text: string
	status: RewriteDiffStatus
	isLastInEntry: boolean
	style: AppResumeBlockStyle
}) {
	const marker =
		status === "added" ? "+" : status === "removed" ? "−" : "•"
	const textStyle = blockTextStyle(style)
	const align = resolveTextAlign(style)

	return (
		<div className={cn(isLastInEntry && "mb-1.5")}>
			<div
				className={cn(
					"flex gap-1.5",
					align === "center" && "justify-center",
					align === "right" && "justify-end",
					BULLET_STATUS_CLASS[status],
				)}
				style={
					status === "unchanged"
						? textStyle
						: { ...textStyle, color: undefined }
				}
			>
				<span
					aria-hidden
					className={cn(
						"shrink-0 font-semibold",
						status === "added" && "text-emerald-700",
						status === "removed" && "text-red-600",
						status === "unchanged" && "text-neutral-500",
					)}
				>
					{marker}
				</span>
				<span>{text}</span>
			</div>
		</div>
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
	const style = block.style_json
	const textStyle = blockTextStyle(style)
	const mutedStyle = blockTextStyle(style, "muted")
	const subtleStyle = blockTextStyle(style, "subtle")

	if (block.block_type === "group_text" && "texts" in content) {
		return (
			<p className="mb-0.5" style={mutedStyle}>
				{content.texts.map((textItem) => textItem.text).join(" ")}
			</p>
		)
	}

	if (block.block_type === "education_entry" && "school" in content) {
		const align = resolveTextAlign(style)
		const layout = getHeaderLayout(style, "education")
		const parts = getEntryHeadlineParts(block)
		if (!parts) return null
		const dateLabel = formatEducationDates(
			content.start_date,
			content.end_date,
		)
		const primaryStyle = blockTextStyle({
			...style,
			bold: getPrimaryBold(style),
		})
		const secondaryStyle = blockTextStyle(
			{ ...style, bold: getSecondaryBold(style) },
			"muted",
		)
		return (
			<div className="mb-1.5">
				<AlignedTitleDateRow
					align={align}
					primary={
						<EntryHeadline
							parts={parts}
							layout={layout}
							primaryStyle={primaryStyle}
							secondaryStyle={secondaryStyle}
						/>
					}
					date={
						dateLabel ? <p style={subtleStyle}>{dateLabel}</p> : null
					}
				/>
			</div>
		)
	}

	if (block.block_type === "skill_category_entry" && "skills" in content) {
		const skills = stringListValue(content.skills)
		return (
			<div className="mb-1">
				<p style={textStyle}>
					<span style={{ fontWeight: 600 }}>
						{content.name}
					</span>
					{skills.length > 0 ? (
						<>
							<span style={{ fontWeight: 600 }}>: </span>
							<span>{skills.join(", ")}</span>
						</>
					) : null}
				</p>
			</div>
		)
	}

	if (block.block_type === "skill_entry" && "name" in content) {
		return (
			<span
				className="mr-1 inline-flex rounded-md bg-neutral-100 px-1.5 py-0.5 font-medium"
				style={textStyle}
			>
				{content.name}
			</span>
		)
	}

	if (block.block_type === "rich_text" && "text" in content) {
		const displayName = isName || isDisplayNameStyle(style)
		return (
			<p
				className={cn(
					"mb-0.5",
					displayName && "font-display tracking-tight",
					style?.bold && "font-semibold",
				)}
				style={textStyle}
			>
				{content.text}
			</p>
		)
	}

	return (
		<p className="mb-0.5" style={subtleStyle}>
			{getBlockPreviewText(block)}
		</p>
	)
}
