import { Loader2 } from "lucide-react"
import { Navigate, Route, Routes } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { useAuth } from "@/context/auth-context"
import { ROUTES } from "@/lib/constants"
import { HomePage } from "@/pages/home-page"
import { AdsLandingPage } from "@/pages/ads-landing-page"
import { LoginPage } from "@/pages/login-page"
import { SignupPage } from "@/pages/signup-page"
import { ApplicationsPage } from "@/pages/applications-page"
import { ApplicationCreatePage } from "@/pages/application-create-page"
import { ApplicationDetailPage } from "@/pages/application-detail-page"
import { JobsPage } from "@/pages/jobs-page"
import { ProfilePage } from "@/pages/profile-page"
import { PrivacyPage } from "@/pages/privacy-page"
import { TermsPage } from "@/pages/terms-page"
import { SupportPage } from "@/pages/support-page"
import { BlogPage } from "@/pages/blog-page"
import { BlogCategoryPage } from "@/pages/blog-category-page"
import { BlogPostPage } from "@/pages/blog-post-page"
import { AuthCallbackPage } from "@/pages/auth-callback-page"

function JobsRoute() {
	const { user, isLoading } = useAuth()

	if (isLoading) {
		return (
			<div
				className="app-theme flex min-h-dvh flex-col items-center justify-center gap-3 bg-canvas"
				aria-busy="true"
				aria-live="polite"
			>
				<Loader2 className="size-8 animate-spin text-brand" aria-hidden />
				<span className="text-sm text-ink-muted">Loading session…</span>
			</div>
		)
	}

	if (!user) {
		return <JobsPage />
	}

	return (
		<AppLayout>
			<JobsPage />
		</AppLayout>
	)
}

export function AppRoutes() {
	return (
		<Routes>
			<Route path={ROUTES.home} element={<HomePage />} />
			<Route path={ROUTES.adsLanding} element={<AdsLandingPage />} />
			<Route path={ROUTES.login} element={<LoginPage />} />
			<Route path={ROUTES.signup} element={<SignupPage />} />
			<Route path={ROUTES.authCallback} element={<AuthCallbackPage />} />
			<Route path={ROUTES.privacy} element={<PrivacyPage />} />
			<Route path={ROUTES.terms} element={<TermsPage />} />
			<Route path={ROUTES.support} element={<SupportPage />} />
			<Route path={ROUTES.blog} element={<BlogPage />} />
			<Route path={ROUTES.blogCategory} element={<BlogCategoryPage />} />
			<Route path={ROUTES.blogPost} element={<BlogPostPage />} />
			<Route
				path={ROUTES.applications}
				element={
					<ProtectedRoute>
						<AppLayout>
							<ApplicationsPage />
						</AppLayout>
					</ProtectedRoute>
				}
			/>
			<Route
				path={ROUTES.applicationCreate}
				element={
					<ProtectedRoute>
						<AppLayout>
							<ApplicationCreatePage />
						</AppLayout>
					</ProtectedRoute>
				}
			/>
			<Route
				path={ROUTES.applicationDetail}
				element={
					<ProtectedRoute>
						<AppLayout variant="workspace">
							<ApplicationDetailPage />
						</AppLayout>
					</ProtectedRoute>
				}
			/>
			<Route path={ROUTES.jobs} element={<JobsRoute />} />
			<Route
				path={ROUTES.profile}
				element={
					<ProtectedRoute>
						<AppLayout>
							<ProfilePage />
						</AppLayout>
					</ProtectedRoute>
				}
			/>
			<Route
				path="/dashboard"
				element={<Navigate to={ROUTES.applications} replace />}
			/>
		</Routes>
	)
}
