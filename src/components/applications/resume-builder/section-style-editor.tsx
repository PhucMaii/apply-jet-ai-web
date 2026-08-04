import type { ReactNode } from "react"
import {
	AlignCenter,
	AlignLeft,
	AlignRight,
	ChevronDown,
	ChevronRight,
	Minus,
	Plus,
	Type,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	RESUME_FONT_SIZE_OPTIONS,
	RESUME_LINE_HEIGHT_OPTIONS,
	RESUME_TEXT_ALIGN_OPTIONS,
	fontStylePatch,
	getFontStyleMode,
	getHeaderLayout,
	getPrimaryBold,
	getSecondaryBold,
	getTextAlign,
	headerLayoutOptions,
	headlineFieldLabels,
	type ResumeFontStyleMode,
	type ResumeHeaderLayout,
	type ResumeStyleGroup,
	type ResumeTextAlign,
} from "@/lib/resume-block-style"
import type { AppResumeBlockStyle } from "@/types/app-resume"
import { cn } from "@/lib/utils"

interface SectionStyleEditorProps {
	group: ResumeStyleGroup
	isOpen: boolean
	isActive: boolean
	isSaving?: boolean
	onToggle: () => void
	onChange: (patch: Partial<AppResumeBlockStyle>) => void
}

export function SectionStyleEditor({
	group,
	isOpen,
	isActive,
	isSaving = false,
	onToggle,
	onChange,
}: SectionStyleEditorProps) {
	const fontSize = group.style.fontSize ?? 12
	const lineHeight = group.style.lineHeight ?? 1.35
	const fontMode = getFontStyleMode(group.style)
	const textAlign = getTextAlign(group.style)
	const headerLayout = getHeaderLayout(group.style, group.sectionType)
	const showHeaderLayout = group.supportsHeaderLayout
	const headlineLabels = headlineFieldLabels(group.sectionType)
	const primaryBold = getPrimaryBold(group.style)
	const secondaryBold = getSecondaryBold(group.style)
	const layoutOptions = headerLayoutOptions(group.sectionType)

	const canDecrease = fontSize > RESUME_FONT_SIZE_OPTIONS[0]
	const canIncrease =
		fontSize < RESUME_FONT_SIZE_OPTIONS[RESUME_FONT_SIZE_OPTIONS.length - 1]

	function handleFontSizeStep(delta: -1 | 1) {
		const currentIndex = RESUME_FONT_SIZE_OPTIONS.indexOf(
			fontSize as (typeof RESUME_FONT_SIZE_OPTIONS)[number],
		)
		const fallbackIndex = RESUME_FONT_SIZE_OPTIONS.reduce(
			(closest, size, index) =>
				Math.abs(size - fontSize) <
				Math.abs(RESUME_FONT_SIZE_OPTIONS[closest]! - fontSize)
					? index
					: closest,
			0,
		)
		const index = currentIndex >= 0 ? currentIndex : fallbackIndex
		const next = RESUME_FONT_SIZE_OPTIONS[index + delta]
		if (next == null) return
		onChange({ fontSize: next })
	}

	function handleFontMode(mode: ResumeFontStyleMode) {
		onChange(fontStylePatch(mode))
	}

	return (
		<section
			className={cn(
				"overflow-hidden rounded-xl border bg-white transition-shadow",
				isActive
					? "border-primary/35 shadow-[0_0_0_3px_rgba(79,70,229,0.08)]"
					: "border-neutral-200/90",
			)}
		>
			<button
				type="button"
				onClick={onToggle}
				aria-expanded={isOpen}
				className={cn(
					"flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors",
					isOpen ? "bg-neutral-50/80" : "hover:bg-neutral-50",
				)}
			>
				<span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-600">
					<Type className="size-3.5" aria-hidden />
				</span>
				<span className="min-w-0 flex-1">
					<span className="flex items-center gap-2">
						<span className="truncate text-sm font-semibold text-neutral-900">
							{group.label}
						</span>
						{isSaving ? (
							<span className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">
								Saving
							</span>
						) : null}
					</span>
					<span className="mt-0.5 block truncate text-xs text-neutral-500">
						{isOpen
							? group.description
							: `${fontSize}px · ${fontModeLabel(fontMode)} · ${alignLabel(textAlign)}${
									showHeaderLayout
										? ` · ${headerLayoutLabel(headerLayout)} · ${headlineLabels.primary}${primaryBold ? " bold" : ""}${secondaryBold ? ` · ${headlineLabels.secondary} bold` : ""}`
										: ""
								} · ${lineHeight}`}
					</span>
				</span>
				{isOpen ? (
					<ChevronDown className="size-4 shrink-0 text-neutral-400" />
				) : (
					<ChevronRight className="size-4 shrink-0 text-neutral-400" />
				)}
			</button>

			{isOpen ? (
				<div className="space-y-3 border-t border-neutral-100 px-3 py-3">
					<StyleField label="Font size">
						<div className="flex items-center gap-1.5">
							<Button
								type="button"
								size="sm"
								variant="outline"
								className="size-8 shrink-0 p-0"
								disabled={!canDecrease}
								aria-label={`Decrease ${group.label} font size`}
								onClick={() => handleFontSizeStep(-1)}
							>
								<Minus className="size-3.5" aria-hidden />
							</Button>
							<label className="sr-only" htmlFor={`font-size-${group.id}`}>
								Font size for {group.label}
							</label>
							<select
								id={`font-size-${group.id}`}
								value={fontSize}
								onChange={(event) =>
									onChange({ fontSize: Number(event.target.value) })
								}
								className="h-8 min-w-0 flex-1 rounded-md border border-neutral-200 bg-white px-2 text-sm font-medium text-neutral-800 outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
							>
								{RESUME_FONT_SIZE_OPTIONS.map((size) => (
									<option key={size} value={size}>
										{size}px
									</option>
								))}
								{!RESUME_FONT_SIZE_OPTIONS.includes(
									fontSize as (typeof RESUME_FONT_SIZE_OPTIONS)[number],
								) ? (
									<option value={fontSize}>{fontSize}px</option>
								) : null}
							</select>
							<Button
								type="button"
								size="sm"
								variant="outline"
								className="size-8 shrink-0 p-0"
								disabled={!canIncrease}
								aria-label={`Increase ${group.label} font size`}
								onClick={() => handleFontSizeStep(1)}
							>
								<Plus className="size-3.5" aria-hidden />
							</Button>
						</div>
					</StyleField>

					<StyleField label="Font style">
						<div
							className="grid grid-cols-3 gap-1 rounded-lg bg-neutral-100 p-1"
							role="radiogroup"
							aria-label={`Font style for ${group.label}`}
						>
							{(
								[
									{ mode: "regular", label: "Regular", sampleClass: "" },
									{
										mode: "bold",
										label: "Bold",
										sampleClass: "font-semibold",
									},
									{ mode: "italic", label: "Italic", sampleClass: "italic" },
								] as const
							).map((option) => {
								const selected = fontMode === option.mode
								return (
									<button
										key={option.mode}
										type="button"
										role="radio"
										aria-checked={selected}
										onClick={() => handleFontMode(option.mode)}
										className={cn(
											"rounded-md px-2 py-1.5 text-xs transition-colors",
											option.sampleClass,
											selected
												? "bg-white text-neutral-900 shadow-sm"
												: "text-neutral-600 hover:text-neutral-900",
										)}
									>
										{option.label}
									</button>
								)
							})}
						</div>
					</StyleField>

					{showHeaderLayout ? (
						<StyleField label="Header layout">
							<div
								className="grid grid-cols-1 gap-1 rounded-lg bg-neutral-100 p-1"
								role="radiogroup"
								aria-label={`Header layout for ${group.label}`}
							>
								{layoutOptions.map((option) => {
									const selected = headerLayout === option.value
									return (
										<button
											key={option.value}
											type="button"
											role="radio"
											aria-checked={selected}
											onClick={() =>
												onChange({ headerLayout: option.value })
											}
											className={cn(
												"rounded-md px-2.5 py-2 text-left transition-colors",
												selected
													? "bg-white text-neutral-900 shadow-sm"
													: "text-neutral-600 hover:text-neutral-900",
											)}
										>
											<span className="block text-xs font-semibold">
												{option.label}
											</span>
											<span className="mt-0.5 block text-[11px] text-neutral-500">
												{option.hint}
											</span>
										</button>
									)
								})}
							</div>
						</StyleField>
					) : null}

					{showHeaderLayout ? (
						<div className="space-y-2">
							<p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
								Headline weight
							</p>
							<HeadlineBoldToggle
								label={headlineLabels.primary}
								bold={primaryBold}
								onChange={(nextBold) =>
									onChange({ primaryBold: nextBold })
								}
							/>
							<HeadlineBoldToggle
								label={headlineLabels.secondary}
								bold={secondaryBold}
								onChange={(nextBold) =>
									onChange({ secondaryBold: nextBold })
								}
							/>
						</div>
					) : null}

					<StyleField label="Text align">
						<div
							className="grid grid-cols-3 gap-1 rounded-lg bg-neutral-100 p-1"
							role="radiogroup"
							aria-label={`Text align for ${group.label}`}
						>
							{RESUME_TEXT_ALIGN_OPTIONS.map((option) => {
								const selected = textAlign === option.value
								const Icon = alignIcon(option.value)
								return (
									<button
										key={option.value}
										type="button"
										role="radio"
										aria-checked={selected}
										aria-label={option.label}
										title={option.label}
										onClick={() => onChange({ textAlign: option.value })}
										className={cn(
											"inline-flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs transition-colors",
											selected
												? "bg-white text-neutral-900 shadow-sm"
												: "text-neutral-600 hover:text-neutral-900",
										)}
									>
										<Icon className="size-3.5" aria-hidden />
										<span className="hidden sm:inline">{option.label}</span>
									</button>
								)
							})}
						</div>
					</StyleField>

					<StyleField label="Line height">
						<label className="sr-only" htmlFor={`line-height-${group.id}`}>
							Line height for {group.label}
						</label>
						<select
							id={`line-height-${group.id}`}
							value={String(lineHeight)}
							onChange={(event) =>
								onChange({ lineHeight: Number(event.target.value) })
							}
							className="h-8 w-full rounded-md border border-neutral-200 bg-white px-2 text-sm font-medium text-neutral-800 outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
						>
							{RESUME_LINE_HEIGHT_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label} ({option.value})
								</option>
							))}
							{!RESUME_LINE_HEIGHT_OPTIONS.some(
								(option) => option.value === lineHeight,
							) ? (
								<option value={lineHeight}>Custom ({lineHeight})</option>
							) : null}
						</select>
					</StyleField>
				</div>
			) : null}
		</section>
	)
}

function fontModeLabel(mode: ResumeFontStyleMode) {
	switch (mode) {
		case "bold":
			return "Bold"
		case "italic":
			return "Italic"
		default:
			return "Regular"
	}
}

function alignLabel(align: ResumeTextAlign) {
	switch (align) {
		case "center":
			return "Center"
		case "right":
			return "Right"
		default:
			return "Left"
	}
}

function headerLayoutLabel(layout: ResumeHeaderLayout) {
	switch (layout) {
		case "stacked":
			return "Stacked"
		case "inverted":
			return "Inverted"
		default:
			return "Inline"
	}
}

function alignIcon(align: ResumeTextAlign) {
	switch (align) {
		case "center":
			return AlignCenter
		case "right":
			return AlignRight
		default:
			return AlignLeft
	}
}

function StyleField({
	label,
	children,
}: {
	label: string
	children: ReactNode
}) {
	return (
		<div className="space-y-1.5">
			<p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
				{label}
			</p>
			{children}
		</div>
	)
}

function HeadlineBoldToggle({
	label,
	bold,
	onChange,
}: {
	label: string
	bold: boolean
	onChange: (bold: boolean) => void
}) {
	return (
		<div className="space-y-1.5">
			<p className="text-xs font-medium text-neutral-700">{label}</p>
			<div
				className="grid grid-cols-2 gap-1 rounded-lg bg-neutral-100 p-1"
				role="radiogroup"
				aria-label={`${label} weight`}
			>
				{(
					[
						{ value: false, label: "Regular", sampleClass: "" },
						{
							value: true,
							label: "Bold",
							sampleClass: "font-semibold",
						},
					] as const
				).map((option) => {
					const selected = bold === option.value
					return (
						<button
							key={String(option.value)}
							type="button"
							role="radio"
							aria-checked={selected}
							onClick={() => onChange(option.value)}
							className={cn(
								"rounded-md px-2 py-1.5 text-xs transition-colors",
								option.sampleClass,
								selected
									? "bg-white text-neutral-900 shadow-sm"
									: "text-neutral-600 hover:text-neutral-900",
							)}
						>
							{option.label}
						</button>
					)
				})}
			</div>
		</div>
	)
}
