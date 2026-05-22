import { Loader2 } from "lucide-react"
import { ApplicationsEmptyState } from "@/components/applications/applications-empty-state"
import { ApplicationsPageHeader } from "@/components/applications/applications-page-header"
import { ApplicationsTable } from "@/components/applications/applications-table"
import { useAuth } from "@/context/auth-context"
import { useApplications } from "@/hooks/use-applications"
import { APPLICATIONS_THEME } from "@/lib/applications-theme"

export function ApplicationsPage() {
	const { user, signOut } = useAuth()
	const {
		rows,
		loadError,
		loading,
		updatingId,
		downloading,
		updateStatus,
		downloadResume,
		downloadCoverLetter,
		resolveStatus,
	} = useApplications()

	return (
		<div className={APPLICATIONS_THEME.page}>
			<ApplicationsPageHeader
				userEmail={user?.email}
				onSignOut={signOut}
			/>

			<main className={APPLICATIONS_THEME.main}>
				{loadError ? (
					<p className={APPLICATIONS_THEME.error} role="alert">
						{loadError}
					</p>
				) : null}

				{loading ? (
					<div
						className="flex flex-col items-center justify-center gap-3 py-20"
						aria-busy="true"
					>
						<Loader2
							className="size-8 animate-spin text-primary"
							aria-hidden
						/>
						<span className={APPLICATIONS_THEME.muted}>
							Loading applications…
						</span>
					</div>
				) : rows.length === 0 ? (
					<ApplicationsEmptyState />
				) : (
					<ApplicationsTable
						rows={rows}
						updatingId={updatingId}
						downloading={downloading}
						resolveStatus={resolveStatus}
						onStatusChange={(id, status) => void updateStatus(id, status)}
						onDownloadResume={(application, generatedResume, companyName) =>
							void downloadResume(application, generatedResume, companyName)
						}
						onDownloadCover={(application, generatedCoverLetter, companyName) =>
							void downloadCoverLetter(application, generatedCoverLetter, companyName)
						}
					/>
				)}
			</main>
		</div>
	)
}
