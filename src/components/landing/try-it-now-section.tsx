import { motion, useReducedMotion } from "framer-motion"
import {
	ArrowRight,
	CheckCircle2,
	ClipboardPaste,
	Download,
	FileText,
	Loader2,
	Lock,
	TrendingDown,
	TrendingUp,
	Upload,
	X,
} from "lucide-react"
import {
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
	type ChangeEvent,
	type DragEvent,
	type KeyboardEvent,
} from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LandingSignupLink } from "@/components/landing/landing-signup-link"
import {
	LANDING_COPY,
	LANDING_PRIMARY_CTA_BUTTON_CLASS,
} from "@/lib/landing-copy"
import {
	LANDING_EASE_OUT,
	landingRevealViewport,
} from "@/lib/landing-motion"
import {
	downloadFromUrl,
	filenameFromFileUrl,
} from "@/lib/application-generation"
import { cn } from "@/lib/utils"
import styles from "./try-it-now-section.module.css"
import { supabase } from "@/lib/supabase"
import { useVisitorAnonId } from "../../../hooks/useVisitorAnonId"
import { env } from "@/lib/env"
import toast from "react-hot-toast"
import { pdfFileToBase64Images } from "@/lib/pdf-to-images"

const { tryItNow } = LANDING_COPY

const ACCEPTED_EXTENSIONS = [".pdf", ".docx"] as const

type DemoPhase = "idle" | "loading" | "results"
type ResumeInputMode = "upload" | "paste"
type GeneratedResumeStatus = "ready" | "pending" | "failed"

interface GeneratedResume {
	id: string
	file_url: string | null
	old_score: number | null
	new_score: number | null
	status: GeneratedResumeStatus
}

function formatCharCount(count: number, template: string) {
	return template.replace("{count}", count.toLocaleString())
}

function getFileExtension(name: string) {
	const dotIndex = name.lastIndexOf(".")
	return dotIndex >= 0 ? name.slice(dotIndex).toLowerCase() : ""
}

function isGeneratedResumeStatus(
	value: unknown,
): value is GeneratedResumeStatus {
	return value === "ready" || value === "pending" || value === "failed"
}

function toNullableNumber(value: unknown): number | null {
	return typeof value === "number" && Number.isFinite(value) ? value : null
}

function parseGeneratedResume(payload: unknown): GeneratedResume | null {
	if (!payload || typeof payload !== "object") return null

	const root = payload as Record<string, unknown>
	const candidate =
		root.resume && typeof root.resume === "object"
			? (root.resume as Record<string, unknown>)
			: root

	if (typeof candidate.id !== "string" || !candidate.id) return null
	if (!isGeneratedResumeStatus(candidate.status)) return null

	const fileUrl =
		typeof candidate.file_url === "string"
			? candidate.file_url
			: typeof candidate.fileUrl === "string"
				? candidate.fileUrl
				: null

	return {
		id: candidate.id,
		file_url: fileUrl,
		old_score: toNullableNumber(candidate.old_score),
		new_score: toNullableNumber(candidate.new_score),
		status: candidate.status,
	}
}

export function TryItNowSection() {
	const reduceMotion = useReducedMotion()
	const resumeFileInputId = useId()
	const resumePasteInputId = useId()
	const resumePasteCharCountId = useId()
	const jobDescriptionId = useId()
	const charCountId = useId()
	const fileInputRef = useRef<HTMLInputElement>(null)

	const { anonId } = useVisitorAnonId()

	const [resumeInputMode, setResumeInputMode] =
		useState<ResumeInputMode>("upload")
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [pastedResume, setPastedResume] = useState("")
	const [jobDescription, setJobDescription] = useState("")
	const [isDragging, setIsDragging] = useState(false)
	const [phase, setPhase] = useState<DemoPhase>("idle")
	const [generatedResume, setGeneratedResume] =
		useState<GeneratedResume | null>(null)
	const [isDownloading, setIsDownloading] = useState(false)

	const isUploadLocked =
		generatedResume !== null && generatedResume.status === "ready"
	const hasScoreComparison =
		isUploadLocked &&
		generatedResume.old_score !== null &&
		generatedResume.new_score !== null
	const resumeFileUrl = isUploadLocked ? generatedResume.file_url : null

	const hasResume =
		resumeInputMode === "upload"
			? selectedFile !== null
			: pastedResume.trim().length > 0

	const canSubmit =
		!isUploadLocked &&
		hasResume &&
		jobDescription.trim().length > 0 &&
		phase === "idle"

	const handleRetrieveResume = useCallback(async () => {
		if (!anonId) return null

		const { data, error: resumeError } = await supabase.functions.invoke(
			"visitor-retrieve-resume",
			{
				body: {
					visitorAnonId: anonId,
				},
				headers: {
					"Content-Type": "application/json",
					"X-Secret-Key": env.xsecretkey!,
				},
			},
		)

		if (resumeError) {
			console.error("Something went wrong retrieving resume:", resumeError)
			return null
		}

		const nextResume = parseGeneratedResume(data)
		setGeneratedResume(nextResume)

		if (nextResume?.status === "ready") {
			setPhase("results")
		}

		return nextResume
	}, [anonId])

	useEffect(() => {
		if (anonId) {
			void handleRetrieveResume()
		}
	}, [anonId, handleRetrieveResume])

	const handleFileSelection = useCallback((file: File | undefined) => {
		if (!file) return

		setSelectedFile(file)
		setPhase("idle")
	}, [])

	const handleInputChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0]
			handleFileSelection(file)
		},
		[handleFileSelection],
	)

	const handleDragOver = useCallback(
		(event: DragEvent<HTMLDivElement>) => {
			if (isUploadLocked) return
			event.preventDefault()
			setIsDragging(true)
		},
		[isUploadLocked],
	)

	const handleDragLeave = useCallback(
		(event: DragEvent<HTMLDivElement>) => {
			if (isUploadLocked) return
			event.preventDefault()
			setIsDragging(false)
		},
		[isUploadLocked],
	)

	const handleDrop = useCallback(
		(event: DragEvent<HTMLDivElement>) => {
			event.preventDefault()
			setIsDragging(false)
			if (isUploadLocked) return

			const file = event.dataTransfer.files?.[0]
			handleFileSelection(file)
		},
		[handleFileSelection, isUploadLocked],
	)

	const handleDropZoneClick = useCallback(() => {
		if (isUploadLocked || selectedFile) return
		fileInputRef.current?.click()
	}, [isUploadLocked, selectedFile])

	const handleDropZoneKeyDown = useCallback(
		(event: KeyboardEvent<HTMLDivElement>) => {
			if (isUploadLocked || selectedFile) return

			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault()
				fileInputRef.current?.click()
			}
		},
		[isUploadLocked, selectedFile],
	)

	const handleRemoveFile = useCallback(() => {
		if (isUploadLocked) return
		setSelectedFile(null)
		setPhase("idle")

		if (fileInputRef.current) {
			fileInputRef.current.value = ""
		}
	}, [isUploadLocked])

	const handleClearPastedResume = useCallback(() => {
		if (isUploadLocked) return
		setPastedResume("")
		setPhase("idle")
	}, [isUploadLocked])

	const handleReplaceFile = useCallback(() => {
		if (isUploadLocked) return
		fileInputRef.current?.click()
	}, [isUploadLocked])

	const handleResumeModeChange = useCallback(
		(value: string) => {
			if (isUploadLocked) return
			if (value === "upload" || value === "paste") {
				setResumeInputMode(value)
				setPhase("idle")
			}
		},
		[isUploadLocked],
	)

	const handleTailorClick = useCallback(async () => {
		if (!canSubmit) return

		setPhase("loading")

		try {
			let resumeText = pastedResume;
			if (!resumeText && !selectedFile) {
				toast.error("Please select a resume file or paste your resume text")
				return
			}

			if (!resumeText) {
				if (!selectedFile) {
					toast.error("Please select a resume file")
					return
				}
				const base64Images = await pdfFileToBase64Images(selectedFile!)
				const { data: extractTextData } = await supabase.functions.invoke(
					"extract-text",
					{
						body: {
							images: base64Images,
							visitorAnonId: anonId,
						},
						headers: {
							"Content-Type": "application/json",
							"X-Secret-Key": env.xsecretkey!,
						},
					},
				)

				resumeText = extractTextData.text;
			}

			await supabase.functions.invoke("trial-resume", {
				body: {
					resumeText: resumeText,
					jdText: jobDescription,
					visitorAnonId: anonId,
				},
				headers: {
					"Content-Type": "application/json",
					"X-Secret-Key": env.xsecretkey!,
				},
			})

			const nextResume = await handleRetrieveResume()

			if (!nextResume || nextResume.status !== "ready") {
				setPhase("idle")
				toast.error("Something went wrong tailoring resume")
				return
			}

			setPhase("results")
			toast.success("Resume tailored successfully")
		} catch (error) {
			console.error("Something went wrong tailoring resume:", error)
			setPhase("idle")
			toast.error("Something went wrong tailoring resume")
		}
	}, [
		canSubmit,
		anonId,
		jobDescription,
		selectedFile,
		pastedResume,
		handleRetrieveResume,
	])

	const handleDownloadResume = useCallback(async () => {
		if (!resumeFileUrl || isDownloading) return

		setIsDownloading(true)

		try {
			const filename = filenameFromFileUrl(
				resumeFileUrl,
				tryItNow.results.downloadFilename,
			)
			await downloadFromUrl(resumeFileUrl, filename)
		} catch (error) {
			console.error("Something went wrong downloading resume:", error)
		} finally {
			setIsDownloading(false)
		}
	}, [resumeFileUrl, isDownloading])

	const fileExtension = selectedFile
		? getFileExtension(selectedFile.name)
		: ""

	return (
		<section
			id={tryItNow.sectionId}
			className={cn(
				styles.section,
				"scroll-mt-24 border-t border-landing-border/70 bg-landing-sand/35 py-16 sm:py-24",
			)}
			aria-labelledby={`${tryItNow.sectionId}-heading`}
		>
			<div className="mx-auto max-w-6xl px-4 sm:px-6">
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={landingRevealViewport}
					transition={{ duration: 0.5, ease: LANDING_EASE_OUT }}
					className="max-w-2xl lg:max-w-xl"
				>
					<p className="text-sm font-medium tracking-wide text-landing-primary">
						{tryItNow.eyebrow}
					</p>
					<h2
						id={`${tryItNow.sectionId}-heading`}
						className="mt-3 font-display text-3xl font-medium leading-tight tracking-tight text-landing-ink sm:text-4xl"
					>
						{tryItNow.title}
					</h2>
					<p className="mt-4 text-base leading-relaxed text-landing-muted sm:text-lg">
						{tryItNow.description}
					</p>
				</motion.div>

				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 24 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={landingRevealViewport}
					transition={{
						duration: 0.55,
						ease: LANDING_EASE_OUT,
						delay: reduceMotion ? 0 : 0.08,
					}}
					className={cn(styles.demoCard, styles.paperGrain, "mt-10 sm:mt-12")}
				>
					<div className={cn(styles.demoCardInner, "p-5 sm:p-8")}>
						<div className={styles.inputsLockWrap}>
							<div
								className={cn(
									"grid gap-6 lg:grid-cols-2 lg:gap-8",
									isUploadLocked && styles.inputsMuted,
								)}
								aria-hidden={isUploadLocked}
							>
								<div className="min-w-0">
									<Tabs
										value={resumeInputMode}
										onValueChange={handleResumeModeChange}
									>
										<div className={styles.resumeFieldHeader}>
											<p className="font-display text-lg font-medium text-landing-ink">
												{tryItNow.resume.label}
											</p>
											<TabsList
												className={cn(
													styles.modeTabs,
													"h-auto bg-transparent p-0",
												)}
											>
												<TabsTrigger
													value="upload"
													className={styles.modeTab}
													disabled={isUploadLocked}
												>
													<Upload className="size-3.5" aria-hidden />
													{tryItNow.resume.modes.upload}
												</TabsTrigger>
												<TabsTrigger
													value="paste"
													className={styles.modeTab}
													disabled={isUploadLocked}
												>
													<ClipboardPaste className="size-3.5" aria-hidden />
													{tryItNow.resume.modes.paste}
												</TabsTrigger>
											</TabsList>
										</div>

										<TabsContent value="upload" className="mt-0 outline-none">
											<input
												ref={fileInputRef}
												id={resumeFileInputId}
												type="file"
												className="sr-only"
												accept={ACCEPTED_EXTENSIONS.join(",")}
												onChange={handleInputChange}
												tabIndex={-1}
												disabled={isUploadLocked}
											/>

											{selectedFile ? (
												<motion.div
													initial={
														reduceMotion
															? false
															: { opacity: 0, scale: 0.98 }
													}
													animate={{ opacity: 1, scale: 1 }}
													transition={{
														duration: 0.25,
														ease: LANDING_EASE_OUT,
													}}
													className={cn(
														styles.dropZone,
														styles.dropZoneSelected,
													)}
												>
													<div className="flex size-12 items-center justify-center rounded-full border border-landing-primary/25 bg-landing-primary/10 text-landing-primary">
														<CheckCircle2 className="size-6" aria-hidden />
													</div>
													<p className="max-w-full truncate font-medium text-landing-ink">
														{selectedFile.name}
													</p>
													{fileExtension ? (
														<span className={styles.fileTypeBadge}>
															<FileText className="size-3" aria-hidden />
															{fileExtension.slice(1).toUpperCase()}
														</span>
													) : null}
													<div className="mt-1 flex flex-wrap items-center justify-center gap-2">
														<Button
															type="button"
															variant="ghost"
															size="sm"
															surface="light"
															onClick={handleReplaceFile}
															disabled={isUploadLocked}
														>
															{tryItNow.resume.replaceFile}
														</Button>
														<Button
															type="button"
															variant="ghost"
															size="sm"
															surface="light"
															onClick={handleRemoveFile}
															aria-label={tryItNow.resume.removeFile}
															disabled={isUploadLocked}
														>
															<X className="size-4" aria-hidden />
															{tryItNow.resume.removeFile}
														</Button>
													</div>
												</motion.div>
											) : (
												<motion.div
													role="button"
													tabIndex={isUploadLocked ? -1 : 0}
													aria-label={tryItNow.resume.dropzoneDefault}
													aria-disabled={isUploadLocked}
													onClick={handleDropZoneClick}
													onKeyDown={handleDropZoneKeyDown}
													onDragOver={handleDragOver}
													onDragLeave={handleDragLeave}
													onDrop={handleDrop}
													animate={
														isDragging && !reduceMotion
															? { scale: 1.01 }
															: { scale: 1 }
													}
													transition={{
														duration: 0.2,
														ease: LANDING_EASE_OUT,
													}}
													className={cn(
														styles.dropZone,
														isDragging && styles.dropZoneDragging,
													)}
												>
													<motion.div
														animate={
															isDragging && !reduceMotion
																? { y: -2, scale: 1.05 }
																: { y: 0, scale: 1 }
														}
														transition={{
															duration: 0.2,
															ease: LANDING_EASE_OUT,
														}}
														className="flex size-12 items-center justify-center rounded-full border border-landing-border bg-landing-paper text-landing-primary shadow-sm"
													>
														<Upload className="size-5" aria-hidden />
													</motion.div>
													<p className="max-w-xs text-sm font-medium text-landing-ink sm:text-base">
														{isDragging
															? tryItNow.resume.dropzoneDragHover
															: tryItNow.resume.dropzoneDefault}
													</p>
													<div className="flex flex-wrap items-center justify-center gap-2">
														{ACCEPTED_EXTENSIONS.map((ext) => (
															<span
																key={ext}
																className={styles.fileTypeBadge}
															>
																{ext.slice(1).toUpperCase()}
															</span>
														))}
													</div>
													<p className="text-xs text-landing-muted">
														{tryItNow.resume.acceptedTypes}
													</p>
												</motion.div>
											)}
										</TabsContent>

										<TabsContent value="paste" className="mt-0 outline-none">
											<label
												htmlFor={resumePasteInputId}
												className="sr-only"
											>
												{tryItNow.resume.paste.label}
											</label>
											<textarea
												id={resumePasteInputId}
												className={styles.textarea}
												placeholder={tryItNow.resume.paste.placeholder}
												value={pastedResume}
												disabled={isUploadLocked}
												onChange={(event) => {
													setPastedResume(event.target.value)
													setPhase("idle")
												}}
												aria-describedby={resumePasteCharCountId}
											/>
											<div className="mt-2 flex flex-wrap items-center justify-between gap-2">
												{pastedResume.trim().length > 0 ? (
													<span className={styles.pasteReady}>
														<CheckCircle2
															className="size-3.5 shrink-0"
															aria-hidden
														/>
														{tryItNow.resume.paste.label}
													</span>
												) : (
													<span />
												)}
												<div className="ml-auto flex items-center gap-3">
													{pastedResume.length > 0 ? (
														<Button
															type="button"
															variant="ghost"
															size="sm"
															surface="light"
															onClick={handleClearPastedResume}
															disabled={isUploadLocked}
														>
															{tryItNow.resume.paste.clear}
														</Button>
													) : null}
													<p
														id={resumePasteCharCountId}
														className={styles.charCount}
														aria-live="polite"
														aria-atomic="true"
													>
														{formatCharCount(
															pastedResume.length,
															tryItNow.resume.paste.charCountLabel,
														)}
													</p>
												</div>
											</div>
										</TabsContent>
									</Tabs>
								</div>

								<div className="min-w-0">
									<label
										htmlFor={jobDescriptionId}
										className="mb-3 block font-display text-lg font-medium text-landing-ink"
									>
										{tryItNow.jobDescription.label}
									</label>
									<textarea
										id={jobDescriptionId}
										className={styles.textarea}
										placeholder={tryItNow.jobDescription.placeholder}
										value={jobDescription}
										disabled={isUploadLocked}
										onChange={(event) => {
											setJobDescription(event.target.value)
											setPhase("idle")
										}}
										aria-describedby={charCountId}
									/>
									<p
										id={charCountId}
										className={cn(styles.charCount, "mt-2 text-right")}
										aria-live="polite"
										aria-atomic="true"
									>
										{formatCharCount(
											jobDescription.length,
											tryItNow.jobDescription.charCountLabel,
										)}
									</p>
								</div>
							</div>

							{isUploadLocked ? (
								<div className={styles.lockCard}>
									<div className={styles.lockCardInner}>
										<span className={styles.lockIcon}>
											<Lock className="size-5" aria-hidden />
										</span>
										<p className={styles.lockCardMessage}>
											{tryItNow.results.lockMessage}
										</p>
										<Button
											size="lg"
											surface="light"
											className={LANDING_PRIMARY_CTA_BUTTON_CLASS}
											asChild
										>
											<LandingSignupLink
												location="try_it_now_locked"
												label={tryItNow.results.signupCta}
											>
												{tryItNow.results.signupCta}
											</LandingSignupLink>
										</Button>
									</div>
								</div>
							) : null}
						</div>

						{isUploadLocked ? (
							<div className={styles.lockedFooter}>
								{hasScoreComparison ? (
									<div
										className={styles.scorePanel}
										role="region"
										aria-label={tryItNow.results.scoreHeading}
									>
										<p className={styles.scoreHeading}>
											{tryItNow.results.scoreHeading}
										</p>
										<div className={styles.scoreRow}>
											<div
												className={cn(
													styles.scoreCard,
													styles.scoreCardBefore,
												)}
											>
												<div className={styles.scoreCardHeader}>
													<span
														className={cn(
															styles.scoreIcon,
															styles.scoreIconBefore,
														)}
													>
														<TrendingDown
															className="size-4"
															aria-hidden
														/>
													</span>
													<span className={styles.scoreLabel}>
														{tryItNow.results.scoreBefore}
													</span>
												</div>
												<span className={styles.scoreValue}>
													{generatedResume.old_score}
													<span className={styles.scoreSuffix}>%</span>
												</span>
												<div className={styles.scoreTrack} aria-hidden>
													<motion.span
														className={cn(
															styles.scoreFill,
															styles.scoreFillBefore,
														)}
														initial={reduceMotion ? false : { width: 0 }}
														animate={{
															width: `${generatedResume.old_score}%`,
														}}
														transition={{
															duration: 0.7,
															ease: LANDING_EASE_OUT,
														}}
													/>
												</div>
											</div>
											<span className={styles.scoreArrow} aria-hidden>
												<ArrowRight className="size-5" />
											</span>
											<div
												className={cn(
													styles.scoreCard,
													styles.scoreCardAfter,
												)}
											>
												<div className={styles.scoreCardHeader}>
													<span
														className={cn(
															styles.scoreIcon,
															styles.scoreIconAfter,
														)}
													>
														<TrendingUp
															className="size-4"
															aria-hidden
														/>
													</span>
													<span className={styles.scoreLabel}>
														{tryItNow.results.scoreAfter}
													</span>
												</div>
												<span className={styles.scoreValue}>
													{generatedResume.new_score}
													<span className={styles.scoreSuffix}>%</span>
												</span>
												<div className={styles.scoreTrack} aria-hidden>
													<motion.span
														className={cn(
															styles.scoreFill,
															styles.scoreFillAfter,
														)}
														initial={reduceMotion ? false : { width: 0 }}
														animate={{
															width: `${generatedResume.new_score}%`,
														}}
														transition={{
															duration: 0.85,
															delay: reduceMotion ? 0 : 0.12,
															ease: LANDING_EASE_OUT,
														}}
													/>
												</div>
											</div>
										</div>
										<Button
											type="button"
											size="lg"
											surface="light"
											className={cn(
												LANDING_PRIMARY_CTA_BUTTON_CLASS,
												styles.scoreDownloadButton,
											)}
											onClick={handleDownloadResume}
											disabled={!resumeFileUrl || isDownloading}
										>
											{isDownloading ? (
												<>
													<Loader2
														className="size-4 animate-spin"
														aria-hidden
													/>
													{tryItNow.results.downloadLoading}
												</>
											) : (
												<>
													<Download className="size-4" aria-hidden />
													{tryItNow.results.downloadLastCta}
												</>
											)}
										</Button>
									</div>
								) : (
									<Button
										type="button"
										size="lg"
										surface="light"
										className={LANDING_PRIMARY_CTA_BUTTON_CLASS}
										onClick={handleDownloadResume}
										disabled={!resumeFileUrl || isDownloading}
									>
										{isDownloading ? (
											<>
												<Loader2
													className="size-4 animate-spin"
													aria-hidden
												/>
												{tryItNow.results.downloadLoading}
											</>
										) : (
											<>
												<Download className="size-4" aria-hidden />
												{tryItNow.results.downloadLastCta}
											</>
										)}
									</Button>
								)}
							</div>
						) : (
							<div className={cn(styles.ctaWrap, "mt-8 sm:mt-10")}>
								<Button
									type="button"
									size="lg"
									surface="light"
									disabled={!canSubmit}
									aria-busy={phase === "loading"}
									className={cn(
										LANDING_PRIMARY_CTA_BUTTON_CLASS,
										styles.submitButton,
									)}
									onClick={handleTailorClick}
								>
									{phase === "loading" ? (
										<>
											<Loader2
												className="size-4 animate-spin"
												aria-hidden
											/>
											{tryItNow.loading}
										</>
									) : (
										tryItNow.cta
									)}
								</Button>
							</div>
						)}
					</div>
				</motion.div>
			</div>
		</section>
	)
}
