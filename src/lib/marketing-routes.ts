import { ROUTES } from "@/lib/constants"

export const MARKETING_ROUTE_PATHS = [
	ROUTES.home,
	ROUTES.adsLanding,
	ROUTES.login,
	ROUTES.signup,
	ROUTES.support,
	ROUTES.blog,
] as const

export function isMarketingRoute(pathname: string): boolean {
	if ((MARKETING_ROUTE_PATHS as readonly string[]).includes(pathname)) {
		return true
	}
	return pathname.startsWith(`${ROUTES.blog}/`)
}

/** Home vs paid-ad landing — hash links stay on the current marketing page. */
export function getMarketingBasePath(pathname: string): string {
	if (pathname === ROUTES.adsLanding) return ROUTES.adsLanding
	return ROUTES.home
}
