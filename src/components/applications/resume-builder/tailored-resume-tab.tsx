import { useMemo, useState } from "react"
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react"
import {
	formatDateRange,
	getBlockPreviewText,
	sortBlocks,
	sortSections,
} from "@/components/applications/resume-builder/app-resume-utils"
import { ResumeEmptyState } from "@/components/applications/resume-builder/resume-empty-state"
import { Button } from "@/components/ui/button"
import type { AppResume, AppResumeBlock } from "@/types/app-resume"
import { cn } from "@/lib/utils"

interface TailoredResumeTabProps {
	appResume: AppResume | null
	appliedBlockKeys: string[]
	onAppliedKeysChange: (keys: string[]) => void
}

export function TailoredResumeTab({
	appResume,
	appliedBlockKeys,
}: TailoredResumeTabProps) {
	const sections = appResume?.sections ?? []
	const [snapshotOpen, setSnapshotOpen] = useState(true)

	const blockCount = useMemo(() => {
		const source = appResume?.sections ?? []
		return source.reduce((sum, section) => sum + section.blocks.length, 0)
	}, [appResume?.sections])

	if (!appResume || sections.length === 0) {
		return (
			<ResumeEmptyState
				title="No tailored resume yet"
				description="Generate a tailored resume once this application has resume data."
			/>
		)
	}

	return (
		<div className="flex min-h-0 flex-1 flex-col xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,260px)]">
			<section className="relative flex min-h-[min(480px,60dvh)] min-w-0 flex-1 flex-col bg-neutral-100/90 xl:min-h-0">
				<div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 bg-white px-3 py-2.5 sm:gap-3 sm:px-4">
					<p className="text-sm font-medium text-neutral-600">
						Tailored suggestions will appear here after generation.
					</p>
					<Button type="button" size="sm" className="gap-2" disabled>
						<Sparkles className="size-3.5" aria-hidden />
						Replace All
					</Button>
				</div>
				<div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
					<article className="mx-auto min-h-[640px] w-full max-w-[720px] rounded-sm bg-white px-6 py-8 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_12px_40px_rgba(0,0,0,0.08)] sm:px-8 sm:py-10 lg:px-10">
						{sortSections(sections).map((section) => (
							<div key={section.id} className="mb-6">
								{section.section_type !== "header" ? (
									<h2 className="mb-2 border-b border-neutral-300 pb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-neutral-700">
										{section.display_name}
									</h2>
								) : null}
								{sortBlocks(section.blocks).map((block) => (
									<div key={block.id} className="mb-3 px-1 py-0.5">
										<TailoredBlockPreview block={block} />
									</div>
								))}
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
							—
							<span className="text-base text-neutral-500"> / 100</span>
						</p>
						<p className="mt-2 text-sm text-neutral-600">
							{appliedBlockKeys.length} applied changes
						</p>
					</div>
					<div className="rounded-xl border border-neutral-200">
						<button
							type="button"
							className="flex w-full items-center justify-between px-3 py-2.5 text-left"
							onClick={() => setSnapshotOpen((prev) => !prev)}
						>
							<span className="text-sm font-semibold text-neutral-800">
								Working resume snapshot
							</span>
							{snapshotOpen ? (
								<ChevronDown className="size-4 text-neutral-400" />
							) : (
								<ChevronRight className="size-4 text-neutral-400" />
							)}
						</button>
						{snapshotOpen ? (
							<div className="border-t border-neutral-100 px-3 py-3 text-xs leading-relaxed text-neutral-600">
								Your working resume currently has {blockCount} blocks.
							</div>
						) : null}
					</div>
				</div>
			</aside>
		</div>
	)
}

function TailoredBlockPreview({ block }: { block: AppResumeBlock }) {
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
					block.style_json.bold &&
						block.style_json.fontSize === 12 &&
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
