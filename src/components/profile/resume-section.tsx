/**
 * Resume section for profile: upload, replace, and auto-fill from resume.
 */

import { useCallback, useRef, useState } from "react"
import {
	ExternalLink,
	FileText,
	PenLine,
	RefreshCw,
	Upload,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { useResume } from "../../../hooks/useResume"
import { getAllowedAccept, isAllowedFile, prefillResume } from "../../../src/lib/resume"
import { RESUME_SECTION_THEME } from "@/lib/resume-section-theme"
import { cn } from "@/lib/utils"

function formatDate(iso: string): string {
	try {
		return new Date(iso).toLocaleDateString(undefined, {
			month: "short",
			day: "numeric",
			year: "numeric",
		})
	} catch {
		return ""
	}
}

interface ResumeSectionProps {
	userId: string | null
	refetchProfile: () => void
}

export function ResumeSection({ userId, refetchProfile }: ResumeSectionProps) {
	const {
		resume,
		isLoading,
		uploading,
		error,
		uploadResume,
		clearError,
	} = useResume(userId ?? undefined)

	const [dragActive, setDragActive] = useState(false)
	const [replaceMode, setReplaceMode] = useState(false)
	const [validationError, setValidationError] = useState<string | null>(null)
	const inputRef = useRef<HTMLInputElement>(null)
	const [autoFillLoading, setAutoFillLoading] = useState(false)

	const handleFile = useCallback(
		(file: File | null) => {
			if (!file) return
			clearError()
			setValidationError(null)
			const check = isAllowedFile(file)
			if (!check.ok) {
				setValidationError(check.error)
				return
			}
			uploadResume(file).then(() => setReplaceMode(false))
			inputRef.current?.form?.reset()
		},
		[uploadResume, clearError],
	)

	const onDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault()
			setDragActive(false)
			handleFile(e.dataTransfer.files[0] ?? null)
		},
		[handleFile],
	)

	const onDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		setDragActive(true)
	}, [])

	const onDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		setDragActive(false)
	}, [])

	const openFilePicker = useCallback(() => {
		inputRef.current?.click()
	}, [])

	const handleAutoFill = useCallback(async () => {
		if (!resume || !userId || autoFillLoading) return
		setAutoFillLoading(true)
		try {
			await prefillResume(userId)
			await refetchProfile()
			toast.success("Resume auto-filled successfully")
		} catch (err) {
			console.error("Something went wrong auto-filling resume:", err)
			toast.error("Failed to auto-fill resume")
		} finally {
			setAutoFillLoading(false)
		}
	}, [userId, resume, autoFillLoading, refetchProfile])

	if (!userId) return null

	if (isLoading) {
		return (
			<section className={RESUME_SECTION_THEME.section}>
				<div className="flex items-center gap-3 p-4">
					<div
						className={cn(
							"h-10 w-10 shrink-0 rounded-xl",
							RESUME_SECTION_THEME.skeleton,
						)}
					/>
					<div className="min-w-0 flex-1 space-y-2">
						<div
							className={cn("h-4 w-24 rounded", RESUME_SECTION_THEME.skeleton)}
						/>
						<div
							className={cn("h-3 w-32 rounded", RESUME_SECTION_THEME.skeleton)}
						/>
					</div>
				</div>
			</section>
		)
	}

	const showUploadZone = !resume || replaceMode
	const showUploading = uploading

	return (
		<section className={RESUME_SECTION_THEME.section}>
			<div className={RESUME_SECTION_THEME.sectionHeader}>
				<div className={RESUME_SECTION_THEME.iconWrap}>
					<FileText className="h-4 w-4" strokeWidth={1.5} />
				</div>
				<div className="min-w-0 flex-1">
					<h2 className={RESUME_SECTION_THEME.title}>Resume</h2>
					<p className={RESUME_SECTION_THEME.subtitle}>
						Used for autofill, ATS resume, and cover letters
					</p>
				</div>
			</div>

			<div className={RESUME_SECTION_THEME.body}>
				{(error || validationError) && (
					<div className={RESUME_SECTION_THEME.error}>
						<span>{error || validationError}</span>
						<button
							type="button"
							onClick={clearError}
							className={RESUME_SECTION_THEME.errorDismiss}
						>
							Dismiss
						</button>
					</div>
				)}

				{showUploadZone ? (
					<form
						onSubmit={(e) => e.preventDefault()}
						onDrop={onDrop}
						onDragOver={onDragOver}
						onDragLeave={onDragLeave}
						className="block"
					>
						<input
							ref={inputRef}
							type="file"
							accept={getAllowedAccept()}
							onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
							className="absolute h-0 w-0 opacity-0"
							aria-label="Choose resume file"
							disabled={showUploading}
						/>
						<button
							type="button"
							onClick={openFilePicker}
							disabled={showUploading}
							className={cn(
								RESUME_SECTION_THEME.uploadZone.base,
								dragActive
									? RESUME_SECTION_THEME.uploadZone.active
									: RESUME_SECTION_THEME.uploadZone.idle,
								showUploading && RESUME_SECTION_THEME.uploadZone.disabled,
							)}
						>
							{showUploading ? (
								<div className="flex flex-col items-center gap-3">
									<RefreshCw className="h-8 w-8 animate-spin text-primary" />
									<span className={RESUME_SECTION_THEME.uploadTitle}>
										Uploading & parsing…
									</span>
								</div>
							) : (
								<div className="flex flex-col items-center gap-3">
									<div className={RESUME_SECTION_THEME.uploadIcon}>
										<Upload className="h-6 w-6" strokeWidth={1.5} />
									</div>
									<span className={RESUME_SECTION_THEME.uploadTitle}>
										{resume
											? "Drop a new file or click to replace"
											: "Drop your resume here or click to upload"}
									</span>
									<span className={RESUME_SECTION_THEME.uploadHint}>
										PDF or Word (.pdf, .doc, .docx), max 5 MB
									</span>
								</div>
							)}
						</button>
						{resume && replaceMode && (
							<button
								type="button"
								onClick={() => {
									setReplaceMode(false)
									setValidationError(null)
								}}
								className={RESUME_SECTION_THEME.cancelButton}
							>
								Cancel
							</button>
						)}
					</form>
				) : (
					<div className="space-y-4">
						<div className={RESUME_SECTION_THEME.fileCard}>
							<div className={RESUME_SECTION_THEME.fileIcon}>
								<FileText
									className="h-5 w-5 text-primary"
									strokeWidth={1.5}
								/>
							</div>
							<div className="min-w-0 flex-1">
								<p className={RESUME_SECTION_THEME.fileTitle}>
									{resume?.title || "Resume"}
								</p>
								<p className={RESUME_SECTION_THEME.fileMeta}>
									{resume?.updated_at
										? `Updated ${formatDate(resume.updated_at)}`
										: "Ready to use"}
								</p>
							</div>
						</div>
						<div className="flex flex-wrap gap-2">
							{resume?.original_file_url && (
								<a
									href={resume.original_file_url}
									target="_blank"
									rel="noopener noreferrer"
									className={RESUME_SECTION_THEME.primaryButton}
								>
									<ExternalLink className="h-3.5 w-3.5" />
									View file
								</a>
							)}
							<button
								type="button"
								onClick={() => setReplaceMode(true)}
								className={RESUME_SECTION_THEME.secondaryButton}
							>
								<Upload className="h-3.5 w-3.5" />
								Replace resume
							</button>
						</div>
					</div>
				)}

				<div className={RESUME_SECTION_THEME.autofillPanel}>
					<button
						type="button"
						onClick={() => void handleAutoFill()}
						disabled={!resume || autoFillLoading}
						title={
							autoFillLoading
								? "Auto-filling resume..."
								: resume
									? "Auto-fill application forms using your resume"
									: "Upload a resume to enable"
						}
						aria-label="Auto-fill form from resume"
						className={RESUME_SECTION_THEME.autofillButton}
					>
						<div className={RESUME_SECTION_THEME.autofillIcon}>
							<PenLine className="h-5 w-5" strokeWidth={1.5} />
						</div>
						<div className="min-w-0 flex-1">
							<span className={RESUME_SECTION_THEME.autofillTitle}>
								{autoFillLoading
									? "Auto-filling resume..."
									: "Auto-fill form from resume"}
							</span>
							<span className={RESUME_SECTION_THEME.autofillHint}>
								{resume
									? "Fill application fields using your saved resume"
									: "Upload a resume above to enable"}
							</span>
						</div>
					</button>
				</div>
			</div>
		</section>
	)
}
