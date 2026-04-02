import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
	ChevronDown,
	Download,
	ExternalLink,
	FileText,
	Loader2,
	LogOut,
	Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { supabase } from "@/lib/supabase"
import { useGeneratedResume } from "../../hooks/useGeneratedResume"
import { useGeneratedCoverLetter } from "../../hooks/useGeneratedCoverLetter"
import {
	APPLICATION_STATUSES,
	type ApplicationStatus,
	isApplicationStatus,
} from "@/lib/application-status"
import {
	APP_NAME,
	BRAND_LOGO_SRC,
	LINKS,
	ROUTES,
} from "@/lib/constants"
import type { ApplicationWithDocuments } from "@/types/database"
import { cn } from "@/lib/utils"

function statusStyles(status: ApplicationStatus) {
	switch (status) {
		case "Generated":
			return "bg-primary/15 text-primary ring-1 ring-primary/30"
		case "Applied":
			return "bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/25"
		case "Rejected":
			return "bg-destructive/10 text-destructive ring-1 ring-destructive/25"
		case "Accepted":
			return "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25"
		default:
			return "bg-muted text-muted-foreground"
	}
}

export function ApplicationsPage() {
	const { user, signOut } = useAuth()
	const { getResumeDownloadUrl } = useGeneratedResume()
	const { getCoverLetterDownloadUrl } = useGeneratedCoverLetter()
	const [rows, setRows] = useState<ApplicationWithDocuments[]>([])
	const [loadError, setLoadError] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)
	const [updatingId, setUpdatingId] = useState<string | null>(null)
	const [downloading, setDownloading] = useState<string | null>(null)

	const loadApplications = useCallback(async () => {
		if (!user) return
		setLoadError(null)
		setLoading(true)
		try {
			const { data, error } = await supabase
				.from("applications")
				.select(
					`*`,
				)
				.eq("user_id", user.id)
				.order("created_at", { ascending: false })

			if (error) {
				console.error("Something went wrong loading applications:", error)
				setLoadError(error.message)
				setRows([])
				return
			}

			setRows(data as unknown as ApplicationWithDocuments[])
		} catch (err) {
			console.error("Something went wrong loading applications:", err)
			setLoadError(err instanceof Error ? err.message : "Load failed.")
			setRows([])
		} finally {
			setLoading(false)
		}
	}, [user])

	useEffect(() => {
		loadApplications()
	}, [loadApplications])

	async function handleStatusChange(
		applicationId: string,
		next: ApplicationStatus,
	) {
		if (!user) return
		setUpdatingId(applicationId)
		setLoadError(null)
		try {
			const { error } = await supabase
				.from("applications")
				.update({
					status: next,
					updated_at: new Date().toISOString(),
				})
				.eq("id", applicationId)
				.eq("user_id", user.id)

			if (error) {
				console.error("Something went wrong updating status:", error)
				setLoadError(error.message)
				return
			}

			setRows((prev) =>
				prev.map((r) =>
					r.id === applicationId ? { ...r, status: next } : r,
				),
			)
		} catch (err) {
			console.error("Something went wrong updating status:", err)
			setLoadError(err instanceof Error ? err.message : "Update failed.")
		} finally {
			setUpdatingId(null)
		}
	}

	async function handleDownloadResume(
		applicationId: string,
		generatedResumeId: string,
	) {
		setLoadError(null)
		setDownloading(`resume-${applicationId}`)
		try {
			const url = await getResumeDownloadUrl(
				generatedResumeId,
			)
			window.open(url, "_blank", "noopener,noreferrer")
		} catch (err) {
			console.error("Something went wrong downloading generated resume:", err)
			setLoadError(
				err instanceof Error ? err.message : "Failed to download resume.",
			)
		} finally {
			setDownloading(null)
		}
	}

	async function handleDownloadCover(
		applicationId: string,
		generatedCoverLetterId: string,
	) {
		setLoadError(null)
		setDownloading(`cover-${applicationId}`)
		try {
			const url = await getCoverLetterDownloadUrl(
				generatedCoverLetterId,
			)
			window.open(url, "_blank", "noopener,noreferrer")
		} catch (err) {
			console.error("Something went wrong downloading cover letter:", err)
			setLoadError(
				err instanceof Error
					? err.message
					: "Failed to download cover letter.",
			)
		} finally {
			setDownloading(null)
		}
	}

	return (
		<div className="relative z-10 min-h-screen pb-16">
			<div className="border-b border-border/70 bg-background/80 backdrop-blur-xl">
				<div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
					<div>
						<div className="mb-2 flex items-center gap-2">
							<span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-border/60">
								<img
									src={BRAND_LOGO_SRC}
									alt=""
									width={36}
									height={36}
									className="size-9 object-contain object-center"
									decoding="async"
								/>
							</span>
							<p className="text-xs font-semibold uppercase tracking-wide text-primary">
								{APP_NAME}
							</p>
						</div>
						<h1 className="font-display text-2xl font-bold">Applications</h1>
						<p className="text-sm text-muted-foreground">
							{user?.email ?? "Signed in"}
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<Button variant="secondary" size="sm" asChild>
							<Link to={ROUTES.profile}>Profile</Link>
						</Button>
						<Button variant="secondary" size="sm" asChild>
							<Link to={ROUTES.home}>Marketing site</Link>
						</Button>
						<Button variant="secondary" size="sm" asChild>
							<a href={LINKS.extensionDownload}>Extension</a>
						</Button>
						<Button
							variant="ghost"
							size="sm"
							className="gap-1.5"
							onClick={() => void signOut()}
						>
							<LogOut className="size-4" aria-hidden />
							Log out
						</Button>
					</div>
				</div>
			</div>

			<div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">

				{loadError ? (
					<p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
						{loadError}{" "}
						<span className="text-muted-foreground">
							Something went wrong loading applications.
						</span>
					</p>
				) : null}

				{loading ? (
					<div
						className="flex flex-col items-center justify-center gap-3 py-20"
						aria-busy="true"
					>
						<Loader2 className="size-8 animate-spin text-primary" aria-hidden />
						<span className="text-sm text-muted-foreground">
							Loading applications…
						</span>
					</div>
				) : rows.length === 0 ? (
					<Card>
						<CardHeader>
							<CardTitle>No applications yet</CardTitle>
							<CardDescription>
								No applications found.
							</CardDescription>
						</CardHeader>
					</Card>
				) : (
					<ul className="space-y-6">
						{rows.map((app) => {
							const status: ApplicationStatus = isApplicationStatus(app.status)
								? app.status
								: "Generated"
							const resumeId = (app as { generated_resume_id?: string | null })
								.generated_resume_id
							const coverId = (app as { generated_cover_letter_id?: string | null })
								.generated_cover_letter_id
							const hasResume = Boolean(resumeId)
							const hasCover = Boolean(coverId)
							return (
								<li key={app.id}>
									<Card>
										<CardHeader className="space-y-3">
											<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
												<div className="min-w-0">
													<CardTitle className="text-xl leading-tight">
														{app.job_title}
													</CardTitle>
													<CardDescription className="mt-1 text-base text-foreground/80">
														{app.company_name}
													</CardDescription>
													<p className="mt-2 text-xs text-muted-foreground">
														Added{" "}
														{new Date(app.created_at).toLocaleString(undefined, {
															dateStyle: "medium",
															timeStyle: "short",
														})}
													</p>
												</div>
												<div className="flex flex-col gap-2 sm:items-end">
													<span
														className={cn(
															"inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold",
															statusStyles(status),
														)}
													>
														{status}
													</span>
													<div className="flex items-center gap-2">
														<label
															htmlFor={`status-${app.id}`}
															className="text-xs text-muted-foreground"
														>
															Update status
														</label>
														<select
															id={`status-${app.id}`}
															className="h-9 rounded-md border border-input bg-muted/40 px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
															value={status}
															disabled={updatingId === app.id}
															onChange={(e) => {
																const v = e.target.value
																if (isApplicationStatus(v))
																	void handleStatusChange(app.id, v)
															}}
														>
															{APPLICATION_STATUSES.map((s) => (
																<option key={s} value={s}>
																	{s}
																</option>
															))}
														</select>
													</div>
												</div>
											</div>
											{app.job_url ? (
												<a
													href={app.job_url}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary hover:underline"
												>
													Open job posting
													<ExternalLink className="size-3.5" aria-hidden />
												</a>
											) : null}
										</CardHeader>
										<CardContent className="space-y-4">
											<details className="group rounded-lg border border-border/60 bg-muted/20">
												<summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium [&::-webkit-details-marker]:hidden">
													<span>Job description</span>
													<ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
												</summary>
												<div className="border-t border-border/50 px-3 py-3">
													{app.job_description ? (
														<pre className="thin-scrollbar max-h-48 overflow-y-auto whitespace-pre-wrap font-sans text-xs leading-relaxed text-muted-foreground">
															{app.job_description}
														</pre>
													) : (
														<p className="text-xs text-muted-foreground">
															No description stored for this application.
														</p>
													)}
												</div>
											</details>

											<div className="grid gap-4 md:grid-cols-2">
												<div className="rounded-lg border border-border/60 bg-background/40 p-3">
													<div className="flex items-center gap-2 text-sm font-semibold text-foreground">
														<FileText
															className="size-4 text-primary"
															aria-hidden
														/>
														Generated resume
													</div>
													{hasResume ? (
														<div className="mt-3 space-y-2">
															<p className="text-xs text-emerald-400">
																Ready to download
															</p>
															<Button
																type="button"
																variant="secondary"
																size="sm"
																className="w-full justify-between"
																disabled={downloading === `resume-${app.id}`}
																onClick={() =>
																	void handleDownloadResume(
																		app.id,
																		resumeId as string,
																	)}
															>
																<span>
																	{downloading === `resume-${app.id}`
																		? "Preparing file..."
																		: "Download tailored resume"}
																</span>
																{downloading === `resume-${app.id}` ? (
																	<Loader2
																		className="size-3.5 animate-spin"
																		aria-hidden
																	/>
																) : (
																	<Download className="size-3.5" aria-hidden />
																)}
															</Button>
															<p className="text-[11px] text-muted-foreground">
																Opens a secure signed URL in a new tab.
															</p>
														</div>
													) : (
														<p className="mt-2 text-xs text-muted-foreground">
															No resume generated for this application yet.
														</p>
													)}
												</div>
												<div className="rounded-lg border border-border/60 bg-background/40 p-3">
													<div className="flex items-center gap-2 text-sm font-semibold text-foreground">
														<Mail
															className="size-4 text-sky-400"
															aria-hidden
														/>
														Generated cover letter
													</div>
													{hasCover ? (
														<div className="mt-3 space-y-2">
															<p className="text-xs text-emerald-400">
																Ready to download
															</p>
															<Button
																type="button"
																variant="secondary"
																size="sm"
																className="w-full justify-between"
																disabled={downloading === `cover-${app.id}`}
																onClick={() =>
																	void handleDownloadCover(
																		app.id,
																		coverId as string,
																	)}
															>
																<span>
																	{downloading === `cover-${app.id}`
																		? "Preparing file..."
																		: "Download cover letter"}
																</span>
																{downloading === `cover-${app.id}` ? (
																	<Loader2
																		className="size-3.5 animate-spin"
																		aria-hidden
																	/>
																) : (
																	<Download className="size-3.5" aria-hidden />
																)}
															</Button>
															<p className="text-[11px] text-muted-foreground">
																Opens a secure signed URL in a new tab.
															</p>
														</div>
													) : (
														<p className="mt-2 text-xs text-muted-foreground">
															No cover letter generated for this application yet.
														</p>
													)}
												</div>
											</div>
										</CardContent>
									</Card>
								</li>
							)
						})}
					</ul>
				)}
			</div>
		</div>
	)
}
