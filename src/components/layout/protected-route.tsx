import { Navigate, useLocation } from "react-router-dom"
import type { ReactNode } from "react"
import { ResumeUploadBanner } from "@/components/layout/resume-upload-banner"
import { useAuth } from "@/context/auth-context"
import { ROUTES } from "@/lib/constants"
import { Loader2 } from "lucide-react"

export function ProtectedRoute({ children }: { children: ReactNode }) {
	const { user, isLoading, isConfigured } = useAuth()
	const location = useLocation()

	if (!isConfigured) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
				<p className="max-w-md text-muted-foreground">
					Authentication is not configured. Add{" "}
					<code className="rounded bg-muted px-1 py-0.5 text-foreground">
						VITE_SUPABASE_URL
					</code>{" "}
					and{" "}
					<code className="rounded bg-muted px-1 py-0.5 text-foreground">
						VITE_SUPABASE_ANON_KEY
					</code>{" "}
					to your environment.
				</p>
			</div>
		)
	}

	if (isLoading) {
		return (
			<div
				className="flex min-h-[60vh] flex-col items-center justify-center gap-3"
				aria-busy="true"
				aria-live="polite"
			>
				<Loader2 className="size-8 animate-spin text-primary" aria-hidden />
				<span className="text-sm text-muted-foreground">Loading session…</span>
			</div>
		)
	}

	if (!user) {
		return (
			<Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />
		)
	}

	return (
		<>
			<ResumeUploadBanner />
			{children}
		</>
	)
}
