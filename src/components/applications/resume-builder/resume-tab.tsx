import {
	useEffect,
	useMemo,
	useRef,
	useState,
	type DragEvent,
	type KeyboardEvent,
	type ReactNode,
} from "react"
import {
	AlertCircle,
	Briefcase,
	ChevronDown,
	ChevronRight,
	ExternalLink,
	FileText,
	GripVertical,
	GraduationCap,
	Loader2,
	Pencil,
	Plus,
	Save,
	Sparkles,
	UserRound,
	Wrench,
	ZoomIn,
	ZoomOut,
} from "lucide-react"
import { ApplicationsStatusBadge } from "@/components/applications/applications-status-badge"
import { DeleteApplicationControl } from "@/components/applications/delete-application-control"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
	APPLICATION_STATUSES,
	type ApplicationStatus,
	isApplicationStatus,
} from "@/lib/application-status"
import { APPLICATIONS_THEME } from "@/lib/applications-theme"
import { DASHBOARD_THEME } from "@/lib/dashboard-theme"
import { PROFILE_SURFACE } from "@/lib/profile-surface"
import type { ApplicationDetailForm } from "@/types/application-detail"
import { cn } from "@/lib/utils"

function hasCompleteJobDetails(form: ApplicationDetailForm) {
	return (
		form.jobTitle.trim().length > 0 &&
		form.companyName.trim().length > 0 &&
		form.jobDescription.trim().length > 0
	)
}

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
	issueCount?: number
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
		issueCount: 1,
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
		issueCount: 1,
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

const mockScores = {
	original: 61,
	tailored: 84,
}

const mockJobMatch = {
	keywordsFound: ["React", "TypeScript", "REST API", "PostgreSQL"],
	keywordsMissing: ["GraphQL", "AWS", "CI/CD"],
}

function sortSections(sections: MockSection[]) {
	return [...sections].sort((a, b) => a.order - b.order)
}

function sectionIcon(type: MockSection["type"]) {
	switch (type) {
		case "header":
			return UserRound
		case "summary":
			return FileText
		case "experience_entry":
			return Briefcase
		case "education_entry":
			return GraduationCap
		case "skills":
			return Wrench
		default:
			return FileText
	}
}

interface ResumeTabProps {
	form: ApplicationDetailForm
	status: ApplicationStatus
	createdAt: string
	savingDetails: boolean
	updatingStatus: boolean
	isDeleting: boolean
	onPatchForm: (patch: Partial<ApplicationDetailForm>) => void
	onSaveApplication: () => void
	onStatusChange: (status: ApplicationStatus) => void
	onDelete?: (applicationId: string) => Promise<{
		success: boolean
		message: string
	}>
	onGenerate: () => void
	hasGenerated: boolean
}

export function ResumeTab({
	form,
	status,
	createdAt,
	savingDetails,
	updatingStatus,
	isDeleting,
	onPatchForm,
	onSaveApplication,
	onStatusChange,
	onDelete,
	onGenerate,
	hasGenerated,
}: ResumeTabProps) {
	const [sections, setSections] = useState(() =>
		sortSections(structuredClone(mockOriginalResume)),
	)
	const [expandedId, setExpandedId] = useState<string | null>("sec-1")
	const [activeSectionId, setActiveSectionId] = useState("sec-1")
	const [editingBlockId, setEditingBlockId] = useState<string | null>(null)
	const [keywordsOpen, setKeywordsOpen] = useState(true)
	const [contentOpen, setContentOpen] = useState(true)
	const [isEditingJob, setIsEditingJob] = useState(
		() => !hasCompleteJobDetails(form),
	)
	const [dragId, setDragId] = useState<string | null>(null)
	const previewRefs = useRef<Record<string, HTMLElement | null>>({})

	const issueTotal = useMemo(
		() => sections.reduce((sum, section) => sum + (section.issueCount ?? 0), 0),
		[sections],
	)
	const jobDetailsComplete = hasCompleteJobDetails(form)
	const showJobForm = isEditingJob || !jobDetailsComplete
	const score = hasGenerated ? mockScores.tailored : mockScores.original
	const addedLabel = new Date(createdAt).toLocaleString(undefined, {
		dateStyle: "medium",
		timeStyle: "short",
	})

	function handleSaveJobDetails() {
		onSaveApplication()
		if (hasCompleteJobDetails(form)) {
			setIsEditingJob(false)
		}
	}

	function updateBlockContent(blockId: string, content: string) {
		setSections((prev) =>
			prev.map((section) => ({
				...section,
				blocks: section.blocks.map((block) =>
					block.id === blockId ? { ...block, content } : block,
				),
			})),
		)
	}

	function handleSectionClick(sectionId: string) {
		setExpandedId((prev) => (prev === sectionId ? null : sectionId))
		setActiveSectionId(sectionId)
		const node = previewRefs.current[sectionId]
		node?.scrollIntoView({ behavior: "smooth", block: "start" })
	}

	function handleDragStart(sectionId: string) {
		setDragId(sectionId)
	}

	function handleDrop(targetId: string) {
		if (!dragId || dragId === targetId) {
			setDragId(null)
			return
		}
		setSections((prev) => {
			const ordered = sortSections(prev)
			const from = ordered.findIndex((section) => section.id === dragId)
			const to = ordered.findIndex((section) => section.id === targetId)
			if (from < 0 || to < 0) return prev
			const next = [...ordered]
			const [moved] = next.splice(from, 1)
			next.splice(to, 0, moved)
			return next.map((section, index) => ({ ...section, order: index }))
		})
		setDragId(null)
	}

	return (
		<div className="flex min-h-0 flex-1 flex-col xl:grid xl:grid-cols-[minmax(0,240px)_minmax(0,1fr)_minmax(0,260px)]">
			<aside className="max-h-52 shrink-0 overflow-y-auto border-b border-neutral-200 bg-white xl:max-h-none xl:overflow-visible xl:border-b-0 xl:border-r">
				<div className="border-b border-neutral-100 px-4 py-3">
					<p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
						Sections
					</p>
				</div>
				<div className="space-y-1 p-2">
					{sortSections(sections).map((section) => {
						const Icon = sectionIcon(section.type)
						const expanded = expandedId === section.id
						return (
							<div key={section.id}>
								<div
									draggable
									onDragStart={() => handleDragStart(section.id)}
									onDragOver={(event: DragEvent) => event.preventDefault()}
									onDrop={() => handleDrop(section.id)}
									className={cn(
										"flex items-center gap-1 rounded-lg border px-1.5 py-1.5 transition-colors",
										activeSectionId === section.id
											? "border-primary/30 bg-primary/5"
											: "border-transparent hover:bg-neutral-50",
										dragId === section.id && "opacity-60",
									)}
								>
									<span
										className="cursor-grab px-1 text-neutral-400 active:cursor-grabbing"
										aria-hidden
									>
										<GripVertical className="size-3.5" />
									</span>
									<button
										type="button"
										className="flex min-w-0 flex-1 items-center gap-2 text-left"
										onClick={() => handleSectionClick(section.id)}
									>
										<Icon
											className="size-3.5 shrink-0 text-neutral-500"
											aria-hidden
										/>
										<span className="truncate text-sm font-medium text-neutral-800">
											{section.title}
										</span>
										{section.issueCount ? (
											<span className="inline-flex items-center gap-0.5 rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
												<AlertCircle className="size-2.5" aria-hidden />
												{section.issueCount}
											</span>
										) : null}
									</button>
									{expanded ? (
										<ChevronDown className="size-3.5 text-neutral-400" />
									) : (
										<ChevronRight className="size-3.5 text-neutral-400" />
									)}
								</div>
								{expanded ? (
									<div className="ml-8 space-y-1 py-1 pr-2">
										{section.blocks
											.sort((a, b) => a.order - b.order)
											.map((block) => (
												<p
													key={block.id}
													className="truncate text-xs text-neutral-500"
												>
													{block.content || `(empty ${block.type})`}
												</p>
											))}
									</div>
								) : null}
							</div>
						)
					})}
					<button
						type="button"
						className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 px-3 py-2.5 text-sm font-medium text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50"
					>
						<Plus className="size-4" aria-hidden />
						Add Custom Section
					</button>
				</div>
			</aside>

			<section className="relative flex min-h-[min(480px,60dvh)] min-w-0 flex-1 flex-col bg-neutral-100/90 xl:min-h-0">
				<div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
					<article className="mx-auto min-h-[640px] w-full max-w-[720px] rounded-sm bg-white px-6 py-8 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_12px_40px_rgba(0,0,0,0.08)] sm:px-8 sm:py-10 lg:px-10">
						{sortSections(sections).map((section) => (
							<div
								key={section.id}
								ref={(node) => {
									previewRefs.current[section.id] = node
								}}
								className={cn(
									"mb-6 scroll-mt-8 rounded-md transition-shadow",
									activeSectionId === section.id &&
										"ring-2 ring-primary/20 ring-offset-2",
								)}
							>
								{section.type !== "header" ? (
									<h2 className="mb-2 border-b border-neutral-300 pb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-neutral-700">
										{section.title}
									</h2>
								) : null}
								{section.blocks
									.sort((a, b) => a.order - b.order)
									.map((block) => (
										<EditableBlock
											key={block.id}
											block={block}
											isName={section.type === "header" && block.type === "heading"}
											editing={editingBlockId === block.id}
											onStartEdit={() => setEditingBlockId(block.id)}
											onCommit={(content) => {
												updateBlockContent(block.id, content)
												setEditingBlockId(null)
											}}
											onCancel={() => setEditingBlockId(null)}
										/>
									))}
							</div>
						))}
					</article>
				</div>
				<div className="flex items-center justify-center gap-2 border-t border-neutral-200 bg-white/90 px-4 py-2">
					<Button type="button" size="sm" variant="ghost" disabled>
						<ZoomOut className="size-4" aria-hidden />
					</Button>
					<span className="text-xs font-medium text-neutral-500">100%</span>
					<Button type="button" size="sm" variant="ghost" disabled>
						<ZoomIn className="size-4" aria-hidden />
					</Button>
					<span className="mx-2 h-4 w-px bg-neutral-200" aria-hidden />
					<Button type="button" size="sm" variant="ghost" disabled>
						Fit to Page
					</Button>
				</div>
			</section>

			<aside className="shrink-0 overflow-y-auto border-t border-neutral-200 bg-white xl:max-h-[calc(100dvh-8rem)] xl:border-t-0 xl:border-l">
				<div className="space-y-4 p-4">
					{showJobForm ? (
						<div className="space-y-4">
							<div className="space-y-1">
								<p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
									Job details
								</p>
								<p className={`text-xs ${DASHBOARD_THEME.muted}`}>
									{jobDetailsComplete
										? "Edit the role you are targeting."
										: "Add title, company, and description to unlock scoring."}
								</p>
								<p className={`text-xs ${DASHBOARD_THEME.muted}`}>
									Added {addedLabel}
								</p>
							</div>

							<div className="space-y-2">
								<span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
									Status
								</span>
								<div className="flex flex-wrap items-center gap-2">
									<ApplicationsStatusBadge status={status} />
									<select
										aria-label="Application status"
										className={APPLICATIONS_THEME.select}
										value={status}
										disabled={updatingStatus}
										onChange={(event) => {
											const value = event.target.value
											if (isApplicationStatus(value)) {
												onStatusChange(value)
											}
										}}
									>
										{APPLICATION_STATUSES.map((item) => (
											<option key={item} value={item}>
												{item}
											</option>
										))}
									</select>
									{updatingStatus ? (
										<Loader2
											className="size-4 animate-spin text-primary"
											aria-hidden
										/>
									) : null}
								</div>
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="resume-job-title"
									className={PROFILE_SURFACE.fieldLabel}
								>
									Job title
								</Label>
								<Input
									id="resume-job-title"
									value={form.jobTitle}
									onChange={(event) =>
										onPatchForm({ jobTitle: event.target.value })
									}
									className={PROFILE_SURFACE.fieldInput}
									placeholder="e.g. Senior Software Engineer"
								/>
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="resume-company"
									className={PROFILE_SURFACE.fieldLabel}
								>
									Company name
								</Label>
								<Input
									id="resume-company"
									value={form.companyName}
									onChange={(event) =>
										onPatchForm({ companyName: event.target.value })
									}
									className={PROFILE_SURFACE.fieldInput}
									placeholder="e.g. Acme Corp"
								/>
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="resume-job-url"
									className={PROFILE_SURFACE.fieldLabel}
								>
									Job posting URL
								</Label>
								<div className="flex flex-col gap-2">
									<Input
										id="resume-job-url"
										type="url"
										placeholder="https://…"
										value={form.jobUrl}
										onChange={(event) =>
											onPatchForm({ jobUrl: event.target.value })
										}
										className={PROFILE_SURFACE.fieldInput}
									/>
									{form.jobUrl.trim() ? (
										<a
											href={form.jobUrl.trim()}
											target="_blank"
											rel="noopener noreferrer"
											className={cn(
												DASHBOARD_THEME.link,
												"inline-flex items-center gap-1 text-sm",
											)}
										>
											Open posting
											<ExternalLink className="size-3.5" aria-hidden />
										</a>
									) : null}
								</div>
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="resume-job-description"
									className={PROFILE_SURFACE.fieldLabel}
								>
									Job description
								</Label>
								<Textarea
									id="resume-job-description"
									rows={8}
									placeholder="Paste the job description…"
									value={form.jobDescription}
									onChange={(event) =>
										onPatchForm({ jobDescription: event.target.value })
									}
									className={cn(
										PROFILE_SURFACE.fieldTextarea,
										"min-h-[160px] resize-y",
									)}
								/>
							</div>

							<div className="flex flex-col gap-2">
								<Button
									type="button"
									className="w-full gap-2"
									disabled={savingDetails || !jobDetailsComplete}
									onClick={handleSaveJobDetails}
								>
									{savingDetails ? (
										<Loader2 className="size-4 animate-spin" aria-hidden />
									) : (
										<Save className="size-4" aria-hidden />
									)}
									Save details
								</Button>
								{jobDetailsComplete ? (
									<Button
										type="button"
										variant="outline"
										className="w-full"
										onClick={() => setIsEditingJob(false)}
									>
										Done editing
									</Button>
								) : (
									<p className="text-center text-xs text-amber-700">
										Title, company, and description are required.
									</p>
								)}
								{onDelete ? (
									<div className="pt-1">
										<DeleteApplicationControl
											applicationId={form.id}
											jobTitle={form.jobTitle}
											companyName={form.companyName}
											isDeleting={isDeleting}
											onDelete={onDelete}
											redirectOnSuccess
											variant="detail"
										/>
									</div>
								) : null}
							</div>
						</div>
					) : (
						<>
							<div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-3">
								<div className="flex items-start justify-between gap-2">
									<div className="min-w-0">
										<p className="truncate text-sm font-semibold text-neutral-900">
											{form.jobTitle}
										</p>
										<p className="truncate text-xs text-neutral-600">
											{form.companyName}
										</p>
									</div>
									<Button
										type="button"
										size="sm"
										variant="ghost"
										className="shrink-0 gap-1.5"
										onClick={() => setIsEditingJob(true)}
									>
										<Pencil className="size-3.5" aria-hidden />
										Edit
									</Button>
								</div>
							</div>

							<ScoreGauge score={score} issues={issueTotal} />
							<Button
								type="button"
								className="w-full gap-2"
								onClick={onGenerate}
							>
								<Sparkles className="size-4" aria-hidden />
								Generate Tailored Resume
							</Button>
							<AccordionPanel
								title="Keywords Match"
								count={mockJobMatch.keywordsMissing.length}
								open={keywordsOpen}
								onToggle={() => setKeywordsOpen((prev) => !prev)}
							>
								<div className="space-y-3">
									<div>
										<p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
											Found
										</p>
										<div className="mt-1.5 flex flex-wrap gap-1.5">
											{mockJobMatch.keywordsFound.map((word) => (
												<span
													key={word}
													className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800"
												>
													{word}
												</span>
											))}
										</div>
									</div>
									<div>
										<p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
											Missing
										</p>
										<div className="mt-1.5 flex flex-wrap gap-1.5">
											{mockJobMatch.keywordsMissing.map((word) => (
												<span
													key={word}
													className="rounded-md bg-amber-50 px-2 py-0.5 text-xs text-amber-900"
												>
													{word}
												</span>
											))}
										</div>
									</div>
								</div>
							</AccordionPanel>
							<AccordionPanel
								title="Content Strength"
								count={issueTotal}
								open={contentOpen}
								onToggle={() => setContentOpen((prev) => !prev)}
							>
								<ul className="space-y-2 text-sm text-neutral-600">
									<li>Add more measurable outcomes to your summary.</li>
									<li>
										One experience bullet may be too tool-specific for this JD.
									</li>
								</ul>
							</AccordionPanel>
						</>
					)}
				</div>
			</aside>
		</div>
	)
}

function ScoreGauge({ score, issues }: { score: number; issues: number }) {
	const radius = 54
	const circumference = 2 * Math.PI * radius
	const progress = Math.min(100, Math.max(0, score)) / 100
	const offset = circumference * (1 - progress)

	return (
		<div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-4 text-center">
			<p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
				Resume Score
			</p>
			<div className="relative mx-auto mt-3 size-32">
				<svg viewBox="0 0 128 128" className="size-full -rotate-90">
					<circle
						cx="64"
						cy="64"
						r={radius}
						fill="none"
						stroke="#e5e7eb"
						strokeWidth="10"
					/>
					<circle
						cx="64"
						cy="64"
						r={radius}
						fill="none"
						stroke="currentColor"
						strokeWidth="10"
						strokeLinecap="round"
						strokeDasharray={circumference}
						strokeDashoffset={offset}
						className="text-primary transition-[stroke-dashoffset] duration-500"
					/>
				</svg>
				<div className="absolute inset-0 flex flex-col items-center justify-center">
					<p className="font-display text-3xl font-semibold tabular-nums text-neutral-900">
						{score}
					</p>
					<p className="text-[11px] text-neutral-500">/ 100</p>
				</div>
			</div>
			<p className="mt-2 text-sm text-neutral-600">
				{issues} issue{issues === 1 ? "" : "s"} found
			</p>
		</div>
	)
}

function AccordionPanel({
	title,
	count,
	open,
	onToggle,
	children,
}: {
	title: string
	count: number
	open: boolean
	onToggle: () => void
	children: ReactNode
}) {
	return (
		<div className="rounded-xl border border-neutral-200">
			<button
				type="button"
				className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
				onClick={onToggle}
			>
				<span className="text-sm font-semibold text-neutral-800">{title}</span>
				<span className="flex items-center gap-2">
					<span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold text-neutral-600">
						{count}
					</span>
					{open ? (
						<ChevronDown className="size-4 text-neutral-400" />
					) : (
						<ChevronRight className="size-4 text-neutral-400" />
					)}
				</span>
			</button>
			{open ? <div className="border-t border-neutral-100 px-3 py-3">{children}</div> : null}
		</div>
	)
}

function EditableBlock({
	block,
	isName,
	editing,
	onStartEdit,
	onCommit,
	onCancel,
}: {
	block: MockBlock
	isName?: boolean
	editing: boolean
	onStartEdit: () => void
	onCommit: (content: string) => void
	onCancel: () => void
}) {
	const [draft, setDraft] = useState(block.content)

	useEffect(() => {
		if (editing) {
			setDraft(block.content)
		}
	}, [editing, block.content]) // eslint-disable-line react-hooks/exhaustive-deps

	if (!editing) {
		if (block.type === "bullet") {
			return (
				<button
					type="button"
					className="mb-1 flex w-full gap-2 rounded px-1 py-0.5 text-left text-[13px] leading-relaxed text-neutral-800 hover:bg-neutral-50"
					onClick={onStartEdit}
				>
					<span aria-hidden>•</span>
					<span>{block.content}</span>
				</button>
			)
		}
		return (
			<button
				type="button"
				className={cn(
					"mb-1 block w-full rounded px-1 py-0.5 text-left hover:bg-neutral-50",
					isName
						? "font-display text-3xl font-semibold tracking-tight text-neutral-900"
						: block.type === "contact_line" || block.type === "date_range"
							? "text-sm text-neutral-600"
							: "text-[13.5px] leading-relaxed text-neutral-800",
				)}
				onClick={onStartEdit}
			>
				{block.content}
			</button>
		)
	}

	return (
		<textarea
			autoFocus
			value={draft}
			onChange={(event) => setDraft(event.target.value)}
			onBlur={() => onCommit(draft)}
			onKeyDown={(event: KeyboardEvent<HTMLTextAreaElement>) => {
				if (event.key === "Escape") {
					event.preventDefault()
					setDraft(block.content)
					onCancel()
				}
				if (event.key === "Enter" && !event.shiftKey && block.type !== "text") {
					event.preventDefault()
					onCommit(draft)
				}
			}}
			className={cn(
				"mb-1 w-full resize-y rounded border border-primary/40 bg-white px-2 py-1 outline-none ring-2 ring-primary/15",
				isName
					? "min-h-12 font-display text-3xl font-semibold"
					: "min-h-16 text-sm",
			)}
		/>
	)
}
