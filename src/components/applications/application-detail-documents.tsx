import { useEffect, useState } from "react"
import {
	Download,
	FileText,
	Loader2,
	Mail,
	Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
	downloadFromUrl,
	downloadTextContent,
	invokeGenerateCoverLetter,
	invokeGenerateResume,
} from "@/lib/application-generation"
import { APPLICATIONS_THEME } from "@/lib/applications-theme"
import { DASHBOARD_THEME } from "@/lib/dashboard-theme"
import {
	COVER_LETTER_TONE_META,
	COVER_LETTER_TONES,
	type CoverLetterTone,
} from "@/lib/cover-letter-tone"
import { PROFILE_SURFACE } from "@/lib/profile-surface"
import type {
	ApplicationDetailForm,
	GeneratedDocumentRow,
} from "@/types/application-detail"
import { cn } from "@/lib/utils"
import { useGeneratedResume } from "../../../hooks/useGeneratedResume"
import { useGeneratedCoverLetter } from "../../../hooks/useGeneratedCoverLetter"
import { useProfilePage } from "@/hooks/use-profile-page"
import toast from "react-hot-toast"

interface ApplicationDetailDocumentsProps {
	applicationId: string
	form: ApplicationDetailForm
	generatedResume: GeneratedDocumentRow | null
	generatedCoverLetter: GeneratedDocumentRow | null
	onDocumentsUpdated: () => Promise<void>
}

export function ApplicationDetailDocuments({
	form,
	generatedResume,
	generatedCoverLetter,
	onDocumentsUpdated,
}: ApplicationDetailDocumentsProps) {
	const { getResumeDownloadUrl } = useGeneratedResume()
	const { getCoverLetterDownloadUrl } = useGeneratedCoverLetter()
	const { user, resumeText } = useProfilePage()

	const [tone, setTone] = useState<CoverLetterTone>("Professional")
	const [coverCompany, setCoverCompany] = useState(form.companyName)
	const [coverJobTitle, setCoverJobTitle] = useState(form.jobTitle)
	const [hiringManager, setHiringManager] = useState("")
	const [generatingResume, setGeneratingResume] = useState(false)
	const [generatingCover, setGeneratingCover] = useState(false)
	const [downloadingResume, setDownloadingResume] = useState(false)
	const [downloadingCover, setDownloadingCover] = useState(false)
	const [docError, setDocError] = useState<string | null>(null)
	const [docNotice, setDocNotice] = useState<string | null>(null)

	useEffect(() => {
		setCoverCompany(form.companyName)
		setCoverJobTitle(form.jobTitle)
	}, [form.companyName, form.jobTitle])

	async function handleGenerateResume() {
		if (!user) return
		setDocError(null)
		setDocNotice(null)
		setGeneratingResume(true)
		try {
			const result = await invokeGenerateResume({
				resumeText: resumeText ?? "",
				jdText: form.jobDescription.trim(),
				targetRole: form.jobTitle,
				userId: user.id,
				jobUrl: form.jobUrl,
			})
			if (!result.ok) {
				setDocError(result.message)
				return
			}
			if (result.data && "error" in result.data && result.data.error) {
				setDocError(String(result.data.error))
				return
			}
			setDocNotice("Resume generation started. Refreshing…")
			toast.success("Resume generated successfully")
			await onDocumentsUpdated()
		} catch (err) {
			console.error("Something went wrong generating resume:", err)
			setDocError(
				err instanceof Error ? err.message : "Resume generation failed.",
			)
		} finally {
			setGeneratingResume(false)
		}
	}

	async function handleGenerateCoverLetter() {
		if (!user) return
		setDocError(null)
		setDocNotice(null)
		setGeneratingCover(true)
		try {
			await invokeGenerateCoverLetter({
				resumeText: resumeText ?? "",
				jdText: form.jobDescription.trim(),
				userId: user.id,
				jobUrl: form.jobUrl,
				companyName: coverCompany.trim(),
				roleTitle: coverJobTitle.trim(),
				hiringManager: hiringManager.trim() ?? undefined,
				tone: tone,
			})
			setDocNotice("Cover letter generation started. Refreshing…")
			toast.success("Cover letter generated successfully")
			await onDocumentsUpdated()
		} catch (err) {
			console.error("Something went wrong generating cover letter:", err)
			setDocError(
				err instanceof Error
					? err.message
					: "Cover letter generation failed.",
			)
		} finally {
			setGeneratingCover(false)
		}
	}

	async function handleDownloadResume() {
		if (!generatedResume) return
		setDownloadingResume(true)
		setDocError(null)
		try {
			if (generatedResume.file_url) {
				const filename = `${form.companyName}-resume.pdf`
				const url = await getResumeDownloadUrl(generatedResume.id, filename)
				await downloadFromUrl(url, filename)
				return
			}
			downloadTextContent(
				generatedResume.content,
				`${form.companyName}-resume.txt`,
			)
		} catch (err) {
			console.error("Something went wrong downloading resume:", err)
			if (generatedResume.content) {
				downloadTextContent(
					generatedResume.content,
					`${form.companyName}-resume.txt`,
				)
			} else {
				setDocError(
					err instanceof Error ? err.message : "Download failed.",
				)
			}
		} finally {
			setDownloadingResume(false)
		}
	}

	async function handleDownloadCover() {
		if (!generatedCoverLetter) return
		setDownloadingCover(true)
		setDocError(null)
		try {
			if (generatedCoverLetter.file_url) {
				const filename = `${form.companyName}-cover-letter.pdf`
				const url = await getCoverLetterDownloadUrl(generatedCoverLetter.id, filename)
				await downloadFromUrl(url, filename)
				return
			}
			downloadTextContent(
				generatedCoverLetter.content,
				`${form.companyName}-cover-letter.txt`,
			)
		} catch (err) {
			console.error("Something went wrong downloading cover letter:", err)
			if (generatedCoverLetter.content) {
				downloadTextContent(
					generatedCoverLetter.content,
					`${form.companyName}-cover-letter.txt`,
				)
			} else {
				setDocError(
					err instanceof Error ? err.message : "Download failed.",
				)
			}
		} finally {
			setDownloadingCover(false)
		}
	}

	return (
		<section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
			{docError ? (
				<p
					className={cn("mb-4", APPLICATIONS_THEME.error)}
					role="alert"
				>
					{docError}
				</p>
			) : null}
			{docNotice ? (
				<p
					className={cn("mb-4", DASHBOARD_THEME.noticeSuccess)}
					role="status"
				>
					{docNotice}
				</p>
			) : null}

			<Tabs defaultValue="resume" className="w-full">
				<TabsList className={DASHBOARD_THEME.mainTabsList}>
					<TabsTrigger
						value="resume"
						className={DASHBOARD_THEME.mainTabsTrigger}
					>
						<FileText className="size-4 shrink-0 opacity-80" aria-hidden />
						Resume
					</TabsTrigger>
					<TabsTrigger
						value="cover"
						className={DASHBOARD_THEME.mainTabsTrigger}
					>
						<Mail className="size-4 shrink-0 opacity-80" aria-hidden />
						Cover letter
					</TabsTrigger>
				</TabsList>

				<TabsContent value="resume" className="mt-6 space-y-6 outline-none">
					<div className="rounded-xl border border-neutral-100 bg-neutral-50/80 p-4">
						<p className="text-sm leading-relaxed text-neutral-600">
							Generate a tailored resume aligned to this job description.
							Save application details first so the latest description is
							used.
						</p>
					</div>

					{!generatedResume ? <Button
						type="button"
						size="lg"
						className="w-full gap-2 sm:w-auto"
						disabled={generatingResume}
						onClick={() => void handleGenerateResume()}
					>
						{generatingResume ? (
							<Loader2 className="size-4 animate-spin" aria-hidden />
						) : (
							<Sparkles className="size-4" aria-hidden />
						)}
						Generate tailored resume
					</Button> : null}

					{generatedResume ? (
						<GeneratedDocumentPreview
							title="Generated resume"
							content={generatedResume.content}
							createdAt={generatedResume.created_at}
							downloading={downloadingResume}
							onDownload={() => void handleDownloadResume()}
						/>
					) : (
						<EmptyDocumentHint label="No resume generated yet for this application." />
					)}
				</TabsContent>

				<TabsContent value="cover" className="mt-6 space-y-6 outline-none">
					<fieldset className="space-y-3">
						<legend className="text-sm font-semibold text-neutral-900">
							Tone
						</legend>
						<div className="grid gap-3 sm:grid-cols-3">
							{COVER_LETTER_TONES.map((option) => {
								const selected = tone === option
								return (
									<label
										key={option}
										className={cn(
											"cursor-pointer rounded-xl border p-4 transition-colors",
											selected
												? "border-primary bg-primary/5 ring-1 ring-primary/25"
												: "border-neutral-200 bg-white hover:border-primary/30",
										)}
									>
										<input
											type="radio"
											name="cover-tone"
											value={option}
											checked={selected}
											className="sr-only"
											onChange={() => setTone(option)}
										/>
										<span className="block text-sm font-semibold text-neutral-900">
											{option}
										</span>
										<span className="mt-1 block text-xs leading-relaxed text-neutral-500">
											{COVER_LETTER_TONE_META[option].description}
										</span>
									</label>
								)
							})}
						</div>
					</fieldset>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label
								htmlFor="cover-company"
								className={PROFILE_SURFACE.fieldLabel}
							>
								Company name
							</Label>
							<Input
								id="cover-company"
								value={coverCompany}
								onChange={(e) => setCoverCompany(e.target.value)}
								className={PROFILE_SURFACE.fieldInput}
							/>
						</div>
						<div className="space-y-2">
							<Label
								htmlFor="cover-job-title"
								className={PROFILE_SURFACE.fieldLabel}
							>
								Job title
							</Label>
							<Input
								id="cover-job-title"
								value={coverJobTitle}
								onChange={(e) => setCoverJobTitle(e.target.value)}
								className={PROFILE_SURFACE.fieldInput}
							/>
						</div>
						<div className="space-y-2 sm:col-span-2">
							<Label
								htmlFor="cover-hiring-manager"
								className={PROFILE_SURFACE.fieldLabel}
							>
								Hiring manager{" "}
								<span className="font-normal text-neutral-500">
									(optional)
								</span>
							</Label>
							<Input
								id="cover-hiring-manager"
								placeholder="e.g. Alex Chen"
								value={hiringManager}
								onChange={(e) => setHiringManager(e.target.value)}
								className={PROFILE_SURFACE.fieldInput}
							/>
						</div>
					</div>

					{generatedCoverLetter ? null : <Button
						type="button"
						size="lg"
						className="w-full gap-2 sm:w-auto"
						disabled={generatingCover}
						onClick={() => void handleGenerateCoverLetter()}
					>
						{generatingCover ? (
							<Loader2 className="size-4 animate-spin" aria-hidden />
						) : (
							<Sparkles className="size-4" aria-hidden />
						)}
						Generate cover letter
					</Button>}

					{generatedCoverLetter ? (
						<GeneratedDocumentPreview
							title="Generated cover letter"
							content={generatedCoverLetter.content}
							createdAt={generatedCoverLetter.created_at}
							downloading={downloadingCover}
							onDownload={() => void handleDownloadCover()}
						/>
					) : (
						<EmptyDocumentHint label="No cover letter generated yet for this application." />
					)}
				</TabsContent>
			</Tabs>
		</section>
	)
}

interface GeneratedDocumentPreviewProps {
	title: string
	content: string
	createdAt: string
	downloading: boolean
	onDownload: () => void
}

function GeneratedDocumentPreview({
	title,
	content,
	createdAt,
	downloading,
	onDownload,
}: GeneratedDocumentPreviewProps) {
	const createdLabel = new Date(createdAt).toLocaleString(undefined, {
		dateStyle: "medium",
		timeStyle: "short",
	})

	return (
		<div className="rounded-xl border border-neutral-200 bg-white p-4">
			<div className="mb-3 flex flex-wrap items-center justify-between gap-2">
				<div>
					<p className="text-sm font-semibold text-neutral-900">{title}</p>
					<p className="text-xs text-neutral-500">Created {createdLabel}</p>
				</div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="gap-2"
					disabled={downloading}
					onClick={onDownload}
				>
					{downloading ? (
						<Loader2 className="size-4 animate-spin" aria-hidden />
					) : (
						<Download className="size-4" aria-hidden />
					)}
					Download
				</Button>
			</div>
			{content ? (
				<pre className="thin-scrollbar max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border border-neutral-100 bg-neutral-50 p-3 font-sans text-sm leading-relaxed text-neutral-700">
					{content}
				</pre>
			) : (
				<p className="text-sm text-neutral-500">
					Document ready—use download to open the file.
				</p>
			)}
		</div>
	)
}

function EmptyDocumentHint({ label }: { label: string }) {
	return (
		<p className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50/50 px-4 py-6 text-center text-sm text-neutral-500">
			{label}
		</p>
	)
}
