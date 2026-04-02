import { Navigate, Route, Routes } from "react-router-dom"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { ROUTES } from "@/lib/constants"
import { HomePage } from "@/pages/home-page"
import { LoginPage } from "@/pages/login-page"
import { SignupPage } from "@/pages/signup-page"
import { ApplicationsPage } from "@/pages/applications-page"
import { ProfilePage } from "@/pages/profile-page"
import { PrivacyPage } from "@/pages/privacy-page"
import { TermsPage } from "@/pages/terms-page"
import { SupportPage } from "@/pages/support-page"

export function AppRoutes() {
	return (
		<Routes>
			<Route path={ROUTES.home} element={<HomePage />} />
			<Route path={ROUTES.login} element={<LoginPage />} />
			<Route path={ROUTES.signup} element={<SignupPage />} />
			<Route path={ROUTES.privacy} element={<PrivacyPage />} />
			<Route path={ROUTES.terms} element={<TermsPage />} />
			<Route path={ROUTES.support} element={<SupportPage />} />
			<Route
				path={ROUTES.applications}
				element={
					<ProtectedRoute>
						<ApplicationsPage />
					</ProtectedRoute>
				}
			/>
			<Route
				path={ROUTES.profile}
				element={
					<ProtectedRoute>
						<ProfilePage />
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
