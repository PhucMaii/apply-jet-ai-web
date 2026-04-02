import { useReducedMotion } from "framer-motion"
import { useLocation } from "react-router-dom"
import { MouseSpotlight } from "@/components/effects/mouse-spotlight"
import { AppRoutes } from "@/routes"
import { ROUTES } from "@/lib/constants"

export function AppShell() {
	const { pathname } = useLocation()
	const reduceMotion = useReducedMotion()
	const isLanding = pathname === ROUTES.home
	return (
		<>
			{reduceMotion || !isLanding ? null : <MouseSpotlight />}
			<AppRoutes />
		</>
	)
}
