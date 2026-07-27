import { useMemo, useState } from "react"
import {
	ArrowLeft,
	Download,
	Loader2,
} from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { TailoredResumeTab } from "@/components/applications/resume-builder/tailored-resume-tab"
import type { ApplicationStatus } from "@/lib/application-status"
import { ROUTES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { ApplicationDetailForm } from "@/types/application-detail"
import { ResumeTab } from "./resume-tab"

type StudioView = "editor" | "tailored"

interface ResumeStudioProps {
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
}

export function ResumeStudio({
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
}: ResumeStudioProps) {
	const [view, setView] = useState<StudioView>("editor")
	const [hasGenerated, setHasGenerated] = useState(false)
	const [isGenerating, setIsGenerating] = useState(false)
	const [appliedBlockKeys, setAppliedBlockKeys] = useState<string[]>([])

	const pageTitle = useMemo(() => {
		const role = form.jobTitle.trim() || "Untitled role"
		const company = form.companyName.trim() || "Company"
		return `${role} at ${company}`
	}, [form.companyName, form.jobTitle])

	function handleGenerate() {
		setIsGenerating(true)
		window.setTimeout(() => {
			setHasGenerated(true)
			setIsGenerating(false)
			setView("tailored")
		}, 900)
	}

	return (
		<div className="flex min-h-0 flex-1 flex-col bg-neutral-100">
			<header className="sticky top-0 z-10 shrink-0 border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
				<div className="flex flex-wrap items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-3">
					<Link
						to={ROUTES.applications}
						className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
						aria-label="Back to applications"
					>
						<ArrowLeft className="size-4" aria-hidden />
					</Link>

					<div className="min-w-0 flex-1 basis-[min(100%,12rem)]">
						<p className="truncate font-display text-sm font-semibold text-neutral-900 sm:text-base lg:text-lg">
							{pageTitle}
						</p>
					</div>

					{hasGenerated ? (
						<nav
							className="order-last flex w-full items-center gap-1 overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-50 p-1 sm:order-none sm:w-auto"
							aria-label="Resume views"
						>
							{(
								[
									["editor", "Resume"],
									["tailored", "Tailored Resume"],
								] as const
							).map(([value, label]) => (
								<button
									key={value}
									type="button"
									onClick={() => setView(value)}
									className={cn(
										"shrink-0 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors sm:px-3 sm:text-sm",
										view === value
											? "bg-white text-neutral-900 shadow-sm"
											: "text-neutral-500 hover:text-neutral-800",
									)}
								>
									{label}
								</button>
							))}
						</nav>
					) : null}

					<Button
						type="button"
						variant="outline"
						size="sm"
						className="hidden shrink-0 gap-2 sm:inline-flex"
						disabled
					>
						<Download className="size-4" aria-hidden />
						Export
					</Button>
				</div>
			</header>

			{isGenerating ? (
				<div
					className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3"
					aria-busy
				>
					<Loader2 className="size-8 animate-spin text-primary" aria-hidden />
					<p className="text-sm text-neutral-600">
						Generating tailored resume…
					</p>
				</div>
			) : null}

			{!isGenerating && view === "editor" ? (
				<ResumeTab
					form={form}
					status={status}
					createdAt={createdAt}
					savingDetails={savingDetails}
					updatingStatus={updatingStatus}
					isDeleting={isDeleting}
					onPatchForm={onPatchForm}
					onSaveApplication={onSaveApplication}
					onStatusChange={onStatusChange}
					onDelete={onDelete}
					onGenerate={handleGenerate}
					hasGenerated={hasGenerated}
				/>
			) : null}
			{!isGenerating && view === "tailored" && hasGenerated ? (
				<TailoredResumeTab
					appliedBlockKeys={appliedBlockKeys}
					onAppliedKeysChange={setAppliedBlockKeys}
				/>
			) : null}
		</div>
	)
}
