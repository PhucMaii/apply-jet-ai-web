import { ROUTES } from "@/lib/constants"

export const MARKETING_ROUTE_PATHS = [
	ROUTES.home,
	ROUTES.login,
	ROUTES.signup,
	ROUTES.support,
] as const

export function isMarketingRoute(pathname: string): boolean {
	return (MARKETING_ROUTE_PATHS as readonly string[]).includes(pathname)
}
