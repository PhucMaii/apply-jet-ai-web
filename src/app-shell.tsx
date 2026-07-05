import { OAuthReturnHandler } from "@/components/auth/oauth-return-handler"
import { AppRoutes } from "@/routes"

export function AppShell() {
	return (
		<>
			<OAuthReturnHandler />
			{/* Landing uses a light editorial layout — no cursor spotlight */}
			<AppRoutes />
		</>
	)
}
