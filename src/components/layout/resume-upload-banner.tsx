import { Link, useLocation } from "react-router-dom"
import { ArrowRight, FileUp } from "lucide-react"
import { ROUTES } from "@/lib/constants"
import { RESUME_UPLOAD_BANNER_COPY } from "@/lib/resume-upload-banner-copy"
import {
	hasUploadedResume,
	useUserResume,
} from "@/hooks/use-user-resume"

export function ResumeUploadBanner() {
	const { pathname } = useLocation()
	const { resume, isLoading } = useUserResume()

	const isProfilePage = pathname === ROUTES.profile
	const shouldShow =
		!isLoading && !isProfilePage && !hasUploadedResume(resume)

	if (!shouldShow) return null

	return (
		<div
			className="shrink-0 border-b border-amber-200/70 bg-amber-50 px-4 py-2.5 sm:px-6 lg:px-8"
			role="status"
		>
			<div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
				<FileUp className="size-4 shrink-0 text-amber-700" aria-hidden />
				<p className="min-w-0 flex-1 text-sm text-amber-950">
					<span className="font-semibold">
						{RESUME_UPLOAD_BANNER_COPY.title}
					</span>{" "}
					<span className="text-amber-900/80 max-sm:hidden">
						{RESUME_UPLOAD_BANNER_COPY.description}
					</span>
				</p>
				<Link
					to={ROUTES.profile}
					className="inline-flex items-center gap-1 rounded-md text-sm font-semibold text-amber-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
				>
					{RESUME_UPLOAD_BANNER_COPY.cta}
					<ArrowRight className="size-3.5" aria-hidden />
				</Link>
			</div>
		</div>
	)
}
