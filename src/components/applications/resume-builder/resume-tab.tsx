import {
	useRef,
	useState,
	type DragEvent,
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
import {
	applyEditableText,
	getEditableText,
	getBlockPreviewText,
	sortBlocks,
	sortSections,
} from "@/components/applications/resume-builder/app-resume-utils"
import { AccordionPanel } from "@/components/applications/resume-builder/accordion-panel"
import { mockAppResume } from "@/components/applications/resume-builder/mock-app-resume"
import { ResumeDocumentPreview } from "@/components/applications/resume-builder/resume-document-preview"
import { ScoreGauge } from "@/components/applications/resume-builder/score-gauge"
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
import type {
	AppResume,
	AppResumeBlock,
	AppResumeSectionType,
} from "@/types/app-resume"
import type { ApplicationDetailForm } from "@/types/application-detail"
import { cn } from "@/lib/utils"

function hasCompleteJobDetails(form: ApplicationDetailForm) {
	return (
		form.jobTitle.trim().length > 0 &&
		form.companyName.trim().length > 0 &&
		form.jobDescription.trim().length > 0
	)
}

const mockScores = {
	original: 61,
	tailored: 84,
}

const mockJobMatch = {
	keywordsFound: ["React", "TypeScript", "REST API", "PostgreSQL"],
	keywordsMissing: ["GraphQL", "AWS", "CI/CD"],
}

function sectionIcon(type: AppResumeSectionType) {
	switch (type) {
		case "header":
			return UserRound
		case "summary":
			return FileText
		case "experience":
			return Briefcase
		case "education":
			return GraduationCap
		case "skills":
			return Wrench
		default:
			return FileText
	}
}

interface ResumeTabProps {
	appResume: AppResume | null
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
	appResume,
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
	const seedSections =
		appResume?.sections?.length
			? appResume.sections
			: mockAppResume.sections

	const [sections, setSections] = useState(() =>
		sortSections(structuredClone(seedSections)),
	)
	const [expandedId, setExpandedId] = useState<string | null>(
		seedSections[0]?.id ?? null,
	)
	const [activeSectionId, setActiveSectionId] = useState(
		seedSections[0]?.id ?? "",
	)
	const [editingBlockId, setEditingBlockId] = useState<string | null>(null)
	const [editingDraft, setEditingDraft] = useState("")
	const [editingFormData, setEditingFormData] = useState<Record<string, unknown> | null>(null)
	const [keywordsOpen, setKeywordsOpen] = useState(true)
	const [contentOpen, setContentOpen] = useState(true)
	const [isEditingJob, setIsEditingJob] = useState(
		() => !hasCompleteJobDetails(form),
	)
	const [dragId, setDragId] = useState<string | null>(null)
	const [pageCount, setPageCount] = useState(1)
	const previewRefs = useRef<Record<string, HTMLElement | null>>({})

	const issueTotal = sections.reduce(
		(sum, section) => sum + (section.issueCount ?? 0),
		0,
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

	function updateBlock(nextBlock: AppResumeBlock) {
		setSections((prev) =>
			prev.map((section) => ({
				...section,
				blocks: section.blocks.map((block) =>
					block.id === nextBlock.id ? nextBlock : block,
				),
			})),
		)
	}

	function handleStartEditBlock(block: AppResumeBlock) {
		setEditingBlockId(block.id)
		setEditingDraft(getEditableText(block))
		setEditingFormData(
			typeof block.content_json === "object" && block.content_json
				? structuredClone(block.content_json as Record<string, unknown>)
				: null,
		)
	}

	function handleCancelEditBlock() {
		setEditingBlockId(null)
		setEditingDraft("")
		setEditingFormData(null)
	}

	function updateEditingField(field: string, value: unknown) {
		setEditingFormData((prev) => ({
			...(prev ?? {}),
			[field]: value,
		}))
	}

	function handleApplyEditBlock(block: AppResumeBlock) {
		if (
			(block.block_type === "job_entry" ||
				block.block_type === "education_entry" ||
				block.block_type === "skill_entry" ||
				block.block_type === "project_entry") &&
			editingFormData
		) {
			const nextContent =
				block.block_type === "job_entry"
					? {
							title: stringValue(editingFormData.title),
							company: stringValue(editingFormData.company),
							start_date: nullableStringValue(editingFormData.start_date),
							end_date: nullableStringValue(editingFormData.end_date),
							description: stringListValue(editingFormData.description),
						}
					: block.block_type === "education_entry"
						? {
								school: stringValue(editingFormData.school),
								degree: stringValue(editingFormData.degree),
								start_date: nullableStringValue(editingFormData.start_date),
								end_date: nullableStringValue(editingFormData.end_date),
							}
						: block.block_type === "skill_entry"
							? {
									name: stringValue(editingFormData.name),
									categoryId: numberValue(editingFormData.categoryId),
									categoryName: stringValue(editingFormData.categoryName),
								}
							: {
									name: stringValue(editingFormData.name),
									description: stringListValue(editingFormData.description),
								}

			updateBlock({
				...block,
				content_json: nextContent,
			})
			setEditingBlockId(null)
			setEditingDraft("")
			setEditingFormData(null)
			return
		}

		updateBlock({
			...block,
			content_json: applyEditableText(block, editingDraft),
		})
		setEditingBlockId(null)
		setEditingDraft("")
		setEditingFormData(null)
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
			return next.map((section, index) => ({ ...section, sort_key: index }))
		})
		setDragId(null)
	}

	return (
		<div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden xl:grid xl:grid-cols-[minmax(0,400px)_minmax(0,1fr)_minmax(0,260px)]">
			<aside className="flex max-h-72 min-h-0 shrink-0 flex-col overflow-hidden border-b border-neutral-200 bg-white xl:max-h-none xl:h-full xl:border-b-0 xl:border-r">
				<div className="shrink-0 border-b border-neutral-100 px-4 py-3">
					<p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
						Sections
					</p>
				</div>
				<div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-3">
					{sortSections(sections).map((section) => {
						const Icon = sectionIcon(section.section_type)
						const expanded = expandedId === section.id
						return (
							<div key={section.id} className="rounded-xl border border-neutral-200/80">
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
											{section.display_name}
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
									<div className="space-y-2 border-t border-neutral-100 px-3 pb-3 pt-2">
										{sortBlocks(section.blocks).map((block) => {
											const isEditing = editingBlockId === block.id
											const formData = editingFormData ?? {}
											return (
												<div
													key={block.id}
													className={cn(
														"rounded-lg border p-2 transition-colors",
														isEditing
															? "border-primary/40 bg-primary/5"
															: "border-neutral-200 bg-white",
													)}
												>
													<div className="mb-1 flex items-center justify-between gap-2">
														<p className="truncate text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
															{block.block_type.replaceAll("_", " ")}
														</p>
														<Button
															type="button"
															size="sm"
															variant={isEditing ? "default" : "ghost"}
															className="h-7 gap-1.5 px-2 text-xs"
															onClick={() => handleStartEditBlock(block)}
														>
															<Pencil className="size-3.5" aria-hidden />
															Edit
														</Button>
													</div>
													{isEditing ? (
														<div className="space-y-2">
															{block.block_type === "job_entry" ? (
																<div className="space-y-2">
																	<Input
																		value={stringValue(formData.title)}
																		onChange={(event) => updateEditingField("title", event.target.value)}
																		placeholder="Job title"
																		className="h-9"
																	/>
																	<Input
																		value={stringValue(formData.company)}
																		onChange={(event) => updateEditingField("company", event.target.value)}
																		placeholder="Company"
																		className="h-9"
																	/>
																	<div className="grid grid-cols-2 gap-2">
																		<Input
																			type="date"
																			value={stringValue(formData.start_date)}
																			onChange={(event) =>
																				updateEditingField("start_date", event.target.value)
																			}
																			className="h-9"
																		/>
																		<Input
																			type="date"
																			value={stringValue(formData.end_date)}
																			onChange={(event) =>
																				updateEditingField("end_date", event.target.value)
																			}
																			className="h-9"
																		/>
																	</div>
																	<Textarea
																		value={stringListValue(formData.description).join("\n")}
																		onChange={(event) =>
																			updateEditingField("description", event.target.value)
																		}
																		placeholder="One bullet per line"
																		className="min-h-[110px] text-sm text-neutral-900"
																	/>
																</div>
															) : block.block_type === "education_entry" ? (
																<div className="space-y-2">
																	<Input
																		value={stringValue(formData.degree)}
																		onChange={(event) => updateEditingField("degree", event.target.value)}
																		placeholder="Degree"
																		className="h-9"
																	/>
																	<Input
																		value={stringValue(formData.school)}
																		onChange={(event) => updateEditingField("school", event.target.value)}
																		placeholder="School"
																		className="h-9"
																	/>
																	<div className="grid grid-cols-2 gap-2">
																		<Input
																			type="date"
																			value={stringValue(formData.start_date)}
																			onChange={(event) =>
																				updateEditingField("start_date", event.target.value)
																			}
																			className="h-9"
																		/>
																		<Input
																			type="date"
																			value={stringValue(formData.end_date)}
																			onChange={(event) =>
																				updateEditingField("end_date", event.target.value)
																			}
																			className="h-9"
																		/>
																	</div>
																</div>
															) : block.block_type === "skill_entry" ? (
																<div className="space-y-2">
																	<Input
																		value={stringValue(formData.name)}
																		onChange={(event) => updateEditingField("name", event.target.value)}
																		placeholder="Skill name"
																		className="h-9"
																	/>
																	<div className="grid grid-cols-2 gap-2">
																		<Input
																			type="number"
																			value={String(numberValue(formData.categoryId))}
																			onChange={(event) =>
																				updateEditingField("categoryId", Number(event.target.value))
																			}
																			placeholder="Category ID"
																			className="h-9"
																		/>
																		<Input
																			value={stringValue(formData.categoryName)}
																			onChange={(event) =>
																				updateEditingField("categoryName", event.target.value)
																			}
																			placeholder="Category name"
																			className="h-9"
																		/>
																	</div>
																</div>
															) : block.block_type === "project_entry" ? (
																<div className="space-y-2">
																	<Input
																		value={stringValue(formData.name)}
																		onChange={(event) => updateEditingField("name", event.target.value)}
																		placeholder="Project name"
																		className="h-9"
																	/>
																	<Textarea
																		value={stringListValue(formData.description).join("\n")}
																		onChange={(event) =>
																			updateEditingField("description", event.target.value)
																		}
																		placeholder="One bullet per line"
																		className="min-h-[110px] text-sm text-neutral-900"
																	/>
																</div>
															) : (
																<Textarea
																	value={editingDraft}
																	onChange={(event) => setEditingDraft(event.target.value)}
																	className="min-h-[120px] text-sm text-neutral-900"
																/>
															)}
															<div className="flex items-center gap-2">
																<Button
																	type="button"
																	size="sm"
																	className="gap-1.5"
																	onClick={() => handleApplyEditBlock(block)}
																>
																	<Save className="size-3.5" aria-hidden />
																	Apply
																</Button>
																<Button
																	type="button"
																	size="sm"
																	variant="outline"
																	onClick={handleCancelEditBlock}
																>
																	Cancel
																</Button>
															</div>
														</div>
													) : (
														<p className="line-clamp-2 text-xs leading-relaxed text-neutral-600">
															{getBlockPreviewText(block)}
														</p>
													)}
												</div>
											)
										})}
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

			<section className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-neutral-100/90 xl:h-full">
				<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
					<ResumeDocumentPreview
						sections={sections}
						activeSectionId={activeSectionId}
						sectionRefs={previewRefs}
						onPageCountChange={setPageCount}
					/>
				</div>
				<div className="flex shrink-0 items-center justify-center gap-2 border-t border-neutral-200 bg-white/90 px-4 py-2">
					<Button type="button" size="sm" variant="ghost" disabled>
						<ZoomOut className="size-4" aria-hidden />
					</Button>
					<span className="text-xs font-medium text-neutral-500">100%</span>
					<Button type="button" size="sm" variant="ghost" disabled>
						<ZoomIn className="size-4" aria-hidden />
					</Button>
					<span className="mx-2 h-4 w-px bg-neutral-200" aria-hidden />
					<span className="text-xs font-medium text-neutral-500">
						{pageCount} page{pageCount === 1 ? "" : "s"}
					</span>
				</div>
			</section>

			<aside className="flex max-h-72 min-h-0 shrink-0 flex-col overflow-hidden border-t border-neutral-200 bg-white xl:max-h-none xl:h-full xl:border-t-0 xl:border-l">
				<div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4">
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

function stringValue(value: unknown): string {
	if (typeof value === "string") return value
	return ""
}

function nullableStringValue(value: unknown): string | null {
	const next = stringValue(value).trim()
	return next.length > 0 ? next : null
}

function numberValue(value: unknown): number {
	if (typeof value === "number" && Number.isFinite(value)) return value
	const parsed = Number(value)
	return Number.isFinite(parsed) ? parsed : 0
}

function stringListValue(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value
			.map((item) => (typeof item === "string" ? item.trim() : ""))
			.filter(Boolean)
	}
	if (typeof value === "string") {
		return value
			.split("\n")
			.map((item) => item.trim())
			.map((item) => item.replace(/^•\s*/, ""))
			.filter(Boolean)
	}
	return []
}
