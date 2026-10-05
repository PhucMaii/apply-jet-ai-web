import type { LucideIcon } from "lucide-react"
import {
	BriefcaseBusiness,
	CreditCard,
	LayoutList,
	UserRound,
} from "lucide-react"
import { ROUTES } from "@/lib/constants"

export const PROFILE_TAB = {
	profile: "profile",
	usage: "usage",
	billing: "billing",
} as const

export type ProfileTab = (typeof PROFILE_TAB)[keyof typeof PROFILE_TAB]

export const PROFILE_TAB_PARAM = "tab" as const

export function profileTabPath(tab: ProfileTab): string {
	return tab === PROFILE_TAB.profile
		? ROUTES.profile
		: `${ROUTES.profile}?${PROFILE_TAB_PARAM}=${tab}`
}

export interface AppNavItem {
	key: string
	label: string
	shortLabel: string
	href: string
	icon: LucideIcon
	isActive: (location: { pathname: string; search: string }) => boolean
}

function readProfileTab(search: string): string | null {
	return new URLSearchParams(search).get(PROFILE_TAB_PARAM)
}

export const APP_NAV_ITEMS: readonly AppNavItem[] = [
	{
		key: "applications",
		label: "Applications",
		shortLabel: "Apps",
		href: ROUTES.applications,
		icon: LayoutList,
		isActive: ({ pathname }) =>
			pathname === ROUTES.applications ||
			pathname.startsWith(`${ROUTES.applications}/`),
	},
	{
		key: "jobs",
		label: "Find jobs",
		shortLabel: "Jobs",
		href: ROUTES.jobs,
		icon: BriefcaseBusiness,
		isActive: ({ pathname }) => pathname === ROUTES.jobs,
	},
	{
		key: "profile",
		label: "Profile & resume",
		shortLabel: "Profile",
		href: ROUTES.profile,
		icon: UserRound,
		isActive: ({ pathname, search }) =>
			pathname === ROUTES.profile &&
			readProfileTab(search) !== PROFILE_TAB.billing,
	},
	{
		key: "billing",
		label: "Plan & billing",
		shortLabel: "Billing",
		href: profileTabPath(PROFILE_TAB.billing),
		icon: CreditCard,
		isActive: ({ pathname, search }) =>
			pathname === ROUTES.profile &&
			readProfileTab(search) === PROFILE_TAB.billing,
	},
]

/** Shared max-width + gutters for signed-in pages. */
export const APP_PAGE_CONTAINER =
	"mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10" as const

export const APP_SHELL_COPY = {
	newApplication: "New application",
	newShort: "New",
	skipToContent: "Skip to content",
	accountMenu: "Account menu",
	signedInAs: "Signed in as",
	logOut: "Log out",
	home: "ApplyJet home",
	primaryNav: "Primary",
} as const
