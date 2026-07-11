import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
	CheckCircle2,
	ClipboardPaste,
	FileText,
	Loader2,
	Lock,
	Upload,
	X,
} from "lucide-react"
import {
	useCallback,
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
import { cn } from "@/lib/utils"
import styles from "./try-it-now-section.module.css"

const { tryItNow } = LANDING_COPY

const ACCEPTED_EXTENSIONS = [".pdf", ".docx"] as const
const TAILOR_LOADING_MS = 1500

type DemoPhase = "idle" | "loading" | "results"
type ResumeInputMode = "upload" | "paste"

interface SelectedFile {
	name: string
}

function formatCharCount(count: number, template: string) {
	return template.replace("{count}", count.toLocaleString())
}

function getFileExtension(name: string) {
	const dotIndex = name.lastIndexOf(".")
	return dotIndex >= 0 ? name.slice(dotIndex).toLowerCase() : ""
}

export function TryItNowSection() {
	const reduceMotion = useReducedMotion()
	const resumeFileInputId = useId()
	const resumePasteInputId = useId()
	const resumePasteCharCountId = useId()
	const jobDescriptionId = useId()
	const charCountId = useId()
	const fileInputRef = useRef<HTMLInputElement>(null)

	const [resumeInputMode, setResumeInputMode] =
		useState<ResumeInputMode>("upload")
	const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null)
	const [pastedResume, setPastedResume] = useState("")
	const [jobDescription, setJobDescription] = useState("")
	const [isDragging, setIsDragging] = useState(false)
	const [phase, setPhase] = useState<DemoPhase>("idle")

	const hasResume =
		resumeInputMode === "upload"
			? selectedFile !== null
			: pastedResume.trim().length > 0

	const canSubmit =
		hasResume && jobDescription.trim().length > 0 && phase === "idle"

	const handleFileSelection = useCallback((file: File | undefined) => {
		if (!file) return

		setSelectedFile({ name: file.name })
		setPhase("idle")
	}, [])

	const handleInputChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0]
			handleFileSelection(file)
		},
		[handleFileSelection],
	)

	const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
		event.preventDefault()
		setIsDragging(true)
	}, [])

	const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
		event.preventDefault()
		setIsDragging(false)
	}, [])

	const handleDrop = useCallback(
		(event: DragEvent<HTMLDivElement>) => {
			event.preventDefault()
			setIsDragging(false)

			const file = event.dataTransfer.files?.[0]
			handleFileSelection(file)
		},
		[handleFileSelection],
	)

	const handleDropZoneClick = useCallback(() => {
		if (selectedFile) return
		fileInputRef.current?.click()
	}, [selectedFile])

	const handleDropZoneKeyDown = useCallback(
		(event: KeyboardEvent<HTMLDivElement>) => {
			if (selectedFile) return

			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault()
				fileInputRef.current?.click()
			}
		},
		[selectedFile],
	)

	const handleRemoveFile = useCallback(() => {
		setSelectedFile(null)
		setPhase("idle")

		if (fileInputRef.current) {
			fileInputRef.current.value = ""
		}
	}, [])

	const handleClearPastedResume = useCallback(() => {
		setPastedResume("")
		setPhase("idle")
	}, [])

	const handleReplaceFile = useCallback(() => {
		fileInputRef.current?.click()
	}, [])

	const handleResumeModeChange = useCallback((value: string) => {
		if (value === "upload" || value === "paste") {
			setResumeInputMode(value)
			setPhase("idle")
		}
	}, [])

	const handleTailorClick = useCallback(() => {
		if (!canSubmit) return

		setPhase("loading")

		window.setTimeout(() => {
			setPhase("results")
		}, TAILOR_LOADING_MS)
	}, [canSubmit])

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
						<div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
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
											>
												<Upload className="size-3.5" aria-hidden />
												{tryItNow.resume.modes.upload}
											</TabsTrigger>
											<TabsTrigger
												value="paste"
												className={styles.modeTab}
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
										/>

										{selectedFile ? (
											<motion.div
												initial={
													reduceMotion ? false : { opacity: 0, scale: 0.98 }
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
													>
														<X className="size-4" aria-hidden />
														{tryItNow.resume.removeFile}
													</Button>
												</div>
											</motion.div>
										) : (
											<motion.div
												role="button"
												tabIndex={0}
												aria-label={tryItNow.resume.dropzoneDefault}
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
														<span key={ext} className={styles.fileTypeBadge}>
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

						<div className={cn(styles.ctaWrap, "mt-8 sm:mt-10")}>
							<Button
								type="button"
								size="lg"
								surface="light"
								disabled={!canSubmit && phase !== "loading"}
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

						<AnimatePresence>
							{phase === "results" ? (
								<motion.div
									initial={reduceMotion ? false : { opacity: 0, y: 16 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: 8 }}
									transition={{ duration: 0.45, ease: LANDING_EASE_OUT }}
									className={cn(styles.resultsPanel, "relative mt-8")}
								>
									<div className={styles.resultsSkeleton} aria-hidden>
										<div
											className={cn(
												styles.skeletonLine,
												styles.skeletonLineWide,
											)}
										/>
										<div
											className={cn(
												styles.skeletonLine,
												styles.skeletonLineMedium,
											)}
										/>
										<div
											className={cn(
												styles.skeletonLine,
												styles.skeletonLineFull,
											)}
										/>
										<div
											className={cn(
												styles.skeletonLine,
												styles.skeletonLineFull,
											)}
										/>
										<div className={styles.skeletonBlock} />
									</div>

									<div className={styles.resultsOverlay}>
										<span className={styles.lockIcon}>
											<Lock className="size-5" aria-hidden />
										</span>
										<p className="max-w-sm font-display text-lg font-medium text-landing-ink">
											{tryItNow.results.lockMessage}
										</p>
										<Button
											size="lg"
											surface="light"
											className={LANDING_PRIMARY_CTA_BUTTON_CLASS}
											asChild
										>
											<LandingSignupLink
												location="try_it_now"
												label={tryItNow.results.signupCta}
											>
												{tryItNow.results.signupCta}
											</LandingSignupLink>
										</Button>
									</div>
								</motion.div>
							) : null}
						</AnimatePresence>
					</div>
				</motion.div>
			</div>
		</section>
	)
}
