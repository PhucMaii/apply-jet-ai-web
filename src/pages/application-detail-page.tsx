import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Loader2 } from "lucide-react"
import { ApplicationDetailDocuments } from "@/components/applications/application-detail-documents"
import { ApplicationDetailOverview } from "@/components/applications/application-detail-overview"
import { APPLICATIONS_THEME } from "@/lib/applications-theme"
import { APP_NAME, BRAND_LOGO_SRC, ROUTES } from "@/lib/constants"
import { useApplicationDetail } from "@/hooks/use-application-detail"
import { cn } from "@/lib/utils"

export function ApplicationDetailPage() {
	const { applicationId } = useParams<{ applicationId: string }>()
	const {
		record,
		form,
		loading,
		savingDetails,
		updatingStatus,
		error,
		notice,
		refreshDocuments,
		refreshingDocuments,
		saveDetails,
		updateStatus,
		resolveStatus,
		patchForm,
	} = useApplicationDetail(applicationId)

	return (
		<div className={APPLICATIONS_THEME.page}>
			<header className={APPLICATIONS_THEME.header}>
				<div className={APPLICATIONS_THEME.headerInner}>
					<div className="flex min-w-0 flex-col gap-3">
						<Link
							to={ROUTES.applications}
							className={cn(
								"inline-flex w-fit items-center gap-1.5 text-sm font-medium",
								APPLICATIONS_THEME.link,
							)}
						>
							<ArrowLeft className="size-4" aria-hidden />
							Back to applications
						</Link>
						<div className="flex items-center gap-2">
							<span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-neutral-200">
								<img
									src={BRAND_LOGO_SRC}
									alt=""
									width={36}
									height={36}
									className="size-9 object-contain object-center"
									decoding="async"
								/>
							</span>
							<p className={APPLICATIONS_THEME.brandLabel}>{APP_NAME}</p>
						</div>
						{record && form ? (
							<div>
								<h1 className="font-display text-3xl font-bold tracking-tight text-neutral-900">
									{form.jobTitle || record.job_title}
								</h1>
								<p className="mt-1 text-base text-neutral-600">
									{form.companyName || record.company_name}
								</p>
							</div>
						) : (
							<h1 className={APPLICATIONS_THEME.title}>
								Application details
							</h1>
						)}
					</div>
				</div>
			</header>

			<main className={APPLICATIONS_THEME.main}>
				{error ? (
					<p className={APPLICATIONS_THEME.error} role="alert">
						{error}
					</p>
				) : null}
				{notice ? (
					<p
						className={cn(
							"rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800",
						)}
						role="status"
					>
						{notice}
					</p>
				) : null}

				{loading || !record || !form ? (
					<div
						className="flex flex-col items-center justify-center gap-3 py-24"
						aria-busy="true"
					>
						<Loader2
							className="size-8 animate-spin text-primary"
							aria-hidden
						/>
						<span className={APPLICATIONS_THEME.muted}>
							Loading application…
						</span>
					</div>
				) : (
					<div className="space-y-8">
						<div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
							<ApplicationDetailOverview
								form={form}
								status={resolveStatus(record.status)}
								updatingStatus={updatingStatus}
								savingDetails={savingDetails}
								createdAt={record.created_at}
								onPatchForm={patchForm}
								onStatusChange={(next) => void updateStatus(next)}
								onSaveDetails={() => void saveDetails()}
							/>
						</div>

						<ApplicationDetailDocuments
							form={form}
							generatedResume={record.generatedResume}
							generatedCoverLetter={record.generatedCoverLetter}
							refreshingDocuments={refreshingDocuments}
							onDocumentsUpdated={refreshDocuments}
						/>
					</div>
				)}
			</main>
		</div>
	)
}
