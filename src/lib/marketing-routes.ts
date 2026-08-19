import { ROUTES } from "@/lib/constants"

export const MARKETING_ROUTE_PATHS = [
	ROUTES.home,
	ROUTES.adsLanding,
	ROUTES.login,
	ROUTES.signup,
	ROUTES.support,
] as const

export function isMarketingRoute(pathname: string): boolean {
	return (MARKETING_ROUTE_PATHS as readonly string[]).includes(pathname)
}

/** Home vs paid-ad landing — hash links stay on the current marketing page. */
export function getMarketingBasePath(pathname: string): string {
	if (pathname === ROUTES.adsLanding) return ROUTES.adsLanding
	return ROUTES.home
}
