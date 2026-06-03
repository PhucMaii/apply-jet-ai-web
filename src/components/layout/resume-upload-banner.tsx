import { Link, useLocation } from "react-router-dom"
import { AlertTriangle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants"
import { RESUME_UPLOAD_BANNER_COPY } from "@/lib/resume-upload-banner-copy"
import {
	hasUploadedResume,
	useUserResume,
} from "@/hooks/use-user-resume"
import { cn } from "@/lib/utils"

export function ResumeUploadBanner() {
	const { pathname } = useLocation()
	const { resume, isLoading } = useUserResume()

	const isProfilePage = pathname === ROUTES.profile
	const shouldShow =
		!isLoading && !isProfilePage && !hasUploadedResume(resume)

	if (!shouldShow) return null

	return (
		<div
			className={cn(
				"border-b border-amber-500/30 bg-amber-500/[0.08]",
				"px-4 py-3 sm:px-6",
			)}
			role="status"
		>
			<div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex min-w-0 items-start gap-3">
					<span
						className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300"
						aria-hidden
					>
						<AlertTriangle className="size-4" />
					</span>
					<div className="min-w-0">
						<p className="text-sm font-semibold text-amber-950 dark:text-amber-100">
							{RESUME_UPLOAD_BANNER_COPY.title}
						</p>
						<p className="mt-0.5 text-sm leading-relaxed text-amber-900/80 dark:text-amber-100/75">
							{RESUME_UPLOAD_BANNER_COPY.description}
						</p>
					</div>
				</div>
				<Button
					size="sm"
					className="w-full shrink-0 gap-1.5 bg-amber-600 text-white hover:bg-amber-700 sm:w-auto"
					asChild
				>
					<Link to={ROUTES.profile}>
						{RESUME_UPLOAD_BANNER_COPY.cta}
						<ArrowRight className="size-4" aria-hidden />
					</Link>
				</Button>
			</div>
		</div>
	)
}
